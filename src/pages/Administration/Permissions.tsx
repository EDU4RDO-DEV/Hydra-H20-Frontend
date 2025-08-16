import { useState, useEffect, useCallback, useMemo } from "react"
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog"
import userService from "../../services/userService"
import UserPermissions from "../../components/administration/UserPermissions"

import { User } from "../../types/user"

export default function Permissions() {
    const [users, setUsers] = useState<User[]>([])
    const [globalFilter, setGlobalFilter] = useState("")
    const [loading, setLoading] = useState(true)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false)

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true)
            const data = await userService.getAllUsers()
            // Filtrar solo activos
            setUsers(data.filter((u: User) => !u.canceled))
        } catch (err) {
            console.error("Error fetching users:", err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchUsers()
    }, [fetchUsers])

    const handleEditPermissions = (user: User) => {
        setSelectedUser(user)
        setIsPermissionsDialogOpen(true)
    }

    const columns: ColumnDef<User>[] = [
        { accessorKey: "role", header: "Rol" },
        { accessorKey: "email", header: "Email" },
        { accessorKey: "name", header: "Nombre" },
        {
            accessorKey: "registrationDate",
            header: "Fecha Registro",
            cell: ({ row }) => {
                const date = row.getValue("registrationDate")
                return typeof date === "string" ? date.substring(0, 10) : ""
            },
        },
        {
            id: "actions",
            header: "Acciones",
            cell: ({ row }) => {
                const user = row.original
                return (
                    <Button variant="outline" size="sm" onClick={() => handleEditPermissions(user)}>
                        Modificar Permisos
                    </Button>
                )
            },
        },
    ]

    const table = useReactTable({
        data: useMemo(() => {
            return users.filter(
                (u) =>
                    u.name.toLowerCase().includes(globalFilter.toLowerCase()) ||
                    u.email.toLowerCase().includes(globalFilter.toLowerCase())
            )
        }, [users, globalFilter]),
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <div className="w-full">
            <div className="flex items-center justify-between py-4">
                <Input
                    placeholder="Buscar usuarios..."
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="text-center">
                                    Cargando...
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="text-center">
                                    No se encontraron usuarios
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isPermissionsDialogOpen} onOpenChange={setIsPermissionsDialogOpen}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Gestión de Permisos</DialogTitle>
                    </DialogHeader>
                    {selectedUser && (
                        <UserPermissions
                            user={selectedUser}
                            open={isPermissionsDialogOpen}
                            onClose={() => setIsPermissionsDialogOpen(false)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
