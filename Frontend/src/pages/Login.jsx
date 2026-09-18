import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-slate-50 to-white">
      <div className="w-full max-w-md">
        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 sm:p-10 transition-all duration-300 hover:shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-3 shadow-inner">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-gray-900 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-sm text-gray-500 mt-1.5">
              Sign in to manage your MURAKAZA orders and services
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-sm font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="w-full pl-11 pr-11 py-3 bg-slate-50/50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-sm font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end mt-2">
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors duration-150"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-4 bg-primary hover:bg-primary-light active:bg-primary-dark text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-primary font-semibold hover:underline"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-6 text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-green-600" />
          <span>256-bit SSL Encrypted & Session Guard Protected</span>
        </div>
      </div>
    </div>
  );
}