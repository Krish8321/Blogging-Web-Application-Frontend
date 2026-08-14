import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { api } from "../hooks/useApi";
import { ArrowLeft, Save, Send, Image as ImageIcon } from "lucide-react";

export default function WritePost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditing);
  const [error, setError] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);

  // Fetch post details if editing
  useEffect(() => {
    if (!isEditing) return;

    const fetchPost = async () => {
      try {
        const response = await api.get(`/posts/${id}`);
        if (response.data?.success && response.data?.post) {
          const post = response.data.post;
          setTitle(post.title);
          setSlug(post.slug);
          setContent(post.content);
          setCoverImageUrl(post.coverImageUrl || "");
          if (post.coverImageUrl) setShowImageInput(true);
        } else {
          setError("Failed to fetch post details.");
        }
      } catch (err) {
        console.error(err);
        setError("Error loading post. You might not have permission to view it.");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchPost();
  }, [id, isEditing]);

  // Auto-generate slug from title
  const handleTitleChange = (e) => {
    const val = e.target.value;
    setTitle(val);
    if (!isEditing) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "") // remove special chars
        .replace(/\s+/g, "-") // replace spaces with dashes
        .replace(/-+/g, "-") // collapse consecutive dashes
        .trim();
      setSlug(generatedSlug);
    }
  };

  const handleSave = async (publishImmediate = false) => {
    if (!title.trim() || !slug.trim() || !content.trim()) {
      setError("Title, slug, and content are required.");
      return;
    }

    setError("");
    setLoading(true);

    const body = {
      title: title.trim(),
      slug: slug.trim().toLowerCase(),
      content: content.trim(),
      coverImageUrl: coverImageUrl.trim() || null,
    };

    try {
      let savedPost = null;

      if (isEditing) {
        // Update post
        const response = await api.put(`/posts/${id}`, body);
        if (response.data?.success) {
          savedPost = response.data.post;
        }
      } else {
        // Create post
        const response = await api.post("/posts", body);
        if (response.data?.success) {
          savedPost = response.data.post;
        }
      }

      if (!savedPost) {
        throw new Error("Failed to save post");
      }

      // If "Publish" was clicked, trigger the publish patch request
      if (publishImmediate) {
        await api.patch(`/posts/${savedPost.id}/publish`);
      }

      navigate(publishImmediate ? "/" : "/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "An error occurred while saving your article.");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center animate-pulse space-y-4">
        <div className="h-10 bg-stone-200 dark:bg-stone-850 w-2/3 rounded mx-auto"></div>
        <div className="h-64 bg-stone-105 dark:bg-stone-900 w-full rounded"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Back button & controls bar */}
      <div className="flex justify-between items-center mb-8 border-b border-stone-200/50 dark:border-stone-800/50 pb-4">
        <Link
          to={isEditing ? `/posts/${id}` : "/dashboard"}
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 transition-colors"
        >
          <ArrowLeft size={14} /> Back
        </Link>

        <div className="flex gap-3">
          <button
            onClick={() => handleSave(false)}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 px-3.5 py-2 rounded-md hover:bg-stone-50 dark:hover:bg-stone-900 disabled:opacity-50 transition-colors"
          >
            <Save size={14} /> Save Draft
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 px-4 py-2 rounded-md hover:opacity-90 disabled:opacity-50 transition-all"
          >
            <Send size={13} /> {isEditing ? "Publish Changes" : "Publish Now"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border-l-2 border-red-500 text-red-755 dark:text-red-300 text-sm rounded">
          {error}
        </div>
      )}

      {/* Editor Canvas */}
      <div className="space-y-6">
        {/* Title Input */}
        <div>
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Title your story..."
            className="w-full text-3xl md:text-4xl font-serif font-bold bg-transparent border-none focus:outline-none focus:ring-0 placeholder-stone-300 dark:placeholder-stone-850 text-stone-950 dark:text-stone-50"
          />
        </div>

        {/* Slug Input */}
        <div className="flex items-center gap-2 text-xs font-mono text-stone-400 dark:text-stone-500 border-b border-stone-200/40 dark:border-stone-800/40 pb-4">
          <span>slug:</span>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
            placeholder="my-story-slug"
            className="bg-transparent border-none p-0 focus:outline-none focus:ring-0 text-stone-600 dark:text-stone-400 font-mono w-full"
          />
        </div>

        {/* Image Url Toggle & Input */}
        <div className="space-y-3">
          <button
            onClick={() => setShowImageInput(!showImageInput)}
            className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-350 transition-colors"
          >
            <ImageIcon size={14} /> {showImageInput ? "Remove Cover Image" : "Add Cover Image URL"}
          </button>

          {showImageInput && (
            <input
              type="text"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full px-3 py-2 text-xs bg-transparent border border-stone-300 dark:border-stone-700 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-500 text-stone-900 dark:text-stone-100"
            />
          )}
        </div>

        {/* Post Content Body */}
        <div>
          <textarea
            rows={15}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your story..."
            className="w-full bg-transparent border-none resize-none focus:outline-none focus:ring-0 text-sm md:text-base font-serif leading-relaxed text-stone-800 dark:text-stone-200 placeholder-stone-400"
          />
        </div>
      </div>
    </div>
  );
}
