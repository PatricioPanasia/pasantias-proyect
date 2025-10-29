const API_URL = "http://localhost:3001";

export async function getUsuarios() {
  const res = await fetch(`${API_URL}/usuarios`);
  return res.json();
}

export async function addUsuario(usuario) {
  const res = await fetch(`${API_URL}/usuarios`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(usuario),
  });
  return res.json();
}

export async function updateUsuario(id, usuario) {
  const res = await fetch(`${API_URL}/usuarios/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(usuario),
  });
  return res.json();
}

export async function deleteUsuario(id) {
  const res = await fetch(`${API_URL}/usuarios/${id}`, {
    method: "DELETE",
  });
  return res.json();
}
