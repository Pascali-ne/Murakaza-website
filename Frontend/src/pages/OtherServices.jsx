import { useEffect, useState } from "react";
import api from "../api/api.js";
import { Printer, ScanLine, FileImage, Landmark, Package, HeartHandshake, CheckCircle2 } from "lucide-react";
import { formatImageUrl, isVideoUrl } from "../utils/imageUrl.js";

const iconMap = {
  Printer: <Printer size={28} />,
  ScanLine: <ScanLine size={28} />,
  FileImage: <FileImage size={28} />,
  Landmark: <Landmark size={28} />,
  Package: <Package size={28} />,
  HeartHandshake: <HeartHandshake size={28} />,
};

function getServiceIcon(iconName, title = "") {
  if (iconName && iconMap[iconName]) return iconMap[iconName];
  const lower = (title || "").toLowerCase();
  if (lower.includes("print") || lower.includes("scan") || lower.includes("copy")) return <Printer size={28} />;
  if (lower.includes("laminat") || lower.includes("bind")) return <ScanLine size={28} />;
  if (lower.includes("photo") || lower.includes("banner") || lower.includes("cv")) return <FileImage size={28} />;
  if (lower.includes("irembo") || lower.includes("rdb") || lower.includes("rra")) return <Landmark size={28} />;
  if (lower.includes("wholesale") || lower.includes("supply")) return <Package size={28} />;
  return <HeartHandshake size={28} />;
}

const defaultServices = [
  {
    service_id: 1,
    title: "Printing, Photocopy & Scanning",
    description: "High-speed document printing, photocopy, and sharp digital scanning.",
    image_url: "",
    icon: "Printer",
    price: 50,
  },
  {
    service_id: 2,
    title: "Laminating & Spiral Binding",
    description: "Protect and bind your reports, booklets, and files cleanly.",
    image_url: "",
    icon: "ScanLine",
    price: 500,
  },
  {
    service_id: 3,
    title: "Passport Photo, CV & Banner Printing",
    description: "Professional passport photos, CV typesetting, and vibrant banner printing.",
    image_url: "",
    icon: "FileImage",
    price: 1000,
  },
  {
    service_id: 4,
    title: "Irembo Services,RDB,RURA,RRA",
    description: "Fast assistance with official e-government declarations and certifications.",
    image_url: "",
    icon: "Landmark",
    price: 1000,
  },
  {
    service_id: 5,
    title: "Wholesale Products",
    description: "Bulk supplies and institutional orders at competitive wholesale prices.",
    image_url: "",
    icon: "Package",
    price: 0,
  },
  {
    service_id: 6,
    title: "General Business Support",
    description: "Official typing, document formatting, translation support, and guidance.",
    image_url: "",
    icon: "HeartHandshake",
    price: 0,
  },
];

export default function OtherServices() {
  const [services, setServices] = useState(defaultServices);
  const [form, setForm] = useState({ customer_name: "", email: "", phone: "", service_type: "", message: "" });
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get("/services")
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setServices(res.data);
        }
      })
      .catch((err) => {
        console.warn("Using default services:", err.message);
      });
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus("");
    try {
      await api.post("/services/request", form);
      setStatus("success");
      setForm({ customer_name: "", email: "", phone: "", service_type: "", message: "" });
    } catch {
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2 transition-colors">
        Our Professional Services
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-2xl text-sm transition-colors">
        MURAKAZA also offers these extra support services. Click any service card to select it or fill the form below and our team will contact you promptly.
      </p>

      <div className="grid md:grid-cols-2 gap-10 items-start">
        {/* Services Cards Grid with Picture display */}
        <div className="grid sm:grid-cols-2 gap-4">
          {services.map((s, i) => (
            <div
              key={s.service_id || i}
              onClick={() => setForm((prev) => ({ ...prev, service_type: s.title }))}
              className={`group bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md border transition-all cursor-pointer overflow-hidden flex flex-col ${
                form.service_type === s.title
                  ? "border-primary dark:border-accent ring-2 ring-primary/20 dark:ring-accent/20"
                  : "border-gray-100 dark:border-slate-700"
              }`}
            >
              {/* Picture / Video or Fallback Icon */}
              {s.image_url ? (
                <div className="h-32 w-full relative overflow-hidden bg-slate-100 dark:bg-slate-700">
                  {isVideoUrl(s.image_url) ? (
                    <video
                      src={formatImageUrl(s.image_url)}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <img
                      src={formatImageUrl(s.image_url)}
                      alt={s.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-50 group-hover:opacity-30 transition-opacity" />
                </div>
              ) : (
                <div className="h-20 w-full flex items-center justify-center bg-primary/5 dark:bg-primary/20 text-primary dark:text-accent border-b border-gray-100 dark:border-slate-700/50">
                  {getServiceIcon(s.icon, s.title)}
                </div>
              )}

              <div className="p-4 flex flex-col flex-1 justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 group-hover:text-primary dark:group-hover:text-accent transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                    {s.description || "High-quality professional service tailored to your requirements."}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-gray-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
                  {Number(s.price) > 0 ? (
                    <span className="font-semibold text-accent">From RWF {Number(s.price).toLocaleString()}</span>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500">Upon Request</span>
                  )}
                  <span className="text-primary dark:text-accent font-semibold group-hover:translate-x-0.5 transition-transform">
                    {form.service_type === s.title ? "✓ Selected" : "Select →"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Request Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 flex flex-col gap-4 border border-gray-100 dark:border-slate-700 transition-colors sticky top-24">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Request a Service</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Fill out your details and we will get back to you with a free consultation and quote.
            </p>
          </div>

          <input
            name="customer_name"
            value={form.customer_name}
            onChange={handleChange}
            required
            placeholder="Full Name"
            className="border dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-white rounded-lg px-4 py-2.5 text-sm"
          />

          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
            placeholder="Phone Number (e.g. 078...)"
            className="border dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-white rounded-lg px-4 py-2.5 text-sm"
          />

          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email (optional)"
            className="border dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-white rounded-lg px-4 py-2.5 text-sm"
          />

          <select
            name="service_type"
            value={form.service_type}
            onChange={handleChange}
            required
            className="border dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-white rounded-lg px-4 py-2.5 text-sm"
          >
            <option value="">Select a service</option>
            {services.map((s, i) => (
              <option key={s.service_id || i} value={s.title}>
                {s.title}
              </option>
            ))}
          </select>

          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Tell us more about what you need (e.g. quantity, specific deadlines, paper specifications...)"
            rows={4}
            className="border dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-white rounded-lg px-4 py-2.5 text-sm"
          />

          <button
            disabled={submitting}
            className="bg-primary hover:bg-primary-light text-white rounded-full py-3 font-semibold shadow hover:brightness-105 transition disabled:opacity-50 cursor-pointer"
          >
            {submitting ? "Sending Request..." : "Submit Request"}
          </button>

          {status === "success" && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 p-3 rounded-lg text-sm border border-green-200 dark:border-green-800">
              <CheckCircle2 size={18} />
              <span>Request sent successfully! Our team will contact you soon.</span>
            </div>
          )}
          {status === "error" && (
            <p className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-950/30 p-3 rounded-lg border border-red-200 dark:border-red-800">
              Something went wrong. Please try again or call us directly.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}