import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { getFieldErrors } from "../../services/auth";
import {
  buttonClass,
  fieldErrorClass,
  hintClass,
  inputClass,
  labelClass,
} from "../common/ui";
import ErrorMessage from "../common/ErrorMessage";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

/**
 * Registration.
 *
 * Mirrors the backend's rules (name >= 2, valid email, password >= 8) so the
 * user gets immediate feedback, then sends the request. The backend remains the
 * authority: its per-field `errors` are rendered against the matching inputs,
 * and a 409 for a duplicate email is surfaced as a field error on `email`.
 */
const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  // A signed-in visitor has no reason to see the register form; send them into
  // the application.
  if (!loading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const validate = () => {
    const next = {};

    const trimmedName = name.trim();

    if (!trimmedName) {
      next.name = "Name is required.";
    } else if (trimmedName.length < 2) {
      next.name = "Name must be at least 2 characters.";
    } else if (trimmedName.length > 100) {
      next.name = "Name cannot exceed 100 characters.";
    }

    if (!email.trim()) {
      next.email = "Email is required.";
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      next.email = "Enter a valid email address.";
    }

    if (!password) {
      next.password = "Password is required.";
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      next.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    }

    if (!confirmPassword) {
      next.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      next.confirmPassword = "Passwords do not match.";
    }

    return next;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

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
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      // Registration authenticates the user in the same request (the backend
      // sets the auth cookie on the 201), so go straight into the application.
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      const serverFieldErrors = getFieldErrors(requestError);

      // A duplicate email arrives as 409 with a plain message rather than a
      // field-level error, so attach it to the email input explicitly.
      if (requestError.status === 409 && !serverFieldErrors.email) {
        serverFieldErrors.email = requestError.message;
      }

      setFieldErrors(serverFieldErrors);

      // Only show the banner when the message isn't already pinned to a field.
      const unassigned = Object.keys(serverFieldErrors).length === 0;

      setError(unassigned ? requestError.message : "");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">
        Create account
      </h1>

      <p className="mt-2 text-sm text-slate-600">
        Join the community to post discussions and replies.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
        <div>
          <label
            htmlFor="register-name"
            className={`mb-1 ${labelClass}`}
          >
            Full name
          </label>

          <input
            id="register-name"
            name="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={isSubmitting}
            aria-invalid={fieldErrors.name ? "true" : undefined}
            aria-describedby={fieldErrors.name ? "register-name-error" : undefined}
            className={inputClass(Boolean(fieldErrors.name))}
          />

          {fieldErrors.name ? (
            <p id="register-name-error" className={`mt-1 ${fieldErrorClass}`}>
              {fieldErrors.name}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="register-email"
            className={`mb-1 ${labelClass}`}
          >
            Email
          </label>

          <input
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isSubmitting}
            aria-invalid={fieldErrors.email ? "true" : undefined}
            aria-describedby={fieldErrors.email ? "register-email-error" : undefined}
            className={inputClass(Boolean(fieldErrors.email))}
          />

          {fieldErrors.email ? (
            <p id="register-email-error" className={`mt-1 ${fieldErrorClass}`}>
              {fieldErrors.email}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="register-password"
            className={`mb-1 ${labelClass}`}
          >
            Password
          </label>

          <div className="flex gap-2">
            <input
              id="register-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isSubmitting}
              aria-invalid={fieldErrors.password ? "true" : undefined}
              aria-describedby={
                fieldErrors.password
                  ? "register-password-error"
                  : "register-password-hint"
              }
              className={inputClass(Boolean(fieldErrors.password))}
            />

            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className={buttonClass("secondary", "sm", "shrink-0")}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {fieldErrors.password ? (
            <p id="register-password-error" className={`mt-1 ${fieldErrorClass}`}>
              {fieldErrors.password}
            </p>
          ) : (
            <p id="register-password-hint" className={`mt-1 ${hintClass}`}>
              At least {MIN_PASSWORD_LENGTH} characters.
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="register-confirm-password"
            className={`mb-1 ${labelClass}`}
          >
            Confirm password
          </label>

          <input
            id="register-confirm-password"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            disabled={isSubmitting}
            aria-invalid={fieldErrors.confirmPassword ? "true" : undefined}
            aria-describedby={
              fieldErrors.confirmPassword
                ? "register-confirm-password-error"
                : undefined
            }
            className={inputClass(Boolean(fieldErrors.confirmPassword))}
          />

          {fieldErrors.confirmPassword ? (
            <p
              id="register-confirm-password-error"
              className={`mt-1 ${fieldErrorClass}`}
            >
              {fieldErrors.confirmPassword}
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
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-sm text-slate-600">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-slate-900 hover:underline">
          Login
        </Link>
      </p>
    </section>
  );
};

export default Register;
