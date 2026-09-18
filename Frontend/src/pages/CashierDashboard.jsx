import { useEffect, useState } from "react";
import api from "../api/api.js";
import { CheckCircle2, XCircle, Clock, CreditCard, Search, RefreshCw, AlertCircle, DollarSign } from "lucide-react";

const METHOD_LABELS = {
  mtn_momo: { label: "MTN MoMo", color: "bg-amber-100 text-amber-800 border-amber-200" },
  tigo_cash: { label: "Tigo / Airtel", color: "bg-red-100 text-red-800 border-red-200" },
  irembo_pay: { label: "IremboPay", color: "bg-blue-100 text-blue-800 border-blue-200" },
  flutterwave: { label: "Flutterwave", color: "bg-orange-100 text-orange-800 border-orange-200" },
  cash_on_delivery: { label: "Cash on Delivery", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
};

const STATUS_BADGES = {
  paid: { label: "Paid / Confirmed", icon: CheckCircle2, style: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  pending: { label: "Pending Verification", icon: Clock, style: "bg-amber-50 text-amber-700 border-amber-200" },
  failed: { label: "Failed / Rejected", icon: XCircle, style: "bg-rose-50 text-rose-700 border-rose-200" },
  refunded: { label: "Refunded", icon: AlertCircle, style: "bg-slate-100 text-slate-700 border-slate-200" },
};

export default function CashierDashboard() {
  const [payments, setPayments] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    api
      .get("/payments")
      .then((res) => setPayments(Array.isArray(res.data) ? res.data : []))
      .catch((err) => setError(err.response?.data?.message || "Could not load payments"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

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
    if (!confirm("Are you sure you want to mark this payment as failed / rejected?")) return;
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

  // Metrics
  const pendingList = payments.filter((p) => p.payment_status === "pending");
  const paidList = payments.filter((p) => p.payment_status === "paid");
  const failedList = payments.filter((p) => p.payment_status === "failed");
  const totalReceivedAmount = paidList.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const filtered = payments
    .filter((p) => (filter === "all" ? true : p.payment_status === filter))
    .filter((p) => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        String(p.order_id).includes(term) ||
        (p.customer_name && p.customer_name.toLowerCase().includes(term)) ||
        (p.tx_ref && p.tx_ref.toLowerCase().includes(term)) ||
        (p.payment_method && p.payment_method.toLowerCase().includes(term))
      );
    });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 tracking-tight">
            Cashier &amp; Settlement Desk
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time multi-gateway payment logs, cash verification, and settlement approvals
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-primary" : ""}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Pending Review</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-heading text-slate-900 mt-2">{pendingList.length}</p>
          <p className="text-xs text-amber-600 font-medium mt-1">Requires cashier action</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Confirmed Paid</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-heading text-slate-900 mt-2">{paidList.length}</p>
          <p className="text-xs text-emerald-600 font-medium mt-1">Settled transactions</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Rejected / Failed</span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-heading text-slate-900 mt-2">{failedList.length}</p>
          <p className="text-xs text-rose-600 font-medium mt-1">Invalid or canceled</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Total Settled</span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-heading text-slate-900 mt-2">
            RWF {totalReceivedAmount.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 font-medium mt-1">Total revenue collected</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        {/* Status Filters */}
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1">
          {[
            { id: "pending", label: "Pending" },
            { id: "paid", label: "Confirmed" },
            { id: "failed", label: "Failed" },
            { id: "all", label: "All Records" },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setFilter(s.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide whitespace-nowrap transition-all cursor-pointer ${
                filter === s.id
                  ? "bg-primary text-white shadow-md"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search order #, customer, ref..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Content List */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium">Fetching transaction settlement records...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
          <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">No payment logs found</h3>
          <p className="text-xs text-slate-400 mt-1">There are no transactions matching the selected filter or search query.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => {
            const statusConfig = STATUS_BADGES[p.payment_status] || STATUS_BADGES.pending;
            const StatusIcon = statusConfig.icon;
            const methodInfo = METHOD_LABELS[p.payment_method] || {
              label: (p.payment_method || "Payment").replace("_", " ").toUpperCase(),
              color: "bg-slate-100 text-slate-700 border-slate-200",
            };

            return (
              <div
                key={p.payment_id}
                className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Left Transaction Info */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-bold text-slate-900 text-base">
                      Order #{p.order_id}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="font-medium text-slate-700 text-sm">
                      {p.customer_name || "Guest Customer"}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${methodInfo.color}`}
                    >
                      {methodInfo.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                    <span className="font-semibold text-slate-800 text-sm">
                      RWF {Number(p.amount || 0).toLocaleString()}
                    </span>
                    {p.tx_ref && (
                      <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                        ref: {p.tx_ref}
                      </span>
                    )}
                    {p.created_at && (
                      <span className="text-slate-400">
                        {new Date(p.created_at).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Status & Actions */}
                <div className="flex items-center gap-3 shrink-0 flex-wrap">
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${statusConfig.style}`}
                  >
                    <StatusIcon className="w-3.5 h-3.5" />
                    <span>{statusConfig.label}</span>
                  </div>

                  {p.payment_status === "pending" && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleConfirm(p.payment_id)}
                        disabled={actingId === p.payment_id}
                        className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {actingId === p.payment_id ? (
                          <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        <span>Confirm Received</span>
                      </button>

                      <button
                        onClick={() => handleReject(p.payment_id)}
                        disabled={actingId === p.payment_id}
                        className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 border border-rose-200 text-xs font-bold px-3.5 py-2 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}