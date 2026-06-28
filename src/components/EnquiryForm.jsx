import { useState, useRef } from "react";

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

const apparelOptions = [
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

export default function EnquiryForm() {
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
  const [fileName, setFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [notification, setNotification] = useState({ msg: "", type: "" });
  const fileRef = useRef();

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

  const handleFile = (files) => {
    if (files && files[0]) setFileName(files[0].name);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      showNotification(
        "Please fill in all required fields correctly.",
        "error",
      );
      return;
    }
    showNotification(
      "Thank you for your enquiry! We will get back to you within 24 hours.",
      "success",
    );
    setForm({
      fullName: "",
      phone: "",
      email: "",
      organization: "",
      apparelType: "",
      quantity: "",
      message: "",
    });
    setFileName("");
  };

  const borderColor = (field) => (errors[field] ? "#e74c3c" : "#e0e0e0");

  return (
    <section className="enquiry" id="enquiry">
      <Notification {...notification} />
      <div className="container">
        <div className="enquiry-wrapper reveal">
          <div className="enquiry-header">
            <span className="section-tag">Get a Quote</span>
            <h2 className="section-title">Request a Price Enquiry</h2>
            <p>
              Fill out the form below and we'll get back to you within 24 hours.
            </p>
          </div>

          <form className="enquiry-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
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
                  placeholder="+91 98765 43210"
                  style={{ borderColor: borderColor("phone") }}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
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
            </div>

            <div className="form-row">
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
            </div>

            <div className="form-group">
              <label>Upload Design (Optional)</label>
              <div
                className="file-upload"
                onDragEnter={() => setDragOver(true)}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  handleFile(e.dataTransfer.files);
                }}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,.pdf"
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    opacity: 0,
                    cursor: "pointer",
                    zIndex: 2,
                  }}
                  onChange={(e) => handleFile(e.target.files)}
                />
                <div
                  className="file-upload-label"
                  style={
                    dragOver
                      ? {
                          borderColor: "#25D366",
                          backgroundColor: "rgba(37,211,102,0.1)",
                        }
                      : {}
                  }
                >
                  <i className="fas fa-cloud-upload-alt"></i>
                  <span>
                    {fileName
                      ? `Selected: ${fileName}`
                      : "Click to upload or drag and drop"}
                  </span>
                  <small>SVG, PNG, JPG or PDF (MAX. 10MB)</small>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Message</label>
              <textarea
                name="message"
                value={form.message}
                rows={4}
                onChange={handleChange}
                placeholder="Tell us more about your requirements..."
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full">
              Submit Enquiry
              <i className="fas fa-arrow-right"></i>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
