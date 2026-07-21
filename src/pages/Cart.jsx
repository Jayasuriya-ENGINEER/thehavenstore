import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../data/mensProducts";
import {
  calcShipping,
  FREE_SHIPPING_THRESHOLD,
} from "../services/orders";
import { sectionFromGender } from "./shopSections";
import "./Checkout.css";

export default function Cart() {
  const { items, itemCount, subtotal, mrpTotal, discountTotal, updateQty, removeItem } =
    useCart();

  const shipping = calcShipping(subtotal);
  const total = subtotal + shipping;
  const freeShipLeft = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

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
                ? "Your bag is empty"
                : `${itemCount} item${itemCount !== 1 ? "s" : ""} ready for checkout`}
            </p>
          </header>

          {items.length === 0 ? (
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
                <div className="ck-card">
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
              </div>

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
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
