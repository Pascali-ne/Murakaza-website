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
            <li className="flex items-center gap-2"><Phone size={16} /> +250 799 398 833</li>
            <li className="flex items-center gap-2"><Phone size={16} /> +250 787 946 965</li>
            <li className="flex items-center gap-2"><Phone size={16} /> +250 788 286 577</li>
            <li className="flex items-center gap-2"><Mail size={16} /> mukamugishapascaline@gmail.com</li>
            <li className="flex items-start gap-2"><MapPin size={16} className="shrink-0 mt-1" /> Kigali, Nyarugenge, Nyakabanda, Munanira II, Gasiza Village</li>
          </ul>
        </div>
      </div>
      <div className="text-center text-xs text-gray-400 py-4 border-t border-white/10">
        © {new Date().getFullYear()} MURAKAZA. All rights reserved.
      </div>
    </footer>
  );
}