import { useEffect, useState, useRef } from "react"
import { Toast } from 'primereact/toast';
import { GroupedPermission, modulePermission, Permission } from "../../types/permission"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Button } from "../../components/ui/button"
import permissionService from "../../services/permissionService"
import moduleService from "../../services/moduleService"

interface UserPermissionsProps {
  user: any;
  open: boolean;
  onClose: () => void;
}

export default function UserPermissions({ user, open, onClose }: UserPermissionsProps) {
  const toast = useRef<Toast>(null);
  const [permissions, setPermissions] = useState<GroupedPermission[]>([])
  const [loading, setLoading] = useState(true)
  const [changedPermissions, setChangedPermissions] = useState<Record<string, modulePermission>>({});

  // Nuevo: cargar módulos activos y agruparlos
  useEffect(() => {
    if (!open) return
    const fetchModulesAndPermissions = async () => {
      try {
        setLoading(true)
        // Obtener módulos activos
        const modules = await moduleService.getActiveModules();
        // Obtener permisos actuales del usuario
        const userPerms: GroupedPermission[] = await permissionService.getUserPermissions(user.id);
        // Mapear permisos por moduleId para acceso rápido
        const userPermsMap: Record<number, modulePermission> = {};
        userPerms.forEach(g => g.modules.forEach(m => { userPermsMap[m.moduleId] = m; }));
        // Agrupar módulos por grupo
        const grouped: GroupedPermission[] = [];
        modules.forEach(mod => {
          let group = grouped.find(g => g.group === mod.group);
          if (!group) {
            group = { group: mod.group, modules: [] };
            grouped.push(group);
          }
          // Si el usuario ya tiene permiso, usarlo, si no, crear uno vacío
          const perm = userPermsMap[mod.id] || {
            id: undefined,
            moduleId: mod.id,
            moduleName: mod.name,
            group: mod.group,
            viewModule: false,
            list: false,
            create: false,
            edit: false,
            delete: false,
            print: false,
            export: false,
          };
          group.modules.push(perm);
        });
        setPermissions(grouped);
        setChangedPermissions({});
      } catch (error) {
        console.error("Error al cargar módulos y permisos:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchModulesAndPermissions()
  }, [user.id, open])

  // Guardar el estado original para comparar
  const originalPermissionsRef = useState<GroupedPermission[]>([])[0];
  useEffect(() => {
    // Guardar copia profunda de los permisos originales al cargar
    if (!loading && permissions.length > 0) {
      originalPermissionsRef.length = 0;
      permissions.forEach(g => {
        originalPermissionsRef.push({
          group: g.group,
          modules: g.modules.map(m => ({ ...m }))
        });
      });
    }
    console.log("Permisos originales guardados:", originalPermissionsRef);
    console.log("Permisos actuales:", permissions);
  }, [loading, permissions, originalPermissionsRef]);

  const handleCheckboxChange = (groupIndex: number, moduleIndex: number, field: keyof modulePermission) => {
    setPermissions((prev) => {
      const updated = [...prev];
      updated[groupIndex] = {
        ...updated[groupIndex],
        modules: updated[groupIndex].modules.map((mod: modulePermission, idx: number) =>
          idx === moduleIndex ? { ...mod, [field]: !mod[field] } : mod
        ),
      };
      // Detectar cambios respecto al original usando moduleId como clave
      const mod = updated[groupIndex].modules[moduleIndex];
      const orig = originalPermissionsRef
        .flatMap(g => g.modules)
        .find(m => m.moduleId === mod.moduleId);
      if (orig && mod) {
        let changed = false;
        (['viewModule','list','create','edit','delete','print','export'] as (keyof modulePermission)[]).forEach(k => {
          if (mod[k] !== orig[k]) changed = true;
        });
        setChangedPermissions((prevChanged) => {
          const copy = { ...prevChanged };
          if (changed) {
            copy[mod.moduleId] = mod;
          } else {
            delete copy[mod.moduleId];
          }
          return copy;
        });
      }
      return updated;
    });
  };

  const handleSave = async () => {
    try {
      const modificationUserId = JSON.parse(localStorage.getItem("user") || "{}").id;
      const modificationDate = new Date().toISOString();
      const payload = Object.values(changedPermissions).map((mod) => ({
        id: mod.id,
        moduleId: mod.moduleId,
        viewModule: mod.viewModule,
        list: mod.list,
        create: mod.create,
        edit: mod.edit,
        delete: mod.delete,
        print: mod.print,
        export: mod.export,
        userId: user.id,
        modificationUserId,
        modificationDate,
      }));
      if (payload.length === 0) {
        toast.current?.show({ severity: 'info', summary: 'Sin cambios', detail: 'No hay cambios para guardar.' });
        onClose();
        return;
      }
      await permissionService.updateUserPermissions(payload);
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Permisos actualizados correctamente.' });
      onClose();
    } catch (error: any) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: error?.message || 'No se pudieron actualizar los permisos.' });
      console.error("Error saving permissions:", error);
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-[120vw] min-w-[1100px] max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Permisos de Usuario</DialogTitle>
            <p className="text-sm text-muted-foreground">
              {user.name} ({user.email})
            </p>
          </DialogHeader>

          {loading ? (
            <p>Cargando permisos...</p>
          ) : (
            <div className="overflow-x-auto overflow-y-auto max-h-[55vh]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Grupo</TableHead>
                    <TableHead>Módulo</TableHead>
                    <TableHead>Ver</TableHead>
                    <TableHead>Listar</TableHead>
                    <TableHead>Crear</TableHead>
                    <TableHead>Editar</TableHead>
                    <TableHead>Eliminar</TableHead>
                    <TableHead>Imprimir</TableHead>
                    <TableHead>Exportar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permissions.map((group, groupIndex) =>
                    group.modules.map((mod: modulePermission, moduleIndex: number) => (
                      <TableRow key={`${group.group}-${mod.moduleName}`}>
                        <TableCell>{group.group}</TableCell>
                        <TableCell>{mod.moduleName}</TableCell>
                        {["viewModule", "list", "create", "edit", "delete", "print", "export"].map(
                          (perm) => (
                            <TableCell key={perm} className="text-center">
                              <input
                                type="checkbox"
                                checked={!!mod[perm as keyof modulePermission]}
                                onChange={() =>
                                  handleCheckboxChange(groupIndex, moduleIndex, perm as keyof modulePermission)
                                }
                                className="w-4 h-4 cursor-pointer"
                              />
                            </TableCell>
                          )
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          <DialogFooter className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
