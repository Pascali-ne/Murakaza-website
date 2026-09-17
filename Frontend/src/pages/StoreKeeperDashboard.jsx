import { useEffect, useState } from "react";
import api from "../api/api.js";

const emptyProduct = { name: "", category: "student_supplies", price: "", quantity: "", description: "", image_url: "" };

export default function StoreKeeperDashboard() {
  const [tab, setTab] = useState("stock");
  const [stock, setStock] = useState(null);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const loadProducts = (search = "") => {
    api.get("/products", { params: search ? { search } : {} }).then((res) => setProducts(res.data));
  };

  const loadAll = () => {
    api.get("/products/low-stock").then((res) => setStock(res.data)).catch(() => setStock(null));
    loadProducts(searchTerm);
  };

  useEffect(() => { loadAll(); }, []);

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
  };

  const handleDelete = async (id) => {
    if (!confirm("Remove this product from stock?")) return;
    try {
      await api.delete(`/products/${id}`);
      loadAll();
    } catch (err) {
      setError(err.response?.data?.message || "Could not remove product");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Storekeeper Dashboard</h1>
      <p className="text-gray-500 mb-6">Verify stock levels, and add or remove products.</p>

      <div className="flex gap-4 mb-8 border-b">
        {["stock", "products"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 px-2 font-semibold capitalize ${tab === t ? "border-b-2 border-primary text-primary" : "text-gray-500"}`}
          >
            {t === "stock" ? "Stock verification" : "Add / remove products"}
          </button>
        ))}
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {tab === "stock" && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-500 text-sm">Total Products</p>
            <p className="text-2xl font-bold text-gray-800">{stock?.total_products ?? "—"}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-500 text-sm">Total Units in Stock</p>
            <p className="text-2xl font-bold text-gray-800">{stock?.total_units ?? "—"}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-500 text-sm">Low Stock Items</p>
            <p className="text-2xl font-bold text-gray-800">{stock?.low_stock_products?.length ?? "—"}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 col-span-2 md:col-span-3">
            <p className="text-gray-500 text-sm mb-2">Products below 10 in stock — verify and restock</p>
            {!stock || stock.low_stock_products.length === 0 ? (
              <p className="text-sm text-gray-400">All products are well stocked.</p>
            ) : (
              <ul className="text-sm text-gray-700 divide-y">
                {stock.low_stock_products.map((p) => (
                  <li key={p.product_id} className="flex justify-between py-2">
                    <span>{p.name}</span>
                    <span className={p.quantity === 0 ? "text-red-600 font-semibold" : "text-yellow-700 font-semibold"}>
                      {p.quantity} left
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {tab === "products" && (
        <div className="grid md:grid-cols-2 gap-8">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 flex flex-col gap-3 h-fit">
            <h2 className="font-bold text-gray-800">{editingId ? "Edit Product" : "Add New Product"}</h2>
            <input name="name" value={form.name} onChange={handleChange} required placeholder="Product Name" className="border rounded-lg px-4 py-2" />
            <select name="category" value={form.category} onChange={handleChange} className="border rounded-lg px-4 py-2">
              <option value="student_supplies">Student Supplies</option>
              <option value="office_equipment">Office Equipment</option>
              <option value="other_services">Other Services</option>
            </select>
            <input name="price" type="number" value={form.price} onChange={handleChange} required placeholder="Price (RWF)" className="border rounded-lg px-4 py-2" />
            <input name="quantity" type="number" value={form.quantity} onChange={handleChange} required placeholder="Stock Quantity" className="border rounded-lg px-4 py-2" />

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Product Image</label>
              <div className="flex items-center gap-3">
                {form.image_url && <img src={form.image_url} alt="Preview" className="w-16 h-16 object-cover rounded-lg border" />}
                <label className="border rounded-lg px-4 py-2 text-sm text-gray-600 cursor-pointer hover:bg-gray-50 flex-1 text-center">
                  {uploading ? "Uploading..." : form.image_url ? "Change photo" : "Upload photo"}
                  <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="hidden" />
                </label>
              </div>
            </div>

            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" rows={3} className="border rounded-lg px-4 py-2" />
            <div className="flex gap-2">
              <button disabled={uploading} className="bg-primary text-white rounded-full py-2 px-6 font-semibold disabled:opacity-50">
                {editingId ? "Update Product" : "Add Product"}
              </button>
              {editingId && (
                <button type="button" onClick={() => { setForm(emptyProduct); setEditingId(null); setError(""); }} className="text-gray-500">
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
              className="border rounded-lg px-4 py-2 bg-white"
            />
            <div className="flex flex-col gap-3 max-h-[550px] overflow-y-auto">
              {products.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No products found.</p>
              ) : (
                products.map((p) => (
                  <div key={p.product_id} className="bg-white rounded-xl shadow p-4 flex justify-between items-center gap-3">
                    <div className="flex items-center gap-3">
                      {p.image_url && <img src={p.image_url} alt={p.name} className="w-12 h-12 object-cover rounded-lg border" />}
                      <div>
                        <p className="font-semibold text-gray-800">{p.name}</p>
                        <p className="text-sm text-gray-500">RWF {Number(p.price).toLocaleString()} · {p.quantity} in stock</p>
                      </div>
                    </div>
                    <div className="flex gap-2 text-sm shrink-0">
                      <button onClick={() => handleEdit(p)} className="text-primary font-semibold">Edit</button>
                      <button onClick={() => handleDelete(p.product_id)} className="text-red-500 font-semibold">Remove</button>
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