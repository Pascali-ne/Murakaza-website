import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { Trash2 } from "lucide-react";

export default function Cart() {
  const { items, removeFromCart, updateQuantity, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-800">Your cart is empty</h1>
        <Link to="/student-supplies" className="text-primary font-semibold mt-4 inline-block">
          Start shopping →
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Shopping Cart</h1>
      <div className="flex flex-col gap-4">
        {items.map((item) => (
          <div key={item.product_id} className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
            <div className="h-16 w-16 bg-gray-100 rounded-lg flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-gray-800">{item.name}</p>
              <p className="text-primary font-bold">RWF {Number(item.price).toLocaleString()}</p>
            </div>
            <input
              type="number"
              min={1}
              value={item.quantity}
              onChange={(e) => updateQuantity(item.product_id, Number(e.target.value))}
              className="w-16 border rounded-lg px-2 py-1 text-center"
            />
            <button onClick={() => removeFromCart(item.product_id)} className="text-red-500">
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-between items-center bg-white rounded-xl shadow p-6">
        <p className="text-xl font-bold text-gray-800">Total: RWF {total.toLocaleString()}</p>
        <Link to="/checkout" className="bg-primary text-white px-8 py-3 rounded-full font-semibold">
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}