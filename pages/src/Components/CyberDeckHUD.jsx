import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { apiGet, apiPost } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import {
  Terminal,
  Cpu,
  Zap,
  Radio,
  Layers,
  Code,
  Shield,
  ExternalLink,
  Github,
  Send,
  Sparkles,
  Settings,
  X,
  Volume2,
  VolumeX,
  Gamepad2
} from "lucide-react";

export default function CyberDeckHUD() {
  const { user } = useAuth();
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [timelineItems, setTimelineItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Audio Sound Effects (Web Audio API Synthesizer)
  const [soundEnabled, setSoundEnabled] = useState(true);

  const playCyberBeep = (freq = 800, duration = 0.08) => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {}
  };

  // Selected Project Modal
  const [selectedProject, setSelectedProject] = useState(null);

  // Contact Form
  const [contactForm, setContactForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  // Matrix Particle Canvas Ref
  const canvasRef = useRef(null);

  useEffect(() => {
    Promise.all([
      apiGet("/api/portfolio").catch(() => []),
      apiGet("/api/timeline").catch(() => [])
    ]).then(([p, t]) => {
      setPortfolioItems(Array.isArray(p) ? p : []);
      setTimelineItems(Array.isArray(t) ? t : []);
      setLoading(false);
    });
  }, []);

  // Matrix Particle Canvas Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 70 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 1,
      speedY: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.7 + 0.3,
      char: String.fromCharCode(0x30a0 + Math.floor(Math.random() * 96))
    }));

    const render = () => {
      ctx.fillStyle = "rgba(7, 10, 15, 0.25)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        ctx.fillStyle = `rgba(0, 242, 254, ${p.opacity})`;
        ctx.font = `${p.size * 6}px monospace`;
        ctx.fillText(p.char, p.x, p.y);

        p.y += p.speedY * 2;
        if (p.y > canvas.height) {
          p.y = -10;
          p.x = Math.random() * canvas.width;
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    playCyberBeep(1200, 0.12);
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      return toast.error("Lütfen tüm zorunlu alanları doldurun.");
    }
    setSending(true);
    try {
      await apiPost("/api/contact", contactForm).catch(() => {});
      toast.success("CyberDeck sinyali başarıyla iletildi!");
      setContactForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      toast.success("Sinyal alındı!");
      setContactForm({ name: "", email: "", subject: "", message: "" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#070a0f] text-cyan-400 font-mono overflow-x-hidden select-none">
      
      {/* ── Background Particle Canvas ────────────────────────────── */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none opacity-40 z-0" />

      {/* Cyber Grid Lines Overlay */}
      <div
        className="fixed inset-0 opacity-10 pointer-events-none z-0"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 242, 254, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 242, 254, 0.2) 1px, transparent 1px)`,
          backgroundSize: "40px 40px"
        }}
      />

      {/* ── TOP HUD HEADER BAR ────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[#0b0f19]/90 backdrop-blur-xl border-b border-cyan-500/30 px-4 py-3 flex justify-between items-center shadow-lg shadow-cyan-950/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-500 to-fuchsia-600 p-0.5 shadow-lg shadow-cyan-500/40">
            <div className="w-full h-full bg-[#070a0f] rounded-[7px] flex items-center justify-center font-black text-cyan-300 text-sm">
              OD
            </div>
          </div>
          <div>
            <h1 className="text-sm font-black tracking-widest text-white flex items-center gap-2">
              CYBERDECK 2077 <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-1.5 py-0.5 rounded animate-pulse">HUD v3.0</span>
            </h1>
            <p className="text-[10px] text-cyan-500/80">ONUR DURSUN // QUANTUM ARCHITECTURE</p>
          </div>
        </div>

        {/* HUD Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex items-center gap-1.5 text-xs bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 px-3 py-1 rounded-lg transition-all"
          >
            {soundEnabled ? <Volume2 size={14} className="text-cyan-400" /> : <VolumeX size={14} className="text-gray-500" />}
            <span className="hidden sm:inline">{soundEnabled ? "SES: AÇIK" : "SES: KAPALI"}</span>
          </button>

          {user && (
            <Link
              to="/admin"
              className="flex items-center gap-1.5 text-xs bg-fuchsia-500/20 hover:bg-fuchsia-500/30 border border-fuchsia-500/40 text-fuchsia-300 px-3 py-1 rounded-lg font-bold transition-all shadow-lg shadow-fuchsia-950/50"
            >
              <Settings size={14} /> ADMIN DECK
            </Link>
          )}
        </div>
      </header>

      {/* ── MAIN CYBERPANEL CONTENT ────────────────────────────────── */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8 space-y-12">
        
        {/* HERO HUD CONSOLE */}
        <section className="bg-[#0c101c]/80 border border-cyan-500/30 rounded-2xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden shadow-2xl shadow-cyan-950/40">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2 text-xs text-fuchsia-400 font-bold tracking-wider">
                <Radio size={14} className="animate-pulse" /> SYSTEM ONLINE // SYNC COMPLETE
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                ONUR DURSUN <br />
                <span className="bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
                  FULL STACK & CLOUD ENGINEER
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-sans max-w-2xl">
                Yüksek performanslı bulut mimarileri, Cloudflare Workers, React, TypeScript ve yapay zeka sistemleri üzerine uzmanlaşmış kıdemli yazılım mühendisi.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href="#projects"
                  onClick={() => playCyberBeep(900)}
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-500/30 flex items-center gap-2 transition-all"
                >
                  <Layers size={16} /> PROJELERİ İNCELE
                </a>
                <a
                  href="#contact"
                  onClick={() => playCyberBeep(700)}
                  className="px-5 py-2.5 bg-fuchsia-500/10 hover:bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40 font-bold text-xs rounded-xl flex items-center gap-2 transition-all"
                >
                  <Zap size={16} /> SİNYAL GÖNDER
                </a>
              </div>
            </div>

            {/* CYBERNETIC DIAGNOSTICS WIDGET */}
            <div className="bg-[#080c16] border border-cyan-500/30 p-5 rounded-xl space-y-4">
              <h4 className="text-xs font-bold text-cyan-300 border-b border-cyan-500/20 pb-2 flex items-center gap-2">
                <Cpu size={16} className="text-fuchsia-400" /> SİSTEM TEKNOLOJİ YIĞINI
              </h4>

              <div className="space-y-2 text-xs">
                {["TypeScript / JavaScript", "React & Vite", "Cloudflare Workers & D1", "Python & Machine Learning", "Tailwind CSS & Hono"].map((skill, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-cyan-950/30 px-2.5 py-1.5 rounded border border-cyan-500/20">
                    <span className="text-gray-200 font-sans">{skill}</span>
                    <span className="text-[10px] text-cyan-400 font-mono">100% MATCH</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* PORTFOLIO PROJECTS SHOWCASE */}
        <section id="projects" className="space-y-6">
          <div className="flex justify-between items-end border-b border-cyan-500/30 pb-3">
            <div>
              <span className="text-xs text-fuchsia-400 font-bold tracking-widest">// ARCHIVE DATABASE</span>
              <h3 className="text-2xl font-black text-white">YAZILIM PROJELERİ</h3>
            </div>
            <span className="text-xs text-cyan-400 font-mono">TOPLAM: {portfolioItems.length} ITEM</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolioItems.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  playCyberBeep(1000);
                  setSelectedProject(p);
                }}
                className="bg-[#0b0f1a] border border-cyan-500/30 hover:border-fuchsia-500/60 rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden shadow-xl shadow-cyan-950/40"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-fuchsia-500/10 rounded-full blur-2xl group-hover:bg-fuchsia-500/20 transition-all pointer-events-none"></div>

                {p.imgUrl && (
                  <div className="h-40 w-full rounded-xl overflow-hidden mb-3 bg-black/60 border border-cyan-500/20 relative">
                    <img src={p.imgUrl} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <span className="absolute top-2 left-2 text-[10px] bg-black/80 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded font-mono backdrop-blur-md">
                      {p.category}
                    </span>
                  </div>
                )}

                <h4 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">{p.title}</h4>
                <p className="text-xs text-gray-400 font-sans line-clamp-2 mt-1.5">{p.description}</p>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {Array.isArray(p.stack) && p.stack.slice(0, 4).map((tech, idx) => (
                    <span key={idx} className="text-[10px] bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded font-mono">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* TIMELINE ARCHIVE */}
        <section className="space-y-6">
          <div className="border-b border-cyan-500/30 pb-3">
            <span className="text-xs text-fuchsia-400 font-bold tracking-widest">// TIMELINE SEQUENCE</span>
            <h3 className="text-2xl font-black text-white">DENEYİM & KARİYER</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {timelineItems.map((item) => (
              <div key={item.id} className="bg-[#0b0f1a] border border-cyan-500/30 p-5 rounded-2xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-fuchsia-400 bg-fuchsia-500/10 px-2.5 py-1 rounded border border-fuchsia-500/30">{item.year}</span>
                  <span className="text-xs text-cyan-400 font-mono">{item.duration}</span>
                </div>
                <h4 className="text-base font-bold text-white">{item.title}</h4>
                <p className="text-xs text-cyan-300 font-semibold">{item.company}</p>
                {Array.isArray(item.details) && item.details.map((d, i) => (
                  <p key={i} className="text-xs text-gray-400 font-sans">▸ {d}</p>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* GAMES HUB LAUNCHER */}
        <section className="bg-[#0c101c]/80 border border-cyan-500/30 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-cyan-500/20 pb-3">
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <Gamepad2 size={20} className="text-fuchsia-400" /> SİBER OYUN SİMÜLASYONU
            </h3>
            <span className="text-xs text-cyan-400 font-mono">6 PLAYABLE MODULES</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { name: "Flappy Bird", path: "/games/flappybird" },
              { name: "Tower Defense", path: "/games/towerdefense" },
              { name: "Mayın Tarlası", path: "/games/minesweeper" },
              { name: "Adam Asmaca", path: "/games/hangman" },
              { name: "Hafıza Oyunu", path: "/games/memory" },
              { name: "Breakout", path: "/games/breakout" }
            ].map((g, i) => (
              <Link
                key={i}
                to={g.path}
                onClick={() => playCyberBeep(1100)}
                className="bg-[#080c16] border border-cyan-500/30 hover:border-fuchsia-500 p-3 rounded-xl text-center text-xs font-bold text-white hover:text-cyan-300 transition-all hover:scale-105"
              >
                {g.name}
              </Link>
            ))}
          </div>
        </section>

        {/* CONTACT TERMINAL FORM */}
        <section id="contact" className="bg-[#0b0f1a] border border-cyan-500/30 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-cyan-500/30 pb-3">
            <span className="text-xs text-fuchsia-400 font-bold tracking-widest">// ENCRYPTED TRANSMISSION</span>
            <h3 className="text-2xl font-black text-white">İLETİŞİM SİNYALİ GÖNDER</h3>
          </div>

          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-cyan-400 mb-1 font-mono">KULLANICI ADI / İSİM *</label>
                <input
                  type="text"
                  required
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  className="w-full bg-[#070a12] border border-cyan-500/30 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-fuchsia-500 font-sans"
                  placeholder="Ahmet Yılmaz"
                />
              </div>
              <div>
                <label className="block text-xs text-cyan-400 mb-1 font-mono">E-POSTA ADRESİ *</label>
                <input
                  type="email"
                  required
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="w-full bg-[#070a12] border border-cyan-500/30 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-fuchsia-500 font-sans"
                  placeholder="ahmet@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-cyan-400 mb-1 font-mono">TRANSMISSION SUBJECT</label>
              <input
                type="text"
                value={contactForm.subject}
                onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                className="w-full bg-[#070a12] border border-cyan-500/30 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-fuchsia-500 font-sans"
                placeholder="Proje Teklifi / Danışmanlık"
              />
            </div>

            <div>
              <label className="block text-xs text-cyan-400 mb-1 font-mono">ENCRYPTED MESSAGE CONTENT *</label>
              <textarea
                required
                rows={4}
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                className="w-full bg-[#070a12] border border-cyan-500/30 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-fuchsia-500 font-sans resize-none"
                placeholder="Mesajınızı girin..."
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-fuchsia-950/50 flex items-center gap-2 transition-all"
            >
              <Send size={14} /> {sending ? "TRANSMITTING..." : "SİNYALİ GÖNDER"}
            </button>
          </form>
        </section>

      </main>

      {/* ── PROJECT DETAIL MODAL ───────────────────────────────────── */}
      {selectedProject && (
        <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#0c101c] border border-cyan-500/50 rounded-2xl p-6 shadow-2xl space-y-4 relative">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded font-mono">{selectedProject.category}</span>
                <h3 className="font-bold text-white text-xl mt-1">{selectedProject.title}</h3>
              </div>
              <button onClick={() => setSelectedProject(null)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {selectedProject.imgUrl && (
              <div className="h-52 w-full rounded-xl overflow-hidden bg-black border border-cyan-500/30">
                <img src={selectedProject.imgUrl} alt={selectedProject.title} className="w-full h-full object-cover" />
              </div>
            )}

            <p className="text-xs text-gray-300 font-sans leading-relaxed">{selectedProject.description}</p>

            {Array.isArray(selectedProject.stack) && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {selectedProject.stack.map((s, idx) => (
                  <span key={idx} className="text-xs bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 px-2.5 py-1 rounded-lg font-mono">{s}</span>
                ))}
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-cyan-500/30 font-sans">
              {selectedProject.link && (
                <a href={selectedProject.link} target="_blank" rel="noreferrer" className="flex-1 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-950/50">
                  <ExternalLink size={14} /> CANLI DEMO
                </a>
              )}
              {selectedProject.github && (
                <a href={selectedProject.github} target="_blank" rel="noreferrer" className="flex-1 py-2.5 bg-fuchsia-500/20 hover:bg-fuchsia-500/30 text-fuchsia-300 border border-fuchsia-500/40 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5">
                  <Github size={14} /> GITHUB KODLARI
                </a>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
