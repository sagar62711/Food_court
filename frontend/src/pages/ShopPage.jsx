import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getUser } from "../auth.js";
import { fetchShopProducts, fetchShops } from "../api.js";
import { addToCart } from "../cart.js";
import ProductCard from "../components/ProductCard.jsx";

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

  if (loading) return <p>Loading menu...</p>;

  return (
    <>
      <Link to="/">&larr; All shops</Link>
      {error ? (
        <p className="error">{error}</p>
      ) : (
        <>
          <h1>{shop ? shop.name : "Menu"}</h1>
          {shop && <p className="cuisine">{shop.cuisine_type}</p>}
          {products.length === 0 ? (
            <p>No products yet.</p>
          ) : (
            <div className="grid">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={shop && canAddToCart ? (item) => addToCart(item, shop) : undefined}
                />
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
