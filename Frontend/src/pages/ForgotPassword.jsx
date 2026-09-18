import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api.js";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      setMessage(data.message || "If that email exists, a reset link has been sent.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-xl shadow p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">Forgot Password</h1>
        <p className="text-gray-500 text-sm text-center mb-6">
          Enter your email to receive a password reset link.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border rounded-lg px-4 py-2"
            required
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button disabled={loading} className="bg-primary text-white py-3 rounded-full font-semibold disabled:opacity-50">
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
        {message && <p className="mt-4 text-sm text-center text-gray-600">{message}</p>}
        <p className="text-sm text-center text-gray-500 mt-6">
          Remembered your password? <Link to="/login" className="text-primary font-semibold">Back to Login</Link>
        </p>
      </div>
    </div>
  );
}