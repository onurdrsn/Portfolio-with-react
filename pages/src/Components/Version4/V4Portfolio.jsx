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
  Terminal,
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

  const categories = ["All", "Full Stack", "Machine Learning", "Frontend", "Game Dev", "AI"];

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
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="projects-v4">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold uppercase tracking-widest mb-3">
          <Sparkles size={13} className="text-amber-400" />
          <span>V4 Dinamik Vitrin</span>
        </div>
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight">
          Öne Çıkan <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">Eserler & Projeler</span>
        </h2>
        <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto mt-3">
          Mobil kaydırma (swipe) destekli, filtrelenebilir ve yüksek etkileşimli modern proje vitrini.
        </p>
      </div>

      {/* Control Bar: Search + Category + View Switcher */}
      <div className="bg-gray-900/80 backdrop-blur-2xl border border-gray-800 rounded-3xl p-4 sm:p-5 mb-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Proje veya teknoloji ara..."
            className="w-full bg-gray-950/80 border border-gray-800 rounded-2xl pl-11 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-all"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
              <XIcon size={14} />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-900/50 border border-violet-400/40"
                  : "bg-gray-950/60 text-gray-400 hover:text-white hover:bg-gray-800/60 border border-gray-800/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-gray-950/90 p-1 rounded-2xl border border-gray-800">
          <button
            onClick={() => setViewMode("deck")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === "deck"
                ? "bg-violet-600/30 text-violet-300 border border-violet-500/30"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Layers size={14} />
            <span>Spotlight</span>
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === "grid"
                ? "bg-violet-600/30 text-violet-300 border border-violet-500/30"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <LayoutGrid size={14} />
            <span>Grid</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: SPOTLIGHT 3D DECK (Touch-Swipe Enabled) */}
      {viewMode === "deck" && activeItem && (
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: "pan-y" }}
          className="relative mb-16 bg-gradient-to-br from-gray-900/90 via-gray-900/50 to-gray-950/90 backdrop-blur-2xl border border-gray-800 rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden group select-none transition-all"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Project Image Preview */}
            <div
              className="lg:col-span-7 relative group/img overflow-hidden rounded-2xl border border-gray-800 aspect-video bg-gray-950 shadow-2xl cursor-pointer"
              onClick={() => setSelectedProject(activeItem)}
            >
              <img
                src={activeItem.imgUrl}
                alt={activeItem.title}
                className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-700"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://placehold.co/800x450/0f172a/8b5cf6?text=" +
                    encodeURIComponent(activeItem.title || "Project");
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/20 to-transparent opacity-80 group-hover/img:opacity-50 transition-opacity"></div>
              <div className="absolute top-4 left-4 bg-violet-600/90 text-white text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-lg border border-violet-400/30 flex items-center gap-1.5">
                <Sparkles size={12} className="text-amber-300" /> Öne Çıkan Eser
              </div>
            </div>

            {/* Project Info & Controls */}
            <div className="lg:col-span-5 flex flex-col justify-between h-full">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-violet-500/10 text-violet-300 text-xs font-bold border border-violet-500/20 mb-3">
                  {activeItem.category}
                </span>
                <h3 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">
                  {activeItem.title}
                </h3>
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-6">
                  {activeItem.description}
                </p>

                {/* Tech Stack Chips */}
                {Array.isArray(activeItem.stack) && activeItem.stack.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-8">
                    {activeItem.stack.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 text-xs font-semibold bg-violet-500/10 text-violet-300 border border-violet-500/20 rounded-xl"
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
                    className="flex-1 px-5 py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-sm rounded-xl transition-all duration-300 shadow-lg shadow-violet-900/40 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Detayları İncele <ArrowRight size={16} />
                  </button>
                  {activeItem.link && activeItem.link !== "#" && (
                    <a
                      href={activeItem.link}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-3.5 bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold text-sm rounded-xl border border-gray-700 transition-all flex items-center justify-center gap-2"
                    >
                      <ExternalLink size={16} /> Demo
                    </a>
                  )}
                  {activeItem.github && (
                    <a
                      href={activeItem.github}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-3.5 bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold text-sm rounded-xl border border-gray-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Github size={16} /> GitHub
                    </a>
                  )}
                </div>

                {/* Slider Indicators & Swipe Hint */}
                <div className="flex items-center justify-between border-t border-gray-800/80 pt-4">
                  <div className="flex items-center gap-1.5">
                    {featuredProjects.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setDeckIndex(idx)}
                        className={`h-2 rounded-full transition-all ${
                          idx === deckIndex ? "w-8 bg-violet-500" : "w-2 bg-gray-700 hover:bg-gray-500"
                        }`}
                      />
                    ))}
                  </div>

                  <span className="sm:hidden text-[10px] text-violet-400 font-medium animate-pulse">
                    👈 Sağa / Sola Kaydır 👉
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDeckIndex((prev) => (prev - 1 + featuredProjects.length) % featuredProjects.length)}
                      className="p-2 rounded-xl bg-gray-800/60 hover:bg-gray-700 text-gray-300 transition-all"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <span className="text-xs font-mono text-gray-400">
                      {deckIndex + 1} / {featuredProjects.length}
                    </span>
                    <button
                      onClick={() => setDeckIndex((prev) => (prev + 1) % featuredProjects.length)}
                      className="p-2 rounded-xl bg-gray-800/60 hover:bg-gray-700 text-gray-300 transition-all"
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

      {/* VIEW 2: BENTO GRID VIEW */}
      {(viewMode === "grid" || searchQuery || selectedCategory !== "All") && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredProjects.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-gray-900/40 border border-gray-800 rounded-3xl">
              <Code2 size={48} className="mx-auto mb-4 text-gray-600" />
              <h3 className="text-lg font-bold text-white mb-1">Eser Bulunamadı</h3>
              <p className="text-sm text-gray-400">Arama kriterlerinize uygun proje bulunmuyor.</p>
            </div>
          ) : (
            filteredProjects.map((p) => (
              <div
                key={p.id || p.title}
                onClick={() => setSelectedProject(p)}
                className="group relative bg-gray-950/70 border border-gray-800 hover:border-violet-500/40 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-violet-950/30 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="relative aspect-video overflow-hidden bg-gray-900">
                    <img
                      src={p.imgUrl}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://placehold.co/400x225/0f172a/8b5cf6?text=" +
                          encodeURIComponent(p.title);
                      }}
                    />
                    <span className="absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full bg-gray-950/80 backdrop-blur text-violet-300 border border-violet-500/30">
                      {p.category}
                    </span>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-violet-300 transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-3 mb-4 leading-relaxed">
                      {p.description}
                    </p>

                    {Array.isArray(p.stack) && p.stack.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {p.stack.slice(0, 4).map((tech) => (
                          <span
                            key={tech}
                            className="text-[10px] px-2 py-0.5 rounded-lg bg-violet-950/40 text-violet-300 border border-violet-500/20"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-800/80 flex items-center justify-between">
                  <span className="text-xs font-bold text-violet-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    İncele <ArrowRight size={13} />
                  </span>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {p.link && p.link !== "#" && (
                      <a href={p.link} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white">
                        <ExternalLink size={14} />
                      </a>
                    )}
                    {p.github && (
                      <a href={p.github} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white">
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

      {/* PROJECT DETAILS MODAL */}
      {selectedProject &&
        createPortal(
          <div className="fixed inset-0 z-[99999] w-screen h-screen bg-black/85 backdrop-blur-md p-4 flex items-center justify-center animate-fadeIn">
            <div className="relative w-full max-w-2xl bg-gray-950 border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <span className="text-xs font-bold text-violet-400 bg-violet-500/10 px-3 py-1 rounded-full border border-violet-500/20">
                    {selectedProject.category}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
                    {selectedProject.title}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                >
                  <XIcon size={20} />
                </button>
              </div>

              <div className="rounded-2xl overflow-hidden aspect-video mb-6 border border-gray-800 bg-gray-900 shadow-2xl">
                <img
                  src={selectedProject.imgUrl}
                  alt={selectedProject.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-4 mb-6">
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                  {selectedProject.description}
                </p>

                {Array.isArray(selectedProject.stack) && selectedProject.stack.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                      Kullanılan Teknolojiler
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.stack.map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1 text-xs font-semibold bg-violet-500/10 text-violet-300 border border-violet-500/20 rounded-xl"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-800">
                {selectedProject.link && selectedProject.link !== "#" && (
                  <a
                    href={selectedProject.link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-3 px-5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm text-center flex items-center justify-center gap-2 shadow-lg shadow-violet-900/40"
                  >
                    <ExternalLink size={16} /> Canlı Siteyi Aç
                  </a>
                )}
                {selectedProject.github && (
                  <a
                    href={selectedProject.github}
                    target="_blank"
                    rel="noreferrer"
                    className="py-3 px-5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold text-sm flex items-center justify-center gap-2"
                  >
                    <Github size={16} /> Kaynak Kodu Gör
                  </a>
                )}
                <button
                  onClick={() => setSelectedProject(null)}
                  className="py-3 px-5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-sm font-semibold"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </section>
  );
}
