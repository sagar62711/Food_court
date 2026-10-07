import { useId, useState } from "react";
import { getUser } from "../auth.js";
import { stallStyle } from "../stall.js";
import ProductCard from "./ProductCard.jsx";

const NAME_MAX = 100; // matches the database column
const DESCRIPTION_HINT = 140; // roughly the two lines customers see on a card

export default function ProductForm({ product, onSave, onCancel }) {
  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? "");
  const [isAvailable, setIsAvailable] = useState(product?.is_available ?? true);
  const [brokenImage, setBrokenImage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const id = useId();

  const isNew = !product;
  const accent = stallStyle(getUser()?.shopId);
  const trimmedUrl = imageUrl.trim();
  const imageFailed = trimmedUrl !== "" && brokenImage === trimmedUrl;
  const priceNumber = Number(price);

  function validate() {
    const errors = {};
    if (!name.trim()) errors.name = "Give the dish a name.";
    if (price === "" || Number.isNaN(priceNumber)) errors.price = "Enter a price.";
    else if (priceNumber < 0) errors.price = "Price can't be negative.";
    if (trimmedUrl && !/^https?:\/\//i.test(trimmedUrl)) errors.image = "Use a link that starts with https://";
    return errors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        description: description.trim() || null,
        price: priceNumber,
        image_url: trimmedUrl || null,
        is_available: isAvailable,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function clearFieldError(field) {
    if (!fieldErrors[field]) return;
    setFieldErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  const preview = {
    id: "preview",
    name: name.trim() || "Dish name",
    description: description.trim() || null,
    price: Number.isFinite(priceNumber) && price !== "" ? priceNumber : 0,
    image_url: trimmedUrl && !imageFailed ? trimmedUrl : null,
    is_available: isAvailable,
  };

  return (
    <form
      className="product-editor"
      style={accent}
      onSubmit={handleSubmit}
      onKeyDown={(e) => e.key === "Escape" && onCancel()}
      noValidate
    >
      <div className="editor-head">
        <h2>{isNew ? "Add a dish" : "Edit dish"}</h2>
        <p className="muted">
          {isNew ? "It appears on your menu as soon as you add it." : "Changes show on your menu as soon as you save."}
        </p>
      </div>

      <div className="editor-grid">
        <div className="editor-fields">
          <div className={fieldErrors.name ? "field has-error" : "field"}>
            <div className="field-label">
              <label htmlFor={`${id}-name`}>Name</label>
              <span className="field-count">
                {name.length}/{NAME_MAX}
              </span>
            </div>
            <input
              id={`${id}-name`}
              value={name}
              maxLength={NAME_MAX}
              placeholder="Chicken steamed momos"
              autoFocus
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={fieldErrors.name ? `${id}-name-error` : undefined}
              onChange={(e) => {
                setName(e.target.value);
                clearFieldError("name");
              }}
            />
            {fieldErrors.name && (
              <p className="field-error" id={`${id}-name-error`}>
                {fieldErrors.name}
              </p>
            )}
          </div>

          <div className="field">
            <div className="field-label">
              <label htmlFor={`${id}-description`}>
                Description <span className="optional">optional</span>
              </label>
              <span className={description.length > DESCRIPTION_HINT ? "field-count is-over" : "field-count"}>
                {description.length}/{DESCRIPTION_HINT}
              </span>
            </div>
            <textarea
              id={`${id}-description`}
              rows={3}
              value={description}
              placeholder="Eight momos with spicy tomato chutney."
              aria-describedby={`${id}-description-hint`}
              onChange={(e) => setDescription(e.target.value)}
            />
            <p className="field-hint" id={`${id}-description-hint`}>
              Customers see about two lines on the menu card.
            </p>
          </div>

          <div className={fieldErrors.price ? "field field-price has-error" : "field field-price"}>
            <div className="field-label">
              <label htmlFor={`${id}-price`}>Price</label>
            </div>
            <input
              id={`${id}-price`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={price}
              aria-invalid={Boolean(fieldErrors.price)}
              aria-describedby={fieldErrors.price ? `${id}-price-error` : undefined}
              onChange={(e) => {
                setPrice(e.target.value);
                clearFieldError("price");
              }}
            />
            {fieldErrors.price && (
              <p className="field-error" id={`${id}-price-error`}>
                {fieldErrors.price}
              </p>
            )}
          </div>

          <div className={fieldErrors.image || imageFailed ? "field has-error" : "field"}>
            <div className="field-label">
              <label htmlFor={`${id}-image`}>
                Photo link <span className="optional">optional</span>
              </label>
            </div>
            <div className="image-field">
              <div className="image-thumb" aria-hidden="true">
                {trimmedUrl && !imageFailed ? (
                  <img key={trimmedUrl} src={trimmedUrl} alt="" onError={() => setBrokenImage(trimmedUrl)} />
                ) : (
                  <span>{(name.trim() || "?").charAt(0)}</span>
                )}
              </div>
              <input
                id={`${id}-image`}
                type="url"
                value={imageUrl}
                placeholder="https://..."
                aria-invalid={Boolean(fieldErrors.image || imageFailed)}
                aria-describedby={`${id}-image-hint`}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  clearFieldError("image");
                }}
              />
            </div>
            <p className={fieldErrors.image || imageFailed ? "field-error" : "field-hint"} id={`${id}-image-hint`}>
              {fieldErrors.image ||
                (imageFailed
                  ? "This link doesn't open an image. Check that it points straight to a photo."
                  : "Paste a link to a photo that's already online. Without one, the card shows the dish's first letter.")}
            </p>
          </div>

          <label className="switch-field" htmlFor={`${id}-available`}>
            <span>
              <strong>Available to order</strong>
              <span className="field-hint">Turn this off when the dish sells out.</span>
            </span>
            <input
              id={`${id}-available`}
              type="checkbox"
              role="switch"
              className="switch"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
            />
          </label>
        </div>

        <aside className="editor-preview" aria-label="Customer preview">
          <p className="preview-label">How customers see it</p>
          <ul className="dish-grid preview-grid" inert>
            <ProductCard product={preview} onAddToCart={() => {}} />
          </ul>
        </aside>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="editor-actions">
        <button type="submit" disabled={saving}>
          {saving ? (isNew ? "Adding..." : "Saving...") : isNew ? "Add to menu" : "Save changes"}
        </button>
        <button type="button" className="secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
