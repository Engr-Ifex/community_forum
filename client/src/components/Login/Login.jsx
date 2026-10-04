import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const mockAccounts = [
  {
    id: 1,
    name: "Rukky",
    username: "Rukky",
    email: "user@example.com",
    password: import.meta.env.VITE_USER_PASSWORD,
    role: "user",
    profilePicture: "",
    bio: "",
    pronouns: "",
    gender: "",
    links: [],
  },
  {
    id: 2,
    name: "Kindness",
    username: "Kindness",
    email: "moderator@example.com",
    password: import.meta.env.VITE_MODERATOR_PASSWORD,
    role: "moderator",
    profilePicture: "",
    bio: "",
    pronouns: "",
    gender: "",
    links: [],
  },
  {
    id: 3,
    name: "Admin",
    username: "Admin",
    email: "admin@example.com",
    password: import.meta.env.VITE_ADMIN_PASSWORD,
    role: "admin",
    profilePicture: "",
    bio: "",
    pronouns: "",
    gender: "",
    links: [],
  },
];

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [logoutSuccess, setLogoutSuccess] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const message = localStorage.getItem(
      "logoutSuccessMessage",
    );

    if (!message) {
      return;
    }

    setLogoutSuccess(message);
    localStorage.removeItem("logoutSuccessMessage");

    const timer = setTimeout(() => {
      setLogoutSuccess("");
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();

    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters long.",
      );
      return;
    }

    const account = mockAccounts.find(
      (item) =>
        item.email.toLowerCase() === normalizedEmail,
    );

    if (!account || account.password !== password) {
      setError(
        "Invalid email or password. Please check your login details.",
      );
      return;
    }

    const userData = {
      id: account.id,
      name: account.name,
      username: account.username,
      email: account.email,
      role: account.role,
      profilePicture: account.profilePicture,
      bio: account.bio,
      pronouns: account.pronouns,
      gender: account.gender,
      links: account.links,
    };

    login(userData);

    navigate("/");
  };

  return (
    <section className="mx-auto max-w-md">
      {logoutSuccess && (
        <div
          role="status"
          className="mb-5 rounded-md border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700"
        >
          {logoutSuccess}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mb-5 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
        >
          {error}
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">
          Login
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Log in to your community forum account.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-5"
        >
          <div>
            <label
              htmlFor="login-email"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Email
            </label>

            <input
              id="login-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError("");
              }}
              required
              autoComplete="email"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700"
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Password
            </label>

            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
                required
                autoComplete="current-password"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 pr-20 text-sm text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword((current) => !current)
                }
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <p className="mt-2 text-xs text-slate-500">
              Password must be at least 8 characters long.
            </p>
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800"
          >
            Login
          </button>
        </form>
      </div>

      <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-5">
        <h2 className="text-sm font-semibold text-slate-900">
          Test accounts
        </h2>

        <div className="mt-3 space-y-2 text-xs text-slate-600">
          <p>
            <strong>User:</strong> user@example.com
          </p>

          <p>
            <strong>Moderator:</strong> moderator@example.com
          </p>

          <p>
            <strong>Admin:</strong> admin@example.com
          </p>

          <p className="mt-3 text-slate-500">
            Use the test credentials provided to your team separately.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Login;