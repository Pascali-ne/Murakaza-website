import { useState } from "react";
import api from "../api/api.js";
import { Printer, ScanLine, FileImage, Landmark, Package, HeartHandshake } from "lucide-react";

const services = [
  { icon: <Printer />, name: "Printing, Photocopy & Scanning" },
  { icon: <ScanLine />, name: "Laminating & Spiral Binding" },
  { icon: <FileImage />, name: "Passport Photo, CV & Banner Printing" },
  { icon: <Landmark />, name: "Irembo Services,RDB,RURA,RRA" },
  { icon: <Package />, name: "Wholesale Products" },
  { icon: <HeartHandshake />, name: "General Business Support" },
];

export default function OtherServices() {
  const [form, setForm] = useState({ customer_name: "", email: "", phone: "", service_type: "", message: "" });
  const [status, setStatus] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/services/request", form);
      setStatus("success");
      setForm({ customer_name: "", email: "", phone: "", service_type: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Other Services</h1>
      <p className="text-gray-500 mb-8 max-w-2xl">
        MURAKAZA also offers these extra support services. Fill the form below and our team will contact you.
      </p>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="grid grid-cols-2 gap-4">
          {services.map((s, i) => (
            <div key={i} className="bg-white rounded-xl shadow p-5 flex flex-col items-center text-center gap-3">
              <div className="text-primary">{s.icon}</div>
              <p className="text-sm font-medium text-gray-700">{s.name}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 flex flex-col gap-4 h-fit">
          <h2 className="text-xl font-bold text-gray-800">Request a Service</h2>
          <input name="customer_name" value={form.customer_name} onChange={handleChange} required
            placeholder="Full Name" className="border rounded-lg px-4 py-2" />
          <input name="phone" value={form.phone} onChange={handleChange} required
            placeholder="Phone Number" className="border rounded-lg px-4 py-2" />
          <input name="email" value={form.email} onChange={handleChange}
            placeholder="Email (optional)" className="border rounded-lg px-4 py-2" />
          <select name="service_type" value={form.service_type} onChange={handleChange} required
            className="border rounded-lg px-4 py-2">
            <option value="">Select a service</option>
            {services.map((s, i) => <option key={i} value={s.name}>{s.name}</option>)}
          </select>
          <textarea name="message" value={form.message} onChange={handleChange}
            placeholder="Tell us more about what you need" rows={4} className="border rounded-lg px-4 py-2" />
          <button className="bg-primary text-white rounded-full py-3 font-semibold">Submit Request</button>
          {status === "success" && <p className="text-green-600 text-sm">Request sent! We'll contact you soon.</p>}
          {status === "error" && <p className="text-red-600 text-sm">Something went wrong. Try again.</p>}
        </form>
      </div>
    </div>
  );
}