import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api.js";

export default function ManagerDashboard() {
  const [tab, setTab] = useState("overview");
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get("/orders").then((r) => setOrders(r.data)),
      api.get("/payments").then((r) => setPayments(r.data)),
      api.get("/products/low-stock").then((r) => setStock(r.data)),
    ]).finally(() => setLoading(false));
  }, []);

  const pendingPayments = payments.filter((p) => p.payment_status === "pending").length;
  const pendingOrders = orders.filter((o) => o.order_status === "pending").length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Manager Dashboard</h1>
      <p className="text-gray-500 mb-6">Oversee orders, payments, stock, and customer feedback.</p>

      <div className="flex gap-4 mb-8 border-b flex-wrap">
        {["overview", "orders", "payments"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 px-2 font-semibold capitalize ${tab === t ? "border-b-2 border-primary text-primary" : "text-gray-500"}`}
          >
            {t}
          </button>
        ))}
        <Link to="/admin/feedback" className="pb-3 px-2 font-semibold text-gray-500 hover:text-primary">
          Feedback Moderation →
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading dashboard...</p>
      ) : (
        <>
          {tab === "overview" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow p-6">
                <p className="text-gray-500 text-sm">Total Orders</p>
                <p className="text-2xl font-bold text-gray-800">{orders.length}</p>
              </div>
              <div className="bg-white rounded-xl shadow p-6">
                <p className="text-gray-500 text-sm">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-800">{pendingOrders}</p>
              </div>
              <div className="bg-white rounded-xl shadow p-6">
                <p className="text-gray-500 text-sm">Payments Awaiting Confirmation</p>
                <p className="text-2xl font-bold text-gray-800">{pendingPayments}</p>
              </div>
              <div className="bg-white rounded-xl shadow p-6">
                <p className="text-gray-500 text-sm">Low Stock Products</p>
                <p className="text-2xl font-bold text-gray-800">{stock?.low_stock_products?.length ?? 0}</p>
              </div>
              <div className="bg-white rounded-xl shadow p-6 col-span-2 md:col-span-4">
                <p className="text-gray-500 text-sm mb-2">Low Stock Products (below 10)</p>
                {!stock || stock.low_stock_products.length === 0 ? (
                  <p className="text-sm text-gray-400">All products are well stocked.</p>
                ) : (
                  <ul className="text-sm text-gray-700 list-disc pl-5">
                    {stock.low_stock_products.map((p) => (
                      <li key={p.product_id}>{p.name} — {p.quantity} left</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {tab === "orders" && (
            <div className="flex flex-col gap-3">
              {orders.map((o) => (
                <div key={o.order_id} className="bg-white rounded-xl shadow p-4 flex flex-wrap justify-between items-center gap-3">
                  <div>
                    <p className="font-semibold text-gray-800">Order #{o.order_id} — {o.customer_name}</p>
                    <p className="text-sm text-gray-500">{o.phone} · RWF {Number(o.total_price).toLocaleString()}</p>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 capitalize">{o.order_status}</span>
                </div>
              ))}
            </div>
          )}

          {tab === "payments" && (
            <div className="flex flex-col gap-3">
              {payments.map((p) => (
                <div key={p.payment_id} className="bg-white rounded-xl shadow p-4 flex flex-wrap justify-between items-center gap-3">
                  <div>
                    <p className="font-semibold text-gray-800">Order #{p.order_id} — {p.customer_name}</p>
                    <p className="text-sm text-gray-500">{p.payment_method.replace("_", " ").toUpperCase()} · RWF {Number(p.amount).toLocaleString()}</p>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 capitalize">{p.payment_status}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}