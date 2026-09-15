import { useEffect, useState } from "react";
import api from "../api/api.js";
import { Link } from "react-router-dom";

export default function ProductShowcase() {
  const [products, setProducts] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    Promise.all([
      api.get("/products?category=student_supplies"),
      api.get("/products?category=office_equipment"),
    ]).then(([supplies, equipment]) => {
      const withImages = [...supplies.data, ...equipment.data]
        .filter((p) => p.image_url && p.quantity > 0)
        .slice(0, 6);
      setProducts(withImages);
    });
  }, []);

  useEffect(() => {
    if (products.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % products.length), 3500);
    return () => clearInterval(id);
  }, [products]);

  if (products.length === 0) {
    return (
      <div className="flex h-[70vh] min-h-[420px] bg-surface items-center justify-center text-gray-400">
        Loading products...
      </div>
    );
  }

  return (
    <div className="relative h-[70vh] min-h-[420px] overflow-hidden bg-ink">
      {products.map((p, i) => (
        <div key={p.product_id} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${i === index ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
          <img src={p.image_url} alt={p.name} className={`w-full h-full object-cover ${i === index ? "animate-kenburns" : ""}`} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 max-w-7xl mx-auto">
            <span className="bg-accent text-ink text-xs font-semibold px-3 py-1 rounded-full">{p.quantity} in stock</span>
            <h3 className="text-white font-heading font-semibold text-2xl md:text-3xl mt-3 line-clamp-1">{p.name}</h3>
            <p className="text-white/90 font-semibold text-xl">RWF {Number(p.price).toLocaleString()}</p>
          </div>
        </div>
      ))}
      <div className="absolute top-5 right-5 flex gap-1.5">
        {products.map((_, i) => (
          <span key={i} className={`w-2 h-2 rounded-full transition-colors ${i === index ? "bg-accent" : "bg-white/40"}`} />
        ))}
      </div>
      <Link to="/student-supplies" className="absolute top-5 left-5 bg-white/90 text-ink text-xs font-semibold px-3 py-1.5 rounded-full">Shop Now →</Link>
    </div>
  );
}