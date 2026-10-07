import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { clearToken, getUser, homePathFor } from "../auth.js";
import { CART_EVENT, cartCount } from "../cart.js";

export default function Header() {
  const navigate = useNavigate();
  // Reading the location makes this header re-render on every page change, so the login state stays current.
  useLocation();
  const user = getUser();
  const [count, setCount] = useState(cartCount());

  useEffect(() => {
    const refresh = () => setCount(cartCount());
    window.addEventListener(CART_EVENT, refresh);
    return () => window.removeEventListener(CART_EVENT, refresh);
  }, []);

  function handleLogout() {
    clearToken();
    navigate("/login");
  }

  return (
    <header className="site-header">
      <Link to="/" className="brand">
        Food Court
      </Link>
      <nav>
        {user ? (
          <>
            <Link to={homePathFor(user.role)}>Dashboard</Link>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/cart" className="cart-link" aria-label={`Cart, ${count} items`}>
              Cart <span className="cart-count">{count}</span>
            </Link>
            <Link to="/login" className="staff-link">
              Staff login
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
