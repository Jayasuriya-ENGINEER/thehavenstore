import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../data/mensProducts";
import {
  calcShipping,
  FREE_SHIPPING_THRESHOLD,
  fetchOrdersForUser,
  formatOrderDate,
  loadLocalOrders,
  mergeOrders,
} from "../services/orders";
import { sectionFromGender } from "./shopSections";
import "./Checkout.css";

export default function Cart() {
  const { currentUser } = useAuth();
  const { items, itemCount, subtotal, mrpTotal, discountTotal, updateQty, removeItem } =
    useCart();

  const [orders, setOrders] = useState(() => loadLocalOrders());
  const [ordersLoading, setOrdersLoading] = useState(false);

  const shipping = calcShipping(subtotal);
  const total = subtotal + shipping;
  const freeShipLeft = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  useEffect(() => {
    let cancelled = false;

    async function loadOrders() {
      const local = loadLocalOrders();
      if (!currentUser?.uid) {
        setOrders(local);
        return;
      }

      setOrdersLoading(true);
      try {
        const remote = await fetchOrdersForUser(currentUser.uid);
        if (cancelled) return;
        setOrders(mergeOrders(remote, local, currentUser.uid));
      } catch (e) {
        console.warn("Could not load orders:", e?.message);
        if (!cancelled) setOrders(local);
      } finally {
        if (!cancelled) setOrdersLoading(false);
      }
    }

    loadOrders();
    return () => {
      cancelled = true;
    };
  }, [currentUser?.uid]);

  const hasBag = items.length > 0;
  const hasOrders = orders.length > 0;

  return (
    <>
      <Navbar solid />
      <div className="ck-page">
        <div className="ck-container">
          <header className="ck-header">
            <nav className="ck-breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span>/</span>
              <span className="current">Bag</span>
            </nav>
            <h1>Your bag</h1>
            <p>
              {itemCount === 0
                ? hasOrders
                  ? "No items in bag — your past orders are below"
                  : "Your bag is empty"
                : `${itemCount} item${itemCount !== 1 ? "s" : ""} ready for checkout`}
            </p>
          </header>

          {!hasBag && !hasOrders && !ordersLoading ? (
            <div className="ck-empty">
              <i className="fas fa-shopping-bag" aria-hidden="true"></i>
              <h2>Your bag is empty</h2>
              <p>Browse the collection and add pieces you love.</p>
              <Link to="/men" className="ck-btn ck-btn-primary">
                Continue shopping
              </Link>
            </div>
          ) : (
            <div className="ck-layout">
              <div className="ck-main">
                {hasBag && (
                  <div className="ck-card">
                    <div className="ck-card-head">
                      <h2>In your bag</h2>
                    </div>
                    {items.map((item) => {
                      const section = sectionFromGender(item.gender);
                      return (
                        <div key={item.cartKey} className="ck-line">
                          <Link
                            to={`${section.path}/${item.productId}`}
                            className="ck-line-img"
                          >
                            {item.image ? (
                              <img src={item.image} alt={item.name} />
                            ) : null}
                          </Link>
                          <div className="ck-line-body">
                            <h3>
                              <Link to={`${section.path}/${item.productId}`}>
                                {item.name}
                              </Link>
                            </h3>
                            <div className="ck-line-meta">
                              {item.size && <span>Size: {item.size}</span>}
                              {item.color && <span>Color: {item.color}</span>}
                              {item.category && <span>{item.category}</span>}
                            </div>
                            <div className="ck-line-actions">
                              <div className="ck-qty">
                                <button
                                  type="button"
                                  aria-label="Decrease quantity"
                                  onClick={() =>
                                    updateQty(item.cartKey, item.qty - 1)
                                  }
                                  disabled={item.qty <= 1}
                                >
                                  −
                                </button>
                                <span>{item.qty}</span>
                                <button
                                  type="button"
                                  aria-label="Increase quantity"
                                  onClick={() =>
                                    updateQty(item.cartKey, item.qty + 1)
                                  }
                                  disabled={item.qty >= 10}
                                >
                                  +
                                </button>
                              </div>
                              <button
                                type="button"
                                className="ck-remove"
                                onClick={() => removeItem(item.cartKey)}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                          <div className="ck-line-price">
                            {formatPrice(item.price * item.qty)}
                            {item.originalPrice > item.price && (
                              <span className="mrp">
                                {formatPrice(item.originalPrice * item.qty)}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Ordered products — static history, no cancel / remove */}
                {(hasOrders || ordersLoading) && (
                  <div className="ck-card ck-ordered-section">
                    <div className="ck-card-head">
                      <div>
                        <h2>Ordered products</h2>
                        <p className="ck-card-sub" style={{ marginBottom: 0 }}>
                          Past purchases — order details only
                        </p>
                      </div>
                    </div>

                    {ordersLoading && !hasOrders ? (
                      <p className="ck-hint">Loading your orders…</p>
                    ) : (
                      orders.map((order) => (
                        <div key={order.id} className="ck-order-block">
                          <div className="ck-order-head">
                            <div className="ck-order-id-chip">
                              Order ID: {order.id}
                            </div>
                            <div className="ck-order-dates">
                              <span>
                                <i className="fas fa-calendar" aria-hidden="true"></i>
                                Ordered: {formatOrderDate(order.createdAt)}
                              </span>
                              <span>
                                <i className="fas fa-truck" aria-hidden="true"></i>
                                Expected delivery:{" "}
                                {formatOrderDate(order.expectedDeliveryAt)}
                              </span>
                            </div>
                            <div className="ck-order-meta-row">
                              <span className="ck-order-status">
                                {(order.orderStatus || "placed").replace(
                                  /^\w/,
                                  (c) => c.toUpperCase(),
                                )}
                              </span>
                              <span>
                                {order.paymentMethod === "razorpay"
                                  ? "Paid online"
                                  : "Cash on delivery"}
                                {order.paymentStatus
                                  ? ` · ${order.paymentStatus}`
                                  : ""}
                              </span>
                              {order.total != null && (
                                <span className="ck-order-total">
                                  Total: {formatPrice(order.total)}
                                </span>
                              )}
                            </div>
                          </div>

                          {(order.items || []).map((item, idx) => {
                            const section = sectionFromGender(item.gender);
                            const key = `${order.id}-${item.productId || idx}-${item.size || ""}-${item.color || ""}`;
                            return (
                              <div key={key} className="ck-line ck-line-ordered">
                                <div className="ck-line-img">
                                  {item.image ? (
                                    <img src={item.image} alt={item.name || ""} />
                                  ) : null}
                                </div>
                                <div className="ck-line-body">
                                  <h3>
                                    {item.productId ? (
                                      <Link
                                        to={`${section.path}/${item.productId}`}
                                      >
                                        {item.name}
                                      </Link>
                                    ) : (
                                      item.name
                                    )}
                                  </h3>
                                  <div className="ck-line-meta">
                                    {item.size && <span>Size: {item.size}</span>}
                                    {item.color && (
                                      <span>Color: {item.color}</span>
                                    )}
                                    {item.category && (
                                      <span>{item.category}</span>
                                    )}
                                    {item.qty > 1 && (
                                      <span>Qty: {item.qty}</span>
                                    )}
                                  </div>
                                  <div className="ck-ordered-badge">
                                    <i
                                      className="fas fa-check-circle"
                                      aria-hidden="true"
                                    ></i>
                                    Ordered
                                  </div>
                                </div>
                                <div className="ck-line-price">
                                  {formatPrice(
                                    (Number(item.price) || 0) *
                                      (Number(item.qty) || 1),
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {hasBag && (
                <aside className="ck-side">
                  <div className="ck-card ck-summary">
                    <h2>Order summary</h2>
                    <p className="ck-card-sub">
                      Prices include taxes where applicable
                    </p>

                    {freeShipLeft > 0 ? (
                      <div className="ck-ship-note">
                        Add {formatPrice(freeShipLeft)} more for free shipping
                      </div>
                    ) : (
                      <div className="ck-free-ship">
                        <i className="fas fa-truck" aria-hidden="true"></i>
                        You get free shipping on this order
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
                        <span>Total</span>
                        <span>{formatPrice(total)}</span>
                      </div>
                    </div>

                    <div className="ck-actions">
                      <Link to="/checkout" className="ck-btn ck-btn-primary">
                        Proceed to checkout
                        <i className="fas fa-arrow-right" aria-hidden="true"></i>
                      </Link>
                      <Link to="/men" className="ck-btn ck-btn-secondary">
                        Continue shopping
                      </Link>
                    </div>
                  </div>
                </aside>
              )}

              {!hasBag && hasOrders && (
                <aside className="ck-side">
                  <div className="ck-card ck-summary">
                    <h2>Shop more</h2>
                    <p className="ck-card-sub">
                      Your bag is empty. Browse new arrivals and add them here.
                    </p>
                    <div className="ck-actions">
                      <Link to="/men" className="ck-btn ck-btn-primary">
                        Continue shopping
                      </Link>
                    </div>
                  </div>
                </aside>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
