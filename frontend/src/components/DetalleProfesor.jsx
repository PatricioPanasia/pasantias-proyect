import { useState, useEffect, useCallback } from "react";
import Button from "./Button";
import { apiFetch, API_ENDPOINTS } from "../config/api";
import "../styles/DetalleProfesor.css";

export default function DetalleProfesor({
  profesor,
  onClose,
  onCambiarEstado,
  onFinalizarEstado,
}) {
  const [estadoActual, setEstadoActual] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEstadoActual = useCallback(async () => {
    try {
      const data = await apiFetch(API_ENDPOINTS.ESTADO_ACTUAL(profesor.id));
      setEstadoActual(data);
    } catch (error) {
      console.error("Error al obtener estado actual:", error);
    }
  }, [profesor.id]);

  const fetchHistorial = useCallback(async () => {
    try {
      const data = await apiFetch(API_ENDPOINTS.HISTORIAL_ESTADOS(profesor.id));
      setHistorial(data);
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener historial:", error);
      setLoading(false);
    }
  }, [profesor.id]);

  useEffect(() => {
    fetchEstadoActual();
    fetchHistorial();
  }, [fetchEstadoActual, fetchHistorial]);

  // Efecto adicional para escuchar cambios en el profesor completo
  useEffect(() => {
    if (profesor.estado_color || profesor.estado_nombre) {
      fetchEstadoActual();
      fetchHistorial();
    }
  }, [profesor.estado_color, profesor.estado_nombre, fetchEstadoActual, fetchHistorial]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("es-AR");
  };

  const getDiasRestantes = (fechaFin) => {
    if (!fechaFin) return null;
    const hoy = new Date();
    const fin = new Date(fechaFin);
    const diffTime = fin - hoy;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleFinalizarEstado = () => {
    if (
      confirm(
        `¿Está seguro de finalizar el estado actual de ${profesor.apellido_nombres}?`
      )
    ) {
      onFinalizarEstado(profesor.id);
    }
  };

  return (
    <div className="detalle-overlay" onClick={onClose}>
      <div className="detalle-container" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          ✕
        </button>

        {/* Cabecera con información del profesor */}
        <div className="detalle-header">
          <h2>{profesor.apellido_nombres}</h2>
          <p className="documento">DNI: {profesor.documento_n}</p>
        </div>

        {/* Estado Actual */}
        <div className="detalle-section">
          <h3>Estado Actual</h3>
          {estadoActual ? (
            <div className="estado-actual-card">
              <div className="estado-badge-large">
                <div
                  className="color-bar"
                  style={{ backgroundColor: estadoActual.estado_color }}
                ></div>
                <div className="estado-content">
                  <h4>{estadoActual.estado_nombre}</h4>
                  <div className="estado-detalles">
                    <div className="detalle-row">
                      <span className="label">Desde:</span>
                      <span className="value">
                        {formatDate(estadoActual.fecha_inicio)}
                      </span>
                    </div>
                    {estadoActual.fecha_fin && (
                      <>
                        <div className="detalle-row">
                          <span className="label">Hasta:</span>
                          <span className="value">
                            {formatDate(estadoActual.fecha_fin)}
                          </span>
                        </div>
                        <div className="detalle-row">
                          <span className="label">Días restantes:</span>
                          <span
                            className={`value ${
                              estadoActual.dias_restantes < 0
                                ? "vencido"
                                : estadoActual.dias_restantes <= 7
                                ? "proximo"
                                : ""
                            }`}
                          >
                            {estadoActual.dias_restantes >= 0
                              ? `${estadoActual.dias_restantes} días`
                              : "Vencido"}
                          </span>
                        </div>
                      </>
                    )}
                    {estadoActual.motivo && (
                      <div className="detalle-row full">
                        <span className="label">Motivo:</span>
                        <span className="value">{estadoActual.motivo}</span>
                      </div>
                    )}
                    {estadoActual.observaciones && (
                      <div className="detalle-row full">
                        <span className="label">Observaciones:</span>
                        <span className="value">
                          {estadoActual.observaciones}
                        </span>
                      </div>
                    )}
                    {estadoActual.documento_referencia && (
                      <div className="detalle-row">
                        <span className="label">Documento:</span>
                        <span className="value">
                          {estadoActual.documento_referencia}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="estado-actions">
                <Button color="blue" onClick={() => onCambiarEstado(profesor)}>
                  Cambiar Estado
                </Button>
                {estadoActual.fecha_fin && (
                  <Button color="green" onClick={handleFinalizarEstado}>
                    Finalizar Estado
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="sin-estado">
              <p>Este profesor no tiene un estado asignado</p>
              <Button color="blue" onClick={() => onCambiarEstado(profesor)}>
                Asignar Estado
              </Button>
            </div>
          )}
        </div>

        {/* Información General del Profesor */}
        <div className="detalle-section">
          <h3>Información General</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Cargo Principal:</span>
              <span className="value">{profesor.cargo}</span>
            </div>
            {profesor.cargo_titular && (
              <div className="info-item">
                <span className="label">Cargo Titular:</span>
                <span className="value">{profesor.cargo_titular}</span>
              </div>
            )}
            {profesor.cargo_provisional && (
              <div className="info-item">
                <span className="label">Cargo Provisional:</span>
                <span className="value">{profesor.cargo_provisional}</span>
              </div>
            )}
            {profesor.cargo_interino && (
              <div className="info-item">
                <span className="label">Cargo Interino:</span>
                <span className="value">{profesor.cargo_interino}</span>
              </div>
            )}
            {profesor.cargo_suplente && (
              <div className="info-item">
                <span className="label">Cargo Suplente:</span>
                <span className="value">{profesor.cargo_suplente}</span>
              </div>
            )}
            <div className="info-item">
              <span className="label">Fecha de Nacimiento:</span>
              <span className="value">
                {formatDate(profesor.fecha_nacimiento)}
              </span>
            </div>
            <div className="info-item">
              <span className="label">Toma de Posesión:</span>
              <span className="value">
                {formatDate(profesor.toma_posesion)}
              </span>
            </div>
            {profesor.cupof && (
              <div className="info-item">
                <span className="label">CUPOF:</span>
                <span className="value">{profesor.cupof}</span>
              </div>
            )}
            {profesor.foja_n && (
              <div className="info-item">
                <span className="label">Foja N°:</span>
                <span className="value">{profesor.foja_n}</span>
              </div>
            )}
            {profesor.encargado_lab_especialidad && (
              <div className="info-item full">
                <span className="label">Encargado Lab/Especialidad:</span>
                <span className="value">
                  {profesor.encargado_lab_especialidad}
                </span>
              </div>
            )}
            {profesor.actos_administrativos && (
              <div className="info-item full">
                <span className="label">Actos Administrativos:</span>
                <span className="value">{profesor.actos_administrativos}</span>
              </div>
            )}
          </div>
        </div>

        {/* Historial de Estados */}
        <div className="detalle-section">
          <h3>Historial de Estados</h3>
          {loading ? (
            <p>Cargando historial...</p>
          ) : historial.length > 0 ? (
            <div className="historial-timeline">
              {historial.map((item, index) => (
                <div
                  key={item.id}
                  className={`timeline-item ${item.activo ? "active" : ""}`}
                >
                  <div
                    className="timeline-marker"
                    style={{ backgroundColor: item.estado_color }}
                  ></div>
                  <div className="timeline-content">
                    <h4>{item.estado_nombre}</h4>
                    <p className="timeline-dates">
                      {formatDate(item.fecha_inicio)}
                      {item.fecha_fin && ` - ${formatDate(item.fecha_fin)}`}
                      {item.activo && " - Actual"}
                    </p>
                    {item.motivo && (
                      <p className="timeline-motivo">{item.motivo}</p>
                    )}
                    {item.estado_anterior_nombre && (
                      <p className="timeline-anterior">
                        Desde: {item.estado_anterior_nombre}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-historial">
              No hay historial de estados registrado
            </p>
          )}
        </div>

        <div className="detalle-footer">
          <Button color="gray" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}
