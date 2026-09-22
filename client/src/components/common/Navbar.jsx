import { NavLink } from "react-router-dom";

const links = [
  ["Home", "/"],
  ["Discussions", "/discussions"],
  ["Categories", "/categories"],
  ["Login", "/login"],
  ["Register", "/register"],
];

const Navbar = () => {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <NavLink to="/" className="text-lg font-semibold text-slate-900">
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
                    isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                  }`
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
