import React, { useState, useEffect } from 'react';
import { errorService } from '../services/api/errorService';
import { ErrorData, CreateErrorRequest } from '../services/types/apiTypes';

const ErrorList: React.FC = () => {
  const [errors, setErrors] = useState<ErrorData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newError, setNewError] = useState<CreateErrorRequest>({
    name: '',
    description: '',
    severity: 'medium'
  });

  // Cargar errores al montar el componente
  useEffect(() => {
    loadErrors();
  }, []);

  const loadErrors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await errorService.getErrors();
      setErrors(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los datos');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateError = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newError.name.trim()) {
      setError('El nombre del error es requerido');
      return;
    }

    try {
      setLoading(true);
      const response = await errorService.createError(newError);
      
      // Agregar el nuevo error a la lista
      setErrors(prev => [response.data, ...prev]);
      
      // Resetear el formulario
      setNewError({
        name: '',
        description: '',
        severity: 'medium'
      });
      
      setError(null);
      alert('✅ Error creado exitosamente!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el error');
      console.error('Error creating data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewError(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDeleteError = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este error?')) {
      return;
    }

    try {
      await errorService.deleteError(id);
      // Remover el error de la lista
      setErrors(prev => prev.filter(error => error.id !== id));
      alert('✅ Error eliminado exitosamente!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar el error');
      console.error('Error deleting data:', err);
    }
  };

  // Función para formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && errors.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div>Cargando errores...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem' }}>
      <h1 style={{ color: '#333', textAlign: 'center' }}>📊 Gestión de Errores API</h1>
      
      {/* Mostrar error global */}
      {error && (
        <div style={{
          background: '#ffebee',
          color: '#c62828',
          padding: '1rem',
          borderRadius: '4px',
          marginBottom: '1rem',
          border: '1px solid #ffcdd2'
        }}>
          ⚠️ {error}
          <button 
            onClick={() => setError(null)}
            style={{ marginLeft: '1rem', background: 'none', border: 'none', color: '#c62828', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
      )}

      {/* Formulario para crear nuevo error */}
      <div style={{
        background: '#f5f5f5',
        padding: '1.5rem',
        borderRadius: '8px',
        marginBottom: '2rem'
      }}>
        <h2>➕ Agregar Nuevo Error</h2>
        <form onSubmit={handleCreateError}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Nombre del Error: *
            </label>
            <input
              type="text"
              name="name"
              value={newError.name}
              onChange={handleInputChange}
              placeholder="Ej: Error de conexión a la base de datos"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
              disabled={loading}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Descripción:
            </label>
            <textarea
              name="description"
              value={newError.description}
              onChange={handleInputChange}
              placeholder="Describe el error en detalle..."
              rows={3}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                resize: 'vertical'
              }}
              disabled={loading}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Severidad:
            </label>
            <select
              name="severity"
              value={newError.severity}
              onChange={handleInputChange}
              style={{
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
              disabled={loading}
            >
              <option value="low">🟢 Baja</option>
              <option value="medium">🟡 Media</option>
              <option value="high">🔴 Alta</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || !newError.name.trim()}
            style={{
              background: loading ? '#ccc' : '#1976d2',
              color: 'white',
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '⏳ Creando...' : '📝 Crear Error'}
          </button>
        </form>
      </div>

      {/* Lista de errores */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>📋 Lista de Errores ({errors.length})</h2>
          <button 
            onClick={loadErrors}
            disabled={loading}
            style={{
              background: '#4caf50',
              color: 'white',
              padding: '0.5rem 1rem',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            🔄 Actualizar
          </button>
        </div>

        {errors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            No hay errores para mostrar. ¡Crea el primero!
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {errors.map((errorItem) => (
              <div
                key={errorItem.id}
                style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  background: 'white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>
                      {errorItem.name}
                    </h3>
                    {errorItem.description && (
                      <p style={{ margin: '0 0 1rem 0', color: '#666' }}>
                        {errorItem.description}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: '#888' }}>
                      <span>
                        <strong>ID:</strong> {errorItem.id}
                      </span>
                      <span>
                        <strong>Severidad:</strong> 
                        <span style={{
                          color: 
                            errorItem.severity === 'high' ? '#d32f2f' :
                            errorItem.severity === 'medium' ? '#f57c00' : '#388e3c',
                          fontWeight: 'bold',
                          marginLeft: '0.25rem'
                        }}>
                          {errorItem.severity === 'high' ? '🔴 Alta' :
                           errorItem.severity === 'medium' ? '🟡 Media' : '🟢 Baja'}
                        </span>
                      </span>
                    </div>
                    <small style={{ color: '#999', display: 'block', marginTop: '0.5rem' }}>
                      📅 Creado: {formatDate(errorItem.createdAt)}
                    </small>
                  </div>
                  
                  <button
                    onClick={() => handleDeleteError(errorItem.id)}
                    disabled={loading}
                    style={{
                      background: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '0.5rem 1rem',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorList;