import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchSectionBanners } from "../services/banners";
import { fetchProductById } from "../services/products";
import { sectionFromGender, SHOP_SECTIONS } from "../pages/shopSections";
import "./SectionBannerSlideshow.css";

const AUTO_MS = 4500;

/**
 * Auto-scrolling banner slideshow for Men / Women / Accessories.
 * Loops continuously when more than one image is set in admin.
 * If a slide has productId, clicking it opens that product page.
 */
export default function SectionBannerSlideshow({ section }) {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchSectionBanners(section).then((data) => {
      if (cancelled) return;
      setImages(data.images || []);
      setIndex(0);
      setLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, [section]);

  const count = images.length;

  const goTo = useCallback(
    (next) => {
      if (count <= 0) return;
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  const goNext = useCallback(() => goTo(index + 1), [goTo, index]);
  const goPrev = useCallback(() => goTo(index - 1), [goTo, index]);

  // Auto-advance with infinite loop
  useEffect(() => {
    if (count <= 1 || paused) return undefined;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, AUTO_MS);
    return () => clearInterval(id);
  }, [count, paused]);

  const handleBannerClick = async (img) => {
    const productId = (img?.productId || "").trim();
    if (!productId) return;

    // Prefer the product's own section so unisex / cross-section links land correctly
    try {
      const product = await fetchProductById(productId);
      if (product) {
        const target = sectionFromGender(product.gender);
        navigate(`${target.path}/${product.id}`);
        return;
      }
    } catch {
      // fall through to section path
    }

    const fallback = SHOP_SECTIONS[section] || SHOP_SECTIONS.men;
    navigate(`${fallback.path}/${productId}`);
  };

  if (!loaded || count === 0) return null;

  return (
    <section
      className="section-banner"
      aria-roledescription="carousel"
      aria-label={`${section} section banners`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false);
      }}
    >
      <div className="section-banner-track">
        {images.map((img, i) => {
          const linked = Boolean(img.productId);
          return (
            <div
              key={img.id || i}
              className={`section-banner-slide${i === index ? " active" : ""}${
                linked ? " is-clickable" : ""
              }`}
              aria-hidden={i !== index}
              role={linked ? "link" : undefined}
              tabIndex={linked && i === index ? 0 : undefined}
              onClick={() => {
                if (linked && i === index) handleBannerClick(img);
              }}
              onKeyDown={(e) => {
                if (!linked || i !== index) return;
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleBannerClick(img);
                }
              }}
              aria-label={
                linked
                  ? `Open product ${img.productId}`
                  : undefined
              }
            >
              <img
                src={img.url}
                alt=""
                loading={i === 0 ? "eager" : "lazy"}
                draggable={false}
              />
            </div>
          );
        })}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            className="section-banner-nav prev"
            onClick={goPrev}
            aria-label="Previous banner"
          >
            <i className="fas fa-chevron-left" aria-hidden="true"></i>
          </button>
          <button
            type="button"
            className="section-banner-nav next"
            onClick={goNext}
            aria-label="Next banner"
          >
            <i className="fas fa-chevron-right" aria-hidden="true"></i>
          </button>

          <div className="section-banner-dots" role="tablist" aria-label="Banner slides">
            {images.map((img, i) => (
              <button
                key={img.id || i}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Slide ${i + 1}`}
                className={`section-banner-dot${i === index ? " active" : ""}`}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
