import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ShoppingCart, Search, Menu, X, User } from "lucide-react";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { items } = useCart();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/student-supplies?search=${encodeURIComponent(search)}`);
  };

  const links = [
    { name: "Home", path: "/" },
    { name: "Student Supplies", path: "/student-supplies" },
    { name: "Office Equipment", path: "/office-equipment" },
    { name: "Other Services", path: "/other-services" },
    { name: "About Us", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <header className="bg-primary text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link to="/" className="text-2xl font-bold tracking-wide">
          MURAKAZA
        </Link>

        <nav className="hidden lg:flex gap-6 font-medium">
          {links.map((l) => (
            <Link key={l.path} to={l.path} className="hover:text-accent transition">
              {l.name}
            </Link>
          ))}
        </nav>

        <form onSubmit={handleSearch} className="hidden md:flex items-center bg-white rounded-full px-3 py-1 flex-1 max-w-sm">
          <Search size={18} className="text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="ml-2 outline-none text-gray-800 w-full text-sm"
          />
        </form>

        <div className="flex items-center gap-4">
          <Link to="/cart" className="relative">
            <ShoppingCart />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-accent text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative group">
              <button className="flex items-center gap-1">
                <User size={20} /> {user.name.split(" ")[0]}
              </button>
              <div className="hidden group-hover:block absolute right-0 mt-2 bg-white text-gray-800 rounded shadow-lg w-40">
                <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100">Profile</Link>
                {user.role === "admin" && (
                  <Link to="/admin" className="block px-4 py-2 hover:bg-gray-100">Admin Dashboard</Link>
                )}
                <button onClick={logout} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="bg-accent px-4 py-1.5 rounded-full text-sm font-semibold">
              Login
            </Link>
          )}

          <button className="lg:hidden" onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden bg-primary-dark px-4 pb-4 flex flex-col gap-2">
          {links.map((l) => (
            <Link key={l.path} to={l.path} onClick={() => setOpen(false)} className="py-2 border-b border-white/10">
              {l.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}