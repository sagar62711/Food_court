import { useState } from "react";

export default function ShopForm({ shop, onSave, onCancel }) {
  const [name, setName] = useState(shop?.name ?? "");
  const [cuisineType, setCuisineType] = useState(shop?.cuisine_type ?? "");
  const [description, setDescription] = useState(shop?.description ?? "");
  const [imageUrl, setImageUrl] = useState(shop?.image_url ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!name.trim() || !cuisineType.trim()) {
      setError("Name and cuisine type are required.");
      return;
    }

    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        cuisine_type: cuisineType.trim(),
        description: description.trim() || null,
        image_url: imageUrl.trim() || null,
      });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <form className="form-card card" onSubmit={handleSubmit}>
      <h2>{shop ? `Edit ${shop.name}` : "Add shop"}</h2>

      <label>
        Name
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </label>

      <label>
        Cuisine type
        <input value={cuisineType} onChange={(e) => setCuisineType(e.target.value)} placeholder="e.g. Chinese, Momos" />
      </label>

      <label>
        Description (optional)
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>

      <label>
        Image URL (optional)
        <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
      </label>

      {error && <p className="error">{error}</p>}

      <div className="form-actions">
        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
        <button type="button" className="secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
