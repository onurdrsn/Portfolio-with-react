import React, { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useUiVersion, type UiVersion } from "../contexts/UiVersionContext";
import { apiGet, apiPost, apiPut, apiPatch, apiDelete, confirmToast } from "../lib/api";
import toast from "react-hot-toast";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  LayoutDashboard, FileText, MessageSquare, PenSquare,
  ExternalLink, Trash2, Eye, EyeOff, Edit3, CheckCircle,
  XCircle, Clock, Home, ChevronRight, BarChart3, Users,
  BookOpen, TrendingUp, Monitor, Smartphone, Maximize2,
  Minimize2, X as XIcon, Code2, Sparkles, Check, X as XMark, Wand2,
  FolderGit2, Briefcase, Plus, Save, ChevronDown, Upload, Search, Star, Github, LayoutGrid, Layers
} from "lucide-react";
import ImageCropModal from "../Components/ImageCropModal";
import { diffLines, joinContent, splitContent, type DiffLine } from "../lib/diff";

// ─── Markdown Preview ──────────────────────────────────────────────────
import { renderMarkdown } from "../lib/markdown";

// ─── Quill Dark Styles ─────────────────────────────────────────────────
const QUILL_STYLE = `
  .quill{background:#0f1117;border-radius:0.75rem;overflow:hidden;border:1px solid #1f2937;transition:all 0.3s}
  .quill:focus-within{border-color:#7c3aed;box-shadow:0 0 0 2px rgba(124,58,237,0.15)}
  .ql-toolbar.ql-snow{border:none!important;border-bottom:1px solid #1f2937!important;background:#161b27;padding:10px}
  .ql-container.ql-snow{border:none!important;min-height:420px;font-family:inherit;font-size:0.95rem;color:#e5e7eb}
  .ql-snow .ql-stroke{stroke:#6b7280}.ql-snow .ql-fill,.ql-snow .ql-stroke.ql-fill{fill:#6b7280}
  select option{background-color:#0f172a;color:#ffffff;padding:8px}
  @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  .animate-fadeIn{animation:fadeIn 0.25s ease forwards}
  @keyframes slideIn{from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:translateX(0)}}
  .animate-slideIn{animation:slideIn 0.2s ease forwards}
`;

const PROSE_STYLE = `
  .blog-content h1,.blog-content h2,.blog-content h3,.blog-content h4{color:#fff;font-weight:700;line-height:1.3;margin:1.8em 0 0.7em}
  .blog-content h1{font-size:2rem}.blog-content h2{font-size:1.5rem;padding-bottom:0.3em;border-bottom:1px solid #1f2937}
  .blog-content h3{font-size:1.2rem}.blog-content h4{font-size:1rem}
  .blog-content p{color:#d1d5db;line-height:1.85;margin:0 0 1.2em}
  .blog-content a{color:#a78bfa;text-decoration:underline;text-underline-offset:2px}
  .blog-content a:hover{color:#c4b5fd}
  .blog-content strong{color:#f3f4f6;font-weight:700}
  .blog-content em{color:#e5e7eb;font-style:italic}
  .blog-content del{color:#6b7280;text-decoration:line-through}
  .blog-content blockquote{border-left:3px solid #7c3aed;margin:1.5em 0;padding:0.8em 1.2em;background:#0d1117;border-radius:0 8px 8px 0}
  .blog-content blockquote p{color:#9ca3af;margin:0;font-style:italic}
  .blog-content ul,.blog-content ol{color:#d1d5db;padding-left:1.5em;margin:1em 0}
  .blog-content li{margin:0.4em 0;line-height:1.7}
  .blog-content ul li::marker{color:#7c3aed}
  .blog-content ol li::marker{color:#7c3aed;font-weight:600}
  .blog-content hr{border:none;border-top:1px solid #1f2937;margin:2.5em 0}
  .blog-content img{border-radius:12px;max-width:100%;margin:1.5em auto;display:block;box-shadow:0 20px 60px rgba(0,0,0,0.5)}
  .blog-content table{width:100%;border-collapse:collapse;margin:1.5em 0;font-size:0.9rem}
  .blog-content th{background:#0d1117;color:#e5e7eb;padding:10px 14px;border:1px solid #1f2937;font-weight:600;text-align:left}
  .blog-content td{padding:9px 14px;border:1px solid #1f2937;color:#d1d5db}
  .blog-content tr:nth-child(even) td{background:#080b12}
  .blog-content .code-block{background:#0d1117;border:1px solid #1f2937;border-radius:10px;padding:1rem 1.25rem;overflow-x:auto;margin:1.5em 0;position:relative}
  .blog-content .code-lang{position:absolute;top:8px;right:12px;font-size:10px;color:#6b7280;font-family:monospace;font-weight:600;text-transform:uppercase;letter-spacing:0.05em}
  .blog-content .code-block code{color:#e5e7eb;font-family:'Fira Code','Cascadia Code',ui-monospace,monospace;font-size:0.875rem;line-height:1.7;background:none;padding:0}
  .blog-content .inline-code{background:#0d1117;color:#a78bfa;font-family:'Fira Code','Cascadia Code',ui-monospace,monospace;font-size:0.85em;padding:2px 7px;border-radius:5px;border:1px solid #1f2937}
  /* Quill HTML passthrough styles */
  .blog-content pre{background:#0d1117;border:1px solid #1f2937;border-radius:10px;padding:1rem 1.25rem;overflow-x:auto;margin:1.5em 0}
  .blog-content pre code{color:#e5e7eb;font-family:'Fira Code','Cascadia Code',ui-monospace,monospace;font-size:0.875rem;line-height:1.7;background:none;padding:0}
  .blog-content code:not(pre code){background:#0d1117;color:#a78bfa;font-family:'Fira Code','Cascadia Code',ui-monospace,monospace;font-size:0.85em;padding:2px 7px;border-radius:5px;border:1px solid #1f2937}
`;

// ─── Types ─────────────────────────────────────────────────────────────
interface Post {
  id: string; title: string; slug: string; content: string;
  excerpt: string | null; coverImage: string | null;
  tags: string[]; published: boolean; createdAt: string; updatedAt: string;
}

interface AdminComment {
  id: string; postId: string; parentId: string | null;
  authorName: string; authorEmail: string; content: string;
  approved: boolean; createdAt: string;
  postTitle: string | null; postSlug: string | null;
}

type Tab = "dashboard" | "ui-settings" | "portfolio" | "timeline" | "posts" | "comments" | "new-post";

