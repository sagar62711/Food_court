import { Link } from "react-router-dom";
import { stallStyle } from "../stall.js";
import FoodArt from "./FoodArt.jsx";

export default function ShopCard({ shop }) {
  return (
    <Link to={`/shops/${shop.id}`} className="stall" style={stallStyle(shop.id)}>
      <div className="stall-media">
        {shop.image_url ? <img src={shop.image_url} alt="" /> : <FoodArt shop={shop} />}
      </div>
      <div className="stall-body">
        <span className="tag">{shop.cuisine_type}</span>
        <h2>{shop.name}</h2>
        {shop.description && <p className="stall-description">{shop.description}</p>}
        <span className="stall-cta">View menu</span>
      </div>
    </Link>
  );
}
