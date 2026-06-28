import { useEffect, useRef } from "react";

const stats = [
  { value: 5000, suffix: "+", label: "Happy Clients" },
  { value: 50, suffix: "+", label: "Organizations" },
  { value: 100, suffix: "%", label: "Quality Assured" },
];

const features = [
  {
    icon: "fas fa-tshirt",
    title: "Custom Manufacturing",
    desc: "Bring your designs to life with our expert manufacturing services.",
  },
  {
    icon: "fas fa-palette",
    title: "Unique Designs",
    desc: "Stand out with creative and trendy apparel designs.",
  },
  {
    icon: "fas fa-shield-alt",
    title: "Premium Quality",
    desc: "Only the finest fabrics and materials for lasting comfort.",
  },
];

function animateCounter(el, end, suffix, duration = 2000) {
  let start = 0;
  const step = () => {
    start += Math.ceil(end / 50);
    if (start >= end) {
      el.textContent = end + suffix;
      return;
    }
    el.textContent = start + suffix;
    setTimeout(step, 30);
  };
  step();
}

export default function About() {
  const statRefs = useRef([]);

  useEffect(() => {
    const observers = statRefs.current.map((el, i) => {
      if (!el) return null;
      const { value, suffix } = stats[i];
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            animateCounter(el, value, suffix);
            obs.unobserve(el);
          }
        },
        { threshold: 0.5 },
      );
      obs.observe(el);
      return obs;
    });

    return () => observers.forEach((o) => o && o.disconnect());
  }, []);

  return (
    <section className="about" id="about">
      <div className="container">
        <div className="section-header reveal">
          <span className="section-tag">About Us</span>
          <h2 className="section-title">
            Crafting Comfort,
            <br />
            Delivering Style
          </h2>
        </div>

        <div className="about-grid">
          <div className="about-content reveal">
            <p className="about-text">
              The Haven is more than just a clothing brand – we're your partners
              in self-expression. We specialize in creating stylish, trendy, and
              high-quality apparel that helps individuals and organizations
              stand out with confidence.
            </p>
            <p className="about-text">
              From college clubs to corporate teams, from student societies to
              sports organizations, we manufacture custom apparel that reflects
              your unique identity while ensuring maximum comfort and
              durability.
            </p>

            <div className="about-stats">
              {stats.map((s, i) => (
                <div className="stat-item" key={s.label}>
                  <h3 ref={(el) => (statRefs.current[i] = el)}>0{s.suffix}</h3>
                  <p>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="about-features reveal delay-200">
            {features.map((f) => (
              <div className="feature-card" key={f.title}>
                <div className="feature-icon">
                  <i className={f.icon}></i>
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
