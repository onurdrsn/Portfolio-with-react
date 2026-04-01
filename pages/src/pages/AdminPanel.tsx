import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from "../lib/api";
import toast from "react-hot-toast";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

// ─── Custom Dark Mode Quill Styles ─────────────────────────────────────
const QUILL_STYLE = `
  .quill { background-color: #111827; border-radius: 0.75rem; overflow: hidden; border: 1px solid #374151; box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06); transition: all 0.3s; }
  .quill:focus-within { border-color: #8b5cf6; box-shadow: 0 0 0 1px #8b5cf6; }
  .ql-toolbar.ql-snow { border: none !important; border-bottom: 1px solid #374151 !important; background: #1f2937; padding: 12px; }
  .ql-container.ql-snow { border: none !important; min-height: 450px; font-family: inherit; font-size: 0.95rem; color: #f3f4f6; }
  .ql-snow .ql-stroke { stroke: #9ca3af; }
  .ql-snow .ql-fill, .ql-snow .ql-stroke.ql-fill { fill: #9ca3af; }
  .ql-snow .ql-picker, .ql-snow .ql-picker-options { color: #9ca3af; background-color: #1f2937; border-color: #374151; }
  .ql-editor.ql-blank::before { color: #6b7280; font-style: normal; }
  .ql-snow.ql-toolbar button:hover .ql-stroke, .ql-snow .ql-picker-label:hover .ql-stroke { stroke: #a78bfa; }
  .ql-snow.ql-toolbar button:hover .ql-fill, .ql-snow .ql-picker-label:hover .ql-fill { fill: #a78bfa; }
  .ql-editor img { border-radius: 0.5rem; max-width: 100%; margin: 10px 0; }
`;

// ─── Types ─────────────────────────────────────────────────────────────
interface Post {
  id: string; title: string; slug: string; content: string; excerpt: string | null; coverImage: string | null;
  tags: string[]; published: boolean; createdAt: string; updatedAt: string;
}

interface PendingComment {
  id: string; postId: string; authorName: string; authorEmail: string; content: string; createdAt: string;
}

type Tab = "dashboard" | "posts" | "comments" | "new-post";

