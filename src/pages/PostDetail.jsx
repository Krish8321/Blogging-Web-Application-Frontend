import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../hooks/useApi";
import { User, Calendar, Edit, Trash2, MessageSquare, Send, X, ShieldAlert } from "lucide-react";

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Comments editing state
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");

  const fetchPostAndComments = async () => {
    try {
      setLoading(true);
      setError("");

      // 1. Fetch post detail
      const postRes = await api.get(`/posts/${id}`);
      if (postRes.data?.success && postRes.data?.post) {
        setPost(postRes.data.post);
      } else {
        setError("Article not found.");
        setLoading(false);
        return;
      }

      // 2. Fetch comments for this post
      try {
        const commentsRes = await api.get(`/comments/${id}`);
        if (commentsRes.data?.success) {
          setComments(commentsRes.data.comments);
        }
      } catch (commErr) {
        console.error("Failed to load comments", commErr);
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.status === 403 || err.response?.status === 401
          ? "This article belongs to a private account. Follow them to access this content."
          : "Failed to load article."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostAndComments();
  }, [id, currentUser]);

  const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this article? This action cannot be undone.")) {
      return;
    }
    try {
      const res = await api.delete(`/posts/${post.id}`);
      if (res.data?.success) {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete post.");
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    try {
      const res = await api.post(`/comments/${post.id}`, {
        content: commentContent.trim(),
      });
      if (res.data?.success && res.data?.comment) {
        // Optimistically prepend new comment (the backend returns newest first anyway, so we fetch or prepend)
        // Let's refetch comments to be 100% accurate and get author details attached
        const commentsRes = await api.get(`/comments/${post.id}`);
        if (commentsRes.data?.success) {
          setComments(commentsRes.data.comments);
        }
        setCommentContent("");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to post comment.");
    }
  };

  const handleUpdateComment = async (commentId) => {
    if (!editingCommentText.trim()) return;

    try {
      const res = await api.patch(`/comments/${commentId}`, {
        content: editingCommentText.trim(),
      });
      if (res.data?.success) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId ? { ...c, content: editingCommentText.trim() } : c
          )
        );
        setEditingCommentId(null);
        setEditingCommentText("");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update comment.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;

    try {
      await api.delete(`/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete comment.");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 animate-pulse space-y-6">
        <div className="h-4 bg-stone-200 dark:bg-stone-850 w-24 rounded"></div>
        <div className="h-10 bg-stone-300 dark:bg-stone-800 w-3/4 rounded"></div>
        <div className="h-6 bg-stone-205 dark:bg-stone-900 w-full rounded"></div>
        <div className="h-48 bg-stone-100 dark:bg-stone-850 w-full rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="glass-card p-8 rounded-lg space-y-4">
          <ShieldAlert size={40} className="mx-auto text-amber-650" />
          <h3 className="font-serif text-lg font-bold text-stone-950 dark:text-stone-100">
            Access Restricted
          </h3>
          <p className="text-sm text-stone-500 dark:text-stone-400 font-serif leading-relaxed">
            {error}
          </p>
          <Link
            to="/"
            className="inline-block mt-4 text-xs font-semibold uppercase tracking-wider text-stone-900 dark:text-stone-100 border border-stone-300 dark:border-stone-700 px-4 py-2 rounded-md hover:bg-stone-50 dark:hover:bg-stone-950 transition-colors"
          >
            Back to Feed
          </Link>
        </div>
      </div>
    );
  }

  const isOwnPost = currentUser?.id === post.authorId;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Article Header */}
      <header className="space-y-6">
        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-stone-900 dark:text-stone-50 tracking-tight leading-tight">
          {post.title}
        </h1>

        {/* Metadata & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-y border-stone-200/50 dark:border-stone-800/50 py-4">
          <div className="flex items-center gap-3">
            {post.author.profile?.avatarUrl ? (
              <img
                src={post.author.profile.avatarUrl}
                alt=""
                className="w-10 h-10 rounded-full object-cover border border-stone-200"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center text-base font-semibold text-stone-600 dark:text-stone-300 uppercase">
                {post.author.profile?.displayName?.charAt(0)}
              </div>
            )}
            <div className="text-xs">
              <Link
                to={`/${post.author.profile?.username}`}
                className="font-semibold text-stone-850 dark:text-stone-100 hover:underline block"
              >
                {post.author.profile?.displayName}
              </Link>
              <span className="text-stone-500 dark:text-stone-400 flex items-center gap-1.5 mt-0.5">
                <Calendar size={11} /> {formatDate(post.publishedAt || post.createdAt)}
              </span>
            </div>
          </div>

          {/* Author specific edit/delete actions */}
          {isOwnPost && (
            <div className="flex gap-2">
              <Link
                to={`/edit/${post.id}`}
                className="flex items-center gap-1 text-xs border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 px-3 py-1.5 rounded hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors"
              >
                <Edit size={12} /> Edit
              </Link>
              <button
                onClick={handleDeletePost}
                className="flex items-center gap-1 text-xs border border-red-200/50 text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 px-3 py-1.5 rounded transition-colors"
              >
                <Trash2 size={12} /> Delete
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Cover Image Banner */}
      {post.coverImageUrl && (
        <div className="w-full h-80 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-900 border border-stone-200/40 dark:border-stone-800/40">
          <img
            src={post.coverImageUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Post content body */}
      <article className="prose dark:prose-invert max-w-none">
        <p className="text-stone-800 dark:text-stone-200 font-serif text-base md:text-lg leading-relaxed whitespace-pre-line">
          {post.content}
        </p>
      </article>

      {/* Comments Section */}
      <section className="border-t border-stone-200 dark:border-stone-800 pt-10 space-y-8">
        <div className="flex items-center gap-2">
          <MessageSquare size={20} className="text-stone-500" />
          <h2 className="text-2xl font-serif font-bold text-stone-950 dark:text-stone-100">
            Discussion ({comments.length})
          </h2>
        </div>

        {/* Comment Input */}
        {currentUser ? (
          <form onSubmit={handlePostComment} className="flex gap-3">
            <input
              type="text"
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Join the conversation..."
              className="flex-1 px-4 py-2.5 bg-transparent border border-stone-300 dark:border-stone-700 rounded-md text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-1 focus:ring-stone-500"
            />
            <button
              type="submit"
              className="bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 px-4 rounded-md hover:opacity-90 transition-opacity flex items-center justify-center shrink-0"
            >
              <Send size={15} />
            </button>
          </form>
        ) : (
          <p className="text-sm text-stone-500 dark:text-stone-400 font-serif">
            Please{" "}
            <Link to="/login" className="underline font-semibold">
              login
            </Link>{" "}
            to write comments.
          </p>
        )}

        {/* Comments List */}
        <div className="space-y-6">
          {comments.length === 0 ? (
            <p className="text-center py-6 text-stone-400 dark:text-stone-500 text-xs font-serif italic">
              No comments yet. Write the first one!
            </p>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="flex gap-4 items-start pb-6 border-b border-stone-100 dark:border-stone-850 last:border-b-0"
              >
                {comment.author?.profile?.avatarUrl ? (
                  <img
                    src={comment.author.profile.avatarUrl}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover border border-stone-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center text-xs font-semibold text-stone-600 dark:text-stone-350 uppercase">
                    {comment.author?.profile?.displayName?.charAt(0) || "U"}
                  </div>
                )}

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <Link
                        to={`/${comment.author?.profile?.username}`}
                        className="text-xs font-bold text-stone-800 dark:text-stone-250 hover:underline"
                      >
                        {comment.author?.profile?.displayName}
                      </Link>
                      <span className="text-[10px] text-stone-400">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>

                    {currentUser?.id === comment.authorId && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingCommentId(comment.id);
                            setEditingCommentText(comment.content);
                          }}
                          className="text-[11px] text-stone-400 hover:text-stone-800 dark:hover:text-stone-250"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-[11px] text-red-400 hover:text-red-650"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  {editingCommentId === comment.id ? (
                    <div className="flex items-center gap-2 pt-1.5">
                      <input
                        type="text"
                        value={editingCommentText}
                        onChange={(e) => setEditingCommentText(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs bg-transparent border border-stone-350 dark:border-stone-700 rounded focus:outline-none focus:ring-1 focus:ring-stone-500"
                      />
                      <button
                        onClick={() => handleUpdateComment(comment.id)}
                        className="p-1.5 bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 rounded hover:opacity-90"
                      >
                        <Send size={12} />
                      </button>
                      <button
                        onClick={() => setEditingCommentId(null)}
                        className="p-1.5 border border-stone-300 dark:border-stone-700 rounded text-stone-500 hover:bg-stone-50"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs md:text-sm text-stone-700 dark:text-stone-300 font-serif leading-relaxed">
                      {comment.content}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
