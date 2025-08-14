import api from './axiosCliente';

import { User, CreateUserDto, UpdateUserDto } from '../types/user';
import { resolvePath } from 'react-router';


class AuthService {
  // Crear un nuevo usuario
  async register(userData: CreateUserDto): Promise<String> {
    try {
      console.log(userData)

      const response = await api.post('/Auth/register', userData);
      if (response.data) {
        await api.post(`/Permissions/default/${response.data.user.id}`)
      }
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

}

export default new AuthService();