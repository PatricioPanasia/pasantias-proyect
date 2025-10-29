import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  user: "root", // cambia si tu usuario es distinto
  password: "", // pon tu contraseña si tienes
  database: "node_project", // nombre de tu BD
});

export default pool;
