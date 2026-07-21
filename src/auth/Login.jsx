import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "./AuthLayout";

function safeRedirect(path) {
  if (!path || typeof path !== "string") return null;
  if (!path.startsWith("/") || path.startsWith("//")) return null;
  return path;
}

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = safeRedirect(searchParams.get("redirect"));
  const { login, loginWithGoogle, resetPassword } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setError("");
    setSuccess("");
  };

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errs.email = "Enter a valid email";
    }
    if (!form.password) errs.password = "Password is required";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    const { error: loginError, isAdmin } = await login(
      form.email.trim(),
      form.password,
    );

    setLoading(false);

    if (loginError) {
      setError(loginError);
      return;
    }

    if (redirectTo) navigate(redirectTo);
    else navigate(isAdmin ? "/admin" : "/");
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError("");
    setSuccess("");

    const { error: googleError, isAdmin } = await loginWithGoogle();
    setGoogleLoading(false);

    if (googleError) {
      setError(googleError);
      return;
    }

    if (redirectTo) navigate(redirectTo);
    else navigate(isAdmin ? "/admin" : "/");
  };

  const handleForgotPassword = async () => {
    setError("");
    setSuccess("");

    if (!form.email.trim()) {
      setFieldErrors({ email: "Enter your email to reset password" });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setFieldErrors({ email: "Enter a valid email" });
      return;
    }

    setLoading(true);
    const { error: resetError } = await resetPassword(form.email.trim());
    setLoading(false);

    if (resetError) {
      setError(resetError);
      return;
    }

    setSuccess("Password reset link sent to your email.");
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue shopping with The Haven."
      brandTitle="Your style, your haven."
      brandText="Sign in to track orders, manage your cart, and discover new arrivals tailored for you."
    >
      {error && (
        <div className="auth-alert auth-alert-error" role="alert">
          <i className="fas fa-circle-exclamation" aria-hidden="true"></i>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="auth-alert auth-alert-success" role="status">
          <i className="fas fa-circle-check" aria-hidden="true"></i>
          <span>{success}</span>
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-field">
          <label htmlFor="login-email">Email</label>
          <div className="auth-input-wrap">
            <i className="far fa-envelope" aria-hidden="true"></i>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              className={fieldErrors.email ? "auth-input-error" : ""}
            />
          </div>
          {fieldErrors.email && (
            <span className="auth-field-error">{fieldErrors.email}</span>
          )}
        </div>

        <div className="auth-field">
          <label htmlFor="login-password">Password</label>
          <div className="auth-input-wrap">
            <i className="fas fa-lock" aria-hidden="true"></i>
            <input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              className={fieldErrors.password ? "auth-input-error" : ""}
            />
            <button
              type="button"
              className="auth-toggle-password"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <i
                className={`far ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                aria-hidden="true"
              ></i>
            </button>
          </div>
          {fieldErrors.password && (
            <span className="auth-field-error">{fieldErrors.password}</span>
          )}
        </div>

        <div className="auth-row">
          <label className="auth-remember">
            <input type="checkbox" name="remember" />
            Remember me
          </label>
          <button
            type="button"
            className="auth-link-btn"
            onClick={handleForgotPassword}
            disabled={loading}
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          className="btn btn-primary auth-submit"
          disabled={loading || googleLoading}
        >
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin" aria-hidden="true"></i>
              Signing in...
            </>
          ) : (
            <>
              Sign in
              <i className="fas fa-arrow-right" aria-hidden="true"></i>
            </>
          )}
        </button>
      </form>

      <div className="auth-divider">or</div>

      <button
        type="button"
        className="btn auth-google"
        onClick={handleGoogle}
        disabled={loading || googleLoading}
      >
        {googleLoading ? (
          <>
            <i className="fas fa-spinner fa-spin" aria-hidden="true"></i>
            Connecting...
          </>
        ) : (
          <>
            <svg
              className="auth-google-icon"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </>
        )}
      </button>

      <p className="auth-switch">
        Don&apos;t have an account?
        <Link to={redirectTo ? `/signup?redirect=${encodeURIComponent(redirectTo)}` : "/signup"}>
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}
