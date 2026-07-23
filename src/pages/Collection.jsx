import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  mensProducts,
  formatPrice,
  getDiscountPercent,
} from "../data/mensProducts";
import { fetchProducts } from "../services/products";
import { SHOP_SECTIONS } from "./shopSections";
import "./Shop.css";

/**
 * Shared collection page for Men / Women / Accessories.
 * Live products come from Firebase. Men only uses local samples if the
 * catalog is empty or the fetch fails — never while loading (avoids flash).
 */
export default function Collection({ sectionKey }) {
  const section = SHOP_SECTIONS[sectionKey] || SHOP_SECTIONS.men;
  const useLocalFallback = sectionKey === "men";

  const [filter, setFilter] = useState("All");
  // Always start empty so we never flash sample products over live catalog
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromFirestore, setFromFirestore] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setFilter("All");
    setProducts([]);
    setFromFirestore(false);
    setLoading(true);

    async function load() {
      try {
        const list = await fetchProducts({
          gender: section.gender,
          activeOnly: true,
        });
        if (cancelled) return;
        if (list.length > 0) {
          setProducts(list);
          setFromFirestore(true);
        } else if (useLocalFallback) {
          setProducts(mensProducts);
          setFromFirestore(false);
        } else {
          setProducts([]);
          setFromFirestore(false);
        }
      } catch (err) {
        console.warn("Using products fallback:", err?.message);
        if (!cancelled) {
          if (useLocalFallback) {
            setProducts(mensProducts);
          } else {
            setProducts([]);
          }
          setFromFirestore(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [section.gender, useLocalFallback]);

  const categories = useMemo(
    () => ["All", ...new Set(products.map((p) => p.category))],
    [products],
  );

  const filtered = useMemo(() => {
    if (filter === "All") return products;
    return products.filter((p) => p.category === filter);
  }, [filter, products]);

  const showSampleNote =
    !loading &&
    !fromFirestore &&
    useLocalFallback &&
    products.length > 0 &&
    products[0]?.id === mensProducts[0]?.id;

  return (
    <>
      <Navbar solid />
      <div className="shop-page">
        <header className="shop-hero">
          <div className="container shop-hero-inner">
            <nav className="shop-breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span>/</span>
              <span className="current">{section.breadcrumb}</span>
            </nav>
            <h1>{section.title}</h1>
            <p>{section.description}</p>
          </div>
        </header>

        <div className="container">
          <div className="shop-toolbar">
            <p className="shop-count">
              {loading ? (
                "Loading products…"
              ) : (
                <>
                  Showing <strong>{filtered.length}</strong> product
                  {filtered.length !== 1 ? "s" : ""}
                  {showSampleNote && (
                    <span style={{ color: "#888", marginLeft: 8 }}>
                      (sample catalog)
                    </span>
                  )}
                </>
              )}
            </p>
            {!loading && categories.length > 1 && (
              <div className="shop-filters" role="tablist" aria-label="Category">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    role="tab"
                    aria-selected={filter === cat}
                    className={`shop-filter-chip${filter === cat ? " active" : ""}`}
                    onClick={() => setFilter(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {loading ? (
            <div className="shop-grid" aria-busy="true" aria-label="Loading products">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="shop-card shop-card-skeleton">
                  <div className="shop-card-image shop-skel-block" />
                  <div className="shop-card-body">
                    <div className="shop-skel-line shop-skel-line-sm" />
                    <div className="shop-skel-line shop-skel-line-lg" />
                    <div className="shop-skel-line shop-skel-line-md" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="shop-empty">
              <h2>No products yet</h2>
              <p>{section.emptyHint}</p>
              <Link to="/" className="btn btn-primary">
                Back to home
              </Link>
            </div>
          ) : (
            <div className="shop-grid">
              {filtered.map((product) => {
                const discount = getDiscountPercent(
                  product.price,
                  product.originalPrice,
                );
                const image = product.images?.[0];
                return (
                  <Link
                    key={product.id}
                    to={`${section.path}/${product.id}`}
                    className="shop-card"
                  >
                    <div className="shop-card-image">
                      {product.badge && (
                        <span className="shop-card-badge">{product.badge}</span>
                      )}
                      {!product.badge && discount > 0 && (
                        <span className="shop-card-badge sale">
                          {discount}% OFF
                        </span>
                      )}
                      {image ? (
                        <img src={image} alt={product.name} />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            background: "#eee",
                          }}
                        />
                      )}
                    </div>
                    <div className="shop-card-body">
                      <span className="shop-card-category">
                        {product.category}
                        {product.gender === "unisex" && (
                          <span style={{ marginLeft: 6, opacity: 0.7 }}>
                            · Unisex
                          </span>
                        )}
                      </span>
                      <h3>{product.name}</h3>
                      <div className="shop-card-rating">
                        <i className="fas fa-star" aria-hidden="true"></i>
                        <span>
                          {product.rating || "—"} ({product.reviews || 0})
                        </span>
                      </div>
                      <div className="shop-card-price">
                        <span className="current">
                          {formatPrice(product.price)}
                        </span>
                        {product.originalPrice > product.price && (
                          <span className="original">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                        {discount > 0 && (
                          <span className="off">{discount}% off</span>
                        )}
                      </div>
                      <span className="shop-card-cta">
                        View details
                        <i
                          className="fas fa-arrow-right"
                          aria-hidden="true"
                        ></i>
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
