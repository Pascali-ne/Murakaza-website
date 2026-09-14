import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/api.js";
import ProductCard from "../components/ProductCard.jsx";

export default function ShopCategory({ category, title, icon }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") || "";

  useEffect(() => {
    setLoading(true);
    api
      .get("/products", { params: { category, search } })
      .then((res) => setProducts(res.data))
      .finally(() => setLoading(false));
  }, [category, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
        {icon && <span className="text-primary">{icon}</span>} {title}
      </h1>
      <p className="text-gray-500 mb-6">
        {search ? `Search results for "${search}"` : `Browse all ${title.toLowerCase()}`}
      </p>

      {loading ? (
        <p className="text-gray-500">Loading products...</p>
      ) : products.length === 0 ? (
        <p className="text-gray-500">No products found.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((p) => (
            <ProductCard key={p.product_id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}