import { useEffect, useState, lazy, Suspense } from "react";
import api from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Shield, Sparkles, CreditCard, RefreshCw } from "lucide-react";

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
  const [payments, setPayments] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);
  const [error, setError] = useState("");

  const isTransferred = Boolean(currentUser?.delegated_from_role);
  const partnerName = currentUser?.delegated_by_name || "Business Partner";
  const partnerEmail = currentUser?.delegated_by_email;
  const grantedRole = (currentUser?.role || "admin").toUpperCase();

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
    <div className={isEmbedded ? "w-full" : "max-w-6xl mx-auto px-4 py-8"}>
      {/* 1. TITLE & PARTNER TRANSFER NOTICE */}
      {isTransferred && !isEmbedded && (
        <div className="mb-8 p-5 bg-gradient-to-r from-amber-500/10 via-primary/10 to-amber-500/5 dark:from-amber-950/40 dark:via-slate-800 dark:to-slate-800/60 rounded-2xl border border-amber-300/40 dark:border-amber-700/50 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-xl shadow shrink-0">
              <Shield size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">
                  {partnerName}'s {grantedRole} Dashboard
                </h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700/60 shadow-sm">
                  <Sparkles size={11} /> Transferred Access Active
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1 max-w-2xl leading-relaxed">
                You are operating with full delegated access from <strong className="text-gray-900 dark:text-white font-semibold">{partnerName}</strong>
                {partnerEmail && <span> ({partnerEmail})</span>}. His store operations are active below, and down below you can verify customer payment transfers.
              </p>
            </div>
          </div>
          <a
            href="#accessed-transfers"
            className="self-start md:self-auto inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 shadow transition shrink-0"
          >
            <span>Jump to Accessed Transfers ↓</span>
          </a>
        </div>
      )}

      {/* 2. HIS DASHBOARD (Rendered right on this 1 dashboard) */}
      {isTransferred && !isEmbedded && (
        <div className="mb-14">
          <Suspense fallback={
            <div className="py-14 text-center text-gray-400 dark:text-gray-500">
              <RefreshCw size={28} className="animate-spin mx-auto mb-2 opacity-50" />
              <p>Loading {partnerName}'s store dashboard...</p>
            </div>
          }>
            {currentUser.role === "manager" ? (
              <ManagerDashboard isEmbedded={true} />
            ) : (
              <AdminDashboard isEmbedded={true} />
            )}
          </Suspense>
        </div>
      )}

      {/* 3. DOWN BELOW: ACCESSED TRANSFER (Cashier payment transfers verification) */}
      <div
        id="accessed-transfers"
        className={isTransferred && !isEmbedded ? "pt-8 border-t-2 border-dashed border-gray-300 dark:border-slate-700 scroll-mt-6" : ""}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <CreditCard className="text-primary dark:text-accent" size={24} />
              <span>{isTransferred ? "Accessed Cashier Transfers & Payments" : "Cashier Dashboard"}</span>
              {isTransferred && (
                <span className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 px-2.5 py-0.5 rounded-full font-semibold">
                  Cashier Role
                </span>
              )}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
              Confirm whether customer mobile money and bank transfers have been received into store accounts.
            </p>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { id: "pending", label: "Pending Transfers" },
            { id: "paid", label: "Confirmed Paid" },
            { id: "failed", label: "Failed" },
            { id: "all", label: "All Transfers" },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setFilter(s.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize transition ${
                filter === s.id
                  ? "bg-primary text-white shadow-sm"
                  : "bg-white dark:bg-slate-800 border dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        {loading ? (
          <p className="text-gray-500 dark:text-gray-400 py-6">Loading payments...</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-400 dark:text-gray-500 text-center py-10 bg-gray-50 dark:bg-slate-800/40 rounded-xl border dark:border-slate-700">
            No payments found in this view.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((p) => (
              <div
                key={p.payment_id}
                className="bg-white dark:bg-slate-800 rounded-xl shadow p-4 border dark:border-slate-700 flex flex-wrap justify-between items-center gap-3 transition"
              >
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
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${
                      STATUS_STYLES[p.payment_status] || "bg-gray-100 dark:bg-slate-700"
                    }`}
                  >
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
    </div>
  );
}