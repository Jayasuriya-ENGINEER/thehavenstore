import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import WhyChooseUs from "./components/WhyChooseUs";
import Products from "./components/Products";
import BulkOrders from "./components/BulkOrders";
import EnquiryForm from "./components/EnquiryForm";
import Testimonials from "./components/Testimonials";
import Portfolio from "./components/Portfolio";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import FloatingButtons from "./components/FloatingButtons";
import useScrollReveal from "./hooks/useScrollReveal";
import Login from "./auth/Login";
import Signup from "./auth/Signup";
import Men from "./pages/Men";
import Women from "./pages/Women";
import Accessories from "./pages/Accessories";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminRoute from "./components/AdminRoute";
import BulkOrdersPage from "./pages/BulkOrdersPage";

function HomePage() {
  useScrollReveal();

  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <WhyChooseUs />
      <Products />
      <BulkOrders />
      <EnquiryForm />
      <Testimonials />
      <Portfolio />
      <Contact />
      <Footer />
      <FloatingButtons />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/men" element={<Men />} />
            <Route path="/men/:productId" element={<ProductDetail />} />
            <Route path="/women" element={<Women />} />
            <Route path="/women/:productId" element={<ProductDetail />} />
            <Route path="/accessories" element={<Accessories />} />
            <Route path="/accessories/:productId" element={<ProductDetail />} />
            <Route path="/bulk-orders" element={<BulkOrdersPage />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-success/:orderId" element={<OrderSuccess />} />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
