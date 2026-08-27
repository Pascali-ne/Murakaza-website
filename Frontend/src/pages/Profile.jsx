import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/api.js";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function Profile() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get("/orders/my").then((res) => setOrders(res.data));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Profile</h1>

      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <p><span className="font-semibold">Name:</span> {user?.name}</p>
        <p><span className="font-semibold">Email:</span> {user?.email}</p>
        <p><span className="font-semibold">Phone:</span> {user?.phone}</p>
      </div>

      <h2 className="text-xl font-bold text-gray-800 mb-4">Order History</h2>
      {orders.length === 0 ? (
        <p className="text-gray-500">You have not placed any orders yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((o) => (
            <div key={o.order_id} className="bg-white rounded-xl shadow p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold text-gray-800">Order #{o.order_id}</p>
                <p className="text-sm text-gray-500">{new Date(o.created_at).toLocaleDateString()}</p>
              </div>
              <p className="font-bold text-primary">RWF {Number(o.total_price).toLocaleString()}</p>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[o.order_status]}`}>
                {o.order_status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}