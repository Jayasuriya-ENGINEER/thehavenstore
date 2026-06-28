

const testimonials = [
  {
    text: "The quality exceeded our expectations. The hoodies we ordered for our college club were perfect - soft fabric, great print quality, and delivered on time.",
    name: "Sarah Johnson",
    role: "President, Tech Club",
  },
  {
    text: "Perfect hoodies for our college club. The Haven team was very professional and helped us with the design. Highly recommended!",
    name: "Michael Chen",
    role: "Event Coordinator",
  },
  {
    text: "Affordable pricing and amazing support. We ordered 100+ t-shirts for our startup and the quality was outstanding. Will definitely order again.",
    name: "Priya Sharma",
    role: "HR Manager, TechStart Inc.",
  },
  {
    text: "The fabrics feel premium and the stitching is top-notch. Our sports team loves the custom jerseys. Great experience from start to finish.",
    name: "David Martinez",
    role: "Team Captain, City FC",
  },
  {
    text: "The delivery was on time and the quality is exceptional. The Haven made our corporate event merchandise look professional and stylish.",
    name: "Emily Watson",
    role: "Marketing Director",
  },
  {
    text: "Best custom apparel manufacturer we've worked with. Great communication, fair pricing, and excellent quality. Our society members are very happy!",
    name: "Rahul Patel",
    role: "Student Society Head",
  },
];

export default function Testimonials() {
  // Split data into two rows
  const row1 = testimonials.slice(0, 3);
  const row2 = testimonials.slice(3, 6);

  // Duplicate items to ensure a seamless infinite scroll loop
  const row1Doubled = [...row1, ...row1];
  const row2Doubled = [...row2, ...row2];

  const renderCard = (t, index) => (
    <div className="testimonial-card" key={`${t.name}-${index}`}>
      <div className="testimonial-rating">
        {[...Array(5)].map((_, i) => (
          <i className="fas fa-star" key={i}></i>
        ))}
      </div>
      <p className="testimonial-text">"{t.text}"</p>
      <div className="testimonial-author">
        <div className="author-avatar">
          <i className="fas fa-user"></i>
        </div>
        <div className="author-info">
          <h4>={t.name}</h4>
          <p>{t.role}</p>
        </div>
      </div>
    </div>
  );

  return (
    <section className="testimonials" id="testimonials">
      <div className="container">
        <div className="section-header reveal">
          <span className="section-tag">Testimonials</span>
          <h2 className="section-title">What Our Clients Say</h2>
        </div>

        <div className="marquee-container">
          {/* Row 1: Right to Left */}
          <div className="marquee-row">
            <div className="marquee-track track-left">
              {row1Doubled.map((t, i) => renderCard(t, i))}
            </div>
          </div>

          {/* Row 2: Left to Right */}
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
