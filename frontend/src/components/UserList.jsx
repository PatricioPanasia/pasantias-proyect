import { useState } from "react";
import Button from "./Button";
import "../styles/UserList.css";

export default function UserList({ usuarios, onEdit, onDelete }) {
  const [search, setSearch] = useState("");

  // Filtrar usuarios por nombre, apellido o email
  const filteredUsers = usuarios.filter(
    (u) =>
      u.nombre.toLowerCase().includes(search.toLowerCase()) ||
      u.apellido.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="users-container">
      {/* Barra de búsqueda */}
      <div className="search-container">
        <input
          type="text"
          placeholder="🔍 Buscar por nombre, apellido o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Vista de tabla para desktop */}
      <div className="table-view">
        <table className="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Dirección</th>
              <th>Teléfono</th>
              <th>Celular</th>
              <th>Cel. País</th>
              <th>Fecha Nac.</th>
              <th>Email</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.nombre}</td>
                <td>{u.apellido}</td>
                <td>{u.direccion}</td>
                <td>{u.telefono}</td>
                <td>{u.celular}</td>
                <td>{u.celular_pais}</td>
                <td>{new Date(u.fecha_nacimiento).toLocaleDateString()}</td>
                <td>{u.email.toLowerCase()}</td>
                <td className="actions">
                  <Button color="yellow" onClick={() => onEdit(u)}>
                    Editar
                  </Button>
                  <Button color="red" onClick={() => onDelete(u)}>
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
        {filteredUsers.map((u) => (
          <div key={u.id} className="user-card">
            <div className="card-header">
              <h3>
                {u.nombre} {u.apellido}
              </h3>
              <span className="user-id">ID: {u.id}</span>
            </div>

            <div className="card-content">
              <div className="info-row">
                <span className="label">📧 Email:</span>
                <span className="value">{u.email.toLowerCase()}</span>
              </div>
              <div className="info-row">
                <span className="label">📞 Tel:</span>
                <span className="value">{u.telefono}</span>
              </div>
              <div className="info-row">
                <span className="label">📱 Cel:</span>
                <span className="value">{u.celular}</span>
              </div>
              <div className="info-row">
                <span className="label">🌎 Cel. País:</span>
                <span className="value">{u.celular_pais}</span>
              </div>
              <div className="info-row">
                <span className="label">🏠 Dirección:</span>
                <span className="value">{u.direccion}</span>
              </div>
              <div className="info-row">
                <span className="label">🎂 Nacimiento:</span>
                <span className="value">
                  {new Date(u.fecha_nacimiento).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="card-actions">
              <Button color="yellow" onClick={() => onEdit(u)} small>
                Editar
              </Button>
              <Button color="red" onClick={() => onDelete(u)} small>
                Eliminar
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
