// src/services/permissionService.ts
import api from './axiosCliente';

class PermissionService {
  // Crear un nuevo permiso
  async createPermission(permissionData: any): Promise<any> {
    try {
      const response = await api.post('/Permissions/create', permissionData);
      return response.data;
    } catch (error) {
      console.error('Error creating permission:', error);
      throw error;
    }
  }

  // Crear permisos por defecto para un usuario
  async createDefaultPermissions(userId: number): Promise<any> {
    try {
      const response = await api.post(`/Permissions/default/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error creating default permissions for user ${userId}:`, error);
      throw error;
    }
  }

  // Copiar permisos
  async copyPermissions(copyData: any): Promise<any> {
    try {
      const response = await api.post('/Permissions/copy', copyData);
      return response.data;
    } catch (error) {
      console.error('Error copying permissions:', error);
      throw error;
    }
  }

  // Asignar permisos a un grupo
  async assignPermissionsToGroup(assignData: any): Promise<any> {
    try {
      const response = await api.post('/Permissions/assign-group', assignData);
      return response.data;
    } catch (error) {
      console.error('Error assigning permissions to group:', error);
      throw error;
    }
  }

  // Actualizar permisos
  async updatePermissions(updateData: any): Promise<any> {
    try {
      const response = await api.put('/Permissions', updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating permissions:', error);
      throw error;
    }
  }

  // Eliminar un permiso
  async deletePermission(permissionId: number): Promise<void> {
    try {
      await api.delete(`/Permissions/delete/${permissionId}`);
    } catch (error) {
      console.error(`Error deleting permission with id ${permissionId}:`, error);
      throw error;
    }
  }

  // Eliminar todos los permisos de un usuario
  async deleteAllUserPermissions(userId: number): Promise<void> {
    try {
      await api.delete(`/Permissions/delete-all/${userId}`);
    } catch (error) {
      console.error(`Error deleting all permissions for user ${userId}:`, error);
      throw error;
    }
  }

  // Obtener módulos de usuario
  async getUserModules(): Promise<any[]> {
    try {
      const response = await api.get('/Permissions/user-module');
      return response.data;
    } catch (error) {
      console.error('Error fetching user modules:', error);
      throw error;
    }
  }

  // Obtener usuarios de un módulo
  async getModuleUsers(): Promise<any[]> {
    try {
      const response = await api.get('/Permissions/module-users');
      return response.data;
    } catch (error) {
      console.error('Error fetching module users:', error);
      throw error;
    }
  }

  // Obtener módulos accesibles para un usuario
  async getAccessibleModules(userId: number): Promise<any[]> {
    try {
      const response = await api.get(`/Permissions/accessible-modules/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching accessible modules for user ${userId}:`, error);
      throw error;
    }
  }

  // Verificar si tiene algún permiso en un grupo
  async hasAnyPermissionInGroup(groupData: any): Promise<boolean> {
    try {
      const response = await api.get('/Permissions/has-any-in-group', { params: groupData });
      return response.data;
    } catch (error) {
      console.error('Error checking permissions in group:', error);
      throw error;
    }
  }

  // Verificar un permiso específico
  async checkPermission(userId :number, moduleName: string, moduleGroup : string, permissionType : string): Promise<boolean> {
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
      console.error('Error checking permission:', error);
      throw error;
    }
  }
}

export default new PermissionService();