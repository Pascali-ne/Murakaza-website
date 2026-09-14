import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-xl shadow p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Login to MURAKAZA</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
            placeholder="Email" className="border rounded-lg px-4 py-2" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
            placeholder="Password" className="border rounded-lg px-4 py-2" />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button className="bg-primary text-white py-3 rounded-full font-semibold">Login</button>
        </form>
        <p className="text-sm text-center text-gray-500 mt-4">
          Don't have an account? <Link to="/register" className="text-primary font-semibold">Register</Link>
        </p>
      </div>
    </div>
  );
}