import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "haven_cart_v1";

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function makeCartKey({ productId, size, color }) {
  return [productId, size || "-", color || "-"].join("__");
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => loadCart());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore quota */
    }
  }, [items]);

  const addItem = useCallback((product, { size = "", color = "", qty = 1 } = {}) => {
    if (!product?.id) return { ok: false, error: "Invalid product" };

    const quantity = Math.max(1, Math.min(10, Number(qty) || 1));
    const cartKey = makeCartKey({
      productId: product.id,
      size,
      color,
    });

    setItems((prev) => {
      const existing = prev.find((i) => i.cartKey === cartKey);
      if (existing) {
        return prev.map((i) =>
          i.cartKey === cartKey
            ? { ...i, qty: Math.min(10, i.qty + quantity) }
            : i,
        );
      }
      return [
        ...prev,
        {
          cartKey,
          productId: product.id,
          name: product.name,
          price: Number(product.price) || 0,
          originalPrice:
            Number(product.originalPrice) || Number(product.price) || 0,
          image: product.images?.[0] || product.image || "",
          size: size || "",
          color: color || "",
          qty: quantity,
          gender: product.gender || "men",
          category: product.category || "",
          inStock: product.inStock !== false,
        },
      ];
    });

    return { ok: true, cartKey };
  }, []);

  const removeItem = useCallback((cartKey) => {
    setItems((prev) => prev.filter((i) => i.cartKey !== cartKey));
  }, []);

  const updateQty = useCallback((cartKey, qty) => {
    const next = Math.max(1, Math.min(10, Number(qty) || 1));
    setItems((prev) =>
      prev.map((i) => (i.cartKey === cartKey ? { ...i, qty: next } : i)),
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + (i.qty || 0), 0),
    [items],
  );

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + (i.price || 0) * (i.qty || 0), 0),
    [items],
  );

  const mrpTotal = useMemo(
    () =>
      items.reduce(
        (sum, i) =>
          sum + (i.originalPrice || i.price || 0) * (i.qty || 0),
        0,
      ),
    [items],
  );

  const discountTotal = Math.max(0, mrpTotal - subtotal);

  const value = useMemo(
    () => ({
      items,
      itemCount,
      subtotal,
      mrpTotal,
      discountTotal,
      addItem,
      removeItem,
      updateQty,
      clearCart,
    }),
    [
      items,
      itemCount,
      subtotal,
      mrpTotal,
      discountTotal,
      addItem,
      removeItem,
      updateQty,
      clearCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
