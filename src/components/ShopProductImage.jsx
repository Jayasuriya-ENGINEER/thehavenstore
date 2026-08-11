import { useEffect, useRef, useState } from "react";

/** Time each image stays fully visible before crossfading to the next. */
const HOVER_INTERVAL_MS = 2800;
/** Delay before auto-cycling starts on touch devices once the card is in view. */
const MOBILE_VIEW_DELAY_MS = 12000;

/**
 * Product-card image preview. On devices with a hover-capable pointer it
 * crossfades through the product images while hovered. On touch devices it
 * starts cycling only after the card remains in view for 12 seconds.
 */
export default function ShopProductImage({
  images = [],
  name,
  badge,
  discount = 0,
}) {
  const imageFrameRef = useRef(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [canHover, setCanHover] = useState(() =>
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches,
  );

  const imageCount = images.length;
  const hasExtraImages = imageCount > 1;

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const updateCanHover = () => setCanHover(media.matches);

    updateCanHover();
    media.addEventListener("change", updateCanHover);
    return () => media.removeEventListener("change", updateCanHover);
  }, []);

  useEffect(() => {
    if (canHover || !hasExtraImages || !imageFrameRef.current) return undefined;

    const frame = imageFrameRef.current;
    let delayId;
    let intervalId;

    const stopPreview = () => {
      window.clearTimeout(delayId);
      window.clearInterval(intervalId);
      delayId = undefined;
      intervalId = undefined;
      setImageIndex(0);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          stopPreview();
          return;
        }

        delayId = window.setTimeout(() => {
          setImageIndex((current) => (current + 1) % imageCount);
          intervalId = window.setInterval(() => {
            setImageIndex((current) => (current + 1) % imageCount);
          }, HOVER_INTERVAL_MS);
        }, MOBILE_VIEW_DELAY_MS);
      },
      { threshold: 0.6 },
    );

    observer.observe(frame);
    return () => {
      observer.disconnect();
      stopPreview();
    };
  }, [canHover, hasExtraImages, imageCount]);

  useEffect(() => {
    if (!canHover || !isHovered || !hasExtraImages) return undefined;

    const intervalId = window.setInterval(() => {
      setImageIndex((current) => (current + 1) % imageCount);
    }, HOVER_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [canHover, hasExtraImages, imageCount, isHovered]);

  const startHoverPreview = () => {
    if (!canHover || !hasExtraImages) return;
    setIsHovered(true);
    // Crossfade to the second image on hover (ecommerce-style preview).
    setImageIndex(1);
  };

  const stopHoverPreview = () => {
    if (!canHover || !hasExtraImages) return;
    setIsHovered(false);
    // Crossfade back to the primary image.
    setImageIndex(0);
  };

  return (
    <div
      ref={imageFrameRef}
      className="shop-card-image"
      onMouseEnter={startHoverPreview}
      onMouseLeave={stopHoverPreview}
    >
      {badge && <span className="shop-card-badge">{badge}</span>}
      {!badge && discount > 0 && (
        <span className="shop-card-badge sale">{discount}% OFF</span>
      )}
      {images[0] ? (
        images.map((image, index) => (
          <img
            key={`${image}-${index}`}
            className={`shop-card-preview-image${
              index === imageIndex ? " is-active" : ""
            }`}
            src={image}
            alt={index === imageIndex ? name : ""}
            aria-hidden={index !== imageIndex}
            loading={index === 0 ? "eager" : "lazy"}
            decoding="async"
          />
        ))
      ) : (
        <div className="shop-card-image-placeholder" />
      )}
    </div>
  );
}
