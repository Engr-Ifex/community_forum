import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import Avatar from "../Profile/Avatar";
import { buttonClass, icons } from "./ui";

const PRIMARY_LINKS = [
  ["Home", "/"],
  ["Discussions", "/discussions"],
  ["Categories", "/categories"],
];

const navLinkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
    isActive
      ? "bg-slate-100 text-slate-900"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;

/**
 * Public site navigation - the marketing/entry navbar for visitors.
 *
 * Signed-in users are routed into the authenticated application shell
 * (`AppLayout`), which has its own top bar and sidebar, so this navbar is what
 * a guest sees. If a session does exist - e.g. someone navigates back to `/`
 * from the app - the account area shows the initials avatar (never the full
 * name) and links into the dashboard rather than duplicating the app sidebar.
 *
 * Two layouts, one set of links:
 *   - `md` and up: a single flat row.
 *   - below `md`: a disclosure panel toggled by the hamburger button.
 */
const Navbar = () => {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile panel on navigation, otherwise it stays open over the new page.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate("/", { replace: true });
  };

  const MenuIcon = icons.menu;
  const CloseIcon = icons.close;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6"
      >
        {/* Brand */}
        <NavLink
          to="/"
          className="flex items-center gap-2 rounded-lg text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-600 text-sm font-bold text-white">
                CB
              </span>
              <span className="text-base font-semibold tracking-tight">
                ChatterBox
              </span>
        </NavLink>

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 md:flex">
          {PRIMARY_LINKS.map(([label, path]) => (
            <li key={path}>
              <NavLink to={path} end={path === "/"} className={navLinkClass}>
                {label}
              </NavLink>
            </li>
          ))}

          {/* While the session is being restored, reserve the space rather than
              flashing the signed-out buttons. */}
          {loading ? (
            <li className="ml-2 h-9 w-40" aria-hidden="true" />
          ) : isAuthenticated ? (
            <>
              <li className="ml-2">
                <NavLink
                  to="/dashboard"
                  className={buttonClass("primary", "sm")}
                >
                  Dashboard
                </NavLink>
              </li>

              <li>
                <button
                  type="button"
                  onClick={handleLogout}
                  className={buttonClass("ghost", "sm")}
                >
                  Logout
                </button>
              </li>

              {/* Initials avatar, never the full name. Links to the profile. */}
              <li className="ml-1">
                <NavLink
                  to="/profile"
                  aria-label={`${user?.name ?? "Your"} profile`}
                  title={user?.name ?? "Profile"}
                  className="inline-flex rounded-full transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  <Avatar user={user} size="sm" />
                </NavLink>
              </li>
            </>
          ) : (
            <>
              <li className="ml-2">
                <NavLink to="/login" className={navLinkClass}>
                  Login
                </NavLink>
              </li>

              <li>
                <NavLink to="/register" className={buttonClass("primary", "sm")}>
                  Register
                </NavLink>
              </li>
            </>
          )}
        </ul>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="-mr-1 rounded-lg p-2 text-slate-700 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 md:hidden"
        >
          {menuOpen ? (
            <CloseIcon className="h-5 w-5" />
          ) : (
            <MenuIcon className="h-5 w-5" />
          )}
        </button>
      </nav>

      {/* Mobile panel */}
      {menuOpen ? (
        <div
          id="mobile-menu"
          className="border-t border-slate-200 bg-white md:hidden"
        >
          <ul className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3 sm:px-6">
            {PRIMARY_LINKS.map(([label, path]) => (
              <li key={path}>
                <NavLink to={path} end={path === "/"} className={navLinkClass}>
                  {label}
                </NavLink>
              </li>
            ))}

            <li className="mt-2 border-t border-slate-200 pt-3">
              {loading ? (
                <span className="block px-3 py-2 text-sm text-slate-400">
                  Restoring session...
                </span>
              ) : isAuthenticated ? (
                <div className="flex flex-col gap-2">
                  {/* Identity row: monogram + name, then dashboard/profile. */}
                  <div className="flex items-center gap-3 px-3 py-2">
                    <Avatar user={user} size="sm" />

                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-slate-900">
                        {user?.name ?? "Signed in"}
                      </span>

                      {user?.email ? (
                        <span className="block truncate text-xs text-slate-500">
                          {user.email}
                        </span>
                      ) : null}
                    </span>
                  </div>

                  <NavLink to="/dashboard" className={buttonClass("primary", "md", "w-full")}>
                    Dashboard
                  </NavLink>

                  <NavLink to="/profile" className={buttonClass("secondary", "md", "w-full")}>
                    Profile
                  </NavLink>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className={buttonClass("ghost", "md", "w-full justify-center")}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <NavLink to="/login" className={buttonClass("secondary", "md", "w-full")}>
                    Login
                  </NavLink>

                  <NavLink to="/register" className={buttonClass("primary", "md", "w-full")}>
                    Register
                  </NavLink>
                </div>
              )}
            </li>
          </ul>
        </div>
      ) : null}
    </header>
  );
};

export default Navbar;
