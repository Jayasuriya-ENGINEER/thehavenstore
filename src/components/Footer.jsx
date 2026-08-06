//const LOGO_SVG_WHITE = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 120'%3E%3Crect x='0' y='20' width='80' height='80' rx='12' fill='white'/%3E%3Ctext x='40' y='72' font-family='Arial' font-weight='bold' font-size='50' fill='%23111111' text-anchor='middle'%3ETH%3C/text%3E%3Ctext x='100' y='72' font-family='Arial' font-weight='bold' font-size='40' fill='white'%3ETHE HAVEN%3C/text%3E%3C/svg%3E`;
import { Link, useLocation, useNavigate } from "react-router-dom";
const socials = [
  {
    icon: "fab fa-instagram",
    label: "Instagram",
    href: "https://www.instagram.com/thehavenstore.in?igsh=YmZicWxiang3ODQy",
  },
  {
    icon: "fab fa-linkedin-in",
    label: "LinkedIn",
    href: " https://www.google.com/url?sa=t&source=web&rct=j&opi=89978449&url=https://in.linkedin.com/company/the-haven-store&ved=2ahUKEwjt34Gz9amVAxWVSWwGHSw9C3wQFnoECCAQAQ&sqi=2&usg=AOvVaw0ulWZEHPoO4YCYXsICZwQ9",
  },
  /*
  {
    icon: "fab fa-facebook-f",
    label: "Facebook",
    href: "https://facebook.com/yourpage",
  },*/
  {
    icon: "x-twitter",
    label: "Twitter",
    href: "https://x.com/The_Haven_Store",
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
  { href: "#home", label: "Home" },
  { href: "#about", label: "About Us" },
  { href: "#products", label: "Products" },
  { href: "#bulk-orders", label: "Bulk Orders" },
  { href: "#testimonials", label: "Testimonials" },
];

const services = [
  "Custom T-Shirts",
  "Hoodies & Sweatshirts",
  "Polo Shirts",
  "Corporate Wear",
  "Event Merchandise",
];

const policy = [
  { href: "/policies/shipping-policy", label: "Shipping Policy" },
  { href: "/policies/return-policy", label: "Return Policy" },
  { href: "/policies/privacy-policy", label: "Privacy Policy" },
  { href: "/policies/terms-of-service", label: "Terms of Service" },
  { href: "/policies/faq", label: "FAQ" },
];

const carreer = [
  { href: "#", label: "Campus Ambassadors" },
  { href: "/internships", label: "Internships" },
];

const scrollTo = (href) => {
  const el = document.querySelector(href);
  if (el) {
    const offset = el.getBoundingClientRect().top + window.pageYOffset - 80;
    window.scrollTo({ top: offset, behavior: "smooth" });
  }
};

export default function Footer() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleQuickLinkClick = (event, href) => {
    event.preventDefault();

    if (location.pathname !== "/") {
      navigate(`/${href}`);
      return;
    }

    scrollTo(href);
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              {quickLinks.map((l) => (
                <li key={l.label}>
                  <a
                    href={`/${l.href}`}
                    onClick={(event) => handleQuickLinkClick(event, l.href)}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-links">
            <h4>Services</h4>
            <ul>
              {services.map((s) => (
                <li key={s}>
                  <Link to="/bulk-orders">{s}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-links">
            <h4>Policies</h4>

            <ul>
              {policy.map((item) => (
                <li key={item.label}>
                  <Link to={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-links">
            <h4>Careers</h4>

            <ul>
              {carreer.map((item) => (
                <li key={item.label}>
                  {item.href.startsWith("/") ? (
                    <Link to={item.href}>{item.label}</Link>
                  ) : (
                    <a href={item.href}>{item.label}</a>
                  )}
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
              {s.icon === "x-twitter" ? (
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
                </svg>
              ) : (
                <i className={s.icon}></i>
              )}
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



