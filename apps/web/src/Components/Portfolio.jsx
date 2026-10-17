import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { apiGet } from "../lib/api";
import PortfolioItem from "./PortfolioItem";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Layers,
  ExternalLink,
  Github,
  X as XIcon,
  ArrowUpRight,
  RefreshCw,
  FolderOpen,
  Sparkles,
} from "lucide-react";

// Zero-CLS Shimmer Skeleton Component
function PortfolioSkeleton({ viewMode }) {
  if (viewMode === "deck") {
    return (
      <div className="rounded-lg border border-ink-line bg-ink-raised p-6 sm:p-8 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 aspect-video bg-ink rounded border border-ink-line relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent" />
          </div>
          <div className="lg:col-span-5 space-y-4">
            <div className="h-4 w-24 bg-ink rounded" />
            <div className="h-8 w-3/4 bg-ink rounded" />
            <div className="h-4 w-full bg-ink rounded" />
            <div className="h-4 w-5/6 bg-ink rounded" />
            <div className="flex gap-2 pt-2">
              <div className="h-6 w-16 bg-ink rounded" />
              <div className="h-6 w-20 bg-ink rounded" />
            </div>
            <div className="flex gap-3 pt-4">
              <div className="h-10 w-28 bg-ink rounded" />
              <div className="h-10 w-20 bg-ink rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((idx) => (
        <div
          key={idx}
          className="rounded-lg border border-ink-line bg-ink-raised min-h-[360px] p-5 flex flex-col justify-between animate-pulse"
        >
          <div className="space-y-4">
            <div className="aspect-video w-full bg-ink rounded border border-ink-line relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            </div>
            <div className="h-5 w-3/4 bg-ink rounded" />
            <div className="h-3 w-full bg-ink rounded" />
            <div className="h-3 w-2/3 bg-ink rounded" />
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-ink-line">
            <div className="h-4 w-16 bg-ink rounded" />
            <div className="h-6 w-14 bg-ink rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Portfolio() {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();

  const [portfolioData, setPortfolioData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & view states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState("deck"); // 'deck' or 'grid'
  const [deckIndex, setDeckIndex] = useState(0);
  const [selectedProject, setSelectedProject] = useState(null);

  // Spotlight 3D tilt state
  const spotlightRef = useRef(null);
  const [spotlightRotateX, setSpotlightRotateX] = useState(0);
  const [spotlightRotateY, setSpotlightRotateY] = useState(0);
  const [spotlightGlare, setSpotlightGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const [spotlightHovered, setSpotlightHovered] = useState(false);

  const handleSpotlightMouseMove = useCallback((e) => {
    if (shouldReduceMotion || !spotlightRef.current) return;
    const rect = spotlightRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const normX = (mouseX / rect.width) * 2 - 1;
    const normY = (mouseY / rect.height) * 2 - 1;

    setSpotlightRotateX(-normY * 6);
    setSpotlightRotateY(normX * 6);
    setSpotlightGlare({
      x: (mouseX / rect.width) * 100,
      y: (mouseY / rect.height) * 100,
      opacity: 0.15,
    });
  }, [shouldReduceMotion]);

  const handleSpotlightMouseEnter = () => {
    if (shouldReduceMotion) return;
    setSpotlightHovered(true);
  };

  const handleSpotlightMouseLeave = () => {
    setSpotlightHovered(false);
    setSpotlightRotateX(0);
    setSpotlightRotateY(0);
    setSpotlightGlare((prev) => ({ ...prev, opacity: 0 }));
  };

  // Touch swipe support for mobile
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  const springTransition = shouldReduceMotion
    ? { duration: 0.01 }
    : { type: "spring", stiffness: 380, damping: 28, mass: 0.9 };

  const fetchPortfolio = useCallback(() => {
    setLoading(true);
    setError(null);
    apiGet("/api/portfolio", { silent: true })
      .then((data) => {
        setPortfolioData(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Error fetching portfolio:", err);
        setError("Projeler yüklenirken bir bağlantı hatası oluştu.");
        setPortfolioData([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  // Modal ESC & Scroll Lock (WCAG 2.1)
  useEffect(() => {
    if (!selectedProject) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedProject(null);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedProject]);

  // Categories
  const categories = ["All", "Full Stack", "Machine Learning", "Frontend", "Game Dev", "AI"];

  const getCategoryLabel = (cat) => {
    if (cat === "All") return t("projects.categories.all") || "Tümü";
    if (cat === "Full Stack") return t("projects.categories.fullStack") || "Full Stack";
    if (cat === "Frontend") return t("projects.categories.frontend") || "Frontend";
    if (cat === "Machine Learning") return t("projects.categories.machineLearning") || "Makine Öğrenmesi";
    if (cat === "AI") return t("projects.categories.ai") || "Yapay Zeka";
    if (cat === "Game Dev") return t("projects.categories.gameDev") || "Oyun Geliştirme";
    return cat;
  };

  // Only public home projects
  const homeVisibleProjects = useMemo(() => {
    return portfolioData.filter((p) => p.showOnHome !== false);
  }, [portfolioData]);

  // Featured projects for Spotlight Deck
  const featuredProjects = useMemo(() => {
    const featured = homeVisibleProjects.filter((p) => p.featured);
    return featured.length > 0 ? featured : homeVisibleProjects.slice(0, 6);
  }, [homeVisibleProjects]);

  // Filtered projects for Grid Mode
  const filteredProjects = useMemo(() => {
    return homeVisibleProjects.filter((project) => {
      const matchesCategory =
        selectedCategory === "All" ||
        (project.category &&
          project.category.toLowerCase() === selectedCategory.toLowerCase());

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        project.title.toLowerCase().includes(query) ||
        (project.description && project.description.toLowerCase().includes(query)) ||
        (Array.isArray(project.stack) &&
          project.stack.some((s) => s.toLowerCase().includes(query)));

      return matchesCategory && matchesSearch;
    });
  }, [homeVisibleProjects, selectedCategory, searchQuery]);

  // Touch swipe handlers
  const handleTouchStart = (e) => {
    if (!e.touches || e.touches.length === 0) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const currentTouch = e.changedTouches ? e.changedTouches[0] : null;
    if (!currentTouch) return;
    const deltaX = touchStartX.current - currentTouch.clientX;
    const deltaY = touchStartY.current - currentTouch.clientY;

    if (
      Math.abs(deltaX) > Math.abs(deltaY) &&
      Math.abs(deltaX) > 40 &&
      featuredProjects.length > 0
    ) {
      if (deltaX > 0) {
        setDeckIndex((prev) => (prev + 1) % featuredProjects.length);
      } else {
        setDeckIndex(
          (prev) => (prev - 1 + featuredProjects.length) % featuredProjects.length
        );
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const activeDeckProject = featuredProjects[deckIndex % (featuredProjects.length || 1)];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-paper" id="projects">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-6 border-b border-ink-line">
        <div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-paper">
            {t("projects.title") || "Seçilmiş"} {t("projects.titleHighlight") || "Projeler"}
          </h2>
        </div>
        <p className="text-sm sm:text-base text-paper-muted max-w-md font-normal leading-relaxed">
          {t("projects.subtitle") ||
            "Dağıtık mimariler, sunucusuz Cloudflare servisleri ve gerçek zamanlı sistemler."}
        </p>
      </div>

      {/* Control Bar: Search, Category Filters, View Switch */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between mb-10">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-paper-subtle pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("projects.searchPlaceholder") || "Proje veya teknoloji ara..."}
            className="w-full pl-10 pr-4 py-2 bg-ink-raised border border-ink-line rounded-md text-xs sm:text-sm text-paper placeholder-paper-subtle focus:border-paper focus:outline-none transition-colors"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-1.5 items-center">
          {categories.map((cat) => (
            <motion.button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              whileHover={shouldReduceMotion ? undefined : { scale: 1.015 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
              transition={springTransition}
              className={`px-3 py-1.5 rounded text-xs font-code transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? "bg-paper text-ink font-semibold"
                  : "bg-ink-raised text-paper-muted hover:text-paper hover:bg-ink-hover border border-ink-line"
              }`}
            >
              {getCategoryLabel(cat)}
            </motion.button>
          ))}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 border border-ink-line bg-ink-raised p-1 rounded-md self-start lg:self-auto">
          <button
            type="button"
            onClick={() => setViewMode("deck")}
            aria-pressed={viewMode === "deck"}
            className={`px-3 py-1.5 text-xs font-code rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
              viewMode === "deck"
                ? "bg-paper text-ink font-semibold"
                : "text-paper-muted hover:text-paper"
            }`}
          >
            <Layers size={13} />
            <span>Spotlight</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            aria-pressed={viewMode === "grid"}
            className={`px-3 py-1.5 text-xs font-code rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
              viewMode === "grid"
                ? "bg-paper text-ink font-semibold"
                : "text-paper-muted hover:text-paper"
            }`}
          >
            <LayoutGrid size={13} />
            <span>Bento Grid</span>
          </button>
        </div>
      </div>

      {/* Main Content Area with AnimatePresence & Zero CLS */}
      <AnimatePresence mode="popLayout">
        {loading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <PortfolioSkeleton viewMode={viewMode} />
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, transform: "translateY(8px)" }}
            animate={{ opacity: 1, transform: "translateY(0)" }}
            exit={{ opacity: 0 }}
            className="rounded-lg border border-danger/30 bg-ink-raised p-8 text-center space-y-4"
          >
            <p className="text-sm font-code text-danger">{error}</p>
            <button
              type="button"
              onClick={fetchPortfolio}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-ink border border-ink-line text-xs font-code text-paper hover:bg-ink-hover transition-colors cursor-pointer"
            >
              <RefreshCw size={13} />
              <span>Yeniden Dene / Retry</span>
            </button>
          </motion.div>
        ) : viewMode === "deck" && activeDeckProject ? (
          /* SPOTLIGHT DECK VIEW */
          <motion.div
            key="deck"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={springTransition}
            className="perspective-1200 w-full"
          >
            <motion.div
              ref={spotlightRef}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onMouseMove={handleSpotlightMouseMove}
              onMouseEnter={handleSpotlightMouseEnter}
              onMouseLeave={handleSpotlightMouseLeave}
              animate={
                shouldReduceMotion
                  ? {}
                  : {
                      rotateX: spotlightRotateX,
                      rotateY: spotlightRotateY,
                      scale: spotlightHovered ? 1.01 : 1,
                    }
              }
              transition={springTransition}
              style={{
                touchAction: "pan-y",
                transformStyle: "preserve-3d",
                willChange: "transform",
              }}
              className="group relative rounded-lg border border-ink-line bg-ink-raised p-6 sm:p-8 hover:border-paper/40 transition-colors preserve-3d"
            >
              {/* Dynamic Glare Reflection Overlay */}
              {!shouldReduceMotion && (
                <div
                  className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-300 rounded-lg"
                  style={{
                    opacity: spotlightGlare.opacity,
                    background: `radial-gradient(circle 380px at ${spotlightGlare.x}% ${spotlightGlare.y}%, rgba(255, 255, 255, 0.16), transparent 70%)`,
                  }}
                />
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center preserve-3d">
                {/* Media Preview Box: translateZ(20px) */}
                <div
                  onClick={() => setSelectedProject(activeDeckProject)}
                  className="lg:col-span-7 relative aspect-video bg-ink rounded border border-ink-line overflow-hidden group/media cursor-pointer preserve-3d"
                  style={{ transform: "translateZ(20px)" }}
                >
                  <img
                    src={activeDeckProject.imgUrl}
                    alt={activeDeckProject.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/media:scale-105"
                    onError={(e) => {
                      e.target.src =
                        "https://placehold.co/600x400/0a0a0b/ededef?text=" +
                        encodeURIComponent(activeDeckProject.title);
                    }}
                  />
                  <div className="absolute inset-0 bg-ink/30 opacity-0 group-hover/media:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-3.5 py-1.5 rounded-full bg-paper text-ink font-code text-xs font-bold shadow-lg">
                      İncele / Inspect
                    </span>
                  </div>
                </div>

                {/* Details Section: translateZ(35px) */}
                <div
                  className="lg:col-span-5 space-y-4 preserve-3d"
                  style={{ transform: "translateZ(35px)" }}
                >
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 text-[11px] font-code bg-ink border border-ink-line text-signal rounded">
                      {getCategoryLabel(activeDeckProject.category)}
                    </span>
                    {activeDeckProject.featured && (
                      <span className="px-2 py-0.5 text-[10px] font-code bg-signal text-ink rounded font-bold">
                        Öne Çıkan
                      </span>
                    )}
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-paper">
                    {activeDeckProject.title}
                  </h3>

                  <p className="text-sm text-paper-muted leading-relaxed font-normal">
                    {activeDeckProject.description}
                  </p>

                  {/* Tech stack */}
                  {Array.isArray(activeDeckProject.stack) &&
                    activeDeckProject.stack.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {activeDeckProject.stack.map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-0.5 text-[11px] font-code bg-ink border border-ink-line text-paper-subtle rounded"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}

                  {/* Action row: translateZ(45px) */}
                  <div
                    className="flex flex-wrap gap-3 pt-4 preserve-3d"
                    style={{ transform: "translateZ(10px)" }}
                  >
                    <motion.button
                      type="button"
                      onClick={() => setSelectedProject(activeDeckProject)}
                      whileHover={shouldReduceMotion ? undefined : { scale: 1.015 }}
                      whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
                      transition={springTransition}
                      className="px-5 py-2.5 rounded bg-paper text-ink text-xs font-semibold hover:bg-white transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <span>{t("projects.details") || "Detaylar"}</span>
                      <ArrowUpRight size={14} />
                    </motion.button>

                    {activeDeckProject.link && activeDeckProject.link !== "#" && (
                      <a
                        href={activeDeckProject.link}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2.5 rounded border border-ink-line bg-ink text-paper text-xs font-medium hover:bg-ink-hover transition-colors inline-flex items-center gap-1.5"
                      >
                        <ExternalLink size={14} />
                        <span>Canlı Demo</span>
                      </a>
                    )}

                    {activeDeckProject.github && (
                      <a
                        href={activeDeckProject.github}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded border border-ink-line bg-ink text-paper-muted hover:text-paper hover:bg-ink-hover transition-colors"
                        title="GitHub"
                      >
                        <Github size={15} />
                      </a>
                    )}
                  </div>

                  {/* Deck Carousel Navigator */}
                  <div className="flex items-center justify-between pt-6 border-t border-ink-line mt-6">
                    <div className="flex items-center gap-1.5">
                      {featuredProjects.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setDeckIndex(idx)}
                          aria-label={`Slide ${idx + 1}`}
                          className={`h-1.5 rounded-full transition-all cursor-pointer ${
                            idx === deckIndex % featuredProjects.length
                              ? "w-6 bg-paper"
                              : "w-2 bg-ink-line-strong hover:bg-paper-subtle"
                          }`}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setDeckIndex(
                            (prev) =>
                              (prev - 1 + featuredProjects.length) %
                              featuredProjects.length
                          )
                        }
                        aria-label="Previous Slide"
                        className="p-2 rounded border border-ink-line bg-ink text-paper hover:bg-ink-hover transition-colors cursor-pointer"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setDeckIndex((prev) => (prev + 1) % featuredProjects.length)
                        }
                        aria-label="Next Slide"
                        className="p-2 rounded border border-ink-line bg-ink text-paper hover:bg-ink-hover transition-colors cursor-pointer"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : filteredProjects.length === 0 ? (
          /* EMPTY STATE */
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-lg border border-ink-line bg-ink-raised p-12 text-center space-y-4"
          >
            <FolderOpen size={36} className="mx-auto text-paper-subtle" />
            <h3 className="text-base font-bold text-paper">
              Kriterlere uygun proje bulunamadı
            </h3>
            <p className="text-xs text-paper-muted max-w-sm mx-auto">
              Seçilen kategori veya arama terimi ile eşleşen proje kaydı mevcut değil.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="px-4 py-2 rounded bg-ink border border-ink-line text-xs font-code text-paper hover:bg-ink-hover transition-colors cursor-pointer"
            >
              Filtreleri Temizle / Reset
            </button>
          </motion.div>
        ) : (
          /* BENTO GRID VIEW */
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={springTransition}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 perspective-1200 preserve-3d"
          >
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id || index}
                initial={{ opacity: 0, transform: "translateY(12px)" }}
                animate={{ opacity: 1, transform: "translateY(0)" }}
                transition={{
                  ...springTransition,
                  delay: shouldReduceMotion ? 0 : index * 0.04,
                }}
                className="preserve-3d h-full"
              >
                <PortfolioItem
                  title={project.title}
                  imgUrl={project.imgUrl}
                  stack={project.stack}
                  link={project.link}
                  github={project.github}
                  description={project.description}
                  category={project.category}
                  featured={project.featured}
                  onSelect={() => setSelectedProject(project)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ACCESSIBLE PROJECT DETAILS MODAL */}
      {selectedProject &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] w-screen h-screen bg-black/80 backdrop-blur-sm p-4 flex items-center justify-center animate-fadeIn"
            onClick={() => setSelectedProject(null)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title-v1"
          >
            <div
              className="relative w-full max-w-2xl bg-ink-raised border border-ink-line rounded-lg p-6 sm:p-8 flex flex-col max-h-[90vh] overflow-y-auto shadow-2xl text-paper"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="font-code text-xs text-signal uppercase tracking-wider">
                    {getCategoryLabel(selectedProject.category)}
                  </span>
                  <h2
                    id="modal-title-v1"
                    className="text-2xl sm:text-3xl font-bold text-paper mt-1 tracking-tight"
                  >
                    {selectedProject.title}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedProject(null)}
                  aria-label="Kapat / Close"
                  className="p-2 rounded border border-ink-line bg-ink text-paper-muted hover:text-paper hover:bg-ink-hover transition-colors cursor-pointer"
                >
                  <XIcon size={18} />
                </button>
              </div>

              <div className="rounded-md overflow-hidden aspect-video mb-6 border border-ink-line bg-ink">
                <img
                  src={selectedProject.imgUrl}
                  alt={selectedProject.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-4 mb-6">
                <p className="text-paper-muted text-sm sm:text-base leading-relaxed font-normal">
                  {selectedProject.description}
                </p>

                {Array.isArray(selectedProject.stack) &&
                  selectedProject.stack.length > 0 && (
                    <div>
                      <h4 className="font-code text-xs text-paper-subtle uppercase tracking-wider mb-2">
                        Kullanılan Teknolojiler
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProject.stack.map((tech) => (
                          <span
                            key={tech}
                            className="px-2.5 py-1 text-xs font-code bg-ink border border-ink-line text-paper-muted rounded"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              <div className="flex flex-wrap gap-3 pt-4 border-t border-ink-line">
                {selectedProject.link && selectedProject.link !== "#" && (
                  <a
                    href={selectedProject.link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 text-center py-2.5 px-4 rounded bg-paper text-ink font-semibold text-xs hover:bg-white transition-colors"
                  >
                    Canlı Önizleme / Live
                  </a>
                )}
                {selectedProject.github && (
                  <a
                    href={selectedProject.github}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 px-4 rounded border border-ink-line bg-ink text-paper text-xs font-medium hover:bg-ink-hover transition-colors flex items-center gap-1.5"
                  >
                    <Github size={15} />
                    <span>Kaynak Kod</span>
                  </a>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </section>
  );
}
