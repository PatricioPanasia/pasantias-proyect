import {
  Routes,
  Route,
  useNavigate,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import ProfesorForm from "./components/ProfesorForm";
import ProfesorList from "./components/ProfesorList";
import EstadoProfesorForm from "./components/EstadoProfesorForm";
import Notificacion from "./components/Notificacion";
import Login from "./components/Login";
import Menu from "./components/Menu";
import { apiFetch, API_ENDPOINTS } from "./config/api";
import "./styles/App.css";

/**
 * Componente de orden superior para proteger rutas que requieren autenticación.
 * Si el usuario no está logueado, lo redirige a la página de inicio.
 * @param {{isLoggedIn: boolean, children: React.ReactNode}} props
 * @returns {React.ReactElement}
 */
function ProtectedRoute({ isLoggedIn, children }) {
  const location = useLocation();
  if (!isLoggedIn) {
    // Redirige al login, guardando la ubicación a la que intentaba acceder
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  return children;
}

/**
 * Componente principal de la aplicación. Gestiona el estado global,
 * la autenticación, el enrutamiento y las operaciones CRUD de profesores.
 */
export default function App() {
  const [profesores, setProfesores] = useState([]);
  const [estados, setEstados] = useState([]);
  const [editando, setEditando] = useState(null);
  const [notificacion, setNotificacion] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Estado de autenticación
  const [mostrarFormEstado, setMostrarFormEstado] = useState(false);
  const [profesorEstado, setProfesorEstado] = useState(null);
  const [estadoActualProfesor, setEstadoActualProfesor] = useState(null);
  const navigate = useNavigate();

  // Efecto para cargar la lista de profesores cuando el usuario inicia sesión.
  useEffect(() => {
    if (isLoggedIn) {
      fetchProfesores();
      fetchEstados();
    }
  }, [isLoggedIn]);

  /**
   * Obtiene la lista de todos los profesores desde el backend.
   */
  const fetchProfesores = useCallback(async () => {
    try {
      const data = await apiFetch(API_ENDPOINTS.PROFESORES_CON_ESTADO);
      setProfesores(data);
    } catch (err) {
      console.error("Error cargando profesores:", err);
      const mensaje = err.status === 0 
        ? "No se puede conectar con el servidor" 
        : err.message || "Error al cargar profesores";
      showNotificacion(mensaje, "error");
    }
  }, []);

  /**
   * Obtiene la lista de todos los estados disponibles.
   */
  const fetchEstados = useCallback(async () => {
    try {
      const data = await apiFetch(API_ENDPOINTS.ESTADOS);
      setEstados(data);
    } catch (err) {
      console.error("Error cargando estados:", err);
      const mensaje = err.status === 0 
        ? "No se puede conectar con el servidor" 
        : err.message || "Error al cargar estados";
      showNotificacion(mensaje, "error");
    }
  }, []);

  /**
   * Envía los datos de un profesor al backend para crearlo o actualizarlo.
   * @param {object} profesor - El objeto profesor a guardar.
   */
  const guardarProfesor = async (profesor) => {
    try {
      const endpoint = editando 
        ? API_ENDPOINTS.PROFESOR_BY_ID(editando.id)
        : API_ENDPOINTS.PROFESORES;
      
      const method = editando ? "PUT" : "POST";

      await apiFetch(endpoint, {
        method,
        body: JSON.stringify(profesor),
      });

      showNotificacion(
        `Profesor ${editando ? "actualizado" : "creado"} correctamente`,
        "success"
      );

      await fetchProfesores();
      setEditando(null);
      navigate("/profesores");
    } catch (err) {
      console.error("Error guardando profesor:", err);
      const mensaje = err.status === 400 
        ? "Datos inválidos" 
        : err.message || "Error al guardar profesor";
      showNotificacion(mensaje, "error");
    }
  };

  /**
   * Prepara el formulario para editar un profesor existente.
   * @param {object} profesor - El profesor a editar.
   */
  const editarProfesor = (profesor) => {
    setEditando(profesor);
    navigate("/profesores/formulario");
  };

  /**
   * Cancela la edición y limpia el estado.
   */
  const cancelarEdicion = () => {
    setEditando(null);
  };

  /**
   * Muestra una confirmación y, si se acepta, elimina un profesor.
   * @param {object} profesor - El profesor a eliminar.
   */
  const eliminarProfesor = (profesor) => {
    setNotificacion({
      mensaje: `¿Seguro que deseas eliminar a ${profesor.apellido_nombres}?`,
      tipo: "confirmacion",
      onConfirm: async () => {
        try {
          await apiFetch(API_ENDPOINTS.PROFESOR_BY_ID(profesor.id), {
            method: "DELETE",
          });
          
          await fetchProfesores();
          showNotificacion("Profesor eliminado correctamente", "success");
        } catch (err) {
          console.error("Error eliminando profesor:", err);
          const mensaje = err.status === 404 
            ? "El profesor no existe" 
            : err.message || "Error al eliminar profesor";
          showNotificacion(mensaje, "error");
        }
      },
      onCancel: () => setNotificacion(null),
    });
  };

  /**
   * Maneja el éxito del inicio de sesión, actualizando el estado y redirigiendo al menú.
   */
  const handleLogin = () => {
    setIsLoggedIn(true);
    navigate("/menu");
  };

  /**
   * Abre el formulario para cambiar el estado de un profesor.
   * @param {object} profesor - El profesor seleccionado.
   */
  const handleCambiarEstado = async (profesor) => {
    try {
      const estadoActual = await apiFetch(API_ENDPOINTS.ESTADO_ACTUAL(profesor.id));
      
      setProfesorEstado(profesor);
      setEstadoActualProfesor(estadoActual);
      setMostrarFormEstado(true);
    } catch (err) {
      console.error("Error al obtener estado actual:", err);
      setProfesorEstado(profesor);
      setEstadoActualProfesor(null);
      setMostrarFormEstado(true);
    }
  };

  /**
   * Guarda el cambio de estado de un profesor.
   * @param {object} datosEstado - Los datos del nuevo estado.
   */
  const guardarCambioEstado = async (datosEstado) => {
    try {
      await apiFetch(API_ENDPOINTS.CAMBIAR_ESTADO(profesorEstado.id), {
        method: "POST",
        body: JSON.stringify(datosEstado),
      });

      showNotificacion("Estado cambiado correctamente", "success");
      setMostrarFormEstado(false);
      setProfesorEstado(null);
      setEstadoActualProfesor(null);
      await fetchProfesores();
    } catch (err) {
      console.error("Error cambiando estado:", err);
      const mensaje = err.status === 400 
        ? err.message || "Datos inválidos" 
        : "Error al cambiar estado";
      showNotificacion(mensaje, "error");
    }
  };

  /**
   * Finaliza el estado actual de un profesor.
   * @param {number} profesorId - El ID del profesor.
   */
  const finalizarEstado = async (profesorId) => {
    try {
      await apiFetch(API_ENDPOINTS.FINALIZAR_ESTADO(profesorId), {
        method: "POST",
        body: JSON.stringify({
          fecha_fin: new Date().toISOString().split("T")[0],
        }),
      });

      showNotificacion("Estado finalizado correctamente", "success");
      await fetchProfesores();
    } catch (err) {
      console.error("Error finalizando estado:", err);
      const mensaje = err.status === 400 
        ? err.message || "No hay estado activo para finalizar" 
        : "Error al finalizar estado";
      showNotificacion(mensaje, "error");
    }
  };

  /**
   * Maneja el cierre de sesión, actualizando el estado y redirigiendo al login.
   */
  const handleLogout = () => {
    setIsLoggedIn(false);
    setProfesores([]);
    setEditando(null);
    navigate("/");
  };

  /**
   * Muestra una notificación en pantalla.
   * @param {string} mensaje - El mensaje a mostrar.
   * @param {'success'|'error'|'info'|'confirmacion'} tipo - El tipo de notificación.
   */
  const showNotificacion = (mensaje, tipo) => {
    setNotificacion({ mensaje, tipo, onCancel: () => setNotificacion(null) });
  };

  return (
    <>
      <Routes>
        {/* Ruta de Login */}
        <Route path="/" element={<Login onLogin={handleLogin} />} />

        {/* Rutas Protegidas */}
        <Route
          path="/*"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <div className="app-wrapper">
                <Routes>
                  <Route
                    path="menu"
                    element={<Menu onLogout={handleLogout} />}
                  />
                  <Route
                    path="profesores/formulario"
                    element={
                      <ProfesorForm
                        onSubmit={guardarProfesor}
                        initialData={editando}
                        onCancelEdit={cancelarEdicion}
                        isEditing={!!editando}
                      />
                    }
                  />
                  <Route
                    path="profesores"
                    element={
                      <ProfesorList
                        profesores={profesores}
                        onEdit={editarProfesor}
                        onDelete={eliminarProfesor}
                        onCambiarEstado={handleCambiarEstado}
                        onFinalizarEstado={finalizarEstado}
                      />
                    }
                  />
                  {/* Redirección por defecto dentro de las rutas protegidas */}
                  <Route path="*" element={<Navigate to="/menu" />} />
                </Routes>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>

      {/* Formulario de Cambio de Estado (modal) */}
      {mostrarFormEstado && profesorEstado && (
        <EstadoProfesorForm
          profesor={profesorEstado}
          estados={estados}
          estadoActual={estadoActualProfesor}
          onSubmit={guardarCambioEstado}
          onCancel={() => {
            setMostrarFormEstado(false);
            setProfesorEstado(null);
            setEstadoActualProfesor(null);
          }}
        />
      )}

      <Notificacion
        mensaje={notificacion?.mensaje}
        tipo={notificacion?.tipo}
        onConfirm={notificacion?.onConfirm}
        onCancel={notificacion?.onCancel}
      />
    </>
  );
}
