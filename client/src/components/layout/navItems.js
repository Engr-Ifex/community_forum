import { icons } from "../common/ui";

/**
 * Authenticated application navigation.
 *
 * ONE definition, filtered by role, consumed by both the desktop sidebar and
 * the mobile drawer - so the two can never drift apart. Adding an entry here
 * makes it appear in both places at once.
 *
 * `roles` lists who may see the item. Items without `roles` are visible to every
 * signed-in user. This is presentation only: every destination is independently
 * guarded by `ProtectedRoute` on the client and by `authenticate` +
 * `requireModerator`/`requireAdmin` middleware on the server, which remains the
 * authority.
 */
export const NAV_ITEMS = [
  { label: "Dashboard", to: "/dashboard", icon: icons.grid, end: true },
  { label: "Discussions", to: "/discussions", icon: icons.chat },
  { label: "Categories", to: "/categories", icon: icons.grid },
  { label: "My Discussions", to: "/my-discussions", icon: icons.chat },
  { label: "Moderation", to: "/moderation", icon: icons.shield, roles: ["moderator", "admin"] },
  { label: "Admin", to: "/admin", icon: icons.users, roles: ["admin"] },
  { label: "Profile", to: "/profile", icon: icons.users },
];

/** The nav items the given role is allowed to see. */
export const getNavItems = (role) =>
  NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role));

/** Link classes for a sidebar entry, active vs idle. */
export const sidebarLinkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
    isActive
      ? "bg-blue-50 text-blue-700"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;
