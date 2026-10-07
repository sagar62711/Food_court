export default function ProductCard({ product, onAddToCart }) {
  return (
    <div className={product.is_available ? "card" : "card unavailable"}>
      {product.image_url && <img src={product.image_url} alt={product.name} />}
      <h3>{product.name}</h3>
      {product.description && <p>{product.description}</p>}
      <p className="price">{product.price.toFixed(2)}</p>
      {!product.is_available && <span className="badge">Unavailable</span>}
      {product.is_available && onAddToCart && (
        <button onClick={() => onAddToCart(product)}>Add to cart</button>
      )}
    </div>
  );
}
