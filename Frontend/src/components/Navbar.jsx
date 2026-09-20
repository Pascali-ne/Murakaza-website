import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ShoppingCart, Search, Menu, X, User, Sun, Moon } from "lucide-react";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher.jsx";

export default function Navbar() {
  const { items } = useCart();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/student-supplies?search=${encodeURIComponent(search)}`);
  };

  const links = [
    { name: t("nav.home"), path: "/" },
    { name: t("nav.studentSupplies"), path: "/student-supplies" },
    { name: t("nav.officeEquipment"), path: "/office-equipment" },
    { name: t("nav.otherServices"), path: "/other-services" },
    { name: t("nav.about"), path: "/about" },
    { name: t("nav.contact"), path: "/contact" },
  ];

  return (
    <header className="bg-primary dark:bg-slate-950 text-white sticky top-0 z-50 shadow-md border-b dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3 xl:gap-5">
        <Link to="/" className="text-2xl font-bold tracking-wide shrink-0">MURAKAZA</Link>

        <nav className="hidden lg:flex items-center gap-3 xl:gap-6 font-medium whitespace-nowrap text-sm xl:text-base">
          {links.map((l) => (
            <Link key={l.path} to={l.path} className="hover:text-accent transition whitespace-nowrap">{l.name}</Link>
          ))}
        </nav>

        <form onSubmit={handleSearch} className="hidden md:flex items-center bg-white dark:bg-slate-800 rounded-full px-3 py-1.5 flex-1 max-w-xs xl:max-w-sm border border-transparent dark:border-slate-700 transition-colors">
          <Search size={18} className="text-gray-500 dark:text-gray-400 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("nav.search")}
            className="ml-2 outline-none text-gray-800 dark:text-white bg-transparent w-full text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </form>

        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <LanguageSwitcher />

          {/* Compact Black or White mode toggle that preserves original nav appearance */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer flex items-center justify-center"
            title={theme === "dark" ? (t("nav.whiteMode") || "White Mode") : (t("nav.blackMode") || "Black Mode")}
            aria-label="Toggle Black or White Mode"
          >
            {theme === "dark" ? (
              <Sun size={20} className="text-yellow-300" />
            ) : (
              <Moon size={20} className="text-slate-200" />
            )}
          </button>

          <Link to="/cart" className="relative p-1 hover:text-accent transition" aria-label="Shopping Cart">
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-accent text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center text-white shadow">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative group" onClick={() => setOpen(!open)}>
              <button className="flex items-center gap-1.5 font-medium"><User size={20} /> {user.name.split(" ")[0]}</button>
              {open && (
                <div className="absolute block right-0 mt-2 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-200 rounded-lg shadow-xl w-44 border dark:border-slate-800 py-1 z-50">
                  <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-800">{t("nav.profile")}</Link>
                  {user.role === "admin" && <Link to="/admin" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-800">{t("nav.admin")}</Link>}
                  {(user.role === "manager" || user.role === "admin") && (
                    <Link to="/manager" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-800">Manager Dashboard</Link>
                  )}
                  {(user.role === "cashier" || user.role === "manager" || user.role === "admin") && (
                    <Link to="/cashier" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-800">Cashier Dashboard</Link>
                  )}
                  {(user.role === "storekeeper" || user.role === "manager" || user.role === "admin") && (
                    <Link to="/storekeeper" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-800">Store Dashboard</Link>
                  )}
                  {(user.role === "manager" || user.role === "admin") && (
                    <Link to="/admin/feedback" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-800">Feedback Moderation</Link>
                  )}
                  {user.role === "admin" && (
                    <Link to="/admin/create-staff" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-800">Create Staff Account</Link>
                  )}
                  <button onClick={logout} className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-800 text-red-600 dark:text-red-400">{t("nav.logout")}</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="bg-accent px-4 py-1.5 rounded-full text-sm font-semibold shadow hover:brightness-105 transition">{t("nav.login")}</Link>
          )}

          <button className="lg:hidden p-1" onClick={() => setOpen(!open)} aria-label="Toggle menu">{open ? <X /> : <Menu />}</button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden bg-primary-dark dark:bg-slate-950 px-4 pb-4 flex flex-col gap-2 border-t dark:border-slate-800">
          {links.map((l) => (
            <Link key={l.path} to={l.path} onClick={() => setOpen(false)} className="py-2 border-b border-white/10">{l.name}</Link>
          ))}
          <div className="pt-2 flex items-center justify-between border-t border-white/10 mt-1">
            <span className="text-xs text-white/70">Theme Mode:</span>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-white"
            >
              {theme === "dark" ? (
                <>
                  <Sun size={14} className="text-yellow-300" />
                  <span>{t("nav.whiteMode")}</span>
                </>
              ) : (
                <>
                  <Moon size={14} className="text-slate-200" />
                  <span>{t("nav.blackMode")}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}