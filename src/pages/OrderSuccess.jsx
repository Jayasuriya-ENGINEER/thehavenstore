import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { formatPrice } from "../data/mensProducts";
import {
  fetchOrderById,
  formatOrderDate,
  getExpectedDeliveryDate,
} from "../services/orders";
import "./Checkout.css";

export default function OrderSuccess() {
  const { orderId } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (location.state?.order?.id === orderId) {
        setOrder(location.state.order);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await fetchOrderById(orderId);
        if (!cancelled) setOrder(data);
      } catch (e) {
        console.warn(e);
        if (!cancelled) setOrder(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [orderId, location.state]);

  const address = order?.shippingAddress;

  return (
    <>
      <Navbar solid />
      <div className="ck-page">
        <div className="ck-container">
          {loading ? (
            <div className="ck-empty">
              <p>Loading order…</p>
            </div>
          ) : !order ? (
            <div className="ck-empty">
              <i className="fas fa-receipt" aria-hidden="true"></i>
              <h2>Order not found</h2>
              <p>We couldn’t find this order. Check your email for confirmation.</p>
              <Link to="/" className="ck-btn ck-btn-primary">
                Back to home
              </Link>
            </div>
          ) : (
            <div className="ck-success">
              <div className="ck-success-icon" aria-hidden="true">
                <i className="fas fa-check"></i>
              </div>
              <h1>Order placed!</h1>
              <p>
                Thanks{address?.fullName ? `, ${address.fullName.split(" ")[0]}` : ""}.
                We’ve received your order and will start processing it shortly.
              </p>
              <div className="ck-order-id">Order ID: {order.id}</div>

              <div className="ck-success-details">
                <h3>Delivery to</h3>
                {address && (
                  <p>
                    <strong>{address.fullName}</strong>
                    <br />
                    {address.line1}
                    {address.line2 ? `, ${address.line2}` : ""}
                    {address.landmark ? `, ${address.landmark}` : ""}
                    <br />
                    {address.city}, {address.state} — {address.pincode}
                    <br />
                    Phone: {address.phone}
                    <br />
                    Email: {address.email}
                  </p>
                )}
                <h3 style={{ marginTop: 16 }}>Timeline</h3>
                <p>
                  Ordered:{" "}
                  <strong>{formatOrderDate(order.createdAt)}</strong>
                  <br />
                  Expected delivery:{" "}
                  <strong>
                    {formatOrderDate(
                      order.expectedDeliveryAt ||
                        getExpectedDeliveryDate(order.createdAt),
                    )}
                  </strong>
                  <br />
                  <span style={{ color: "#777", fontSize: "0.88em" }}>
                    Delivery within 8 days of order date
                  </span>
                </p>
                <h3 style={{ marginTop: 16 }}>Payment</h3>
                <p>
                  {order.paymentMethod === "cod"
                    ? "Cash / Pay on delivery"
                    : order.paymentMethod}
                  {" · "}
                  Status: {order.paymentStatus || "pending"}
                  <br />
                  Total:{" "}
                  <strong>
                    {formatPrice(order.total ?? 0)}
                  </strong>
                  {" · "}
                  {order.itemCount || order.items?.length || 0} item(s)
                </p>
              </div>

              <div className="ck-success-actions">
                <Link to="/cart" className="ck-btn ck-btn-primary">
                  View ordered products
                </Link>
                <Link to="/men" className="ck-btn ck-btn-secondary">
                  Continue shopping
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
