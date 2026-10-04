import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import Avatar from "../Profile/Avatar";

/**
 * Avatar trigger + account dropdown for the authenticated top bar.
 *
 * Deliberately dependency-free: a single `<div>` with a button and an absolutely
 * positioned panel. No dropdown library, no portal.
 *
 * Behaviour:
 *   - toggles on click (not hover, so it also works on touch);
 *   - closes on outside pointer-down, on Escape, and after navigating;
 *   - is anchored to the right edge and constrained to the viewport width, so it
 *     cannot be clipped off-screen on a narrow phone.
 *
 * The panel carries the full name and email (the navbar itself only shows the
 * monogram), then Profile and Logout.
 */
const AvatarMenu = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // Close on outside click / touch.
  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    // Land on the public home page, not the login screen - logout is not an
    // error state and the landing page is the natural "signed out" surface.
    navigate("/", { replace: true });
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="flex items-center rounded-full transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        <Avatar user={user} size="sm" />

        {/* Small caret, rotated while open. */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={`ml-1 h-4 w-4 text-slate-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Account"
          className="absolute right-0 z-40 mt-2 w-60 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
        >
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="truncate text-sm font-semibold text-slate-900">
              {user?.name ?? "Signed in"}
            </p>

            {user?.email ? (
              <p className="mt-0.5 truncate text-xs text-slate-500">
                {user.email}
              </p>
            ) : null}

            {user?.role && user.role !== "user" ? (
              <span className="mt-2 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium capitalize text-slate-700">
                {user.role}
              </span>
            ) : null}
          </div>

          <div className="p-1">
            <Link
              to="/profile"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Profile
            </Link>

            {user?.role === "moderator" || user?.role === "admin" ? (
              <Link
                to="/moderation"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Moderation
              </Link>
            ) : null}

            {user?.role === "admin" ? (
              <Link
                to="/admin"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Admin
              </Link>
            ) : null}
          </div>

          <div className="border-t border-slate-100 p-1">
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Logout
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AvatarMenu;
