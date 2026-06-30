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

function App() {
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

export default App;
