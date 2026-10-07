import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { placeOrder } from "../api.js";
import { CART_EVENT, changeQuantity, clearCart, getCart, removeFromCart } from "../cart.js";

export default function CartPage() {
  const [items, setItems] = useState(getCart());
  const [customerName, setCustomerName] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [placedOrder, setPlacedOrder] = useState(null);

  useEffect(() => {
    const refresh = () => setItems(getCart());
    window.addEventListener(CART_EVENT, refresh);
    return () => window.removeEventListener(CART_EVENT, refresh);
  }, []);

  async function handlePlaceOrder(event) {
    event.preventDefault();
    setError("");

    const table = Number(tableNumber);
    if (!customerName.trim() || !Number.isInteger(table) || table < 1) {
      setError("Enter your name and a table number (1 or more).");
      return;
    }

    setSubmitting(true);
    try {
      const order = await placeOrder({
        customer_name: customerName.trim(),
        table_number: table,
        items: items.map((item) => ({ product_id: item.productId, quantity: item.quantity })),
      });
      clearCart();
      setPlacedOrder(order);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (placedOrder) {
    return (
      <>
        <h1>Order placed</h1>
        <div className="notice-box">
          <p>
            Thank you, {placedOrder.customer_name}! Your order <strong>{placedOrder.order_number}</strong> for table{" "}
            {placedOrder.table_number} is placed. Total: {placedOrder.total.toFixed(2)}
          </p>
        </div>
        <p>
          <Link to="/">Order from another shop</Link>
        </p>
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <h1>Your cart</h1>
        <p>
          Your cart is empty. <Link to="/">Browse shops</Link> to add some food.
        </p>
      </>
    );
  }

  const byShop = Object.values(
    items.reduce((groups, item) => {
      if (!groups[item.shopId]) groups[item.shopId] = { name: item.shopName, items: [] };
      groups[item.shopId].items.push(item);
      return groups;
    }, {})
  );

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <>
      <h1>Your cart</h1>

      {byShop.map((group) => (
        <section key={group.name}>
          <h2>{group.name}</h2>
          <div className="product-list">
            {group.items.map((item) => (
              <div key={item.productId} className="card row">
                <div className="row-info">
                  <strong>{item.name}</strong>
                  <div className="cuisine">{item.price.toFixed(2)} each</div>
                </div>
                <div className="row-actions">
                  <div className="qty">
                    <button className="secondary" onClick={() => changeQuantity(item.productId, -1)}>
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button className="secondary" onClick={() => changeQuantity(item.productId, 1)}>
                      +
                    </button>
                  </div>
                  <span className="price">{(item.price * item.quantity).toFixed(2)}</span>
                  <button className="danger" onClick={() => removeFromCart(item.productId)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <div className="cart-footer">
        <p className="cart-total">Total: {total.toFixed(2)}</p>
        <button className="secondary" onClick={clearCart}>
          Clear cart
        </button>
      </div>

      <form className="form-card card" onSubmit={handlePlaceOrder}>
        <h2>Place order</h2>

        <label>
          Your name
          <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
        </label>

        <label>
          Table number
          <input
            type="number"
            min="1"
            step="1"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
          />
        </label>

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? "Placing order..." : "Place order"}
        </button>
      </form>

      <p className="cuisine">
        Prices are the ones shown when you added the items. No payment is taken.
      </p>
    </>
  );
}
