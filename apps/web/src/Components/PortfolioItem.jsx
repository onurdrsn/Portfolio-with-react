import React, { useRef, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { motion, useReducedMotion } from "motion/react";
import { Sparkles, ArrowUpRight } from "lucide-react";

export default function PortfolioItem({
  title,
  imgUrl,
  stack = [],
  link,
  github,
  description,
  category,
  featured,
  onSelect,
}) {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const cardRef = useRef(null);

  // 3D Spatial tilt state (-8deg to +8deg)
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const springPhysics = shouldReduceMotion
    ? { duration: 0.01 }
    : { type: "spring", stiffness: 380, damping: 28, mass: 0.9 };

  const handleMouseMove = useCallback((e) => {
    if (shouldReduceMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculate normalized -1 to +1 coordinates
    const normX = (mouseX / width) * 2 - 1;
    const normY = (mouseY / height) * 2 - 1;

    // Rotate within -8deg to +8deg
    const rX = -normY * 8;
    const rY = normX * 8;

    setRotateX(rX);
    setRotateY(rY);

    // Glare position in percent
    setGlare({
      x: (mouseX / width) * 100,
      y: (mouseY / height) * 100,
      opacity: 0.18,
    });
  }, [shouldReduceMotion]);

  const handleMouseEnter = () => {
    if (shouldReduceMotion) return;
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
    setGlare((prev) => ({ ...prev, opacity: 0 }));
  };

  const getCategoryTranslation = (cat) => {
    const categoryMap = {
      "Full Stack": t("projects.categories.fullStack") || "Full Stack",
      Frontend: t("projects.categories.frontend") || "Frontend",
      "Machine Learning": t("projects.categories.machineLearning") || "Machine Learning",
      AI: t("projects.categories.ai") || "AI & Sinir Ağları",
      "Game Dev": t("projects.categories.gameDev") || "Oyun Geliştirme",
    };
    return categoryMap[cat] || cat;
  };

  return (
    <div className="perspective-1200 h-full w-full">
      <motion.article
        ref={cardRef}
        onClick={() => onSelect && onSelect()}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        animate={
          shouldReduceMotion
            ? {}
            : {
                rotateX,
                rotateY,
                scale: isHovered ? 1.015 : 1,
              }
        }
        transition={springPhysics}
        className="group relative rounded-lg border border-ink-line bg-ink-raised overflow-hidden flex flex-col justify-between hover:border-paper/40 transition-colors cursor-pointer text-paper min-h-[360px] preserve-3d"
        style={{
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        {/* Dynamic Glare Reflection Overlay */}
        {!shouldReduceMotion && (
          <div
            className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-300 rounded-lg"
            style={{
              opacity: glare.opacity,
              background: `radial-gradient(circle 280px at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, 0.2), transparent 70%)`,
            }}
          />
        )}

        {/* Top Media Container: translateZ(0px) to translateZ(15px) */}
        <div
          className="relative aspect-video w-full overflow-hidden bg-ink border-b border-ink-line preserve-3d"
          style={{ transform: "translateZ(0px)" }}
        >
          <img
            src={imgUrl}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.target.src =
                "https://placehold.co/600x400/0a0a0b/ededef?text=" +
                encodeURIComponent(title);
            }}
          />

          {/* Category & Featured Badges: translateZ(35px) */}
          <div
            className="absolute top-3 left-3 flex items-center gap-2 preserve-3d"
            style={{ transform: "translateZ(35px)" }}
          >
            {category && (
              <span className="px-2.5 py-1 text-[11px] font-code font-medium bg-ink/90 backdrop-blur-md text-paper border border-ink-line rounded shadow-sm">
                {getCategoryTranslation(category)}
              </span>
            )}
            {featured && (
              <span className="px-2 py-0.5 text-[10px] font-code font-bold bg-signal text-ink rounded flex items-center gap-1 shadow-sm">
                <Sparkles size={10} />
                <span>{t("projects.featured") || "Öne Çıkan"}</span>
              </span>
            )}
          </div>
        </div>

        {/* Content Section: Title/Text at translateZ(25px), Action/Badges at translateZ(45px) */}
        <div className="p-5 flex-1 flex flex-col justify-between preserve-3d">
          <div
            className="space-y-2 preserve-3d"
            style={{ transform: "translateZ(25px)" }}
          >
            <h3 className="text-base sm:text-lg font-bold text-paper group-hover:text-white transition-colors line-clamp-1 tracking-tight">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-paper-muted leading-relaxed line-clamp-2 font-normal">
              {description}
            </p>
          </div>

          <div
            className="pt-4 mt-2 preserve-3d"
            style={{ transform: "translateZ(45px)" }}
          >
            {/* Tech Stack Badges */}
            {Array.isArray(stack) && stack.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {stack.slice(0, 3).map((item, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 text-[10px] font-code bg-ink text-paper-subtle border border-ink-line rounded"
                  >
                    {item}
                  </span>
                ))}
                {stack.length > 3 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-code text-paper-subtle bg-ink rounded">
                    +{stack.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Bottom Inspect Action */}
            <div className="flex items-center justify-between text-xs font-code text-paper-muted group-hover:text-paper pt-3 border-t border-ink-line transition-colors">
              <span>{t("projects.details") || "Detayları İncele"}</span>
              <ArrowUpRight
                size={14}
                className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
              />
            </div>
          </div>
        </div>
      </motion.article>
    </div>
  );
}