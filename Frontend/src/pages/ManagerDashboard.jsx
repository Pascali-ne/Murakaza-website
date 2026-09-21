import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import {
  Users,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  Shield,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trash2,
  Lock,
  Mail,
  Phone,
  User,
  Eye,
  EyeOff,
  RefreshCw,
  ArrowRightLeft,
  RotateCcw,
} from "lucide-react";

const emptyEmployeeForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  role: "cashier",
};

export default function ManagerDashboard() {
  const { user: currentUser, refreshUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") === "employees" ? "employees" : "overview";

  const [tab, setTab] = useState(initialTab);
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [stock, setStock] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  // Employee management state
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState(emptyEmployeeForm);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [feedback, setFeedback] = useState(null); // { type: "success" | "error", message: "" }

  // Role transfer & delegation modal state
  const [roleModal, setRoleModal] = useState({
    isOpen: false,
    employee: null,
    targetRole: "admin",
    isDelegation: true,
    submitting: false,
  });

  // Confirmation modal state for deactivation or removal
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    type: "status", // "status" | "delete"
    employee: null,
  });

  const loadGeneralData = () => {
    setLoading(true);
    Promise.all([
      api.get("/orders").then((r) => setOrders(r.data)).catch(() => setOrders([])),
      api.get("/payments").then((r) => setPayments(r.data)).catch(() => setPayments([])),
      api.get("/products/low-stock").then((r) => setStock(r.data)).catch(() => setStock(null)),
    ]).finally(() => setLoading(false));
  };

  const loadEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const res = await api.get("/employees");
      setEmployees(res.data);
    } catch (err) {
      const errMsg = err.response?.data?.message || "Failed to load staff accounts.";
      setFeedback({ type: "error", message: errMsg });
    } finally {
      setLoadingEmployees(false);
    }
  };

  useEffect(() => {
    loadGeneralData();
    loadEmployees();
  }, []);

  // Sync tab with URL search parameter if changed
  useEffect(() => {
    const urlTab = searchParams.get("tab");
    if (urlTab === "employees" && tab !== "employees") {
      setTab("employees");
    }
  }, [searchParams]);

  const handleTabChange = (newTab) => {
    setTab(newTab);
    if (newTab === "employees") {
      setSearchParams({ tab: "employees" });
      loadEmployees();
    } else {
      setSearchParams({});
    }
    setFeedback(null);
  };

  // Add Employee Submission
  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setFeedback(null);
    setSubmitting(true);
    try {
      const res = await api.post("/employees", form);
      setFeedback({ type: "success", message: res.data.message || "Employee created successfully." });
      setForm(emptyEmployeeForm);
      setShowAddModal(false);
      loadEmployees();
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.response?.data?.message || "Could not create employee account.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Open confirmation for toggle status
  const promptToggleStatus = (emp) => {
    setConfirmDialog({
      isOpen: true,
      type: "status",
      employee: emp,
    });
  };

  // Open confirmation for delete
  const promptDelete = (emp) => {
    setConfirmDialog({
      isOpen: true,
      type: "delete",
      employee: emp,
    });
  };

  // Confirm and execute action
  const handleConfirmAction = async () => {
    const { type, employee } = confirmDialog;
    if (!employee) return;

    setActionLoadingId(employee.user_id);
    setConfirmDialog({ isOpen: false, type: "status", employee: null });
    setFeedback(null);

    try {
      if (type === "status") {
        const res = await api.patch(`/employees/${employee.user_id}/status`);
        setFeedback({ type: "success", message: res.data.message });
      } else if (type === "delete") {
        const res = await api.delete(`/employees/${employee.user_id}`);
        setFeedback({ type: "success", message: res.data.message });
      }
      loadEmployees();
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.response?.data?.message || "Action failed to execute.",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filtered employees list
  const filteredEmployees = employees.filter((emp) => {
    const matchesRole = roleFilter === "all" || emp.role === roleFilter;
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (emp.phone && emp.phone.includes(searchQuery));
    return matchesRole && matchesSearch;
  });

  const pendingPayments = payments.filter((p) => p.payment_status === "pending").length;
  const pendingOrders = orders.filter((o) => o.order_status === "pending").length;

  const totalStaff = employees.length;
  const activeStaff = employees.filter((e) => e.is_active !== false).length;
  const cashierCount = employees.filter((e) => e.role === "cashier").length;
  const storekeeperCount = employees.filter((e) => e.role === "storekeeper").length;
  const employeeCount = employees.filter((e) => e.role === "employee").length;

  const openRoleModal = (emp) => {
    setRoleModal({
      isOpen: true,
      employee: emp,
      targetRole: emp.role === "admin" ? "manager" : "admin",
      isDelegation: true,
      submitting: false,
    });
  };

  const handleRoleTransfer = async (e) => {
    e.preventDefault();
    if (!roleModal.employee) return;
    setRoleModal((prev) => ({ ...prev, submitting: true }));
    setFeedback(null);
    try {
      const res = await api.patch(`/employees/${roleModal.employee.user_id}/role`, {
        role: roleModal.targetRole,
        is_delegation: roleModal.isDelegation,
      });
      setFeedback({ type: "success", message: res.data.message });
      setRoleModal({ isOpen: false, employee: null, targetRole: "admin", isDelegation: true, submitting: false });
      loadEmployees();
      if (refreshUser) refreshUser();
    } catch (err) {
      setFeedback({ type: "error", message: err.response?.data?.message || "Failed to update role." });
    } finally {
      setRoleModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  const handleRevokeRole = async (emp) => {
    setActionLoadingId(emp.user_id);
    setFeedback(null);
    try {
      const res = await api.patch(`/employees/${emp.user_id}/role`, {
        revoke: true,
      });
      setFeedback({ type: "success", message: res.data.message });
      loadEmployees();
      if (refreshUser) refreshUser();
    } catch (err) {
      setFeedback({ type: "error", message: err.response?.data?.message || "Failed to revoke access." });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Role Badge Helper with Delegation Indicator
  const getRoleBadge = (emp) => {
    const role = typeof emp === "string" ? emp : emp?.role;
    const delegatedFrom = typeof emp === "object" ? emp?.delegated_from_role : null;

    let badge = null;
    switch (role) {
      case "admin":
        badge = (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 inline-flex items-center gap-1">
            <Shield size={12} />
            {delegatedFrom ? "Acting Admin" : "Admin"}
          </span>
        );
        break;
      case "manager":
        badge = (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 inline-flex items-center gap-1">
            {delegatedFrom ? "Acting Manager" : "Manager"}
          </span>
        );
        break;
      case "cashier":
        badge = <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">Cashier</span>;
        break;
      case "storekeeper":
        badge = <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">Store Keeper</span>;
        break;
      case "customer":
        badge = <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">Customer</span>;
        break;
      case "employee":
      default:
        badge = <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">Employee</span>;
        break;
    }

    return (
      <div className="flex flex-col items-start gap-1">
        {badge}
        {delegatedFrom && (
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-900/40">
            <RotateCcw size={10} /> from {delegatedFrom}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Notice for Temporary Acting Admin */}
      {currentUser?.delegated_from_role && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-start gap-3 shadow-sm">
          <ShieldAlert className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider">
              Temporary Acting {currentUser.role === "admin" ? "Administrator" : "Manager"} Access Active
            </h4>
            <p className="text-xs text-amber-800 dark:text-amber-300 mt-1 leading-relaxed">
              You are currently covering store workflows while the administrator is away (delegated from your base role: <strong>{currentUser.delegated_from_role}</strong>). You have operational access to store features, but <strong>role transfers and employee role delegations are reserved exclusively for the permanent administrator</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Manager Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Oversee staff permissions, inventory stock, order workflows, and customer payments.
          </p>
        </div>
        {tab === "employees" && (
          <button
            onClick={() => {
              setForm(emptyEmployeeForm);
              setShowAddModal(true);
              setFeedback(null);
            }}
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-5 py-2.5 rounded-xl shadow transition"
          >
            <UserPlus size={18} />
            <span>Add New Employee</span>
          </button>
        )}
      </div>

      {/* Tabs Bar */}
      <div className="flex gap-2 sm:gap-4 mb-6 border-b dark:border-slate-800 flex-wrap">
        {[
          { id: "overview", label: "Overview" },
          { id: "employees", label: "Staff Control (RBAC)" },
          { id: "orders", label: "Orders" },
          { id: "payments", label: "Payments" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => handleTabChange(t.id)}
            className={`pb-3 px-3 font-semibold text-sm sm:text-base transition-colors ${
              tab === t.id
                ? "border-b-2 border-primary text-primary dark:text-accent font-bold"
                : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            {t.label}
          </button>
        ))}
        <Link
          to="/admin/feedback"
          className="pb-3 px-3 font-semibold text-sm sm:text-base text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-accent transition-colors ml-auto"
        >
          Feedback Moderation →
        </Link>
      </div>

      {/* Alert Feedback Banner */}
      {feedback && (
        <div
          className={`mb-6 p-4 rounded-xl flex items-center justify-between text-sm shadow-sm ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
              : "bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? <CheckCircle2 size={18} className="shrink-0 text-emerald-600 dark:text-emerald-400" /> : <AlertCircle size={18} className="shrink-0 text-rose-600 dark:text-rose-400" />}
            <span className="font-medium">{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 font-bold ml-4">
            ×
          </button>
        </div>
      )}

      {/* TAB 1: OVERVIEW */}
      {tab === "overview" && (
        loading ? (
          <div className="py-12 text-center text-gray-400">Loading overview metrics...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 border dark:border-slate-700">
              <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">Total Staff</p>
              <p className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 mt-2">{totalStaff}</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">{activeStaff} active accounts</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 border dark:border-slate-700">
              <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">Pending Orders</p>
              <p className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 mt-2">{pendingOrders}</p>
              <p className="text-xs text-gray-400 mt-1">out of {orders.length} total</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 border dark:border-slate-700">
              <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">Pending Payments</p>
              <p className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 mt-2">{pendingPayments}</p>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1">awaiting confirmation</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 border dark:border-slate-700">
              <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">Low Stock Products</p>
              <p className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 mt-2">{stock?.low_stock_products?.length ?? 0}</p>
              <p className="text-xs text-gray-400 mt-1">under 10 items</p>
            </div>

            {/* Low Stock Listing */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 col-span-2 md:col-span-4 border dark:border-slate-700">
              <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
                <span>Low Stock Inventory Alert</span>
              </h3>
              {!stock || stock.low_stock_products.length === 0 ? (
                <p className="text-sm text-gray-400">All products are well stocked above minimum thresholds.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {stock.low_stock_products.map((p) => (
                    <div key={p.product_id} className="p-3 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-lg flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{p.name}</span>
                      <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-800 px-2.5 py-1 rounded shadow-sm">
                        {p.quantity} left
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      )}

      {/* TAB 2: EMPLOYEES & STAFF CONTROL (RBAC) */}
      {tab === "employees" && (
        <div className="space-y-6">
          {/* Employee KPI Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border dark:border-slate-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Staff</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">{totalStaff}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border dark:border-slate-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">Cashiers</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{cashierCount}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border dark:border-slate-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">Store Keepers</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{storekeeperCount}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border dark:border-slate-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">Employees</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{employeeCount}</p>
            </div>
          </div>

          {/* Filter and Search Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border dark:border-slate-700">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search staff by name, email, phone..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter size={16} className="text-gray-400 hidden sm:inline" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 text-sm rounded-lg border dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-gray-100 focus:outline-none"
              >
                <option value="all">All Roles</option>
                <option value="cashier">Cashiers</option>
                <option value="storekeeper">Store Keepers</option>
                <option value="employee">Employees</option>
                <option value="manager">Managers</option>
              </select>
              <button
                onClick={loadEmployees}
                title="Refresh staff list"
                className="p-2 text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-accent rounded-lg border dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
              >
                <RefreshCw size={16} className={loadingEmployees ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          {/* Staff Data Table */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b dark:border-slate-700 bg-gray-50/75 dark:bg-slate-900/50 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    <th className="py-3.5 px-4 font-semibold">Staff Member</th>
                    <th className="py-3.5 px-4 font-semibold">Role</th>
                    <th className="py-3.5 px-4 font-semibold">Contact Info</th>
                    <th className="py-3.5 px-4 font-semibold">Status</th>
                    <th className="py-3.5 px-4 font-semibold">Joined Date</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-slate-700/60 text-sm">
                  {loadingEmployees ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-gray-400">
                        <RefreshCw size={24} className="animate-spin mx-auto mb-2 opacity-50" />
                        Loading employee directory...
                      </td>
                    </tr>
                  ) : filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-gray-400">
                        No employees found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((emp) => {
                      const isSelf = currentUser?.user_id === emp.user_id;
                      const isAdmin = emp.role === "admin";
                      const canManage = !isSelf && !(isAdmin && currentUser?.role !== "admin");

                      return (
                        <tr key={emp.user_id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition-colors">
                          {/* Staff Member */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary dark:bg-primary/20 dark:text-accent flex items-center justify-center font-bold text-sm shrink-0">
                                {emp.name ? emp.name.charAt(0).toUpperCase() : "U"}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-1.5">
                                  {emp.name}
                                  {isSelf && (
                                    <span className="text-[10px] bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded font-normal">
                                      You
                                    </span>
                                  )}
                                </p>
                                <p className="text-xs text-gray-400">ID #{emp.user_id}</p>
                              </div>
                            </div>
                          </td>

                          {/* Role */}
                          <td className="py-3.5 px-4">
                            {getRoleBadge(emp)}
                          </td>

                          {/* Contact Info */}
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-gray-700 dark:text-gray-200 text-xs font-medium flex items-center gap-1">
                                <Mail size={12} className="text-gray-400" />
                                {emp.email}
                              </span>
                              {emp.phone && (
                                <span className="text-gray-400 text-xs flex items-center gap-1">
                                  <Phone size={12} />
                                  {emp.phone}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            {emp.is_active !== false ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                Deactivated
                              </span>
                            )}
                          </td>

                          {/* Joined Date */}
                          <td className="py-3.5 px-4 text-xs text-gray-500 dark:text-gray-400">
                            {emp.created_at ? new Date(emp.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—"}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            {canManage ? (
                              <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                {currentUser?.role === "admin" && !currentUser?.delegated_from_role && (
                                  <>
                                    {emp.delegated_from_role ? (
                                      <button
                                        onClick={() => handleRevokeRole(emp)}
                                        disabled={actionLoadingId === emp.user_id}
                                        title={`Revoke delegated access and restore back to ${emp.delegated_from_role}`}
                                        className="text-xs px-2.5 py-1 rounded font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 dark:text-rose-300 flex items-center gap-1 transition"
                                      >
                                        <RotateCcw size={12} />
                                        <span>{actionLoadingId === emp.user_id ? "Revoking..." : "Revoke"}</span>
                                      </button>
                                    ) : null}
                                    <button
                                      onClick={() => openRoleModal(emp)}
                                      disabled={actionLoadingId === emp.user_id}
                                      title="Transfer or delegate role"
                                      className="text-xs px-2.5 py-1 rounded font-semibold bg-primary/10 hover:bg-primary/20 text-primary dark:bg-accent/10 dark:hover:bg-accent/20 dark:text-accent flex items-center gap-1 transition"
                                    >
                                      <ArrowRightLeft size={12} />
                                      <span>Transfer</span>
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => promptToggleStatus(emp)}
                                  disabled={actionLoadingId === emp.user_id}
                                  className={`text-xs px-2.5 py-1 rounded font-semibold transition ${
                                    emp.is_active !== false
                                      ? "bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:hover:bg-amber-900/40 dark:text-amber-300"
                                      : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 dark:text-emerald-300"
                                  }`}
                                >
                                  {actionLoadingId === emp.user_id ? "Saving..." : emp.is_active !== false ? "Deactivate" : "Activate"}
                                </button>
                                <button
                                  onClick={() => promptDelete(emp)}
                                  disabled={actionLoadingId === emp.user_id}
                                  title="Remove Employee"
                                  className="text-xs p-1 rounded text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400 italic">Protected</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ORDERS */}
      {tab === "orders" && (
        <div className="flex flex-col gap-3">
          {orders.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No customer orders recorded yet.</p>
          ) : (
            orders.map((o) => (
              <div key={o.order_id} className="bg-white dark:bg-slate-800 rounded-xl shadow p-4 flex flex-wrap justify-between items-center gap-3 border dark:border-slate-700">
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">Order #{o.order_id} — {o.customer_name || "Guest"}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{o.phone} · RWF {Number(o.total_price).toLocaleString()}</p>
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 capitalize">
                  {o.order_status}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 4: PAYMENTS */}
      {tab === "payments" && (
        <div className="flex flex-col gap-3">
          {payments.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No payment transactions found.</p>
          ) : (
            payments.map((p) => (
              <div key={p.payment_id} className="bg-white dark:bg-slate-800 rounded-xl shadow p-4 flex flex-wrap justify-between items-center gap-3 border dark:border-slate-700">
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">Order #{p.order_id} — {p.customer_name || "Customer"}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {(p.payment_method || "").replace("_", " ").toUpperCase()} · RWF {Number(p.amount).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${
                    p.payment_status === "paid"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                      : p.payment_status === "failed"
                      ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                  }`}
                >
                  {p.payment_status}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* MODAL: ADD NEW EMPLOYEE */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6 border dark:border-slate-800 relative">
            <div className="flex items-center justify-between pb-4 border-b dark:border-slate-800 mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 dark:bg-primary/20 text-primary dark:text-accent flex items-center justify-center">
                  <UserPlus size={18} />
                </div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Add New Employee</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Jean Paul Mugisha"
                    className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="e.g. jean@murakaza.com"
                    className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number (Rwanda 07xxxxxxxx)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="0781234567"
                    className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Temporary Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="At least 6 characters"
                    className="w-full pl-9 pr-10 py-2 text-sm rounded-lg border dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Staff Role Assignment *
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 focus:outline-none"
                >
                  <option value="cashier">Cashier (Inspects and confirms customer payments)</option>
                  <option value="storekeeper">Store Keeper (Manages product inventory & stock)</option>
                  <option value="employee">Employee (General store & service staff)</option>
                  {currentUser?.role === "admin" && !currentUser?.delegated_from_role && (
                    <option value="manager">Manager (High-level dashboard & employee supervisor)</option>
                  )}
                </select>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold border dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold bg-primary hover:bg-primary/90 text-white disabled:opacity-50 shadow transition"
                >
                  {submitting ? "Creating..." : "Save Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRMATION DIALOG */}
      {confirmDialog.isOpen && confirmDialog.employee && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-sm w-full p-6 border dark:border-slate-800">
            <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400 mb-3">
              <AlertCircle size={24} />
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                {confirmDialog.type === "delete" ? "Remove Employee?" : "Change Employee Status?"}
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              {confirmDialog.type === "delete" ? (
                <>
                  Are you sure you want to remove{" "}
                  <strong className="text-gray-800 dark:text-white">{confirmDialog.employee.name}</strong> from the system?
                </>
              ) : (
                <>
                  Are you sure you want to{" "}
                  {confirmDialog.employee.is_active !== false ? "deactivate" : "activate"}{" "}
                  <strong className="text-gray-800 dark:text-white">{confirmDialog.employee.name}</strong>?
                  {confirmDialog.employee.is_active !== false && " They will immediately lose access to log in."}
                </>
              )}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDialog({ isOpen: false, type: "status", employee: null })}
                className="flex-1 py-2 rounded-xl text-sm font-semibold border dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold text-white shadow transition ${
                  confirmDialog.type === "delete"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-primary hover:bg-primary/90"
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TRANSFER & DELEGATE ROLE */}
      {roleModal.isOpen && roleModal.employee && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-md w-full p-6 border dark:border-slate-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary dark:bg-accent/20 dark:text-accent">
                <Shield size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                  Transfer & Delegate Role
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Target: <strong className="text-gray-700 dark:text-gray-200">{roleModal.employee.name}</strong> ({roleModal.employee.email})
                </p>
              </div>
            </div>

            <form onSubmit={handleRoleTransfer} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Select New Role Assignment *
                </label>
                <select
                  value={roleModal.targetRole}
                  onChange={(e) => setRoleModal({ ...roleModal, targetRole: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="admin">Admin (Full administrative & system control)</option>
                  <option value="manager">Manager (Staff control, inventory, orders & payment supervisor)</option>
                  <option value="cashier">Cashier (Inspect & confirm customer MoMo/Airtel payments)</option>
                  <option value="storekeeper">Store Keeper (Manage inventory & stock levels)</option>
                  <option value="employee">Employee (General store staff)</option>
                </select>
              </div>

              {/* Temporary delegation checkbox */}
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={roleModal.isDelegation}
                    onChange={(e) => setRoleModal({ ...roleModal, isDelegation: e.target.checked })}
                    className="mt-0.5 rounded text-primary focus:ring-primary h-4 w-4"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-amber-900 dark:text-amber-200 block">
                      Temporary Delegation (Covering while Admin is away)
                    </span>
                    <span className="text-amber-700 dark:text-amber-300 mt-0.5 block leading-relaxed">
                      Remembers their base role (<strong>{roleModal.employee.role}</strong>) so you can quickly revoke this elevated access with one click when you return.
                    </span>
                  </div>
                </label>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setRoleModal({ isOpen: false, employee: null, targetRole: "admin", isDelegation: true, submitting: false })}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold border dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={roleModal.submitting}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-primary hover:bg-primary/90 text-white disabled:opacity-50 shadow transition flex items-center justify-center gap-2"
                >
                  {roleModal.submitting ? "Transferring..." : "Confirm Role Transfer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}