import { useEffect, useState } from "react";
import { fetchShops } from "../api.js";
import ShopCard from "../components/ShopCard.jsx";

export default function HomePage() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchShops()
      .then((data) => setShops(data))
      .catch(() => setError("Could not load shops. Is the backend running?"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading shops...</p>;
  if (error) return <p className="error">{error}</p>;
  if (shops.length === 0) return <p>No shops yet.</p>;

  return (
    <>
      <h1>Shops</h1>
      <div className="grid">
        {shops.map((shop) => (
          <ShopCard key={shop.id} shop={shop} />
        ))}
      </div>
    </>
  );
}
