import { useState, useEffect } from "react";
import Button from "./Button";
import "../styles/EstadoProfesorForm.css";

export default function EstadoProfesorForm({
  profesor,
  estados,
  estadoActual,
  onSubmit,
  onCancel,
}) {
  const [form, setForm] = useState({
    estado_id: "",
    fecha_inicio: new Date().toISOString().split("T")[0],
    fecha_fin: "",
    motivo: "",
    observaciones: "",
    documento_referencia: "",
  });

  const [estadoSeleccionado, setEstadoSeleccionado] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (form.estado_id) {
      const estado = estados.find((e) => e.id === parseInt(form.estado_id));
      setEstadoSeleccionado(estado);
    }
  }, [form.estado_id, estados]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Limpiar error del campo
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.estado_id) {
      newErrors.estado_id = "Debe seleccionar un estado";
    }

    if (!form.fecha_inicio) {
      newErrors.fecha_inicio = "La fecha de inicio es obligatoria";
    }

    if (estadoSeleccionado?.requiere_detalles && !form.motivo) {
      newErrors.motivo = "Este estado requiere especificar el motivo";
    }

    if (form.fecha_fin && form.fecha_inicio && new Date(form.fecha_fin) <= new Date(form.fecha_inicio)) {
      newErrors.fecha_fin = "La fecha fin debe ser posterior a la fecha de inicio";
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(form);
  };

  return (
    <div className="estado-form-overlay">
      <div className="estado-form-container">
        <div className="estado-form-header">
          <h2>Cambiar Estado</h2>
          <p className="profesor-name">{profesor.apellido_nombres}</p>
          {estadoActual && (
            <div className="estado-actual-badge">
              <span>Estado actual: </span>
              <span
                className="badge"
                style={{ backgroundColor: estadoActual.estado_color }}
              >
                {estadoActual.estado_nombre}
              </span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="estado-form">
          <div className="form-grid">
            {/* Selección de Estado */}
            <div className="form-field full-width">
              <label htmlFor="estado_id">
                Nuevo Estado <span className="required">*</span>
              </label>
              <select
                id="estado_id"
                name="estado_id"
                value={form.estado_id}
                onChange={handleChange}
                className={errors.estado_id ? "error" : ""}
              >
                <option value="">-- Seleccione un estado --</option>
                {estados.map((estado) => (
                  <option key={estado.id} value={estado.id}>
                    {estado.nombre}
                  </option>
                ))}
              </select>
              {errors.estado_id && (
                <span className="error-message">{errors.estado_id}</span>
              )}
              {estadoSeleccionado && (
                <div
                  className="estado-preview"
                  style={{ borderLeftColor: estadoSeleccionado.color }}
                >
                  <div
                    className="color-indicator"
                    style={{ backgroundColor: estadoSeleccionado.color }}
                  ></div>
                  <div className="estado-info">
                    <p className="estado-descripcion">
                      {estadoSeleccionado.descripcion}
                    </p>
                    {estadoSeleccionado.requiere_detalles && (
                      <p className="estado-warning">
                        ⚠️ Este estado requiere información adicional
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Fecha de Inicio */}
            <div className="form-field">
              <label htmlFor="fecha_inicio">
                Fecha de Inicio <span className="required">*</span>
              </label>
              <input
                type="date"
                id="fecha_inicio"
                name="fecha_inicio"
                value={form.fecha_inicio}
                onChange={handleChange}
                className={errors.fecha_inicio ? "error" : ""}
              />
              {errors.fecha_inicio && (
                <span className="error-message">{errors.fecha_inicio}</span>
              )}
            </div>

            {/* Fecha de Fin (opcional) */}
            <div className="form-field">
              <label htmlFor="fecha_fin">
                Fecha de Fin{" "}
                <span className="optional">(Solo si es temporal)</span>
              </label>
              <input
                type="date"
                id="fecha_fin"
                name="fecha_fin"
                value={form.fecha_fin}
                onChange={handleChange}
                min={form.fecha_inicio}
                className={errors.fecha_fin ? "error" : ""}
              />
              {errors.fecha_fin && (
                <span className="error-message">{errors.fecha_fin}</span>
              )}
              {form.fecha_fin && form.fecha_inicio && (
                <span className="helper-text">
                  Duración:{" "}
                  {Math.ceil(
                    (new Date(form.fecha_fin) - new Date(form.fecha_inicio)) /
                      (1000 * 60 * 60 * 24)
                  )}{" "}
                  días
                </span>
              )}
            </div>

            {/* Motivo/Justificación */}
            <div className="form-field full-width">
              <label htmlFor="motivo">
                Motivo/Justificación{" "}
                {estadoSeleccionado?.requiere_detalles && (
                  <span className="required">*</span>
                )}
              </label>
              <textarea
                id="motivo"
                name="motivo"
                value={form.motivo}
                onChange={handleChange}
                placeholder="Describa el motivo del cambio de estado..."
                rows="3"
                className={errors.motivo ? "error" : ""}
              />
              {errors.motivo && (
                <span className="error-message">{errors.motivo}</span>
              )}
            </div>

            {/* Documento de Referencia */}
            <div className="form-field">
              <label htmlFor="documento_referencia">
                Documento de Referencia <span className="optional">(Opcional)</span>
              </label>
              <input
                type="text"
                id="documento_referencia"
                name="documento_referencia"
                value={form.documento_referencia}
                onChange={handleChange}
                placeholder="EXP-2024-001, RES-123, etc."
              />
            </div>

            {/* Observaciones */}
            <div className="form-field">
              <label htmlFor="observaciones">
                Observaciones <span className="optional">(Opcional)</span>
              </label>
              <textarea
                id="observaciones"
                name="observaciones"
                value={form.observaciones}
                onChange={handleChange}
                placeholder="Notas adicionales..."
                rows="3"
              />
            </div>
          </div>

          <div className="form-actions">
            <Button type="button" color="gray" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" color="blue">
              Cambiar Estado
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
