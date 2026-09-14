import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/api.js";
import ProductCard from "../components/ProductCard.jsx";
import HeroAnimation from "../components/HeroAnimation.jsx";
import { BookOpen, Printer, ShieldCheck, Truck } from "lucide-react";

export default function Home() {
  const [supplies, setSupplies] = useState([]);
  const [equipment, setEquipment] = useState([]);

  useEffect(() => {
    api.get("/products?category=student_supplies").then((res) => setSupplies(res.data.slice(0, 4)));
    api.get("/products?category=office_equipment").then((res) => setEquipment(res.data.slice(0, 4)));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-primary to-primary-light text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
              Everything for School & Office, in One Place
            </h1>
            <p className="mt-4 text-lg text-white/90">
              MURAKAZA brings student supplies and office equipment online —
              browse, order, and pay from your phone or computer.
            </p>
            <div className="mt-6 flex gap-4">
              <Link to="/student-supplies" className="bg-accent px-6 py-3 rounded-full font-semibold">
                Shop Student Supplies
              </Link>
              <Link to="/office-equipment" className="bg-white text-primary px-6 py-3 rounded-full font-semibold">
                Shop Office Equipment
              </Link>
            </div>
          </div>
          <HeroAnimation />
        </div>
      </section>

      {/* Trust badges */}
      <section className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {[
          { icon: <BookOpen />, label: "Wide Product Range" },
          { icon: <Truck />, label: "Fast Delivery" },
          { icon: <ShieldCheck />, label: "Secure Payments" },
          { icon: <Printer />, label: "Extra Services" },
        ].map((f, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="text-primary">{f.icon}</div>
            <p className="text-sm font-medium text-gray-700">{f.label}</p>
          </div>
        ))}
      </section>

      {/* Student Supplies preview */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Student Supplies</h2>
          <Link to="/student-supplies" className="text-primary font-semibold text-sm">See all →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {supplies.map((p) => <ProductCard key={p.product_id} product={p} />)}
        </div>
      </section>

      {/* Office Equipment preview */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Office Equipment</h2>
          <Link to="/office-equipment" className="text-primary font-semibold text-sm">See all →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {equipment.map((p) => <ProductCard key={p.product_id} product={p} />)}
        </div>
      </section>

      {/* Other Services banner */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="bg-accent/10 border border-accent rounded-2xl p-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800">Need Printing, Photocopy or Irembo Services?</h3>
            <p className="text-gray-600 mt-1">Visit our Other Services page to request them.</p>
          </div>
          <Link to="/other-services" className="bg-primary text-white px-6 py-3 rounded-full font-semibold">
            View Other Services
          </Link>
        </div>
      </section>
    </div>
  );
}