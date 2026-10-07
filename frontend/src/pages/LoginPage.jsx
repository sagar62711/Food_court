import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { getUser, homePathFor, saveToken } from "../auth.js";
import { login } from "../api.js";

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const existingUser = getUser();
  if (existingUser) return <Navigate to={homePathFor(existingUser.role)} replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const data = await login(username, password);
      saveToken(data.access_token);
      navigate(homePathFor(getUser().role), { replace: true });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <form className="form-card card" onSubmit={handleSubmit}>
      <h1>Staff login</h1>

      <label>
        Username
        <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
      </label>

      <label>
        Password
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
      </label>

      {error && <p className="error">{error}</p>}

      <button type="submit" disabled={submitting}>
        {submitting ? "Logging in..." : "Log in"}
      </button>
    </form>
  );
}
