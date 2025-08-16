// src/services/permissionService.ts
import { GroupedPermission } from '../types/permission';
import api from './axiosCliente';

class PermissionService {
  // Crear un nuevo permiso
  async createPermission(permissionData: any): Promise<any> {
    try {
      const response = await api.post('/Permissions/create', permissionData);
      return response.data;
    } catch (error) {
      console.error('Error al crear el permiso:', error);
      throw error;
    }
  }

  // Crear permisos por defecto para un usuario
  async createDefaultPermissions(userId: number): Promise<any> {
    try {
      const response = await api.post(`/Permissions/default/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error al crear permisos por defecto para el usuario ${userId}:`, error);
      throw error;
    }
  }

  // Copiar permisos
  async copyPermissions(copyData: any): Promise<any> {
    try {
      const response = await api.post('/Permissions/copy', copyData);
      return response.data;
    } catch (error) {
      console.error('Error al copiar los permisos:', error);
      throw error;
    }
  }

  // Asignar permisos a un grupo
  async assignPermissionsToGroup(assignData: any): Promise<any> {
    try {
      const response = await api.post('/Permissions/assign-group', assignData);
      return response.data;
    } catch (error) {
      console.error('Error al asignar permisos al grupo:', error);
      throw error;
    }
  }

  // Actualizar permisos
  async updatePermissions(updateData: any): Promise<any> {
    try {
      const response = await api.put('/Permissions', updateData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar los permisos:', error);
      throw error;
    }
  }

  // Eliminar un permiso
  async deletePermission(permissionId: number): Promise<void> {
    try {
      await api.delete(`/Permissions/delete/${permissionId}`);
    } catch (error) {
      console.error(`Error al eliminar el permiso con id ${permissionId}:`, error);
      throw error;
    }
  }

  // Eliminar todos los permisos de un usuario
  async deleteAllUserPermissions(userId: number): Promise<void> {
    try {
      await api.delete(`/Permissions/delete-all/${userId}`);
    } catch (error) {
      console.error(`Error al eliminar todos los permisos del usuario ${userId}:`, error);
      throw error;
    }
  }

  // Obtener módulos de usuario
  async getUserModules(): Promise<any[]> {
    try {
      const response = await api.get('/Permissions/user-module');
      return response.data;
    } catch (error) {
      console.error('Error al obtener los módulos del usuario:', error);
      throw error;
    }
  }

  // Obtener usuarios de un módulo
  async getModuleUsers(): Promise<any[]> {
    try {
      const response = await api.get('/Permissions/module-users');
      return response.data;
    } catch (error) {
      console.error('Error al obtener los usuarios del módulo:', error);
      throw error;
    }
  }

  // Obtener módulos accesibles para un usuario
  async getAccessibleModules(userId: number): Promise<any[]> {
    try {
      const response = await api.get(`/Permissions/accessible-modules/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener los módulos accesibles para el usuario ${userId}:`, error);
      throw error;
    }
  }

  // Verificar si tiene algún permiso en un grupo
  async hasAnyPermissionInGroup(groupData: any): Promise<boolean> {
    try {
      const response = await api.get('/Permissions/has-any-in-group', { params: groupData });
      return response.data;
    } catch (error) {
      console.error('Error al verificar permisos en el grupo:', error);
      throw error;
    }
  }

  // Verificar un permiso específico
  async checkPermission(userId: number, moduleName: string, moduleGroup: string, permissionType: string): Promise<boolean> {
    try {
      const checkData = {
        userId,
        moduleName,
        moduleGroup,
        permissionType
      }

      const response = await api.get('/Permissions/check', { params: checkData });
      return response.data.success;
    } catch (error) {
      console.error('Error al verificar el permiso:', error);
      throw error;
    }
  }
  async getUserPermissions(userId: number): Promise<GroupedPermission[]> {
    try {
      const response = await api.get(`/Permissions/${userId}/all-permissions`);
      console.log("los permisos response son: ", response.data);

      return response.data;
    } catch (error) {
      console.error(`Error al obtener los permisos del usuario ${userId}:`, error);
      throw error;
    }
  }
  async updateUserPermissions(permissions: any[]): Promise<void> {
    try {
      console.log("los permisos a actualizar son: ", permissions);
      const response = await api.put(`/Permissions`, permissions);
      return response.data;

    } catch (error) {
      console.error(`Error al actualizar los permisos:`, error);
      throw error;
    }
  }

}


export default new PermissionService();