import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../hooks/useApi";
import { Plus, Edit, Trash2, Archive, Globe, FileText, Eye, AlertCircle } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("PUBLISHED"); // 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

  const fetchMyPosts = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/posts/my-posts");
      if (res.data?.success) {
        setPosts(res.data.posts);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch your articles. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyPosts();
    }
  }, [user]);

  const handlePublish = async (postId) => {
    try {
      const res = await api.patch(`/posts/${postId}/publish`);
      if (res.data?.success) {
        fetchMyPosts();
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to publish post.");
    }
  };

  const handleArchive = async (postId) => {
    try {
      const res = await api.patch(`/posts/${postId}/archive`);
      if (res.data?.success) {
        fetchMyPosts();
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to archive post.");
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this article? This action is permanent.")) {
      return;
    }
    try {
      const res = await api.delete(`/posts/${postId}`);
      if (res.data?.success) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete post.");
    }
  };

  const filteredPosts = posts.filter((p) => p.status === activeTab);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="h-8 bg-stone-200 dark:bg-stone-850 w-48 rounded"></div>
        <div className="h-10 bg-stone-105 dark:bg-stone-900 w-full rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-32 bg-stone-200 dark:bg-stone-850 rounded-lg"></div>
          <div className="h-32 bg-stone-200 dark:bg-stone-850 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold font-serif text-stone-900 dark:text-stone-100">
            Author Console
          </h1>
          <p className="text-xs text-stone-500 mt-1.5 font-serif">
            Draft, review, publish, and manage your articles and stories.
          </p>
        </div>
        <Link
          to="/write"
          className="inline-flex items-center gap-1.5 text-sm bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 px-4 py-2 rounded-md hover:opacity-90 font-medium self-start sm:self-auto transition-opacity"
        >
          <Plus size={15} /> Create Article
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 rounded border-l-2 border-red-500 text-sm">
          {error}
        </div>
      )}

      {/* Tabs Menu */}
      <div className="flex border-b border-stone-200 dark:border-stone-800">
        {[
          { key: "PUBLISHED", label: "Published Feed", count: posts.filter((p) => p.status === "PUBLISHED").length },
          { key: "DRAFT", label: "Drafts Canvas", count: posts.filter((p) => p.status === "DRAFT").length },
          { key: "ARCHIVED", label: "Archive Folder", count: posts.filter((p) => p.status === "ARCHIVED").length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 -mb-px transition-all flex items-center gap-2 ${
              activeTab === tab.key
                ? "border-stone-900 dark:border-stone-100 text-stone-900 dark:text-stone-100 font-bold"
                : "border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
            }`}
          >
            {tab.label}
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
              activeTab === tab.key
                ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950"
                : "bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400"
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Post cards list */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-stone-300 dark:border-stone-800 rounded-lg p-6">
          <AlertCircle size={32} className="mx-auto text-stone-400 mb-3" />
          <h3 className="font-serif text-base font-semibold text-stone-900 dark:text-stone-100">
            Folder is empty.
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-xs mx-auto">
            You don't have any articles in the {activeTab.toLowerCase()} status folder.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="glass-card p-6 rounded-lg flex flex-col justify-between hover:shadow-md transition-shadow relative"
            >
              <div className="space-y-3">
                {/* Meta details */}
                <div className="flex justify-between items-center text-[10px] text-stone-500 font-mono">
                  <span>Last update: {formatDate(post.updatedAt)}</span>
                  {post.status === "PUBLISHED" && (
                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400 uppercase font-semibold">
                      <Globe size={11} /> Live
                    </span>
                  )}
                  {post.status === "DRAFT" && (
                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 uppercase font-semibold">
                      <FileText size={11} /> Draft
                    </span>
                  )}
                  {post.status === "ARCHIVED" && (
                    <span className="flex items-center gap-1 text-stone-600 dark:text-stone-400 uppercase font-semibold">
                      <Archive size={11} /> Archived
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-50 leading-snug">
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-xs text-stone-550 dark:text-stone-350 line-clamp-3 leading-relaxed font-serif">
                  {post.content.replace(/[#*`_[\]]/g, "")}
                </p>
              </div>

              {/* Actions row */}
              <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-850 flex items-center justify-between">
                <div className="flex gap-2">
                  <Link
                    to={`/edit/${post.id}`}
                    className="p-2 border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-350 hover:text-stone-900 dark:hover:text-stone-150 rounded transition-colors"
                    title="Edit Post"
                  >
                    <Edit size={13} />
                  </Link>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="p-2 border border-red-150 text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-colors"
                    title="Delete Post"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                <div className="flex gap-2 items-center">
                  {post.status === "PUBLISHED" && (
                    <>
                      <Link
                        to={`/posts/${post.id}`}
                        className="flex items-center gap-1.5 text-xs text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-stone-700 px-3 py-2 rounded hover:bg-stone-50 dark:hover:bg-stone-900 font-medium"
                      >
                        <Eye size={12} /> View
                      </Link>
                      <button
                        onClick={() => handleArchive(post.id)}
                        className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 border border-amber-200/40 px-3 py-2 rounded hover:bg-amber-50 dark:hover:bg-amber-950/20 font-medium"
                      >
                        <Archive size={12} /> Archive
                      </button>
                    </>
                  )}

                  {(post.status === "DRAFT" || post.status === "ARCHIVED") && (
                    <button
                      onClick={() => handlePublish(post.id)}
                      className="flex items-center gap-1.5 text-xs bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 px-3.5 py-2 rounded hover:opacity-90 font-medium transition-opacity"
                    >
                      <Globe size={12} /> Publish Live
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
