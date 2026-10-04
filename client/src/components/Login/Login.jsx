import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { getFieldErrors } from "../../services/auth";
import {
  buttonClass,
  fieldErrorClass,
  inputClass,
  labelClass,
} from "../common/ui";
import ErrorMessage from "../common/ErrorMessage";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Login.
 *
 * Validates locally first (so obvious mistakes never cost a round trip), then
 * calls the backend. The backend's `errors` array is mapped onto individual
 * fields; anything without a field (invalid credentials, deactivated account)
 * is shown as a form-level message.
 */
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Return the user to wherever the guard bounced them from, if any; otherwise
  // land in the authenticated dashboard rather than the public home page.
  const redirectTo = location.state?.from?.pathname ?? "/dashboard";

  // Already signed in? Don't show the form. Safe here because AuthProvider
  // mounted above the router, so the session check has already settled.
  if (!loading && isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const validate = () => {
    const next = {};

    if (!email.trim()) {
      next.email = "Email is required.";
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      next.email = "Enter a valid email address.";
    }

    if (!password) {
      next.password = "Password is required.";
    }

    return next;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Guard against double submits (e.g. a fast double-click or Enter + click).
    if (isSubmitting) return;

    const localErrors = validate();

    if (Object.keys(localErrors).length) {
      setFieldErrors(localErrors);
      setError("");
      return;
    }

    setFieldErrors({});
    setError("");
    setIsSubmitting(true);

    try {
      await login({ email: email.trim(), password });
      navigate(redirectTo, { replace: true });
    } catch (requestError) {
      setFieldErrors(getFieldErrors(requestError));
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Login</h1>

      <p className="mt-2 text-sm text-slate-600">
        Sign in to post discussions and join the conversation.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
        <div>
          <label htmlFor="login-email" className={`mb-1 ${labelClass}`}>
            Email
          </label>

          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isSubmitting}
            aria-invalid={fieldErrors.email ? "true" : undefined}
            aria-describedby={fieldErrors.email ? "login-email-error" : undefined}
            className={inputClass(Boolean(fieldErrors.email))}
          />

          {fieldErrors.email ? (
            <p id="login-email-error" className={`mt-1 ${fieldErrorClass}`}>
              {fieldErrors.email}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="login-password" className={`mb-1 ${labelClass}`}>
            Password
          </label>

          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isSubmitting}
            aria-invalid={fieldErrors.password ? "true" : undefined}
            aria-describedby={
              fieldErrors.password ? "login-password-error" : undefined
            }
            className={inputClass(Boolean(fieldErrors.password))}
          />

          {fieldErrors.password ? (
            <p id="login-password-error" className={`mt-1 ${fieldErrorClass}`}>
              {fieldErrors.password}
            </p>
          ) : null}
        </div>

        {error ? <ErrorMessage message={error} /> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          className={buttonClass("primary", "md", "w-full")}
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="mt-6 text-sm text-slate-600">
        No account yet?{" "}
        <Link
          to="/register"
          className="font-medium text-slate-900 hover:underline"
        >
          Create one
        </Link>
      </p>
    </section>
  );
};

export default Login;
