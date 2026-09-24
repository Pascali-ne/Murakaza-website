import { useEffect, useState, lazy, Suspense } from "react";
import api from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import PartnerWorkspaceBanner from "../components/PartnerWorkspaceBanner.jsx";
import { RefreshCw } from "lucide-react";

const AdminDashboard = lazy(() => import("./AdminDashboard.jsx"));
const ManagerDashboard = lazy(() => import("./ManagerDashboard.jsx"));

const STATUS_STYLES = {
  paid: "bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300",
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/60 dark:text-yellow-300",
  failed: "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300",
  refunded: "bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300",
};

export default function CashierDashboard({ isEmbedded = false }) {
  const { user: currentUser } = useAuth();
  const [activeWorkspace, setActiveWorkspace] = useState("my");
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
    <div className={isEmbedded ? "w-full" : "max-w-5xl mx-auto px-4 py-10"}>
      {/* Partner workspace banner & switcher if user has delegated access */}
      {currentUser?.delegated_from_role && !isEmbedded && (
        <PartnerWorkspaceBanner
          currentUser={currentUser}
          activeWorkspace={activeWorkspace}
          setActiveWorkspace={setActiveWorkspace}
          myTitle="My Cashier Dashboard"
          partnerTitle={`${currentUser.delegated_by_name || "Partner"}'s ${(currentUser.role || "admin").toUpperCase()} Dashboard`}
        />
      )}

      {activeWorkspace === "partner" && currentUser?.delegated_from_role && !isEmbedded ? (
        <Suspense fallback={
          <div className="py-16 text-center text-gray-400 dark:text-gray-500">
            <RefreshCw size={28} className="animate-spin mx-auto mb-2 opacity-50" />
            <p>Loading partner dashboard...</p>
          </div>
        }>
          {currentUser.role === "manager" ? (
            <ManagerDashboard isEmbedded={true} />
          ) : (
            <AdminDashboard isEmbedded={true} />
          )}
        </Suspense>
      ) : (
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Cashier Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Confirm whether a customer's payment has actually been received.</p>

          <div className="flex gap-2 mb-6">
            {["pending", "paid", "failed", "all"].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize transition ${
                  filter === s
                    ? "bg-primary text-white"
                    : "bg-white dark:bg-slate-800 border dark:border-slate-700 text-gray-600 dark:text-gray-300"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

          {loading ? (
            <p className="text-gray-500 dark:text-gray-400">Loading payments...</p>
          ) : filtered.length === 0 ? (
            <p className="text-gray-400 dark:text-gray-500 text-center py-10">No payments in this view.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {filtered.map((p) => (
                <div key={p.payment_id} className="bg-white dark:bg-slate-800 rounded-xl shadow p-4 border dark:border-slate-700 flex flex-wrap justify-between items-center gap-3">
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-100">
                      Order #{p.order_id} — {p.customer_name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {p.payment_method.replace("_", " ").toUpperCase()} · RWF {Number(p.amount).toLocaleString()}
                      {p.tx_ref && <> · ref: {p.tx_ref}</>}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${STATUS_STYLES[p.payment_status] || "bg-gray-100 dark:bg-slate-700"}`}>
                      {p.payment_status}
                    </span>
                    {p.payment_status === "pending" && (
                      <>
                        <button
                          onClick={() => handleConfirm(p.payment_id)}
                          disabled={actingId === p.payment_id}
                          className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-3 py-1.5 rounded-full disabled:opacity-50 transition"
                        >
                          Confirm Received
                        </button>
                        <button
                          onClick={() => handleReject(p.payment_id)}
                          disabled={actingId === p.payment_id}
                          className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-3 py-1.5 rounded-full disabled:opacity-50 transition"
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
      )}
    </div>
  );
}