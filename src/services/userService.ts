// src/services/userService.ts
import api from './axiosCliente';

import { User, CreateUserDto, UpdateUserDto } from '../types/user';


class UserService {
  // Obtener todos los usuarios
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await api.get('/User/list');
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error('Error al obtener los usuarios:', error);
      throw error;
    }
  }

  // Obtener un usuario por ID
  async getUserById(id: number): Promise<User> {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener el usuario con id ${id}:`, error);
      throw error;
    }
  }

  // Crear un nuevo usuario
  async createUser(userData: CreateUserDto): Promise<User> {
    try {
      const response = await api.post('/users', userData);
      return response.data;
    } catch (error) {
      console.error('Error al crear el usuario:', error);
      throw error;
    }
  }

  // Actualizar un usuario
  async updateUser(id: number, userData: UpdateUserDto): Promise<User> {
    try {
      console.log(userData)

      const response = await api.put('/User/edit', userData);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar el usuario con id ${id}:`, error);
      throw error;
    }
  }

  async updatePassword(id: number, newPassword: string, modifiedByUserId: number): Promise<void> {
    try {
      await api.put(`/User/update-password`, {
        id,
        newPassword,
        modifiedByUserId
      })
    } catch (error) {
      console.error(`Error al actualizar la contraseña del usuario con id ${id}:`, error);
      throw error;
    }
  }

  // Eliminar (cancelar) un usuario
  async deleteUser(id: number, cancelUserId: number): Promise<void> {
    try {
      await api.delete(`/users/${id}`, {
        data: { cancelUserId } // Envía el ID del usuario que realiza la cancelación
      });
    } catch (error) {
      console.error(`Error al eliminar el usuario con id ${id}:`, error);
      throw error;
    }
  }

  // Reactivar un usuario cancelado
  async reactivateUser(userId: number, modifiedByUserId: number): Promise<User> {
    try {
      const response = await api.put(`/User/enable?userId=${userId}&modifiedByUserId=${modifiedByUserId}`);
      return response.data;
    } catch (error) {
      console.error(`Error al reactivar el usuario con id ${userId}:`, error);
      throw error;
    }
  }

  async cancelUser(id: number, cancelUserId: number): Promise<void> {
    try {
      const response = await api.post(`/User/${id}/cancel?cancelUserId=${cancelUserId}`);
    } catch (error) {
      console.error(`Error al anular el usuario con id ${id} por el usuario ${cancelUserId}:`, error);

      throw error;
    }
  }

}

export default new UserService();