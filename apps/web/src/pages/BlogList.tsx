import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
  const [page, setPage] = useState(1);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = Array.from(new Set(posts.flatMap((p) => p.tags)));

  useEffect(() => {
    setLoading(true);
    const tagQuery = activeTag ? `&tag=${encodeURIComponent(activeTag)}` : "";
    apiGet<{ posts: Post[] }>(`/api/posts?limit=100${tagQuery}`)
      .then((data) => setPosts(data.posts))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [page, activeTag]);

  return (
    <div className="min-h-screen bg-gray-950 pt-8 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent mb-4">
            Blog
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Yazılım, projeler ve düşünceler üzerine notlar.
          </p>
        </div>

        {/* Tag Filter */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10 justify-center">
            <button
              onClick={() => setActiveTag(null)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                activeTag === null
                  ? "bg-violet-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              Tümü
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag === activeTag ? null : tag)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeTag === tag
                    ? "bg-violet-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-center py-20 text-red-400">
            Yazılar yüklenirken hata oluştu: {error}
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            Henüz blog yazısı yok.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>

        {/* Pagination removed - Showing all posts single page flow */}
      </div>
    </div>
  );
}

function BlogCard({ post }: { post: Post }) {
  const date = new Date(post.createdAt).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group flex flex-col rounded-2xl overflow-hidden bg-gray-900 border border-gray-800 hover:border-violet-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/10"
    >
      {/* Cover */}
      <div className="h-44 bg-gradient-to-br from-violet-900/40 via-gray-900 to-indigo-900/40 relative overflow-hidden">
        {post.coverImage ? (
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl opacity-20">✍️</span>
          </div>
        )}
        {!post.published && (
          <span className="absolute top-3 right-3 px-2 py-0.5 bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 text-xs rounded-full">
            Taslak
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <h2 className="text-lg font-semibold text-white group-hover:text-violet-300 transition-colors line-clamp-2">
          {post.title}
        </h2>

        {post.excerpt && (
          <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 flex-1">
            {post.excerpt}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-800">
          <span className="text-xs text-gray-500">{date}</span>
          {post.author && (
            <span className="text-xs text-gray-500">
              @{post.author.username}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
