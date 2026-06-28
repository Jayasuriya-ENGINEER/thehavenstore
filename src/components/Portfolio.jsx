import pr1 from "../assets/pr1.png";
import pr2 from "../assets/pr2.png";
import pr3 from "../assets/pr3.jpeg";
import pr5 from "../assets/pr5.jpeg";
import pr6 from "../assets/pr6.png";



const projects = [
  {
    title: "College Fest Merchandise",
    desc: "500+ Custom T-Shirts",
    delay: "",
    image: pr1,
  },
  {
    title: "Sports Event Merchandise",
    desc: "1000+ Sports Jerseys",
    delay: "delay-100",
    image: pr2,
  },
  {
    title: "Q&A Event",
    desc: "In partnership with GeeksforGeeks",
    delay: "delay-200",
    image: pr3,
  },
  {
    title: "University Society",
    desc: "25+ college clubs associated with us",
    delay: "delay-100",
    image: pr5,
  },
  {
    title: "Community Event",
    desc: "250+ Custom Tops",
    delay: "delay-200",
    image: pr6,
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
