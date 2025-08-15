import api from './axiosCliente';
import { User, CreateUserDto, UpdateUserDto } from '../types/user';

class AuthService {
  // Crear un nuevo usuario
  async register(userData: CreateUserDto): Promise<any> {
    try {
      console.log(userData);
      const response = await api.post('/Auth/register', userData);
      if (response.data) {
        await api.post(`/Permissions/default/${response.data.user.id}`);
      }
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Iniciar sesión
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
  ): Promise<{ success: boolean, message: string; token: string; user: User }> {


    try {
      const loginData = {
        username,
        password,
        ...deviceInfo
      };

      const response = await api.post('/Auth/login', loginData);
      console.log("RESPONSE DLE LOGIN",response);
      
      // Guardar token y usuario en localStorage
      if (response.status === 200 && response.data.token && response.data.user) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return { success: true, message: 'Login successful', token: response.data.token, user: response.data.user };
      }

      return { success: false, message: response.data, token: '', user: {} as User };

    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  }

  // Cerrar sesión
  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  // Obtener usuario actual
  getCurrentUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Obtener token
  getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }
}

export default new AuthService();