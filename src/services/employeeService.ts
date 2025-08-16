import api from './axiosCliente';
import {
    EmployeeSimpleDto,
    RegisterEmployeeUserDto,
    EmployeeEntityDto,
    EmployeeJobDto,
    EmployeeImageUploadDto,
    EmployeeResponse,
    Employee
} from '../types/employee';

class EmployeeService {
    // Obtener todos los empleados activos
    async getActiveEmployees(): Promise<Employee[]> {
        try {
            const response = await api.get('/Employee/active');
            return response.data;
        } catch (error) {
            console.error('Error al obtener los empleados activos:', error);
            throw error;
        }
    }

    // Obtener todos los empleados anulados
    async getAnnulledEmployees(): Promise<Employee[]> {
        try {
            const response = await api.get('/Employee/annulled');
            return response.data;
        } catch (error) {
            console.error('Error al obtener los empleados anulados:', error);
            throw error;
        }
    }

    // Obtener empleado por ID
    async getEmployeeById(id: number): Promise<Employee> {
        try {
            const response = await api.get(`/Employee/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error al obtener el empleado con id ${id}:`, error);
            throw error;
        }
    }

    // Obtener empleado DTO por ID
    async getEmployeeDtoById(id: number): Promise<Employee> {
        try {
            const response = await api.get(`/Employee/dto/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error al obtener el DTO del empleado con id ${id}:`, error);
            throw error;
        }
    }

    // Crear empleado simple
    async createEmployeeSimple(data: EmployeeSimpleDto): Promise<EmployeeResponse> {
        try {
            const response = await api.post('/Employee/create-simple', data, {
                headers: { 'Content-Type': 'application/json-patch+json' }
            });
            return response.data;
        } catch (error) {
            console.error('Error al crear el empleado:', error);
            throw error;
        }
    }

    // Registrar empleado y usuario juntos
    async registerEmployeeUser(data: RegisterEmployeeUserDto): Promise<EmployeeResponse> {
        try {
            const response = await api.post('/Employee/register-employee-user', data, {
                headers: { 'Content-Type': 'application/json-patch+json' }
            });
            return response.data;
        } catch (error) {
            console.error('Error al registrar empleado y usuario:', error);
            throw error;
        }
    }

    // Actualizar empleado simple
    async updateEmployeeSimple(data: EmployeeSimpleDto): Promise<EmployeeResponse> {
        try {
            console.log("datos de actualizacion de empleado", data);
            const response = await api.put('/Employee/update-simple', data, {
                headers: { 'Content-Type': 'application/json-patch+json' }
            });
            return response.data;
        } catch (error) {
            console.error('Error al actualizar el empleado:', error);
            throw error;
        }
    }

    // Restaurar empleado anulado
    async restoreEmployee(id: number, userId: number): Promise<{ message: string }> {
        try {
            const response = await api.put(`/Employee/restore/${id}?userId=${userId}`);
            return response.data;
        } catch (error) {
            console.error(`Error al restaurar el empleado con id ${id}:`, error);
            throw error;
        }
    }

    // Actualizar entidad (datos personales)
    async updateEmployeeEntity(id: number, userId: number, data: EmployeeEntityDto): Promise<{ message: string }> {
        try {
            const response = await api.put(`/Employee/update-entity/${id}?userId=${userId}`, data, {
                headers: { 'Content-Type': 'application/json-patch+json' }
            });
            return response.data;
        } catch (error) {
            console.error('Error al actualizar la entidad del empleado:', error);
            throw error;
        }
    }

    // Actualizar puesto de trabajo
    async updateEmployeeJob(id: number, userId: number, data: EmployeeJobDto): Promise<{ message: string }> {
        try {
            const response = await api.put(`/Employee/update-job/${id}?userId=${userId}`, data, {
                headers: { 'Content-Type': 'application/json-patch+json' }
            });
            return response.data;
        } catch (error) {
            console.error('Error al actualizar el puesto del empleado:', error);
            throw error;
        }
    }

    // Subir imagen de empleado
    async uploadEmployeeImage(data: EmployeeImageUploadDto): Promise<{ message: string }> {
        try {
            const formData = new FormData();
            formData.append('UserId', String(data.UserId));
            formData.append('EmployeeId', String(data.EmployeeId));
            formData.append('Image', data.Image);
            const response = await api.post('/Employee/upload-image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            console.error('Error al subir la imagen del empleado:', error);
            throw error;
        }
    }

    // Obtener imagen de empleado por ID
    async getEmployeeImageById(id: number): Promise<Blob> {
        try {
            const response = await api.get(`/Employee/image-by-id/${id}`, { responseType: 'blob' });
            return response.data;
        } catch (error) {
            console.error('Error al obtener la imagen del empleado:', error);
            throw error;
        }
    }

    // Anular (eliminar) empleado
    async annulEmployee(id: number, cancelUserId: number): Promise<{ message: string }> {
        try {
            const response = await api.delete(`/Employee/delete/${id}?cancelUserId=${cancelUserId}`);
            return response.data;
        } catch (error) {
            console.error(`Error al anular el empleado con id ${id}:`, error);
            throw error;
        }
    }

    // Payload para fechas
    async createPayload(formValues: any) {
        const payload = {
            ...formValues,
            birthDate: formValues.birthDate ? new Date(formValues.birthDate).toISOString() : null,
            entryDate: formValues.entryDate ? new Date(formValues.entryDate).toISOString() : null,
            exitDate: formValues.exitDate ? new Date(formValues.exitDate).toISOString() : null,
        };
        return payload;
    }
}

export default new EmployeeService();
