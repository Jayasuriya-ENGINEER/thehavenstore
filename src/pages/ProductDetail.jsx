import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";
import {
  getMensProductById,
  mensProducts,
  formatPrice,
  getDiscountPercent,
} from "../data/mensProducts";
import { fetchProductById, fetchProducts } from "../services/products";
import {
  sectionFromGender,
  sectionFromPathname,
  SHOP_SECTIONS,
} from "./shopSections";
import "./Shop.css";

export default function ProductDetail() {
  const { productId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const pathSection = sectionFromPathname(location.pathname);

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [qty, setQty] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [toast, setToast] = useState("");

  // Prefer URL section so unisex products keep men/women context
  const section = useMemo(() => {
    if (pathSection) return pathSection;
    if (product) return sectionFromGender(product.gender);
    return SHOP_SECTIONS.men;
  }, [pathSection, product]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setActiveImage(0);
      setSelectedSize("");
      setQty(1);
      setSizeError(false);
      setToast("");

      try {
        let found = await fetchProductById(productId);
        if (!found) {
          found = getMensProductById(productId);
        }

        if (cancelled) return;
        setProduct(found || null);
        setSelectedColor(found?.colors?.[0]?.name || "");

        if (found) {
          // Related pool: current shop section when on /men|/women|/accessories
          const relatedGender =
            pathSection?.gender || found.gender || "men";
          let pool = [];
          try {
            pool = await fetchProducts({
              gender: relatedGender,
              activeOnly: true,
            });
          } catch {
            pool =
              relatedGender === "men" || relatedGender === "unisex"
                ? mensProducts
                : [];
          }
          if (
            !pool.length &&
            (relatedGender === "men" || found.gender === "unisex")
          ) {
            pool = mensProducts;
          }

          const sameCategory = pool.filter(
            (p) => p.id !== found.id && p.category === found.category,
          );
          const others = pool.filter(
            (p) => p.id !== found.id && p.category !== found.category,
          );
          setRelated(
            (sameCategory.length >= 4
              ? sameCategory
              : [...sameCategory, ...others]
            ).slice(0, 4),
          );
        } else {
          setRelated([]);
        }
      } catch (err) {
        console.warn(err);
        if (!cancelled) {
          const fallback = getMensProductById(productId);
          setProduct(fallback);
          setSelectedColor(fallback?.colors?.[0]?.name || "");
          setRelated([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    window.scrollTo(0, 0);
    load();
    return () => {
      cancelled = true;
    };
  }, [productId, pathSection?.gender]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  const discount = useMemo(() => {
    if (!product) return 0;
    return getDiscountPercent(product.price, product.originalPrice);
  }, [product]);

  const showToast = (msg) => setToast(msg);

  const needsSize = (product?.sizes?.length || 0) > 0;

  const requireSize = () => {
    if (!needsSize) {
      setSizeError(false);
      return true;
    }
    if (!selectedSize) {
      setSizeError(true);
      return false;
    }
    setSizeError(false);
    return true;
  };

  const handleAddToCart = () => {
    if (!product?.inStock) {
      showToast("This item is currently out of stock.");
      return;
    }
    if (!requireSize()) return;
    const result = addItem(product, {
      size: selectedSize,
      color: selectedColor,
      qty,
    });
    if (!result.ok) {
      showToast(result.error || "Could not add to bag.");
      return;
    }
    const sizeLabel = selectedSize ? ` (${selectedSize})` : "";
    showToast(`Added ${qty} × ${product.name}${sizeLabel} to your bag.`);
  };

  const handleBuyNow = () => {
    if (!product?.inStock) {
      showToast("This item is currently out of stock.");
      return;
    }
    if (!requireSize()) return;
    addItem(product, {
      size: selectedSize,
      color: selectedColor,
      qty,
    });
    navigate("/checkout");
  };

  if (loading) {
    return (
      <>
        <Navbar solid />
        <div className="shop-page">
          <div className="container shop-empty">
            <p>Loading product…</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar solid />
        <div className="shop-page">
          <div className="container shop-empty">
            <h2>Product not found</h2>
            <p>This item may have been removed or the link is incorrect.</p>
            <Link to={section.path} className="btn btn-primary">
              Back to {section.breadcrumb}
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const images = product.images?.length ? product.images : [];
  const fullStars = Math.floor(product.rating || 0);
  const hasHalf = (product.rating || 0) - fullStars >= 0.3;
  const maxQty = Math.min(10, product.stock > 0 ? product.stock : 10);

  return (
    <>
      <Navbar solid />
      <div className="shop-page shop-detail">
        <div className="container">
          <div className="pd-breadcrumb-bar">
            <nav className="shop-breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span>/</span>
              <Link to={section.path}>{section.breadcrumb}</Link>
              <span>/</span>
              <span className="current">{product.name}</span>
            </nav>
          </div>

          <div className="pd-layout">
            <div className="pd-gallery">
              <div className="pd-thumbs" role="tablist" aria-label="Images">
                {images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`pd-thumb${activeImage === i ? " active" : ""}`}
                    onClick={() => setActiveImage(i)}
                    aria-label={`View image ${i + 1}`}
                  >
                    <img src={img} alt="" />
                  </button>
                ))}
              </div>
              <div className="pd-main-image">
                {product.badge && (
                  <span className="pd-main-badge">{product.badge}</span>
                )}
                {images[activeImage] ? (
                  <img src={images[activeImage]} alt={product.name} />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      minHeight: 360,
                      background: "#eee",
                    }}
                  />
                )}
              </div>
            </div>

            <div className="pd-info">
              <span className="pd-category">
                {product.category}
                {product.gender === "unisex" && " · Unisex"}
              </span>
              <h1>{product.name}</h1>

        

              <div className="pd-price-block">
                <span className="pd-price">{formatPrice(product.price)}</span>
                {product.originalPrice > product.price && (
                  <span className="pd-price-original">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
                {discount > 0 && (
                  <span className="pd-price-off">{discount}% off</span>
                )}
              </div>
              <p className="pd-tax-note">Inclusive of all taxes</p>

              {product.shortDesc && (
                <p className="pd-short">{product.shortDesc}</p>
              )}

              {product.colors?.length > 0 && (
                <div className="pd-option">
                  <div className="pd-option-label">
                    Color
                    <span>{selectedColor}</span>
                  </div>
                  <div className="pd-colors">
                    {product.colors.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        className={`pd-color-btn${selectedColor === c.name ? " active" : ""}`}
                        title={c.name}
                        aria-label={c.name}
                        onClick={() => setSelectedColor(c.name)}
                      >
                        <span style={{ backgroundColor: c.hex }} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product.sizes?.length > 0 && (
                <div className="pd-option">
                  <div className="pd-option-label">
                    Size
                    <span>{selectedSize || "Select a size"}</span>
                  </div>
                  <div className="pd-sizes">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        className={`pd-size-btn${selectedSize === size ? " active" : ""}`}
                        onClick={() => {
                          setSelectedSize(size);
                          setSizeError(false);
                        }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  {sizeError && (
                    <p className="pd-size-error">Please select a size</p>
                  )}
                </div>
              )}

              <div className="pd-option">
                <div className="pd-option-label">Quantity</div>
                <div className="pd-qty">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                  >
                    −
                  </button>
                  <span>{qty}</span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="pd-actions">
                <button
                  type="button"
                  className="btn btn-primary pd-buy"
                  onClick={handleBuyNow}
                  disabled={!product.inStock}
                >
                  <i className="fas fa-bolt" aria-hidden="true"></i>
                  Buy now
                </button>
                <button
                  type="button"
                  className="btn pd-cart"
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                >
                  <i className="fas fa-shopping-bag" aria-hidden="true"></i>
                  Add to cart
                </button>
              </div>

              <div className="pd-trust">
                <div className="pd-trust-item">
                  <i className="fas fa-truck" aria-hidden="true"></i>
                  Free shipping over ₹999
                </div>
                <div className="pd-trust-item">
                  <i className="fas fa-rotate-left" aria-hidden="true"></i>
                  7-day easy returns
                </div>
                <div className="pd-trust-item">
                  <i className="fas fa-shield-halved" aria-hidden="true"></i>
                  Secure checkout soon
                </div>
                <div className="pd-trust-item">
                  <i className="fas fa-check" aria-hidden="true"></i>
                  {product.inStock
                    ? product.stock
                      ? `In stock (${product.stock})`
                      : "In stock"
                    : "Out of stock"}
                </div>
              </div>

              <div className="pd-tabs">
                {product.description && (
                  <>
                    <h3>Description</h3>
                    <p>{product.description}</p>
                  </>
                )}
                {product.details?.length > 0 && (
                  <>
                    <h3>Product details</h3>
                    <ul className="pd-details-list">
                      {product.details.map((d) => (
                        <li key={d}>
                          <i className="fas fa-check" aria-hidden="true"></i>
                          {d}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="pd-related">
            <div className="container">
              <h2>You may also like</h2>
              <div className="shop-grid">
                {related.map((p) => {
                  const off = getDiscountPercent(p.price, p.originalPrice);
                  return (
                    <Link
                      key={p.id}
                      to={`${section.path}/${p.id}`}
                      className="shop-card"
                    >
                      <div className="shop-card-image">
                        {p.badge && (
                          <span className="shop-card-badge">{p.badge}</span>
                        )}
                        {p.images?.[0] && (
                          <img src={p.images[0]} alt={p.name} />
                        )}
                      </div>
                      <div className="shop-card-body">
                        <span className="shop-card-category">{p.category}</span>
                        <h3>{p.name}</h3>
                        <div className="shop-card-price">
                          <span className="current">
                            {formatPrice(p.price)}
                          </span>
                          {p.originalPrice > p.price && (
                            <span className="original">
                              {formatPrice(p.originalPrice)}
                            </span>
                          )}
                          {off > 0 && <span className="off">{off}% off</span>}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </div>

      <div
        className={`shop-toast${toast ? " show" : ""}`}
        role="status"
        aria-live="polite"
      >
        {toast && (
          <>
            <i className="fas fa-circle-check" aria-hidden="true"></i>
            <span>{toast}</span>
          </>
        )}
      </div>

      <Footer />
    </>
  );
}
