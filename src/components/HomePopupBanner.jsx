import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchHomePopupBanner } from "../services/banners";
import "./HomePopupBanner.css";

const SESSION_KEY = "haven_home_popup_seen_v1";

/** Shows the admin-managed promotion once per browser session on the home page. */
export default function HomePopupBanner() {
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;

    let cancelled = false;
    fetchHomePopupBanner().then((data) => {
      if (!cancelled && data?.url) setBanner(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const close = () => {
    sessionStorage.setItem(SESSION_KEY, "1");
    setBanner(null);
  };

  if (!banner) return null;

  return (
    <div className="home-popup" role="dialog" aria-modal="true" aria-label="Men's collection offer">
      <button className="home-popup-backdrop" type="button" aria-label="Close popup" onClick={close} />
      <div className="home-popup-card">
        <button className="home-popup-close" type="button" aria-label="Close popup" onClick={close}>
          <i className="fas fa-xmark" aria-hidden="true" />
        </button>
        <Link to="/men" onClick={close} className="home-popup-link" aria-label="View men's collection">
          <img src={banner.url} alt="Explore the men's collection" />
        </Link>
      </div>
    </div>
  );
}
