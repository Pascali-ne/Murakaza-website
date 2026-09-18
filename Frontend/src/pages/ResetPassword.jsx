import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/api.js";
import { Lock, Eye, EyeOff, CheckCircle2, ArrowLeft, ShieldCheck } from "lucide-react";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post(`/auth/reset-password/${token}`, { password });
      setMessage(data.message || "Your password has been successfully reset!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired reset token. Please request a new link.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-slate-50 to-white">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 sm:p-10 transition-all">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-3">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-gray-900 tracking-tight">
              Create New Password
            </h1>
            <p className="text-sm text-gray-500 mt-1.5">
              Enter your new secure password below to regain access.
            </p>
          </div>

          {message && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{message}</p>
                <p className="text-xs text-emerald-600 mt-0.5">Redirecting to login...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3 bg-slate-50/50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-4 bg-primary hover:bg-primary-light text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Updating password...</span>
                </>
              ) : (
                "Update Password"
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}