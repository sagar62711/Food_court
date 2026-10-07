import { Navigate } from "react-router-dom";
import { getUser, homePathFor } from "../auth.js";

export default function ProtectedRoute({ role, children }) {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={homePathFor(user.role)} replace />;
  return children;
}
