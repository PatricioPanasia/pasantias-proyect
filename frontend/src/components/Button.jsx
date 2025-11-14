import "../styles/Button.css";

export default function Button({ children, onClick, color = "blue", type = "button", small = false }) {
  return (
    <button 
      type={type}
      onClick={onClick} 
      className={`btn ${color} ${small ? 'btn-small' : ''}`}
    >
      {children}
    </button>
  );
}
