import { useEffect, useState } from "react";
import api from "../api/api.js";

const STATUS_STYLES = {
  paid: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-gray-100 text-gray-700",
};

export default function CashierDashboard() {
  const [payments, setPayments] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    api
      .get("/payments")
      .then((res) => setPayments(res.data))
      .catch((err) => setError(err.response?.data?.message || "Could not load payments"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleConfirm = async (id) => {
    setActingId(id);
    try {
      await api.put(`/payments/${id}/confirm`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not confirm payment");
    } finally {
      setActingId(null);
    }
  };

  const handleReject = async (id) => {
    if (!confirm("Mark this payment as failed / not received?")) return;
    setActingId(id);
    try {
      await api.put(`/payments/${id}/reject`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not reject payment");
    } finally {
      setActingId(null);
    }
  };

  const filtered = filter === "all" ? payments : payments.filter((p) => p.payment_status === filter);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Cashier Dashboard</h1>
      <p className="text-gray-500 mb-6">Confirm whether a customer's payment has actually been received.</p>

      <div className="flex gap-2 mb-6">
        {["pending", "paid", "failed", "all"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize ${
              filter === s ? "bg-primary text-white" : "bg-white border text-gray-600"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {loading ? (
        <p className="text-gray-500">Loading payments...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-400 text-center py-10">No payments in this view.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((p) => (
            <div key={p.payment_id} className="bg-white rounded-xl shadow p-4 flex flex-wrap justify-between items-center gap-3">
              <div>
                <p className="font-semibold text-gray-800">
                  Order #{p.order_id} — {p.customer_name}
                </p>
                <p className="text-sm text-gray-500">
                  {p.payment_method.replace("_", " ").toUpperCase()} · RWF {Number(p.amount).toLocaleString()}
                  {p.tx_ref && <> · ref: {p.tx_ref}</>}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${STATUS_STYLES[p.payment_status] || "bg-gray-100"}`}>
                  {p.payment_status}
                </span>
                {p.payment_status === "pending" && (
                  <>
                    <button
                      onClick={() => handleConfirm(p.payment_id)}
                      disabled={actingId === p.payment_id}
                      className="bg-green-600 text-white text-sm font-semibold px-3 py-1.5 rounded-full disabled:opacity-50"
                    >
                      Confirm Received
                    </button>
                    <button
                      onClick={() => handleReject(p.payment_id)}
                      disabled={actingId === p.payment_id}
                      className="bg-red-500 text-white text-sm font-semibold px-3 py-1.5 rounded-full disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}