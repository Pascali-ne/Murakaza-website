import { useState } from "react";
import { Phone, Mail, MessageCircle, MapPin } from "lucide-react";
import api from "../api/api.js";

const phoneNumbers = ["+250799398833", "+250787946965", "+250788286577"];

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
          {phoneNumbers.map((num) => (
            <div key={num} className="flex items-center gap-3">
              <Phone className="text-primary" size={20} />
              <span>{num}</span>
              <a href={`tel:${num}`} className="text-sm text-primary font-semibold ml-2 hover:underline">
                Call
              </a>
              <a
                href={`https://wa.me/${num.replace("+", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-green-600 font-semibold flex items-center gap-1 hover:underline"
              >
                <MessageCircle size={16} /> WhatsApp
              </a>
            </div>
          ))}

          <div className="flex items-center gap-3">
            <Mail className="text-primary" size={20} />
            <a href="mailto:mukamugishapascaline@gmail.com" className="hover:underline">
              mukamugishapascaline@gmail.com
            </a>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="text-primary shrink-0 mt-1" size={20} />
            <span>
              Kigali City, Nyarugenge District, Nyakabanda Sector,<br />
              Munanira II Cell, Gasiza Village, KN193ST
            </span>
          </div>
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