import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FloatingButtons from "../components/FloatingButtons";
import EnquiryForm from "../components/EnquiryForm";
import { products } from "../components/Products";
import useScrollReveal from "../hooks/useScrollReveal";
import "./BulkOrdersPage.css";

const categories = [
  { icon: "fas fa-graduation-cap", label: "College Clubs" },
  { icon: "fas fa-briefcase", label: "Corporate Teams" },
  { icon: "fas fa-calendar-alt", label: "Events" },
  { icon: "fas fa-futbol", label: "Sports Teams" },
  { icon: "fas fa-rocket", label: "Startups" },
  { icon: "fas fa-school", label: "Schools & Universities" },
];

const steps = [
  {
    num: "01",
    title: "Choose products",
    desc: "Select the apparel styles that fit your team or event.",
  },
  {
    num: "02",
    title: "Share requirements",
    desc: "Tell us quantities, branding, and any custom details.",
  },
  {
    num: "03",
    title: "Get your quote",
    desc: "We respond within 24 hours with pricing and next steps.",
  },
];

const perks = [
  { icon: "fas fa-layer-group", label: "Low MOQ friendly" },
  { icon: "fas fa-clock", label: "24h quote response" },
  { icon: "fas fa-palette", label: "Custom branding" },
  { icon: "fas fa-truck", label: "Pan-India delivery" },
];

export default function BulkOrdersPage() {
  useScrollReveal();
  const [selectedApparel, setSelectedApparel] = useState("");
  const [selectedName, setSelectedName] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleProductSelect = (product) => {
    setSelectedApparel(product.apparelValue);
    setSelectedName(product.name);

    // Soft focus on form on smaller screens
    const formEl = document.getElementById("enquiry");
    if (formEl && window.innerWidth < 1024) {
      const offset =
        formEl.getBoundingClientRect().top + window.pageYOffset - 100;
      window.scrollTo({ top: offset, behavior: "smooth" });
    }
  };

  return (
    <div className="bulk-page">
      <Navbar solid />

      {/* Hero */}
      <header className="bulk-page-hero">
        <div className="container bulk-page-hero-inner">
          <nav className="bulk-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span className="current">Bulk Orders</span>
          </nav>
          <span className="section-tag bulk-hero-tag">Wholesale & Teams</span>
          <h1>Custom bulk apparel, built for your organization</h1>
          <p>
            From college fests to corporate kits — pick your styles, tell us
            what you need, and get a tailored quote from The Haven.
          </p>
          <div className="bulk-hero-perks">
            {perks.map((p) => (
              <div className="bulk-hero-perk" key={p.label}>
                <i className={p.icon} aria-hidden="true"></i>
                <span>{p.label}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Process */}
      <section className="bulk-page-steps" aria-label="How bulk orders work">
        <div className="container">
          <div className="bulk-steps-grid">
            {steps.map((s) => (
              <div className="bulk-step reveal" key={s.num}>
                <span className="bulk-step-num">{s.num}</span>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products + Enquiry — main mix layout */}
      <section className="bulk-page-main" aria-label="Products and enquiry">
        <div className="container">
          <div className="bulk-page-layout">
            {/* Catalog */}
            <div className="bulk-catalog">
              <div className="bulk-catalog-header reveal">
                <span className="section-tag">Our Products</span>
                <h2 className="section-title">What We Manufacture</h2>
                <p>
                  Select a style to auto-fill the enquiry form with that
                  apparel type.
                </p>
              </div>

              <div className="bulk-products-grid">
                {products.map((p) => {
                  const isSelected = selectedApparel === p.apparelValue;
                  return (
                    <button
                      type="button"
                      key={p.name}
                      className={`bulk-product-card reveal ${p.delay}${
                        isSelected ? " is-selected" : ""
                      }`}
                      onClick={() => handleProductSelect(p)}
                      aria-pressed={isSelected}
                    >
                      <div className="bulk-product-image">
                        {isSelected && (
                          <span className="bulk-selected-badge">
                            <i className="fas fa-check" aria-hidden="true"></i>
                            Selected
                          </span>
                        )}
                        <img src={p.img} alt={p.alt} />
                      </div>
                      <div className="bulk-product-body">
                        <h3>{p.name}</h3>
                        <p>{p.desc}</p>
                        <span className="bulk-product-cta">
                          {isSelected ? "Selected for quote" : "Select for quote"}
                          <i
                            className={`fas ${isSelected ? "fa-check" : "fa-arrow-right"}`}
                            aria-hidden="true"
                          ></i>
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sticky enquiry panel */}
            <aside className="bulk-enquiry-panel reveal">
              <div className="bulk-enquiry-card">
                <div className="bulk-enquiry-card-header">
                  <span className="section-tag">Get a Quote</span>
                  <h2>Request a Price Enquiry</h2>
                  <p>
                    {selectedName
                      ? `Quoting for ${selectedName}. Adjust details below — we'll reply within 24 hours.`
                      : "Fill out the form below and we'll get back to you within 24 hours."}
                  </p>
                </div>

                <EnquiryForm
                  embedded
                  hideHeader
                  selectedApparel={selectedApparel}
                />

                <div className="bulk-enquiry-alt">
                  <span>Prefer chat?</span>
                  <a
                    href="https://wa.me/8376907227"
                    className="btn btn-whatsapp bulk-wa-btn"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <i className="fab fa-whatsapp" aria-hidden="true"></i>
                    Order on WhatsApp
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Who we serve */}
      <section className="bulk-page-audience" aria-label="Who we serve">
        <div className="container">
          <div className="bulk-audience-inner reveal">
            <div className="bulk-audience-text">
              <span className="section-tag">Bulk Orders</span>
              <h2 className="section-title">
                Built for teams, clubs &amp; companies
              </h2>
              <p>
                Looking to create custom apparel for your group? The Haven
                specializes in bulk manufacturing with consistent quality and
                flexible branding options.
              </p>
            </div>
            <div className="bulk-audience-grid">
              {categories.map((c) => (
                <div className="bulk-audience-item" key={c.label}>
                  <i className={c.icon} aria-hidden="true"></i>
                  <span>{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <FloatingButtons />
    </div>
  );
}
