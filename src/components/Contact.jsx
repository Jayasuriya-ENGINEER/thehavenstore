const contactDetails = [
  { icon: "fas fa-phone-alt", title: "Phone", text: "+91 83769 07227" },
  {
    icon: "fas fa-envelope",
    title: "Email",
    text: "thehavenstoreofficial@gmail.com",
  },
  {
    icon: "fas fa-map-marker-alt",
    title: "Address",
    text: (
      <>
        70, behind Gaur Homes Elegante, Shatabdi Puram, Block I, Block E,
        Govindpuram,
        <br />
        Ghaziabad, Uttar Pradesh - 201 013
      </>
    ),
  },
  {
    icon: "fas fa-clock",
    title: "Working Hours",
    text: "Mon - Sat: 9:00 AM - 7:00 PM",
  },
];
const mapOpenUrl = "https://maps.app.goo.gl/5Ur299zSmFGcN3Sn9";

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
              href="https://wa.me/918376907227"
              className="btn btn-whatsapp btn-large"
              target="_blank"
              rel="noreferrer"
            >
              <i className="fab fa-whatsapp"></i>
              Chat on WhatsApp
            </a>
          </div>

          <div className="contact-map">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3499.9972389231557!2d77.4910661!3d28.6897292!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cf18d28286e85%3A0x4ebba7d0741b49a0!2sThe%20Haven%20Store!5e0!3m2!1sen!2sin!4v1782636970927!5m2!1sen!2sin"
              width="600"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
            <a
              href={mapOpenUrl}
              className="map-fallback"
              target="_blank"
              rel="noreferrer"
            >
              Open in Google Maps
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
