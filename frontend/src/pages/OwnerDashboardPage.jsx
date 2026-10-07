import { useEffect, useState } from "react";
import OwnerOrders from "../components/OwnerOrders.jsx";
import ProductForm from "../components/ProductForm.jsx";
import {
  createProduct,
  deleteProduct,
  fetchOwnerProducts,
  toggleProductAvailability,
  updateProduct,
} from "../api.js";

export default function OwnerDashboardPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  async function loadProducts() {
    setError("");
    try {
      setProducts(await fetchOwnerProducts());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function openAddForm() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEditForm(product) {
    setEditing(product);
    setFormOpen(true);
  }

  function closeForm() {
    setEditing(null);
    setFormOpen(false);
  }

  async function handleSave(data) {
    if (editing) await updateProduct(editing.id, data);
    else await createProduct(data);
    closeForm();
    await loadProducts();
  }

  async function handleDelete(product) {
    if (!window.confirm(`Delete "${product.name}"?`)) return;
    try {
      await deleteProduct(product.id);
      setProducts((current) => current.filter((p) => p.id !== product.id));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleToggle(product) {
    try {
      const updated = await toggleProductAvailability(product.id);
      setProducts((current) => current.map((p) => (p.id === updated.id ? updated : p)));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <div className="page-header">
        <h1>My menu</h1>
        {!formOpen && <button onClick={openAddForm}>Add product</button>}
      </div>

      {formOpen && (
        <ProductForm
          key={editing ? editing.id : "new"}
          product={editing}
          onSave={handleSave}
          onCancel={closeForm}
        />
      )}

      {error && <p className="error">{error}</p>}
      {loading && <p>Loading products...</p>}
      {!loading && products.length === 0 && <p>No products yet. Add your first one.</p>}

      <div className="product-list">
        {products.map((product) => (
          <div key={product.id} className={product.is_available ? "card row" : "card row unavailable"}>
            <div className="row-info">
              <strong>{product.name}</strong>
              {product.description && <span className="cuisine"> {product.description}</span>}
              <div className="price">{product.price.toFixed(2)}</div>
            </div>
            <div className="row-actions">
              <button
                className={product.is_available ? "" : "secondary"}
                onClick={() => handleToggle(product)}
              >
                {product.is_available ? "Available" : "Unavailable"}
              </button>
              <button className="secondary" onClick={() => openEditForm(product)}>
                Edit
              </button>
              <button className="danger" onClick={() => handleDelete(product)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <OwnerOrders />
    </>
  );
}
