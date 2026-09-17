import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { isValidRwandaPhone } from "../utils/phoneValidation.js";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!isValidRwandaPhone(form.phone)) {
      setError("Enter a valid 10-digit Rwandan phone number starting with 07 (e.g. 0781234567).");
      return;
    }
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-xl shadow p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Create an Account</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input name="name" value={form.name} onChange={handleChange} required
            placeholder="Full Name" className="border rounded-lg px-4 py-2" />
          <input name="email" type="email" value={form.email} onChange={handleChange} required
            placeholder="Email" className="border rounded-lg px-4 py-2" />
          <input name="phone" value={form.phone} onChange={handleChange} required
            placeholder="Phone Number (e.g. 0781234567)" className="border rounded-lg px-4 py-2" />
          <input name="password" type="password" value={form.password} onChange={handleChange} required
            placeholder="Password" className="border rounded-lg px-4 py-2" />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button className="bg-primary text-white py-3 rounded-full font-semibold">Register</button>
        </form>
        <p className="text-sm text-center text-gray-500 mt-4">
          Already have an account? <Link to="/login" className="text-primary font-semibold">Login</Link>
        </p>
      </div>
    </div>
  );
}