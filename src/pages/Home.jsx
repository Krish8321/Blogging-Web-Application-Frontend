import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";
import { Calendar, User, ArrowRight, BookOpen, Clock } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/posts");
      if (response.data?.success) {
        setPosts(response.data.posts);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch posts. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "Draft";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header section with brand feel */}
      <div className="border-b border-stone-250 dark:border-stone-800 pb-8 mb-10">
        <h1 className="text-4xl md:text-5xl font-bold font-serif text-stone-900 dark:text-stone-100 mb-3">
          The Journal
        </h1>
        <p className="text-stone-500 dark:text-stone-400 max-w-xl text-sm md:text-base font-serif italic">
          Bespoke stories, deep perspectives, and cultural insights, human-crafted and shared directly from the authors.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-12">
        {loading ? (
          <div className="space-y-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="animate-pulse space-y-3 pb-8 border-b border-stone-200/60 dark:border-stone-800/60">
                <div className="h-4 bg-stone-200 dark:bg-stone-850 w-24 rounded"></div>
                <div className="h-6 bg-stone-300 dark:bg-stone-800 w-3/4 rounded"></div>
                <div className="h-4 bg-stone-200 dark:bg-stone-850 w-full rounded"></div>
                <div className="h-4 bg-stone-200 dark:bg-stone-850 w-5/6 rounded"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-350 rounded border-l-2 border-red-500">
            {error}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 px-4 border border-dashed border-stone-300 dark:border-stone-800 rounded-lg">
            <BookOpen size={40} className="mx-auto text-stone-400 mb-4" />
            <h3 className="font-serif text-lg font-semibold text-stone-950 dark:text-stone-100">
              Silence is golden, but empty.
            </h3>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1 max-w-xs mx-auto">
              No articles have been published yet. Be the first to share your voice!
            </p>
            {user && (
              <Link
                to="/write"
                className="inline-flex items-center gap-1.5 mt-5 text-sm bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 px-4 py-2 rounded font-medium hover:opacity-90 transition-opacity"
              >
                Write your first post
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-12">
            {posts.map((post) => (
              <article
                key={post.id}
                className="group pb-8 border-b border-stone-200/50 dark:border-stone-800/50 flex flex-col md:flex-row gap-6 items-start"
              >
                <div className="flex-1 space-y-3">
                  {/* Meta info */}
                  <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400">
                    <Link
                      to={`/${post.author.profile?.username}`}
                      className="font-medium text-stone-700 dark:text-stone-300 hover:underline flex items-center gap-1"
                    >
                      {post.author.profile?.avatarUrl ? (
                        <img
                          src={post.author.profile.avatarUrl}
                          alt=""
                          className="w-4 h-4 rounded-full object-cover"
                        />
                      ) : (
                        <User size={12} />
                      )}
                      {post.author.profile?.displayName || "Author"}
                    </Link>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />
                      {formatDate(post.publishedAt || post.createdAt)}
                    </span>
                  </div>

                  {/* Title */}
                  <Link to={`/posts/${post.id}`} className="block group-hover:opacity-85 transition-opacity">
                    <h2 className="text-2xl font-serif font-bold text-stone-950 dark:text-stone-50 tracking-tight leading-snug">
                      {post.title}
                    </h2>
                  </Link>

                  {/* Excerpt (Snippet) */}
                  <p className="text-stone-600 dark:text-stone-350 text-sm line-clamp-3 leading-relaxed font-serif">
                    {post.content.replace(/[#*`_[\]]/g, "")}
                  </p>

                  {/* Read More */}
                  <div className="pt-2">
                    <Link
                      to={`/posts/${post.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-stone-800 dark:text-stone-250 group-hover:translate-x-1.5 transition-transform"
                    >
                      Read Full Post <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>

                {/* Thumbnail Cover Image if available */}
                {post.coverImageUrl && (
                  <Link
                    to={`/posts/${post.id}`}
                    className="w-full md:w-40 h-28 shrink-0 rounded overflow-hidden bg-stone-100 dark:bg-stone-850 border border-stone-200/40 dark:border-stone-800/40 group-hover:opacity-90 transition-opacity"
                  >
                    <img
                      src={post.coverImageUrl}
                      alt=""
                      className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-500"
                    />
                  </Link>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
