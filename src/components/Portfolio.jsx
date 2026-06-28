const projects = [
  {
    title: "College Fest Merchandise",
    desc: "500+ Custom T-Shirts",
    delay: "",
  },
  {
    title: "Corporate Team Building",
    desc: "200+ Polo Shirts",
    delay: "delay-100",
  },
  {
    title: "Sports Team Jerseys",
    desc: "150+ Custom Jerseys",
    delay: "delay-200",
  },
  { title: "Startup Launch Event", desc: "100+ Hoodies", delay: "" },
  { title: "University Society", desc: "300+ Sweatshirts", delay: "delay-100" },
  { title: "Community Event", desc: "250+ Custom Tops", delay: "delay-200" },
];

export default function Portfolio() {
  return (
    <section className="portfolio">
      <div className="container">
        <div className="section-header reveal">
          <span className="section-tag">Our Work</span>
          <h2 className="section-title">Previous Projects</h2>
        </div>

        <div className="portfolio-grid">
          {projects.map((p) => (
            <div className={`portfolio-item reveal ${p.delay}`} key={p.title}>
              <div className="portfolio-image">
                <div className="portfolio-placeholder"></div>
              </div>
              <div className="portfolio-overlay">
                <h4>{p.title}</h4>
                <p>{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
