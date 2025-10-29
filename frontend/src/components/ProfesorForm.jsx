import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./Button";
import "../styles/ProfesorForm.css";

const cargosDisponibles = [
  "Profesor Titular",
  "Profesor Asociado",
  "Profesor Adjunto",
  "Jefe de Trabajos Prácticos",
  "Ayudante de Primera",
];

const initialState = {
  cargo: cargosDisponibles[0],
  apellido_nombres: "",
  cargo_titular: "",
  cargo_provisional: "",
  cargo_interino: "",
  cargo_suplente: "",
  actos_administrativos: "",
  documento_n: "",
  cupof: "",
  foja_n: "",
  toma_posesion: "",
  encargado_lab_especialidad: "",
  fecha_nacimiento: "",
};

export default function ProfesorForm({ onSubmit, initialData, onCancelEdit, isEditing }) {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (isEditing && initialData) {
      // Formatear fechas para inputs tipo 'date'
      const fechaNac = initialData.fecha_nacimiento ? new Date(initialData.fecha_nacimiento).toISOString().split("T")[0] : "";
      const tomaPos = initialData.toma_posesion ? new Date(initialData.toma_posesion).toISOString().split("T")[0] : "";
      setForm({ ...initialData, fecha_nacimiento: fechaNac, toma_posesion: tomaPos });
    } else {
      setForm(initialState);
    }
  }, [initialData, isEditing]);

  const validateField = (name, value) => {
    switch (name) {
      case "apellido_nombres":
        if (!value.trim()) return "Apellido y Nombres son obligatorios.";
        if (value.length < 5) return "Debe tener al menos 5 caracteres.";
        return null;
      case "documento_n":
        if (!value.trim()) return "El Documento es obligatorio.";
        if (!/^[0-9]+$/.test(value)) return "Solo se permiten números.";
        return null;
      case "fecha_nacimiento":
        if (!value) return "La Fecha de Nacimiento es obligatoria.";
        return null;
      default:
        return null;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleCancel = () => {
    onCancelEdit();
    navigate("/profesores");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    Object.keys(form).forEach((key) => {
      const error = validateField(key, form[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(form);
  };

  return (
    <div className="app-container">
      <h1 className="app-title">{isEditing ? "Editar Profesor" : "Cargar Profesor"}</h1>
      <form onSubmit={handleSubmit} className="profesor-form">
        <div className="form-grid">
          {/* Columna Izquierda */}
          <div className="form-column">
            <div className="form-field">
              <label htmlFor="cargo">Cargos</label>
              <select id="cargo" name="cargo" value={form.cargo} onChange={handleChange}>
                {cargosDisponibles.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="apellido_nombres">Apellido y Nombres</label>
              <input type="text" id="apellido_nombres" name="apellido_nombres" value={form.apellido_nombres} onChange={handleChange} className={errors.apellido_nombres ? "error" : ""} />
              {errors.apellido_nombres && <span className="error-message">{errors.apellido_nombres}</span>}
            </div>

            <div className="form-field">
              <label>Cargos</label>
              <div className="form-row">
                <div className="form-field half-width">
                  <label htmlFor="cargo_titular">Cargo Titular</label>
                  <input type="text" id="cargo_titular" name="cargo_titular" value={form.cargo_titular} onChange={handleChange} />
                </div>
                <div className="form-field half-width">
                  <label htmlFor="cargo_provisional">Cargo Provisional</label>
                  <input type="text" id="cargo_provisional" name="cargo_provisional" value={form.cargo_provisional} onChange={handleChange} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-field half-width">
                  <label htmlFor="cargo_interino">Cargo Interino</label>
                  <input type="text" id="cargo_interino" name="cargo_interino" value={form.cargo_interino} onChange={handleChange} />
                </div>
                <div className="form-field half-width">
                  <label htmlFor="cargo_suplente">Cargo Suplente</label>
                  <input type="text" id="cargo_suplente" name="cargo_suplente" value={form.cargo_suplente} onChange={handleChange} />
                </div>
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="actos_administrativos">Actos Administrativos</label>
              <textarea id="actos_administrativos" name="actos_administrativos" value={form.actos_administrativos} onChange={handleChange}></textarea>
            </div>
          </div>

          {/* Columna Derecha */}
          <div className="form-column">
            <div className="form-row">
              <div className="form-field half-width">
                <label htmlFor="documento_n">Documento N°</label>
                <input type="text" id="documento_n" name="documento_n" value={form.documento_n} onChange={handleChange} className={errors.documento_n ? "error" : ""} />
                {errors.documento_n && <span className="error-message">{errors.documento_n}</span>}
              </div>
              <div className="form-field half-width">
                <label htmlFor="cupof">CUPOF</label>
                <input type="text" id="cupof" name="cupof" value={form.cupof} onChange={handleChange} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field half-width">
                <label htmlFor="foja_n">Foja N°</label>
                <input type="text" id="foja_n" name="foja_n" value={form.foja_n} onChange={handleChange} />
              </div>
              <div className="form-field half-width">
                <label htmlFor="toma_posesion">Toma de Posesión</label>
                <input type="date" id="toma_posesion" name="toma_posesion" value={form.toma_posesion} onChange={handleChange} />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="encargado_lab_especialidad">Encargado Laboratorio / Especialidad</label>
              <input type="text" id="encargado_lab_especialidad" name="encargado_lab_especialidad" value={form.encargado_lab_especialidad} onChange={handleChange} />
            </div>

            <div className="form-field">
              <label htmlFor="fecha_nacimiento">Fecha de Nacimiento</label>
              <input type="date" id="fecha_nacimiento" name="fecha_nacimiento" value={form.fecha_nacimiento} onChange={handleChange} className={errors.fecha_nacimiento ? "error" : ""} />
              {errors.fecha_nacimiento && <span className="error-message">{errors.fecha_nacimiento}</span>}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <Button type="button" color="gray" onClick={handleCancel}>
            {isEditing ? "Cancelar" : "Volver a la lista"}
          </Button>
          <Button type="submit" color="blue">
            {isEditing ? "Actualizar Profesor" : "Guardar Profesor"}
          </Button>
        </div>
      </form>
    </div>
  );
}