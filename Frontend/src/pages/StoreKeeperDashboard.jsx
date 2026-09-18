import { useEffect, useState } from "react";
import api from "../api/api.js";
import { Package, AlertTriangle, Boxes, Plus, Edit2, Trash2, Search, Upload, RefreshCw, CheckCircle2, Link as LinkIcon, Image as ImageIcon } from "lucide-react";
import { formatImageUrl } from "../utils/imageUrl.js";

const emptyProduct = {
  name: "",
  category: "student_supplies",
  price: "",
  quantity: "",
  description: "",
  image_url: "",
};

export default function StoreKeeperDashboard() {
  const [tab, setTab] = useState("stock");
  const [stock, setStock] = useState(null);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageMode, setImageMode] = useState("file"); // "file" | "url"

  const loadProducts = (search = "") => {
    api
      .get("/products", { params: search ? { search } : {} })
      .then((res) => setProducts(Array.isArray(res.data) ? res.data : []));
  };

  const loadAll = () => {
    setLoading(true);
    api
      .get("/products/low-stock")
      .then((res) => setStock(res.data))
      .catch(() => setStock(null));
    loadProducts(searchTerm);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => loadProducts(searchTerm), 300);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const data = new FormData();
      data.append("image", file);
      const res = await api.post("/products/upload-image", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((f) => ({ ...f, image_url: res.data.url }));
    } catch (err) {
      setError(err.response?.data?.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, form);
      } else {
        await api.post("/products", form);
      }
      setForm(emptyProduct);
      setEditingId(null);
      loadAll();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save product");
    }
  };

  const handleEdit = (p) => {
    setForm(p);
    setEditingId(p.product_id);
    setError("");
    setTab("products");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to remove this product from inventory?")) return;
    try {
      await api.delete(`/products/${id}`);
      loadAll();
    } catch (err) {
      setError(err.response?.data?.message || "Could not remove product");
    }
  };

  const lowStockCount = stock?.low_stock_products?.length ?? 0;
  const outOfStockCount = (stock?.low_stock_products || []).filter((p) => p.quantity === 0).length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 tracking-tight">
            Inventory &amp; Store Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time catalog stock control, restock threshold monitoring, and product catalog updates
          </p>
        </div>
        <button
          onClick={loadAll}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4 text-primary" />
          <span>Refresh Stock</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Catalog Items</span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-heading text-slate-900 mt-2">{stock?.total_products ?? products.length}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">Active SKUs</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Total Units</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-heading text-slate-900 mt-2">{stock?.total_units ?? "—"}</p>
          <p className="text-xs text-emerald-600 font-medium mt-1">On-shelf stock</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Low Stock (&lt;10)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-heading text-slate-900 mt-2">{lowStockCount}</p>
          <p className="text-xs text-amber-600 font-medium mt-1">Needs reorder soon</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Out of Stock</span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-heading text-slate-900 mt-2">{outOfStockCount}</p>
          <p className="text-xs text-rose-600 font-medium mt-1">0 units remaining</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 mb-8">
        <button
          onClick={() => setTab("stock")}
          className={`pb-3 px-4 font-semibold text-sm transition-all border-b-2 cursor-pointer ${
            tab === "stock"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Stock Health &amp; Verification
        </button>
        <button
          onClick={() => setTab("products")}
          className={`pb-3 px-4 font-semibold text-sm transition-all border-b-2 cursor-pointer ${
            tab === "products"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          {editingId ? "Edit Product" : "Catalog & Add Products"}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* TAB 1: STOCK HEALTH */}
      {tab === "stock" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold font-heading text-slate-900">
                  Critical Stock Alerts (Under 10 Units)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Automated re-order trigger list. Verify warehouse physical count before restocking.
                </p>
              </div>
            </div>

            {!stock || stock.low_stock_products.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">All products are healthy</p>
                <p className="text-xs text-slate-400 mt-0.5">No products are currently under the 10-unit warning threshold.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Product</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Price (RWF)</th>
                      <th className="py-3 px-4">Remaining Units</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-sm">
                    {stock.low_stock_products.map((p) => {
                      const isZero = p.quantity === 0;
                      return (
                        <tr key={p.product_id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-slate-800 flex items-center gap-3">
                            {p.image_url ? (
                              <img
                                src={formatImageUrl(p.image_url)}
                                alt={p.name}
                                className="w-10 h-10 object-cover rounded-lg border border-slate-100"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = "https://placehold.co/100x100?text=Item";
                                }}
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                                <Package className="w-5 h-5" />
                              </div>
                            )}
                            <span>{p.name}</span>
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-500 capitalize">
                            {(p.category || "").replace("_", " ")}
                          </td>
                          <td className="py-3.5 px-4 font-medium text-slate-700">
                            RWF {Number(p.price).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            {p.quantity}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                                isZero
                                  ? "bg-rose-50 text-rose-700 border-rose-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}
                            >
                              {isZero ? "Out of Stock" : "Low Stock"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleEdit(p)}
                              className="text-xs font-bold text-primary hover:text-primary-dark cursor-pointer inline-flex items-center gap-1"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>Restock</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS & MANAGEMENT */}
      {tab === "products" && (
        <div className="grid lg:grid-cols-5 gap-8 items-start">
          {/* Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h2 className="text-base font-bold font-heading text-slate-900 mb-4 flex items-center gap-2">
              {editingId ? <Edit2 className="w-4 h-4 text-primary" /> : <Plus className="w-4 h-4 text-primary" />}
              <span>{editingId ? "Update Product" : "Add New SKU"}</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Product Title</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Oxford Mathematical Set"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="student_supplies">Student Supplies</option>
                  <option value="office_equipment">Office Equipment</option>
                  <option value="other_services">Other Services</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Unit Price (RWF)</label>
                  <input
                    name="price"
                    type="number"
                    value={form.price}
                    onChange={handleChange}
                    required
                    placeholder="2500"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Stock Quantity</label>
                  <input
                    name="quantity"
                    type="number"
                    value={form.quantity}
                    onChange={handleChange}
                    required
                    placeholder="50"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-600">Product Photo</label>
                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px]">
                    <button
                      type="button"
                      onClick={() => setImageMode("file")}
                      className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                        imageMode === "file" ? "bg-white text-primary shadow-xs font-bold" : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageMode("url")}
                      className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                        imageMode === "url" ? "bg-white text-primary shadow-xs font-bold" : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      Image URL
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    {form.image_url ? (
                      <div className="relative group shrink-0">
                        <img
                          src={formatImageUrl(form.image_url)}
                          alt="Preview"
                          className="w-14 h-14 object-cover rounded-xl border border-slate-200"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "https://placehold.co/100x100?text=Invalid";
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, image_url: "" }))}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs cursor-pointer"
                          title="Remove image"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 shrink-0">
                        <Package className="w-6 h-6" />
                      </div>
                    )}

                    {imageMode === "file" ? (
                      <label className="flex-1 border border-dashed border-slate-300 rounded-xl p-3 text-center cursor-pointer hover:bg-slate-50 transition-colors">
                        <Upload className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                        <span className="text-xs font-semibold text-slate-600">
                          {uploading ? "Uploading..." : form.image_url ? "Change file" : "Choose file from device"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploading}
                          className="hidden"
                        />
                      </label>
                    ) : (
                      <div className="flex-1">
                        <input
                          name="image_url"
                          value={form.image_url}
                          onChange={handleChange}
                          placeholder="Paste image URL (https://...)"
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Provide product details, specs, or warranty information..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 py-3 px-4 bg-primary hover:bg-primary-light active:bg-primary-dark text-white rounded-xl font-bold text-xs shadow-md transition-all disabled:opacity-60 cursor-pointer"
                >
                  {editingId ? "Update Product" : "Publish to Catalog"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setForm(emptyProduct);
                      setEditingId(null);
                      setError("");
                    }}
                    className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Product Directory */}
          <div className="lg:col-span-3 space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products by title or keyword..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
              />
            </div>

            <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
              {products.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
                  <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">No products found matching your search.</p>
                </div>
              ) : (
                products.map((p) => (
                  <div
                    key={p.product_id}
                    className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      {p.image_url ? (
                        <img
                          src={formatImageUrl(p.image_url)}
                          alt={p.name}
                          className="w-12 h-12 object-cover rounded-xl border border-slate-100 shrink-0"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "https://placehold.co/100x100?text=Item";
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                          <Package className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1">{p.name}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                          <span className="font-semibold text-slate-800">
                            RWF {Number(p.price).toLocaleString()}
                          </span>
                          <span>·</span>
                          <span
                            className={`font-semibold ${
                              p.quantity === 0
                                ? "text-rose-600"
                                : p.quantity < 10
                                ? "text-amber-600"
                                : "text-emerald-600"
                            }`}
                          >
                            {p.quantity} in stock
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleEdit(p)}
                        className="p-2 hover:bg-slate-100 text-primary rounded-lg transition-colors cursor-pointer"
                        title="Edit product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.product_id)}
                        className="p-2 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors cursor-pointer"
                        title="Remove product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}