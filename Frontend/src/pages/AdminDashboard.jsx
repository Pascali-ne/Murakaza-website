import { useEffect, useState } from "react";
import api from "../api/api.js";
import { formatImageUrl, isVideoUrl } from "../utils/imageUrl.js";
import { fileToDataUrl } from "../utils/imageCompressor.js";

const emptyProduct = { name: "", category: "student_supplies", price: "", quantity: "", description: "", image_url: "" };
const emptyService = { title: "", description: "", image_url: "", icon: "Printer", price: "" };

export default function AdminDashboard() {
  const [tab, setTab] = useState("overview");
  const [summary, setSummary] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [services, setServices] = useState([]);
  const [form, setForm] = useState(emptyProduct);
  const [serviceForm, setServiceForm] = useState(emptyService);
  const [editingId, setEditingId] = useState(null);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [serviceUploading, setServiceUploading] = useState(false);
  const [serviceUploadError, setServiceUploadError] = useState("");

  const loadProducts = (search = "") => {
    api.get("/products", { params: search ? { search } : {} }).then((res) => setProducts(res.data));
  };

  const loadServices = () => {
    api.get("/services").then((res) => setServices(res.data)).catch(() => {});
  };

  const loadAll = () => {
    api.get("/users/report/summary").then((res) => setSummary(res.data));
    loadProducts(searchTerm);
    loadServices();
    api.get("/orders").then((res) => setOrders(res.data));
  };

  useEffect(() => { loadAll(); }, []);

  // Debounce the admin product search so it doesn't fire on every keystroke
  useEffect(() => {
    const timeout = setTimeout(() => loadProducts(searchTerm), 300);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleServiceChange = (e) => setServiceForm({ ...serviceForm, [e.target.name]: e.target.value });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadError("");
    setUploading(true);
    try {
      // Compress and convert to Base64 data URL so image is stored directly in PostgreSQL
      // and will NEVER be lost across Git commits or Render redeploys!
      const dataUrl = await fileToDataUrl(file);
      setForm((f) => ({ ...f, image_url: dataUrl }));
    } catch (err) {
      setUploadError("Image processing failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleServiceImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setServiceUploadError("");
    setServiceUploading(true);
    try {
      // Compress and convert to Base64 data URL so image is stored directly in PostgreSQL
      const dataUrl = await fileToDataUrl(file);
      setServiceForm((f) => ({ ...f, image_url: dataUrl }));
    } catch (err) {
      setServiceUploadError("Service image processing failed: " + err.message);
    } finally {
      setServiceUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await api.put(`/products/${editingId}`, form);
    } else {
      await api.post("/products", form);
    }
    setForm(emptyProduct);
    setEditingId(null);
    setUploadError("");
    loadAll();
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingServiceId) {
        await api.put(`/services/${editingServiceId}`, serviceForm);
      } else {
        await api.post("/services", serviceForm);
      }
      setServiceForm(emptyService);
      setEditingServiceId(null);
      setServiceUploadError("");
      loadServices();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save service");
    }
  };

  const handleEdit = (p) => {
    setForm(p);
    setEditingId(p.product_id);
    setUploadError("");
    setTab("products");
  };

  const handleServiceEdit = (s) => {
    setServiceForm({
      title: s.title || "",
      description: s.description || "",
      image_url: s.image_url || "",
      icon: s.icon || "Printer",
      price: s.price || "",
    });
    setEditingServiceId(s.service_id);
    setServiceUploadError("");
    setTab("services");
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this product?")) {
      await api.delete(`/products/${id}`);
      loadAll();
    }
  };

  const handleServiceDelete = async (id) => {
    if (confirm("Delete this service?")) {
      await api.delete(`/services/${id}`);
      loadServices();
    }
  };

  const handleStatusChange = async (id, order_status) => {
    await api.put(`/orders/${id}/status`, { order_status });
    loadAll();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 transition-colors">Admin Dashboard</h1>

      <div className="flex gap-4 mb-8 border-b dark:border-slate-800">
        {["overview", "products", "services", "orders"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 px-2 font-semibold capitalize transition-colors ${
              tab === t
                ? "border-b-2 border-primary dark:border-accent text-primary dark:text-accent"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            {t === "services" ? "Services & Pictures" : t}
          </button>
        ))}
      </div>

      {tab === "overview" && summary && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 border dark:border-slate-700 transition-colors">
            <p className="text-gray-500 dark:text-gray-400 text-sm">Total Customers</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{summary.total_customers}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 border dark:border-slate-700 transition-colors">
            <p className="text-gray-500 dark:text-gray-400 text-sm">Total Orders</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{summary.total_orders}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 border dark:border-slate-700 transition-colors">
            <p className="text-gray-500 dark:text-gray-400 text-sm">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">RWF {Number(summary.total_revenue).toLocaleString()}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 col-span-2 md:col-span-3 border dark:border-slate-700 transition-colors">
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">Low Stock Products (below 10)</p>
            {summary.low_stock_products.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500">All products are well stocked.</p>
            ) : (
              <ul className="text-sm text-gray-700 dark:text-gray-300 list-disc pl-5">
                {summary.low_stock_products.map((p, i) => (
                  <li key={i}>{p.name} — {p.quantity} left</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {tab === "products" && (
        <div className="grid md:grid-cols-2 gap-8">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 flex flex-col gap-3 h-fit border dark:border-slate-700 transition-colors">
            <h2 className="font-bold text-gray-800 dark:text-gray-100">{editingId ? "Edit Product" : "Add New Product"}</h2>
            <input name="name" value={form.name} onChange={handleChange} required placeholder="Product Name" className="border dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-white rounded-lg px-4 py-2" />
            <select name="category" value={form.category} onChange={handleChange} className="border dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-white rounded-lg px-4 py-2">
              <option value="student_supplies">Student Supplies</option>
              <option value="office_equipment">Office Equipment</option>
              <option value="other_services">Other Services</option>
            </select>
            <input name="price" type="number" value={form.price} onChange={handleChange} required placeholder="Price (RWF)" className="border dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-white rounded-lg px-4 py-2" />
            <input name="quantity" type="number" value={form.quantity} onChange={handleChange} required placeholder="Stock Quantity" className="border dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-white rounded-lg px-4 py-2" />

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Product Media (Photo or Video)</label>
              <div className="flex items-center gap-3">
                {form.image_url ? (
                  isVideoUrl(form.image_url) ? (
                    <video
                      src={formatImageUrl(form.image_url)}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-16 h-16 object-cover rounded-lg border dark:border-slate-700"
                    />
                  ) : (
                    <img
                      src={formatImageUrl(form.image_url)}
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded-lg border dark:border-slate-700"
                    />
                  )
                ) : (
                  <div className="w-16 h-16 rounded-lg border border-dashed dark:border-slate-700 flex items-center justify-center text-gray-400 text-xs text-center px-1">
                    No image
                  </div>
                )}
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="border dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 text-center transition-colors">
                    {uploading ? "Processing..." : "📷 Choose photo from computer (Permanent)"}
                    <input type="file" accept="image/*,video/*" onChange={handleImageUpload} disabled={uploading} className="hidden" />
                  </label>
                  <input
                    name="image_url"
                    value={form.image_url}
                    onChange={handleChange}
                    placeholder="Or paste permanent image link (https://...)"
                    className="border dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-white rounded-lg px-3 py-1 text-xs"
                  />
                </div>
              </div>
              {uploadError && <p className="text-sm text-red-500 mt-1">{uploadError}</p>}
            </div>

            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" rows={3} className="border dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-white rounded-lg px-4 py-2" />
            <div className="flex gap-2">
              <button disabled={uploading} className="bg-primary text-white rounded-full py-2 px-6 font-semibold disabled:opacity-50">
                {editingId ? "Update Product" : "Add Product"}
              </button>
              {editingId && (
                <button type="button" onClick={() => { setForm(emptyProduct); setEditingId(null); setUploadError(""); }} className="text-gray-500 dark:text-gray-400">
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="flex flex-col gap-3">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products by name..."
              className="border dark:border-slate-700 rounded-lg px-4 py-2 bg-white dark:bg-slate-900 text-gray-800 dark:text-white"
            />
            <div className="flex flex-col gap-3 max-h-[550px] overflow-y-auto">
              {products.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No products found.</p>
              ) : (
                products.map((p) => (
                  <div key={p.product_id} className="bg-white dark:bg-slate-800 rounded-xl shadow p-4 flex justify-between items-center gap-3 border dark:border-slate-700 transition-colors">
                    <div className="flex items-center gap-3">
                      {p.image_url && (
                        isVideoUrl(p.image_url) ? (
                          <video
                            src={formatImageUrl(p.image_url)}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-12 h-12 object-cover rounded-lg border dark:border-slate-700"
                          />
                        ) : (
                          <img
                            src={formatImageUrl(p.image_url)}
                            alt={p.name}
                            className="w-12 h-12 object-cover rounded-lg border dark:border-slate-700"
                          />
                        )
                      )}
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-100">{p.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">RWF {Number(p.price).toLocaleString()} · {p.quantity} in stock</p>
                      </div>
                    </div>
                    <div className="flex gap-2 text-sm shrink-0">
                      <button onClick={() => handleEdit(p)} className="text-primary dark:text-accent font-semibold">Edit</button>
                      <button onClick={() => handleDelete(p.product_id)} className="text-red-500 font-semibold">Delete</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Services & Pictures Management Tab */}
      {tab === "services" && (
        <div className="grid md:grid-cols-2 gap-8">
          {/* Service Edit / Add Form */}
          <form onSubmit={handleServiceSubmit} className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 flex flex-col gap-3 h-fit border dark:border-slate-700 transition-colors">
            <div>
              <h2 className="font-bold text-gray-800 dark:text-gray-100 text-lg">
                {editingServiceId ? "Edit Service & Picture" : "Add Service & Picture"}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Manage pictures and details shown on the <span className="text-primary dark:text-accent font-medium">/other-services</span> page.
              </p>
            </div>

            <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Service Title</label>
            <input
              name="title"
              value={serviceForm.title}
              onChange={handleServiceChange}
              required
              placeholder="e.g. Printing, Photocopy & Scanning"
              className="border dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-white rounded-lg px-4 py-2 text-sm"
            />

            <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Description</label>
            <textarea
              name="description"
              value={serviceForm.description}
              onChange={handleServiceChange}
              placeholder="Brief description of the service"
              rows={3}
              className="border dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-white rounded-lg px-4 py-2 text-sm"
            />

            <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Starting Price / Rate (RWF, optional)</label>
            <input
              name="price"
              type="number"
              value={serviceForm.price}
              onChange={handleServiceChange}
              placeholder="0"
              className="border dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-white rounded-lg px-4 py-2 text-sm"
            />

            {/* Picture Upload Area */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Service Picture (Upload or Paste Link)
              </label>
              <div className="flex items-center gap-3">
                {serviceForm.image_url ? (
                  isVideoUrl(serviceForm.image_url) ? (
                    <video
                      src={formatImageUrl(serviceForm.image_url)}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-16 h-16 object-cover rounded-lg border dark:border-slate-700 shadow-sm"
                    />
                  ) : (
                    <img
                      src={formatImageUrl(serviceForm.image_url)}
                      alt="Service Preview"
                      className="w-16 h-16 object-cover rounded-lg border dark:border-slate-700 shadow-sm"
                    />
                  )
                ) : (
                  <div className="w-16 h-16 rounded-lg border border-dashed dark:border-slate-700 flex items-center justify-center text-gray-400 text-xs text-center px-1">
                    No picture
                  </div>
                )}

                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="border dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 text-center transition-colors">
                    {serviceUploading ? "Uploading picture..." : "📷 Upload Picture from Computer"}
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleServiceImageUpload}
                      disabled={serviceUploading}
                      className="hidden"
                    />
                  </label>
                  <input
                    name="image_url"
                    value={serviceForm.image_url}
                    onChange={handleServiceChange}
                    placeholder="Or paste direct image URL"
                    className="border dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-white rounded-lg px-3 py-1 text-xs"
                  />
                </div>
              </div>
              {serviceUploadError && <p className="text-xs text-red-500 mt-1">{serviceUploadError}</p>}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={serviceUploading}
                className="bg-primary text-white rounded-full py-2 px-6 font-semibold text-sm disabled:opacity-50 hover:brightness-105 transition"
              >
                {editingServiceId ? "Update Service Picture" : "Save Service"}
              </button>
              {editingServiceId && (
                <button
                  type="button"
                  onClick={() => {
                    setServiceForm(emptyService);
                    setEditingServiceId(null);
                    setServiceUploadError("");
                  }}
                  className="text-gray-500 dark:text-gray-400 text-sm hover:underline"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* Existing Services List */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-800 dark:text-gray-100">
                Active Services ({services.length})
              </h3>
              <span className="text-xs text-gray-400">Click Edit to change picture</span>
            </div>

            <div className="flex flex-col gap-3 max-h-[580px] overflow-y-auto pr-1">
              {services.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No services found.</p>
              ) : (
                services.map((s) => (
                  <div
                    key={s.service_id}
                    className="bg-white dark:bg-slate-800 rounded-xl shadow p-4 flex justify-between items-center gap-3 border dark:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {s.image_url ? (
                        isVideoUrl(s.image_url) ? (
                          <video
                            src={formatImageUrl(s.image_url)}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-14 h-14 object-cover rounded-lg border dark:border-slate-700 shrink-0 shadow-sm"
                          />
                        ) : (
                          <img
                            src={formatImageUrl(s.image_url)}
                            alt={s.title}
                            className="w-14 h-14 object-cover rounded-lg border dark:border-slate-700 shrink-0 shadow-sm"
                          />
                        )
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-primary/10 dark:bg-primary/20 text-primary dark:text-accent flex items-center justify-center shrink-0 font-bold text-lg border border-primary/20">
                          {s.title ? s.title.charAt(0) : "S"}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm truncate">{s.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">{s.description || "No description provided."}</p>
                        {Number(s.price) > 0 && (
                          <span className="inline-block text-xs font-semibold text-accent mt-1">
                            From RWF {Number(s.price).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 text-xs shrink-0">
                      <button
                        type="button"
                        onClick={() => handleServiceEdit(s)}
                        className="px-3 py-1 rounded bg-primary/10 hover:bg-primary/20 text-primary dark:text-accent dark:bg-accent/10 dark:hover:bg-accent/20 font-semibold transition"
                      >
                        Edit Picture
                      </button>
                      <button
                        type="button"
                        onClick={() => handleServiceDelete(s.service_id)}
                        className="text-red-500 hover:text-red-700 text-center text-xs py-0.5"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {tab === "orders" && (
        <div className="flex flex-col gap-3">
          {orders.map((o) => (
            <div key={o.order_id} className="bg-white dark:bg-slate-800 rounded-xl shadow p-4 flex flex-wrap justify-between items-center gap-3 border dark:border-slate-700 transition-colors">
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-100">Order #{o.order_id} — {o.customer_name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{o.phone} · RWF {Number(o.total_price).toLocaleString()}</p>
              </div>
              <select
                value={o.order_status}
                onChange={(e) => handleStatusChange(o.order_id, e.target.value)}
                className="border dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-white rounded-lg px-3 py-2 text-sm"
              >
                {["pending", "confirmed", "processing", "delivered", "cancelled"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}