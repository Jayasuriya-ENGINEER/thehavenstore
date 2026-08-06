import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./LegalPage.css";

const policyPages = {
  "shipping-policy": {
    label: "Shipping Policy",
    icon: "local_shipping",
    intro: "This is a draft policy for The Haven and can be updated as your delivery process evolves.",
    sections: [
      ["Order processing", "Orders are prepared after payment confirmation. Processing time may vary depending on product availability, customization requirements, and order volume."],
      ["Delivery estimates", "Estimated delivery dates are shared at checkout or by our team. Delivery timelines are estimates and may change due to courier delays, weather, public holidays, or other circumstances beyond our control."],
      ["Shipping charges", "Applicable shipping charges, if any, will be shown before you complete your order. Promotional free-shipping offers may have separate terms."],
      ["Order tracking", "When tracking is available, we will share the tracking details using the contact information provided with your order."],
      ["Address accuracy", "Please review your delivery address carefully before placing the order. The Haven cannot guarantee changes after an order has entered processing or been handed to a courier."],
    ],
  },
  "return-policy": {
    label: "Return Policy",
    icon: "assignment_return",
    intro: "This is a draft policy for The Haven and can be updated to reflect your final returns process.",
    sections: [
      ["Eligibility", "If an item arrives damaged, defective, or materially different from what was ordered, please contact us promptly with your order details and clear photographs."],
      ["Custom-made products", "Personalized, printed, or custom-made products are generally not eligible for return or exchange unless they arrive damaged, defective, or incorrect due to an error on our side."],
      ["How to request a return", "Email thehavenstoreofficial@gmail.com with your order number, a description of the issue, and supporting images. Our team will review the request and guide you through the next steps."],
      ["Condition of returned items", "Where a return is approved, items should be unused, unwashed, and returned with original tags and packaging unless we instruct otherwise."],
      ["Refunds and replacements", "Approved refunds or replacements will be arranged after our review and, where applicable, receipt of the returned item. Refund timing depends on the original payment method and payment provider."],
    ],
  },
  "privacy-policy": {
    label: "Privacy Policy",
    icon: "shield_lock",
    intro: "This is a draft privacy policy for The Haven and should be reviewed before publication.",
    sections: [
      ["Information we collect", "We may collect details you provide when placing an order, creating an account, submitting an enquiry, or contacting us. This can include your name, contact details, shipping address, and order information."],
      ["How we use information", "We use this information to process orders, provide customer support, communicate about your purchase, improve our services, and meet legal or operational obligations."],
      ["Payments", "Payments are processed through payment providers. The Haven does not intentionally store complete card or payment credentials on this website."],
      ["Sharing information", "We may share necessary details with service providers such as payment processors, delivery partners, and technology providers only as needed to operate our business."],
      ["Your choices", "You may contact us to request access to, correction of, or deletion of your personal information, subject to applicable law and records we must retain."],
    ],
  },
  "terms-of-service": {
    label: "Terms of Service",
    icon: "gavel",
    intro: "This is a draft set of terms for The Haven and should be reviewed before publication.",
    sections: [
      ["Using our website", "You agree to use this website lawfully and provide accurate information when placing an order or contacting us."],
      ["Products and pricing", "We aim to display product information, availability, and pricing accurately. We may correct errors, update information, or cancel orders affected by an error where permitted by law."],
      ["Custom orders", "You are responsible for reviewing specifications, artwork, sizes, quantities, and other details for custom orders before approval. Production may begin only after required confirmation and payment."],
      ["Intellectual property", "Website content, branding, and original designs belong to The Haven or their respective owners. Please do not copy, reproduce, or use them without permission."],
      ["Changes to these terms", "We may revise these terms from time to time. Continued use of the site after changes are posted means you accept the updated terms."],
    ],
  },
};

const faqs = [
  ["What does The Haven sell?", "The Haven offers apparel and merchandise, including custom clothing and bulk orders for clubs, teams, events, and organizations."],
  ["Can I place a custom or bulk order?", "Yes. Use the Bulk Orders page or contact us on WhatsApp to share your requirements, quantity, design, and deadline."],
  ["How do I know my size?", "Please review the available size information before ordering. For custom or group orders, our team can help you confirm the right size run."],
  ["Can I change my order after placing it?", "Contact us as soon as possible. We will try to help, but changes may not be possible once processing or production has begun."],
  ["How can I get help with an order?", "Email thehavenstoreofficial@gmail.com or contact us through the details listed in the website footer."],
];

export default function LegalPage() {
  const { page } = useParams();
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);
  const [isLeaving, setIsLeaving] = useState(false);
  const scrollBehavior = useRef("");
  const isFaq = page === "faq";
  const content = isFaq
    ? { label: "Frequently Asked Questions", icon: "help", intro: "A few helpful answers about shopping and ordering with The Haven.", sections: faqs }
    : policyPages[page] || policyPages["shipping-policy"];

  const toggleFaq = (title) => {
    setOpenFaq((current) => (current === title ? null : title));
  };

  const handleExit = () => {
    if (isLeaving) return;

    setIsLeaving(true);
    scrollBehavior.current = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";

    window.setTimeout(() => {
      navigate(-1);
      window.setTimeout(() => {
        document.documentElement.style.scrollBehavior = scrollBehavior.current;
      }, 100);
    }, 900);
  };

  return (
    <main className="legal-page">
      <button
        type="button"
        className="legal-exit"
        aria-label="Go back"
        onClick={handleExit}
        disabled={isLeaving}
      >
        <span className="material-symbols-rounded" aria-hidden="true">arrow_back</span>
      </button>

      {isLeaving && (
        <div className="legal-returning" role="status" aria-live="polite">
          <span className="legal-spinner" aria-hidden="true"></span>
          Returning you back
        </div>
      )}

      <article className="legal-content">
        <header className="legal-header">
          <div className="legal-icon" aria-hidden="true">
            <span className="material-symbols-rounded">{content.icon}</span>
          </div>
          <p className="legal-eyebrow">The Haven · Draft</p>
          <h1>{content.label}</h1>
          <p>{content.intro}</p>
        </header>

        <div className={`legal-sections${isFaq ? " legal-faqs" : ""}`}>
          {content.sections.map(([title, text]) => (
            isFaq ? (
              <section className="legal-section legal-faq" key={title}>
                <button
                  type="button"
                  className="legal-faq-question"
                  aria-expanded={openFaq === title}
                  onClick={() => toggleFaq(title)}
                >
                  <span>{title}</span>
                  <span className="material-symbols-rounded" aria-hidden="true">
                    {openFaq === title ? "expand_less" : "expand_more"}
                  </span>
                </button>
                {openFaq === title && <p className="legal-faq-answer">{text}</p>}
              </section>
            ) : (
              <section className="legal-section" key={title}>
                <h2>{title}</h2>
                <p>{text}</p>
              </section>
            )
          ))}
        </div>

        <p className="legal-contact">
          Questions about this page? Contact us at{" "}
          <a href="mailto:thehavenstoreofficial@gmail.com">thehavenstoreofficial@gmail.com</a>.
        </p>
      </article>
    </main>
  );
}
