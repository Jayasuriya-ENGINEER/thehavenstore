import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Internships.css";

export default function Internships() {
  const navigate = useNavigate();
  const [isLeaving, setIsLeaving] = useState(false);
  const scrollBehavior = useRef("");

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
    <main className="internships-page">
      <button
        type="button"
        className="internships-exit"
        aria-label="Go back"
        onClick={handleExit}
        disabled={isLeaving}
      >
        <span className="material-symbols-rounded" aria-hidden="true">
          arrow_back
        </span>
      </button>

      {isLeaving && (
        <div className="internships-returning" role="status" aria-live="polite">
          <span className="internships-spinner" aria-hidden="true"></span>
          Returning you back
        </div>
      )}

      <section className="internships-empty" aria-labelledby="internships-title">
        <div className="internships-icon" aria-hidden="true">
          <span className="material-symbols-rounded">work_off</span>
        </div>
        <p className="internships-eyebrow">Careers at The Haven</p>
        <h1 id="internships-title">No internships available right now</h1>
        <p>
          We do not have any internship openings at the moment. Please check
          back soon for future opportunities.
        </p>
      </section>
    </main>
  );
}
