import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import Loader from "../components/common/Loader";

/**
 * Route guard.
 *
 * Usage:
 *   <Route element={<ProtectedRoute />}>            // any signed-in user
 *   <Route element={<ProtectedRoute roles={["admin"]} />}>
 *
 * While the session is being restored we render a loader instead of redirecting,
 * otherwise a refresh would bounce an authenticated user to /login before
 * GET /auth/me has had a chance to answer.
 */
const ProtectedRoute = ({ roles }) => {
  // `loading` is the flag AuthContext exposes while the mount-time /auth/me is
  // still in flight. Reading the wrong key here silently disables the wait and
  // bounces refreshed, already-authenticated users to /login.
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="py-16 text-center">
        <Loader />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (Array.isArray(roles) && roles.length && !roles.includes(user.role)) {
    return (
      <section className="mx-auto max-w-2xl rounded-xl border border-amber-200 bg-amber-50 p-8 text-center">
        <h1 className="text-2xl font-bold text-amber-900">Access denied</h1>
        <p className="mt-3 text-amber-800">
          This area is restricted to {roles.join(" or ")} accounts.
        </p>
      </section>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
