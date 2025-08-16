// Datos básicos para crear o actualizar un empleado (simple)
export interface EmployeeSimpleDto {
  id?: number; // solo para update
  userId: number;
  jobTitle: string;
  jobDescription: string;
  entryDate: string; // ISO string
  exitDate?: string | null;
  fullName: string;
  gender: string;
  birthDate: string; // ISO string
  phone1: string;
  phone2: string;
  email: string;
  nit: string;
  dpi: string;
}

// Para registrar empleado y usuario juntos
export interface RegisterEmployeeUserDto {
  employee: EmployeeSimpleDto;
  user: {
    username: string;
    password: string;
    email: string;
    rol: string;
  };
}

// Para actualizar solo la entidad (datos personales)
export interface EmployeeEntityDto {
  userId: number;
  fullName: string;
  gender: string;
  birthDate: string;
  phone1: string;
  phone2: string;
  email: string;
  nit: string;
  dpi: string;
}

// Para actualizar solo el puesto de trabajo
export interface EmployeeJobDto {
  employeeId: number;
  jobTitle: string;
  jobDescription: string;
  entryDate: string;
  exitDate?: string | null;
  modifiedByUserId: number;
}

// Para subir imagen de empleado
export interface EmployeeImageUploadDto {
  UserId: number;
  EmployeeId: number;
  Image: File;
}

// Respuesta de registro/actualización
export interface EmployeeResponse {
  message: string;
  id?: number;
  employeeId?: number;
  user?: {
    id: number;
    username: string;
    email: string;
    role: string;
    registrationDate: string;
  };
}

// Estructura de empleado para listados y detalles
export interface Employee {
  id: number;
  userId: number;
  entityId: number;
  fullName: string;
  gender: string;
  birthDate: string;
  phone1: string;
  phone2: string;
  email: string;
  imagePath?: string | null;
  nit: string;
  dpi: string;
  jobTitle: string;
  jobDescription: string;
  entryDate: string;
  exitDate?: string | null;
  registrationDate: string;
  canceled: boolean;
  cancelUserId?: number | null;
  cancelDate?: string | null;
  modifiedByUserId?: number | null;
  modifiedDate?: string | null;
}