import { useEffect, useState } from "react";

const placeholderReviews = [
  {
    name: "Rahul Sharma",
    role: "Business Owner",
    rating: 5,
    text: "Excellent fabric quality and premium printing. Delivery was exactly on time.",
    photo: null,
  },
  {
    name: "Priya Verma",
    role: "School Coordinator",
    rating: 5,
    text: "Professional team and beautiful custom uniforms. Highly recommended.",
    photo: null,
  },
  {
    name: "Arjun Mehta",
    role: "Startup Founder",
    rating: 5,
    text: "Very smooth ordering experience. The print quality exceeded expectations.",
    photo: null,
  },
  {
    name: "Sneha Kapoor",
    role: "Event Organizer",
    rating: 5,
    text: "Affordable pricing and fantastic customer service from start to finish.",
    photo: null,
  },
  {
    name: "Vikram Singh",
    role: "Gym Owner",
    rating: 5,
    text: "Our gym merchandise turned out amazing. Definitely ordering again.",
    photo: null,
  },
  {
    name: "Ananya Gupta",
    role: "College Club",
    rating: 5,
    text: "Fast delivery, premium fabric and excellent communication throughout.",
    photo: null,
  },
];

export default function Testimonials() {
  const [reviews, setReviews] = useState(placeholderReviews);

  useEffect(() => {
    async function loadReviews() {
      try {
        const res = await fetch("/api/get-reviews");
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          setTimeout(() => {
            setReviews(data);
          }, 500);
        }
      } catch (err) {
        console.error(err);
      }
    }

    loadReviews();
  }, []);

  const half = Math.ceil(reviews.length / 2);

  const row1 = [...reviews.slice(0, half), ...reviews.slice(0, half)];
  const row2 = [...reviews.slice(half), ...reviews.slice(half)];

  function renderStars(rating) {
    return (
      <div className="testimonial-rating">
        {Array.from({ length: rating }).map((_, i) => (
          <i key={i} className="fas fa-star" />
        ))}
      </div>
    );
  }

  function renderAvatar(review) {
    if (review.photo) {
      return <img src={review.photo} alt={review.name} loading="lazy" />;
    }

    return <span>{review.name.charAt(0)}</span>;
  }

  const Card = (review, index) => (
    <div className="testimonial-card" key={`${review.name}-${index}`}>
      {renderStars(review.rating)}

      <p className="testimonial-text">"{review.text}"</p>

      <div className="testimonial-author">
        <div className="author-avatar">{renderAvatar(review)}</div>

        <div className="author-info">
          <h4>{review.name}</h4>

          <p>{review.role}</p>
        </div>
      </div>
    </div>
  );

  return (
    <section className="testimonials" id="testimonials">
      <div className="container">
        <div className="section-header reveal">
          <span className="section-tag">⭐ Google Reviews</span>

          <h2 className="section-title">Trusted by 80+ Happy Customers</h2>

          <p className="section-description">
            Real experiences from customers who trusted The Haven Store for
            custom apparel, uniforms, jerseys and bulk printing.
          </p>

          <div className="google-rating">
            <span>⭐⭐⭐⭐⭐</span>

            <strong>4.8 / 5</strong>

            <small>Based on Google Reviews</small>
          </div>
        </div>

        <div className="marquee-container">
          <div className="marquee-row">
            <div className="marquee-track track-left">
              {row1.map((review, index) => Card(review, index))}
            </div>
          </div>

          <div className="marquee-row">
            <div className="marquee-track track-right">
              {row2.map((review, index) => Card(review, index))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
