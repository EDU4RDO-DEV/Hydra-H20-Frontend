import { useEffect, useState } from "react"
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

interface UserPermissionsProps {
  user: any
  open: boolean
  onClose: () => void
}

export default function UserPermissions({ user, open, onClose }: UserPermissionsProps) {
  const [permissions, setPermissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!open) return
    const fetchPermissions = async () => {
      try {
        setLoading(true)
        const data = await permissionService.getUserPermissions(user.id) // API real
        console.log("los registros son: ", data)

        setPermissions(data)
      } catch (error) {
        console.error("Error fetching permissions:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchPermissions()
  }, [user.id, open])

  const handleCheckboxChange = (groupIndex: number, moduleIndex: number, field: string) => {
    setPermissions((prev) => {
      const updated = [...prev]
      updated[groupIndex] = {
        ...updated[groupIndex],
        modules: updated[groupIndex].modules.map((mod: any, idx: number) =>
          idx === moduleIndex ? { ...mod, [field]: !mod[field] } : mod
        ),
      }
      return updated
    })
  }

  const handleSave = async () => {
    try {
      const payload = permissions.flatMap((group) =>
        group.modules.map((mod: any) => ({
          userId: user.id,
          moduleId: mod.moduleId ?? 0,
          viewModule: mod.viewModule,
          list: mod.list,
          create: mod.create,
          edit: mod.edit,
          delete: mod.delete,
          print: mod.print,
          export: mod.export,
          modificationUserId: JSON.parse(localStorage.getItem("user") || "{}").id,
          modificationDate: new Date().toISOString(),
        }))
      )
      console.log("los permisos a guardar son: ", payload)


      await permissionService.updateUserPermissions(payload)
      onClose()
    } catch (error) {
      console.error("Error saving permissions:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] max-h-[80vh] overflow-auto">
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
                  group.modules.map((mod: any, moduleIndex: number) => (
                    <TableRow key={`${group.group}-${mod.moduleName}`}>
                      <TableCell>{group.group}</TableCell>
                      <TableCell>{mod.moduleName}</TableCell>
                      {["viewModule", "list", "create", "edit", "delete", "print", "export"].map(
                        (perm) => (
                          <TableCell key={perm} className="text-center">
                            <input
                              type="checkbox"
                              checked={!!mod[perm]}
                              onChange={() =>
                                handleCheckboxChange(groupIndex, moduleIndex, perm)
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
  )
}
