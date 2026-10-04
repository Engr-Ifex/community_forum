import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const links = [
  ["Home", "/"],
  ["Discussions", "/discussions"],
  ["Categories", "/categories"],
];

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [showLogoutConfirmation, setShowLogoutConfirmation] =
    useState(false);

  const handleLogout = () => {
    logout();
    setShowLogoutConfirmation(false);

    navigate("/login", {
      state: {
        logoutSuccess: true,
      },
    });
  };

  const isAdmin = user?.role === "admin";
  const isModerator = user?.role === "moderator";

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <NavLink
          to="/"
          className="text-lg font-semibold text-slate-900"
        >
          Community Forum
        </NavLink>

        <ul className="flex flex-wrap items-center gap-1">
          {links.map(([label, path]) => (
            <li key={path}>
              <NavLink
                to={path}
                end={path === "/"}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sm font-medium ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`
                }
              >
                {label}
              </NavLink>
            </li>
          ))}

          {isAuthenticated &&
            (isAdmin || isModerator) && (
              <li>
                <NavLink
                  to="/moderation"
                  className={({ isActive }) =>
                    `rounded-md px-3 py-2 text-sm font-medium ${
                      isActive
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`
                  }
                >
                  Moderation
                </NavLink>
              </li>
            )}

          {isAuthenticated && isAdmin && (
            <li>
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sm font-medium ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`
                }
              >
                Admin
              </NavLink>
            </li>
          )}

          {isAuthenticated &&
            (isModerator || isAdmin) && (
              <li>
                <NavLink
                  to="/users"
                  className={({ isActive }) =>
                    `rounded-md px-3 py-2 text-sm font-medium ${
                      isActive
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`
                  }
                >
                  Users
                </NavLink>
              </li>
            )}

          <li>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium ${
                  isActive
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              Profile
            </NavLink>
          </li>

          {!isAuthenticated ? (
            <>
              <li>
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    `rounded-md px-3 py-2 text-sm font-medium ${
                      isActive
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`
                  }
                >
                  Login
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/register"
                  className={({ isActive }) =>
                    `rounded-md px-3 py-2 text-sm font-medium ${
                      isActive
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`
                  }
                >
                  Register
                </NavLink>
              </li>
            </>
          ) : (
            <li>
              <button
                type="button"
                onClick={() =>
                  setShowLogoutConfirmation(true)
                }
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Logout
              </button>
            </li>
          )}
        </ul>
      </nav>

      {isAuthenticated && showLogoutConfirmation && (
        <div className="border-t border-slate-200 bg-white">
          <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Log out of your account?
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                You will need to log in again to access your
                account.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  setShowLogoutConfirmation(false)
                }
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;