import tshirt from "../assets/tshirt.jpg";
import polo from "../assets/polo.png";
import hoodie from "../assets/hoodie.png";
import sweatwear from "../assets/sweatwear.png";
import formaloutfit from "../assets/formaloutfit.jpg";
import dailywear from "../assets/dailywear.jpg";
import bottom from "../assets/bottom.png";
import pr1 from "../assets/pr1.png";
import pr2 from "../assets/pr2.png";
import pr3 from "../assets/pr3.jpeg";
import pr5 from "../assets/pr5.jpeg";
import pr6 from "../assets/pr6.png";

export const SIZES = ["S", "M", "L", "XL", "XXL"];

export const mensProducts = [
  {
    id: "classic-crew-tee",
    name: "Classic Crew Neck Tee",
    category: "T-Shirts",
    price: 799,
    originalPrice: 1199,
    rating: 4.6,
    reviews: 128,
    badge: "Bestseller",
    colors: [
      { name: "Black", hex: "#111111" },
      { name: "White", hex: "#F5F5F5" },
      { name: "Grey", hex: "#9E9E9E" },
    ],
    sizes: SIZES,
    images: [tshirt, pr1, pr2],
    shortDesc: "Soft cotton everyday tee with a clean, modern fit.",
    description:
      "Our Classic Crew Neck Tee is cut from premium mid-weight cotton for all-day comfort. A slightly tailored silhouette keeps it sharp whether you layer it or wear it solo. Pre-washed for a soft hand-feel that only gets better with time.",
    details: [
      "100% combed cotton",
      "180 GSM mid-weight fabric",
      "Ribbed crew neck",
      "Machine wash cold",
    ],
    inStock: true,
  },
  {
    id: "heritage-polo",
    name: "Heritage Piqué Polo",
    category: "Polos",
    price: 1299,
    originalPrice: 1799,
    rating: 4.8,
    reviews: 94,
    badge: "New",
    colors: [
      { name: "Navy", hex: "#1A237E" },
      { name: "Olive", hex: "#556B2F" },
      { name: "White", hex: "#F5F5F5" },
    ],
    sizes: SIZES,
    images: [polo, pr3, pr5],
    shortDesc: "Smart-casual polo with breathable piqué knit.",
    description:
      "The Heritage Piqué Polo balances polish and ease. Breathable cotton piqué, a structured collar, and tonal buttons make it office-ready by day and weekend-ready by night. Designed for a confident, modern drape.",
    details: [
      "100% cotton piqué",
      "Two-button placket",
      "Side vents for ease",
      "Easy care finish",
    ],
    inStock: true,
  },
  {
    id: "urban-hoodie",
    name: "Urban Essential Hoodie",
    category: "Hoodies",
    price: 1899,
    originalPrice: 2499,
    rating: 4.7,
    reviews: 201,
    badge: "Popular",
    colors: [
      { name: "Charcoal", hex: "#36454F" },
      { name: "Black", hex: "#111111" },
      { name: "Sand", hex: "#D2B48C" },
    ],
    sizes: SIZES,
    images: [hoodie, pr6, sweatwear],
    shortDesc: "Fleece-lined hoodie built for comfort and layering.",
    description:
      "Stay warm without bulk. The Urban Essential Hoodie features a soft fleece interior, kangaroo pocket, and a roomy hood with drawcords. Perfect for travel days, late nights, or layering over a tee.",
    details: [
      "80% cotton / 20% polyester fleece",
      "Double-layered hood",
      "Ribbed cuffs & hem",
      "Kangaroo pocket",
    ],
    inStock: true,
  },
  {
    id: "soft-touch-sweat",
    name: "Soft-Touch Sweatshirt",
    category: "Sweatshirts",
    price: 1599,
    originalPrice: 2099,
    rating: 4.5,
    reviews: 76,
    badge: null,
    colors: [
      { name: "Cream", hex: "#F5F0E6" },
      { name: "Slate", hex: "#708090" },
      { name: "Black", hex: "#111111" },
    ],
    sizes: SIZES,
    images: [sweatwear, hoodie, pr1],
    shortDesc: "Relaxed crew sweatshirt with a premium hand-feel.",
    description:
      "Minimal branding, maximum comfort. This soft-touch crew sweatshirt is brushed on the inside for a cozy feel while keeping a clean outer face that pairs with denim or joggers.",
    details: [
      "Brushed fleece interior",
      "Ribbed crew neck",
      "Relaxed modern fit",
      "Durable twin-needle stitching",
    ],
    inStock: true,
  },
  {
    id: "city-formal-shirt",
    name: "City Formal Shirt",
    category: "Shirts",
    price: 1499,
    originalPrice: 1999,
    rating: 4.4,
    reviews: 58,
    badge: null,
    colors: [
      { name: "White", hex: "#FFFFFF" },
      { name: "Sky", hex: "#87CEEB" },
      { name: "Black", hex: "#111111" },
    ],
    sizes: SIZES,
    images: [formaloutfit, dailywear, pr2],
    shortDesc: "Crisp formal shirt for work and occasions.",
    description:
      "A refined formal shirt with a clean collar and tailored torso. Wrinkle-resistant fabric keeps you looking sharp from morning meetings to evening plans.",
    details: [
      "Cotton-rich blend",
      "Full button placket",
      "Single chest pocket",
      "Wrinkle-resistant finish",
    ],
    inStock: true,
  },
  {
    id: "everyday-oxford",
    name: "Everyday Oxford Shirt",
    category: "Shirts",
    price: 1399,
    originalPrice: 1899,
    rating: 4.6,
    reviews: 112,
    badge: "Bestseller",
    colors: [
      { name: "Light Blue", hex: "#ADD8E6" },
      { name: "White", hex: "#FFFFFF" },
      { name: "Pink", hex: "#F8C8DC" },
    ],
    sizes: SIZES,
    images: [dailywear, formaloutfit, pr3],
    shortDesc: "Breathable oxford weave for daily wear.",
    description:
      "The Everyday Oxford is your go-to button-down. Soft oxford cloth, a versatile collar, and a slightly relaxed fit make it ideal for casual Fridays and weekend brunches alike.",
    details: [
      "100% cotton oxford",
      "Button-down collar",
      "Chest pocket",
      "Easy iron finish",
    ],
    inStock: true,
  },
  {
    id: "tapered-chinos",
    name: "Tapered Stretch Chinos",
    category: "Bottoms",
    price: 1699,
    originalPrice: 2299,
    rating: 4.7,
    reviews: 143,
    badge: "New",
    colors: [
      { name: "Khaki", hex: "#C3B091" },
      { name: "Navy", hex: "#1A237E" },
      { name: "Black", hex: "#111111" },
    ],
    sizes: ["28", "30", "32", "34", "36"],
    images: [bottom, pr5, pr6],
    shortDesc: "Smart chinos with all-day stretch comfort.",
    description:
      "Tapered from thigh to hem with just enough stretch to move freely. Pair with a polo for smart casual or a tee for weekend ease. Mid-rise with a clean zip fly.",
    details: [
      "98% cotton / 2% elastane",
      "Mid-rise tapered fit",
      "Four-pocket design",
      "Belt loops included",
    ],
    inStock: true,
  },
  {
    id: "graphic-drop-tee",
    name: "Graphic Drop Tee",
    category: "T-Shirts",
    price: 899,
    originalPrice: 1299,
    rating: 4.3,
    reviews: 67,
    badge: null,
    colors: [
      { name: "Black", hex: "#111111" },
      { name: "Off-White", hex: "#FAF7F2" },
    ],
    sizes: SIZES,
    images: [pr1, tshirt, pr2],
    shortDesc: "Statement tee with a soft oversized drape.",
    description:
      "A drop-shoulder graphic tee for off-duty days. Soft cotton jersey, bold print placement, and an easy oversized cut that still looks intentional.",
    details: [
      "Soft jersey cotton",
      "Oversized drop shoulder",
      "Screen-printed graphic",
      "Pre-shrunk fabric",
    ],
    inStock: true,
  },
];

export function getMensProductById(id) {
  return mensProducts.find((p) => p.id === id) || null;
}

export function formatPrice(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getDiscountPercent(price, originalPrice) {
  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}
