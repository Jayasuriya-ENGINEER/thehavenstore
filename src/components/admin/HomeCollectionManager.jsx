import { useEffect, useState } from "react";
import {
  BANNER_SECTIONS,
  fetchHomeCollections,
  replaceHomeCollectionImage,
} from "../../services/banners";

export default function HomeCollectionManager() {
  const [collections, setCollections] = useState({});
  const [uploading, setUploading] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchHomeCollections()
      .then(setCollections)
      .catch(() => setError("Could not load the home card images."));
  }, []);

  const uploadImage = async (section, event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(section);
    setError("");
    try {
      const image = await replaceHomeCollectionImage(section, file);
      setCollections((current) => ({ ...current, [section]: image }));
    } catch (err) {
      setError(err?.message || "Could not upload the image.");
    } finally {
      setUploading("");
    }
  };

  return (
    <section className="admin-banners-panel" aria-labelledby="admin-home-cards-title">
      <div className="admin-banners-header">
        <div>
          <h2 id="admin-home-cards-title">Home page collection cards</h2>
          <p>Upload the images that replace the Men, Accessories, and Women placeholders on the home page.</p>
        </div>
      </div>
      {error && <div className="admin-alert admin-alert-error" role="alert">{error}</div>}
      <div className="admin-home-cards-grid">
        {BANNER_SECTIONS.map(({ key, label }) => {
          const image = collections[key];
          const isUploading = uploading === key;
          return (
            <div className="admin-home-card" key={key}>
              <div className="admin-home-card-preview">
                {image?.url ? <img src={image.url} alt={`${label} home card`} /> : <span>No image selected</span>}
              </div>
              <div className="admin-home-card-footer">
                <strong>{label}</strong>
                <label className={`admin-btn admin-btn-secondary admin-btn-sm${isUploading ? " is-busy" : ""}`}>
                  <i className="fas fa-image" aria-hidden="true" />
                  {isUploading ? "Uploading…" : image ? "Replace image" : "Upload image"}
                  <input type="file" accept="image/*" disabled={Boolean(uploading)} onChange={(event) => uploadImage(key, event)} />
                </label>
              </div>
            </div>
          );
        })}
      </div>
      <p className="admin-field-hint" style={{ marginTop: 14 }}>Portrait images work best — 1080 × 1350 px (4:5).</p>
    </section>
  );
}