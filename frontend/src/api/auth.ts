const API_URL = "http://localhost:8000";

export async function register(data: { email: string; password: string }) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.detail || json?.message || "Register failed");
  return json;
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.detail || json?.message || "Login failed");
  return json;
}
