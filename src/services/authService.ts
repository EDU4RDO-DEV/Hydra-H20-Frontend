import api from './axiosCliente';
import { User, CreateUserDto } from '../types/user';
import { AxiosError } from 'axios';

interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

class AuthService {
  async register(userData: CreateUserDto): Promise<any> {
    try {
      console.log(userData);
      const response = await api.post('/Auth/register', userData);
      if (response.data) {
        await api.post(`/Permissions/default/${response.data.user.id}`);
      }
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        // Extraer el mensaje del backend
        const message = axiosError.response.data as string || 'Error al registrar usuario';
        throw new Error(message);
      }
      throw new Error('Error de conexión al registrar usuario');
    }
  }

  async login(
    username: string,
    password: string,
    deviceInfo: {
      ip: string;
      deviceName: string;
      latitude: number;
      longitude: number;
      accuracy: number;
    }
  ): Promise<LoginResponse> {
    try {
      const loginData = {
        username,
        password,
        ...deviceInfo
      };

      const response = await api.post('/Auth/login', loginData);
      
      if (response.data.token && response.data.user) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return { 
          success: true, 
          message: 'Login exitoso', 
          token: response.data.token, 
          user: response.data.user 
        };
      }

      return { 
        success: false, 
        message: response.data?.message || 'Respuesta inesperada del servidor',
        token: '',
        user: undefined
      };

    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        // Extraer el mensaje del backend
        const message = axiosError.response.data as string || 'Error en el login';
        return {
          success: false,
          message: message,
          token: '',
          user: undefined
        };
      }
      return {
        success: false,
        message: 'Error de conexión',
        token: '',
        user: undefined
      };
    }
  }

  // ... otros métodos ...
}

export default new AuthService();