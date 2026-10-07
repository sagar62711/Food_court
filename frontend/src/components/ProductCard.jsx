import { useEffect, useRef, useState } from "react";

export default function ProductCard({ product, onAddToCart }) {
  const [justAdded, setJustAdded] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  function handleAdd() {
    onAddToCart(product);
    setJustAdded(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setJustAdded(false), 1200);
  }

  return (
    <li className={product.is_available ? "dish-card" : "dish-card unavailable"}>
      <div className="dish-media">
        {product.image_url ? (
          <img src={product.image_url} alt="" />
        ) : (
          <span className="dish-initial" aria-hidden="true">
            {product.name.charAt(0)}
          </span>
        )}
      </div>
      <div className="dish-body">
        <div className="dish-head">
          <h3>{product.name}</h3>
          <span className="leader" aria-hidden="true" />
          <span className="price">{product.price.toFixed(2)}</span>
        </div>
        {product.description && <p className="dish-description">{product.description}</p>}
        {!product.is_available && <span className="badge">Unavailable</span>}
      </div>
      {product.is_available && onAddToCart && (
        <button className="add-button" onClick={handleAdd} aria-live="polite">
          {justAdded ? "Added" : "Add to cart"}
        </button>
      )}
    </li>
  );
}
