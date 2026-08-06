import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import WhyChooseUs from "./components/WhyChooseUs";

import BulkOrders from "./components/BulkOrders";
import EnquiryForm from "./components/EnquiryForm";
import Testimonials from "./components/Testimonials";

import Contact from "./components/Contact";
import Footer from "./components/Footer";
import FloatingButtons from "./components/FloatingButtons";
import HomePopupBanner from "./components/HomePopupBanner";
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
import Internships from "./pages/Internships";
import LegalPage from "./pages/LegalPage";


//just removed the <products /> component from the home page because it was not needed as per the new design.
//and also removed the <portfolio /> component from the home page because it was not needed as per the new design.

function HomePage() {
  const location = useLocation();
  useScrollReveal();

  useEffect(() => {
    if (!location.hash) return;

    const frame = requestAnimationFrame(() => {
      const target = document.querySelector(location.hash);
      if (!target) return;

      const offset = target.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: offset, behavior: "smooth" });
    });

    return () => cancelAnimationFrame(frame);
  }, [location.hash]);

  return (
    <>
      <Navbar />
      <HomePopupBanner />
      <Hero />
      <About />
      <WhyChooseUs />
      
      <BulkOrders />
      <EnquiryForm />
      <Testimonials />
    
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
            <Route path="/internships" element={<Internships />} />
            <Route path="/policies/:page" element={<LegalPage />} />
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
