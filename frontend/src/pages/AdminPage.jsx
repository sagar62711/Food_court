import { useEffect, useState } from "react";
import OwnerForm from "../components/OwnerForm.jsx";
import ShopForm from "../components/ShopForm.jsx";
import {
  createShop,
  createShopOwner,
  deleteShop,
  fetchAdminShops,
  updateShop,
} from "../api.js";

export default function AdminPage() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  // Only one form is open at a time: { mode: "add" } | { mode: "edit", shop } | { mode: "owner", shop }
  const [form, setForm] = useState(null);

  async function loadShops() {
    setError("");
    try {
      setShops(await fetchAdminShops());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadShops();
  }, []);

  function openForm(nextForm) {
    setError("");
    setNotice("");
    setForm(nextForm);
  }

  function closeForm() {
    setForm(null);
  }

  async function handleSaveShop(data) {
    if (form.mode === "edit") {
      await updateShop(form.shop.id, data);
      setNotice("Shop updated.");
    } else {
      await createShop(data);
      setNotice("Shop created.");
    }
    closeForm();
    await loadShops();
  }

  async function handleCreateOwner(data) {
    await createShopOwner(form.shop.id, data);
    setNotice(`Login "${data.username}" created for ${form.shop.name}.`);
    closeForm();
  }

  async function handleDelete(shop) {
    const confirmed = window.confirm(
      `Delete "${shop.name}"?\n\nThis also deletes its products and its owner's login. This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await deleteShop(shop.id);
      if (form?.shop?.id === shop.id) closeForm();
      setNotice(`"${shop.name}" deleted.`);
      await loadShops();
    } catch (err) {
      setError(err.message);
    }
  }

  const shopFormOpen = form?.mode === "add" || form?.mode === "edit";

  return (
    <>
      <div className="page-header">
        <h1>Shops</h1>
        {!form && <button onClick={() => openForm({ mode: "add" })}>Add shop</button>}
      </div>

      {notice && <p className="notice">{notice}</p>}
      {error && <p className="error">{error}</p>}

      {shopFormOpen && (
        <ShopForm
          key={form.mode === "edit" ? `edit-${form.shop.id}` : "add"}
          shop={form.mode === "edit" ? form.shop : null}
          onSave={handleSaveShop}
          onCancel={closeForm}
        />
      )}

      {form?.mode === "owner" && (
        <OwnerForm
          key={`owner-${form.shop.id}`}
          shop={form.shop}
          onSave={handleCreateOwner}
          onCancel={closeForm}
        />
      )}

      {loading && <p>Loading shops...</p>}
      {!loading && shops.length === 0 && <p>No shops yet. Add the first one.</p>}

      <div className="product-list">
        {shops.map((shop) => (
          <div key={shop.id} className="card row">
            <div className="row-info">
              <strong>{shop.name}</strong>
              <span className="cuisine"> {shop.cuisine_type}</span>
              {shop.description && <div>{shop.description}</div>}
            </div>
            <div className="row-actions">
              <button className="secondary" onClick={() => openForm({ mode: "owner", shop })}>
                Create owner login
              </button>
              <button className="secondary" onClick={() => openForm({ mode: "edit", shop })}>
                Edit
              </button>
              <button className="danger" onClick={() => handleDelete(shop)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
