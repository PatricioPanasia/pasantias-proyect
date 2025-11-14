/**
 * Configuración centralizada de la API
 */

// URL base de la API - cambiar en un solo lugar para todos los endpoints
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Helper para construir URLs de endpoints
 */
export const buildApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

/**
 * Endpoints de la API
 */
export const API_ENDPOINTS = {
  // Autenticación
  LOGIN: '/login',
  
  // Profesores
  PROFESORES: '/profesores',
  PROFESORES_CON_ESTADO: '/profesores-con-estado',
  PROFESOR_BY_ID: (id) => `/profesores/${id}`,
  
  // Estados
  ESTADOS: '/estados',
  ESTADO_ACTUAL: (id) => `/profesores/${id}/estado-actual`,
  HISTORIAL_ESTADOS: (id) => `/profesores/${id}/historial-estados`,
  CAMBIAR_ESTADO: (id) => `/profesores/${id}/cambiar-estado`,
  FINALIZAR_ESTADO: (id) => `/profesores/${id}/finalizar-estado`,
};

/**
 * Helper para hacer peticiones fetch con manejo de errores mejorado
 */
export const apiFetch = async (endpoint, options = {}) => {
  const url = typeof endpoint === 'function' ? buildApiUrl(endpoint()) : buildApiUrl(endpoint);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || `HTTP Error ${response.status}`);
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    return await response.json();
  } catch (error) {
    if (error.status) throw error;
    
    // Error de red u otro error
    const networkError = new Error('Error de conexión con el servidor');
    networkError.status = 0;
    networkError.originalError = error;
    throw networkError;
  }
};
