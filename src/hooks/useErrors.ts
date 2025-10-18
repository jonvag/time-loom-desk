import { useState, useEffect } from 'react';
import { errorService } from '../services/api/errorService';
import { ErrorData, CreateErrorRequest } from '../services/types/apiTypes';

export const useErrors = () => {
  const [errors, setErrors] = useState<ErrorData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener todos los errores
  const fetchErrors = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await errorService.getErrors();
      setErrors(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Crear nuevo error
  const createError = async (errorData: CreateErrorRequest) => {
    setLoading(true);
    try {
      const response = await errorService.createError(errorData);
      setErrors(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cargar errores al montar el componente
  useEffect(() => {
    fetchErrors();
  }, []);

  return {
    errors,
    loading,
    error,
    fetchErrors,
    createError,
    refetch: fetchErrors,
  };
};