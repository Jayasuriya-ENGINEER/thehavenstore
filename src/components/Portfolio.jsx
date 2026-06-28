import pr1 from "../assets/pr1.jpeg";
import pr2 from "../assets/pr2.jpeg";
import hoodieImage from "../assets/hoodie.png";
import sweatshirtImage from "../assets/sweatwear.png";


const projects = [
  {
    title: "College Fest Merchandise",
    desc: "500+ Custom T-Shirts",
    delay: "",
    image: pr1,
  },
  {
    title: "Corporate Team Building",
    desc: "200+ Polo Shirts",
    delay: "delay-100",
    image: pr2,
  },
  {
    title: "Sports Team Jerseys",
    desc: "150+ Custom Jerseys",
    delay: "delay-200",
    image: pr1,
  },
  {
    title: "Startup Launch Event",
    desc: "100+ Hoodies",
    delay: "",
    image: hoodieImage,
  },
  {
    title: "University Society",
    desc: "300+ Sweatshirts",
    delay: "delay-100",
    image: sweatshirtImage,
  },
  {
    title: "Community Event",
    desc: "250+ Custom Tops",
    delay: "delay-200",
    image: pr1,
  },
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
                <img src={p.image} alt={p.title} loading="lazy" />
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
