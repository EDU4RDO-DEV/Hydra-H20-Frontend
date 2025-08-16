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
import employeeService from "../../services/employeeService";
import { Employee, EmployeeSimpleDto } from "../../types/employee";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";

export default function EmployeeManagement() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
    const [formValues, setFormValues] = useState<EmployeeSimpleDto>({
        userId: 0,
        jobTitle: "",
        jobDescription: "",
        entryDate: "",
        exitDate: "",
        fullName: "",
        gender: "",
        birthDate: "",
        phone1: "",
        phone2: "",
        email: "",
        nit: "",
        dpi: "",
    });
    const [formErrors, setFormErrors] = useState({
        jobTitle: "",
        group: "",
        fullName: "",
        gender: "",
        birthDate: "",
        entryDate: "",
        phone1: "",
        email: "",
        nit: "",
        dpi: "",
    });
    const [showCanceled, setShowCanceled] = useState(false);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [jobFilter, setJobFilter] = useState("__all__");

    // Obtener títulos únicos para el filtro
    const jobOptions = useMemo(() => {
        const jobs = employees.map(e => e.jobTitle);
        return Array.from(new Set(jobs));
    }, [employees]);

    // Filtros combinados: búsqueda por nombre siempre se aplica primero
    const filteredEmployees = useMemo(() => {
        let filtered = employees;
        if (globalFilter) {
            filtered = filtered.filter(emp =>
                emp.fullName.toLowerCase().includes(globalFilter.toLowerCase())
            );
        }
        filtered = showCanceled
            ? filtered.filter(emp => emp.canceled)
            : filtered.filter(emp => !emp.canceled);
        if (jobFilter !== "__all__") {
            filtered = filtered.filter(emp => emp.jobTitle === jobFilter);
        }
        return filtered;
    }, [employees, showCanceled, jobFilter, globalFilter]);

    const columns: ColumnDef<Employee>[] = [
        {
            accessorKey: "jobTitle",
            header: "Puesto",
        },
        {
            accessorKey: "fullName",
            header: "Nombre Completo",
        },
        {
            accessorKey: "email",
            header: "Email",
        },
        {
            accessorKey: "phone1",
            header: "Teléfono",
        },
        {
            accessorKey: "entryDate",
            header: "Fecha Ingreso",
            cell: ({ row }) => {
                const date = row.getValue("entryDate");
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
                const emp = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() => handleEdit(emp)}
                                disabled={emp.canceled}
                            >
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => {
                                    setCurrentEmployee(emp);
                                    setIsDeleteDialogOpen(true);
                                }}
                                disabled={emp.canceled}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Anular
                            </DropdownMenuItem>
                            {emp.canceled && (
                                <DropdownMenuItem
                                    onClick={async () => {
                                        try {
                                            await employeeService.restoreEmployee(emp.id, 1);
                                            toast("Éxito", { description: "Empleado restaurado correctamente" });
                                            fetchEmployees();
                                        } catch {
                                            toast("Error", { description: "No se pudo restaurar el empleado" });
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

    const fetchEmployees = useCallback(async () => {
        try {
            setLoading(true);
            const data = await employeeService.getActiveEmployees();
            const annulled = await employeeService.getAnnulledEmployees();
            setEmployees([...data, ...annulled]);
        } catch (err) {
            console.error("Error fetching employees:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    const resetForm = useCallback(() => {
        setFormValues({
            userId: 0,
            jobTitle: "",
            jobDescription: "",
            entryDate: "",
            exitDate: "",
            fullName: "",
            gender: "",
            birthDate: "",
            phone1: "",
            phone2: "",
            email: "",
            nit: "",
            dpi: "",
        });
        setFormErrors({
            jobTitle: "",
            group: "",
            fullName: "",
            gender: "",
            birthDate: "",
            entryDate: "", // <-- Agrega esta línea
            phone1: "",
            email: "",
            nit: "",
            dpi: "",
        });
        setCurrentEmployee(null);
    }, []);

    const handleCreate = () => {
        resetForm();
        setIsDialogOpen(true);
    };

    const handleEdit = useCallback((emp: Employee) => {
        setFormErrors({
            jobTitle: "",
            group: "",
            fullName: "",
            gender: "",
            birthDate: "",
            entryDate: "", // <-- Agrega esta línea
            phone1: "",
            email: "",
            nit: "",
            dpi: "",
        });
        setCurrentEmployee(emp);
        setFormValues({
            userId: emp.userId,
            jobTitle: emp.jobTitle,
            jobDescription: emp.jobDescription,
            entryDate: emp.entryDate,
            exitDate: emp.exitDate ?? "",
            fullName: emp.fullName,
            gender: emp.gender,
            birthDate: emp.birthDate,
            phone1: emp.phone1,
            phone2: emp.phone2,
            email: emp.email,
            nit: emp.nit,
            dpi: emp.dpi,
        });
        setIsDialogOpen(true);
    }, []);

    const validateForm = useCallback(() => {
        let isValid = true;
        const errors = {
            jobTitle: "",
            group: "",
            fullName: "",
            gender: "",
            birthDate: "",
            entryDate: "", // <-- Agrega esta línea
            phone1: "",
            email: "",
            nit: "",
            dpi: "",
        };
        if (!formValues.jobTitle) {
            errors.jobTitle = "El puesto es obligatorio";
            isValid = false;
        }
        if (!formValues.fullName) {
            errors.fullName = "El nombre es obligatorio";
            isValid = false;
        }
        if (!formValues.gender) {
            errors.gender = "El género es obligatorio";
            isValid = false;
        }
        if (!formValues.birthDate) {
            errors.birthDate = "La fecha de nacimiento es obligatoria";
            isValid = false;
        }
        if (!formValues.phone1) {
            errors.phone1 = "El teléfono es obligatorio";
            isValid = false;
        }
        if (!formValues.email) {
            errors.email = "El email es obligatorio";
            isValid = false;
        }
        if (!formValues.nit) {
            errors.nit = "El NIT es obligatorio";
            isValid = false;
        }
        if (!formValues.dpi) {
            errors.dpi = "El DPI es obligatorio";
            isValid = false;
        }
        setFormErrors(errors);
        return isValid;
    }, [formValues]);

    const handleSubmit = useCallback(async () => {
        if (!validateForm()) return;
        // Obtener el userId del localStorage (ajusta la clave según tu app)
        const storedUser = localStorage.getItem("user");
        let userId = 0;
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                userId = parsed.id || parsed.userId || 0;
            } catch {
                userId = 0;
            }
        }
        // Normalizar fechas a formato ISO string (obligatorio para entryDate)
        const payload: EmployeeSimpleDto = {
            ...formValues,
            userId,
            birthDate: formValues.birthDate ? new Date(formValues.birthDate).toISOString() : "",
            entryDate: formValues.entryDate ? new Date(formValues.entryDate).toISOString() : "",
            exitDate: formValues.exitDate ? new Date(formValues.exitDate).toISOString() : "",
        };
        try {
            if (currentEmployee) {
                // Editar
                await employeeService.updateEmployeeSimple({
                    ...payload,
                    id: currentEmployee.id,
                });
                toast("Éxito", { description: "Empleado actualizado correctamente" });
            } else {
                // Crear
                await employeeService.createEmployeeSimple(payload);
                toast("Éxito", { description: "Empleado creado correctamente" });
            }
            setIsDialogOpen(false);
            fetchEmployees();
        } catch (error) {
            toast("Error", { description: "Ocurrió un error al guardar el empleado" });
            console.error("Error al guardar empleado:", error);
        }
    }, [currentEmployee, formValues, validateForm, fetchEmployees]);

    const table = useReactTable({
        data: filteredEmployees,
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
                    <Select value={jobFilter} onValueChange={setJobFilter}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Filtrar por puesto" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="__all__">Todos los puestos</SelectItem>
                            {jobOptions.map((job) => (
                                <SelectItem key={job} value={job}>{job}</SelectItem>
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
                    Nuevo Empleado
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
                                    {loading ? "Cargando..." : "No se encontraron empleados"}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    Mostrando {table.getFilteredRowModel().rows.length} de {employees.length} registros
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
            {/* Modal para crear/editar empleado */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {currentEmployee ? "Editar Empleado" : "Crear Nuevo Empleado"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="jobTitle" className="text-right">
                                Puesto
                            </Label>
                            <div className="col-span-3 space-y-1">
                                <Input
                                    id="jobTitle"
                                    value={formValues.jobTitle}
                                    onChange={(e) => setFormValues({ ...formValues, jobTitle: e.target.value })}
                                    className={formErrors.jobTitle ? "border-red-500" : ""}
                                />
                                {formErrors.jobTitle && (
                                    <p className="text-sm text-red-500">{formErrors.jobTitle}</p>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="fullName" className="text-right">
                                Nombre Completo
                            </Label>
                            <div className="col-span-3 space-y-1">
                                <Input
                                    id="fullName"
                                    value={formValues.fullName}
                                    onChange={(e) => setFormValues({ ...formValues, fullName: e.target.value })}
                                    className={formErrors.fullName ? "border-red-500" : ""}
                                />
                                {formErrors.fullName && (
                                    <p className="text-sm text-red-500">{formErrors.fullName}</p>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="gender" className="text-right">
                                Género
                            </Label>
                            <div className="col-span-3 space-y-1">
                                <Input
                                    id="gender"
                                    value={formValues.gender}
                                    onChange={(e) => setFormValues({ ...formValues, gender: e.target.value })}
                                    className={formErrors.gender ? "border-red-500" : ""}
                                />
                                {formErrors.gender && (
                                    <p className="text-sm text-red-500">{formErrors.gender}</p>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="birthDate" className="text-right">
                                Fecha de Nacimiento
                            </Label>
                            <div className="col-span-3 space-y-1">
                                <Input
                                    id="birthDate"
                                    type="date"
                                    value={formValues.birthDate.substring(0, 10)}
                                    onChange={(e) => setFormValues({ ...formValues, birthDate: e.target.value })}
                                    className={formErrors.birthDate ? "border-red-500" : ""}
                                />
                                {formErrors.birthDate && (
                                    <p className="text-sm text-red-500">{formErrors.birthDate}</p>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="phone1" className="text-right">
                                Teléfono
                            </Label>
                            <div className="col-span-3 space-y-1">
                                <Input
                                    id="phone1"
                                    value={formValues.phone1}
                                    onChange={(e) => setFormValues({ ...formValues, phone1: e.target.value })}
                                    className={formErrors.phone1 ? "border-red-500" : ""}
                                />
                                {formErrors.phone1 && (
                                    <p className="text-sm text-red-500">{formErrors.phone1}</p>
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
                                    value={formValues.email}
                                    onChange={(e) => setFormValues({ ...formValues, email: e.target.value })}
                                    className={formErrors.email ? "border-red-500" : ""}
                                />
                                {formErrors.email && (
                                    <p className="text-sm text-red-500">{formErrors.email}</p>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="nit" className="text-right">
                                NIT
                            </Label>
                            <div className="col-span-3 space-y-1">
                                <Input
                                    id="nit"
                                    value={formValues.nit}
                                    onChange={(e) => setFormValues({ ...formValues, nit: e.target.value })}
                                    className={formErrors.nit ? "border-red-500" : ""}
                                />
                                {formErrors.nit && (
                                    <p className="text-sm text-red-500">{formErrors.nit}</p>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="dpi" className="text-right">
                                DPI
                            </Label>
                            <div className="col-span-3 space-y-1">
                                <Input
                                    id="dpi"
                                    value={formValues.dpi}
                                    onChange={(e) => setFormValues({ ...formValues, dpi: e.target.value })}
                                    className={formErrors.dpi ? "border-red-500" : ""}
                                />
                                {formErrors.dpi && (
                                    <p className="text-sm text-red-500">{formErrors.dpi}</p>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="entryDate" className="text-right">
                                Fecha de Entrada
                            </Label>
                            <div className="col-span-3 space-y-1">
                                <Input
                                    id="entryDate"
                                    type="date"
                                    value={formValues.entryDate ? formValues.entryDate.substring(0, 10) : ""}
                                    onChange={(e) => setFormValues({ ...formValues, entryDate: e.target.value })}
                                    className={formErrors.entryDate ? "border-red-500" : ""}
                                />
                                {formErrors.entryDate && (
                                    <p className="text-sm text-red-500">{formErrors.entryDate}</p>
                                )}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="button" onClick={handleSubmit}>
                            {currentEmployee ? "Actualizar" : "Crear"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* Modal de confirmación para anular empleado */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro de anular este empleado?</AlertDialogTitle>
                        <AlertDialogDescription>
                            El empleado será marcado como anulado y no podrá ser utilizado.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        {/* <AlertDialogAction onClick={handleAnnulEmployee}>Anular</AlertDialogAction> */}
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
