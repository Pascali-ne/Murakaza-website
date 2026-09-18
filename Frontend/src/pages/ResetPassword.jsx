import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/api.js";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post(`/auth/reset-password/${token}`, { password });
      setMessage(data.message || "Password reset successful. Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-xl shadow p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">Reset Password</h1>
        <p className="text-gray-500 text-sm text-center mb-6">Enter your new password below.</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border rounded-lg px-4 py-2"
            required
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="border rounded-lg px-4 py-2"
            required
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button disabled={loading} className="bg-primary text-white py-3 rounded-full font-semibold disabled:opacity-50">
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
        {message && <p className="mt-4 text-sm text-center text-green-600 font-semibold">{message}</p>}
        <p className="text-sm text-center text-gray-500 mt-6">
          <Link to="/login" className="text-primary font-semibold">Back to Login</Link>
        </p>
      </div>
    </div>
  );
}