import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../data/mensProducts";
import {
  emptyAddress,
  fetchUserAddresses,
  INDIAN_STATES,
  saveUserAddress,
  validateAddress,
} from "../services/addresses";
import {
  calcShipping,
  FREE_SHIPPING_THRESHOLD,
  placeOrder,
} from "../services/orders";
import { payWithRazorpay } from "../services/razorpay";
import "./Checkout.css";

export default function Checkout() {
  const navigate = useNavigate();
  const { currentUser, userData, setUserData } = useAuth();
  const { items, itemCount, subtotal, mrpTotal, discountTotal, clearCart } =
    useCart();

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("new");
  const [form, setForm] = useState(() =>
    emptyAddress({
      fullName: "",
      email: "",
      phone: "",
    }),
  );
  const [errors, setErrors] = useState({});
  const [saveAddress, setSaveAddress] = useState(true);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  const shipping = calcShipping(subtotal);
  const total = subtotal + shipping;
  const freeShipLeft = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  // Prefill contact from auth
  useEffect(() => {
    if (!currentUser) return;
    setForm((prev) => ({
      ...prev,
      fullName:
        prev.fullName ||
        userData?.displayName ||
        currentUser.displayName ||
        "",
      email: prev.email || currentUser.email || userData?.email || "",
      phone: prev.phone || userData?.phone || "",
    }));
  }, [currentUser, userData]);

  // Load saved addresses
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!currentUser?.uid) {
        setSavedAddresses([]);
        setSelectedAddressId("new");
        return;
      }
      setLoadingAddresses(true);
      try {
        const list = await fetchUserAddresses(currentUser.uid);
        if (cancelled) return;
        setSavedAddresses(list);
        const def =
          list.find((a) => a.isDefault) || list[0] || null;
        if (def) {
          setSelectedAddressId(def.id);
          setForm((prev) => ({
            ...emptyAddress(def),
            email: def.email || currentUser.email || prev.email,
          }));
        } else {
          setSelectedAddressId("new");
        }
      } catch (e) {
        console.warn(e);
      } finally {
        if (!cancelled) setLoadingAddresses(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [currentUser?.uid, currentUser?.email]);

  const usingSaved = selectedAddressId !== "new";

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
    setSubmitError("");
  };

  const selectSaved = (addr) => {
    setSelectedAddressId(addr.id);
    setForm(emptyAddress({
      ...addr,
      email: addr.email || currentUser?.email || "",
    }));
    setErrors({});
  };

  const selectNew = () => {
    setSelectedAddressId("new");
    setForm(
      emptyAddress({
        fullName:
          userData?.displayName || currentUser?.displayName || form.fullName || "",
        email: currentUser?.email || form.email || "",
        phone: userData?.phone || form.phone || "",
      }),
    );
    setErrors({});
  };

  const activeAddress = useMemo(() => {
    if (usingSaved) {
      const found = savedAddresses.find((a) => a.id === selectedAddressId);
      if (found) {
        return {
          ...found,
          email: found.email || form.email || currentUser?.email || "",
        };
      }
    }
    return form;
  }, [
    usingSaved,
    savedAddresses,
    selectedAddressId,
    form,
    currentUser?.email,
  ]);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!items.length) {
      navigate("/cart");
      return;
    }

    // Prefer form fields so user can tweak even when a saved address is selected
    const shippingAddress = usingSaved
      ? { ...activeAddress, ...form, id: activeAddress.id }
      : form;

    const fieldErrors = validateAddress(shippingAddress);
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors);
      setSubmitError("Please fix the highlighted delivery details.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      // Save address for logged-in users
      if (currentUser?.uid && (saveAddress || usingSaved)) {
        try {
          const saved = await saveUserAddress(
            currentUser.uid,
            {
              ...shippingAddress,
              id: usingSaved ? selectedAddressId : shippingAddress.id,
            },
            { makeDefault: true },
          );
          setSavedAddresses((prev) => {
            const rest = prev.filter((a) => a.id !== saved.id);
            return [saved, ...rest.map((a) => ({ ...a, isDefault: false }))];
          });
          if (setUserData) {
            setUserData((prev) =>
              prev
                ? {
                    ...prev,
                    phone: saved.phone,
                    addresses: [
                      saved,
                      ...(Array.isArray(prev.addresses)
                        ? prev.addresses.filter((a) => a.id !== saved.id)
                        : []),
                    ],
                  }
                : prev,
            );
          }
        } catch (addrErr) {
          console.warn("Address save skipped:", addrErr?.message);
        }
      }

      const paymentFields = await payWithRazorpay({
        amountRupees: total,
        receipt: `ord_${Date.now()}`.slice(0, 40),
        customer: {
          fullName: shippingAddress.fullName,
          email: shippingAddress.email,
          phone: shippingAddress.phone,
        },
        notes: {
          itemCount: String(itemCount),
        },
      });

      const order = await placeOrder({
        userId: currentUser?.uid || null,
        items,
        address: shippingAddress,
        paymentMethod: "razorpay",
        notes,
        ...paymentFields,
      });

      clearCart();
      navigate(`/order-success/${order.id}`, {
        state: { order },
        replace: true,
      });
    } catch (err) {
      console.error(err);
      setSubmitError(
        err?.message || "Could not place order. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!items.length) {
    return (
      <>
        <Navbar solid />
        <div className="ck-page">
          <div className="ck-container">
            <div className="ck-empty">
              <i className="fas fa-shopping-bag" aria-hidden="true"></i>
              <h2>Nothing to checkout</h2>
              <p>Add products to your bag before placing an order.</p>
              <Link to="/men" className="ck-btn ck-btn-primary">
                Shop now
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar solid />
      <div className="ck-page">
        <div className="ck-container">
          <header className="ck-header">
            <nav className="ck-breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span>/</span>
              <Link to="/cart">Bag</Link>
              <span>/</span>
              <span className="current">Checkout</span>
            </nav>
            <h1>Checkout</h1>
            <p>Enter delivery details and place your order</p>
          </header>

          <div className="ck-steps" aria-label="Checkout progress">
            <div className="ck-step done">
              <span className="ck-step-num">
                <i className="fas fa-check" aria-hidden="true"></i>
              </span>
              Bag
            </div>
            <div className="ck-step active">
              <span className="ck-step-num">2</span>
              Delivery
            </div>
            <div className="ck-step">
              <span className="ck-step-num">3</span>
              Place order
            </div>
          </div>

          <form onSubmit={handlePlaceOrder}>
            <div className="ck-layout">
              <div className="ck-main">
                {submitError && (
                  <div className="ck-error-banner" role="alert">
                    <i className="fas fa-circle-exclamation" aria-hidden="true"></i>
                    <span>{submitError}</span>
                  </div>
                )}

                {!currentUser && (
                  <div className="ck-login-nudge">
                    <span>
                      Already have an account? Sign in to use saved addresses.
                    </span>
                    <Link to="/login?redirect=/checkout">Sign in</Link>
                  </div>
                )}

                {/* Delivery address */}
                <div className="ck-card">
                  <div className="ck-card-head">
                    <div>
                      <h2>Delivery address</h2>
                      <p className="ck-card-sub" style={{ marginBottom: 0 }}>
                        Where should we deliver this order?
                      </p>
                    </div>
                  </div>

                  {currentUser && loadingAddresses && (
                    <p className="ck-hint" style={{ marginBottom: 12 }}>
                      Loading saved addresses…
                    </p>
                  )}

                  {currentUser && savedAddresses.length > 0 && (
                    <div className="ck-addr-list">
                      {savedAddresses.map((addr) => (
                        <button
                          key={addr.id}
                          type="button"
                          className={`ck-addr-option${selectedAddressId === addr.id ? " selected" : ""}`}
                          onClick={() => selectSaved(addr)}
                        >
                          <input
                            type="radio"
                            name="saved-addr"
                            checked={selectedAddressId === addr.id}
                            onChange={() => selectSaved(addr)}
                            tabIndex={-1}
                          />
                          <div>
                            <strong>
                              {addr.fullName}
                              {addr.label && (
                                <span className="ck-addr-badge">
                                  {addr.label}
                                </span>
                              )}
                              {addr.isDefault && (
                                <span className="ck-addr-badge">Default</span>
                              )}
                            </strong>
                            <p>
                              {addr.line1}
                              {addr.line2 ? `, ${addr.line2}` : ""}
                              <br />
                              {addr.city}, {addr.state} — {addr.pincode}
                              <br />
                              Phone: {addr.phone}
                            </p>
                          </div>
                        </button>
                      ))}
                      <button
                        type="button"
                        className={`ck-addr-option${selectedAddressId === "new" ? " selected" : ""}`}
                        onClick={selectNew}
                      >
                        <input
                          type="radio"
                          name="saved-addr"
                          checked={selectedAddressId === "new"}
                          onChange={selectNew}
                          tabIndex={-1}
                        />
                        <div>
                          <strong>Add a new address</strong>
                          <p>Enter a different delivery location</p>
                        </div>
                      </button>
                    </div>
                  )}

                  <div className="ck-form-grid">
                    <div className="ck-field">
                      <label htmlFor="ck-name">
                        Full name<span className="req">*</span>
                      </label>
                      <input
                        id="ck-name"
                        value={form.fullName}
                        onChange={(e) => setField("fullName", e.target.value)}
                        className={errors.fullName ? "error" : ""}
                        autoComplete="name"
                        placeholder="As on package"
                      />
                      {errors.fullName && (
                        <span className="ck-field-error">{errors.fullName}</span>
                      )}
                    </div>

                    <div className="ck-field">
                      <label htmlFor="ck-phone">
                        Mobile number<span className="req">*</span>
                      </label>
                      <input
                        id="ck-phone"
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={form.phone}
                        onChange={(e) =>
                          setField(
                            "phone",
                            e.target.value.replace(/\D/g, "").slice(0, 10),
                          )
                        }
                        className={errors.phone ? "error" : ""}
                        autoComplete="tel"
                        placeholder="10-digit mobile"
                      />
                      {errors.phone && (
                        <span className="ck-field-error">{errors.phone}</span>
                      )}
                    </div>

                    <div className="ck-field full">
                      <label htmlFor="ck-email">
                        Email<span className="req">*</span>
                      </label>
                      <input
                        id="ck-email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setField("email", e.target.value)}
                        className={errors.email ? "error" : ""}
                        autoComplete="email"
                        placeholder="For order updates"
                      />
                      {errors.email && (
                        <span className="ck-field-error">{errors.email}</span>
                      )}
                    </div>

                    <div className="ck-field full">
                      <label htmlFor="ck-line1">
                        Address line 1<span className="req">*</span>
                      </label>
                      <input
                        id="ck-line1"
                        value={form.line1}
                        onChange={(e) => setField("line1", e.target.value)}
                        className={errors.line1 ? "error" : ""}
                        autoComplete="address-line1"
                        placeholder="House no., building, street"
                      />
                      {errors.line1 && (
                        <span className="ck-field-error">{errors.line1}</span>
                      )}
                    </div>

                    <div className="ck-field full">
                      <label htmlFor="ck-line2">Address line 2</label>
                      <input
                        id="ck-line2"
                        value={form.line2}
                        onChange={(e) => setField("line2", e.target.value)}
                        autoComplete="address-line2"
                        placeholder="Area, colony (optional)"
                      />
                    </div>

                    <div className="ck-field full">
                      <label htmlFor="ck-landmark">Landmark</label>
                      <input
                        id="ck-landmark"
                        value={form.landmark}
                        onChange={(e) => setField("landmark", e.target.value)}
                        placeholder="Near park, mall, etc. (optional)"
                      />
                    </div>

                    <div className="ck-field">
                      <label htmlFor="ck-city">
                        City<span className="req">*</span>
                      </label>
                      <input
                        id="ck-city"
                        value={form.city}
                        onChange={(e) => setField("city", e.target.value)}
                        className={errors.city ? "error" : ""}
                        autoComplete="address-level2"
                        placeholder="City"
                      />
                      {errors.city && (
                        <span className="ck-field-error">{errors.city}</span>
                      )}
                    </div>

                    <div className="ck-field">
                      <label htmlFor="ck-pincode">
                        PIN code<span className="req">*</span>
                      </label>
                      <input
                        id="ck-pincode"
                        inputMode="numeric"
                        maxLength={6}
                        value={form.pincode}
                        onChange={(e) =>
                          setField(
                            "pincode",
                            e.target.value.replace(/\D/g, "").slice(0, 6),
                          )
                        }
                        className={errors.pincode ? "error" : ""}
                        autoComplete="postal-code"
                        placeholder="6-digit PIN"
                      />
                      {errors.pincode && (
                        <span className="ck-field-error">{errors.pincode}</span>
                      )}
                    </div>

                    <div className="ck-field full">
                      <label htmlFor="ck-state">
                        State<span className="req">*</span>
                      </label>
                      <select
                        id="ck-state"
                        value={form.state}
                        onChange={(e) => setField("state", e.target.value)}
                        className={errors.state ? "error" : ""}
                        autoComplete="address-level1"
                      >
                        <option value="">Select state</option>
                        {INDIAN_STATES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      {errors.state && (
                        <span className="ck-field-error">{errors.state}</span>
                      )}
                    </div>

                    <div className="ck-field">
                      <label htmlFor="ck-label">Address label</label>
                      <select
                        id="ck-label"
                        value={form.label || "Home"}
                        onChange={(e) => setField("label", e.target.value)}
                      >
                        <option value="Home">Home</option>
                        <option value="Work">Work</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="ck-field">
                      <label htmlFor="ck-country">Country</label>
                      <input id="ck-country" value="India" disabled />
                    </div>

                    {currentUser && (
                      <div className="ck-field full">
                        <label className="ck-check">
                          <input
                            type="checkbox"
                            checked={saveAddress}
                            onChange={(e) => setSaveAddress(e.target.checked)}
                          />
                          <span>Save this address to my account for next time</span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment */}
                <div className="ck-card">
                  <h2>Payment method</h2>
                  <p className="ck-card-sub">
                    Pay securely online with Razorpay
                  </p>

                  <div className="ck-pay-options">
                    <label className="ck-pay-option selected">
                      <input
                        type="radio"
                        name="payment"
                        value="razorpay"
                        checked
                        readOnly
                      />
                      <div>
                        <strong>UPI / Cards / Netbanking</strong>
                        <p>
                          Secure checkout with Razorpay — UPI, cards, wallets &
                          more.
                        </p>
                      </div>
                    </label>
                  </div>

                  <div className="ck-field full" style={{ marginTop: 18 }}>
                    <label htmlFor="ck-notes">Order notes (optional)</label>
                    <textarea
                      id="ck-notes"
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Delivery instructions, gift note, etc."
                    />
                  </div>
                </div>
              </div>

              <aside className="ck-side">
                <div className="ck-card ck-summary">
                  <h2>Order summary</h2>
                  <p className="ck-card-sub">
                    {itemCount} item{itemCount !== 1 ? "s" : ""}
                  </p>

                  <div className="ck-summary-items">
                    {items.map((item) => (
                      <div key={item.cartKey} className="ck-summary-item">
                        {item.image ? (
                          <img src={item.image} alt="" />
                        ) : (
                          <div
                            style={{
                              width: 48,
                              height: 60,
                              background: "#eee",
                              borderRadius: 8,
                            }}
                          />
                        )}
                        <div>
                          <div>
                            {item.name} × {item.qty}
                          </div>
                          <div className="meta">
                            {[item.size && `Size ${item.size}`, item.color]
                              .filter(Boolean)
                              .join(" · ")}
                          </div>
                          <div style={{ fontWeight: 600, marginTop: 2 }}>
                            {formatPrice(item.price * item.qty)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {freeShipLeft > 0 ? (
                    <div className="ck-ship-note">
                      Add {formatPrice(freeShipLeft)} more for free shipping
                    </div>
                  ) : (
                    <div className="ck-free-ship">
                      <i className="fas fa-truck" aria-hidden="true"></i>
                      Free shipping applied
                    </div>
                  )}

                  <div className="ck-summary-rows">
                    <div className="ck-summary-row">
                      <span>MRP</span>
                      <span>{formatPrice(mrpTotal)}</span>
                    </div>
                    {discountTotal > 0 && (
                      <div className="ck-summary-row discount">
                        <span>Discount</span>
                        <span>−{formatPrice(discountTotal)}</span>
                      </div>
                    )}
                    <div className="ck-summary-row">
                      <span>Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="ck-summary-row">
                      <span>Delivery</span>
                      <span>
                        {shipping === 0 ? "FREE" : formatPrice(shipping)}
                      </span>
                    </div>
                    <div className="ck-summary-row total">
                      <span>Total payable</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>

                  <div className="ck-actions">
                    <button
                      type="submit"
                      className="ck-btn ck-btn-primary"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <i className="fas fa-spinner fa-spin" aria-hidden="true"></i>
                          Processing payment…
                        </>
                      ) : (
                        <>Pay · {formatPrice(total)}</>
                      )}
                    </button>
                    <Link to="/cart" className="ck-btn ck-btn-secondary">
                      Back to bag
                    </Link>
                  </div>
                </div>
              </aside>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}
