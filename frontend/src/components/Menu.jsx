import { Link } from "react-router-dom";
import Button from "./Button";
import "../styles/App.css";

export default function Menu({ onLogout }) {
  return (
    <div className="app-container">
      <h1 className="app-title">Menú Principal</h1>
      <div className="menu-options">
        <Link to="/profesores/formulario">
          <Button color="blue" className="menu-button">
            Cargar Profesores
          </Button>
        </Link>
        <Link to="/profesores">
          <Button color="blue" className="menu-button">
            Ver Profesores Cargados
          </Button>
        </Link>
        <Button color="danger" onClick={onLogout} className="menu-button">
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
}