//const LOGO_SVG_WHITE = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 120'%3E%3Crect x='0' y='20' width='80' height='80' rx='12' fill='white'/%3E%3Ctext x='40' y='72' font-family='Arial' font-weight='bold' font-size='50' fill='%23111111' text-anchor='middle'%3ETH%3C/text%3E%3Ctext x='100' y='72' font-family='Arial' font-weight='bold' font-size='40' fill='white'%3ETHE HAVEN%3C/text%3E%3C/svg%3E`;
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
    icon: "fab fa-x-twitter",
    label: "Twitter",
    href: "https://x.com/yourhandle",
  },
  {
    icon: "fab fa-youtube",
    label: "YouTube",
    href: "https://youtube.com/@yourchannel",
  },
  {
    icon: "fab fa-behance",
    label: "Behance",
    href: "https://behance.net/yourprofile",
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
          <div className="footer-brand">
            <img src={logo} alt="The Haven" />
            <p>
              Premium custom apparel manufacturing for clubs, teams, and
              organizations. Quality, style, and comfort in every stitch.
            </p>
            <div className="social-links">
              {socials.map((s) => (
                <a
                  href={s.href}
                  key={s.label}
                  aria-label={s.label}
                  target="_blank"
                  rel="noreferrer"
                >
                  <i className={s.icon}></i>
                </a>
              ))}
            </div>
          </div>

          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              {quickLinks.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollTo(l.href);
                    }}
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
                  <a href="#">{s}</a>
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

        <div className="footer-bottom">
          <p>&copy; 2026 The Haven. All rights reserved.</p>
          <a
            href="#home"
            className="back-to-top"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <i className="fas fa-arrow-up"></i>
          </a>
        </div>
      </div>
    </footer>
  );
}
