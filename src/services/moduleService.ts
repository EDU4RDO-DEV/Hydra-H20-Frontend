// src/services/moduleService.ts
import api from './axiosCliente';
import {
  ModuleDto,
  CreateModuleDto,
  UpdateModuleDto,
  PagedModulesResponse
} from '../types/module';

class ModuleService {
  // Obtener todos los módulos activos
  async getActiveModules(): Promise<ModuleDto[]> {
    try {
      const response = await api.get('/Modules/active');
      return response.data;
    } catch (error) {
      console.error('Error al obtener los módulos activos:', error);
      throw error;
    }
  }

  // Obtener todos los módulos anulados
  async getAnnulledModules(): Promise<ModuleDto[]> {
    try {
      const response = await api.get('/Modules/annulled');
      return response.data;
    } catch (error) {
      console.error('Error al obtener los módulos anulados:', error);
      throw error;
    }
  }

  // Obtener módulo por ID
  async getModuleById(id: number): Promise<ModuleDto> {
    try {
      const response = await api.get(`/Modules/get/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener el módulo con id ${id}:`, error);
      throw error;
    }
  }

  // Obtener módulo DTO por ID
  async getModuleDtoById(id: number): Promise<ModuleDto> {
    try {
      const response = await api.get(`/Modules/dto/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener el DTO del módulo con id ${id}:`, error);
      throw error;
    }
  }

  // Buscar módulos por término
  async searchModules(term: string, includeAnnulled = false, maxResults = 50): Promise<ModuleDto[]> {
    try {
      const response = await api.get(`/Modules/search`, {
        params: { term, includeAnnulled, maxResults }
      });
      return response.data;
    } catch (error) {
      console.error('Error al buscar módulos:', error);
      throw error;
    }
  }

  // Obtener módulos paginados
  async getPagedModules(page = 1, pageSize = 20, includeAnnulled = false): Promise<PagedModulesResponse> {
    try {
      const response = await api.get(`/Modules/paged`, {
        params: { page, pageSize, includeAnnulled }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener módulos paginados:', error);
      throw error;
    }
  }

  // Crear módulo
  async createModule(data: CreateModuleDto): Promise<{ message: string; id: number }> {
    try {
      const response = await api.post('/Modules/create', data, {
        headers: { 'Content-Type': 'application/json-patch+json' }
      });
      return response.data;
    } catch (error) {
      console.error('Error al crear el módulo:', error);
      throw error;
    }
  }

  // Actualizar módulo
  async updateModule(data: UpdateModuleDto): Promise<{ message: string }> {
    try {
      const response = await api.put('/Modules/update', data, {
        headers: { 'Content-Type': 'application/json-patch+json' }
      });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar el módulo:', error);
      throw error;
    }
  }

  // Restaurar módulo anulado
  async restoreModule(id: number, userId: number): Promise<{ message: string }> {
    try {
      const response = await api.put(`/Modules/restore/${id}?userId=${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error al restaurar el módulo con id ${id}:`, error);
      throw error;
    }
  }

  // Anular (eliminar) módulo
  async annulModule(id: number, cancelUserId: number): Promise<{ message: string }> {
    try {
      const response = await api.delete(`/Modules/delete/${id}?cancelUserId=${cancelUserId}`);
      return response.data;
    } catch (error) {
      console.error(`Error al anular el módulo con id ${id}:`, error);
      throw error;
    }
  }
}

export default new ModuleService();