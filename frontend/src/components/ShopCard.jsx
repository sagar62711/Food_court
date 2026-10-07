import { Link } from "react-router-dom";

export default function ShopCard({ shop }) {
  return (
    <Link to={`/shops/${shop.id}`} className="card">
      {shop.image_url && <img src={shop.image_url} alt={shop.name} />}
      <h2>{shop.name}</h2>
      <p className="cuisine">{shop.cuisine_type}</p>
      {shop.description && <p>{shop.description}</p>}
    </Link>
  );
}
