import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api.js";
import { useCart } from "../context/CartContext.jsx";

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

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-10">
      <div className="h-80 bg-gray-100 rounded-xl flex items-center justify-center">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="h-full w-full object-cover rounded-xl" />
        ) : (
          <span className="text-gray-400">No Image</span>
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