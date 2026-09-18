import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Printer, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ProductShowcase() {
  const { t } = useTranslation();
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.85;
    }
  }, []);

  return (
    <div className="relative min-h-[580px] lg:min-h-[640px] flex items-center overflow-hidden bg-slate-950 text-white">
      {/* Background Video */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        onCanPlay={() => setVideoLoaded(true)}
        poster="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1920&q=80"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
          videoLoaded ? "opacity-45" : "opacity-30"
        }`}
      >
        <source
          src="https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-student-taking-notes-in-a-notebook-42878-large.mp4"
          type="video/mp4"
        />
      </video>

      {/* Modern Gradient Overlays for Readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40" />

      {/* Floating Ambient Glow */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-80 h-80 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content Container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 z-10 w-full">
        <div className="max-w-2xl lg:max-w-3xl">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold uppercase tracking-wider text-accent mb-6 shadow-sm">
            <Sparkles className="w-4 h-4" />
            <span>Rwanda's Trusted Academic & Business Partner</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-heading tracking-tight leading-tight text-white mb-6">
            Everything You Need for <span className="text-accent">Learning</span> &amp; <span className="text-primary-light">Work</span>.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed mb-8 max-w-xl">
            From essential student stationery and modern office machinery to high-speed printing, photocopying, and official Irembo electronic services.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap gap-4 items-center">
            <Link
              to="/student-supplies"
              className="inline-flex items-center gap-2.5 bg-accent hover:bg-amber-400 active:bg-amber-500 text-slate-950 px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
            >
              <BookOpen className="w-5 h-5" />
              <span>{t("home.shopSupplies")}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/office-equipment"
              className="inline-flex items-center gap-2.5 bg-white/15 hover:bg-white/25 active:bg-white/30 backdrop-blur-md text-white border border-white/20 px-6 py-3.5 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 cursor-pointer"
            >
              <Printer className="w-5 h-5" />
              <span>{t("home.shopEquipment")}</span>
            </Link>

            <Link
              to="/other-services"
              className="inline-flex items-center gap-2 text-slate-300 hover:text-white text-sm font-medium px-4 py-2 hover:underline transition-colors"
            >
              <span>Irembo &amp; Printing Services →</span>
            </Link>
          </div>

          {/* Feature Highlights Ticker */}
          <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Instant MoMo &amp; Tigo</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Fast Nationwide Delivery</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Direct IremboPay Support</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>100% Quality Guaranteed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}