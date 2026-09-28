import { NavLink, useNavigate } from "react-router-dom"; import { useAuth } from "../../context/AuthContext";
const links = [ ["Home", "/"], ["Discussions", "/discussions"], ["Categories", "/categories"], ];
const Navbar = () => { const { isAuthenticated, logout } = useAuth(); const navigate = useNavigate();
const handleLogout = () => { logout(); navigate("/login"); };
return ( <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur"> <nav className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3"> <NavLink to="/" className="text-lg font-semibold text-slate-900"> Community Forum </NavLink>
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

      {!isAuthenticated ? (
        <>
          <li>
            <NavLink
              to="/login"
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Login
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/register"
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Register
            </NavLink>
          </li>
        </>
      ) : (
        <li>
          <button
            onClick={handleLogout}
            className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Logout
          </button>
        </li>
      )}
    </ul>
  </nav>
</header>
); };
export default Navbar;