// ─── Root Component ─────────────────────────────────────────────────────
export default function AdminPanel() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) navigate("/");
  }, [user, loading, navigate]);

  if (loading || !user?.isAdmin) return null;

  const goTab = (t: Tab) => { setTab(t); setEditingPost(null); };

  return (
    <div className="flex min-h-screen bg-[#080b12] text-gray-200">
      <style>{QUILL_STYLE}</style>
      <style>{PROSE_STYLE}</style>

      {/* ── Sidebar ── */}
      <aside className="hidden sm:flex w-64 flex-col bg-[#0d1117] border-r border-[#1a2035] fixed h-full z-20">
        {/* Logo area */}
        <div className="px-6 py-7 border-b border-[#1a2035]">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-900/40">
              <BookOpen size={16} className="text-white" />
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-tight">Admin Panel</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-widest">Aktif</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest px-3 mb-2">Yönetim</p>
          {[
            { id: "dashboard" as Tab, label: "Dashboard", icon: LayoutDashboard },
            { id: "ui-settings" as Tab, label: "🎨 UI Sürüm Yönetimi", icon: Sparkles },
            { id: "portfolio" as Tab, label: "Portfolyo Projeleri", icon: FolderGit2 },
            { id: "timeline" as Tab, label: "Deneyim / Zaman Çizelgesi", icon: Briefcase },
            { id: "posts" as Tab, label: "Blog Yazıları", icon: FileText },
            { id: "comments" as Tab, label: "Yorumlar", icon: MessageSquare },
          ].map(({ id, label, icon: Icon }) => {
            const active = tab === id && !editingPost;
            return (
              <button
                key={id}
                onClick={() => goTab(id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 w-full text-left ${active
                  ? "bg-violet-600/15 text-violet-300 border border-violet-500/20"
                  : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                  }`}
              >
                <Icon size={16} className={active ? "text-violet-400" : "text-gray-600"} />
                {label}
                {active && <ChevronRight size={12} className="ml-auto text-violet-500" />}
              </button>
            );
          })}

          <div className="mt-4 pt-4 border-t border-[#1a2035]">
            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest px-3 mb-2">İçerik</p>
            <button
              onClick={() => goTab("new-post")}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold w-full text-left bg-gradient-to-r from-violet-600/90 to-purple-700/90 text-white hover:from-violet-500 hover:to-purple-600 transition-all shadow-lg shadow-violet-900/30 border border-violet-500/30"
            >
              <PenSquare size={16} />
              Yeni Yazı Ekle
            </button>
          </div>
        </nav>

        {/* User footer */}
        <div className="px-4 py-4 border-t border-[#1a2035] bg-[#0a0f1a]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-700 to-purple-800 flex items-center justify-center text-white text-sm font-bold ring-2 ring-[#1a2035]">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">@{user.username}</p>
              <p className="text-[10px] text-violet-400 font-medium">Root Admin</p>
            </div>
            <button
              onClick={() => navigate("/blog")}
              title="Blog'a Dön"
              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all"
            >
              <Home size={13} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Mobile Header ── */}
      <div className="sm:hidden fixed top-0 left-0 right-0 z-30 bg-[#0d1117]/95 backdrop-blur border-b border-[#1a2035] px-4 py-3 flex justify-between items-center">
        <span className="font-bold text-violet-400 text-sm">Admin Panel</span>
        <button onClick={() => navigate("/blog")} className="text-xs text-gray-400 flex items-center gap-1">
          <Home size={12} /> Blog'a Dön
        </button>
      </div>

      {/* ── Mobile Bottom Nav ── */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0d1117]/95 backdrop-blur border-t border-[#1a2035] px-2 py-2 flex justify-around">
        {[
          { id: "dashboard" as Tab, icon: LayoutDashboard, label: "Panel" },
          { id: "ui-settings" as Tab, icon: Sparkles, label: "Arayüz" },
          { id: "portfolio" as Tab, icon: FolderGit2, label: "Proje" },
          { id: "timeline" as Tab, icon: Briefcase, label: "Kariyer" },
          { id: "posts" as Tab, icon: FileText, label: "Yazılar" },
          { id: "comments" as Tab, icon: MessageSquare, label: "Yorum" },
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => goTab(id)}
            className={`flex flex-col items-center gap-1 px-2 py-1 rounded-xl text-[10px] font-semibold transition-all ${tab === id ? "text-violet-400 bg-violet-500/10" : "text-gray-600"
              }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Main ── */}
      <main className="flex-1 sm:ml-64 flex flex-col min-h-screen">
        <div className="flex-1 p-4 sm:p-8 pt-16 sm:pt-8 pb-24 sm:pb-8 max-w-6xl w-full mx-auto">
          <div className="animate-fadeIn">
            {editingPost ? (
              <PostEditor key={editingPost.id} post={editingPost} onSaved={() => setEditingPost(null)} onCancel={() => setEditingPost(null)} />
            ) : (
              <>
                {tab === "dashboard" && <DashboardTab onNavigate={goTab} />}
                {tab === "ui-settings" && <UiSettingsTab />}
                {tab === "portfolio" && <PortfolioTab />}
                {tab === "timeline" && <TimelineTab />}
                {tab === "posts" && <PostsTab onEdit={setEditingPost} />}
                {tab === "comments" && <CommentsTab />}
                {tab === "new-post" && <PostEditor onSaved={() => goTab("posts")} />}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── UI Version Settings ────────────────────────────────────────────────
function UiSettingsTab() {
  const { uiVersion, setUiVersion } = useUiVersion();
  const [saving, setSaving] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<UiVersion>(uiVersion);

  useEffect(() => {
    setSelectedVersion(uiVersion);
  }, [uiVersion]);

  const handleActivate = async (ver: UiVersion) => {
    setSelectedVersion(ver);
    setSaving(true);
    const toastId = toast.loading("Arayüz sürümü tüm ziyaretçiler için güncelleniyor...");
    try {
      await setUiVersion(ver);
      toast.success(`Arayüz Sürümü ${ver.toUpperCase()} başarıyla aktif edildi! Tüm kullanıcılar için güncellendi.`, { id: toastId });
    } catch {
      toast.error("Sürüm değiştirilirken hata oluştu.", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0d1117] border border-[#1a2035] p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            🎨 Canlı Arayüz Sürümü Yönetimi (UI Version Control)
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Buradan seçeceğiniz arayüz sürümü anında veritabanında güncellenir ve web sitenizi ziyaret eden **tüm kullanıcılar üzerinde canlı olarak değişir**.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-bold flex items-center gap-2 whitespace-nowrap">
          <Sparkles size={14} /> ŞU AN AKTİF: <span className="text-white bg-violet-600 px-2 py-0.5 rounded uppercase">{uiVersion}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Version 1 Card */}
        <div className={`bg-[#0d1117] border rounded-2xl p-5 flex flex-col justify-between transition-all ${
          selectedVersion === "v1" ? "border-violet-500 ring-2 ring-violet-500/30 shadow-xl shadow-violet-950/40" : "border-[#1a2035] hover:border-gray-700"
        }`}>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold bg-violet-500/10 text-violet-300 border border-violet-500/20 px-2.5 py-1 rounded-lg">SÜRÜM 1</span>
              {uiVersion === "v1" && <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">CANLI AKTİF</span>}
            </div>

            <h3 className="text-base font-bold text-white">Klasik Modern Koyu Portfolyo</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Şık dark-mode tasarımı, Hero alanı, kartlı projeler gösterimi, oyunlar hub'ı ve deneyim zaman çizelgesi.
            </p>
          </div>

          <button
            onClick={() => handleActivate("v1")}
            disabled={saving}
            className={`mt-6 w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              uiVersion === "v1"
                ? "bg-emerald-600 text-white cursor-default"
                : "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/40"
            }`}
          >
            {uiVersion === "v1" ? "✓ Şu An Aktif Sürüm" : "Bu Sürümü Aktif Yap (v1)"}
          </button>
        </div>

        {/* Version 2 Card */}
        <div className={`bg-[#0d1117] border rounded-2xl p-5 flex flex-col justify-between transition-all ${
          selectedVersion === "v2" ? "border-violet-500 ring-2 ring-violet-500/30 shadow-xl shadow-violet-950/40" : "border-[#1a2035] hover:border-gray-700"
        }`}>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 px-2.5 py-1 rounded-lg">SÜRÜM 2</span>
              {uiVersion === "v2" && <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">CANLI AKTİF</span>}
            </div>

            <h3 className="text-base font-bold text-white">Linux OS Masaüstü Simülasyonu 🐧</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              İnteraktif Linux (Ubuntu/GNOME) web işletim sistemi simülasyonu. Sürüklenen pencereler, Bash Terminal CLI, Dosya Yöneticisi ve Sistem İzleyici.
            </p>
          </div>

          <button
            onClick={() => handleActivate("v2")}
            disabled={saving}
            className={`mt-6 w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              uiVersion === "v2"
                ? "bg-emerald-600 text-white cursor-default"
                : "bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/40"
            }`}
          >
            {uiVersion === "v2" ? "✓ Şu An Aktif Sürüm" : "Bu Sürümü Aktif Yap (v2)"}
          </button>
        </div>

        {/* Version 3 Card */}
        <div className={`bg-[#0d1117] border rounded-2xl p-5 flex flex-col justify-between transition-all ${
          selectedVersion === "v3" ? "border-violet-500 ring-2 ring-violet-500/30 shadow-xl shadow-violet-950/40" : "border-[#1a2035] hover:border-gray-700"
        }`}>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/20 px-2.5 py-1 rounded-lg">SÜRÜM 3</span>
              {uiVersion === "v3" && <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">CANLI AKTİF</span>}
            </div>

            <h3 className="text-base font-bold text-white">CyberDeck HUD 2077 ⚡</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Gelecek nesil Cyberpunk 2077 HUD dashboard, Matrix parçacık animasyonu, ses efektleri ve holografik 3D kart tasarımı.
            </p>
          </div>

          <button
            onClick={() => handleActivate("v3")}
            disabled={saving}
            className={`mt-6 w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              uiVersion === "v3"
                ? "bg-emerald-600 text-white cursor-default"
                : "bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-lg shadow-fuchsia-900/40"
            }`}
          >
            {uiVersion === "v3" ? "✓ Şu An Aktif Sürüm" : "Bu Sürümü Aktif Yap (v3)"}
          </button>
        </div>

        {/* Version 4 Card */}
        <div className={`bg-[#0d1117] border rounded-2xl p-5 flex flex-col justify-between transition-all ${
          selectedVersion === "v4" ? "border-violet-500 ring-2 ring-violet-500/30 shadow-xl shadow-violet-950/40" : "border-[#1a2035] hover:border-gray-700"
        }`}>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold bg-gradient-to-r from-violet-500/20 to-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1">
                <Sparkles size={11} className="text-amber-400" /> SÜRÜM 4
              </span>
              {uiVersion === "v4" && <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">CANLI AKTİF</span>}
            </div>

            <h3 className="text-base font-bold text-white">✨ Ultra Canlı & Animasyonlu Cyber-Modern</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Dinamik parçacık ağı, interaktif 3D mimari penceresi, telefon kaydırma (swipe) destekli vitrin ve üst düzey bento grid tasarımı.
            </p>
          </div>

          <button
            onClick={() => handleActivate("v4")}
            disabled={saving}
            className={`mt-6 w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              uiVersion === "v4"
                ? "bg-emerald-600 text-white cursor-default"
                : "bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white shadow-lg shadow-violet-900/40"
            }`}
          >
            {uiVersion === "v4" ? "✓ Şu An Aktif Sürüm" : "Bu Sürümü Aktif Yap (v4)"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ──────────────────────────────────────────────────────────
function DashboardTab({ onNavigate }: { onNavigate: (t: Tab) => void }) {
  const [stats, setStats] = useState({ posts: 0, published: 0, drafts: 0, comments: 0, pending: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    Promise.all([
      apiGet<{ posts: any[] }>("/api/posts?limit=200"),
      apiGet<any[]>("/api/comments/all/admin"),
    ]).then(([postsData, allComments]) => {
      const published = postsData.posts.filter((p) => p.published).length;
      const pending = allComments.filter((c) => !c.approved).length;
      setStats({
        posts: postsData.posts.length,
        published,
        drafts: postsData.posts.length - published,
        comments: allComments.length,
        pending,
      });
    }).catch(() => { }).finally(() => setLoadingStats(false));
  }, []);

  const cards = [
    { label: "Toplam Yazı", value: stats.posts, sub: `${stats.published} yayında · ${stats.drafts} taslak`, icon: FileText, color: "blue", tab: "posts" as Tab },
    { label: "Toplam Yorum", value: stats.comments, sub: `${stats.pending} onay bekliyor`, icon: MessageSquare, color: "violet", tab: "comments" as Tab },
    { label: "Yayındaki Yazı", value: stats.published, sub: "Aktif içerik", icon: TrendingUp, color: "emerald", tab: "posts" as Tab },
    { label: "Bekleyen Onay", value: stats.pending, sub: "Moderasyon gerekli", icon: Clock, color: "amber", tab: "comments" as Tab },
  ];

  const colorMap: Record<string, string> = {
    blue: "from-blue-600/20 to-blue-800/10 border-blue-500/15 text-blue-400",
    violet: "from-violet-600/20 to-violet-800/10 border-violet-500/15 text-violet-400",
    emerald: "from-emerald-600/20 to-emerald-800/10 border-emerald-500/15 text-emerald-400",
    amber: "from-amber-600/20 to-amber-800/10 border-amber-500/15 text-amber-400",
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-sm text-gray-500">Blogunuzun genel durumuna bakış.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.label}
              onClick={() => onNavigate(card.tab)}
              className={`text-left p-5 rounded-2xl border bg-gradient-to-br ${colorMap[card.color]} hover:scale-[1.02] transition-all duration-200 group`}
            >
              <div className="flex items-start justify-between mb-3">
                <Icon size={18} className="opacity-70" />
                <ChevronRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="text-2xl font-bold text-white mb-0.5">
                {loadingStats ? <span className="w-8 h-6 bg-white/10 rounded animate-pulse block" /> : card.value}
              </div>
              <div className="text-[11px] font-semibold uppercase tracking-wider opacity-80">{card.label}</div>
              <div className="text-[10px] text-gray-500 mt-1">{card.sub}</div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => onNavigate("new-post")}
          className="p-6 rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-600/10 to-purple-900/10 hover:border-violet-500/40 hover:from-violet-600/15 transition-all text-left group"
        >
          <div className="w-10 h-10 bg-violet-600/20 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <PenSquare size={18} className="text-violet-400" />
          </div>
          <h3 className="font-bold text-white mb-1">Yeni Yazı Ekle</h3>
          <p className="text-xs text-gray-500">Markdown veya zengin editörle içerik oluştur.</p>
        </button>

        <button
          onClick={() => onNavigate("comments")}
          className="p-6 rounded-2xl border border-[#1a2035] bg-[#0d1117] hover:border-gray-700 transition-all text-left group"
        >
          <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <MessageSquare size={18} className="text-gray-400" />
          </div>
          <h3 className="font-bold text-white mb-1">Yorumları Yönet</h3>
          <p className="text-xs text-gray-500">Bekleyen ve onaylı tüm yorumlar.</p>
        </button>
      </div>
    </div>
  );
}

// ─── Posts Tab ──────────────────────────────────────────────────────────
function PostsTab({ onEdit }: { onEdit: (p: Post) => void }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

  const load = useCallback(() => {
    setLoading(true);
    apiGet<{ posts: Post[] }>("/api/posts?limit=200")
      .then((d) => setPosts(d.posts)).finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  const handleEditClick = async (post: Post) => {
    const toastId = toast.loading("İçerik yükleniyor...");
    try {
      const fullPost = await apiGet<Post>(`/api/posts/${post.slug}`);
      onEdit(fullPost);
      toast.dismiss(toastId);
    } catch {
      toast.error("Yazı yüklenirken hata oluştu", { id: toastId });
    }
  };

  const handleDelete = (id: string) => {
    confirmToast("Yazıyı kalıcı olarak silmek istiyor musunuz?", async () => {
      try {
        await apiDelete(`/api/posts/${id}`);
        setPosts((p) => p.filter((post) => post.id !== id));
        toast.success("Yazı silindi.");
      } catch { }
    });
  };

  const togglePublish = async (post: Post) => {
    try {
      const updated = await apiPut<Post>(`/api/posts/${post.id}`, { published: !post.published });
      setPosts((p) => p.map((x) => (x.id === updated.id ? updated : x)));
      toast.success(updated.published ? "Yayınlandı!" : "Taslaklara alındı.");
    } catch { }
  };

  const filtered = posts.filter((p) =>
    filter === "all" ? true : filter === "published" ? p.published : !p.published
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Blog Yazıları</h1>
          <p className="text-sm text-gray-500">{posts.length} yazı toplam</p>
        </div>
        <div className="flex gap-1 bg-[#0d1117] border border-[#1a2035] rounded-xl p-1">
          {(["all", "published", "draft"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === f ? "bg-violet-600/20 text-violet-300 border border-violet-500/20" : "text-gray-500 hover:text-gray-300"
                }`}
            >
              {f === "all" ? "Tümü" : f === "published" ? "Yayında" : "Taslak"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-[#0d1117] border border-[#1a2035] rounded-2xl text-gray-600">
          <FileText size={40} className="mx-auto mb-3 opacity-30" />
          <p>Yazı bulunamadı.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
        {filtered.map((post) => (
          <div
            key={post.id}
            className="bg-[#0d1117] border border-[#1a2035] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#2a3050] transition-all group"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest ${post.published
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15"
                  : "bg-amber-500/10 text-amber-400 border border-amber-500/15"
                  }`}>
                  {post.published ? "Yayında" : "Taslak"}
                </span>
                {post.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded-md text-[10px] bg-white/5 text-gray-500 border border-white/5">#{tag}</span>
                ))}
              </div>
              <h3
                className="text-base text-white font-semibold truncate group-hover:text-violet-300 transition-colors cursor-pointer"
                onClick={() => handleEditClick(post)}
              >
                {post.title}
              </h3>
              <p className="text-gray-600 text-xs mt-1">
                /{post.slug} · {new Date(post.createdAt).toLocaleDateString("tr-TR")}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to={`/blog/${post.slug}`}
                target="_blank"
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                title="Sayfaya git"
              >
                <ExternalLink size={14} />
              </Link>
              <button
                onClick={() => togglePublish(post)}
                className={`p-2 rounded-lg transition-all ${post.published
                  ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400"
                  : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400"
                  }`}
                title={post.published ? "Taslaklara al" : "Yayınla"}
              >
                {post.published ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              <button
                onClick={() => handleEditClick(post)}
                className="p-2 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 transition-all"
                title="Düzenle"
              >
                <Edit3 size={14} />
              </button>
              <button
                onClick={() => handleDelete(post.id)}
                className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-all"
                title="Sil"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}

// ─── Comments Tab ───────────────────────────────────────────────────────
function CommentsTab() {
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");

  const loadAll = useCallback(() => {
    setLoading(true);
    apiGet<AdminComment[]>("/api/comments/all/admin")
      .then(setComments).catch(() => { }).finally(() => setLoading(false));
  }, []);
  useEffect(() => { loadAll(); }, [loadAll]);

  const approve = async (id: string) => {
    try {
      await apiPatch(`/api/comments/${id}/approve`);
      setComments((prev) => prev.map((c) => c.id === id ? { ...c, approved: true } : c));
      toast.success("Yorum onaylandı.");
    } catch { }
  };

  const remove = (id: string) => {
    confirmToast("Bu yorumu silmek istediğinizden emin misiniz?", async () => {
      try {
        await apiDelete(`/api/comments/${id}`);
        setComments((prev) => prev.filter((c) => c.id !== id));
        toast.success("Yorum silindi.");
      } catch { }
    });
  };

  const filtered = comments.filter((c) =>
    filter === "all" ? true : filter === "pending" ? !c.approved : c.approved
  );

  const pendingCount = comments.filter((c) => !c.approved).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Yorum Yönetimi</h1>
          <p className="text-sm text-gray-500">
            {comments.length} yorum toplam
            {pendingCount > 0 && <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-xs border border-amber-500/20">{pendingCount} bekliyor</span>}
          </p>
        </div>
        <div className="flex gap-1 bg-[#0d1117] border border-[#1a2035] rounded-xl p-1">
          {(["all", "pending", "approved"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === f ? "bg-violet-600/20 text-violet-300 border border-violet-500/20" : "text-gray-500 hover:text-gray-300"
                }`}
            >
              {f === "all" ? "Tümü" : f === "pending" ? "Bekleyen" : "Onaylı"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-[#0d1117] border border-[#1a2035] rounded-2xl text-gray-600">
          <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
          <p>{filter === "pending" ? "Bekleyen yorum yok." : "Yorum bulunamadı."}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
        {filtered.map((c) => (
          <div
            key={c.id}
            className={`bg-[#0d1117] border rounded-2xl p-4 transition-all ${!c.approved
              ? "border-amber-500/15 hover:border-amber-500/30"
              : "border-[#1a2035] hover:border-[#2a3050]"
              }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-violet-900/30 flex items-center justify-center text-violet-400 font-bold text-sm flex-shrink-0">
                  {c.authorName[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{c.authorName}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${c.approved
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15"
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/15"
                      }`}>
                      {c.approved ? "Onaylı" : "Bekliyor"}
                    </span>
                    {c.parentId && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/15">Yanıt</span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-600">{c.authorEmail}</p>
                </div>
              </div>
              <span className="text-[11px] text-gray-600 flex-shrink-0">
                {new Date(c.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>

            {/* Post link */}
            {c.postTitle && c.postSlug && (
              <Link
                to={`/blog/${c.postSlug}`}
                className="inline-flex items-center gap-1.5 text-[11px] text-violet-400 hover:text-violet-300 mb-3 transition-colors"
              >
                <BookOpen size={11} />
                {c.postTitle}
                <ExternalLink size={10} />
              </Link>
            )}

            {/* Content */}
            <p className="text-sm text-gray-300 leading-relaxed bg-white/3 rounded-xl px-4 py-3 border border-white/5 mb-4 italic">
              "{c.content}"
            </p>

            {/* Actions */}
            <div className="flex gap-2">
              {!c.approved && (
                <button
                  onClick={() => approve(c.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/15 transition-all"
                >
                  <CheckCircle size={13} /> Onayla
                </button>
              )}
              <button
                onClick={() => remove(c.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/15 transition-all"
              >
                <Trash2 size={13} /> Sil
              </button>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}

// ─── Post Editor ────────────────────────────────────────────────────────
export function PostEditor({
  post,
  onSaved,
  onCancel,
}: {
  post?: Post;
  onSaved: () => void;
  onCancel?: () => void;
}) {
  const [title, setTitle] = useState(post?.title ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [coverImage, setCoverImage] = useState(post?.coverImage ?? "");
  const [tagsRaw, setTagsRaw] = useState(post?.tags.join(", ") ?? "");
  const [published, setPublished] = useState(post?.published ?? false);
  const [saving, setSaving] = useState(false);
  const [editorMode, setEditorMode] = useState<"rich" | "markdown">("rich");
  const modeRef = useRef(editorMode);
  
  useEffect(() => {
    modeRef.current = editorMode;
  }, [editorMode]);

  const [showPreview, setShowPreview] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [previewScale, setPreviewScale] = useState(1);
  const [previewOpen, setPreviewOpen] = useState(true);
  const [previewMinimized, setPreviewMinimized] = useState(false);
  const [previewClosing, setPreviewClosing] = useState(false);
  const [isAiReviewing, setIsAiReviewing] = useState(false);
  const [isAiMeta, setIsAiMeta] = useState(false);
  const [aiDiffLines, setAiDiffLines] = useState<DiffLine[]>([]);
  const [showAiModal, setShowAiModal] = useState(false);
  // Per-line acceptance: key = line index, value = true (accepted) | false (rejected/default)
  const [aiAccepted, setAiAccepted] = useState<Record<number, boolean>>({});

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, false] }],
      ["bold", "italic", "underline", "strike", "blockquote", "code-block"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"],
    ],
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || content === "<p><br></p>") {
      return toast.error("İçerik boş bırakılamaz.");
    }
    setSaving(true);
    const tags = tagsRaw.split(",").map((t) => t.trim()).filter(Boolean);
    try {
      if (post) {
        await apiPut(`/api/posts/${post.id}`, { title, content, excerpt: excerpt || null, coverImage: coverImage || null, tags, published });
        toast.success("Yazı güncellendi!");
      } else {
        await apiPost("/api/posts", { title, content, excerpt: excerpt || null, coverImage: coverImage || null, tags, published });
        toast.success("Yazı oluşturuldu!");
      }
      onSaved();
    } catch { } finally { setSaving(false); }
  };

  const closePreview = () => {
    setPreviewClosing(true);
    setTimeout(() => { setShowPreview(false); setPreviewClosing(false); setPreviewOpen(true); setPreviewMinimized(false); }, 350);
  };

  const minimizePreview = () => setPreviewMinimized((v) => !v);

  const handleAiReviewClick = async () => {
    if (!content.trim() || content === "<p><br></p>") {
      return toast.error("İncelenecek içerik bulunamadı.");
    }
    const toastId = toast.loading("AI içeriği inceliyor, lütfen bekleyin...");
    setIsAiReviewing(true);
    try {
      const res = await apiPost<{revised: string}>("/api/ai/review", { content });
      const lines = diffLines(content, res.revised);
      setAiDiffLines(lines);
      // Default: accept all AI additions/removals (mirrors VSCode default)
      const defaults: Record<number, boolean> = {};
      lines.forEach((l, i) => { if (l.type !== "unchanged") defaults[i] = true; });
      setAiAccepted(defaults);
      setShowAiModal(true);
      toast.success("AI incelemesi tamamlandı!", { id: toastId });
    } catch (e) {
      toast.error("AI incelemesi sırasında hata oluştu.", { id: toastId });
    } finally {
      setIsAiReviewing(false);
    }
  };

  // Build final content from per-line decisions:
  // - unchanged → always keep
  // - removed   → keep ONLY if NOT accepted (accepted = use AI's version = skip old line)
  // - added     → include ONLY if accepted
  const applyAiChanges = () => {
    const { isHtml } = splitContent(content);
    const resultParts: string[] = [];
    aiDiffLines.forEach((line, i) => {
      if (line.type === "unchanged") {
        resultParts.push(line.value);
      } else if (line.type === "removed") {
        if (!aiAccepted[i]) resultParts.push(line.value); // keep original
      } else if (line.type === "added") {
        if (aiAccepted[i]) resultParts.push(line.value); // apply AI suggestion
      }
    });
    setContent(joinContent(resultParts, isHtml).trim());
    setShowAiModal(false);
    toast.success("Değişiklikler uygulandı!");
  };

  const handleAiMetaClick = async () => {
    if (!content.trim() || content === "<p><br></p>") {
      return toast.error("Etiket önerisi için önce içerik yazın.");
    }
    const toastId = toast.loading("AI etiket ve özet oluşturuyor...");
    setIsAiMeta(true);
    try {
      const res = await apiPost<{ tags: string[]; excerpt: string }>("/api/ai/suggest-meta", { content, title });
      if (res.tags?.length) setTagsRaw(res.tags.join(", "));
      if (res.excerpt) setExcerpt(res.excerpt);
      toast.success("Etiket ve özet oluşturuldu!", { id: toastId });
    } catch {
      toast.error("AI önerisi sırasında hata oluştu.", { id: toastId });
    } finally {
      setIsAiMeta(false);
    }
  };

  const toggleLineAccept = (index: number) => {
    setAiAccepted(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const acceptAllLines = () => {
    const all: Record<number, boolean> = {};
    aiDiffLines.forEach((l, i) => { if (l.type !== "unchanged") all[i] = true; });
    setAiAccepted(all);
  };

  const rejectAllLines = () => {
    const none: Record<number, boolean> = {};
    aiDiffLines.forEach((l, i) => { if (l.type !== "unchanged") none[i] = false; });
    setAiAccepted(none);
  };

  const changedCount = aiDiffLines.filter(l => l.type !== "unchanged").length;
  const acceptedCount = aiDiffLines.filter((l, i) => l.type !== "unchanged" && aiAccepted[i]).length;

  const handleModeSwitch = (mode: "rich" | "markdown") => {
    if (editorMode === "rich" && mode === "markdown") {
      const cleaned = content
        .replace(/<p><br><\/p>/gi, "\n\n")
        .replace(/<\/p>\s*<p>/gi, "\n\n")
        .replace(/<\/?p[^>]*>/gi, "")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/&nbsp;/g, " ")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&");
      setContent(cleaned.trim());
    }
    setEditorMode(mode);
  };

  const previewHtml = editorMode === "markdown" ? renderMarkdown(content) : content;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">{post ? "Yazıyı Düzenle" : "Yeni Yazı"}</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {editorMode === "rich" ? "Zengin HTML editörü" : "Markdown editörü"} · {published ? "Yayında" : "Taslak"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Editor mode toggle */}
          <div className="flex gap-1 bg-[#0d1117] border border-[#1a2035] rounded-xl p-1">
            <button
              onClick={() => handleModeSwitch("rich")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${editorMode === "rich" ? "bg-violet-600/20 text-violet-300 border border-violet-500/20" : "text-gray-500 hover:text-gray-300"}`}
            >
              <Edit3 size={12} /> Rich
            </button>
            <button
              onClick={() => handleModeSwitch("markdown")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${editorMode === "markdown" ? "bg-violet-600/20 text-violet-300 border border-violet-500/20" : "text-gray-500 hover:text-gray-300"}`}
            >
              <Code2 size={12} /> MD
            </button>
          </div>
          
          <button
            type="button"
            onClick={handleAiMetaClick}
            disabled={isAiMeta}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600/20 to-cyan-600/20 text-blue-300 hover:from-blue-600/30 hover:to-cyan-600/30 border border-blue-500/30 transition-all flex items-center gap-1.5 shadow-lg shadow-blue-900/20 disabled:opacity-50"
          >
            <Wand2 size={12} className={isAiMeta ? "animate-spin" : ""} />
            {isAiMeta ? "Üretiliyor..." : "AI Etiket/Özet"}
          </button>

          <button
            type="button"
            onClick={handleAiReviewClick}
            disabled={isAiReviewing}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-violet-600/20 to-purple-600/20 text-violet-300 hover:from-violet-600/30 hover:to-purple-600/30 border border-violet-500/30 transition-all flex items-center gap-1.5 shadow-lg shadow-violet-900/20 disabled:opacity-50"
          >
            <Sparkles size={12} className={isAiReviewing ? "animate-spin" : ""} /> 
            {isAiReviewing ? "İnceleniyor" : "AI İle İncele"}
          </button>
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5 transition-all flex items-center gap-1.5"
          >
            <Monitor size={12} /> Önizle
          </button>
          {onCancel && (
            <button onClick={onCancel} className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 text-xs font-semibold transition-all border border-white/5">
              Vazgeç
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-5">
        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">Başlık *</label>
          <input
            value={title} onChange={(e) => setTitle(e.target.value)} required
            placeholder="Yazı başlığı..."
            className="w-full rounded-xl bg-[#0d1117] border border-[#1a2035] px-4 py-3.5 text-white text-base font-medium focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all"
          />
        </div>

        {/* Cover + Tags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">Kapak Görseli</label>
            <input
              value={coverImage} onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-xl bg-[#0d1117] border border-[#1a2035] px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500/50 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">Etiketler</label>
            <input
              value={tagsRaw} onChange={(e) => setTagsRaw(e.target.value)}
              placeholder="tech, devops, react"
              className="w-full rounded-xl bg-[#0d1117] border border-[#1a2035] px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500/50 transition-all"
            />
          </div>
        </div>

        {/* Excerpt */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Kısa Özet</label>
            {excerpt && (
              <span className={`text-[10px] font-mono ${ excerpt.length > 160 ? "text-red-400" : "text-gray-600" }`}>
                {excerpt.length}/160
              </span>
            )}
          </div>
          <input
            value={excerpt} onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Kart önizlemesinde gösterilecek özet..."
            className="w-full rounded-xl bg-[#0d1117] border border-[#1a2035] px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500/50 transition-all"
          />
        </div>

        {/* Content editor */}
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">İçerik *</label>
          {editorMode === "rich" ? (
            <div className="text-white">
              <ReactQuill 
                theme="snow" 
                value={content} 
                onChange={(val) => {
                  if (modeRef.current === "rich") setContent(val);
                }} 
                modules={quillModules} 
                placeholder="İçeriğinizi buraya yazın..." 
              />
            </div>
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={20}
              placeholder={"# Başlık\n\nMarkdown içeriğinizi buraya yazın...\n\n```js\nconsole.log('hello')\n```"}
              className="w-full rounded-xl bg-[#0d1117] border border-[#1a2035] px-4 py-4 text-gray-200 text-sm font-mono leading-relaxed focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all resize-none"
              style={{ minHeight: 420 }}
            />
          )}
        </div>

        {/* Bottom bar */}
        <div className="pt-4 border-t border-[#1a2035] flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Published toggle - FIXED */}
          <label className="flex items-center gap-4 cursor-pointer group select-none">
            <div
              role="switch"
              aria-checked={published}
              onClick={() => setPublished((v) => !v)}
              className={`relative w-12 h-6 rounded-full transition-all duration-300 cursor-pointer flex-shrink-0 ${published ? "bg-violet-600" : "bg-gray-700"}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${published ? "left-7" : "left-1"}`} />
            </div>
            <div>
              <span className={`text-sm font-bold transition-colors ${published ? "text-violet-300" : "text-gray-400"}`}>
                {published ? "Yayında" : "Taslak"}
              </span>
              <p className="text-[11px] text-gray-600">Yayın durumunu değiştir</p>
            </div>
          </label>

          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 text-white rounded-xl font-bold text-sm tracking-wide transition-all duration-200 disabled:opacity-50 shadow-lg shadow-violet-900/30"
          >
            {saving ? "Kaydediliyor..." : post ? "Kaydet" : "Yayınla"}
          </button>
        </div>
      </form>

      {/* ── Preview Modal ── */}
      {showPreview && (
        <div
          className={`fixed inset-0 z-50 flex flex-col bg-[#070a10]/95 backdrop-blur-sm transition-all duration-300 ${previewClosing ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
        >
          {/* Browser chrome bar */}
          <div className="flex items-center gap-3 px-4 py-3 bg-[#0d1117] border-b border-[#1a2035] flex-shrink-0">
            {/* Traffic lights */}
            <div className="flex items-center gap-2">
              <button
                onClick={closePreview}
                className="w-3.5 h-3.5 rounded-full bg-red-500 hover:bg-red-400 transition-colors flex items-center justify-center group"
                title="Kapat"
              >
                <XIcon size={8} className="opacity-0 group-hover:opacity-100 text-red-900" />
              </button>
              <button
                onClick={minimizePreview}
                className="w-3.5 h-3.5 rounded-full bg-amber-400 hover:bg-amber-300 transition-colors flex items-center justify-center group"
                title="Küçült"
              >
                <Minimize2 size={7} className="opacity-0 group-hover:opacity-100 text-amber-900" />
              </button>
              <button
                onClick={() => setPreviewScale((s) => Math.min(s + 0.1, 1.5))}
                className="w-3.5 h-3.5 rounded-full bg-emerald-500 hover:bg-emerald-400 transition-colors flex items-center justify-center group"
                title="Yakınlaştır"
              >
                <Maximize2 size={7} className="opacity-0 group-hover:opacity-100 text-emerald-900" />
              </button>
            </div>

            {/* URL bar */}
            <div className="flex-1 flex items-center gap-2 bg-[#161b27] rounded-lg px-3 py-1.5 border border-[#1a2035]">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs text-gray-400 font-mono truncate">
                {window.location.origin}/blog/{post?.slug ?? "yeni-yazi"}
              </span>
            </div>

            {/* Device toggle */}
            <div className="flex items-center gap-1 bg-[#161b27] border border-[#1a2035] rounded-lg p-1">
              <button
                onClick={() => setPreviewDevice("desktop")}
                className={`p-1.5 rounded transition-all ${previewDevice === "desktop" ? "bg-violet-600/20 text-violet-400" : "text-gray-600 hover:text-gray-400"}`}
                title="Masaüstü"
              >
                <Monitor size={14} />
              </button>
              <button
                onClick={() => setPreviewDevice("mobile")}
                className={`p-1.5 rounded transition-all ${previewDevice === "mobile" ? "bg-violet-600/20 text-violet-400" : "text-gray-600 hover:text-gray-400"}`}
                title="Mobil"
              >
                <Smartphone size={14} />
              </button>
            </div>

            {/* Zoom controls */}
            <div className="flex items-center gap-1">
              <button onClick={() => setPreviewScale((s) => Math.max(s - 0.1, 0.4))} className="px-2 py-1 rounded text-xs text-gray-500 hover:text-gray-300 bg-white/5 hover:bg-white/10 transition-all">−</button>
              <span className="text-xs text-gray-500 w-10 text-center font-mono">{Math.round(previewScale * 100)}%</span>
              <button onClick={() => setPreviewScale((s) => Math.min(s + 0.1, 1.5))} className="px-2 py-1 rounded text-xs text-gray-500 hover:text-gray-300 bg-white/5 hover:bg-white/10 transition-all">+</button>
            </div>
          </div>

          {/* Preview content area */}
          {!previewMinimized && (
            <div className="flex-1 overflow-auto flex items-start justify-center py-6 px-4">
              <div
                className={`transition-all duration-300 ${previewDevice === "mobile" ? "w-[390px]" : "w-full max-w-3xl"}`}
                style={{ transform: `scale(${previewScale})`, transformOrigin: "top center" }}
              >
                {previewDevice === "mobile" && (
                  <div className="bg-[#1a1a1a] rounded-[2.5rem] p-3 shadow-2xl border-4 border-[#333] mb-4">
                    <div className="bg-black rounded-t-3xl pt-2 pb-1 text-center">
                      <div className="w-20 h-1 bg-gray-700 rounded-full mx-auto" />
                    </div>
                  </div>
                )}
                <div className={`bg-gray-950 ${previewDevice === "mobile" ? "rounded-b-[2rem] overflow-hidden" : "rounded-2xl overflow-hidden shadow-2xl"}`}>
                  <PreviewContent
                    html={previewHtml}
                    title={title}
                    coverImage={coverImage}
                    tags={tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── AI Review Modal — VSCode-style line-by-line diff ── */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070a10]/95 backdrop-blur-sm p-4">
          <div className="bg-[#0d1117] border border-[#1a2035] rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-fadeIn">

            {/* ── Title bar ── */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1a2035] bg-[#0d1117] flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/70" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
                </div>
                <span className="text-xs text-gray-500 font-mono">ai-review — blog-content.diff</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-600">
                  <span className="text-emerald-400 font-semibold">{acceptedCount}</span>
                  <span className="mx-1">/</span>
                  <span>{changedCount}</span>
                  <span className="ml-1">değişiklik seçili</span>
                </span>
                <div className="w-px h-4 bg-[#1a2035] mx-1" />
                <button
                  onClick={acceptAllLines}
                  className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all"
                >
                  Tümünü Kabul Et
                </button>
                <button
                  onClick={rejectAllLines}
                  className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all"
                >
                  Tümünü Reddet
                </button>
                <button
                  onClick={() => setShowAiModal(false)}
                  className="w-6 h-6 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-500 hover:text-white transition-all ml-1"
                >
                  <XIcon size={12} />
                </button>
              </div>
            </div>

            {/* ── Tab bar (file tabs) ── */}
            <div className="flex items-center bg-[#080b12] border-b border-[#1a2035] px-4 flex-shrink-0">
              <div className="flex items-center gap-1.5 px-3 py-2 border-b-2 border-violet-500 text-violet-300 text-[11px] font-medium">
                <Sparkles size={11} />
                AI Öneriler
              </div>
            </div>

            {/* ── Diff body ── */}
            <div className="flex-1 overflow-y-auto bg-[#080b12] font-mono text-[13px] leading-6 select-text">
              <table className="w-full border-collapse">
                <tbody>
                  {aiDiffLines.map((line, idx) => {
                    const isChanged = line.type !== "unchanged";
                    const isAccepted = aiAccepted[idx];

                    if (line.type === "unchanged") {
                      return (
                        <tr key={idx} className="group hover:bg-white/[0.02]">
                          {/* Old line no */}
                          <td className="w-10 text-right pr-3 text-gray-700 select-none text-[11px] pt-px border-r border-[#1a2035] align-top">
                            {line.origLine}
                          </td>
                          {/* New line no */}
                          <td className="w-10 text-right pr-3 text-gray-700 select-none text-[11px] pt-px border-r border-[#1a2035] align-top">
                            {line.newLine}
                          </td>
                          {/* Gutter */}
                          <td className="w-6 text-center text-gray-700 select-none" />
                          {/* Action column (empty for unchanged) */}
                          <td className="w-20" />
                          {/* Content */}
                          <td className="px-4 py-0.5 text-gray-600 whitespace-pre-wrap break-all">{line.value || " "}</td>
                        </tr>
                      );
                    }

                    if (line.type === "removed") {
                      return (
                        <tr
                          key={idx}
                          className={`group cursor-pointer transition-colors ${
                            isAccepted
                              ? "bg-red-500/10 hover:bg-red-500/15"
                              : "bg-[#141820] hover:bg-white/[0.03] opacity-60"
                          }`}
                          onClick={() => toggleLineAccept(idx)}
                        >
                          <td className="w-10 text-right pr-3 select-none text-[11px] pt-px border-r border-[#1a2035] align-top text-red-400/60">
                            {line.origLine}
                          </td>
                          <td className="w-10 border-r border-[#1a2035]" />
                          <td className="w-6 text-center text-red-400 font-bold select-none">−</td>
                          {/* Accept/Reject toggles */}
                          <td className="w-20 pr-2">
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => { e.stopPropagation(); setAiAccepted(p => ({ ...p, [idx]: true })); }}
                                title="Değişikliği kabul et (bu satırı kaldır)"
                                className={`w-5 h-5 rounded flex items-center justify-center transition-all ${
                                  isAccepted
                                    ? "bg-emerald-500 text-white"
                                    : "bg-white/5 text-gray-500 hover:bg-emerald-500/30 hover:text-emerald-400"
                                }`}
                              >
                                <Check size={10} strokeWidth={3} />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); setAiAccepted(p => ({ ...p, [idx]: false })); }}
                                title="Değişikliği reddet (eski satırı koru)"
                                className={`w-5 h-5 rounded flex items-center justify-center transition-all ${
                                  !isAccepted
                                    ? "bg-red-500 text-white"
                                    : "bg-white/5 text-gray-500 hover:bg-red-500/30 hover:text-red-400"
                                }`}
                              >
                                <XMark size={10} strokeWidth={3} />
                              </button>
                            </div>
                          </td>
                          <td className={`px-4 py-0.5 whitespace-pre-wrap break-all ${
                            isAccepted ? "text-red-300 line-through decoration-red-500/50" : "text-gray-500"
                          }`}>
                            {line.value || " "}
                          </td>
                        </tr>
                      );
                    }

                    // type === "added"
                    return (
                      <tr
                        key={idx}
                        className={`group cursor-pointer transition-colors ${
                          isAccepted
                            ? "bg-emerald-500/10 hover:bg-emerald-500/15"
                            : "bg-[#141820] hover:bg-white/[0.03] opacity-60"
                        }`}
                        onClick={() => toggleLineAccept(idx)}
                      >
                        <td className="w-10 border-r border-[#1a2035]" />
                        <td className="w-10 text-right pr-3 select-none text-[11px] pt-px border-r border-[#1a2035] align-top text-emerald-400/60">
                          {line.newLine}
                        </td>
                        <td className="w-6 text-center text-emerald-400 font-bold select-none">+</td>
                        <td className="w-20 pr-2">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => { e.stopPropagation(); setAiAccepted(p => ({ ...p, [idx]: true })); }}
                              title="Bu satırı kabul et"
                              className={`w-5 h-5 rounded flex items-center justify-center transition-all ${
                                isAccepted
                                  ? "bg-emerald-500 text-white"
                                  : "bg-white/5 text-gray-500 hover:bg-emerald-500/30 hover:text-emerald-400"
                              }`}
                            >
                              <Check size={10} strokeWidth={3} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setAiAccepted(p => ({ ...p, [idx]: false })); }}
                              title="Bu satırı reddet"
                              className={`w-5 h-5 rounded flex items-center justify-center transition-all ${
                                !isAccepted
                                  ? "bg-red-500 text-white"
                                  : "bg-white/5 text-gray-500 hover:bg-red-500/30 hover:text-red-400"
                              }`}
                            >
                              <XMark size={10} strokeWidth={3} />
                            </button>
                          </div>
                        </td>
                        <td className={`px-4 py-0.5 whitespace-pre-wrap break-all ${
                          isAccepted ? "text-emerald-300" : "text-gray-500"
                        }`}>
                          {line.value || " "}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Status bar ── */}
            <div className="px-5 py-2.5 border-t border-[#1a2035] bg-[#0d1117] flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-4 text-[11px] text-gray-600">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm bg-emerald-500/60" />
                  Eklenen: {aiDiffLines.filter(l => l.type === "added").length}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm bg-red-500/60" />
                  Silinen: {aiDiffLines.filter(l => l.type === "removed").length}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm bg-gray-600" />
                  Değişmez: {aiDiffLines.filter(l => l.type === "unchanged").length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAiModal(false)}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold text-gray-500 hover:text-white transition-colors"
                >
                  Vazgeç
                </button>
                <button
                  onClick={applyAiChanges}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-all flex items-center gap-1.5 shadow-lg shadow-violet-900/40"
                >
                  <Check size={13} /> {acceptedCount} Değişikliği Uygula
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

// ─── Preview Content (blog post simulation) ─────────────────────────────
function PreviewContent({ html, title, coverImage, tags }: { html: string; title: string; coverImage: string; tags: string[] }) {
  return (
    <div className="min-h-[400px] bg-gray-950 text-gray-200">
      {coverImage && (
        <div className="relative w-full h-48 overflow-hidden">
          <img src={coverImage} alt="" className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />
        </div>
      )}
      <div className="px-6 py-8">
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag) => (
              <span key={tag} className="px-3 py-1 text-xs rounded-full bg-violet-600/20 text-violet-300 border border-violet-500/30">#{tag}</span>
            ))}
          </div>
        )}
        <h1 className="text-2xl font-bold text-white mb-6 leading-tight">{title || "Başlıksız Yazı"}</h1>
        <div
          className="blog-content mb-16"
          dangerouslySetInnerHTML={{ __html: html || "<p class='text-gray-500'>Henüz içerik yok.</p>" }}
        />
      </div>
    </div>
  );
}

// ─── Custom Dropdown Component ──────────────────────────────────────────
function CustomSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (val: string) => void;
  options: { label: string; value: string }[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.value === value) || options[0];

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full bg-[#161b27] border border-[#1f2937] hover:border-violet-500/50 rounded-xl px-3.5 py-2 text-sm text-white flex items-center justify-between transition-all font-medium focus:outline-none focus:border-violet-500"
      >
        <span>{selectedOption?.label}</span>
        <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180 text-violet-400" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-[#0f172a] border border-[#1f2937] rounded-xl shadow-2xl overflow-hidden py-1 animate-fadeIn max-h-56 overflow-y-auto">
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 text-xs sm:text-sm font-medium flex items-center justify-between transition-all ${
                  active
                    ? "bg-violet-600/20 text-violet-300 border-l-2 border-violet-500"
                    : "text-gray-300 hover:bg-gray-800/60 hover:text-white"
                }`}
              >
                <span>{opt.label}</span>
                {active && <Check size={14} className="text-violet-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function toBoolean(val: any): boolean {
  if (val === true || val === 1 || val === "1") return true;
  if (typeof val === "string") {
    const s = val.toLowerCase().trim();
    return s === "true" || s === "t" || s === "yes";
  }
  return false;
}

// ─── JS Code Parser & Import Modal ──────────────────────────────────────
function parseJSArray(input: string): any[] {
  const trimmed = input.trim();
  if (!trimmed) return [];

  // Mock translation function for i18n t() keys
  const mockT = (key: string) => {
    if (!key) return "";
    const parts = key.split(".");
    const lastPart = parts[parts.length - 1] || key;
    if (lastPart === "title" && parts.length >= 2) {
      const name = parts[parts.length - 2];
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
    if (lastPart === "description" && parts.length >= 2) {
      const name = parts[parts.length - 2];
      return `${name.charAt(0).toUpperCase() + name.slice(1)} Proje Açıklaması`;
    }
    return lastPart;
  };

  // 1. Standard JSON parse
  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) return parsed;
    if (typeof parsed === "object" && parsed !== null) return [parsed];
  } catch {}

  // 2. JS Code evaluation with function execution & mock i18n t()
  try {
    let cleanCode = trimmed
      .replace(/^export\s+default\s+/, "")
      .replace(/^(const|let|var)\s+\w+\s*=\s*/, "")
      .replace(/^module\.exports\s*=\s*/, "")
      .replace(/;\s*$/, "");

    // Create evaluator with `t` parameter provided
    const evalFn = new Function("t", `"use strict"; return (${cleanCode});`);
    let result = evalFn(mockT);

    // If evaluated to a function e.g. `function getPortfolioData(t) { return [...] }`, invoke it with mockT
    if (typeof result === "function") {
      result = result(mockT);
    }

    if (Array.isArray(result)) return result;
    if (typeof result === "object" && result !== null) return [result];
  } catch {
    // 3. Regex Fallback: Extract array literal inside function body
    try {
      const arrayMatch = trimmed.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (arrayMatch) {
        const evalFn = new Function("t", `"use strict"; return (${arrayMatch[0]});`);
        const result = evalFn(mockT);
        if (Array.isArray(result)) return result;
      }
    } catch {}

    throw new Error("Geçerli bir JS nesnesi, fonksiyonu veya JSON dizisi bulunamadı.");
  }

  return [];
}

function JSImportModal({
  isOpen,
  onClose,
  onImport,
  title = "JS / JSON ile Toplu Ekle",
  placeholder = `// Örnek JS Nesne Dizisi:\n[\n  {\n    title: "ChronaMesh",\n    description: "Detaylı proje açıklaması...",\n    category: "Full Stack",\n    stack: ["React", "TypeScript"],\n    imgUrl: "/assets/demo.png",\n    link: "https://...",\n    github: "https://github.com/...",\n    featured: true\n  }\n]`
}: {
  isOpen: boolean;
  onClose: () => void;
  onImport: (code: string) => Promise<void>;
  title?: string;
  placeholder?: string;
}) {
  const [code, setCode] = useState("");
  const [parsedCount, setParsedCount] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!code.trim()) {
      setParsedCount(null);
      setErrorMsg(null);
      return;
    }
    try {
      const items = parseJSArray(code);
      setParsedCount(items.length);
      setErrorMsg(null);
    } catch (err: any) {
      setParsedCount(null);
      setErrorMsg(err.message || "Kod ayrıştırma hatası");
    }
  }, [code]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!code.trim() || errorMsg || !parsedCount) return;
    setSubmitting(true);
    try {
      await onImport(code);
      setCode("");
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] w-screen h-screen bg-black/80 backdrop-blur-md p-4 flex items-center justify-center animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#0d1117] border border-[#1a2035] rounded-2xl shadow-2xl p-5 sm:p-6 text-left flex flex-col max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#1a2035]">
          <div className="flex items-center gap-2">
            <Code2 size={20} className="text-violet-400" />
            <h2 className="text-base sm:text-lg font-bold text-white">{title}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white transition-all">
            <XIcon size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-xs text-gray-400">
            JS nesne dizisini (`export default [...]`, `const data = [...]` veya JSON) buraya yapıştırın. Otomatik ayrıştırılıp veritabanına aktarılacaktır.
          </p>

          <textarea
            rows={10}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-[#161b27] border border-[#1f2937] focus:border-violet-500 rounded-xl p-3 text-xs font-mono text-gray-200 resize-none focus:outline-none"
          />

          {parsedCount !== null && !errorMsg && (
            <div className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <Check size={14} /> Kod başarıyla çözümlendi! Toplam {parsedCount} adet veri aktarılmaya hazır.
            </div>
          )}

          {errorMsg && (
            <div className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-2">
              ⚠️ {errorMsg}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-[#1a2035]">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-xs text-gray-400 hover:text-white bg-white/5">
              İptal
            </button>
            <button
              type="button"
              disabled={!parsedCount || Boolean(errorMsg) || submitting}
              onClick={handleSubmit}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:opacity-50 text-white shadow-lg shadow-violet-900/40 flex items-center gap-1.5"
            >
              <Wand2 size={14} /> Veritabanına Aktar ({parsedCount || 0})
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Portfolio Tab ───────────────────────────────────────────────────────
function PortfolioTab() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  // Filter & Search & View Mode states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState("All");
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | "visible" | "hidden">("all");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    imgUrl: "",
    category: "Full Stack",
    stack: "",
    link: "",
    github: "",
    description: "",
    featured: false,
    showOnHome: true,
  });

  const loadItems = useCallback(() => {
    setLoading(true);
    apiGet<any[]>("/api/portfolio")
      .then((data) => {
        setItems(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setItems([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map((it) => it.id).filter(Boolean));
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    confirmToast(
      `Seçilen ${selectedIds.length} adet projeyi kalıcı olarak veritabanından silmek istediğinizden emin misiniz?`,
      async () => {
        const toastId = toast.loading(`${selectedIds.length} proje veritabanından siliniyor...`);
        try {
          await apiPost("/api/portfolio/bulk-delete", { ids: selectedIds });
          toast.success(`${selectedIds.length} proje başarıyla silindi!`, { id: toastId });
          setSelectedIds([]);
          loadItems();
        } catch {
          toast.error("Toplu silme işlemi sırasında hata oluştu.", { id: toastId });
        }
      },
      `Evet, ${selectedIds.length} Projeyi Sil`
    );
  };

  const handleToggleShowOnHome = async (item: any) => {
    const nextVal = item.showOnHome === false ? true : false;
    const toastId = toast.loading("Görünürlük güncelleniyor...");
    try {
      await apiPatch(`/api/portfolio/${item.id}/toggle-home`);
      toast.success(nextVal ? "Proje anasayfada gösteriliyor! 🟢" : "Proje anasayfadan gizlendi! ⚪", { id: toastId });
      loadItems();
    } catch {
      try {
        await apiPut(`/api/portfolio/${item.id}`, { ...item, showOnHome: nextVal });
        toast.success(nextVal ? "Proje anasayfada gösteriliyor! 🟢" : "Proje anasayfadan gizlendi! ⚪", { id: toastId });
        loadItems();
      } catch {
        toast.error("Görünürlük güncellenemedi.", { id: toastId });
      }
    }
  };

  const handleToggleFeatured = async (item: any) => {
    const nextVal = !toBoolean(item.featured);
    const toastId = toast.loading("Öne çıkarma durumu güncelleniyor...");
    try {
      await apiPut(`/api/portfolio/${item.id}`, { ...item, featured: nextVal });
      toast.success(nextVal ? "Proje vitrinde öne çıkarıldı! ⭐" : "Öne çıkarma kaldırıldı.", { id: toastId });
      loadItems();
    } catch {
      toast.error("İşlem sırasında hata oluştu.", { id: toastId });
    }
  };

  const handleImportPortfolio = async (jsCode: string) => {
    const parsedItems = parseJSArray(jsCode);
    if (parsedItems.length === 0) {
      throw new Error("Kod içerisinde eklenecek eleman bulunamadı.");
    }
    const toastId = toast.loading(`${parsedItems.length} proje veritabanına aktarılıyor...`);
    try {
      await apiPost("/api/portfolio/bulk-seed", { items: parsedItems });
      toast.success(`${parsedItems.length} proje veritabanına eklendi!`, { id: toastId });
      setIsImportModalOpen(false);
      loadItems();
    } catch (err: any) {
      toast.error("Aktarım sırasında hata oluştu.", { id: toastId });
      throw err;
    }
  };

  const openModal = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title || "",
        imgUrl: item.imgUrl || "",
        category: item.category || "Full Stack",
        stack: Array.isArray(item.stack) ? item.stack.join(", ") : item.stack || "",
        link: item.link || "",
        github: item.github || "",
        description: item.description || "",
        featured: toBoolean(item.featured),
        showOnHome: item.showOnHome !== false,
      });
    } else {
      setEditingItem(null);
      setFormData({
        title: "",
        imgUrl: "",
        category: "Full Stack",
        stack: "",
        link: "",
        github: "",
        description: "",
        featured: false,
        showOnHome: true,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      return toast.error("Başlık ve açıklama gereklidir.");
    }
    const stackArray = formData.stack.split(",").map((s) => s.trim()).filter(Boolean);
    const payload = {
      ...formData,
      featured: toBoolean(formData.featured),
      showOnHome: toBoolean(formData.showOnHome),
      stack: stackArray,
    };

    const toastId = toast.loading("Kaydediliyor...");
    try {
      if (editingItem?.id) {
        await apiPut(`/api/portfolio/${editingItem.id}`, payload);
        toast.success("Proje başarıyla güncellendi!", { id: toastId });
      } else {
        await apiPost("/api/portfolio", payload);
        toast.success("Yeni proje başarıyla eklendi!", { id: toastId });
      }
      closeModal();
      loadItems();
    } catch (err: any) {
      toast.error("İşlem sırasında bir hata oluştu.", { id: toastId });
    }
  };

  const handleDelete = (id: string) => {
    confirmToast("Bu projeyi silmek istediğinizden emin misiniz?", async () => {
      try {
        await apiDelete(`/api/portfolio/${id}`);
        toast.success("Proje veritabanından silindi.");
        loadItems();
      } catch {
        toast.error("Silme işlemi sırasında hata oluştu.");
      }
    });
  };

  const handleSeedDefaults = () => {
    confirmToast("Varsayılan örnek projeler veri tabanına aktarılsın mı?", async () => {
      const sampleItems = [
        {
          title: "ChronaMesh",
          imgUrl: "/assets/chronamesh.png",
          stack: ["Vite", "React", "TypeScript", "Cloudflare Workers", "Hono"],
          link: "https://chronamesh.onurd.com.tr",
          github: "https://github.com/onurdrsn/ChronaMesh",
          description: "Multi-tenant SaaS decision modeling platform.",
          category: "Full Stack",
          featured: true,
          showOnHome: true,
        },
        {
          title: "Boardra",
          imgUrl: "/assets/Boardra.png",
          stack: ["React Native", "TypeScript", "Expo", "Zustand", "Cloudflare Workers"],
          link: "https://boardra.onurd.com.tr",
          github: "https://github.com/onurdrsn/Boardra",
          description: "Real-time collaborative whiteboard platform.",
          category: "Full Stack",
          featured: true,
          showOnHome: true,
        },
        {
          title: "OrbitEdge",
          imgUrl: "/assets/orbitedge.png",
          stack: ["Vite", "TypeScript", "Hono", "Cloudflare Workers", "PostgreSQL"],
          link: "https://orbitedge.onurd.com.tr",
          github: "https://github.com/onurdrsn/OrbitEdge",
          description: "Live satellite telemetry and orbit tracking.",
          category: "Full Stack",
          featured: true,
          showOnHome: true,
        },
      ];
      const toastId = toast.loading("Örnek projeler yükleniyor...");
      try {
        await apiPost("/api/portfolio/bulk-seed", { items: sampleItems });
        toast.success("Örnek projeler veri tabanına eklendi!", { id: toastId });
        loadItems();
      } catch {
        toast.error("Yükleme sırasında hata oluştu.", { id: toastId });
      }
    }, "Evet, Yükle");
  };

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter((it) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (it.title && it.title.toLowerCase().includes(q)) ||
        (it.description && it.description.toLowerCase().includes(q)) ||
        (Array.isArray(it.stack) && it.stack.some((s: string) => s.toLowerCase().includes(q)));

      const matchesCat = selectedCat === "All" || it.category === selectedCat;

      const isVisibleOnHome = it.showOnHome !== false;
      const matchesVisibility =
        visibilityFilter === "all" ||
        (visibilityFilter === "visible" && isVisibleOnHome) ||
        (visibilityFilter === "hidden" && !isVisibleOnHome);

      return matchesSearch && matchesCat && matchesVisibility;
    });
  }, [items, searchQuery, selectedCat, visibilityFilter]);

  const totalVisibleCount = items.filter((i) => i.showOnHome !== false).length;
  const totalHiddenCount = items.filter((i) => i.showOnHome === false).length;
  const totalFeaturedCount = items.filter((i) => toBoolean(i.featured)).length;

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <FolderGit2 className="text-violet-400" /> Portfolyo Projeleri & Siteleri
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Anasayfada gösterilecek veya gizlenecek projelerinizi, canlı demo ve depo bağlantılarını yönetin.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border border-violet-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Code2 size={14} className="text-violet-400" /> JS ile İçe Aktar
          </button>
          <button
            onClick={handleSeedDefaults}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles size={14} className="text-amber-400" /> Örnekleri Yükle
          </button>
          <button
            onClick={() => openModal()}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-violet-900/30 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={16} /> Yeni Proje Ekle
          </button>
        </div>
      </div>

      {/* Statistics Overview Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0d1117] border border-[#1a2035] flex items-center justify-between">
          <div>
            <div className="text-2xl font-black text-white">{items.length}</div>
            <div className="text-xs text-gray-400 font-medium">Toplam Proje</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-violet-600/10 text-violet-400 flex items-center justify-center font-bold">
            <FolderGit2 size={18} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0d1117] border border-[#1a2035] flex items-center justify-between">
          <div>
            <div className="text-2xl font-black text-emerald-400">{totalVisibleCount}</div>
            <div className="text-xs text-gray-400 font-medium">Anasayfada Yayında</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
            <Eye size={18} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0d1117] border border-[#1a2035] flex items-center justify-between">
          <div>
            <div className="text-2xl font-black text-gray-400">{totalHiddenCount}</div>
            <div className="text-xs text-gray-400 font-medium">Anasayfada Gizli</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gray-800 text-gray-400 flex items-center justify-center font-bold">
            <EyeOff size={18} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0d1117] border border-[#1a2035] flex items-center justify-between">
          <div>
            <div className="text-2xl font-black text-amber-400">{totalFeaturedCount}</div>
            <div className="text-xs text-gray-400 font-medium">Öne Çıkan Vitrin</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
            <Star size={18} />
          </div>
        </div>
      </div>

      {/* Control Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#0d1117] border border-[#1a2035] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Proje veya teknoloji filtrele..."
              className="w-full bg-[#161b27] border border-[#1f2937] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                <XIcon size={13} />
              </button>
            )}
          </div>

          {/* Visibility Filter Selector */}
          <select
            value={visibilityFilter}
            onChange={(e: any) => setVisibilityFilter(e.target.value)}
            className="bg-[#161b27] border border-[#1f2937] rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-violet-500 cursor-pointer"
          >
            <option value="all">Tüm Görünürlükler</option>
            <option value="visible">🟢 Sadece Anasayfada Yayında ({totalVisibleCount})</option>
            <option value="hidden">⚪ Sadece Anasayfada Gizli ({totalHiddenCount})</option>
          </select>

          {/* Category Filter Selector */}
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="bg-[#161b27] border border-[#1f2937] rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-violet-500 cursor-pointer"
          >
            <option value="All">Tüm Kategoriler</option>
            <option value="Full Stack">Full Stack</option>
            <option value="Frontend">Frontend</option>
            <option value="Machine Learning">Machine Learning</option>
            <option value="AI">AI</option>
            <option value="Game Dev">Game Dev</option>
            <option value="Data Science">Data Science</option>
          </select>
        </div>

        {/* View Switcher & Bulk Actions */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 transition-all flex items-center gap-1.5"
            >
              <Trash2 size={13} /> Seçilenleri Sil ({selectedIds.length})
            </button>
          )}

          {filteredItems.length > 0 && (
            <button
              onClick={toggleSelectAll}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-all cursor-pointer"
            >
              {selectedIds.length === filteredItems.length ? "Seçimi Kaldır" : "Tümünü Seç"}
            </button>
          )}

          <div className="flex items-center gap-1 bg-[#161b27] p-1 rounded-xl border border-[#1f2937]">
            <button
              onClick={() => setViewMode("cards")}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "cards" ? "bg-violet-600/30 text-violet-300 border border-violet-500/30" : "text-gray-400 hover:text-white"
              }`}
              title="Kart Görünümü"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "table" ? "bg-violet-600/30 text-violet-300 border border-violet-500/30" : "text-gray-400 hover:text-white"
              }`}
              title="Tablo Görünümü"
            >
              <Layers size={15} />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-[#0d1117] border border-[#1a2035] rounded-3xl">
          <FolderGit2 size={48} className="mx-auto mb-3 text-gray-600" />
          <h3 className="text-base font-bold text-white mb-1">Eşleşen Proje Bulunamadı</h3>
          <p className="text-gray-500 text-xs max-w-sm mx-auto">
            Filtreleme kriterlerinize uygun proje bulunmuyor. Yeni bir proje ekleyebilir veya filtreleri temizleyebilirsiniz.
          </p>
        </div>
      ) : viewMode === "cards" ? (
        /* ─── Cards Grid View ─── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item, idx) => {
            const isSelected = selectedIds.includes(item.id);
            const isVisibleOnHome = item.showOnHome !== false;
            const isFeatured = toBoolean(item.featured);

            return (
              <div
                key={item.id || idx}
                className={`relative bg-[#0d1117] border rounded-3xl p-5 flex flex-col justify-between transition-all duration-300 group shadow-xl ${
                  isSelected
                    ? "border-violet-500 bg-violet-950/20 shadow-violet-900/20"
                    : "border-[#1a2035] hover:border-violet-500/40"
                }`}
              >
                <div>
                  {/* Thumbnail Cover */}
                  <div className="relative w-full h-44 rounded-2xl overflow-hidden mb-4 bg-gray-900 border border-[#1f2937]/50">
                    <div className="absolute top-2.5 left-2.5 z-10">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectItem(item.id)}
                        className="w-4 h-4 rounded border-gray-700 bg-black/80 text-violet-600 focus:ring-violet-500 cursor-pointer"
                      />
                    </div>

                    <img
                      src={item.imgUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e: any) => {
                        e.target.src =
                          "https://placehold.co/400x225/0f172a/8b5cf6?text=" +
                          encodeURIComponent(item.title);
                      }}
                    />

                    {/* Category Tag */}
                    <span className="absolute bottom-2.5 left-2.5 bg-gray-950/85 backdrop-blur text-violet-300 text-[10px] font-bold px-2.5 py-0.5 rounded-lg border border-violet-500/20">
                      {item.category}
                    </span>
                  </div>

                  {/* Interactive Status Pills (Click to toggle) */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {/* Toggle Show on Home */}
                    <button
                      type="button"
                      onClick={() => handleToggleShowOnHome(item)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                        isVisibleOnHome
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25"
                          : "bg-gray-800/80 text-gray-400 border-gray-700 hover:bg-gray-700 hover:text-white"
                      }`}
                      title={isVisibleOnHome ? "Tıkla: Anasayfadan Gizle" : "Tıkla: Anasayfada Göster"}
                    >
                      {isVisibleOnHome ? <Eye size={12} /> : <EyeOff size={12} />}
                      <span>{isVisibleOnHome ? "Anasayfada Yayında" : "Anasayfada Gizli"}</span>
                    </button>

                    {/* Toggle Featured */}
                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(item)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                        isFeatured
                          ? "bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25"
                          : "bg-gray-900/60 text-gray-500 border-gray-800 hover:text-gray-300"
                      }`}
                      title={isFeatured ? "Tıkla: Öne Çıkarmayı Kaldır" : "Tıkla: Vitrinde Öne Çıkar"}
                    >
                      <Sparkles size={11} className={isFeatured ? "text-amber-400" : ""} />
                      <span>{isFeatured ? "Öne Çıkan Vitrin" : "Standart"}</span>
                    </button>
                  </div>

                  <h3 className="font-bold text-white text-lg mb-1.5 group-hover:text-violet-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Tech Stack Chips */}
                  {Array.isArray(item.stack) && item.stack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {item.stack.slice(0, 4).map((tech: string) => (
                        <span
                          key={tech}
                          className="text-[10px] bg-violet-500/10 text-violet-300 px-2.5 py-0.5 rounded-md border border-violet-500/20 font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                      {item.stack.length > 4 && (
                        <span className="text-[10px] text-gray-500 px-1 py-0.5">
                          +{item.stack.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="flex items-center justify-between pt-3.5 border-t border-[#1a2035]">
                  <div className="flex items-center gap-1.5">
                    {item.link && item.link !== "#" && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white text-xs flex items-center gap-1 transition-all"
                        title="Canlı Siteyi Aç"
                      >
                        <ExternalLink size={13} />
                      </a>
                    )}
                    {item.github && (
                      <a
                        href={item.github}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white text-xs flex items-center gap-1 transition-all"
                        title="GitHub Kodunu Gör"
                      >
                        <Github size={13} />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openModal(item)}
                      className="px-3 py-1.5 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 transition-all text-xs flex items-center gap-1 font-bold cursor-pointer"
                    >
                      <Edit3 size={13} /> Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all text-xs cursor-pointer"
                      title="Projeyi Sil"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ─── Compact Table View ─── */
        <div className="bg-[#0d1117] border border-[#1a2035] rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#161b27] text-gray-400 uppercase tracking-wider text-[10px] font-bold border-b border-[#1f2937]">
                <tr>
                  <th className="p-3.5 w-10 text-center">Seç</th>
                  <th className="p-3.5">Proje Adı & Görsel</th>
                  <th className="p-3.5">Kategori</th>
                  <th className="p-3.5">Anasayfada Göster</th>
                  <th className="p-3.5">Öne Çıkan</th>
                  <th className="p-3.5">Bağlantılar</th>
                  <th className="p-3.5 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a2035]">
                {filteredItems.map((item, idx) => {
                  const isSelected = selectedIds.includes(item.id);
                  const isVisibleOnHome = item.showOnHome !== false;
                  const isFeatured = toBoolean(item.featured);

                  return (
                    <tr key={item.id || idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectItem(item.id)}
                          className="w-4 h-4 rounded border-gray-700 bg-black text-violet-600 focus:ring-violet-500 cursor-pointer"
                        />
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.imgUrl}
                            alt=""
                            className="w-12 h-8 rounded-lg object-cover bg-gray-900 border border-[#1f2937]"
                            onError={(e: any) => {
                              e.target.src =
                                "https://placehold.co/100x60/0f172a/8b5cf6?text=" +
                                encodeURIComponent(item.title);
                            }}
                          />
                          <div>
                            <span className="font-bold text-white block text-sm">{item.title}</span>
                            <span className="text-[11px] text-gray-500 line-clamp-1 max-w-xs">{item.description}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded bg-violet-500/10 text-violet-300 font-semibold border border-violet-500/20 text-[10px]">
                          {item.category}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <button
                          type="button"
                          onClick={() => handleToggleShowOnHome(item)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all flex items-center gap-1 cursor-pointer ${
                            isVisibleOnHome
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                              : "bg-gray-800 text-gray-400 border-gray-700"
                          }`}
                        >
                          {isVisibleOnHome ? <Eye size={11} /> : <EyeOff size={11} />}
                          <span>{isVisibleOnHome ? "Yayında" : "Gizli"}</span>
                        </button>
                      </td>
                      <td className="p-3.5">
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(item)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all flex items-center gap-1 cursor-pointer ${
                            isFeatured
                              ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                              : "bg-gray-900 text-gray-500 border-gray-800"
                          }`}
                        >
                          <Sparkles size={11} className={isFeatured ? "text-amber-400" : ""} />
                          <span>{isFeatured ? "Vitrin" : "Standart"}</span>
                        </button>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          {item.link && item.link !== "#" && (
                            <a href={item.link} target="_blank" rel="noreferrer" className="p-1 rounded bg-gray-900 text-gray-400 hover:text-white" title="Canlı Site">
                              <ExternalLink size={13} />
                            </a>
                          )}
                          {item.github && (
                            <a href={item.github} target="_blank" rel="noreferrer" className="p-1 rounded bg-gray-900 text-gray-400 hover:text-white" title="GitHub Deposu">
                              <Github size={13} />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => openModal(item)} className="p-1.5 rounded-lg bg-violet-500/10 text-violet-400 hover:bg-violet-500/20" title="Düzenle">
                            <Edit3 size={13} />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20" title="Sil">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── ADD / EDIT PROJECT MODAL ─── */}
      {isModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] w-screen h-screen bg-black/80 backdrop-blur-md p-4 flex items-center justify-center animate-fadeIn">
            <div className="relative w-full max-w-xl bg-[#0d1117] border border-[#1a2035] rounded-3xl shadow-2xl p-6 sm:p-7 text-left flex flex-col max-h-[85vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-[#1a2035]">
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <FolderGit2 size={18} className="text-violet-400" />
                  {editingItem ? "Projeyi Düzenle" : "Yeni Proje Ekle"}
                </h2>
                <button onClick={closeModal} className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white transition-all cursor-pointer">
                  <XIcon size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    Proje Başlığı *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-[#161b27] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500"
                    placeholder="ChronaMesh"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                      Kategori
                    </label>
                    <CustomSelect
                      value={formData.category}
                      onChange={(val) => setFormData({ ...formData, category: val })}
                      options={[
                        { label: "Full Stack", value: "Full Stack" },
                        { label: "Frontend", value: "Frontend" },
                        { label: "Machine Learning", value: "Machine Learning" },
                        { label: "AI", value: "AI" },
                        { label: "Game Dev", value: "Game Dev" },
                        { label: "Data Science", value: "Data Science" },
                      ]}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                        Görsel URL
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsCropModalOpen(true)}
                        className="text-[10px] font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1 bg-violet-500/10 hover:bg-violet-500/20 px-2 py-0.5 rounded border border-violet-500/20 transition-all cursor-pointer"
                      >
                        <Upload size={11} /> Fotoğraf Kırp
                      </button>
                    </div>
                    <input
                      type="text"
                      value={formData.imgUrl}
                      onChange={(e) => setFormData({ ...formData, imgUrl: e.target.value })}
                      className="w-full bg-[#161b27] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500"
                      placeholder="/assets/chronamesh.png veya https://..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    Teknoloji Yığını (Virgülle Ayırın)
                  </label>
                  <input
                    type="text"
                    value={formData.stack}
                    onChange={(e) => setFormData({ ...formData, stack: e.target.value })}
                    className="w-full bg-[#161b27] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500"
                    placeholder="React, Vite, TypeScript, Cloudflare Workers, Hono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                      Canlı Demo Bağlantısı (URL)
                    </label>
                    <input
                      type="text"
                      value={formData.link}
                      onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                      className="w-full bg-[#161b27] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500"
                      placeholder="https://chronamesh.onurd.com.tr"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                      GitHub Depo Bağlantısı (URL)
                    </label>
                    <input
                      type="text"
                      value={formData.github}
                      onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                      className="w-full bg-[#161b27] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500"
                      placeholder="https://github.com/onurdrsn/..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    Proje Açıklaması *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-[#161b27] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 resize-none"
                    placeholder="Projenin mimarisini ve özelliklerini açıklayın..."
                  />
                </div>

                {/* VISIBILITY & FEATURED TOGGLES */}
                <div className="p-3.5 rounded-2xl bg-[#161b27] border border-[#1f2937] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Eye size={13} className="text-emerald-400" /> Anasayfada Göster
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        Açıkken ziyaretçiler bu projeyi anasayfa vitrininde görür; kapalıyken gizlenir.
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.showOnHome}
                        onChange={(e) => setFormData({ ...formData, showOnHome: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  <div className="pt-2 border-t border-[#1f2937] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Sparkles size={13} className="text-amber-400" /> Öne Çıkanlar (Featured Showcase)
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        Spotlight 3D vitrininde ana slayt olarak döndürülür.
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={toBoolean(formData.featured)}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-[#1a2035]">
                  <button type="button" onClick={closeModal} className="px-4 py-2 rounded-xl text-xs text-gray-400 hover:text-white bg-white/5 cursor-pointer">
                    İptal
                  </button>
                  <button type="submit" className="px-5 py-2.5 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/40 flex items-center gap-1.5 cursor-pointer">
                    <Save size={14} /> Kaydet
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
      <JSImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportPortfolio}
        title="Portfolyo Projelerini JS ile Yükle"
      />
      <ImageCropModal
        isOpen={isCropModalOpen}
        onClose={() => setIsCropModalOpen(false)}
        onCropComplete={(croppedDataUrl) => setFormData((prev) => ({ ...prev, imgUrl: croppedDataUrl }))}
      />
    </div>
  );
}

// ─── Timeline Tab ────────────────────────────────────────────────────────
function TimelineTab() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    year: "", company: "", title: "", duration: "", detailsRaw: ""
  });

  const loadItems = useCallback(() => {
    setLoading(true);
    apiGet<any[]>("/api/timeline")
      .then((data) => {
        setItems(Array.isArray(data) ? data : []);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadItems(); }, [loadItems]);

  const toggleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((it) => it.id).filter(Boolean));
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    confirmToast(
      `Seçilen ${selectedIds.length} adet deneyim kaydını silmek istediğinizden emin misiniz?`,
      async () => {
        const toastId = toast.loading(`${selectedIds.length} deneyim veritabanından siliniyor...`);
        try {
          await apiPost("/api/timeline/bulk-delete", { ids: selectedIds });
          toast.success(`${selectedIds.length} deneyim kaydı silindi!`, { id: toastId });
          setSelectedIds([]);
          loadItems();
        } catch {
          toast.error("Toplu silme sırasında hata oluştu.", { id: toastId });
        }
      },
      `Evet, ${selectedIds.length} Kaydı Sil`
    );
  };

  const handleImportTimeline = async (jsCode: string) => {
    const parsedItems = parseJSArray(jsCode);
    if (parsedItems.length === 0) {
      throw new Error("Kod içerisinde eklenecek deneyim kaydı bulunamadı.");
    }
    const toastId = toast.loading(`${parsedItems.length} deneyim kaydı veritabanına aktarılıyor...`);
    try {
      await apiPost("/api/timeline/bulk-seed", { items: parsedItems });
      toast.success(`${parsedItems.length} deneyim kaydı veritabanına eklendi!`, { id: toastId });
      setIsImportModalOpen(false);
      loadItems();
    } catch (err: any) {
      toast.error("Aktarım sırasında hata oluştu.", { id: toastId });
      throw err;
    }
  };

  const openModal = (item?: any) => {
    if (item) {
      setEditingItem(item);
      const detailsStr = Array.isArray(item.details) ? item.details.join("\n") : (item.details || "");
      setFormData({
        year: item.year || "",
        company: item.company || "",
        title: item.title || "",
        duration: item.duration || "",
        detailsRaw: detailsStr
      });
    } else {
      setEditingItem(null);
      setFormData({ year: "", company: "", title: "", duration: "", detailsRaw: "" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.year.trim() || !formData.company.trim() || !formData.title.trim()) {
      return toast.error("Yıl, şirket ve unvan zorunludur.");
    }
    const details = formData.detailsRaw.split("\n").map(d => d.trim()).filter(Boolean);
    const payload = { year: formData.year, company: formData.company, title: formData.title, duration: formData.duration, details };

    const toastId = toast.loading("Kaydediliyor...");
    try {
      if (editingItem?.id) {
        await apiPut(`/api/timeline/${editingItem.id}`, payload);
        toast.success("Deneyim güncellendi!", { id: toastId });
      } else {
        await apiPost("/api/timeline", payload);
        toast.success("Deneyim eklendi!", { id: toastId });
      }
      closeModal();
      loadItems();
    } catch {
      toast.error("İşlem sırasında hata oluştu.", { id: toastId });
    }
  };

  const handleDelete = (id: string) => {
    confirmToast("Bu deneyim kaydını silmek istiyor musunuz?", async () => {
      try {
        await apiDelete(`/api/timeline/${id}`);
        toast.success("Deneyim kaydı veritabanından silindi.");
        loadItems();
      } catch {
        toast.error("Silme işlemi sırasında hata oluştu.");
      }
    });
  };

  const handleSeedDefaults = () => {
    confirmToast("Varsayılan zaman çizelgesi verileri yüklensin mi?", async () => {
      const sampleItems = [
        { year: "2024 - 2026", company: "Solvent Yazılım", title: "Full Stack Developer", duration: "Ağustos 2024 – Ocak 2026", details: ["ASP.NET ve Angular tabanlı uygulamalara yapay zekâ modelleri entegre edildi."] },
        { year: "2023", company: "Havelsan", title: "Data Analyst Intern", duration: "Nisan 2023 – Temmuz 2023", details: ["Elasticsearch, Hadoop ve Apache Spark ile büyük veri işleme görevleri yürütüldü."] }
      ];
      const toastId = toast.loading("Yükleniyor...");
      try {
        await apiPost("/api/timeline/bulk-seed", { items: sampleItems });
        toast.success("Varsayılan kariyer verileri eklendi!", { id: toastId });
        loadItems();
      } catch {
        toast.error("Yükleme sırasında hata oluştu.", { id: toastId });
      }
    }, "Evet, Yükle");
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Kariyer & Zaman Çizelgesi</h1>
          <p className="text-sm text-gray-500">{items.length} deneyim kaydı listeleniyor {selectedIds.length > 0 && `• ${selectedIds.length} seçili`}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {items.length > 0 && (
            <button
              onClick={toggleSelectAll}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-all"
            >
              {selectedIds.length === items.length ? "Seçimi Kaldır" : "Tümünü Seç"}
            </button>
          )}

          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 transition-all flex items-center gap-1.5 animate-fadeIn"
            >
              <Trash2 size={14} className="text-red-400" /> Seçilenleri Sil ({selectedIds.length})
            </button>
          )}

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border border-violet-500/20 transition-all flex items-center gap-1.5"
          >
            <Code2 size={14} className="text-violet-400" /> JS ile Toplu Ekle
          </button>
          <button onClick={handleSeedDefaults} className="px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-all flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-400" /> Varsayılanları Yükle (Seed)
          </button>
          <button onClick={() => openModal()} className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-violet-900/30 transition-all flex items-center gap-1.5">
            <Plus size={16} /> Yeni Deneyim Ekle
          </button>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-[#0d1117] border border-[#1a2035] rounded-2xl">
          <p className="text-gray-500 text-sm">Henüz eklenmiş deneyim kaydı yok.</p>
        </div>
      ) : (
        <div className="space-y-4">
        {items.map((item, idx) => {
          const isSelected = selectedIds.includes(item.id);
          return (
            <div
              key={item.id || idx}
              className={`bg-[#0d1117] border rounded-2xl p-5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                isSelected
                  ? "border-violet-500 bg-violet-950/20 shadow-lg shadow-violet-900/20"
                  : "border-[#1a2035] hover:border-violet-500/30"
              }`}
            >
              <div className="flex items-start gap-3 flex-1">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelectItem(item.id)}
                  className="mt-1 w-4 h-4 rounded border-gray-700 bg-black/70 text-violet-600 focus:ring-violet-500 cursor-pointer flex-shrink-0"
                />

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-violet-600/20 text-violet-300 font-bold text-xs rounded-lg border border-violet-500/30">{item.year}</span>
                    <span className="text-sm font-semibold text-white">{item.company}</span>
                    <span className="text-xs text-gray-500">· {item.duration}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  {Array.isArray(item.details) && item.details.length > 0 && (
                    <ul className="list-disc list-inside text-xs text-gray-400 space-y-1">
                      {item.details.map((d: string, i: number) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                <button onClick={() => openModal(item)} className="p-2 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 transition-all text-xs flex items-center gap-1 font-medium">
                  <Edit3 size={14} /> Düzenle
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all text-xs">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Timeline Modal */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] w-screen h-screen bg-black/80 backdrop-blur-md p-4 flex items-center justify-center animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#0d1117] border border-[#1a2035] rounded-2xl shadow-2xl p-5 sm:p-6 text-left flex flex-col max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#1a2035]">
              <h2 className="text-base sm:text-lg font-bold text-white">{editingItem ? "Deneyim Düzenle" : "Yeni Deneyim Ekle"}</h2>
              <button onClick={closeModal} className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white transition-all"><XIcon size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Yıl Aralığı *</label>
                  <input type="text" required value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} className="w-full bg-[#161b27] border border-[#1f2937] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500" placeholder="2024 - 2026" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Şirket / Kurum *</label>
                  <input type="text" required value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} className="w-full bg-[#161b27] border border-[#1f2937] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500" placeholder="Havelsan" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Pozisyon Unvanı *</label>
                  <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full bg-[#161b27] border border-[#1f2937] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500" placeholder="Senior Full Stack Developer" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Çalışma Süresi</label>
                  <input type="text" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} className="w-full bg-[#161b27] border border-[#1f2937] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500" placeholder="Ağustos 2024 – Ocak 2026" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Detaylar / Maddeler (Her satıra bir madde yazın)</label>
                <textarea rows={4} value={formData.detailsRaw} onChange={(e) => setFormData({ ...formData, detailsRaw: e.target.value })} className="w-full bg-[#161b27] border border-[#1f2937] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500 resize-none" placeholder="Mikrosis mimarileri geliştirildi&#10;Gerçek zamanlı web socket uygulamaları yapıldı" />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#1a2035]">
                <button type="button" onClick={closeModal} className="px-4 py-2 rounded-xl text-xs text-gray-400 hover:text-white bg-white/5">İptal</button>
                <button type="submit" className="px-5 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/40 flex items-center gap-1.5">
                  <Save size={14} /> Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
      <JSImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportTimeline}
        title="Deneyim Kayıtlarını JS ile Yükle"
        placeholder={`// Örnek JS Nesne Dizisi:\n[\n  {\n    year: "2024 - 2026",\n    company: "Şirket Adı",\n    title: "Pozisyon Unvanı",\n    duration: "Çalışma Süresi",\n    details: ["Mikrosis mimarileri geliştirildi", "WebSocket servisleri yazıldı"]\n  }\n]`}
      />
    </div>
  );
}

// ─── Spinner ───────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div className="flex justify-center py-20">
      <div className="w-10 h-10 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin" />
    </div>
  );
}