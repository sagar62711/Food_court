import { useCallback, useEffect, useState } from "react";
import { fetchShops } from "../api.js";
import ShopCard from "../components/ShopCard.jsx";

export default function HomePage() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    fetchShops()
      .then((data) => setShops(data))
      .catch(() => setError("Could not load shops. The server may be waking up, so try again in a moment."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  if (loading) return <p className="status">Loading shops...</p>;

  if (error) {
    return (
      <div className="status-block">
        <p className="error">{error}</p>
        <button onClick={load}>Try again</button>
      </div>
    );
  }

  if (shops.length === 0) return <p className="status">No shops yet.</p>;

  return (
    <>
      <h1>What are you craving?</h1>
      <p className="lede">Mix dishes from any shop and place one order for your table.</p>
      <div className="stalls">
        {shops.map((shop) => (
          <ShopCard key={shop.id} shop={shop} />
        ))}
      </div>
    </>
  );
}
