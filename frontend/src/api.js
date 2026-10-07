import { clearToken, getToken } from "./auth.js";

const API_URL = "http://localhost:8000";

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) headers["Authorization"] = `Bearer ${getToken()}`;

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401 && auth) {
    clearToken();
    window.location.href = "/login";
    throw new Error("Your session has expired. Please log in again.");
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const errorBody = await response.json();
      if (typeof errorBody.detail === "string") message = errorBody.detail;
      else message = "Please check the form values and try again.";
    } catch {
      // keep the default message
    }
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

export function login(username, password) {
  return request("/api/auth/login", { method: "POST", body: { username, password } });
}

export function fetchShops() {
  return request("/api/shops");
}

export function fetchShopProducts(shopId) {
  return request(`/api/shops/${shopId}/products`);
}

export function fetchOwnerProducts() {
  return request("/api/owner/products", { auth: true });
}

export function createProduct(data) {
  return request("/api/owner/products", { method: "POST", body: data, auth: true });
}

export function updateProduct(productId, data) {
  return request(`/api/owner/products/${productId}`, { method: "PUT", body: data, auth: true });
}

export function deleteProduct(productId) {
  return request(`/api/owner/products/${productId}`, { method: "DELETE", auth: true });
}

export function toggleProductAvailability(productId) {
  return request(`/api/owner/products/${productId}/toggle-availability`, {
    method: "POST",
    auth: true,
  });
}

export function fetchAdminShops() {
  return request("/api/admin/shops", { auth: true });
}

export function createShop(data) {
  return request("/api/admin/shops", { method: "POST", body: data, auth: true });
}

export function updateShop(shopId, data) {
  return request(`/api/admin/shops/${shopId}`, { method: "PUT", body: data, auth: true });
}

export function deleteShop(shopId) {
  return request(`/api/admin/shops/${shopId}`, { method: "DELETE", auth: true });
}

export function createShopOwner(shopId, data) {
  return request(`/api/admin/shops/${shopId}/owner`, { method: "POST", body: data, auth: true });
}

export function placeOrder(data) {
  return request("/api/orders", { method: "POST", body: data });
}

export function fetchOwnerOrders() {
  return request("/api/owner/orders", { auth: true });
}
