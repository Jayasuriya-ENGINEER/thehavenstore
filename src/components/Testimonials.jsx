import  { useEffect, useState } from "react";

export default function Testimonials() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetches live from your Vercel serverless function
    fetch("/api/get-reviews")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setReviews(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading reviews:", err);
        setLoading(false);
      });
  }, []);

  if (loading)
    return <div className="loading-state">Syncing live store feedback...</div>;
  if (reviews.length === 0) return null;

  // Split live array into two balanced tracks
  const half = Math.ceil(reviews.length / 2);
  const row1 = reviews.slice(0, half);
  const row2 = reviews.slice(half);

  // Duplicate arrays to protect the seamless infinite alignment reset loop
  const row1Doubled = [...row1, ...row1];
  const row2Doubled = [...row2, ...row2];

  const renderCard = (t, index) => (
    <div className="testimonial-card" key={`${t.name}-${index}`}>
      <div className="testimonial-rating">
        {[...Array(t.rating)].map((_, i) => (
          <i className="fas fa-star" key={i} />
        ))}
      </div>
      <p className="testimonial-text">"{t.text}"</p>
      <div className="testimonial-author">
        <div className="author-avatar">
          <i className="fas fa-user" />
        </div>
        <div className="author-info">
          <h4>{t.name}</h4>
          <p>{t.role}</p>
        </div>
      </div>
    </div>
  );

  return (
    <section className="testimonials" id="testimonials">
      <div className="container">
        <div className="section-header reveal">
          <span className="section-tag">Live Reviews</span>
          <h2 className="section-title">What Our Clients Say</h2>
        </div>

        <div className="marquee-container">
          <div className="marquee-row">
            <div className="marquee-track track-left">
              {row1Doubled.map((t, i) => renderCard(t, i))}
            </div>
          </div>

          <div className="marquee-row">
            <div className="marquee-track track-right">
              {row2Doubled.map((t, i) => renderCard(t, i))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
