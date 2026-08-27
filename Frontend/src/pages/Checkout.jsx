import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/api.js";

const paymentOptions = [
  { value: "mtn_momo", label: "MTN Mobile Money" },
  { value: "airtel_money", label: "Airtel Money" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cash_on_delivery", label: "Cash on Delivery" },
];

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState("");
  const [method, setMethod] = useState("mtn_momo");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  const handlePlaceOrder = async () => {
    if (!user) return navigate("/login");
    setPlacing(true);
    setError("");
    try {
      await api.post("/orders", {
        items: items.map((i) => ({
          product_id: i.product_id,
          quantity: i.quantity,
          unit_price: i.price,
        })),
        payment_method: method,
        delivery_address: address,
      });
      clearCart();
      navigate("/profile");
    } catch (err) {
      setError(err.response?.data?.message || "Could not place order");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Checkout</h1>

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="font-semibold text-gray-800 mb-3">Order Summary</h2>
        {items.map((i) => (
          <div key={i.product_id} className="flex justify-between text-sm text-gray-600 py-1">
            <span>{i.name} × {i.quantity}</span>
            <span>RWF {(i.price * i.quantity).toLocaleString()}</span>
          </div>
        ))}
        <div className="flex justify-between font-bold text-gray-800 mt-3 pt-3 border-t">
          <span>Total</span>
          <span>RWF {total.toLocaleString()}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="font-semibold text-gray-800 mb-3">Delivery Address</h2>
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          rows={3}
          placeholder="Enter your delivery address"
          className="w-full border rounded-lg px-4 py-2"
        />
      </div>

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="font-semibold text-gray-800 mb-3">Payment Method</h2>
        <div className="grid grid-cols-2 gap-3">
          {paymentOptions.map((opt) => (
            <label
              key={opt.value}
              className={`border rounded-lg px-4 py-3 cursor-pointer text-sm font-medium ${
                method === opt.value ? "border-primary bg-primary/5" : "border-gray-200"
              }`}
            >
              <input
                type="radio"
                name="method"
                value={opt.value}
                checked={method === opt.value}
                onChange={() => setMethod(opt.value)}
                className="mr-2"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <button
        onClick={handlePlaceOrder}
        disabled={placing || items.length === 0}
        className="w-full bg-primary text-white py-4 rounded-full font-semibold disabled:opacity-50"
      >
        {placing ? "Placing Order..." : "Place Order"}
      </button>
    </div>
  );
}