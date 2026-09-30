import React, { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { apiGet } from "../../lib/api";
import {
  Search,
  Sparkles,
  Layers,
  LayoutGrid,
  ExternalLink,
  Github,
  ChevronLeft,
  ChevronRight,
  X as XIcon,
  Code2,
  ArrowRight,
  SlidersHorizontal,
} from "lucide-react";

export default function V4Portfolio() {
  const { t } = useTranslation();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState("deck"); // 'deck' or 'grid'
  const [deckIndex, setDeckIndex] = useState(0);
  const [selectedProject, setSelectedProject] = useState(null);

  // Touch Swipe for mobile
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

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

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 40 && featuredProjects.length > 0) {
      if (deltaX > 0) {
        setDeckIndex((prev) => (prev + 1) % featuredProjects.length);
      } else {
        setDeckIndex((prev) => (prev - 1 + featuredProjects.length) % featuredProjects.length);
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    apiGet("/api/portfolio", { silent: true })
      .then((data) => {
        if (isMounted) {
          setProjects(Array.isArray(data) ? data : []);
        }
      })
      .catch(() => {
        if (isMounted) setProjects([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const categoryConfigs = [
    { key: "all", filterVal: "All", labelKey: "v4.portfolio.categories.all" },
    { key: "fullStack", filterVal: "Full Stack", labelKey: "v4.portfolio.categories.fullStack" },
    { key: "ml", filterVal: "Machine Learning", labelKey: "v4.portfolio.categories.ml" },
    { key: "frontend", filterVal: "Frontend", labelKey: "v4.portfolio.categories.frontend" },
    { key: "gameDev", filterVal: "Game Dev", labelKey: "v4.portfolio.categories.gameDev" },
    { key: "ai", filterVal: "AI", labelKey: "v4.portfolio.categories.ai" },
  ];

  const getCategoryLabel = (cat) => {
    const found = categoryConfigs.find((c) => c.filterVal.toLowerCase() === (cat || "").toLowerCase());
    return found ? t(found.labelKey) : cat;
  };

  // Filter only projects that are marked to be shown on home
  const visibleProjects = useMemo(() => {
    return projects.filter((p) => p.showOnHome !== false);
  }, [projects]);

  // Featured projects for the Spotlight Deck
  const featuredProjects = useMemo(() => {
    const featured = visibleProjects.filter((p) => p.featured);
    return featured.length > 0 ? featured : visibleProjects.slice(0, 6);
  }, [visibleProjects]);

  // Filtered projects based on Category & Search Query
  const filteredProjects = useMemo(() => {
    return visibleProjects.filter((item) => {
      const matchesCat = selectedCategory === "All" || item.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        (item.title && item.title.toLowerCase().includes(query)) ||
        (item.description && item.description.toLowerCase().includes(query)) ||
        (Array.isArray(item.stack) && item.stack.some((s) => s.toLowerCase().includes(query)));
      return matchesCat && matchesSearch;
    });
  }, [visibleProjects, selectedCategory, searchQuery]);

  const activeItem = featuredProjects[deckIndex] || featuredProjects[0];

  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative scroll-mt-20" id="projects">
      {/* Background Ambient Radial Auras */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-violet-600/10 via-purple-600/10 to-cyan-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-bold uppercase tracking-widest mb-3 backdrop-blur-md shadow-[0_0_15px_rgba(139,92,246,0.15)]">
          <Sparkles size={13} className="text-amber-400 animate-pulse" />
          <span>{t("v4.portfolio.badge")}</span>
        </div>
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight">
          {t("v4.portfolio.title")}{" "}
          <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
            {t("v4.portfolio.titleHighlight")}
          </span>
        </h2>
        <p className="text-gray-300 text-sm sm:text-base max-w-xl mx-auto mt-3 font-normal leading-relaxed">
          {t("v4.portfolio.description")}
        </p>
      </div>

      {/* Control Bar: Search + Category + View Switcher */}
      <div className="relative bg-gray-950/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-4 sm:p-5 mb-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/15 before:to-transparent">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("v4.portfolio.searchPlaceholder")}
            className="w-full bg-white/[0.04] border border-white/10 rounded-2xl pl-11 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder-gray-400 focus:outline-none focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/20 backdrop-blur-md transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              title={t("v4.portfolio.clearSearch")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <XIcon size={14} />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 w-full md:w-auto">
          {categoryConfigs.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.filterVal)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                selectedCategory === cat.filterVal
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-900/50 border border-violet-400/50 scale-[1.02]"
                  : "bg-white/[0.04] text-gray-300 hover:text-white hover:bg-white/[0.08] border border-white/10"
              }`}
            >
              {t(cat.labelKey)}
            </button>
          ))}
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-2xl border border-white/10 backdrop-blur-md">
          <button
            onClick={() => setViewMode("deck")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === "deck"
                ? "bg-violet-600/40 text-violet-200 border border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.3)] backdrop-blur-md"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Layers size={14} className="text-violet-400" />
            <span>{t("v4.portfolio.views.spotlight")}</span>
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === "grid"
                ? "bg-violet-600/40 text-violet-200 border border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.3)] backdrop-blur-md"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <LayoutGrid size={14} className="text-violet-400" />
            <span>{t("v4.portfolio.views.grid")}</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: SPOTLIGHT 3D DECK (Touch-Swipe Enabled with Morphism) */}
      {viewMode === "deck" && activeItem && (
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: "pan-y" }}
          className="relative mb-16 bg-gradient-to-br from-violet-950/40 via-gray-950/80 to-purple-950/40 backdrop-blur-2xl border border-white/10 hover:border-violet-500/40 rounded-3xl p-6 sm:p-10 shadow-[0_12px_48px_0_rgba(139,92,246,0.18)] overflow-hidden group select-none transition-all duration-500 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-violet-400/40 before:to-transparent"
        >
          {/* Ambient Corner Lighting */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Shimmer Light Reflection Sweep */}
          <div className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />

          <div
            key={activeItem.id || deckIndex}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-fadeIn relative z-10"
          >
            {/* Project Image Preview */}
            <div
              className="lg:col-span-7 relative group/img overflow-hidden rounded-2xl border border-white/10 aspect-video bg-gray-950 shadow-2xl cursor-pointer"
              onClick={() => setSelectedProject(activeItem)}
            >
              <img
                src={activeItem.imgUrl}
                alt={activeItem.title}
                className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-700 ease-out"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://placehold.co/800x450/0f172a/8b5cf6?text=" +
                    encodeURIComponent(activeItem.title || "Project");
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/20 to-transparent opacity-80 group-hover/img:opacity-50 transition-opacity" />
              <div className="absolute top-4 left-4 bg-violet-600/90 text-white text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-lg border border-violet-400/30 flex items-center gap-1.5 backdrop-blur-md">
                <Sparkles size={12} className="text-amber-300" />
                <span>{t("v4.portfolio.featuredBadge")}</span>
              </div>
            </div>

            {/* Project Info & Controls */}
            <div className="lg:col-span-5 flex flex-col justify-between h-full">
              <div>
                <span className="inline-block px-3.5 py-1 rounded-full bg-violet-500/15 text-violet-300 text-xs font-bold border border-violet-500/30 mb-3 backdrop-blur-md shadow-sm">
                  {getCategoryLabel(activeItem.category)}
                </span>
                <h3 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight tracking-tight">
                  {activeItem.title}
                </h3>
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                  {activeItem.description}
                </p>

                {/* Tech Stack Chips */}
                {Array.isArray(activeItem.stack) && activeItem.stack.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-8">
                    {activeItem.stack.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] text-violet-200 border border-white/10 rounded-xl backdrop-blur-md transition-colors"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons & Deck Controls */}
              <div>
                <div className="flex flex-wrap gap-3 mb-6">
                  <button
                    onClick={() => setSelectedProject(activeItem)}
                    className="flex-1 px-5 py-3.5 bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-bold text-sm rounded-xl transition-all duration-300 shadow-lg shadow-violet-900/40 hover:shadow-violet-600/30 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 cursor-pointer border border-violet-400/30"
                  >
                    <span>{t("v4.portfolio.inspectDetails")}</span>
                    <ArrowRight size={16} />
                  </button>
                  {activeItem.link && activeItem.link !== "#" && (
                    <a
                      href={activeItem.link}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-3.5 bg-white/[0.05] hover:bg-white/[0.1] text-gray-200 font-semibold text-sm rounded-xl border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2 backdrop-blur-md"
                    >
                      <ExternalLink size={16} />
                      <span>{t("v4.portfolio.demo")}</span>
                    </a>
                  )}
                  {activeItem.github && (
                    <a
                      href={activeItem.github}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-3.5 bg-white/[0.05] hover:bg-white/[0.1] text-gray-200 font-semibold text-sm rounded-xl border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2 backdrop-blur-md"
                    >
                      <Github size={16} />
                      <span>{t("v4.portfolio.github")}</span>
                    </a>
                  )}
                </div>

                {/* Slider Indicators & Swipe Hint */}
                <div className="flex items-center justify-between border-t border-white/10 pt-4">
                  <div className="flex items-center gap-1.5">
                    {featuredProjects.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setDeckIndex(idx)}
                        aria-label={`Slide ${idx + 1}`}
                        className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                          idx === deckIndex
                            ? "w-8 bg-gradient-to-r from-violet-500 to-cyan-400 shadow-[0_0_12px_rgba(139,92,246,0.6)]"
                            : "w-2 bg-gray-700 hover:bg-gray-500"
                        }`}
                      />
                    ))}
                  </div>

                  <span className="sm:hidden text-[10px] text-violet-300 font-medium animate-pulse flex items-center gap-1">
                    {t("v4.portfolio.swipeHint")}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setDeckIndex((prev) => (prev - 1 + featuredProjects.length) % featuredProjects.length)
                      }
                      className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-gray-300 hover:text-white border border-white/10 transition-all backdrop-blur-md cursor-pointer"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <span className="text-xs font-mono text-gray-400">
                      {deckIndex + 1} / {featuredProjects.length}
                    </span>
                    <button
                      onClick={() => setDeckIndex((prev) => (prev + 1) % featuredProjects.length)}
                      className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-gray-300 hover:text-white border border-white/10 transition-all backdrop-blur-md cursor-pointer"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: BENTO GRID VIEW (Morphism Style) */}
      {(viewMode === "grid" || searchQuery || selectedCategory !== "All") && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredProjects.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-gray-950/60 border border-white/10 rounded-3xl backdrop-blur-xl shadow-xl">
              <Code2 size={48} className="mx-auto mb-4 text-gray-500 animate-pulse" />
              <h3 className="text-lg font-bold text-white mb-1">
                {t("v4.portfolio.emptyTitle")}
              </h3>
              <p className="text-sm text-gray-400">
                {t("v4.portfolio.emptyDescription")}
              </p>
            </div>
          ) : (
            filteredProjects.map((p) => (
              <div
                key={p.id || p.title}
                onClick={() => setSelectedProject(p)}
                className="group relative bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/10 hover:border-violet-500/50 rounded-3xl overflow-hidden shadow-xl hover:shadow-[0_12px_40px_rgba(139,92,246,0.22)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between cursor-pointer before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent"
              >
                {/* Shimmer Light Reflection Sweep */}
                <div className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />

                <div>
                  <div className="relative aspect-video overflow-hidden bg-gray-950">
                    <img
                      src={p.imgUrl}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://placehold.co/400x225/0f172a/8b5cf6?text=" +
                          encodeURIComponent(p.title);
                      }}
                    />
                    <span className="absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full bg-gray-950/80 backdrop-blur-md text-violet-300 border border-violet-500/30 shadow-md">
                      {getCategoryLabel(p.category)}
                    </span>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-violet-300 transition-colors tracking-tight">
                      {p.title}
                    </h3>
                    <p className="text-xs text-gray-300 line-clamp-3 mb-4 leading-relaxed font-normal">
                      {p.description}
                    </p>

                    {Array.isArray(p.stack) && p.stack.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {p.stack.slice(0, 4).map((tech) => (
                          <span
                            key={tech}
                            className="text-[10px] px-2.5 py-0.5 rounded-lg bg-white/[0.04] text-violet-300 border border-white/10 backdrop-blur-md font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between relative z-10 bg-white/[0.01]">
                  <span className="text-xs font-bold text-violet-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>{t("v4.portfolio.inspect")}</span>
                    <ArrowRight size={13} />
                  </span>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {p.link && p.link !== "#" && (
                      <a
                        href={p.link}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-gray-300 hover:text-white border border-white/10 transition-all backdrop-blur-md"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                    {p.github && (
                      <a
                        href={p.github}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-gray-300 hover:text-white border border-white/10 transition-all backdrop-blur-md"
                      >
                        <Github size={14} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* PROJECT DETAILS MODAL (Morphism Style) */}
      {selectedProject &&
        createPortal(
          <div className="fixed inset-0 z-[99999] w-screen h-screen bg-black/80 backdrop-blur-xl p-4 flex items-center justify-center animate-fadeIn">
            <div className="relative w-full max-w-2xl bg-gray-950/90 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(0,0,0,0.85)] flex flex-col max-h-[90vh] overflow-y-auto backdrop-blur-2xl before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <span className="text-xs font-bold text-violet-300 bg-violet-500/15 px-3 py-1 rounded-full border border-violet-500/30 backdrop-blur-md">
                    {getCategoryLabel(selectedProject.category)}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white mt-2 tracking-tight">
                    {selectedProject.title}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition-all cursor-pointer backdrop-blur-md"
                >
                  <XIcon size={20} />
                </button>
              </div>

              <div className="rounded-2xl overflow-hidden aspect-video mb-6 border border-white/10 bg-gray-900 shadow-2xl">
                <img
                  src={selectedProject.imgUrl}
                  alt={selectedProject.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-4 mb-6">
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed font-normal">
                  {selectedProject.description}
                </p>

                {Array.isArray(selectedProject.stack) && selectedProject.stack.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                      {t("v4.portfolio.usedTech")}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.stack.map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1 text-xs font-semibold bg-white/[0.05] text-violet-300 border border-white/10 rounded-xl backdrop-blur-md"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3 pt-4 border-t border-white/10">
                {selectedProject.link && selectedProject.link !== "#" && (
                  <a
                    href={selectedProject.link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-sm text-center flex items-center justify-center gap-2 shadow-lg shadow-violet-900/40 border border-violet-400/30"
                  >
                    <ExternalLink size={16} />
                    <span>{t("v4.portfolio.openLive")}</span>
                  </a>
                )}
                {selectedProject.github && (
                  <a
                    href={selectedProject.github}
                    target="_blank"
                    rel="noreferrer"
                    className="py-3 px-5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-gray-200 font-bold text-sm flex items-center justify-center gap-2 border border-white/10 backdrop-blur-md"
                  >
                    <Github size={16} />
                    <span>{t("v4.portfolio.viewSource")}</span>
                  </a>
                )}
                <button
                  onClick={() => setSelectedProject(null)}
                  className="py-3 px-5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-sm font-semibold border border-white/10 transition-colors cursor-pointer"
                >
                  {t("v4.portfolio.close")}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </section>
  );
}
