import apiClient from './axiosConfig';
import { ErrorData, CreateErrorRequest, ApiResponse } from '../types/apiTypes';

class ErrorService {
  async getAvailable<T, R>(payload: T): Promise<ApiResponse<R>> {
    try {

      const response = await apiClient.post<R>('/webhook-test/18951f33-09ff-4ad6-9469-6f918190f44d', payload);

      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      // El error.message podría ser undefined, por eso usamos una comprobación opcional
      console.error('di error mi bro:', (error as Error).message);
      throw this.handleError(error);
    }
  }

  // GET - Obtener error por ID
  async getErrorById(id: string): Promise<ApiResponse<ErrorData>> {
    try {
      const response = await apiClient.get<ErrorData>(`/errors/erroresapi/${id}`);
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // POST - Crear eevnto
  async createEvento<T, R>(payload: T): Promise<ApiResponse<R>> {
    try {

      const response = await apiClient.post<R>('/webhook/18951f33-09ff-4ad6-9469-6f918190f44d', payload);

      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      // El error.message podría ser undefined, por eso usamos una comprobación opcional
      console.error('di error mi bro:', (error as Error).message);
      throw this.handleError(error);
    }
  }


  // PUT - Actualizar error
  async updateError(id: string, errorData: Partial<CreateErrorRequest>): Promise<ApiResponse<ErrorData>> {
    try {
      const response = await apiClient.put<ErrorData>(`/errors/erroresapi/${id}`, errorData);
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // DELETE - Eliminar error
  async deleteError(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete(`/errors/erroresapi/${id}`);
      return {
        data: undefined,
        status: response.status,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Manejo centralizado de errores
  private handleError(error: any): Error {
    if (error.response) {
      // Error del servidor
      const message = error.response.data?.message || `Error ${error.response.status}: ${error.response.statusText}`;
      return new Error(message);
    } else if (error.request) {
      // Error de red
      return new Error('Error de conexión. Verifica tu internet.');
    } else {
      // Error inesperado
      return new Error('Error inesperado: ' + error.message);
    }
  }
}

// Exportar una instancia única (Singleton)
export const errorService = new ErrorService();