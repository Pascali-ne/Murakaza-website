import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { formatImageUrl, isVideoUrl } from "../utils/imageUrl.js";
import { ShoppingCart } from "lucide-react";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const isVideo = isVideoUrl(product.image_url);

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col group border border-slate-100">
      <Link to={`/product/${product.product_id}`} className="relative h-48 sm:h-52 bg-slate-100 overflow-hidden flex items-center justify-center">
        {product.image_url ? (
          isVideo ? (
            <video
              src={formatImageUrl(product.image_url)}
              autoPlay
              loop
              muted
              playsInline
              className="h-full w-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
            />
          ) : (
            <img
              src={formatImageUrl(product.image_url)}
              alt={product.name}
              className="h-full w-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "https://placehold.co/400x300/e2e8f0/64748b?text=Murakaza";
              }}
            />
          )
        ) : (
          <span className="text-gray-400 text-sm font-medium">No Image</span>
        )}

        {/* Stock Badge Overlay */}
        <span
          className={`absolute top-2.5 left-2.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs backdrop-blur-md ${
            product.quantity <= 0
              ? "bg-rose-500/90 text-white"
              : product.quantity < 10
              ? "bg-amber-500/90 text-white"
              : "bg-emerald-600/90 text-white"
          }`}
        >
          {product.quantity <= 0 ? "Out of Stock" : `${product.quantity} in stock`}
        </span>
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <Link to={`/product/${product.product_id}`}>
          <h3 className="font-semibold text-gray-800 text-sm sm:text-base line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-primary font-bold text-base sm:text-lg mt-2">
          RWF {Number(product.price).toLocaleString()}
        </p>
        <button
          onClick={() => addToCart(product, 1)}
          disabled={product.quantity <= 0}
          className="mt-auto bg-primary hover:bg-primary-light active:bg-primary-dark text-white rounded-full py-2.5 px-4 text-xs sm:text-sm font-semibold shadow-xs hover:shadow-md transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed mt-3 flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  );
}