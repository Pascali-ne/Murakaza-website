import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  return (
    <div className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden flex flex-col">
      <Link to={`/product/${product.product_id}`}>
        <div className="h-40 bg-gray-100 flex items-center justify-center">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-gray-400 text-sm">No Image</span>
          )}
        </div>
      </Link>
      <div className="p-4 flex flex-col flex-1">
        <Link to={`/product/${product.product_id}`}>
          <h3 className="font-semibold text-gray-800 line-clamp-2">{product.name}</h3>
        </Link>
        <p className="text-primary font-bold mt-2">RWF {Number(product.price).toLocaleString()}</p>
        <p className="text-xs text-gray-500 mt-1">
          {product.quantity > 0 ? `${product.quantity} in stock` : "Out of stock"}
        </p>
        <button
          onClick={() => addToCart(product, 1)}
          disabled={product.quantity <= 0}
          className="mt-auto bg-primary text-white rounded-full py-2 text-sm font-semibold hover:bg-primary-light transition disabled:opacity-40 disabled:cursor-not-allowed mt-3"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}