import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import "./Navbar.css";

const navItems = [
  { label: "Home", type: "route", to: "/" },
  { label: "Men", type: "route", to: "/men" },
  { label: "Women", type: "route", to: "/women" },
  { label: "Accessories", type: "route", to: "/accessories" },
  { label: "Bulk Orders", type: "route", to: "/bulk-orders" },
];

export default function Navbar({ solid = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, userData, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("#home");
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const forceSolid = solid || location.pathname !== "/";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      if (location.pathname !== "/") return;

      const sections = document.querySelectorAll("section[id]");
      const scrollPos = window.scrollY + 100;
      sections.forEach((section) => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          setActiveLink(`#${section.id}`);
        }
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeMenu = () => {
    setMenuOpen(false);
    document.body.style.overflow = "";
  };

  const handleHashClick = (e, href) => {
    e.preventDefault();
    closeMenu();
    if (!href || href === "#") return;

    if (location.pathname !== "/") {
      navigate("/" + href);
      return;
    }

    const target = document.querySelector(href);
    if (target) {
      const offset =
        target.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: offset, behavior: "smooth" });
    }
  };

  const handleRouteClick = () => {
    closeMenu();
  };

  const toggleMenu = () => {
    setMenuOpen((prev) => {
      document.body.style.overflow = !prev ? "hidden" : "";
      return !prev;
    });
  };

  const handleProfileClick = (e) => {
    e.preventDefault();
    if (!currentUser) {
      navigate("/login");
      return;
    }
    setProfileOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    setProfileOpen(false);
    await logout();
  };

  const displayName =
    userData?.displayName ||
    currentUser?.displayName ||
    currentUser?.email?.split("@")[0] ||
    "Account";

  const isActive = (item) => {
    if (item.type === "route") {
      if (item.to === "/") return location.pathname === "/";
      return location.pathname === item.to || location.pathname.startsWith(item.to + "/");
    }
    return location.pathname === "/" && activeLink === item.to;
  };

  return (
    <nav
      className={`navbar${scrolled || forceSolid ? " scrolled" : ""}`}
      id="navbar"
    >
      <div className="nav-container">
        <Link
          to="/"
          className="nav-logo"
          onClick={() => {
            closeMenu();
            if (location.pathname === "/") {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
        >
          <img src={logo} alt="The Haven Logo" />
        </Link>

        <div className={`nav-menu${menuOpen ? " active" : ""}`} id="navMenu">
          {navItems.map((item) => {
            if (item.type === "route") {
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`nav-link${isActive(item) ? " active" : ""}`}
                  onClick={handleRouteClick}
                >
                  {item.label}
                </Link>
              );
            }

            return (
              <a
                key={item.label}
                href={item.to}
                className={`nav-link${isActive(item) ? " active" : ""}`}
                onClick={(e) => handleHashClick(e, item.to)}
              >
                {item.label}
              </a>
            );
          })}
        </div>

        <div className="nav-actions">
          <div className="nav-profile-wrap" ref={profileRef}>
            <button
              type="button"
              className={`nav-icon-btn${currentUser ? " is-logged-in" : ""}`}
              aria-label={currentUser ? "Account menu" : "Login"}
              title={currentUser ? displayName : "Login"}
              aria-expanded={profileOpen}
              onClick={handleProfileClick}
            >
              <i className="far fa-user" aria-hidden="true"></i>
            </button>

            {currentUser && profileOpen && (
              <div className="nav-profile-menu" role="menu">
                <div className="nav-profile-header">
                  <span className="nav-profile-name">{displayName}</span>
                  <span className="nav-profile-email">
                    {currentUser.email}
                  </span>
                </div>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="nav-profile-item"
                    role="menuitem"
                    onClick={() => {
                      setProfileOpen(false);
                      closeMenu();
                    }}
                  >
                    <i className="fas fa-gauge-high" aria-hidden="true"></i>
                    Admin dashboard
                  </Link>
                )}
                <button
                  type="button"
                  className="nav-profile-item"
                  role="menuitem"
                  onClick={handleLogout}
                >
                  <i className="fas fa-right-from-bracket" aria-hidden="true"></i>
                  Log out
                </button>
              </div>
            )}
          </div>

          <Link
            to="/cart"
            className="nav-icon-btn nav-cart-btn"
            aria-label={`Bag${itemCount ? `, ${itemCount} items` : ""}`}
            title="Bag"
            onClick={closeMenu}
          >
            <i className="fas fa-shopping-bag" aria-hidden="true"></i>
            {itemCount > 0 && (
              <span className="cart-badge">{itemCount > 99 ? "99+" : itemCount}</span>
            )}
          </Link>
        </div>

        <div
          className={`hamburger${menuOpen ? " active" : ""}`}
          id="hamburger"
          onClick={toggleMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </nav>
  );
}
