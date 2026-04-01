import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiGet, apiPost, apiPatch, apiDelete } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  author: { id: string; username: string } | null;
}

interface Comment {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
  userId: string | null;
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingPost, setLoadingPost] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoadingPost(true);
    apiGet<Post>(`/api/posts/${slug}`)
      .then(setPost)
      .catch((e) => setError(e.message))
      .finally(() => setLoadingPost(false));
  }, [slug]);

  useEffect(() => {
    if (!post) return;
    apiGet<Comment[]>(`/api/comments/${post.id}`).then(setComments).catch(() => {});
  }, [post]);

  if (loadingPost) {
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
        <Link to="/blog" className="text-violet-400 hover:text-violet-300">
          ← Blog'a dön
        </Link>
      </div>
    );
  }

  const date = new Date(post.createdAt).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-950 pb-24">
      {/* Premium Cinematic Cover */}
      {post.coverImage ? (
        <div className="relative w-full h-[40vh] sm:h-[55vh] flex items-end justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gray-950">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover opacity-60"
            />
            {/* Gradient Mask for fading to background */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent"></div>
          </div>
        </div>
      ) : (
        <div className="w-full h-24 bg-gray-950"></div>
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 relative -mt-16 sm:-mt-24 z-10">
        {/* Meta / Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6 shadow-sm">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                to={`/blog?tag=${tag}`}
                className="px-4 py-1.5 text-xs font-medium uppercase tracking-wider rounded-full bg-violet-600/20 text-violet-300 border border-violet-500/30 hover:bg-violet-500/30 hover:border-violet-400/50 backdrop-blur-md transition-all shadow-lg shadow-violet-900/20"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-200 to-gray-500 tracking-tight leading-tight mb-8">
          {post.title}
        </h1>

        {/* Author & Date Panel */}
        <div className="flex items-center gap-6 text-sm text-gray-400 mb-14 pb-8 border-b border-gray-800/80">
          {post.author && (
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-violet-600 to-purple-500 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-violet-500/20 ring-2 ring-gray-950">
                {post.author.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-gray-200 text-base">@{post.author.username}</span>
                <span className="text-[10px] uppercase tracking-widest text-violet-400 font-semibold">Yazar</span>
              </div>
            </div>
          )}
          
          <div className="h-8 w-px bg-gray-800 hidden sm:block"></div>
          
          <div className="flex flex-col justify-center">
            <span className="text-gray-300 font-medium">{date}</span>
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Yayınlanma Tarihi</span>
          </div>
        </div>

        {/* Content */}
        <article 
          className="prose prose-lg prose-invert prose-violet max-w-none prose-img:rounded-2xl prose-img:shadow-2xl prose-img:mx-auto prose-p:text-gray-300 prose-p:leading-relaxed prose-headings:text-white prose-a:text-violet-400 hover:prose-a:text-violet-300"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Comments */}
        <CommentSection
          postId={post.id}
          comments={comments}
          setComments={setComments}
          user={user}
        />
      </div>
    </div>
  );
}

// ─── Comment Section ──────────────────────────────────────────────────
interface CommentSectionProps {
  postId: string;
  comments: Comment[];
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
  user: { id: string; username: string; isAdmin: boolean } | null;
}

function CommentSection({
  postId,
  comments,
  setComments,
  user,
}: CommentSectionProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await apiPost<{ comment: Comment; message: string }>(
        `/api/comments/${postId}`,
        { authorName: name || undefined, authorEmail: email || undefined, content }
      );
      setFeedback({ type: "ok", msg: res.message });
      setContent("");
      if (res.message === "Comment posted") {
        setComments((prev) => [res.comment, ...prev]);
      }
    } catch (err: any) {
      setFeedback({ type: "err", msg: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu yorumu silmek istediğinize emin misiniz?")) return;
    await apiDelete(`/api/comments/${id}`);
    setComments((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <section className="mt-16 pt-10 border-t border-gray-800">
      <h2 className="text-2xl font-bold text-white mb-8">
        Yorumlar{" "}
        <span className="text-violet-400 text-lg">({comments.length})</span>
      </h2>

      {/* Comment list */}
      {comments.length === 0 && (
        <p className="text-gray-500 mb-10">
          Henüz yorum yok. İlk yorumu siz yapın!
        </p>
      )}

      <div className="flex flex-col gap-5 mb-12">
        {comments.map((c) => (
          <div
            key={c.id}
            className="bg-gray-900 border border-gray-800 rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-violet-600/30 flex items-center justify-center text-violet-400 font-bold text-sm">
                  {c.authorName[0]?.toUpperCase()}
                </div>
                <span className="font-medium text-white text-sm">
                  {c.authorName}
                </span>
                {c.userId && (
                  <span className="px-1.5 py-0.5 text-xs bg-violet-500/10 text-violet-400 rounded">
                    üye
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">
                  {new Date(c.createdAt).toLocaleDateString("tr-TR")}
                </span>
                {user?.isAdmin && (
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-red-400 hover:text-red-300 text-xs transition-colors"
                  >
                    Sil
                  </button>
                )}
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">{c.content}</p>
          </div>
        ))}
      </div>

      {/* Comment form */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-5">
          {user ? `Yorum Yap (@${user.username})` : "Yorum Yap"}
        </h3>

        {feedback && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm ${
              feedback.type === "ok"
                ? "bg-green-500/10 border border-green-500/30 text-green-400"
                : "bg-red-500/10 border border-red-500/30 text-red-400"
            }`}
          >
            {feedback.msg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!user && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">
                  İsim <span className="text-red-500">*</span>
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Adınız"
                  className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">
                  E-posta <span className="text-red-500">*</span>
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  type="email"
                  placeholder="ornek@email.com"
                  className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">
              Yorum <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={4}
              placeholder="Yorumunuzu yazın..."
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors resize-none"
            />
          </div>

          {!user && (
            <p className="text-xs text-gray-500">
              ⏳ Anonim yorumlar admin onayından geçer.{" "}
              <Link to="/login" className="text-violet-400 hover:underline">
                Giriş yaparsanız
              </Link>{" "}
              yorumunuz anında yayınlanır.
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="self-start px-6 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-lg font-semibold text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Gönderiliyor..." : "Yorum Gönder"}
          </button>
        </form>
      </div>
    </section>
  );
}
