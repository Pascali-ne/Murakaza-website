import { useEffect, useState, useRef } from "react";
import api from "../api/api.js";
import { Link } from "react-router-dom";
import { formatImageUrl, isVideoUrl } from "../utils/imageUrl.js";
import { ChevronLeft, ChevronRight, Pause, Play, ShoppingBag, ArrowRight } from "lucide-react";

export default function ProductShowcase() {
  const [slides, setSlides] = useState([]);
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    Promise.all([
      api.get("/products?category=student_supplies"),
      api.get("/products?category=office_equipment"),
    ])
      .then(([supplies, equipment]) => {
        const suppliesList = Array.isArray(supplies.data) ? supplies.data : [];
        const equipmentList = Array.isArray(equipment.data) ? equipment.data : [];
        const featuredProducts = [...suppliesList, ...equipmentList]
          .filter((p) => p.image_url && p.quantity > 0)
          .slice(0, 6)
          .map((p) => ({
            id: p.product_id,
            title: p.name,
            subtitle: `RWF ${Number(p.price).toLocaleString()} · ${p.quantity} in stock`,
            badge: (p.category || "").replace("_", " ").toUpperCase(),
            url: formatImageUrl(p.image_url),
            isVideo: isVideoUrl(p.image_url),
            link: `/product/${p.product_id}`,
            buttonText: "View Product",
          }));

        // Featured showcase video slide at index 0
        const heroVideoSlide = {
          id: "hero-video",
          title: "Everything You Need for Learning & Work",
          subtitle: "Premium student stationery, modern office machinery, and official electronic services in Rwanda.",
          badge: "Featured Collection",
          url: "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-student-taking-notes-in-a-notebook-42878-large.mp4",
          poster: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1920&q=80",
          isVideo: true,
          link: "/student-supplies",
          buttonText: "Shop Supplies",
        };

        setSlides([heroVideoSlide, ...featuredProducts]);
      })
      .catch(() => {
        setSlides([
          {
            id: "hero-fallback",
            title: "Everything You Need for Learning & Work",
            subtitle: "Rwanda's trusted destination for academic supplies and office machinery.",
            badge: "Welcome to Murakaza",
            url: "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-student-taking-notes-in-a-notebook-42878-large.mp4",
            poster: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1920&q=80",
            isVideo: true,
            link: "/student-supplies",
            buttonText: "Shop Now",
          },
        ]);
      });
  }, []);

  useEffect(() => {
    if (slides.length < 2 || isPaused) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [slides.length, isPaused]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.9;
    }
  }, [index]);

  if (slides.length === 0) {
    return (
      <div className="flex h-[60vh] min-h-[420px] bg-ink items-center justify-center text-gray-400">
        Loading showcase...
      </div>
    );
  }

  const prevSlide = () => {
    setIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setIndex((prev) => (prev + 1) % slides.length);
  };

  return (
    <div
      className="relative h-[68vh] min-h-[480px] sm:min-h-[540px] md:min-h-[580px] max-h-[680px] overflow-hidden bg-ink select-none group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {slides.map((slide, i) => {
        const isActive = i === index;
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            {/* Media: Video or Picture with Proper Fit */}
            {slide.isVideo ? (
              <video
                ref={isActive ? videoRef : null}
                src={slide.url}
                poster={slide.poster}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <img
                src={slide.url}
                alt={slide.title}
                className={`w-full h-full object-cover object-center ${
                  isActive ? "animate-kenburns" : ""
                }`}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src =
                    "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1920&q=80";
                }}
              />
            )}

            {/* Gradient Overlays for High-Contrast Readability & Depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-transparent to-black/30" />

            {/* Slide Content with Staggered Animations */}
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 md:p-14 max-w-7xl mx-auto z-20">
              <div
                className={`max-w-2xl transition-all duration-700 delay-100 ${
                  isActive ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                }`}
              >
                {slide.badge && (
                  <span className="inline-block bg-accent text-ink text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider mb-3 shadow-md">
                    {slide.badge}
                  </span>
                )}
                <h2 className="text-white font-heading font-bold text-2xl sm:text-4xl md:text-5xl leading-tight line-clamp-2 drop-shadow-md">
                  {slide.title}
                </h2>
                <p className="text-white/90 text-sm sm:text-base md:text-lg font-medium mt-2.5 max-w-xl drop-shadow-sm">
                  {slide.subtitle}
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Link
                    to={slide.link}
                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary-light active:bg-primary-dark text-white text-sm sm:text-base font-semibold px-6 py-2.5 sm:py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
                  >
                    <span>{slide.buttonText || "Shop Now"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/other-services"
                    className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-sm font-semibold px-5 py-2.5 sm:py-3 rounded-full border border-white/25 transition-all duration-200"
                  >
                    <span>Irembo & Printing</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-300 active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next slide"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-300 active:scale-95 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Slide Indicators and Play/Pause */}
      <div className="absolute top-5 right-5 z-30 flex items-center gap-2">
        <button
          onClick={() => setIsPaused((p) => !p)}
          className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white/80 hover:text-white backdrop-blur-md border border-white/20 transition-colors cursor-pointer"
          title={isPaused ? "Play slideshow" : "Pause slideshow"}
        >
          {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
        </button>
        <div className="flex gap-1.5 items-center bg-black/40 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/20">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                i === index ? "w-6 bg-accent" : "w-2 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Top Left Direct Category Chip */}
      <Link
        to="/student-supplies"
        className="absolute top-5 left-5 z-30 bg-white/90 hover:bg-white text-ink text-xs font-semibold px-3 py-1.5 rounded-full shadow-md transition-all flex items-center gap-1.5 backdrop-blur-md"
      >
        <ShoppingBag className="w-3.5 h-3.5 text-primary" />
        <span>Browse Catalog</span>
      </Link>
    </div>
  );
}