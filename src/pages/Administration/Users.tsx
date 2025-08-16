import { useState, useEffect, useCallback, useMemo } from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  FilterFn,
} from "@tanstack/react-table"
import { Plus, MoreHorizontal, Edit, Trash2 } from "lucide-react"


import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog"
import { Switch } from "../../components/ui/switch"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import { Label } from "../../components/ui/label"
import { useToast } from "../../context/ToastContext"

import { CreateUserDto, User, UserFormValues } from "../../types/user"
import userService from "../../services/userService"
import authService from "../../services/authService"
import { ModuleManager } from "../../const/modules"
import permissionService from "../../services/permissionService"

const register = async (userData: CreateUserDto) => {
  try {
    const response = await authService.register(userData);
    console.log('User registered:', response);
    return response;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
}
// const myModule = ModuleManager.getModuleByName("Gestión de Usuarios");
const myModule = ModuleManager.getModuleByName("Ventas");

const checkPermission = async (permissionType: string) => {
  try {
    const userId = JSON.parse(localStorage.getItem('user') || '{}').id
    const response = await permissionService.checkPermission(userId, myModule!.moduleName, myModule!.group, permissionType);
    return response;
  } catch (error) {
    console.error('Error checking permission:', error);
    throw error;
  }
}



export default function UserManagement() {
  const toast = useToast();
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [formValues, setFormValues] = useState<UserFormValues>({
    EntityId: 1,
    Role: "User",
    Email: "",
    Name: "",
    Password: "", // Nuevo campo
  });
  const [formErrors, setFormErrors] = useState({
    Role: "",
    Email: "",
    Name: "",
    Password: "",
  });
  const [updatePassword, setUpdatePassword] = useState(false);
  const [showCanceled, setShowCanceled] = useState(false);
  const [permissions, setPermissions] = useState({
    list: false,
    create: false,
    edit: false,
    delete: false
  });

  // Función memoizada para manejar el cambio del switch
  const handleSwitchChange = useCallback((value: boolean) => {
    setShowCanceled(value);
  }, []);
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("");
  // Eliminados filtros de rol y email


  const columns: ColumnDef<User>[] = [
    // {
    //   accessorKey: "EntityId",
    //   header: "Entidad",
    //   cell: ({ row }) => {
    //     const entity = entityOptions.find(e => e.id === row.getValue("EntityId"))
    //     return entity ? entity.name : "Desconocida"
    //   },
    // },
    {
      accessorKey: "role",
      header: "Rol",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "name",
      header: "Nombre",
    },
    {
      accessorKey: "registrationDate",
      header: "Fecha Registro",
      // cell: ({ row }) => format(new Date(row.getValue("RegistrationDate")), "PPP", { locale: es }),
      cell: ({ row }) => {
        const date = row.getValue("registrationDate");
        return typeof date === 'string' ? date.substring(0, 10) : '';
      },


    },
    {
      accessorKey: "canceled",
      header: "Estado",
      cell: ({ row }) => row.getValue("canceled") ? "Anulado" : "Activo",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {permissions.edit && (
                <DropdownMenuItem
                  onClick={() => handleEdit(user)}
                  disabled={user.canceled}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
              )}
              {permissions.delete && (
                <DropdownMenuItem
                  onClick={() => {
                    setCurrentUser(user)
                    setIsDeleteDialogOpen(true)
                  }}
                  disabled={user.canceled}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Anular
                </DropdownMenuItem>
              )}
              {/* Opción para reactivar */}
              {user.canceled && (
                <DropdownMenuItem
                  onClick={async () => {
                    try {
                      await userService.reactivateUser(user.id, JSON.parse(localStorage.getItem('user') || '{}').id);
                      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Usuario reactivado correctamente' });
                      fetchUsers();
                    } catch {
                      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudo reactivar el usuario' });
                    }
                  }}
                >
                  <span className="mr-2 pi pi-refresh" />
                  Reactivar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  // Filtro global único: busca en nombre, email y rol
  const filteredUsers = useMemo(() => {
    let filtered = users;
    if (globalFilter) {
      const search = globalFilter.toLowerCase();
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        user.role.toLowerCase().includes(search)
      );
    }
    filtered = showCanceled
      ? filtered.filter(user => user.canceled)
      : filtered.filter(user => !user.canceled);
    return filtered;
  }, [users, showCanceled, globalFilter]);

  const table = useReactTable({
    data: filteredUsers,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    globalFilterFn: (row, columnId, filterValue) => {
      const value = String(row.getValue(columnId)).toLowerCase();
      return value.includes(String(filterValue).toLowerCase());
    },
    initialState: {
      pagination: {
        pageSize: 10, // Mostrar 10 registros por página
      },
    },
  })

  // useEffect(() => {
  //   fetchUsers()
  // }, [])

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      // Ya verificamos el permiso al cargar la página
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  }, []);
  // Función para cargar los permisos del usuario
  const loadPermissions = useCallback(async () => {
    try {
      const listPermission = await checkPermission("list");
      const createPermission = await checkPermission("create");
      const editPermission = await checkPermission("edit");
      const deletePermission = await checkPermission("delete");

      setPermissions({
        list: listPermission,
        create: createPermission,
        edit: editPermission,
        delete: deletePermission
      });
      console.log("Permisos:", permissions);

      // Si tiene permiso para listar, cargamos los usuarios
      if (listPermission) {
        fetchUsers();
      }
    } catch (error) {
      console.error("Error al cargar permisos:", error);
    }
  }, [fetchUsers]);

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  const resetForm = useCallback(() => {
    setFormValues({
      EntityId: 1,
      Role: "Vendedor",
      Email: "",
      Name: "",
      Password: ""
    })
    setFormErrors({
      Role: "",
      Email: "",
      Name: "",
      Password: "",
    })
    setCurrentUser(null)
    setUpdatePassword(false)
  }, [])

  const handleCreate = () => {
    // Ya verificamos el permiso al cargar la página y controlamos la visibilidad del botón
    resetForm()
    setIsDialogOpen(true)
  }

  const handleEdit = useCallback((user: User) => {
    // Ya verificamos el permiso al cargar la página y controlamos la visibilidad del botón

    // Limpiamos los errores y el estado de la contraseña
    setFormErrors({
      Role: "",
      Email: "",
      Name: "",
      Password: "",
    });
    setUpdatePassword(false);

    // Establecemos los datos del usuario a editar
    setCurrentUser(user);
    setFormValues({
      EntityId: user.entityId,
      Role: user.role,
      Email: user.email,
      Name: user.name,
      Password: "",
    });

    // Abrimos el diálogo
    setIsDialogOpen(true);
  }, [])

  const validateForm = useCallback(() => {
    let isValid = true;
    const errors = {
      Role: "",
      Email: "",
      Name: "",
      Password: "",
    };

    // Validar rol
    if (!formValues.Role) {
      errors.Role = "Debe seleccionar un rol";
      isValid = false;
    }

    // Validar email
    if (!formValues.Email) {
      errors.Email = "El email es obligatorio";
      isValid = false;
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formValues.Email)) {
      errors.Email = "El formato del email no es válido";
      isValid = false;
    }

    // Validar nombre
    if (!formValues.Name) {
      errors.Name = "El nombre es obligatorio";
      isValid = false;
    }

    // Validar contraseña (solo para creación o si se seleccionó actualizar contraseña)
    if (!currentUser && !formValues.Password) {
      // Para nuevos usuarios, la contraseña es obligatoria
      errors.Password = "La contraseña es obligatoria";
      isValid = false;
    } else if (currentUser && updatePassword && !formValues.Password) {
      // Si se seleccionó actualizar contraseña, debe proporcionar una
      errors.Password = "La contraseña es obligatoria";
      isValid = false;
    } else if (formValues.Password && formValues.Password.length < 6) {
      // Validar longitud mínima
      errors.Password = "La contraseña debe tener al menos 6 caracteres";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  }, [formValues, currentUser, updatePassword]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      return; // Detener si hay errores de validación
    }

    try {
      if (currentUser) {
        // Ya verificamos el permiso al cargar la página
        if (!permissions.edit) {
          toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No tienes permiso para editar usuarios' });
          return;
        }

        // Primero actualizar los datos generales del usuario
        const editData = {
          id: currentUser.id,
          name: formValues.Name,
          role: formValues.Role,
          email: formValues.Email,
          canceled: currentUser.canceled,
          modifiedByUserId: JSON.parse(localStorage.getItem('user') || '{}').id
        };

        await userService.updateUser(currentUser.id, editData);

        // Si se seleccionó actualizar contraseña y se proporcionó una contraseña
        if (updatePassword && formValues.Password) {
          // Actualizar la contraseña usando el método específico
          await userService.updatePassword(
            currentUser.id,
            formValues.Password,
            JSON.parse(localStorage.getItem('user') || '{}').id
          );

          toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Usuario y contraseña actualizados correctamente' });
        } else {
          toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Usuario actualizado correctamente' });
        }
      } else {
        // Ya verificamos el permiso al cargar la página
        if (!permissions.create) {
          toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No tienes permiso para crear usuarios' });
          return;
        }

        // Lógica para crear
        const createData = {
          username: formValues.Username || formValues.Name || formValues.Email.split('@')[0],
          password: formValues.Password || "",
          email: formValues.Email,
          rol: formValues.Role,
        };

        await register(createData); // Usamos la función register que ya tenías
  toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Usuario creado correctamente' });
      }
      setIsDialogOpen(false);
      fetchUsers();
    } catch (error) {
  toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Ocurrió un error al guardar el usuario' });
      console.error("Error al guardar usuario:", error);
    }
  }, [currentUser, formValues, updatePassword, validateForm, fetchUsers, permissions]);

  const handleCancelUser = useCallback(async () => {
    if (!currentUser) return

    try {
      // Ya verificamos el permiso al cargar la página
      if (!permissions.delete) {
        toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No tienes permiso para anular usuarios' });
        return;
      }

      await userService.cancelUser(currentUser.id, JSON.parse(localStorage.getItem('user') || '{}').id)

  toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Usuario anulado correctamente' });
      setIsDeleteDialogOpen(false)
      fetchUsers()
    } catch (error) {
  toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudo anular el usuario' });
    }
  }, [currentUser, permissions.delete, fetchUsers])

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center space-x-4">
          <Input
            placeholder="Buscar..."
            value={globalFilter ?? ""}
            disabled={!permissions.list}
            onChange={(event) => {
              setGlobalFilter(event.target.value);
            }}
            className="max-w-sm"
          />
          <div className="flex items-center space-x-2">
            <Switch
              id="show-canceled"
              checked={showCanceled}
              onCheckedChange={handleSwitchChange}
              disabled={!permissions.list}
            />
            <Label htmlFor="show-canceled" className="text-sm font-medium">
              {showCanceled ? "Anulados" : "Activos"}
            </Label>
          </div>
        </div>
        {permissions.create && (
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Usuario
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                      className={header.column.getCanSort() ? 'cursor-pointer select-none' : ''}
                    >
                      {header.isPlaceholder
                        ? null
                        : (
                          <span className="flex items-center">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {header.column.getCanSort() && (
                              <span className="ml-1">
                                {header.column.getIsSorted() === 'asc' && '▲'}
                                {header.column.getIsSorted() === 'desc' && '▼'}
                                {header.column.getIsSorted() === false && <span className="opacity-30">↕</span>}
                              </span>
                            )}
                          </span>
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {permissions.list && table.getRowModel().rows?.length ? (

              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={row.original.canceled ? "opacity-50" : ""}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {(() => {
                    if (!permissions.list) {
                      return "No tienes permiso para ver usuarios";
                    }
                    if (loading) {
                      return "Cargando...";
                    }
                    return "No se encontraron usuarios";
                  })()}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Mostrando {table.getFilteredRowModel().rows.length} de {users.length} registros
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <div className="text-sm font-medium">
            Página {table.getState().pagination.pageIndex + 1} de{" "}
            {table.getPageCount()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </Button>
        </div>
      </div>

      {/* Modal para crear/editar usuario */}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentUser ? "Editar Usuario" : "Crear Nuevo Usuario"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/*<di v className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="entity" className="text-right">
                Entidad
              </Label>
              <Select
                value={formValues.EntityId.toString()}
                onValueChange={(value) =>
                  setFormValues({ ...formValues, EntityId: parseInt(value) })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccione una entidad" />
                </SelectTrigger>
                <SelectContent>
                  {entityOptions.map((entity) => (
                    <SelectItem key={entity.id} value={entity.id.toString()}>
                      {entity.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div> */}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Rol
              </Label>
              <div className="col-span-3 space-y-1">
                <Select
                  value={formValues.Role}
                  onValueChange={(value) =>
                    setFormValues({ ...formValues, Role: value })
                  }
                >
                  <SelectTrigger className={formErrors.Role ? "border-red-500" : ""}>
                    <SelectValue placeholder="Seleccione un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Administrador">Administrador</SelectItem>
                    <SelectItem value="Gerente de Ventas">Gerente de Ventas</SelectItem>
                    <SelectItem value="Vendedor">Vendedor</SelectItem>
                    <SelectItem value="Operador de Maquinaria">Operador de Maquinaria</SelectItem>
                    <SelectItem value="Operador de Llenado">Operador de Llenado</SelectItem>
                    <SelectItem value="Bodeguero">Bodeguero</SelectItem>
                    <SelectItem value="Repartidor">Repartidor</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.Role && (
                  <p className="text-sm text-red-500">{formErrors.Role}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <div className="col-span-3 space-y-1">
                <Input
                  id="email"
                  type="email"
                  value={formValues.Email}
                  onChange={(e) =>
                    setFormValues({ ...formValues, Email: e.target.value })
                  }
                  className={formErrors.Email ? "border-red-500" : ""}
                />
                {formErrors.Email && (
                  <p className="text-sm text-red-500">{formErrors.Email}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nombre
              </Label>
              <div className="col-span-3 space-y-1">
                <Input
                  id="name"
                  value={formValues.Name}
                  onChange={(e) =>
                    setFormValues({ ...formValues, Name: e.target.value })
                  }
                  className={formErrors.Name ? "border-red-500" : ""}
                />
                {formErrors.Name && (
                  <p className="text-sm text-red-500">{formErrors.Name}</p>
                )}
              </div>
            </div>

            {currentUser ? (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="text-right">
                    <input
                      type="checkbox"
                      id="updatePasswordCheckbox"
                      checked={updatePassword}
                      onChange={(e) => setUpdatePassword(e.target.checked)}
                      className="mr-2"
                    />
                    <Label htmlFor="updatePasswordCheckbox" className="cursor-pointer">
                      Actualizar Contraseña
                    </Label>
                  </div>
                  <div className="col-span-3 space-y-1">
                    <Input
                      id="password"
                      type="password"
                      value={formValues.Password}
                      onChange={(e) =>
                        setFormValues({ ...formValues, Password: e.target.value })
                      }
                      className={formErrors.Password ? "border-red-500" : ""}
                      disabled={!updatePassword}
                      placeholder="Ingrese la nueva contraseña"
                    />
                    {formErrors.Password && (
                      <p className="text-sm text-red-500">{formErrors.Password}</p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  Contraseña
                </Label>
                <div className="col-span-3 space-y-1">
                  <Input
                    id="password"
                    type="password"
                    value={formValues.Password}
                    onChange={(e) =>
                      setFormValues({ ...formValues, Password: e.target.value })
                    }
                    className={formErrors.Password ? "border-red-500" : ""}
                  />
                  {formErrors.Password && (
                    <p className="text-sm text-red-500">{formErrors.Password}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleSubmit}>
              {currentUser ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmación para anular usuario */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de anular este usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              El usuario será marcado como anulado y no podrá acceder al sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelUser}>Anular</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}