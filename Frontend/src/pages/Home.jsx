import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../api/api.js";
import ProductCard from "../components/ProductCard.jsx";
import ProductShowcase from "../components/ProductShowcase.jsx";
import { BookOpen, Printer, ShieldCheck, Truck } from "lucide-react";

export default function Home() {
  const { t } = useTranslation();
  const [supplies, setSupplies] = useState([]);
  const [equipment, setEquipment] = useState([]);

  useEffect(() => {
    api.get("/products?category=student_supplies").then((res) => setSupplies(res.data.slice(0, 4)));
    api.get("/products?category=office_equipment").then((res) => setEquipment(res.data.slice(0, 4)));
  }, []);

  return (
    <div>
      <ProductShowcase />

      <div className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-wrap justify-center gap-4">
          <Link to="/student-supplies" className="bg-accent text-ink px-6 py-3 rounded-full font-semibold hover:brightness-95 transition">{t("home.shopSupplies")}</Link>
          <Link to="/office-equipment" className="bg-primary text-white px-6 py-3 rounded-full font-semibold hover:bg-primary-light transition">{t("home.shopEquipment")}</Link>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {[
          { icon: <BookOpen />, label: t("home.trustRange") },
          { icon: <Truck />, label: t("home.trustDelivery") },
          { icon: <ShieldCheck />, label: t("home.trustSecure") },
          { icon: <Printer />, label: t("home.trustServices") },
        ].map((f, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="text-primary dark:text-accent">{f.icon}</div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{f.label}</p>
          </div>
        ))}
      </section>

      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t("home.studentSupplies")}</h2>
          <Link to="/student-supplies" className="text-primary dark:text-accent font-semibold text-sm">{t("home.seeAll")}</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {supplies.map((p) => <ProductCard key={p.product_id} product={p} />)}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t("home.officeEquipment")}</h2>
          <Link to="/office-equipment" className="text-primary dark:text-accent font-semibold text-sm">{t("home.seeAll")}</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {equipment.map((p) => <ProductCard key={p.product_id} product={p} />)}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="bg-accent/10 dark:bg-slate-800/80 border border-accent/40 dark:border-accent/30 rounded-2xl p-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{t("home.otherTitle")}</h3>
            <p className="text-gray-600 dark:text-gray-300 mt-1">{t("home.otherSubtitle")}</p>
          </div>
          <Link to="/other-services" className="bg-primary text-white px-6 py-3 rounded-full font-semibold hover:bg-primary-light transition shadow">{t("home.otherBtn")}</Link>
        </div>
      </section>
    </div>
  );
}