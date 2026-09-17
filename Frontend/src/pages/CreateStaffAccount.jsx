import { useState } from "react";
import api from "../api/api.js";
import { isValidRwandaPhone } from "../utils/phoneValidation.js";

const ROLE_DESCRIPTIONS = {
  cashier: "Confirms whether a customer's mobile money / payment has actually been received.",
  storekeeper: "Verifies stock levels — can add and remove products.",
  manager: "Oversees orders, payments and stock, and moderates customer feedback.",
  admin: "Full control of the whole system.",
};

export default function CreateStaffAccount() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", role: "cashier" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!isValidRwandaPhone(form.phone)) {
      setError("Enter a valid 10-digit Rwandan phone number starting with 07 (e.g. 0781234567).");
      return;
    }
    try {
      await api.post("/auth/create-staff", form);
      setMessage(`✅ ${form.role} account created for ${form.name}`);
      setForm({ name: "", email: "", phone: "", password: "", role: "cashier" });
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Create Staff Account</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Full name" className="w-full border rounded px-3 py-2" required />
        <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" className="w-full border rounded px-3 py-2" required />
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone (e.g. 0781234567)" className="w-full border rounded px-3 py-2" required />
        <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Temporary password" className="w-full border rounded px-3 py-2" required />
        <select name="role" value={form.role} onChange={handleChange} className="w-full border rounded px-3 py-2">
          <option value="cashier">Cashier</option>
          <option value="storekeeper">Storekeeper</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>
        <p className="text-xs text-gray-500">{ROLE_DESCRIPTIONS[form.role]}</p>
        <button className="w-full bg-primary text-white py-2 rounded-full font-semibold">Create Account</button>
      </form>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {message && <p className="mt-4 text-sm text-green-700">{message}</p>}
    </div>
  );
}