// Definición de tipos para TypeScript
type Module = {
  moduleName: string;
  group: string;
};

// Datos de los módulos del sistema (solo nombre y grupo)
const systemModules: Module[] = [
  { moduleName: "Ventas", group: "Sistema de Ventas" },
  { moduleName: "Facturación", group: "Sistema de Ventas" },
  { moduleName: "Control de Inventario", group: "Sistema de Almacén" },
  { moduleName: "Gestión de Personal", group: "Sistema de Recursos Humanos" },
  { moduleName: "Monitoreo de Producción", group: "Sistema de Manufactura" },
  { moduleName: "Mantenimiento Preventivo", group: "Sistema de Maquinaria" },
  { moduleName: "Reportes Financieros", group: "Sistema Contable" },
  { moduleName: "Seguimiento de Pedidos", group: "Sistema de Logística" },
  { moduleName: "Control de Accesos", group: "Sistema de Seguridad" },
  { moduleName: "Gestión de Clientes", group: "Ventas" },
  { moduleName: "Gestión de Proveedores", group: "Compras" },
  { moduleName: "Control de Inventario", group: "Operaciones" },
  { moduleName: "Registro de Producción", group: "Operaciones" },
  { moduleName: "Facturación y Cobros", group: "Ventas" },
  { moduleName: "Reportes", group: "a" },
  { moduleName: "Reportes y Estadísticas", group: "a" },
  { moduleName: "Reportes y Estadísticas", group: "Administración" },
  { moduleName: "Mantenimiento de Maquinaria", group: "Técnico" },
  { moduleName: "Mantenimiento de Planta", group: "Técnico" },
  { moduleName: "Gestión de Usuarios", group: "Seguridad" }
];

// Crear un índice para búsqueda rápida por nombre de módulo
const moduleIndex: Record<string, Module> = {};
systemModules.forEach(module => {
  moduleIndex[module.moduleName] = module;
});

export const ModuleManager = {
  /**
   * Obtiene información completa del módulo por su nombre
   * @param moduleName Nombre exacto del módulo
   * @returns Objeto con {moduleName, group} o undefined si no existe
   */
  getModuleByName: (moduleName: string): Module | undefined => {
    return moduleIndex[moduleName];
  },

  /**
   * Obtiene todos los módulos del sistema
   */
  getAllModules: (): Module[] => {
    return [...systemModules];
  },

  /**
   * Busca módulos que coincidan parcialmente con el nombre
   * @param searchTerm Término de búsqueda (insensible a mayúsculas)
   */
  searchModules: (searchTerm: string): Module[] => {
    const term = searchTerm.toLowerCase();
    return systemModules.filter(module => 
      module.moduleName.toLowerCase().includes(term)
    );
  },

  /**
   * Obtiene todos los módulos de un grupo específico
   */
  getModulesByGroup: (groupName: string): Module[] => {
    return systemModules.filter(module => module.group === groupName);
  },

  /**
   * Obtiene la lista de todos los grupos únicos
   */
  getAllGroups: (): string[] => {
    return [...new Set(systemModules.map(module => module.group))];
  }
};

// Exportación por defecto de los módulos del sistema
export default systemModules;