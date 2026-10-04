import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { buttonClass } from "../common/ui";
import { getNavItems, sidebarLinkClass } from "./navItems";

/**
 * Authenticated sidebar navigation.
 *
 * Rendered twice by `AppLayout`:
 *   - as a sticky column on `md` and up;
 *   - inside a slide-over drawer below `md`.
 *
 * The link list is identical in both, driven by `getNavItems(role)`, so a
 * moderator sees Moderation and an admin also sees Admin, while a normal user
 * sees neither.
 *
 * `onNavigate` lets the mobile drawer close itself when a link is followed.
 */
const Sidebar = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const items = getNavItems(user?.role ?? "user");

  const handleLogout = async () => {
    onNavigate?.();
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="flex h-full flex-col">
      <nav aria-label="Application" className="flex-1 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              className={sidebarLinkClass}
            >
              {Icon ? <Icon className="h-4 w-4 shrink-0" /> : null}
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-4 border-t border-slate-200 pt-4">
        <button
          type="button"
          onClick={handleLogout}
          className={buttonClass("secondary", "md", "w-full justify-start")}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
