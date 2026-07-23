import { useState, useEffect } from "react";

function Notification({ msg, type, onClose }) {
  if (!msg) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: 100,
        right: 20,
        padding: "20px 24px",
        backgroundColor: type === "success" ? "#25D366" : "#e74c3c",
        color: "white",
        borderRadius: 16,
        boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
        display: "flex",
        alignItems: "center",
        gap: 12,
        fontFamily: "Inter, sans-serif",
        fontWeight: 500,
        zIndex: 10000,
        maxWidth: 400,
        animation: "slideIn 0.3s ease",
      }}
    >
      <i
        className={`fas ${type === "success" ? "fa-check-circle" : "fa-exclamation-circle"}`}
      ></i>
      <span>{msg}</span>
    </div>
  );
}

export const apparelOptions = [
  { value: "", label: "Select Apparel Type" },
  { value: "tshirt", label: "T-Shirts" },
  { value: "polo", label: "Polo T-Shirts" },
  { value: "hoodie", label: "Hoodies" },
  { value: "sweatshirt", label: "Sweatshirts" },
  { value: "dress", label: "Dresses" },
  { value: "top", label: "Tops" },
  { value: "bottom", label: "Bottoms" },
  { value: "accessory", label: "Accessories" },
  { value: "multiple", label: "Multiple Items" },
];

export default function EnquiryForm({
  selectedApparel = null,
  embedded = false,
  hideHeader = false,
}) {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    organization: "",
    apparelType: "",
    quantity: "",
    message: "",
  });
  const [errors, setErrors] = useState({});

  const [notification, setNotification] = useState({ msg: "", type: "" });

  // Sync apparel type when a product is selected on the bulk orders page
  useEffect(() => {
    if (selectedApparel != null && selectedApparel !== "") {
      setForm((prev) => ({ ...prev, apparelType: selectedApparel }));
      setErrors((prev) => ({ ...prev, apparelType: false }));
    }
  }, [selectedApparel]);

  const showNotification = (msg, type) => {
    setNotification({ msg, type });
    setTimeout(() => setNotification({ msg: "", type: "" }), 5000);
  };

  const validate = () => {
    const errs = {};
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRe = /^[\d\s\-\+\(\)]{10,}$/;
    if (!form.fullName.trim()) errs.fullName = true;
    if (!form.phone.trim() || !phoneRe.test(form.phone.replace(/\s/g, "")))
      errs.phone = true;
    if (!form.email.trim() || !emailRe.test(form.email)) errs.email = true;
    if (!form.apparelType) errs.apparelType = true;
    if (!form.quantity) errs.quantity = true;
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: false }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const errs = validate();

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      showNotification("Please fill in all required fields correctly.", "error");
      return;
    }

    const url = new URL(
      "https://docs.google.com/forms/d/e/1FAIpQLSeOEoSfyDwDdTPOGpnXVwR4wjRGIegh9ujJubkZsOj5kz6l6w/viewform?usp=publish-editor",
    );

    url.searchParams.append("usp", "pp_url");

    url.searchParams.append("entry.538273347", form.fullName);
    url.searchParams.append("entry.2752828", form.phone);
    url.searchParams.append("entry.1784630074", form.email);
    url.searchParams.append("entry.215131592", form.organization);
    url.searchParams.append("entry.569696349", form.apparelType);
    url.searchParams.append("entry.2089658901", form.quantity);
    url.searchParams.append("entry.22538892", form.message);

    window.open(url.toString(), "_blank");

    showNotification("Opening Google Form...", "success");

    setForm({
      fullName: "",
      phone: "",
      email: "",
      organization: "",
      apparelType: selectedApparel || "",
      quantity: "",
      message: "",
    });

    setErrors({});
  };

  const borderColor = (field) => (errors[field] ? "#e74c3c" : "#e0e0e0");

  const formBody = (
    <>
      <Notification {...notification} />
      {!hideHeader && (
        <div className="enquiry-header">
          <span className="section-tag">Get a Quote</span>
          <h2 className="section-title">Request a Price Enquiry</h2>
          <p>
            Fill out the form below and we'll get back to you within 24 hours.
          </p>
        </div>
      )}
      <form className="enquiry-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name *</label>
          <input
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Arya"
            style={{ borderColor: borderColor("fullName") }}
          />
        </div>

        <div className="form-group">
          <label>Phone Number *</label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+91 1234567890"
            style={{ borderColor: borderColor("phone") }}
          />
        </div>

        <div className="form-group">
          <label>Email Address *</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Arya@gmail.com"
            style={{ borderColor: borderColor("email") }}
          />
        </div>

        <div className="form-group">
          <label>Organization Name</label>
          <input
            type="text"
            name="organization"
            value={form.organization}
            onChange={handleChange}
            placeholder="Your Club/Company Name"
          />
        </div>

        <div className="form-group">
          <label>Type of Apparel *</label>
          <select
            name="apparelType"
            value={form.apparelType}
            onChange={handleChange}
            style={{ borderColor: borderColor("apparelType") }}
          >
            {apparelOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Quantity Required *</label>
          <input
            type="number"
            name="quantity"
            value={form.quantity}
            onChange={handleChange}
            placeholder="e.g., 50"
            min="1"
            style={{ borderColor: borderColor("quantity") }}
          />
        </div>

        {/* Full width */}
        <div className="form-group full-width">
          <label>Message</label>
          <textarea
            name="message"
            rows={4}
            value={form.message}
            onChange={handleChange}
            placeholder="Tell us more about your requirements..."
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-full full-width"
        >
          Submit Enquiry
          <i className="fas fa-arrow-right"></i>
        </button>
      </form>
    </>
  );

  if (embedded) {
    return (
      <div className="enquiry-embedded" id="enquiry">
        {formBody}
      </div>
    );
  }

  return (
    <section className="enquiry" id="enquiry">
      <div className="container">
        <div className="enquiry-wrapper reveal">{formBody}</div>
      </div>
    </section>
  );
}
