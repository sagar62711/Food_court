import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getUser } from "../auth.js";
import { fetchShopProducts, fetchShops } from "../api.js";
import { addToCart } from "../cart.js";
import { stallStyle } from "../stall.js";
import DealtMenu from "../components/DealtMenu.jsx";

export default function ShopPage() {
  const { shopId } = useParams();
  const canAddToCart = !getUser();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    Promise.all([fetchShops(), fetchShopProducts(shopId)])
      .then(([shops, menu]) => {
        setShop(shops.find((s) => String(s.id) === shopId) ?? null);
        setProducts(menu);
      })
      .catch(() => setError("Could not load this shop's menu."))
      .finally(() => setLoading(false));
  }, [shopId]);

  if (loading) return <p className="status">Loading menu...</p>;

  return (
    <>
      <Link to="/" className="back-link">
        All shops
      </Link>
      {error ? (
        <p className="error">{error}</p>
      ) : (
        <>
          <section className="shop-banner" style={stallStyle(shopId)}>
            <h1>{shop ? shop.name : "Menu"}</h1>
            {shop && <span className="tag tag-inverse">{shop.cuisine_type}</span>}
            {shop?.description && <p>{shop.description}</p>}
          </section>
          {products.length === 0 ? (
            <p className="status">No items on this menu yet.</p>
          ) : (
            <DealtMenu
              key={shopId}
              products={products}
              style={stallStyle(shopId)}
              onAddToCart={shop && canAddToCart ? (item) => addToCart(item, shop) : undefined}
            />
          )}
        </>
      )}
    </>
  );
}
