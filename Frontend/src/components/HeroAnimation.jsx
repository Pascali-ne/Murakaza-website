import { useEffect, useState } from "react";
import {
  BookOpen,
  Pencil,
  Ruler,
  Backpack,
  Printer,
  Monitor,
  Briefcase,
  Paperclip,
} from "lucide-react";

// Two "scenes" that the hero animation crossfades between:
// 1) Student Supplies  2) Office Equipment
const SCENES = [
  {
    label: "Student Supplies",
    items: [
      { Icon: BookOpen, style: "top-[8%] left-[12%]", delay: "0s" },
      { Icon: Pencil, style: "top-[55%] left-[6%]", delay: "0.4s" },
      { Icon: Ruler, style: "top-[18%] right-[10%]", delay: "0.8s" },
      { Icon: Backpack, style: "bottom-[10%] right-[18%]", delay: "1.2s" },
    ],
  },
  {
    label: "Office Equipment",
    items: [
      { Icon: Printer, style: "top-[10%] left-[14%]", delay: "0s" },
      { Icon: Monitor, style: "top-[50%] right-[8%]", delay: "0.4s" },
      { Icon: Briefcase, style: "bottom-[12%] left-[10%]", delay: "0.8s" },
      { Icon: Paperclip, style: "top-[20%] right-[24%]", delay: "1.2s" },
    ],
  },
];

export default function HeroAnimation() {
  const [sceneIndex, setSceneIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setSceneIndex((i) => (i + 1) % SCENES.length);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="hidden md:block relative h-72 rounded-2xl overflow-hidden bg-white/10 backdrop-blur-sm">
      {/* soft glowing orbs in the background */}
      <div className="absolute -top-8 -left-8 w-40 h-40 rounded-full bg-accent/20 animate-pulse-slow" />
      <div className="absolute -bottom-10 -right-6 w-48 h-48 rounded-full bg-white/10 animate-pulse-slow [animation-delay:1s]" />

      {SCENES.map((scene, i) => (
        <div
          key={scene.label}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            i === sceneIndex ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {/* Floating icons for this scene */}
          {scene.items.map(({ Icon, style, delay }, idx) => (
            <div
              key={idx}
              className={`absolute ${style} bg-white rounded-2xl shadow-lg p-4 animate-float`}
              style={{ animationDelay: delay }}
            >
              <Icon className="w-8 h-8 text-primary" strokeWidth={2} />
            </div>
          ))}

          {/* Scene label */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <span className="bg-white/90 text-primary font-semibold text-sm px-4 py-1.5 rounded-full shadow">
              {scene.label}
            </span>
          </div>
        </div>
      ))}

      {/* progress dots */}
      <div className="absolute top-4 right-4 flex gap-1.5">
        {SCENES.map((_, i) => (
          <span
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === sceneIndex ? "bg-accent" : "bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}