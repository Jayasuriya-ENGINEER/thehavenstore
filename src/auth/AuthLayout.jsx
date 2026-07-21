import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import "./Auth.css";

export default function AuthLayout({
  title,
  subtitle,
  brandTitle,
  brandText,
  children,
}) {
  return (
    <div className="auth-page">
      <aside className="auth-brand" aria-hidden="false">
        <div className="auth-brand-top">
          <Link to="/" className="auth-brand-logo">
            <img src={logo} alt="The Haven" />
          </Link>
        </div>

        <div className="auth-brand-content">
          <span className="auth-brand-tag">The Haven Store</span>
          <h1>{brandTitle}</h1>
          <p>{brandText}</p>
        </div>

        <div className="auth-brand-footer">
          Premium apparel crafted for everyday comfort.
        </div>
      </aside>

      <main className="auth-panel">
        <div className="auth-panel-inner">
          <Link to="/" className="auth-mobile-logo" aria-label="The Haven Home">
            <img src={logo} alt="The Haven" />
          </Link>

          <header className="auth-panel-header">
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </header>

          {children}

          <Link to="/" className="auth-back-home">
            <i className="fas fa-arrow-left" aria-hidden="true"></i>
            Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}
