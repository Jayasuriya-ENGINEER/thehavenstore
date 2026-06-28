import { useState, useEffect } from "react";
import logo from "../assets/logo.png";
//const LOGO_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 120'%3E%3Crect x='0' y='20' width='80' height='80' rx='12' fill='%23111111'/%3E%3Ctext x='40' y='72' font-family='Arial' font-weight='bold' font-size='50' fill='white' text-anchor='middle'%3ETH%3C/text%3E%3Ctext x='100' y='72' font-family='Arial' font-weight='bold' font-size='40' fill='%23111111'%3ETHE HAVEN%3C/text%3E%3C/svg%3E`;

const navItems = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Products", href: "#products" },
  { label: "Bulk Orders", href: "#bulk-orders" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("#home");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

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

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLinkClick = (e, href) => {
    e.preventDefault();
    setMenuOpen(false);
    document.body.style.overflow = "";
    const target = document.querySelector(href);
    if (target) {
      const offset =
        target.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: offset, behavior: "smooth" });
    }
  };

  const toggleMenu = () => {
    setMenuOpen((prev) => {
      document.body.style.overflow = !prev ? "hidden" : "";
      return !prev;
    });
  };

  return (
    <nav className={`navbar${scrolled ? " scrolled" : ""}`} id="navbar">
      <div className="nav-container">
        <a
          href="#home"
          className="nav-logo"
          onClick={(e) => handleLinkClick(e, "#home")}
        >
          <img src={logo} alt="The Haven Logo" />
        </a>

        <div className={`nav-menu${menuOpen ? " active" : ""}`} id="navMenu">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`nav-link${activeLink === item.href ? " active" : ""}`}
              onClick={(e) => handleLinkClick(e, item.href)}
            >
              {item.label}
            </a>
          ))}
          <a
            href="https://wa.me/7502737734"
            className="nav-cta"
            target="_blank"
            rel="noreferrer"
            style={{ backgroundColor: "#000000", color: "#ffffff" }}
          >
            <i className="fab fa-whatsapp"></i> WhatsApp
          </a>
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
