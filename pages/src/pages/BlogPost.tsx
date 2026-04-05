import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { apiGet, apiPost, apiPatch, apiDelete, apiPut } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { renderMarkdown, readingTime } from "../lib/markdown";
import toast from "react-hot-toast";
import {
  Clock, Calendar, User, Tag, ArrowLeft, Edit3,
  MessageSquare, Share2, Copy, Check, ChevronUp,
  CornerDownRight, Trash2, ExternalLink
} from "lucide-react";

// ─── Markdown / Code styles ──────────────────────────────────────────────
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
  tags: string[]; createdAt: string; updatedAt: string; published: boolean;
  author: { id: string; username: string } | null;
}

interface Comment {
  id: string; authorName: string; content: string;
  createdAt: string; userId: string | null; parentId: string | null;
  approved?: boolean;
  isAdmin?: boolean;
}

// ─── BlogPost ────────────────────────────────────────────────────────────
export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scrollPct, setScrollPct] = useState(0);
  const [showBackTop, setShowBackTop] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  // Reading progress
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const pct = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
      setScrollPct(pct);
      setShowBackTop(el.scrollTop > 600);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    apiGet<Post>(`/api/posts/${slug}`)
      .then(setPost)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!post) return;
    apiGet<Comment[]>(`/api/comments/${post.id}`).then(setComments).catch(() => { });
  }, [post]);

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Link kopyalandı!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-950">
        <div className="w-10 h-10 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
        <span className="text-6xl">😕</span>
        <p className="text-gray-400 text-lg">Yazı bulunamadı.</p>
        <Link to="/blog" className="text-violet-400 hover:text-violet-300 flex items-center gap-2">
          <ArrowLeft size={16} /> Blog'a dön
        </Link>
      </div>
    );
  }

  const date = new Date(post.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
  const mins = readingTime(post.content);
  const renderedContent = renderMarkdown(post.content);

  // Group comments: top-level + replies
  const topLevel = comments.filter((c) => !c.parentId);
  const replies = (parentId: string) => comments.filter((c) => c.parentId === parentId);

  return (
    <div className="min-h-screen bg-gray-950 pb-24">
      <style>{PROSE_STYLE}</style>

      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-gray-900">
        <div
          className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-100"
          style={{ width: `${scrollPct}%` }}
        />
      </div>

      {/* Cover */}
      {post.coverImage ? (
        <div className="relative w-full h-[45vh] sm:h-[60vh] overflow-hidden">
          <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/50 to-gray-950/10" />
        </div>
      ) : (
        <div className="w-full h-20 bg-gray-950" />
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10" style={{ marginTop: post.coverImage ? "-12rem" : "2rem" }}>

        {/* Back + share bar */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/blog" className="flex items-center gap-2 text-sm text-gray-400 hover:text-violet-400 transition-colors">
            <ArrowLeft size={15} /> Blog
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-medium transition-all border border-white/5"
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              {copied ? "Kopyalandı" : "Paylaş"}
            </button>
            {user?.isAdmin && (
              <button
                onClick={() => setEditOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600/15 hover:bg-violet-600/25 text-violet-400 text-xs font-semibold transition-all border border-violet-500/20"
              >
                <Edit3 size={13} /> Düzenle
              </button>
            )}
          </div>
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                to={`/blog?tag=${tag}`}
                className="flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-violet-600/15 text-violet-300 border border-violet-500/25 hover:bg-violet-600/25 transition-all"
              >
                <Tag size={10} /> {tag}
              </Link>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
          {post.title}
        </h1>

        {/* Meta bar */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 pb-8 mb-10 border-b border-gray-800/80">
          {post.author && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center text-white text-xs font-bold">
                {post.author.username.charAt(0).toUpperCase()}
              </div>
              <span className="text-gray-300 font-medium">@{post.author.username}</span>
            </div>
          )}
          <span className="flex items-center gap-1.5">
            <Calendar size={13} /> {date}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={13} /> {mins} dk okuma
          </span>
          <span className="flex items-center gap-1.5">
            <MessageSquare size={13} /> {comments.length} yorum
          </span>
          {!post.published && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-xs border border-amber-500/20 font-semibold">
              Taslak
            </span>
          )}
        </div>

        {/* Content */}
        <article
          className="blog-content mb-16"
          dangerouslySetInnerHTML={{ __html: renderedContent }}
        />

        {/* Comment section */}
        <CommentSection
          postId={post.id}
          topLevel={topLevel}
          replies={replies}
          setComments={setComments}
          user={user}
          postSlug={post.slug}
        />
      </div>

      {/* Back to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-8 right-8 w-10 h-10 rounded-full bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/40 flex items-center justify-center transition-all duration-300 z-40 ${showBackTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}
      >
        <ChevronUp size={18} />
      </button>

      {/* Inline Edit Modal */}
      {editOpen && user?.isAdmin && (
        <InlineEditModal post={post} onClose={() => setEditOpen(false)} onSaved={(updated) => { setPost(updated); setEditOpen(false); }} />
      )}
    </div>
  );
}

// ─── Inline Edit Modal ──────────────────────────────────────────────────
function InlineEditModal({ post, onClose, onSaved }: { post: Post; onClose: () => void; onSaved: (p: Post) => void }) {
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [excerpt, setExcerpt] = useState(post.excerpt ?? "");
  const [coverImage, setCoverImage] = useState(post.coverImage ?? "");
  const [tagsRaw, setTagsRaw] = useState(post.tags.join(", "));
  const [published, setPublished] = useState(post.published);
  const [saving, setSaving] = useState(false);
  const [editorMode, setEditorMode] = useState<"rich" | "md">("rich");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const tags = tagsRaw.split(",").map((t) => t.trim()).filter(Boolean);
    try {
      const updated = await apiPut<Post>(`/api/posts/${post.id}`, {
        title, content, excerpt: excerpt || null, coverImage: coverImage || null, tags, published
      });
      toast.success("Yazı güncellendi!");
      onSaved(updated);
    } catch { } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm overflow-y-auto py-6 px-4">
      <div className="bg-[#0d1117] border border-[#1a2035] rounded-2xl w-full max-w-2xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a2035]">
          <h2 className="font-bold text-white text-lg flex items-center gap-2">
            <Edit3 size={16} className="text-violet-400" /> Yazıyı Düzenle
          </h2>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 bg-black/30 border border-[#1a2035] rounded-lg p-1">
              <button onClick={() => setEditorMode("rich")} className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${editorMode === "rich" ? "bg-violet-600/20 text-violet-300" : "text-gray-500"}`}>Rich</button>
              <button onClick={() => setEditorMode("md")} className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${editorMode === "md" ? "bg-violet-600/20 text-violet-300" : "text-gray-500"}`}>MD</button>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all">✕</button>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-6 flex flex-col gap-4">
          <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Başlık" className="w-full rounded-xl bg-[#080b12] border border-[#1a2035] px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500/50 transition-all" />

          <div className="grid grid-cols-2 gap-3">
            <input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="Kapak görseli URL" className="w-full rounded-xl bg-[#080b12] border border-[#1a2035] px-3 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500/50 transition-all" />
            <input value={tagsRaw} onChange={(e) => setTagsRaw(e.target.value)} placeholder="Etiketler (virgülle)" className="w-full rounded-xl bg-[#080b12] border border-[#1a2035] px-3 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500/50 transition-all" />
          </div>

          <input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Kısa özet" className="w-full rounded-xl bg-[#080b12] border border-[#1a2035] px-4 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500/50 transition-all" />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={14}
            placeholder={editorMode === "md" ? "# Markdown içerik..." : "HTML veya Markdown içerik..."}
            className="w-full rounded-xl bg-[#080b12] border border-[#1a2035] px-4 py-3 text-gray-200 text-sm font-mono leading-relaxed focus:outline-none focus:border-violet-500/50 transition-all resize-none"
          />

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div
                role="switch"
                aria-checked={published}
                onClick={() => setPublished((v) => !v)}
                className={`relative w-11 h-6 rounded-full transition-all duration-300 cursor-pointer ${published ? "bg-violet-600" : "bg-gray-700"}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${published ? "left-6" : "left-1"}`} />
              </div>
              <span className={`text-sm font-semibold ${published ? "text-violet-300" : "text-gray-500"}`}>{published ? "Yayında" : "Taslak"}</span>
            </label>

            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 text-sm font-semibold transition-all border border-white/5">
                Vazgeç
              </button>
              <button type="submit" disabled={saving} className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-700 text-white text-sm font-semibold transition-all disabled:opacity-50">
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Comment Section ──────────────────────────────────────────────────────
interface CommentSectionProps {
  postId: string;
  topLevel: Comment[];
  replies: (parentId: string) => Comment[];
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
  user: { id: string; username: string; isAdmin: boolean } | null;
  postSlug: string;
}

function CommentSection({ postId, topLevel, replies, setComments, user, postSlug }: CommentSectionProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const [replyTo, setReplyTo] = useState<Comment | null>(null);

  const handleSubmit = async (e: React.FormEvent, parentId?: string) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await apiPost<{ comment: Comment; message: string }>(
        `/api/comments/${postId}`,
        {
          authorName: name || undefined,
          authorEmail: email || undefined,
          content,
          parentId: parentId ?? null,
        }
      );
      setFeedback({ type: "ok", msg: res.message });
      setContent("");
      setReplyTo(null);
      if (res.comment.approved) {
        setComments((prev) => [res.comment, ...prev]);
      }
    } catch (err: any) {
      setFeedback({ type: "err", msg: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu yorumu silmek istediğinizden emin misiniz?")) return;
    await apiDelete(`/api/comments/${id}`);
    setComments((prev) => prev.filter((c) => c.id !== id && c.parentId !== id));
    toast.success("Yorum silindi.");
  };

  const totalCount = topLevel.length + topLevel.reduce((acc, c) => acc + replies(c.id).length, 0);

  return (
    <section className="mt-16 pt-10 border-t border-gray-800">
      <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
        <MessageSquare size={18} className="text-violet-400" />
        Yorumlar
        <span className="text-sm text-violet-400 font-normal">({totalCount})</span>
      </h2>

      {/* Comment list */}
      {topLevel.length === 0 && (
        <p className="text-gray-600 mb-10 text-sm">Henüz yorum yok. İlk yorumu siz yapın!</p>
      )}

      <div className="flex flex-col gap-4 mb-12">
        {topLevel.map((c) => (
          <div key={c.id}>
            <CommentCard comment={c} onDelete={handleDelete} onReply={() => setReplyTo(c)} user={user} />
            {/* Replies */}
            {replies(c.id).map((reply) => (
              <div key={reply.id} className="ml-8 mt-2 border-l-2 border-violet-500/20 pl-4">
                <CommentCard comment={reply} onDelete={handleDelete} onReply={null} user={user} isReply />
              </div>
            ))}
            {/* Reply form for this comment */}
            {replyTo?.id === c.id && (
              <div className="ml-8 mt-3 border-l-2 border-violet-500/30 pl-4">
                <div className="bg-[#0d1117] border border-violet-500/15 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CornerDownRight size={13} className="text-violet-400" />
                    <span className="text-xs text-violet-400 font-semibold">@{c.authorName} kullanıcısına yanıt</span>
                    <button onClick={() => setReplyTo(null)} className="ml-auto text-gray-600 hover:text-gray-400 text-xs">iptal</button>
                  </div>
                  <ReplyForm
                    user={user}
                    name={name} setName={setName}
                    email={email} setEmail={setEmail}
                    content={content} setContent={setContent}
                    submitting={submitting}
                    onSubmit={(e) => handleSubmit(e, c.id)}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Main comment form */}
      {!replyTo && (
        <div className="bg-[#0d1117] border border-[#1a2035] rounded-2xl p-6">
          <h3 className="text-base font-bold text-white mb-4">
            {user ? `Yorum yap (@${user.username})` : "Yorum Yap"}
          </h3>

          {feedback && (
            <div className={`mb-4 p-3 rounded-xl text-sm ${feedback.type === "ok" ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border border-red-500/20 text-red-400"}`}>
              {feedback.msg}
            </div>
          )}

          <ReplyForm
            user={user}
            name={name} setName={setName}
            email={email} setEmail={setEmail}
            content={content} setContent={setContent}
            submitting={submitting}
            onSubmit={(e) => handleSubmit(e)}
          />

          {!user && (
            <p className="text-xs text-gray-600 mt-3">
              ⏳ Anonim yorumlar admin onayından geçer.{" "}
              <Link to="/login" className="text-violet-400 hover:underline">Giriş yapın</Link>{" "}
              ve yorumunuz anında yayınlansın.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

// ─── Comment Card ─────────────────────────────────────────────────────────
function CommentCard({
  comment: c, onDelete, onReply, user, isReply,
}: {
  comment: Comment;
  onDelete: (id: string) => void;
  onReply: (() => void) | null;
  user: { id: string; username: string; isAdmin: boolean } | null;
  isReply?: boolean;
}) {
  return (
    <div className={`bg-[#0d1117] border border-[#1a2035] rounded-xl p-4 hover:border-[#2a3050] transition-all ${isReply ? "rounded-l-none" : ""}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-violet-900/30 flex items-center justify-center text-violet-400 font-bold text-xs flex-shrink-0">
            {c.authorName[0]?.toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-white text-sm">{c.authorName}</span>
              {c.isAdmin
                ? <span className="px-1.5 py-0.5 text-[10px] bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/15 font-bold">Admin</span>
                : c.userId
                ? <span className="px-1.5 py-0.5 text-[10px] bg-violet-500/10 text-violet-400 rounded border border-violet-500/15">Üye</span>
                : <span className="px-1.5 py-0.5 text-[10px] bg-white/5 text-gray-500 rounded border border-white/5">Misafir</span>
              }
              {c.parentId && <span className="px-1.5 py-0.5 text-[10px] bg-blue-500/10 text-blue-400 rounded border border-blue-500/15">Yanıt</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[11px] text-gray-600">
            {new Date(c.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
          </span>
          {onReply && (
            <button
              onClick={onReply}
              className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-violet-400 transition-colors font-medium"
            >
              <CornerDownRight size={11} /> Yanıtla
            </button>
          )}
          {user?.isAdmin && (
            <button
              onClick={() => onDelete(c.id)}
              className="text-gray-600 hover:text-red-400 transition-colors"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>
      <p className="text-gray-300 text-sm leading-relaxed pl-[2.625rem]">{c.content}</p>
    </div>
  );
}

// ─── Reply Form ───────────────────────────────────────────────────────────
function ReplyForm({
  user, name, setName, email, setEmail, content, setContent, submitting, onSubmit,
}: {
  user: any;
  name: string; setName: (v: string) => void;
  email: string; setEmail: (v: string) => void;
  content: string; setContent: (v: string) => void;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      {!user && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="İsminiz *" className="w-full rounded-xl bg-[#080b12] border border-[#1a2035] px-4 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500/50 transition-all" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" placeholder="E-posta *" className="w-full rounded-xl bg-[#080b12] border border-[#1a2035] px-4 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500/50 transition-all" />
        </div>
      )}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required rows={3}
        placeholder="Yorumunuzu yazın..."
        className="w-full rounded-xl bg-[#080b12] border border-[#1a2035] px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500/50 transition-all resize-none"
      />
      <button
        type="submit" disabled={submitting}
        className="self-start px-5 py-2 bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
      >
        {submitting ? "Gönderiliyor..." : "Gönder"}
      </button>
    </form>
  );
}