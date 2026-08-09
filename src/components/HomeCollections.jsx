import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchHomeCollections } from "../services/banners";
import "./HomeCollections.css";

const COLLECTIONS = [
  { key: "men", title: "Men", description: "Built for every version of you.", to: "/men" },
  { key: "accessories", title: "Accessories", description: "The details that complete you.", to: "/accessories" },
  { key: "women", title: "Women", description: "Designed to express you.", to: "/women" },
];

const BENEFITS = [
  ["far fa-gem", "Premium quality", "Fine fabrics & long-lasting prints."],
  ["fas fa-pencil", "Custom designs", "Unique designs that represent you."],
  ["fas fa-users", "Made for teams", "Perfect for clubs, teams & organizations."],
  ["fas fa-tag", "Affordable prices", "High quality apparel at the best prices."],
];

export default function HomeCollections() {
  const [images, setImages] = useState({});
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    fetchHomeCollections().then(setImages);
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % COLLECTIONS.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <main className="home-collections" id="home">
      <div className="home-collections-heading">
        <p>Explore the Haven</p>
        <h3>Find Your Style</h3>
        <span>Premium custom apparel for every identity.<br />Made for comfort. Designed for you.</span>
      </div>
      <div className="home-collections-viewport">
        <div
          className="home-collections-grid"
          style={{ "--mobile-slide-offset": `-${activeIndex * (100 / COLLECTIONS.length)}%` }}
        >
          {COLLECTIONS.map(({ key, title, description, to }, index) => (
            <Link className={`home-collection${index === activeIndex ? " is-active" : ""}`} to={to} key={key} aria-label={`Explore ${title}`}>
              {images[key]?.url ? <img className="home-collection-image" src={images[key].url} alt={`${title} collection`} /> : <div className="home-collection-placeholder" aria-hidden="true"><span>Image placeholder</span></div>}
              <div className="home-collection-overlay" />
              <div className="home-collection-copy">
                <h2>{title}</h2>
                <p>{description}</p>
                <span>Explore {title} <i className="fas fa-arrow-right" aria-hidden="true" /></span>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="home-collections-dots" aria-label="Collection slides">
        {COLLECTIONS.map(({ title }, index) => (
          <button
            className={index === activeIndex ? "is-active" : ""}
            key={title}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-label={`Show ${title}`}
            aria-current={index === activeIndex ? "true" : undefined}
          />
        ))}
      </div>
      <div className="home-benefits" aria-label="The Haven benefits">
        {BENEFITS.map(([icon, title, copy]) => (
          <div key={title}><i className={icon} aria-hidden="true" /><p><strong>{title}</strong><span>{copy}</span></p></div>
        ))}
      </div>
    </main>
  );
}
