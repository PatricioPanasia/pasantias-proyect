import "../styles/Notificacion.css";

export default function Notificacion({ mensaje, tipo, onConfirm, onCancel }) {
  if (!mensaje) return null;

  const getIcon = () => {
    switch (tipo) {
      case "error": return "❌";
      case "success": return "✅";
      case "info": return "ℹ️";
      default: return "❓";
    }
  };

  return (
    <div className="noti-overlay">
      <div className="noti-box">
        <div className="noti-icon">{getIcon()}</div>
        <p>{mensaje}</p>
        <div className="buttons">
          {onConfirm && (
            <button className="confirm" onClick={onConfirm}>
              Confirmar
            </button>
          )}
          {onCancel && (
            <button className="cancel" onClick={onCancel}>
              Cancelar
            </button>
          )}
          {!onConfirm && !onCancel && (
            <button className="confirm" onClick={onCancel}>
              Aceptar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}