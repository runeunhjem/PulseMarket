import BACKEND_URL from "./backendUrl.js";

export async function fetchWithAuth(endpoint, options = {}) {
  const token = sessionStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const url = endpoint.startsWith("http") ? endpoint : `${BACKEND_URL}${endpoint}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const contentType = res.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");
    const body = isJson ? await res.json().catch(() => ({})) : {};

    if (!res.ok) {
      const message = body?.message || `HTTP ${res.status} - ${res.statusText}`;
      throw new Error(message);
    }

    return body;
  } catch (err) {
    console.error("❌ fetchWithAuth error:", err.message);
    throw err;
  }
}
