const features = [
  {
    icon: "fas fa-gem",
    title: "Premium Quality",
    desc: "Top-grade fabrics and meticulous attention to detail in every stitch.",
    delay: "",
  },
  {
    icon: "fas fa-tag",
    title: "Affordable Pricing",
    desc: "Competitive prices without compromising on quality or style.",
    delay: "delay-100",
  },
  {
    icon: "fas fa-paint-brush",
    title: "Custom Designs",
    desc: "Your vision, our expertise. We bring your designs to life perfectly.",
    delay: "delay-200",
  },
  {
    icon: "fas fa-award",
    title: "Trusted by Clubs",
    desc: "Preferred choice for colleges, teams, and organizations.",
    delay: "delay-100",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="why-choose">
      <div className="container">
        <div className="section-header reveal">
          <span className="section-tag">Why Choose Us</span>
          <h2 className="section-title">The Haven Difference</h2>
        </div>

        <div className="features-grid">
          {features.map((f) => (
            <div className={`feature-box reveal ${f.delay}`} key={f.title}>
              <div className="feature-box-icon">
                <i className={f.icon}></i>
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
