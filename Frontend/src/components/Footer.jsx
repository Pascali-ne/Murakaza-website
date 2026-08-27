import { Link } from "react-router-dom";
import { Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-primary-dark text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-xl font-bold mb-3">MURAKAZA</h3>
          <p className="text-sm text-gray-300">
            Your one-stop shop for student supplies and office equipment.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Shop</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><Link to="/student-supplies">Student Supplies</Link></li>
            <li><Link to="/office-equipment">Office Equipment</Link></li>
            <li><Link to="/other-services">Other Services</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Company</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Contact</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-center gap-2"><Phone size={16} /> +250 7XX XXX XXX</li>
            <li className="flex items-center gap-2"><Mail size={16} /> info@murakaza.rw</li>
            <li className="flex items-center gap-2"><MapPin size={16} /> Kigali, Rwanda</li>
          </ul>
        </div>
      </div>
      <div className="text-center text-xs text-gray-400 py-4 border-t border-white/10">
        © {new Date().getFullYear()} MURAKAZA. All rights reserved.
      </div>
    </footer>
  );
}