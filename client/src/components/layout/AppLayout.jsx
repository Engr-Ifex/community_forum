import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

import { icons } from "../common/ui";
import AvatarMenu from "./AvatarMenu";
import Sidebar from "./Sidebar";

/**
 * Authenticated application shell.
 *
 * Layout:
 *   - a sticky top bar: brand on the left, account menu on the right. It is
 *     intentionally sparse - the sidebar, not the top bar, carries navigation;
 *   - a sidebar column from `md` up, and a slide-over drawer below `md`;
 *   - a scrollable content column where the routed page renders.
 *
 * Two ways to fill that content column, so the shell works both as a layout
 * route and as a plain wrapper:
 *   - as a layout route (`<Route element={<AppLayout />}>`) React Router feeds
 *     the child route through `<Outlet />`;
 *   - `SiteShell` passes the page as `children` instead, which is what keeps the
 *     shared pages (discussions, categories, …) inside the sidebar when a
 *     signed-in user opens them.
 *
 * `ProtectedRoute` wraps this for the signed-in-only routes, so by the time it
 * mounts there is a real session and the layout can read the role directly.
 * Shared pages reach it through `SiteShell`, which only renders it once a
 * session is known to exist.
 */
const AppLayout = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  // Close the drawer whenever the route changes, otherwise it stays open over
  // the page the user just navigated to.
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  // Escape closes the drawer - matches the avatar menu's behaviour.
  useEffect(() => {
    if (!drawerOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [drawerOpen]);

  const MenuIcon = icons.menu;
  const CloseIcon = icons.close;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur">
        <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            {/* Drawer toggle - only on small screens. */}
            <button
              type="button"
              onClick={() => setDrawerOpen((open) => !open)}
              aria-expanded={drawerOpen}
              aria-controls="app-drawer"
              aria-label={drawerOpen ? "Close navigation" : "Open navigation"}
              className="-ml-1 rounded-lg p-2 text-slate-700 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 md:hidden"
            >
              {drawerOpen ? (
                <CloseIcon className="h-5 w-5" />
              ) : (
                <MenuIcon className="h-5 w-5" />
              )}
            </button>

            <Link
              to="/dashboard"
              className="flex min-w-0 items-center gap-2 rounded-lg text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-blue-600 text-sm font-bold text-white">
                CB
              </span>

              <span className="truncate text-base font-semibold tracking-tight">
                ChatterBox
              </span>
            </Link>
          </div>

          {/* No "Home" link here on purpose: once signed in, the application is
              where the user belongs. The public landing page is reached by
              logging out (which returns to "/"), not by a nav control. The brand
              mark above already links back to /dashboard. */}
          <div className="flex shrink-0 items-center gap-2">
            <AvatarMenu />
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-6 sm:px-6">
        {/* Desktop sidebar */}
        <aside className="hidden w-60 shrink-0 md:block">
          <div className="sticky top-20 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <Sidebar />
          </div>
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1">
          {children ?? <Outlet />}
        </main>
      </div>

      {/* Mobile drawer */}
      {drawerOpen ? (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Scrim */}
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 h-full w-full cursor-default bg-slate-900/40"
          />

          <div
            id="app-drawer"
            className="absolute left-0 top-0 h-full w-72 max-w-[85vw] overflow-y-auto border-r border-slate-200 bg-white p-4 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                Menu
              </span>

              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close navigation"
                className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <Sidebar onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AppLayout;
