import "../styles/Button.css";

export default function Button({ children, onClick, color = "blue" }) {
  return (
    <button onClick={onClick} className={`btn ${color}`}>
      {children}
    </button>
  );
}
