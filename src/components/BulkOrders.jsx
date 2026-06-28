import freepic from "../assets/freepic.png";

const categories = [
  { icon: "fas fa-graduation-cap", label: "College Clubs" },
  { icon: "fas fa-users", label: "Student Societies" },
  { icon: "fas fa-briefcase", label: "Corporate Teams" },
  { icon: "fas fa-calendar-alt", label: "Events" },
  { icon: "fas fa-futbol", label: "Sports Teams" },
  { icon: "fas fa-handshake", label: "Communities" },
  { icon: "fas fa-rocket", label: "Startups" },
  { icon: "fas fa-school", label: "Schools & Universities" },
];

export default function BulkOrders() {
  return (
    <section className="bulk-orders" id="bulk-orders">
      <div className="container">
        <div className="bulk-content reveal">
          <div className="bulk-text">
            <span className="section-tag">Bulk Orders</span>
            <h2 className="section-title">
              Custom Bulk Orders
              <br />
              For Your Organization
            </h2>
            <p className="bulk-description">
              Looking to create custom apparel for your group? The Haven
              specializes in bulk manufacturing for:
            </p>

            <div className="bulk-categories">
              {categories.map((c) => (
                <div className="bulk-category" key={c.label}>
                  <i className={c.icon}></i>
                  <span>{c.label}</span>
                </div>
              ))}
            </div>

            <a
              href="https://wa.me/7502737734"
              className="btn btn-whatsapp"
              target="_blank"
              rel="noreferrer"
            >
              <i className="fab fa-whatsapp"></i>
              Order on WhatsApp
            </a>
          </div>

          <div className="bulk-image">
            <div className="bulk-mockup">
              <div className="mockup-group">
                <img src={freepic} alt="Bulk Order Mockup" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
