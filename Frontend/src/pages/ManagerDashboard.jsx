import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api.js";
import {
  TrendingUp,
  ShoppingBag,
  CreditCard,
  AlertTriangle,
  MessageSquare,
  Search,
  ExternalLink,
  Package,
  RefreshCw,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";

export default function ManagerDashboard() {
  const [tab, setTab] = useState("overview");
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.get("/orders").then((r) => setOrders(Array.isArray(r.data) ? r.data : [])),
      api.get("/payments").then((r) => setPayments(Array.isArray(r.data) ? r.data : [])),
      api.get("/products/low-stock").then((r) => setStock(r.data)),
    ])
      .catch((err) => console.error("Could not load manager metrics:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const pendingPayments = payments.filter((p) => p.payment_status === "pending").length;
  const pendingOrders = orders.filter((o) => o.order_status === "pending").length;
  const totalRevenue = payments
    .filter((p) => p.payment_status === "paid")
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const filteredOrders = orders.filter((o) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      String(o.order_id).includes(term) ||
      (o.customer_name && o.customer_name.toLowerCase().includes(term)) ||
      (o.phone && o.phone.includes(term))
    );
  });

  const filteredPayments = payments.filter((p) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      String(p.order_id).includes(term) ||
      (p.customer_name && p.customer_name.toLowerCase().includes(term)) ||
      (p.tx_ref && p.tx_ref.toLowerCase().includes(term))
    );
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
      {/* Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 tracking-tight">
            Manager &amp; Executive Oversight
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Omni-channel order pipeline, payment reconciliation, inventory audit, and review moderation
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
            <span>Sync Live</span>
          </button>
          <Link
            to="/admin/feedback"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary text-white rounded-xl text-xs font-semibold shadow-sm hover:bg-primary-light transition-all cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Feedback CMS</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Gross Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-heading text-slate-900 mt-2">
            RWF {totalRevenue.toLocaleString()}
          </p>
          <p className="text-xs text-emerald-600 font-medium mt-1">Confirmed payments</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Total Orders</span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-heading text-slate-900 mt-2">{orders.length}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">{pendingOrders} pending dispatch</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Pending Cashier</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-heading text-slate-900 mt-2">{pendingPayments}</p>
          <p className="text-xs text-amber-600 font-medium mt-1">Awaiting confirmation</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Low Stock SKUs</span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-heading text-slate-900 mt-2">
            {stock?.low_stock_products?.length ?? 0}
          </p>
          <p className="text-xs text-rose-600 font-medium mt-1">Under 10 threshold</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 mb-6">
        <div className="flex gap-2">
          {[
            { id: "overview", label: "Operations Overview" },
            { id: "orders", label: `Orders (${orders.length})` },
            { id: "payments", label: `Payments (${payments.length})` },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTab(t.id);
                setSearchTerm("");
              }}
              className={`pb-3 px-3.5 font-semibold text-sm transition-all border-b-2 cursor-pointer ${
                tab === t.id
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab !== "overview" && (
          <div className="relative w-full sm:w-64 mb-3 sm:mb-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
            />
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium">Aggregating system telemetry...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: OVERVIEW */}
          {tab === "overview" && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Quick Operational Portals */}
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <h3 className="text-base font-bold font-heading text-slate-900 mb-4">
                  Operational Control Desks
                </h3>
                <div className="space-y-3">
                  <Link
                    to="/cashier"
                    className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-primary/30 hover:bg-slate-50/80 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm group-hover:text-primary transition-colors">
                          Cashier Settlement Desk
                        </p>
                        <p className="text-xs text-slate-500">
                          {pendingPayments} payments awaiting verification
                        </p>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                  </Link>

                  <Link
                    to="/storekeeper"
                    className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-primary/30 hover:bg-slate-50/80 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm group-hover:text-primary transition-colors">
                          Storekeeper Inventory Portal
                        </p>
                        <p className="text-xs text-slate-500">
                          {stock?.low_stock_products?.length ?? 0} low stock items to restock
                        </p>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                  </Link>

                  <Link
                    to="/admin/feedback"
                    className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-primary/30 hover:bg-slate-50/80 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm group-hover:text-primary transition-colors">
                          Customer Review Moderation
                        </p>
                        <p className="text-xs text-slate-500">
                          Inspect, approve, and filter public ratings
                        </p>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                  </Link>
                </div>
              </div>

              {/* Low Stock Warning Box */}
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold font-heading text-slate-900">
                    Low Stock Alert Feed
                  </h3>
                  <Link
                    to="/storekeeper"
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Manage &rarr;
                  </Link>
                </div>

                {!stock || stock.low_stock_products.length === 0 ? (
                  <div className="py-12 text-center text-slate-400">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-700">Inventory levels optimal</p>
                    <p className="text-[11px] text-slate-400">No items below threshold</p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
                    {stock.low_stock_products.map((p) => (
                      <div
                        key={p.product_id}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100 text-xs"
                      >
                        <span className="font-semibold text-slate-800 line-clamp-1">{p.name}</span>
                        <span
                          className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${
                            p.quantity === 0
                              ? "bg-rose-100 text-rose-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {p.quantity === 0 ? "0 left" : `${p.quantity} left`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS */}
          {tab === "orders" && (
            <div className="space-y-3">
              {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                  <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">No orders found.</p>
                </div>
              ) : (
                filteredOrders.map((o) => (
                  <div
                    key={o.order_id}
                    className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm">Order #{o.order_id}</span>
                        <span className="text-slate-300">·</span>
                        <span className="font-medium text-slate-700 text-xs">{o.customer_name}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {o.phone} · Total:{" "}
                        <span className="font-semibold text-slate-800">
                          RWF {Number(o.total_price || 0).toLocaleString()}
                        </span>
                      </p>
                    </div>

                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full border capitalize self-start sm:self-auto ${
                        o.order_status === "delivered"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : o.order_status === "pending"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {o.order_status}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: PAYMENTS */}
          {tab === "payments" && (
            <div className="space-y-3">
              {filteredPayments.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                  <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">No payments found.</p>
                </div>
              ) : (
                filteredPayments.map((p) => (
                  <div
                    key={p.payment_id}
                    className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm">
                          Payment for Order #{p.order_id}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="font-medium text-slate-700 text-xs">{p.customer_name}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Method:{" "}
                        <span className="font-semibold text-slate-700 uppercase">
                          {(p.payment_method || "").replace("_", " ")}
                        </span>{" "}
                        · Amount:{" "}
                        <span className="font-semibold text-slate-800">
                          RWF {Number(p.amount || 0).toLocaleString()}
                        </span>
                        {p.tx_ref && <span> · ref: {p.tx_ref}</span>}
                      </p>
                    </div>

                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full border capitalize self-start sm:self-auto ${
                        p.payment_status === "paid"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : p.payment_status === "pending"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                    >
                      {p.payment_status}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}