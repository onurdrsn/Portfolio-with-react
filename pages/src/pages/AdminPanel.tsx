import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from "../lib/api";
import toast from "react-hot-toast";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  LayoutDashboard, FileText, MessageSquare, PenSquare,
  ExternalLink, Trash2, Eye, EyeOff, Edit3, CheckCircle,
  XCircle, Clock, Home, ChevronRight, BarChart3, Users,
  BookOpen, TrendingUp, Monitor, Smartphone, Maximize2,
  Minimize2, X as XIcon, Code2
} from "lucide-react";

// ─── Markdown Preview ──────────────────────────────────────────────────
import { renderMarkdown } from "../lib/markdown";

// ─── Quill Dark Styles ─────────────────────────────────────────────────
const QUILL_STYLE = `
  .quill{background:#0f1117;border-radius:0.75rem;overflow:hidden;border:1px solid #1f2937;transition:all 0.3s}
  .quill:focus-within{border-color:#7c3aed;box-shadow:0 0 0 2px rgba(124,58,237,0.15)}
  .ql-toolbar.ql-snow{border:none!important;border-bottom:1px solid #1f2937!important;background:#161b27;padding:10px}
  .ql-container.ql-snow{border:none!important;min-height:420px;font-family:inherit;font-size:0.95rem;color:#e5e7eb}
  .ql-snow .ql-stroke{stroke:#6b7280}.ql-snow .ql-fill,.ql-snow .ql-stroke.ql-fill{fill:#6b7280}
  .ql-snow .ql-picker,.ql-snow .ql-picker-options{color:#6b7280;background:#161b27;border-color:#1f2937}
  .ql-editor.ql-blank::before{color:#4b5563;font-style:normal}
  .ql-snow.ql-toolbar button:hover .ql-stroke{stroke:#a78bfa}
  .ql-snow.ql-toolbar button:hover .ql-fill{fill:#a78bfa}
  .ql-editor img{border-radius:0.5rem;max-width:100%;margin:10px 0}
  .ql-editor pre{background:#1f2937;border-radius:6px;padding:12px;color:#e5e7eb;font-family:monospace}
  .ql-editor code{background:#1f2937;padding:2px 6px;border-radius:4px;font-family:monospace;color:#a78bfa}
  @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  .animate-fadeIn{animation:fadeIn 0.25s ease forwards}
  @keyframes slideIn{from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:translateX(0)}}
  .animate-slideIn{animation:slideIn 0.2s ease forwards}
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

type Tab = "dashboard" | "posts" | "comments" | "new-post";

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
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest px-3 mb-2">Yönetim</p>
          {[
            { id: "dashboard" as Tab, label: "Dashboard", icon: LayoutDashboard },
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
          { id: "posts" as Tab, icon: FileText, label: "Yazılar" },
          { id: "comments" as Tab, icon: MessageSquare, label: "Yorumlar" },
          { id: "new-post" as Tab, icon: PenSquare, label: "Yeni" },
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => goTab(id)}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-semibold transition-all ${tab === id ? "text-violet-400 bg-violet-500/10" : "text-gray-600"
              }`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Main ── */}
      <main className="flex-1 sm:ml-64 flex flex-col min-h-screen">
        <div className="flex-1 p-4 sm:p-8 pt-16 sm:pt-8 pb-24 sm:pb-8 max-w-6xl w-full mx-auto">
          <div className="animate-fadeIn">
            {editingPost ? (
              <PostEditor post={editingPost} onSaved={() => setEditingPost(null)} onCancel={() => setEditingPost(null)} />
            ) : (
              <>
                {tab === "dashboard" && <DashboardTab onNavigate={goTab} />}
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

  const handleDelete = async (id: string) => {
    if (!confirm("Yazıyı kalıcı olarak silmek istiyor musunuz?")) return;
    try {
      await apiDelete(`/api/posts/${id}`);
      setPosts((p) => p.filter((post) => post.id !== id));
      toast.success("Yazı silindi.");
    } catch { }
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

  if (loading) return <Spinner />;

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

      {filtered.length === 0 && (
        <div className="text-center py-20 text-gray-600">
          <FileText size={40} className="mx-auto mb-3 opacity-30" />
          <p>Yazı bulunamadı.</p>
        </div>
      )}

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
                onClick={() => onEdit(post)}
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
                onClick={() => onEdit(post)}
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

  const remove = async (id: string) => {
    if (!confirm("Bu yorumu silmek istediğinizden emin misiniz?")) return;
    try {
      await apiDelete(`/api/comments/${id}`);
      setComments((prev) => prev.filter((c) => c.id !== id));
      toast.success("Yorum silindi.");
    } catch { }
  };

  const filtered = comments.filter((c) =>
    filter === "all" ? true : filter === "pending" ? !c.approved : c.approved
  );

  const pendingCount = comments.filter((c) => !c.approved).length;

  if (loading) return <Spinner />;

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

      {filtered.length === 0 && (
        <div className="text-center py-20 bg-[#0d1117] border border-[#1a2035] rounded-2xl text-gray-600">
          <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
          <p>{filter === "pending" ? "Bekleyen yorum yok." : "Yorum bulunamadı."}</p>
        </div>
      )}

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
  const [showPreview, setShowPreview] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [previewScale, setPreviewScale] = useState(1);
  const [previewOpen, setPreviewOpen] = useState(true);
  const [previewMinimized, setPreviewMinimized] = useState(false);
  const [previewClosing, setPreviewClosing] = useState(false);

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
              onClick={() => setEditorMode("rich")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${editorMode === "rich" ? "bg-violet-600/20 text-violet-300 border border-violet-500/20" : "text-gray-500 hover:text-gray-300"}`}
            >
              <Edit3 size={12} /> Rich
            </button>
            <button
              onClick={() => setEditorMode("markdown")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${editorMode === "markdown" ? "bg-violet-600/20 text-violet-300 border border-violet-500/20" : "text-gray-500 hover:text-gray-300"}`}
            >
              <Code2 size={12} /> MD
            </button>
          </div>
          <button
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
          <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">Kısa Özet</label>
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
              <ReactQuill theme="snow" value={content} onChange={setContent} modules={quillModules} placeholder="İçeriğinizi buraya yazın..." />
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
          className="prose prose-invert prose-violet max-w-none prose-sm prose-headings:text-white prose-p:text-gray-300 prose-a:text-violet-400 prose-code:text-violet-300 prose-code:bg-gray-800 prose-pre:bg-gray-800"
          dangerouslySetInnerHTML={{ __html: html || "<p class='text-gray-500'>Henüz içerik yok.</p>" }}
        />
      </div>
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