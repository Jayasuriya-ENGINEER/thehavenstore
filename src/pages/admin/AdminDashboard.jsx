import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
} from "../../services/products";
import {
  BANNER_SECTIONS,
  fetchAllSectionBanners,
  addBannerImages,
  removeBannerImage,
  saveSectionBanners,
  fetchHomePopupBanner,
  replaceHomePopupBanner,
  removeHomePopupBanner,
} from "../../services/banners";
import { formatPrice } from "../../data/mensProducts";
import "./Admin.css";

const CATEGORIES = [
  "T-Shirts",
  "Polos",
  "Hoodies",
  "Sweatshirts",
  "Shirts",
  "Bottoms",
  "Accessories",
  "Dresses",
  "Tops",
];

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36"];

const emptyForm = () => ({
  id: "",
  name: "",
  category: "T-Shirts",
  gender: "men",
  price: "",
  originalPrice: "",
  stock: "",
  badge: "",
  shortDesc: "",
  description: "",
  detailsText: "",
  colors: [{ name: "Black", hex: "#111111" }],
  sizes: ["S", "M", "L", "XL", "XXL"],
  images: [],
  imagePaths: [],
  rating: 0,
  reviews: 0,
  inStock: true,
  active: true,
});

function productToForm(p) {
  return {
    id: p.id || "",
    name: p.name || "",
    category: p.category || "T-Shirts",
    gender: p.gender || "men",
    price: p.price ?? "",
    originalPrice: p.originalPrice ?? "",
    stock: p.stock ?? p.amount ?? "",
    badge: p.badge || "",
    shortDesc: p.shortDesc || "",
    description: p.description || "",
    detailsText: (p.details || []).join("\n"),
    colors:
      p.colors?.length > 0
        ? p.colors.map((c) => ({ name: c.name || "", hex: c.hex || "#111111" }))
        : [{ name: "Black", hex: "#111111" }],
    sizes: p.sizes?.length ? [...p.sizes] : ["S", "M", "L", "XL"],
    images: Array.isArray(p.images) ? [...p.images] : [],
    imagePaths: Array.isArray(p.imagePaths) ? [...p.imagePaths] : [],
    rating: p.rating || 0,
    reviews: p.reviews || 0,
    inStock: p.inStock !== false,
    active: p.active !== false,
  };
}

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());

  // Section banners (Men / Women / Accessories)
  const [bannerSection, setBannerSection] = useState("men");
  const [bannersBySection, setBannersBySection] = useState({
    men: { images: [] },
    women: { images: [] },
    accessories: { images: [] },
  });
  const [bannersLoading, setBannersLoading] = useState(true);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [bannerError, setBannerError] = useState("");
  const [popupBanner, setPopupBanner] = useState(null);
  const [popupLoading, setPopupLoading] = useState(true);
  const [popupUploading, setPopupUploading] = useState(false);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const list = await fetchProducts({ activeOnly: false });
      setProducts(list);
    } catch (err) {
      console.error(err);
      setError(
        err?.message ||
          "Could not load products. Check Firebase rules and that Firestore is enabled.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadBanners = useCallback(async () => {
    setBannersLoading(true);
    setBannerError("");
    try {
      const all = await fetchAllSectionBanners();
      setBannersBySection(all);
    } catch (err) {
      console.error(err);
      setBannerError(
        err?.message ||
          "Could not load banners. Check Firebase rules and that Storage is enabled.",
      );
    } finally {
      setBannersLoading(false);
    }
  }, []);

  const loadPopupBanner = useCallback(async () => {
    setPopupLoading(true);
    try {
      setPopupBanner(await fetchHomePopupBanner());
    } catch (err) {
      console.error(err);
      setBannerError(err?.message || "Could not load the home popup banner.");
    } finally {
      setPopupLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    loadBanners();
  }, [loadBanners]);

  useEffect(() => {
    loadPopupBanner();
  }, [loadPopupBanner]);

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(""), 3200);
    return () => clearTimeout(t);
  }, [success]);

  const stats = useMemo(() => {
    const total = products.length;
    const active = products.filter((p) => p.active).length;
    const lowStock = products.filter((p) => (p.stock ?? 0) <= 5).length;
    return { total, active, lowStock };
  }, [products]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q),
    );
  }, [products, search]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setError("");
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditingId(product.id);
    setForm(productToForm(product));
    setError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving || uploading) return;
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm());
  };

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleSize = (size) => {
    setForm((prev) => {
      const has = prev.sizes.includes(size);
      return {
        ...prev,
        sizes: has
          ? prev.sizes.filter((s) => s !== size)
          : [...prev.sizes, size],
      };
    });
  };

  const updateColor = (index, key, value) => {
    setForm((prev) => {
      const colors = prev.colors.map((c, i) =>
        i === index ? { ...c, [key]: value } : c,
      );
      return { ...prev, colors };
    });
  };

  const addColor = () => {
    setForm((prev) => ({
      ...prev,
      colors: [...prev.colors, { name: "", hex: "#888888" }],
    }));
  };

  const removeColor = (index) => {
    setForm((prev) => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index),
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;

    setUploading(true);
    setError("");
    try {
      const key = form.id || form.name || "new";
      const uploaded = [];
      for (const file of files) {
        if (!file.type.startsWith("image/")) continue;
        const result = await uploadProductImage(file, key);
        uploaded.push(result);
      }
      if (!uploaded.length) {
        setError("Please choose image files only.");
        return;
      }
      setForm((prev) => ({
        ...prev,
        images: [...prev.images, ...uploaded.map((u) => u.url)],
        imagePaths: [...prev.imagePaths, ...uploaded.map((u) => u.path)],
      }));
    } catch (err) {
      console.error(err);
      setError(
        err?.message ||
          "Image upload failed. Enable Firebase Storage and allow authenticated uploads.",
      );
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      imagePaths: prev.imagePaths.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    if (!form.name.trim()) return "Product name is required.";
    if (!form.price && form.price !== 0) return "Price is required.";
    if (Number(form.price) < 0) return "Price cannot be negative.";
    if (!form.sizes.length) return "Select at least one size.";
    if (!form.images.length) return "Upload at least one product photo.";
    return null;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        details: form.detailsText
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
        colors: form.colors
          .map((c) => ({
            name: c.name.trim(),
            hex: c.hex || "#111111",
          }))
          .filter((c) => c.name),
        stock: Number(form.stock) || 0,
        amount: Number(form.stock) || 0,
        price: Number(form.price) || 0,
        originalPrice: Number(form.originalPrice) || Number(form.price) || 0,
        inStock: form.inStock && (Number(form.stock) || 0) > 0,
      };

      if (editingId) {
        await updateProduct(editingId, payload);
        setSuccess(`Updated “${payload.name}”.`);
      } else {
        await createProduct(payload);
        setSuccess(`Added “${payload.name}”.`);
      }

      setModalOpen(false);
      setEditingId(null);
      setForm(emptyForm());
      await loadProducts();
    } catch (err) {
      console.error(err);
      setError(
        err?.message ||
          "Could not save product. Check Firestore rules for admin write access.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    const ok = window.confirm(
      `Delete “${product.name}”? This cannot be undone.`,
    );
    if (!ok) return;

    setError("");
    try {
      await deleteProduct(product);
      setSuccess(`Deleted “${product.name}”.`);
      await loadProducts();
    } catch (err) {
      console.error(err);
      setError(err?.message || "Could not delete product.");
    }
  };

  const currentBanners = bannersBySection[bannerSection]?.images || [];

  const handleBannerUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;

    setBannerUploading(true);
    setBannerError("");
    try {
      const updated = await addBannerImages(bannerSection, files);
      setBannersBySection((prev) => ({
        ...prev,
        [bannerSection]: updated,
      }));
      const label =
        BANNER_SECTIONS.find((s) => s.key === bannerSection)?.label ||
        bannerSection;
      setSuccess(`Banner(s) added for ${label}.`);
    } catch (err) {
      console.error(err);
      setBannerError(
        err?.message ||
          "Banner upload failed. Enable Firebase Storage and allow authenticated uploads.",
      );
    } finally {
      setBannerUploading(false);
    }
  };

  const handlePopupUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setPopupUploading(true);
    setBannerError("");
    try {
      setPopupBanner(await replaceHomePopupBanner(file));
      setSuccess("Home popup banner saved.");
    } catch (err) {
      console.error(err);
      setBannerError(err?.message || "Could not upload the home popup banner.");
    } finally {
      setPopupUploading(false);
    }
  };

  const handlePopupRemove = async () => {
    if (!popupBanner || !window.confirm("Remove the home popup banner?")) return;
    setPopupUploading(true);
    setBannerError("");
    try {
      await removeHomePopupBanner();
      setPopupBanner(null);
      setSuccess("Home popup banner removed.");
    } catch (err) {
      console.error(err);
      setBannerError(err?.message || "Could not remove the home popup banner.");
    } finally {
      setPopupUploading(false);
    }
  };

  const handleBannerRemove = async (imageId) => {
    if (!imageId) return;
    const ok = window.confirm("Remove this banner image?");
    if (!ok) return;

    setBannerError("");
    try {
      const updated = await removeBannerImage(bannerSection, imageId);
      setBannersBySection((prev) => ({
        ...prev,
        [bannerSection]: updated,
      }));
      setSuccess("Banner removed.");
    } catch (err) {
      console.error(err);
      setBannerError(err?.message || "Could not remove banner.");
    }
  };

  const moveBanner = async (fromIndex, direction) => {
    const images = [...currentBanners];
    const toIndex = fromIndex + direction;
    if (toIndex < 0 || toIndex >= images.length) return;

    const tmp = images[fromIndex];
    images[fromIndex] = images[toIndex];
    images[toIndex] = tmp;

    // Optimistic UI
    setBannersBySection((prev) => ({
      ...prev,
      [bannerSection]: { ...prev[bannerSection], images },
    }));

    try {
      const updated = await saveSectionBanners(bannerSection, images);
      setBannersBySection((prev) => ({
        ...prev,
        [bannerSection]: updated,
      }));
    } catch (err) {
      console.error(err);
      setBannerError(err?.message || "Could not reorder banners.");
      await loadBanners();
    }
  };

  return (
    <>
      <Navbar solid />
      <div className="admin-page">
        <header className="admin-header">
          <div className="container admin-header-inner">
            <div>
              <h1>Admin dashboard</h1>
              <p>
                Manage products and section banners — photos, price, sizes,
                colors, stock, and slideshow images for Men, Women, and
                Accessories.
              </p>
            </div>
            <div className="admin-header-actions">
              <Link to="/men" className="admin-btn admin-btn-secondary">
                <i className="fas fa-store" aria-hidden="true"></i>
                Men
              </Link>
              <Link to="/women" className="admin-btn admin-btn-secondary">
                Women
              </Link>
              <Link to="/accessories" className="admin-btn admin-btn-secondary">
                Accessories
              </Link>
              <button type="button" className="admin-btn" onClick={openCreate}>
                <i className="fas fa-plus" aria-hidden="true"></i>
                Add product
              </button>
            </div>
          </div>
        </header>

        <div className="container">
          <div className="admin-stats">
            <div className="admin-stat">
              <span className="admin-stat-label">Total products</span>
              <span className="admin-stat-value">{stats.total}</span>
            </div>
            <div className="admin-stat">
              <span className="admin-stat-label">Active</span>
              <span className="admin-stat-value">{stats.active}</span>
            </div>
            <div className="admin-stat">
              <span className="admin-stat-label">Low stock (≤5)</span>
              <span className="admin-stat-value">{stats.lowStock}</span>
            </div>
          </div>

          {error && !modalOpen && (
            <div className="admin-alert admin-alert-error" role="alert">
              <i className="fas fa-circle-exclamation" aria-hidden="true"></i>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="admin-alert admin-alert-success" role="status">
              <i className="fas fa-circle-check" aria-hidden="true"></i>
              <span>{success}</span>
            </div>
          )}

          <section className="admin-banners-panel" aria-labelledby="admin-popup-title">
            <div className="admin-banners-header">
              <div>
                <h2 id="admin-popup-title">Home popup banner</h2>
                <p>
                  Shown once per visitor session on the home page. Clicking it takes the visitor to the Men&apos;s section.
                </p>
              </div>
            </div>
            <div className="admin-popup-banner-body">
              {popupLoading ? (
                <p className="admin-banner-empty-hint">Loading popup banner…</p>
              ) : popupBanner ? (
                <div className="admin-popup-banner-preview">
                  <img src={popupBanner.url} alt="Current home popup banner" />
                  <button
                    type="button"
                    className="admin-btn admin-btn-danger admin-btn-sm"
                    onClick={handlePopupRemove}
                    disabled={popupUploading}
                  >
                    <i className="fas fa-trash" aria-hidden="true"></i>
                    Remove popup
                  </button>
                </div>
              ) : (
                <p className="admin-banner-empty-hint">No home popup is active.</p>
              )}
              <label className={`admin-banner-upload${popupUploading ? " is-busy" : ""}`}>
                <i className="fas fa-image" aria-hidden="true"></i>
                <span>{popupUploading ? "Uploading…" : popupBanner ? "Replace popup banner" : "Upload popup banner"}</span>
                <span className="admin-field-hint">
                  Recommended size: 1080 × 1350 px (4:5). This format fits desktop and mobile screens well.
                </span>
                <input type="file" accept="image/*" disabled={popupUploading} onChange={handlePopupUpload} />
              </label>
            </div>
          </section>

          {/* ── Section banners ── */}
          <section className="admin-banners-panel" aria-labelledby="admin-banners-title">
            <div className="admin-banners-header">
              <div>
                <h2 id="admin-banners-title">Section banners</h2>
                <p>
                  Upload different slideshow images for Men, Women, and
                  Accessories. They auto-scroll in a loop at the top of each
                  section.
                </p>
              </div>
              <button
                type="button"
                className="admin-btn admin-btn-secondary admin-btn-sm"
                onClick={loadBanners}
                disabled={bannersLoading || bannerUploading}
              >
                <i className="fas fa-rotate" aria-hidden="true"></i>
                Refresh banners
              </button>
            </div>

            <div className="admin-banner-tabs" role="tablist" aria-label="Banner section">
              {BANNER_SECTIONS.map(({ key, label }) => {
                const count = bannersBySection[key]?.images?.length || 0;
                return (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={bannerSection === key}
                    className={`admin-banner-tab${
                      bannerSection === key ? " active" : ""
                    }`}
                    onClick={() => {
                      setBannerSection(key);
                      setBannerError("");
                    }}
                  >
                    {label}
                    <span className="admin-banner-tab-count">{count}</span>
                  </button>
                );
              })}
            </div>

            {bannerError && (
              <div className="admin-alert admin-alert-error" role="alert">
                <i className="fas fa-circle-exclamation" aria-hidden="true"></i>
                <span>{bannerError}</span>
              </div>
            )}

            {bannersLoading ? (
              <div className="admin-loading" style={{ padding: "32px 20px" }}>
                <i className="fas fa-spinner fa-spin" aria-hidden="true"></i>
                <p>Loading banners…</p>
              </div>
            ) : (
              <div className="admin-banner-body">
                <div className="admin-banner-grid">
                  {currentBanners.map((img, index) => (
                    <div className="admin-banner-card" key={img.id || index}>
                      <img src={img.url} alt={`Banner ${index + 1}`} />
                      <div className="admin-banner-card-actions">
                        <button
                          type="button"
                          className="admin-btn admin-btn-secondary admin-btn-sm"
                          onClick={() => moveBanner(index, -1)}
                          disabled={index === 0 || bannerUploading}
                          aria-label="Move earlier"
                          title="Move left"
                        >
                          <i className="fas fa-arrow-left" aria-hidden="true"></i>
                        </button>
                        <button
                          type="button"
                          className="admin-btn admin-btn-secondary admin-btn-sm"
                          onClick={() => moveBanner(index, 1)}
                          disabled={
                            index === currentBanners.length - 1 || bannerUploading
                          }
                          aria-label="Move later"
                          title="Move right"
                        >
                          <i className="fas fa-arrow-right" aria-hidden="true"></i>
                        </button>
                        <button
                          type="button"
                          className="admin-btn admin-btn-danger admin-btn-sm"
                          onClick={() => handleBannerRemove(img.id)}
                          disabled={bannerUploading}
                          aria-label="Remove banner"
                        >
                          <i className="fas fa-trash" aria-hidden="true"></i>
                        </button>
                      </div>
                      <span className="admin-banner-order">#{index + 1}</span>
                    </div>
                  ))}

                  <label
                    className={`admin-banner-upload${
                      bannerUploading ? " is-busy" : ""
                    }`}
                  >
                    <i className="fas fa-cloud-arrow-up" aria-hidden="true"></i>
                    <span>
                      {bannerUploading
                        ? "Uploading…"
                        : `Add ${BANNER_SECTIONS.find((s) => s.key === bannerSection)?.label || ""} banners`}
                    </span>
                    <span className="admin-field-hint">
                      JPG / PNG / WebP · wide images work best
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={bannerUploading}
                      onChange={handleBannerUpload}
                    />
                  </label>
                </div>

                {currentBanners.length === 0 && (
                  <p className="admin-banner-empty-hint">
                    No banners for this section yet. Upload one or more images —
                    they will slideshow automatically on the shop page.
                  </p>
                )}
              </div>
            )}
          </section>

          <div className="admin-section-divider">
            <h2>Products</h2>
          </div>

          <div className="admin-toolbar">
            <div className="admin-search">
              <i className="fas fa-search" aria-hidden="true"></i>
              <input
                type="search"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search products"
              />
            </div>
            <button
              type="button"
              className="admin-btn admin-btn-secondary admin-btn-sm"
              onClick={loadProducts}
              disabled={loading}
            >
              <i className="fas fa-rotate" aria-hidden="true"></i>
              Refresh
            </button>
          </div>

          <div className="admin-table-wrap">
            {loading ? (
              <div className="admin-loading">
                <i className="fas fa-spinner fa-spin" aria-hidden="true"></i>
                <p>Loading products…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="admin-empty">
                <i className="fas fa-box-open" aria-hidden="true"></i>
                <h3>
                  {products.length === 0
                    ? "No products yet"
                    : "No matching products"}
                </h3>
                <p>
                  {products.length === 0
                    ? "Add your first product to show it on the shop."
                    : "Try a different search."}
                </p>
                {products.length === 0 && (
                  <button
                    type="button"
                    className="admin-btn"
                    style={{ marginTop: 16 }}
                    onClick={openCreate}
                  >
                    <i className="fas fa-plus" aria-hidden="true"></i>
                    Add product
                  </button>
                )}
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="admin-product-cell">
                          {p.images?.[0] ? (
                            <img
                              className="admin-product-thumb"
                              src={p.images[0]}
                              alt=""
                            />
                          ) : (
                            <div className="admin-product-thumb placeholder">
                              <i className="fas fa-image" aria-hidden="true"></i>
                            </div>
                          )}
                          <div>
                            <div className="admin-product-name">{p.name}</div>
                            <div className="admin-product-meta">
                              {p.category} · {p.gender}
                              {p.badge ? ` · ${p.badge}` : ""}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <strong>{formatPrice(p.price)}</strong>
                        {p.originalPrice > p.price && (
                          <div className="admin-product-meta">
                            MRP {formatPrice(p.originalPrice)}
                          </div>
                        )}
                      </td>
                      <td>
                        <span
                          className={`admin-badge ${
                            (p.stock ?? 0) <= 0
                              ? "admin-badge-off"
                              : (p.stock ?? 0) <= 5
                                ? "admin-badge-warn"
                                : "admin-badge-ok"
                          }`}
                        >
                          {p.stock ?? 0} units
                        </span>
                      </td>
                      <td>
                        <span
                          className={`admin-badge ${
                            p.active ? "admin-badge-ok" : "admin-badge-off"
                          }`}
                        >
                          {p.active ? "Active" : "Hidden"}
                        </span>
                      </td>
                      <td>
                        <div className="admin-row-actions">
                          <button
                            type="button"
                            className="admin-btn admin-btn-secondary admin-btn-sm"
                            onClick={() => openEdit(p)}
                          >
                            <i className="fas fa-pen" aria-hidden="true"></i>
                            Edit
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn-danger admin-btn-sm"
                            onClick={() => handleDelete(p)}
                          >
                            <i className="fas fa-trash" aria-hidden="true"></i>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {modalOpen && (
        <div
          className="admin-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h2 id="admin-modal-title">
                {editingId ? "Edit product" : "Add product"}
              </h2>
              <button
                type="button"
                className="admin-modal-close"
                onClick={closeModal}
                aria-label="Close"
              >
                <i className="fas fa-xmark" aria-hidden="true"></i>
              </button>
            </div>

            <form className="admin-form" onSubmit={handleSave}>
              {error && (
                <div className="admin-alert admin-alert-error" role="alert">
                  <i
                    className="fas fa-circle-exclamation"
                    aria-hidden="true"
                  ></i>
                  <span>{error}</span>
                </div>
              )}

              <div className="admin-form-grid">
                <div className="admin-field full">
                  <label htmlFor="p-name">Product name *</label>
                  <input
                    id="p-name"
                    value={form.name}
                    onChange={(e) => setField("name", e.target.value)}
                    placeholder="e.g. Classic Crew Neck Tee"
                    required
                  />
                </div>

                {!editingId && (
                  <div className="admin-field full">
                    <label htmlFor="p-id">URL slug (optional)</label>
                    <input
                      id="p-id"
                      value={form.id}
                      onChange={(e) => setField("id", e.target.value)}
                      placeholder="auto from name if empty"
                    />
                    <span className="admin-field-hint">
                      Used in the product URL, e.g. /men/…, /women/…, /accessories/…
                    </span>
                  </div>
                )}

                <div className="admin-field">
                  <label htmlFor="p-category">Category</label>
                  <select
                    id="p-category"
                    value={form.category}
                    onChange={(e) => setField("category", e.target.value)}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="admin-field">
                  <label htmlFor="p-gender">Gender / section</label>
                  <select
                    id="p-gender"
                    value={form.gender}
                    onChange={(e) => setField("gender", e.target.value)}
                  >
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                    <option value="unisex">Unisex</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>

                <div className="admin-field">
                  <label htmlFor="p-price">Selling price (₹) *</label>
                  <input
                    id="p-price"
                    type="number"
                    min="0"
                    step="1"
                    value={form.price}
                    onChange={(e) => setField("price", e.target.value)}
                    required
                  />
                </div>

                <div className="admin-field">
                  <label htmlFor="p-mrp">MRP / original price (₹)</label>
                  <input
                    id="p-mrp"
                    type="number"
                    min="0"
                    step="1"
                    value={form.originalPrice}
                    onChange={(e) => setField("originalPrice", e.target.value)}
                  />
                </div>

                <div className="admin-field">
                  <label htmlFor="p-stock">Stock amount *</label>
                  <input
                    id="p-stock"
                    type="number"
                    min="0"
                    step="1"
                    value={form.stock}
                    onChange={(e) => setField("stock", e.target.value)}
                    placeholder="e.g. 25"
                  />
                </div>

                <div className="admin-field">
                  <label htmlFor="p-badge">Badge (optional)</label>
                  <input
                    id="p-badge"
                    value={form.badge}
                    onChange={(e) => setField("badge", e.target.value)}
                    placeholder="New, Bestseller, Sale…"
                  />
                </div>

                <div className="admin-field full">
                  <label>Sizes *</label>
                  <div className="admin-checks">
                    {SIZE_OPTIONS.map((size) => (
                      <label
                        key={size}
                        className={`admin-check-chip${
                          form.sizes.includes(size) ? " active" : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={form.sizes.includes(size)}
                          onChange={() => toggleSize(size)}
                        />
                        {size}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="admin-field full">
                  <label>Colors</label>
                  <div className="admin-colors-editor">
                    {form.colors.map((color, index) => (
                      <div className="admin-color-row" key={index}>
                        <input
                          type="text"
                          placeholder="Color name"
                          value={color.name}
                          onChange={(e) =>
                            updateColor(index, "name", e.target.value)
                          }
                        />
                        <input
                          type="color"
                          value={color.hex}
                          onChange={(e) =>
                            updateColor(index, "hex", e.target.value)
                          }
                          title="Pick color"
                        />
                        <button
                          type="button"
                          className="admin-btn admin-btn-danger admin-btn-sm"
                          onClick={() => removeColor(index)}
                          disabled={form.colors.length <= 1}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="admin-btn admin-btn-secondary admin-btn-sm"
                      onClick={addColor}
                      style={{ alignSelf: "flex-start" }}
                    >
                      <i className="fas fa-plus" aria-hidden="true"></i>
                      Add color
                    </button>
                  </div>
                </div>

                <div className="admin-field full">
                  <label>Photos *</label>
                  <div className="admin-images-grid">
                    {form.images.map((url, index) => (
                      <div className="admin-image-card" key={`${url}-${index}`}>
                        <img src={url} alt={`Product ${index + 1}`} />
                        <button
                          type="button"
                          className="admin-image-remove"
                          onClick={() => removeImage(index)}
                          aria-label="Remove image"
                        >
                          <i className="fas fa-xmark" aria-hidden="true"></i>
                        </button>
                      </div>
                    ))}
                    <label className="admin-image-upload">
                      <i className="fas fa-cloud-arrow-up" aria-hidden="true"></i>
                      {uploading ? "Uploading…" : "Upload photos"}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        disabled={uploading}
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                  <span className="admin-field-hint">
                    JPG / PNG / WebP. First image is the main shop thumbnail.
                  </span>
                </div>

                <div className="admin-field full">
                  <label htmlFor="p-short">Short description</label>
                  <input
                    id="p-short"
                    value={form.shortDesc}
                    onChange={(e) => setField("shortDesc", e.target.value)}
                    placeholder="One-line summary for the product card"
                  />
                </div>

                <div className="admin-field full">
                  <label htmlFor="p-desc">Full description</label>
                  <textarea
                    id="p-desc"
                    value={form.description}
                    onChange={(e) => setField("description", e.target.value)}
                    placeholder="Detailed product description"
                  />
                </div>

                <div className="admin-field full">
                  <label htmlFor="p-details">
                    Product details (one per line)
                  </label>
                  <textarea
                    id="p-details"
                    value={form.detailsText}
                    onChange={(e) => setField("detailsText", e.target.value)}
                    placeholder={"100% cotton\nMachine wash cold\n..."}
                  />
                </div>

                <div className="admin-field full">
                  <div className="admin-toggles">
                    <label className="admin-toggle">
                      <input
                        type="checkbox"
                        checked={form.active}
                        onChange={(e) => setField("active", e.target.checked)}
                      />
                      Show on website
                    </label>
                    <label className="admin-toggle">
                      <input
                        type="checkbox"
                        checked={form.inStock}
                        onChange={(e) => setField("inStock", e.target.checked)}
                      />
                      Mark as in stock
                    </label>
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={closeModal}
                  disabled={saving || uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn"
                  disabled={saving || uploading}
                >
                  {saving ? (
                    <>
                      <i className="fas fa-spinner fa-spin" aria-hidden="true"></i>
                      Saving…
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check" aria-hidden="true"></i>
                      {editingId ? "Save changes" : "Create product"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
