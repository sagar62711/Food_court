import { useEffect, useState } from "react";
import { fetchOwnerOrders } from "../api.js";

export default function OwnerOrders() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadOrders() {
    setError("");
    try {
      setItems(await fetchOwnerOrders());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  const orders = Object.values(
    items.reduce((groups, item) => {
      if (!groups[item.order_number]) {
        groups[item.order_number] = {
          orderNumber: item.order_number,
          customerName: item.customer_name,
          tableNumber: item.table_number,
          createdAt: item.created_at,
          items: [],
        };
      }
      groups[item.order_number].items.push(item);
      return groups;
    }, {})
  );

  return (
    <section>
      <div className="page-header">
        <h2>Orders</h2>
        <button className="secondary" onClick={loadOrders}>
          Refresh
        </button>
      </div>

      {error && <p className="error">{error}</p>}
      {loading && <p>Loading orders...</p>}
      {!loading && orders.length === 0 && <p>No orders yet.</p>}

      {orders.map((order) => {
        const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        // SQLite stores UTC without a timezone marker, so add one before showing local time.
        const time = new Date(order.createdAt.endsWith("Z") ? order.createdAt : `${order.createdAt}Z`);
        return (
          <div key={order.orderNumber} className="card order-card">
            <strong>
              {order.orderNumber} · Table {order.tableNumber} · {order.customerName}
            </strong>
            <div className="order-meta">{time.toLocaleString()}</div>
            <ul>
              {order.items.map((item) => (
                <li key={item.product_id + "-" + item.price}>
                  {item.quantity} × {item.product_name} ({item.price.toFixed(2)} each)
                </li>
              ))}
            </ul>
            <div className="price">Your items: {subtotal.toFixed(2)}</div>
          </div>
        );
      })}
    </section>
  );
}
