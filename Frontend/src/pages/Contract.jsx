import { useState } from "react";
import { Phone, Mail, MessageCircle, MapPin } from "lucide-react";
import api from "../api/api.js";

export default function Contact() {
  const [form, setForm] = useState({ customer_name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/services/request", { ...form, service_type: "General Contact" });
      setStatus("success");
      setForm({ customer_name: "", email: "", phone: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-10">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Contact Us</h1>
        <p className="text-gray-600 mb-6">We'd love to hear from you. Reach us directly or send a message.</p>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3"><Phone className="text-primary" /> +250 7XX XXX XXX</div>
          <div className="flex items-center gap-3"><MessageCircle className="text-primary" /> WhatsApp: +250 7XX XXX XXX</div>
          <div className="flex items-center gap-3"><Mail className="text-primary" /> info@murakaza.rw</div>
          <div className="flex items-center gap-3"><MapPin className="text-primary" /> Kigali, Rwanda</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 flex flex-col gap-4 h-fit">
        <input name="customer_name" value={form.customer_name} onChange={handleChange} required
          placeholder="Your Name" className="border rounded-lg px-4 py-2" />
        <input name="email" value={form.email} onChange={handleChange}
          placeholder="Email" className="border rounded-lg px-4 py-2" />
        <input name="phone" value={form.phone} onChange={handleChange} required
          placeholder="Phone Number" className="border rounded-lg px-4 py-2" />
        <textarea name="message" value={form.message} onChange={handleChange} required rows={4}
          placeholder="Your Message" className="border rounded-lg px-4 py-2" />
        <button className="bg-primary text-white rounded-full py-3 font-semibold">Send Message</button>
        {status === "success" && <p className="text-green-600 text-sm">Message sent successfully!</p>}
        {status === "error" && <p className="text-red-600 text-sm">Something went wrong.</p>}
      </form>
    </div>
  );
}