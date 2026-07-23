//const LOGO_SVG_WHITE = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 120'%3E%3Crect x='0' y='20' width='80' height='80' rx='12' fill='white'/%3E%3Ctext x='40' y='72' font-family='Arial' font-weight='bold' font-size='50' fill='%23111111' text-anchor='middle'%3ETH%3C/text%3E%3Ctext x='100' y='72' font-family='Arial' font-weight='bold' font-size='40' fill='white'%3ETHE HAVEN%3C/text%3E%3C/svg%3E`;
import { Link } from "react-router-dom";
import logo from  "../assets/logo.png";
const socials = [
  {
    icon: "fab fa-instagram",
    label: "Instagram",
    href: "https://www.instagram.com/thehavenstore.in?igsh=YmZicWxiang3ODQy",
  },
  {
    icon: "fab fa-linkedin-in",
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/the-haven-store/about/",
  },
  {
    icon: "fab fa-facebook-f",
    label: "Facebook",
    href: "https://facebook.com/yourpage",
  },
  {
    icon: "fab fa-discord",
    color: "#ffffff",
    label: "Twitter",
    href: "https://x.com/yourhandle",
  },
  {
    icon: "fab fa-youtube",
    label: "YouTube",
    href: "https://youtube.com/@the_haven_store?si=XVIz88cuQQ1hwulr",
  },
  {
    icon: "fab fa-behance",
    label: "Behance",
    href: "https://www.behance.net/thehavenstore",
  },
  {
    icon: "fab fa-pinterest-p",
    label: "Pinterest",
    href: "https://in.pinterest.com/thehavenstoreofficial/",
  },
];

const quickLinks = [
  { href: "#home", label: "Home", type: "hash" },
  { href: "#about", label: "About Us", type: "hash" },
  { href: "#products", label: "Products", type: "hash" },
  { href: "/bulk-orders", label: "Bulk Orders", type: "route" },
  { href: "#testimonials", label: "Testimonials", type: "hash" },
];

const services = [
  "Custom T-Shirts",
  "Hoodies & Sweatshirts",
  "Polo Shirts",
  "Corporate Wear",
  "Event Merchandise",
];

const policy = [
  { href: "#", label: "Shipping Policy" },
  { href: "#", label: "Return Policy" },
  { href: "#", label: "Privacy Policy" },
  { href: "#", label: "Terms of Service" },
  { href: "#", label: "FAQ" },
];

const carreer = [
  { href: "#", label: "Campus Ambassadors" },
  { href: "#", label: "Internships" },
];

const scrollTo = (href) => {
  const el = document.querySelector(href);
  if (el) {
    const offset = el.getBoundingClientRect().top + window.pageYOffset - 80;
    window.scrollTo({ top: offset, behavior: "smooth" });
  }
};

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              {quickLinks.map((l) => (
                <li key={l.label}>
                  {l.type === "route" ? (
                    <Link to={l.href}>{l.label}</Link>
                  ) : (
                    <a
                      href={l.href}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollTo(l.href);
                      }}
                    >
                      {l.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-links">
            <h4>Services</h4>
            <ul>
              {services.map((s) => (
                <li key={s}>
                  <a href="#">{s}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-links">
            <h4>Policies</h4>

            <ul>
              {policy.map((item) => (
                <li key={item.label}>
                  <a href={item.href}>{item.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-links">
            <h4>Careers</h4>

            <ul>
              {carreer.map((item) => (
                <li key={item.label}>
                  <a href={item.href}>{item.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-contact">
            <h4>Contact Info</h4>
            <ul>
              <li>
                <i className="fas fa-phone-alt"></i> +91 83769 07227
              </li>
              <li>
                <i className="fas fa-envelope"></i>{" "}
                thehavenstoreofficial@gmail.com
              </li>
              <li>
                <i className="fas fa-map-marker-alt"></i> 70, behind Gaur Homes
                Elegante, Shatabdi Puram, Block I, Block E, Govindpuram,
                Ghaziabad, Uttar Pradesh 201013,
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-social">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              aria-label={s.label}
            >
              <i className={s.icon}></i>
            </a>
          ))}
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 The Haven. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}



