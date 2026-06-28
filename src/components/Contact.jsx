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

const mapEmbedUrl = "https://maps.app.goo.gl/5Ur299zSmFGcN3Sn9";
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
              src={mapEmbedUrl}
              title="Our location on map"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
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
