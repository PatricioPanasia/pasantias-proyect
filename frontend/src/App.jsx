import { Routes, Route, useNavigate, Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import ProfesorForm from "./components/ProfesorForm";
import ProfesorList from "./components/ProfesorList";
import Notificacion from "./components/Notificacion";
import Login from "./components/Login";
import Menu from "./components/Menu";
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
  const [editando, setEditando] = useState(null);
  const [notificacion, setNotificacion] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Estado de autenticación
  const navigate = useNavigate();

  // Efecto para cargar la lista de profesores cuando el usuario inicia sesión.
  useEffect(() => {
    if (isLoggedIn) {
      fetchProfesores();
    }
  }, [isLoggedIn]);

  /**
   * Obtiene la lista de todos los profesores desde el backend.
   */
  const fetchProfesores = async () => {
    try {
      const res = await fetch("http://localhost:3001/profesores");
      if (!res.ok) throw new Error("Error en la respuesta del servidor");
      const data = await res.json();
      setProfesores(data);
    } catch (err) {
      console.error("Error cargando profesores:", err);
      showNotificacion("Error al cargar profesores", "error");
    }
  };

  /**
   * Envía los datos de un profesor al backend para crearlo o actualizarlo.
   * @param {object} profesor - El objeto profesor a guardar.
   */
  const guardarProfesor = async (profesor) => {
    try {
      let url = "http://localhost:3001/profesores";
      let method = "POST";

      if (editando) {
        url += `/${editando.id}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profesor),
      });

      if (!res.ok) throw new Error("Error al guardar");

      showNotificacion(
        `Profesor ${editando ? "actualizado" : "creado"} correctamente`,
        "success"
      );

      await fetchProfesores();
      setEditando(null);
      navigate("/profesores");
    } catch (err) {
      console.error("Error guardando profesor:", err);
      showNotificacion("Error al guardar profesor", "error");
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
   * Muestra una confirmación y, si se acepta, elimina un profesor.
   * @param {object} profesor - El profesor a eliminar.
   */
  const eliminarProfesor = (profesor) => {
    setNotificacion({
      mensaje: `¿Seguro que deseas eliminar a ${profesor.apellido_nombres}?`,
      tipo: "confirmacion",
      onConfirm: async () => {
        try {
          const res = await fetch(`http://localhost:3001/profesores/${profesor.id}`, {
            method: "DELETE",
          });
          if (!res.ok) throw new Error("Error al eliminar");
          await fetchProfesores();
          showNotificacion("Profesor eliminado correctamente", "success");
        } catch (err) {
          console.error("Error eliminando profesor:", err);
          showNotificacion("Error al eliminar profesor", "error");
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
   * Maneja el cierre de sesión, actualizando el estado y redirigiendo al login.
   */
  const handleLogout = () => {
    setIsLoggedIn(false);
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
                  <Route path="menu" element={<Menu onLogout={handleLogout} />} />
                  <Route
                    path="profesores/formulario"
                    element={
                      <ProfesorForm
                        onSubmit={guardarProfesor}
                        initialData={editando}
                        onCancelEdit={() => setEditando(null)}
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

      <Notificacion
        mensaje={notificacion?.mensaje}
        tipo={notificacion?.tipo}
        onConfirm={notificacion?.onConfirm}
        onCancel={notificacion?.onCancel}
      />
    </>
  );
}