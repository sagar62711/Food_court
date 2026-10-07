const CART_KEY = "food_court_cart";
export const CART_EVENT = "cart-changed";

function readCart() {
  return JSON.parse(localStorage.getItem(CART_KEY)) ?? [];
}

function writeCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_EVENT));
}

export function getCart() {
  return readCart();
}

export function cartCount() {
  return readCart().reduce((total, item) => total + item.quantity, 0);
}

export function addToCart(product, shop) {
  const cart = readCart();
  const existing = cart.find((item) => item.productId === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      shopId: shop.id,
      shopName: shop.name,
      quantity: 1,
    });
  }
  writeCart(cart);
}

export function changeQuantity(productId, change) {
  const cart = readCart()
    .map((item) => (item.productId === productId ? { ...item, quantity: item.quantity + change } : item))
    .filter((item) => item.quantity > 0);
  writeCart(cart);
}

export function removeFromCart(productId) {
  writeCart(readCart().filter((item) => item.productId !== productId));
}

export function clearCart() {
  writeCart([]);
}
