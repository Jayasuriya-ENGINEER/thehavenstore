import banner1 from "../assets/banner1.jpg";
import bannerforhome from "../assets/bannerforhome.png";
import logo from "../assets/logo.png";

//const LOGO_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 120'%3E%3Crect x='0' y='20' width='80' height='80' rx='12' fill='%23111111'/%3E%3Ctext x='40' y='72' font-family='Arial' font-weight='bold' font-size='50' fill='white' text-anchor='middle'%3ETH%3C/text%3E%3Ctext x='100' y='72' font-family='Arial' font-weight='bold' font-size='40' fill='%23111111'%3ETHE HAVEN%3C/text%3E%3C/svg%3E`;

export default function Hero() {
  const scrollTo = (href) => {
    const el = document.querySelector(href);
    if (el) {
      const offset = el.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: offset, behavior: "smooth" });
    }
  };

  return (
    <section className="hero" id="home">
      <div className="hero-background">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
      </div>

      <div className="hero-container">
        <div className="hero-content reveal">
          <div className="hero-logo">
            <img src={logo} alt="The Haven" />
          </div>
          <h1 className="hero-title">
            Wear Your <span className="highlight">Identity</span>
            <br />
            With Confidence
          </h1>
          <p className="hero-subtitle">
            Premium custom apparel manufacturing for clubs, teams, and
            organizations. High-quality fabrics, unique designs, and affordable
            prices.
          </p>
          <div className="hero-buttons">
            <button
              className="btn btn-primary"
              onClick={() => scrollTo("#enquiry")}
            >
              Get a Quote
            </button>
            <a
              href="https://wa.me/8376907227"
              className="btn btn-secondary"
              target="_blank"
              rel="noreferrer"
            >
              <i className="fab fa-whatsapp"></i> Chat on WhatsApp
            </a>
          </div>
        </div>

        <div className="hero-image reveal delay-200">
          <div className="image-container">
            <div className="apparel-mockup">
              <div className="mockup-tshirt">
                <img src={banner1} alt="T-Shirt Mockup" />
              </div>
              <div className="mockup-hoodie">
                <img src={bannerforhome} alt="brand photo" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="scroll-indicator">
        <div className="mouse">
          <div className="wheel"></div>
        </div>
        <p>Scroll to explore</p>
      </div>
    </section>
  );
}
