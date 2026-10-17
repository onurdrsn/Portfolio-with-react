import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { ArrowRight, Tag, Calendar, User, Clock } from "lucide-react";
import { apiGet } from "../lib/api";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  tags: string[];
  createdAt: string;
  published: boolean;
  author: { id: string; username: string } | null;
}

export default function BlogList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const springTransition = shouldReduceMotion
    ? { duration: 0.01 }
    : { type: "spring", stiffness: 380, damping: 28, mass: 0.9 };

  const allTags = Array.from(new Set(posts.flatMap((p) => p.tags || [])));

  const fetchPosts = () => {
    setLoading(true);
    setError(null);
    const tagQuery = activeTag ? `&tag=${encodeURIComponent(activeTag)}` : "";
    apiGet<{ posts: Post[] }>(`/api/posts?limit=100${tagQuery}`)
      .then((data) => setPosts(data.posts || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPosts();
  }, [activeTag]);

  return (
    <div className="min-h-screen bg-ink text-paper py-16 px-5 sm:px-8 lg:px-12">
      <div className="max-w-6xl mx-auto">
        {/* Editorial Header */}
        <header className="mb-12 pb-8 border-b border-ink-line">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-signal"></span>
                <span className="text-xs font-code tracking-widest uppercase text-paper-muted">
                  Technical Journal / 05
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-paper">
                Articles &{" "}
                <span className="text-paper-muted font-normal italic font-serif">
                  Engineering Notes
                </span>
              </h1>
            </div>

            <p className="text-xs sm:text-sm text-paper-muted max-w-md font-sans leading-relaxed">
              Deep dives into distributed systems, serverless worker architectures, real-time WebSockets, and modern frontend design engineering.
            </p>
          </div>

          {/* Tag Filter Pills */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-8 pt-6 border-t border-ink-line/60">
              <span className="text-xs font-code text-paper-muted mr-1">Filter:</span>
              <button
                type="button"
                onClick={() => setActiveTag(null)}
                className={`px-3 py-1 rounded text-xs font-code transition-colors cursor-pointer ${
                  activeTag === null
                    ? "bg-paper text-ink font-semibold"
                    : "bg-ink-raised text-paper-muted hover:text-paper border border-ink-line"
                }`}
              >
                All ({posts.length})
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setActiveTag(tag === activeTag ? null : tag)}
                  className={`px-3 py-1 rounded text-xs font-code transition-colors cursor-pointer ${
                    activeTag === tag
                      ? "bg-paper text-ink font-semibold"
                      : "bg-ink-raised text-paper-muted hover:text-paper border border-ink-line"
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </header>

        {/* Content Section with Zero-CLS Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true">
            {[1, 2, 3, 4, 5, 6].map((k) => (
              <div
                key={k}
                className="rounded-lg bg-ink-raised border border-ink-line p-5 flex flex-col justify-between h-[340px] relative overflow-hidden"
              >
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent pointer-events-none" />
                <div className="space-y-4">
                  <div className="h-40 bg-ink rounded border border-ink-line/60" />
                  <div className="flex gap-2">
                    <div className="h-4 w-12 bg-ink-line rounded" />
                    <div className="h-4 w-16 bg-ink-line rounded" />
                  </div>
                  <div className="h-6 w-3/4 bg-ink-line rounded" />
                  <div className="h-4 w-full bg-ink-line/60 rounded" />
                </div>
                <div className="h-4 w-24 bg-ink-line rounded mt-4" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="py-20 text-center border border-ink-line rounded-lg bg-ink-raised p-8">
            <p className="text-paper-muted text-sm font-code mb-4">
              [!] Failed to load articles: {error}
            </p>
            <button
              onClick={fetchPosts}
              className="px-4 py-2 rounded bg-paper text-ink text-xs font-code font-bold hover:bg-white transition-colors cursor-pointer"
            >
              Retry Request
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-24 text-center border border-ink-line rounded-lg bg-ink-raised p-8">
            <p className="text-paper-muted text-sm font-code">
              No published articles found in this filter category.
            </p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {posts.map((post) => (
                <motion.div
                  key={post.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={springTransition}
                >
                  <BlogCard post={post} shouldReduceMotion={shouldReduceMotion} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function BlogCard({
  post,
  shouldReduceMotion,
}: {
  post: Post;
  shouldReduceMotion: boolean | null;
}) {
  const date = new Date(post.createdAt).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const springTransition = shouldReduceMotion
    ? { duration: 0.01 }
    : { type: "spring", stiffness: 380, damping: 28, mass: 0.9 };

  return (
    <motion.div
      whileHover={shouldReduceMotion ? undefined : { scale: 1.015 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
      transition={springTransition}
      className="h-full"
    >
      <Link
        to={`/blog/${post.slug}`}
        className="group flex flex-col justify-between h-full rounded-lg bg-ink-raised border border-ink-line hover:border-paper/40 transition-colors overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paper"
      >
        <div>
          {/* Cover Image or Monogram */}
          <div className="h-44 bg-ink border-b border-ink-line relative overflow-hidden flex items-center justify-center">
            {post.coverImage ? (
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            ) : (
              <div className="text-paper-subtle font-code text-xs uppercase tracking-widest flex items-center gap-2">
                <span>[ JOURNAL ENTRY ]</span>
              </div>
            )}
            {!post.published && (
              <span className="absolute top-3 right-3 px-2 py-0.5 bg-ink text-signal border border-signal/40 text-[10px] font-code uppercase rounded">
                Draft
              </span>
            )}
          </div>

          <div className="p-5">
            {/* Tag Pills */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {post.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 text-[10px] font-code rounded bg-ink text-paper-muted border border-ink-line"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <h2 className="text-base sm:text-lg font-bold text-paper group-hover:text-white transition-colors line-clamp-2 mb-2">
              {post.title}
            </h2>

            {post.excerpt && (
              <p className="text-paper-muted text-xs sm:text-sm line-clamp-3 leading-relaxed">
                {post.excerpt}
              </p>
            )}
          </div>
        </div>

        {/* Footer Meta */}
        <div className="p-5 pt-3 border-t border-ink-line flex items-center justify-between text-xs font-code text-paper-muted">
          <span>{date}</span>
          <div className="flex items-center gap-1 group-hover:text-paper transition-colors">
            <span>Read article</span>
            <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
