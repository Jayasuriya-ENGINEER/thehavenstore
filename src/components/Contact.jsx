const contactDetails = [
  { icon: "fas fa-phone-alt", title: "Phone", text: "+91 XXXXX XXXXX" },
  { icon: "fas fa-envelope", title: "Email", text: "hello@thehaven.com" },
  {
    icon: "fas fa-map-marker-alt",
    title: "Address",
    text: (
      <>
        Your Business Address
        <br />
        City, State, ZIP
      </>
    ),
  },
  {
    icon: "fas fa-clock",
    title: "Working Hours",
    text: "Mon - Sat: 9:00 AM - 7:00 PM",
  },
];

export default function Contact() {
  return (
    <section className="contact" id="contact">
      <div className="container">
        <div className="contact-wrapper reveal">
          <div className="contact-info">
            <span className="section-tag">Contact Us</span>
            <h2 className="section-title">Get In Touch</h2>
            <p>
              Have questions? We'd love to hear from you. Send us a message and
              we'll respond as soon as possible.
            </p>

            <div className="contact-details">
              {contactDetails.map((c) => (
                <div className="contact-item" key={c.title}>
                  <div className="contact-icon">
                    <i className={c.icon}></i>
                  </div>
                  <div className="contact-text">
                    <h4>{c.title}</h4>
                    <p>{c.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <a
              href="https://wa.me/91XXXXXXXXXX"
              className="btn btn-whatsapp btn-large"
              target="_blank"
              rel="noreferrer"
            >
              <i className="fab fa-whatsapp"></i>
              Chat on WhatsApp
            </a>
          </div>

          <div className="contact-map">
            <div className="map-placeholder">
              <i className="fas fa-map-marked-alt"></i>
              <p>Google Maps Integration</p>
              <small>Replace with actual map embed</small>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
