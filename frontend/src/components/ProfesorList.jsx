import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "./Button";
import "../styles/ProfesorList.css";

export default function ProfesorList({ profesores, onEdit, onDelete }) {
  const [search, setSearch] = useState("");

  const formatShortDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    // Asegurarse de que la fecha es UTC para evitar problemas de zona horaria
    return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()).toLocaleDateString();
  };

  const filteredProfesores = profesores.filter(
    (p) =>
      p.apellido_nombres.toLowerCase().includes(search.toLowerCase()) ||
      p.documento_n.toLowerCase().includes(search.toLowerCase()) ||
      p.cargo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app-container">
      <h1 className="app-title">Profesores Cargados</h1>
      <div className="list-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="🔍 Buscar por nombre, documento o cargo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
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
              <tr key={p.id}>
                <td>{p.apellido_nombres}</td>
                <td>{p.documento_n}</td>
                <td>{p.cargo}</td>
                <td>{formatShortDate(p.toma_posesion)}</td>
                <td>{formatShortDate(p.fecha_nacimiento)}</td>
                <td className="actions">
                  <Button color="yellow" onClick={() => onEdit(p)}>
                    Editar
                  </Button>
                  <Button color="red" onClick={() => onDelete(p)}>
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
          <div key={p.id} className="profesor-card">
            <div className="card-header">
              <h3>{p.apellido_nombres}</h3>
              <span className="profesor-id">ID: {p.id}</span>
            </div>

            <div className="card-content">
              <p><strong>Documento:</strong> {p.documento_n}</p>
              <p><strong>Cargo:</strong> {p.cargo}</p>
              <p><strong>Toma de Posesión:</strong> {formatShortDate(p.toma_posesion)}</p>
              <p><strong>Nacimiento:</strong> {formatShortDate(p.fecha_nacimiento)}</p>
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
    </div>
  );
}