// ─── Component ─────────────────────────────────────────────────────────
export default function AdminPanel() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) navigate("/");
  }, [user, loading, navigate]);

  if (loading || !user?.isAdmin) return null;

  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-200">
      <style>{QUILL_STYLE}</style>

      {/* Sidebar Navigation */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col hidden sm:flex">
        <div className="p-6 border-b border-gray-800">
          <Link to="/" className="flex flex-col gap-1 group">
            <span className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent group-hover:from-violet-300 group-hover:to-indigo-300 transition-all">Panel</span>
            <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> Root Yöneticisi
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-2">
          <button onClick={() => { setTab("dashboard"); setEditingPost(null); }} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${tab === "dashboard" && !editingPost ? "bg-violet-600/10 text-violet-400 border border-violet-500/20" : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"}`}>
            📊 Dashboard
          </button>
          <button onClick={() => { setTab("posts"); setEditingPost(null); }} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${tab === "posts" && !editingPost ? "bg-violet-600/10 text-violet-400 border border-violet-500/20" : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"}`}>
            📂 Blog Yazıları
          </button>
          <button onClick={() => { setTab("comments"); setEditingPost(null); }} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${tab === "comments" && !editingPost ? "bg-violet-600/10 text-violet-400 border border-violet-500/20" : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"}`}>
            💬 Yorum Onayları
          </button>
          <button onClick={() => { setTab("new-post"); setEditingPost(null); }} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm mt-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg hover:shadow-violet-500/25`}>
            ✏️ Yeni Yazı Ekle
          </button>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center font-bold text-violet-400">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white">@{user.username}</span>
              <button onClick={() => navigate("/blog")} className="text-xs text-violet-400 hover:text-violet-300 text-left">Blog'a Dön ↗</button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto w-full">
        {/* Mobile Header */}
        <div className="sm:hidden bg-gray-900 border-b border-gray-800 p-4 flex justify-between items-center sticky top-0 z-10">
          <span className="font-bold text-violet-400">Admin Panel</span>
          <button onClick={() => navigate("/blog")} className="text-xs text-gray-400">Blog'a Dön</button>
        </div>

        <div className="flex-1 p-6 sm:p-10 max-w-6xl w-full mx-auto">
          {editingPost ? (
            <PostEditor post={editingPost} onSaved={() => setEditingPost(null)} onCancel={() => setEditingPost(null)} />
          ) : (
            <>
              {tab === "dashboard" && <OverviewTab onNavigate={setTab} />}
              {tab === "posts" && <PostsTab onEdit={setEditingPost} />}
              {tab === "comments" && <CommentsTab />}
              {tab === "new-post" && <PostEditor onSaved={() => setTab("posts")} />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// ─── Dashboard Overview ──────────────────────────────────────────────────
function OverviewTab({ onNavigate }: { onNavigate: (t: Tab) => void }) {
  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">Hoşgeldin, Yönetici ✨</h2>
      <p className="text-gray-400 mb-10">Sistem metriklerini ve gelen onayları yönetmek için buradayız.</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div onClick={() => onNavigate("posts")} className="group cursor-pointer bg-gray-900 border border-gray-800 p-6 rounded-2xl hover:border-violet-500/50 hover:shadow-xl hover:shadow-violet-500/10 transition-all">
          <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 text-2xl mb-4 group-hover:scale-110 transition-transform">📝</div>
          <h3 className="text-lg font-bold text-white mb-1">Yazıları Yönet</h3>
          <p className="text-sm text-gray-500">Tüm yayınlanmış ve taslak blog içeriklerine tıkla ve ulaş.</p>
        </div>

        <div onClick={() => onNavigate("comments")} className="group cursor-pointer bg-gray-900 border border-gray-800 p-6 rounded-2xl hover:border-violet-500/50 hover:shadow-xl hover:shadow-violet-500/10 transition-all">
          <div className="w-12 h-12 bg-pink-500/10 rounded-xl flex items-center justify-center text-pink-400 text-2xl mb-4 group-hover:scale-110 transition-transform">💬</div>
          <h3 className="text-lg font-bold text-white mb-1">Yorum Onayları</h3>
          <p className="text-sm text-gray-500">Ziyaretçilerden gelen bekleyen yorumları incele.</p>
        </div>

        <div onClick={() => onNavigate("new-post")} className="group cursor-pointer bg-gradient-to-br from-violet-600 to-purple-800 border border-violet-500 p-6 rounded-2xl hover:shadow-2xl hover:shadow-violet-500/20 transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-12 blur-2xl"></div>
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white text-2xl mb-4 group-hover:scale-110 transition-transform">✨</div>
          <h3 className="text-lg font-bold text-white mb-1">Yeni İçerik Gir</h3>
          <p className="text-sm text-violet-200">Kreatif editör ile zengin bir makale yazıp hemen yayınla.</p>
        </div>
      </div>
    </div>
  );
}

// ─── Posts Tab ─────────────────────────────────────────────────────────
function PostsTab({ onEdit }: { onEdit: (p: Post) => void }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    apiGet<{ posts: Post[] }>("/api/posts?limit=100")
      .then((d) => setPosts(d.posts)).finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm("Yazıyı kalıcı olarak silmek istediğinizden emin misiniz?")) return;
    try {
      await apiDelete(`/api/posts/${id}`);
      setPosts((p) => p.filter((post) => post.id !== id));
      toast.success("Makale başarıyla silindi.");
    } catch {}
  };

  const togglePublish = async (post: Post) => {
    try {
      const updated = await apiPut<Post>(`/api/posts/${post.id}`, { published: !post.published });
      setPosts((p) => p.map((x) => (x.id === updated.id ? updated : x)));
      toast.success(updated.published ? "Yayınlandı!" : "Taslaklara alındı!");
    } catch {}
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-white mb-6">Blog Arşivi</h2>
      {posts.length === 0 && <p className="text-gray-500 text-center py-16">Henüz yazı yok.</p>}
      
      <div className="flex flex-col gap-4">
        {posts.map((post) => (
          <div key={post.id} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-gray-700 transition-colors">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${post.published ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"}`}>
                  {post.published ? "Yayında" : "Taslak"}
                </span>
              </div>
              <h3 className="text-lg text-white font-semibold truncate hover:text-violet-400 cursor-pointer transition-colors" onClick={() => onEdit(post)}>{post.title}</h3>
              <p className="text-gray-500 text-xs mt-1 font-medium">/{post.slug} · {new Date(post.createdAt).toLocaleDateString("tr-TR")}</p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => togglePublish(post)} className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all border ${post.published ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/20" : "bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20"}`}>
                {post.published ? "Gizle" : "Yayınla"}
              </button>
              <button onClick={() => onEdit(post)} className="px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider bg-violet-500/10 text-violet-400 border border-violet-500/30 hover:bg-violet-500/20 transition-all">
                Düzenle
              </button>
              <button onClick={() => handleDelete(post.id)} className="px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20 transition-all">
                Sil
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Comments ────────────────────────────────────────────────────────
function CommentsTab() {
  const [comments, setComments] = useState<PendingComment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<PendingComment[]>("/api/comments/pending/all")
      .then(setComments).finally(() => setLoading(false));
  }, []);

  const approve = async (id: string) => {
    try {
      await apiPatch(`/api/comments/${id}/approve`);
      setComments((p) => p.filter((c) => c.id !== id));
      toast.success("Yorum onaylandı ve yayına alındı.");
    } catch {}
  };

  const reject = async (id: string) => {
    try {
      await apiDelete(`/api/comments/${id}`);
      setComments((p) => p.filter((c) => c.id !== id));
      toast.success("Yorum silindi.");
    } catch {}
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-white mb-6">Bekleyen Onaylar</h2>
      {comments.length === 0 && (
        <div className="text-center py-20 bg-gray-900 border border-gray-800 rounded-2xl">
          <span className="text-6xl mb-4 block">☕</span>
          <p className="text-gray-400 text-lg">Mükemmel, bekleyen hiçbir şey yok.</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {comments.map((c) => (
          <div key={c.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center gap-3 mb-4 border-b border-gray-800 pb-4">
              <div className="w-10 h-10 rounded-full bg-violet-900/50 flex items-center justify-center text-violet-400 text-lg font-bold">{c.authorName[0]?.toUpperCase()}</div>
              <div>
                <h4 className="font-bold text-white">{c.authorName}</h4>
                <p className="text-xs text-gray-500">{c.authorEmail}</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-6 italic">"{c.content}"</p>
            <div className="flex gap-3">
              <button onClick={() => approve(c.id)} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 transition-all">
                Onayla
              </button>
              <button onClick={() => reject(c.id)} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all">
                Reddet
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Post Editor ───────────────────────────────────────────────────────
function PostEditor({ post, onSaved, onCancel }: { post?: Post; onSaved: () => void; onCancel?: () => void }) {
  const [title, setTitle] = useState(post?.title ?? "");
  const [content, setContent] = useState(post?.content ?? ""); // Rich Text HTML
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [coverImage, setCoverImage] = useState(post?.coverImage ?? "");
  const [tagsRaw, setTagsRaw] = useState(post?.tags.join(", ") ?? "");
  const [published, setPublished] = useState(post?.published ?? false);
  const [saving, setSaving] = useState(false);

  // React Quill Editor configuration (with Image Toolbar)
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || content === "<p><br></p>") return toast.error("Makale metni boş bırakılamaz.");

    setSaving(true);
    const tags = tagsRaw.split(",").map((t) => t.trim()).filter(Boolean);

    try {
      if (post) {
        await apiPut(`/api/posts/${post.id}`, { title, content, excerpt: excerpt || null, coverImage: coverImage || null, tags, published });
        toast.success("Makale güncellendi!");
      } else {
        await apiPost("/api/posts", { title, content, excerpt: excerpt || null, coverImage: coverImage || null, tags, published });
        toast.success("Makale taze taze oluşturuldu!");
      }
      onSaved();
    } catch {} finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in bg-gray-900 rounded-3xl p-6 sm:p-10 border border-gray-800 shadow-2xl">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-800">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-400">
            {post ? "Gelişmiş Editör" : "Yeni İçerik Gir"}
          </h2>
          <p className="text-gray-500 text-sm mt-1">Zengin HTML Editörü kullanıyorsunuz. (Resim Sürükle&Bırak/Kopyala desteklenir)</p>
        </div>
        {onCancel && (
          <button onClick={onCancel} className="px-5 py-2.5 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 font-medium transition-colors border border-gray-700">
            Vazgeç
          </button>
        )}
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        <div>
          <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide">Makale Başlığı <span className="text-red-500">*</span></label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Örn: Modern Mimari ve React" className="w-full rounded-xl bg-gray-950 border border-gray-800 px-5 py-4 text-white font-medium focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all shadow-inner" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide">Kapak Görseli Linki</label>
            <input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="https://..." className="w-full rounded-xl bg-gray-950 border border-gray-800 px-5 py-4 text-white text-sm focus:outline-none focus:border-violet-500 transition-all shadow-inner" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide">Etiketler</label>
            <input value={tagsRaw} onChange={(e) => setTagsRaw(e.target.value)} placeholder="tech, cloud, frontend" className="w-full rounded-xl bg-gray-950 border border-gray-800 px-5 py-4 text-white text-sm focus:outline-none focus:border-violet-500 transition-all shadow-inner" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide">Kısa Özet <span className="text-gray-600 text-[10px]">(Vitrin önizlemesi)</span></label>
          <input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Giriş cümlesi veya özet bir paragraf..." className="w-full rounded-xl bg-gray-950 border border-gray-800 px-5 py-4 text-white text-sm focus:outline-none focus:border-violet-500 transition-all shadow-inner" />
        </div>

        <div className="mt-2 text-white">
          <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide">Metin & İçerik <span className="text-red-500">*</span></label>
          <ReactQuill theme="snow" value={content} onChange={setContent} modules={modules} placeholder="Düşüncelerinizi dünyayla paylaşın... (Görsellerinizi doğrudan yapıştırabilirsiniz)" />
        </div>

        <div className="mt-8 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          <label className="flex items-center gap-4 cursor-pointer group">
            <div className={`relative w-14 h-8 rounded-full transition-all duration-300 border ${published ? "bg-violet-600 border-violet-500" : "bg-gray-800 border-gray-700"}`}>
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${published ? "left-7" : "left-1"}`} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white group-hover:text-violet-300">{published ? "Yayında" : "Taslak Modu (Yayında değil)"}</span>
              <span className="text-xs text-gray-500">Bu anahtar ile yazınızı yayına alabilirsiniz.</span>
            </div>
          </label>

          <button type="submit" disabled={saving} className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-xl font-extrabold tracking-widest uppercase transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]">
            {saving ? "KAYDEDİLİYOR..." : post ? "DÜZENLEMEYİ KAYDET" : "İÇERİĞİ YAYINLA"}
          </button>
        </div>
      </form>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex justify-center py-20">
      <div className="w-12 h-12 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin" />
    </div>
  );
}
