import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Button from "./Button";
import DetalleProfesor from "./DetalleProfesor";
import "../styles/ProfesorList.css";

export default function ProfesorList({
  profesores,
  onEdit,
  onDelete,
  onCambiarEstado,
  onFinalizarEstado,
  onVerDetalle,
}) {
  const [search, setSearch] = useState("");
  const [profesorDetalle, setProfesorDetalle] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Cerrar dropdown de filtros al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      const searchContainer = document.querySelector('.search-container');
      if (mostrarFiltros && searchContainer && !searchContainer.contains(event.target)) {
        setMostrarFiltros(false);
      }
    };

    if (mostrarFiltros) {
      document.addEventListener('click', handleClickOutside);
    }
    
    return () => document.removeEventListener('click', handleClickOutside);
  }, [mostrarFiltros]);

  // Actualizar el profesor en el modal cuando cambia la lista de profesores
  useEffect(() => {
    if (profesorDetalle) {
      const profesorActualizado = profesores.find(
        (p) => p.id === profesorDetalle.id
      );
      if (profesorActualizado) {
        setProfesorDetalle(profesorActualizado);
      }
    }
  }, [profesores]);

  // Obtener lista única de estados presentes
  const estadosUnicos = [
    ...new Map(
      profesores
        .filter((p) => p.estado_nombre)
        .map((p) => [p.estado_nombre, { nombre: p.estado_nombre, color: p.estado_color }])
    ).values(),
  ];

  const formatShortDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    // Asegurarse de que la fecha es UTC para evitar problemas de zona horaria
    return new Date(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate()
    ).toLocaleDateString();
  };

  const filteredProfesores = profesores.filter((p) => {
    // Filtro de búsqueda por texto
    const matchesSearch =
      p.apellido_nombres.toLowerCase().includes(search.toLowerCase()) ||
      p.documento_n.toLowerCase().includes(search.toLowerCase()) ||
      p.cargo.toLowerCase().includes(search.toLowerCase());

    // Filtro por estado
    let matchesEstado = true;
    if (filtroEstado === "sin-estado") {
      matchesEstado = !p.estado_nombre;
    } else if (filtroEstado !== "todos") {
      matchesEstado = p.estado_nombre === filtroEstado;
    }

    return matchesSearch && matchesEstado;
  });

  const handleVerDetalle = (profesor) => {
    setProfesorDetalle(profesor);
    if (onVerDetalle) onVerDetalle(profesor);
  };

  const handleCloseDetalle = () => {
    setProfesorDetalle(null);
  };

  return (
    <div className="app-container">
      <h1 className="app-title">Profesores Cargados</h1>
      <div className="list-controls">
        <div className="search-container">
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="🔍 Buscar por nombre, documento o cargo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            <button
              className="filter-toggle"
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              title="Filtrar por estado"
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
            </button>
          </div>

          {mostrarFiltros && (
            <div className="filtros-dropdown">
              <div className="filtro-header">
                <span>Filtrar por estado:</span>
                {filtroEstado !== "todos" && (
                  <button
                    className="limpiar-filtro"
                    onClick={() => setFiltroEstado("todos")}
                  >
                    Limpiar
                  </button>
                )}
              </div>
              <div className="filtros-lista">
                <button
                  className={`filtro-item ${filtroEstado === "todos" ? "active" : ""}`}
                  onClick={() => setFiltroEstado("todos")}
                >
                  <span className="filtro-count">({profesores.length})</span>
                  <span className="filtro-nombre">Todos los profesores</span>
                </button>

                <button
                  className={`filtro-item ${filtroEstado === "sin-estado" ? "active" : ""}`}
                  onClick={() => setFiltroEstado("sin-estado")}
                >
                  <span className="filtro-count">
                    ({profesores.filter((p) => !p.estado_nombre).length})
                  </span>
                  <span className="filtro-nombre sin-estado-text">Sin estado asignado</span>
                </button>

                <div className="filtros-divider"></div>

                {estadosUnicos.map((estado) => (
                  <button
                    key={estado.nombre}
                    className={`filtro-item ${filtroEstado === estado.nombre ? "active" : ""}`}
                    onClick={() => setFiltroEstado(estado.nombre)}
                  >
                    <div
                      className="filtro-indicator"
                      style={{ backgroundColor: estado.color }}
                    ></div>
                    <span className="filtro-count">
                      ({profesores.filter((p) => p.estado_nombre === estado.nombre).length})
                    </span>
                    <span className="filtro-nombre">{estado.nombre}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <Link to="/menu">
          <Button color="gray">Volver al Menú</Button>
        </Link>
      </div>

      {/* Vista de tabla para desktop */}
      <div className="table-view">
        <table className="profesor-table">
          <thead>
            <tr>
              <th>Estado</th>
              <th>Apellido y Nombres</th>
              <th>Documento</th>
              <th>Cargo Principal</th>
              <th>Toma de Posesión</th>
              <th>Fecha Nacimiento</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProfesores.map((p) => (
              <tr
                key={p.id}
                className="clickable-row"
              >
                <td onClick={() => handleVerDetalle(p)}>
                  {p.estado_color && p.estado_nombre ? (
                    <div className="estado-badge-container">
                      <div
                        className="estado-indicator"
                        style={{ backgroundColor: p.estado_color }}
                        title={p.estado_nombre}
                      ></div>
                      <span className="estado-nombre">{p.estado_nombre}</span>
                    </div>
                  ) : (
                    <span className="sin-estado">Sin estado</span>
                  )}
                </td>
                <td onClick={() => handleVerDetalle(p)}>{p.apellido_nombres}</td>
                <td onClick={() => handleVerDetalle(p)}>{p.documento_n}</td>
                <td onClick={() => handleVerDetalle(p)}>{p.cargo}</td>
                <td onClick={() => handleVerDetalle(p)}>{formatShortDate(p.toma_posesion)}</td>
                <td onClick={() => handleVerDetalle(p)}>{formatShortDate(p.fecha_nacimiento)}</td>
                <td className="actions">
                  <Button color="yellow" onClick={() => onEdit(p)} small>
                    Editar
                  </Button>
                  <Button color="red" onClick={() => onDelete(p)} small>
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Vista de cards para móviles */}
      <div className="cards-view">
        {filteredProfesores.map((p) => (
          <div
            key={p.id}
            className="profesor-card"
          >
            <div
              className="card-estado-bar"
              style={{ backgroundColor: p.estado_color || 'var(--border-color)' }}
            ></div>

            {p.estado_color && p.estado_nombre ? (
              <div className="card-estado-badge">
                <div
                  className="estado-indicator"
                  style={{ backgroundColor: p.estado_color }}
                ></div>
                <span className="estado-nombre">{p.estado_nombre}</span>
              </div>
            ) : (
              <div className="card-estado-badge sin-estado">
                Sin estado asignado
              </div>
            )}

            <div className="card-header" onClick={() => handleVerDetalle(p)}>
              <h3>{p.apellido_nombres}</h3>
              <span className="profesor-id">ID: {p.id}</span>
            </div>

            <div className="card-content" onClick={() => handleVerDetalle(p)}>
              <p>
                <strong>Documento:</strong> {p.documento_n}
              </p>
              <p>
                <strong>Cargo:</strong> {p.cargo}
              </p>
              <p>
                <strong>Toma de Posesión:</strong>{" "}
                {formatShortDate(p.toma_posesion)}
              </p>
              <p>
                <strong>Nacimiento:</strong>{" "}
                {formatShortDate(p.fecha_nacimiento)}
              </p>
            </div>

            <div className="card-actions">
              <Button color="yellow" onClick={() => onEdit(p)} small>
                Editar
              </Button>
              <Button color="red" onClick={() => onDelete(p)} small>
                Eliminar
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredProfesores.length === 0 && (
        <p className="no-results">No se encontraron profesores.</p>
      )}

      {/* Modal de Detalle del Profesor */}
      {profesorDetalle && (
        <DetalleProfesor
          profesor={profesorDetalle}
          onClose={handleCloseDetalle}
          onCambiarEstado={onCambiarEstado}
          onFinalizarEstado={onFinalizarEstado}
        />
      )}
    </div>
  );
}
