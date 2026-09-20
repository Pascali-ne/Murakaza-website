import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api.js";
import { useCart } from "../context/CartContext.jsx";
import { formatImageUrl, isVideoUrl } from "../utils/imageUrl.js";

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/products/${id}`).then((res) => setProduct(res.data));
  }, [id]);

  if (!product) return <p className="text-center py-20 text-gray-500">Loading...</p>;

  const isVideo = isVideoUrl(product.image_url);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-10">
      <div className="relative h-80 sm:h-96 md:h-[420px] bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-center overflow-hidden group shadow-sm">
        {product.image_url ? (
          isVideo ? (
            <video
              src={formatImageUrl(product.image_url)}
              controls
              autoPlay
              loop
              muted
              playsInline
              className="relative z-10 max-h-full max-w-full object-contain rounded-xl shadow-xs"
            />
          ) : (
            <>
              {/* Subtle ambient blur for ultra-premium backdrop framing */}
              <div
                className="absolute inset-0 bg-cover bg-center blur-2xl opacity-15 scale-125 pointer-events-none"
                style={{ backgroundImage: `url(${formatImageUrl(product.image_url)})` }}
              />
              <img
                src={formatImageUrl(product.image_url)}
                alt={product.name}
                className="relative z-10 max-h-full max-w-full object-contain p-3 rounded-xl drop-shadow-sm transition-transform duration-500 ease-out group-hover:scale-105"
              />
            </>
          )
        ) : (
          <span className="text-gray-400 font-medium">No Image Available</span>
        )}
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>
        <p className="text-primary text-2xl font-bold mt-3">RWF {Number(product.price).toLocaleString()}</p>
        <p className="text-gray-500 mt-1">
          {product.quantity > 0 ? `${product.quantity} in stock` : "Out of stock"}
        </p>
        <p className="text-gray-700 mt-4 leading-relaxed">{product.description}</p>

        <div className="flex items-center gap-4 mt-6">
          <input
            type="number"
            min={1}
            max={product.quantity}
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            className="w-20 border rounded-lg px-3 py-2"
          />
          <button
            onClick={() => addToCart(product, qty)}
            disabled={product.quantity <= 0}
            className="bg-primary text-white px-6 py-3 rounded-full font-semibold disabled:opacity-40"
          >
            Add to Cart
          </button>
          <button
            onClick={() => { addToCart(product, qty); navigate("/checkout"); }}
            disabled={product.quantity <= 0}
            className="bg-accent px-6 py-3 rounded-full font-semibold disabled:opacity-40"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}