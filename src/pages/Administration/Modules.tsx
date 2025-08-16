import { useState, useEffect, useCallback, useMemo } from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    SortingState,
    ColumnFiltersState,
} from "@tanstack/react-table";
import { Plus, MoreHorizontal, Edit, Trash2, RefreshCw } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "../../components/ui/dialog";
import { Switch } from "../../components/ui/switch";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { Label } from "../../components/ui/label";
import { toast } from "sonner";
import moduleService from "../../services/moduleService";
import { ModuleDto, CreateModuleDto, UpdateModuleDto } from "../../types/module";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";

export default function ModuleManagement() {
    const [modules, setModules] = useState<ModuleDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [currentModule, setCurrentModule] = useState<ModuleDto | null>(null);
    const [formValues, setFormValues] = useState<CreateModuleDto>({
        name: "",
        group: "",
        registrationUserId: 1,
    });
    const [formErrors, setFormErrors] = useState({
        name: "",
        group: "",
    });
    const [showCanceled, setShowCanceled] = useState(false);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [groupFilter, setGroupFilter] = useState("__all__");

    // Obtener grupos únicos para el filtro
    const groupOptions = useMemo(() => {
        const groups = modules.map(m => m.group);
        return Array.from(new Set(groups));
    }, [modules]);

    // Filtros combinados: búsqueda por nombre siempre se aplica primero
    const filteredModules = useMemo(() => {
        let filtered = modules;
        if (globalFilter) {
            filtered = filtered.filter(mod =>
                mod.name.toLowerCase().includes(globalFilter.toLowerCase())
            );
        }
        filtered = showCanceled
            ? filtered.filter(mod => mod.canceled)
            : filtered.filter(mod => !mod.canceled);
        if (groupFilter !== "__all__") {
            filtered = filtered.filter(mod => mod.group === groupFilter);
        }
        return filtered;
    }, [modules, showCanceled, groupFilter, globalFilter]);

    const columns: ColumnDef<ModuleDto>[] = [
        {
            accessorKey: "group",
            header: "Grupo",
        },
        {
            accessorKey: "name",
            header: "Nombre",
        },
        {
            accessorKey: "registrationDate",
            header: "Fecha Registro",
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
                const mod = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() => handleEdit(mod)}
                                disabled={mod.canceled}
                            >
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => {
                                    setCurrentModule(mod);
                                    setIsDeleteDialogOpen(true);
                                }}
                                disabled={mod.canceled}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Anular
                            </DropdownMenuItem>
                            {mod.canceled && (
                                <DropdownMenuItem
                                    onClick={async () => {
                                        try {
                                            await moduleService.restoreModule(mod.id, 1);
                                            toast("Éxito", { description: "Módulo restaurado correctamente" });
                                            fetchModules();
                                        } catch {
                                            toast("Error", { description: "No se pudo restaurar el módulo" });
                                        }
                                    }}
                                >
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Restaurar
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    const fetchModules = useCallback(async () => {
        try {
            setLoading(true);
            const data = await moduleService.getActiveModules();
            const annulled = await moduleService.getAnnulledModules();
            setModules([...data, ...annulled]);
        } catch (err) {
            console.error("Error fetching modules:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchModules();
    }, [fetchModules]);

    const resetForm = useCallback(() => {
        setFormValues({
            name: "",
            group: "",
            registrationUserId: 1,
        });
        setFormErrors({
            name: "",
            group: "",
        });
        setCurrentModule(null);
    }, []);

    const handleCreate = () => {
        resetForm();
        setIsDialogOpen(true);
    };

    const handleEdit = useCallback((mod: ModuleDto) => {
        setFormErrors({ name: "", group: "" });
        setCurrentModule(mod);
        setFormValues({
            name: mod.name,
            group: mod.group,
            registrationUserId: 1,
        });
        setIsDialogOpen(true);
    }, []);

    const validateForm = useCallback(() => {
        let isValid = true;
        const errors = { name: "", group: "" };
        if (!formValues.name) {
            errors.name = "El nombre es obligatorio";
            isValid = false;
        }
        if (!formValues.group) {
            errors.group = "El grupo es obligatorio";
            isValid = false;
        }
        setFormErrors(errors);
        return isValid;
    }, [formValues]);

    const handleSubmit = useCallback(async () => {
        if (!validateForm()) return;
        try {
            if (currentModule) {
                // Editar
                await moduleService.updateModule({
                    id: currentModule.id,
                    name: formValues.name,
                    group: formValues.group,
                    modifyUserId: 1,
                });
                toast("Éxito", { description: "Módulo actualizado correctamente" });
            } else {
                // Crear
                await moduleService.createModule({
                    name: formValues.name,
                    group: formValues.group,
                    registrationUserId: 1,
                });
                toast("Éxito", { description: "Módulo creado correctamente" });
            }
            setIsDialogOpen(false);
            fetchModules();
        } catch (error) {
            toast("Error", { description: "Ocurrió un error al guardar el módulo" });
            console.error("Error al guardar módulo:", error);
        }
    }, [currentModule, formValues, validateForm, fetchModules]);

    const handleAnnulModule = useCallback(async () => {
        if (!currentModule) return;
        try {
            await moduleService.annulModule(currentModule.id, 1);
            toast("Éxito", { description: "Módulo anulado correctamente" });
            setIsDeleteDialogOpen(false);
            fetchModules();
        } catch (error) {
            toast("Error", { description: "No se pudo anular el módulo" });
        }
    }, [currentModule, fetchModules]);

    const table = useReactTable({
        data: filteredModules,
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
                pageSize: 10,
            },
        },
    });

    return (
        <div className="w-full">
            <div className="flex items-center justify-between py-4">
                <div className="flex items-center space-x-4">
                    <Input
                        placeholder="Buscar por nombre..."
                        value={globalFilter ?? ""}
                        onChange={(event) => {
                            const value = event.target.value;
                            setGlobalFilter(value);
                        }}
                        className="max-w-sm"
                    />
                    <Select value={groupFilter} onValueChange={setGroupFilter}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Filtrar por grupo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="__all__">Todos los grupos</SelectItem>
                            {groupOptions.map((group) => (
                                <SelectItem key={group} value={group}>{group}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="show-canceled"
                            checked={showCanceled}
                            onCheckedChange={setShowCanceled}
                        />
                        <Label htmlFor="show-canceled" className="text-sm font-medium">
                            {showCanceled ? "Anulados" : "Activos"}
                        </Label>
                    </div>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Módulo
                </Button>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
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
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    {loading ? "Cargando..." : "No se encontraron módulos"}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    Mostrando {table.getFilteredRowModel().rows.length} de {modules.length} registros
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
                        Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
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
            {/* Modal para crear/editar módulo */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {currentModule ? "Editar Módulo" : "Crear Nuevo Módulo"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="group" className="text-right">
                                Grupo
                            </Label>
                            <div className="col-span-3 space-y-1">
                                <Input
                                    id="group"
                                    value={formValues.group}
                                    onChange={(e) => setFormValues({ ...formValues, group: e.target.value })}
                                    className={formErrors.group ? "border-red-500" : ""}
                                />
                                {formErrors.group && (
                                    <p className="text-sm text-red-500">{formErrors.group}</p>
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
                                    value={formValues.name}
                                    onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                                    className={formErrors.name ? "border-red-500" : ""}
                                />
                                {formErrors.name && (
                                    <p className="text-sm text-red-500">{formErrors.name}</p>
                                )}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="button" onClick={handleSubmit}>
                            {currentModule ? "Actualizar" : "Crear"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* Modal de confirmación para anular módulo */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro de anular este módulo?</AlertDialogTitle>
                        <AlertDialogDescription>
                            El módulo será marcado como anulado y no podrá ser utilizado.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleAnnulModule}>Anular</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
