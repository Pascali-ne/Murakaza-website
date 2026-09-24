import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { BookOpen, Printer } from "lucide-react";
import useIdleTimeout from "./hooks/useIdleTimeout.js";

import Home from "./pages/Home.jsx";
import ShopCategory from "./pages/ShopCategory.jsx";
import OtherServices from "./pages/OtherServices.jsx";
import ProductDetails from "./pages/ProductDetails.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import Login from "./pages/Login.jsx";
import { lazy, Suspense } from "react";
import Register from "./pages/Register.jsx";
import Profile from "./pages/Profile.jsx";
import Contact from "./pages/Contact.jsx";
import About from "./pages/About.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import FeedbackModeration from "./pages/FeedbackModeration.jsx";
import CreateStaffAccount from "./pages/CreateStaffAccount.jsx";

const AdminDashboard = lazy(() => import("./pages/AdminDashboard.jsx"));
const CashierDashboard = lazy(() => import("./pages/CashierDashboard.jsx"));
const StoreKeeperDashboard = lazy(() => import("./pages/StoreKeeperDashboard.jsx"));
const ManagerDashboard = lazy(() => import("./pages/ManagerDashboard.jsx"));

export default function App() {
  useIdleTimeout();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/student-supplies" element={<ShopCategory category="student_supplies" title="Student Supplies" icon={<BookOpen />} />} />
          <Route path="/office-equipment" element={<ShopCategory category="office_equipment" title="Office Equipment" icon={<Printer />} />} />
          <Route path="/other-services" element={<OtherServices />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><Suspense fallback={<div className="p-10 text-center text-gray-400">Loading dashboard...</div>}><AdminDashboard /></Suspense></ProtectedRoute>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/admin/feedback" element={<ProtectedRoute roles={["manager", "admin"]}><FeedbackModeration /></ProtectedRoute>} />
          <Route path="/admin/create-staff" element={<ProtectedRoute roles={["admin"]}><CreateStaffAccount /></ProtectedRoute>} />
          <Route path="/cashier" element={<ProtectedRoute roles={["cashier", "manager", "admin"]}><Suspense fallback={<div className="p-10 text-center text-gray-400">Loading dashboard...</div>}><CashierDashboard /></Suspense></ProtectedRoute>} />
          <Route path="/storekeeper" element={<ProtectedRoute roles={["storekeeper", "manager", "admin"]}><Suspense fallback={<div className="p-10 text-center text-gray-400">Loading dashboard...</div>}><StoreKeeperDashboard /></Suspense></ProtectedRoute>} />
          <Route path="/manager" element={<ProtectedRoute roles={["manager", "admin"]}><Suspense fallback={<div className="p-10 text-center text-gray-400">Loading dashboard...</div>}><ManagerDashboard /></Suspense></ProtectedRoute>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}