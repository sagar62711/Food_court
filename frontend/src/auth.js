const TOKEN_KEY = "food_court_token";

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// Reads the payload of the JWT for display only. The backend still verifies the signature on every request.
function decodePayload(token) {
  const payload = token.split(".")[1];
  return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
}

export function getUser() {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = decodePayload(token);
    if (payload.exp * 1000 < Date.now()) {
      clearToken();
      return null;
    }
    return { id: Number(payload.sub), role: payload.role, shopId: payload.shop_id };
  } catch {
    clearToken();
    return null;
  }
}

export function homePathFor(role) {
  return role === "admin" ? "/admin" : "/dashboard";
}
