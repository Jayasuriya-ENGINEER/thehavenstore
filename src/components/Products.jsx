import tshirt from "../assets/tshirt.jpg";
import polo from "../assets/polo.png";
import hoodie from "../assets/hoodie.png";
import sweatwear from "../assets/sweatwear.png";
import formaloutfit from "../assets/formaloutfit.jpg";
import dailywear from "../assets/dailywear.jpg";
import bottom from "../assets/bottom.png";
import accessories from "../assets/accessories.png";

const products = [
  {
    img: tshirt,
    alt: "T-Shirt",
    name: "T-Shirts",
    desc: "Comfortable, stylish t-shirts perfect for any occasion.",
    delay: "",
  },
  {
    img: polo,
    alt: "Polo T-Shirt",
    name: "Polo T-Shirts",
    desc: "Classic polo shirts for a smart-casual look.",
    delay: "delay-100",
  },
  {
    img: hoodie,
    alt: "Hoodie",
    name: "Hoodies",
    desc: "Cozy hoodies perfect for casual wear and team spirit.",
    delay: "delay-200",
  },
  {
    img: sweatwear,
    alt: "Sweatshirts",
    name: "Sweatshirts",
    desc: "Warm and comfortable sweatshirts for all seasons.",
    delay: "",
  },
  {
    img: formaloutfit,
    alt: "Dresses",
    name: "Dresses",
    desc: "Elegant dresses for special occasions and events.",
    delay: "delay-100",
  },
  {
    img: dailywear,
    alt: "Tops",
    name: "Tops",
    desc: "Versatile tops for everyday fashion and style.",
    delay: "delay-200",
  },
  {
    img: bottom,
    alt: "Bottoms",
    name: "Bottoms",
    desc: "Comfortable pants, shorts, and joggers.",
    delay: "",
  },
  {
    img: accessories,
    alt: "Accessories",
    name: "Accessories",
    desc: "Complete your look with our range of accessories.",
    delay: "delay-100",
  },
];

export default function Products() {
  return (
    <section className="products" id="products">
      <div className="container">
        <div className="section-header reveal">
          <span className="section-tag">Our Products</span>
          <h2 className="section-title">What We Manufacture</h2>
        </div>

        <div className="products-grid">
          {products.map((p) => (
            <div className={`product-card reveal ${p.delay}`} key={p.name}>
              <div className="product-image">
                <img src={p.img} alt={p.alt} />
              </div>
              <h3>{p.name}</h3>
              <p>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
