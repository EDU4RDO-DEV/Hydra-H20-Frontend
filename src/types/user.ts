// src/types/userTypes.ts
export interface User {
  id: number;
  entityId: number;
  role: string;
  email: string;
  name: string;
  password?: string;
  registrationDate: string | Date;
  canceled: boolean;
  cancelUserId?: number;
  cancelDate?: string | Date;
  modifiedByUserId?: number;
  modifiedDate?: string | Date;
}

// Tipo para la creación de usuarios
export interface CreateUserDto {  
  username: string;
  password: string;
  email: string;
  rol: string;
}

// Tipo para la actualización de usuarios
export interface UpdateUserDto {
  entityId?: number;
  role?: string;
  email?: string;
  name?: string;
  password?: string;
  canceled?: boolean;
}

// export interface UserFormValues {
//   EntityId: number;
//   Role: string;
//   Email: string;
//   Name: string;
// }
export interface UserFormValues {
  EntityId: number
  Role: string
  Email: string
  Name: string
  Password?: string  // Nuevo campo para contraseña
  Username?: string  // Solo para creación
}