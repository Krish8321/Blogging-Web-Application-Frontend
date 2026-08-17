import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../hooks/useApi";
import { User, Link as LinkIcon, Lock, Calendar, Settings, X, Globe, UserCheck, UserPlus } from "lucide-react";

// Custom SVG Icons for GitHub and LinkedIn since they are missing in this version of lucide-react
const GitHub = ({ size = 24, className }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedIn = ({ size = 24, className }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export default function Profile() {
  const { username } = useParams();
  const { user: currentUser, updateProfile } = useAuth();

  const [profile, setProfile] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit form states
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: "",
    bio: "",
    avatarUrl: "",
    website: "",
    github: "",
    linkedin: "",
    isPrivate: false,
  });
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");
  const [updating, setUpdating] = useState(false);

  // Modal lists
  const [modalType, setModalType] = useState(null); // 'followers' | 'following' | null

  const isOwnProfile = currentUser?.profile?.username === username;

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError("");

      // 1. Fetch public profile details
      const profileRes = await api.get(`/users/${username}`);
      if (!profileRes.data?.success || !profileRes.data?.user) {
        setError("User profile not found.");
        setLoading(false);
        return;
      }
      const profData = profileRes.data.user;
      setProfile(profData);

      // Pre-fill edit form
      setEditForm({
        displayName: profData.displayName || "",
        bio: profData.bio || "",
        avatarUrl: profData.avatarUrl || "",
        website: profData.website || "",
        github: profData.github || "",
        linkedin: profData.linkedin || "",
        isPrivate: profData.isPrivate || false,
      });

      // 2. Fetch followers
      const followersRes = await api.get(`/users/${username}/followers`);
      const followerList = followersRes.data?.followers || [];
      setFollowers(followerList);

      // Check if current logged-in user is following this profile
      if (currentUser) {
        const followingMatch = followerList.some(
          (f) => f.follower?.id === currentUser.id
        );
        setIsFollowing(followingMatch);
      }

      // 3. Fetch following
      const followingRes = await api.get(`/users/${username}/following`);
      setFollowing(followingRes.data?.following || []);

      // 4. Fetch posts and filter by this profile's username
      // (The backend handles privacy restrictions - if private and not followed, it won't show posts in feed)
      const postsRes = await api.get("/posts");
      if (postsRes.data?.success) {
        const filtered = postsRes.data.posts.filter(
          (p) => p.author?.profile?.username === username
        );
        setPosts(filtered);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [username, currentUser]);

  const handleFollowToggle = async () => {
    if (!currentUser) {
      setError("Please log in to follow users.");
      return;
    }
    try {
      if (isFollowing) {
        await api.delete(`/users/${username}/follow`);
        setIsFollowing(false);
        setFollowers((prev) => prev.filter((f) => f.follower?.id !== currentUser.id));
      } else {
        await api.post(`/users/${username}/follow`);
        setIsFollowing(true);
        // Optimistically add to followers list
        setFollowers((prev) => [
          {
            follower: {
              id: currentUser.id,
              profile: {
                username: currentUser.profile.username,
                displayName: currentUser.profile.displayName,
                avatarUrl: currentUser.profile.avatarUrl,
              },
            },
          },
          ...prev,
        ]);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Action failed.");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setEditError("");
    setEditSuccess("");
    setUpdating(true);

    // Validate URLs (if provided)
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    if (editForm.avatarUrl && !urlPattern.test(editForm.avatarUrl)) {
      setEditError("Invalid Avatar URL.");
      setUpdating(false);
      return;
    }
    if (editForm.website && !urlPattern.test(editForm.website)) {
      setEditError("Invalid Website URL.");
      setUpdating(false);
      return;
    }
    if (editForm.github && !urlPattern.test(editForm.github)) {
      setEditError("Invalid GitHub URL.");
      setUpdating(false);
      return;
    }
    if (editForm.linkedin && !urlPattern.test(editForm.linkedin)) {
      setEditError("Invalid LinkedIn URL.");
      setUpdating(false);
      return;
    }

    const payload = {};
    if (editForm.displayName) payload.displayName = editForm.displayName;
    payload.bio = editForm.bio;
    payload.avatarUrl = editForm.avatarUrl || undefined;
    payload.website = editForm.website || undefined;
    payload.github = editForm.github || undefined;
    payload.linkedin = editForm.linkedin || undefined;
    payload.isPrivate = editForm.isPrivate;

    const result = await updateProfile(payload);
    setUpdating(false);

    if (result.success) {
      setEditSuccess("Profile updated successfully!");
      setTimeout(() => {
        setIsEditing(false);
        fetchProfileData();
      }, 1500);
    } else {
      setEditError(result.message);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isContentBlocked = profile?.isPrivate && !isOwnProfile && !isFollowing;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-stone-200 dark:bg-stone-850 rounded-full"></div>
          <div className="space-y-3">
            <div className="h-6 bg-stone-300 dark:bg-stone-800 w-48 rounded"></div>
            <div className="h-4 bg-stone-200 dark:bg-stone-850 w-32 rounded"></div>
          </div>
        </div>
        <div className="h-16 bg-stone-200 dark:bg-stone-850 w-full rounded"></div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-750 dark:text-red-300 rounded max-w-md mx-auto border-l-2 border-red-500">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Profile Info Section with cool top banner */}
      <div className="relative glass-card rounded-xl overflow-hidden mb-10 shadow-sm border border-stone-200/50 dark:border-stone-850/50">
        
        {/* Cool graphite gradient top banner with yellow batman gold accent line */}
        <div className="h-36 w-full bg-gradient-to-r from-stone-950 via-zinc-900 to-stone-950 border-b border-stone-800/10 relative">
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-60"></div>
        </div>

        {/* Profile Details Container - Shifted up */}
        <div className="px-6 pb-6 md:px-8 md:pb-8 relative -mt-12 space-y-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
            
            {/* Avatar - With thick border and shifted up */}
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.displayName}
                className="w-28 h-28 rounded-full object-cover border-4 border-white dark:border-stone-900 shadow-md shrink-0 bg-stone-100"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-stone-200 dark:bg-stone-800 border-4 border-white dark:border-stone-900 shadow-md flex items-center justify-center text-4xl font-serif font-bold text-stone-600 dark:text-stone-300 uppercase shrink-0">
                {profile.displayName.charAt(0)}
              </div>
            )}

            {/* Details */}
            <div className="flex-1 text-center sm:text-left space-y-2 pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-center sm:justify-start">
                <h1 className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100">
                  {profile.displayName}
                </h1>
                {profile.isPrivate && (
                  <span className="inline-flex items-center gap-1 self-center bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-350 px-2 py-0.5 rounded text-xs font-semibold border border-stone-200/40 dark:border-stone-700/40">
                    <Lock size={10} /> Private
                  </span>
                )}
              </div>

              <p className="text-sm text-stone-500 dark:text-stone-400 font-mono">@{profile.username}</p>

              {/* Social Links */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1.5 text-xs text-stone-600 dark:text-stone-400">
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 hover:text-stone-900 dark:hover:text-stone-200 underline"
                  >
                    <Globe size={13} /> Website
                  </a>
                )}
                {profile.github && (
                  <a
                    href={profile.github}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 hover:text-stone-900 dark:hover:text-stone-200 underline"
                  >
                    <GitHub size={13} /> GitHub
                  </a>
                )}
                {profile.linkedin && (
                  <a
                    href={profile.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 hover:text-stone-900 dark:hover:text-stone-200 underline"
                  >
                    <LinkedIn size={13} /> LinkedIn
                  </a>
                )}
              </div>
            </div>

            {/* Action Button (Edit / Follow) */}
            <div className="shrink-0 pb-2">
              {isOwnProfile ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 text-sm border border-stone-300 dark:border-stone-750 text-stone-700 dark:text-stone-300 px-4 py-2 rounded-md hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors font-medium cursor-pointer"
                >
                  <Settings size={15} /> Edit Profile
                </button>
              ) : (
                currentUser && (
                  <button
                    onClick={handleFollowToggle}
                    className={`flex items-center gap-1.5 text-sm px-4 py-2 rounded-md transition-colors font-medium cursor-pointer ${
                      isFollowing
                        ? "border border-stone-300 dark:border-stone-750 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-900"
                        : "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 hover:opacity-90"
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck size={15} /> Following
                      </>
                    ) : (
                      <>
                        <UserPlus size={15} /> Follow
                      </>
                    )}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="border-t border-stone-200/50 dark:border-stone-800/50 pt-5">
              <p className="text-stone-650 dark:text-stone-300 font-serif italic text-sm md:text-base leading-relaxed">
                "{profile.bio}"
              </p>
            </div>
          )}

          {/* Stats Row */}
          <div className="flex gap-8 border-t border-stone-200/50 dark:border-stone-800/50 pt-5 text-sm justify-center sm:justify-start">
            <div>
              <span className="font-semibold text-stone-900 dark:text-stone-100">{posts.length}</span>{" "}
              <span className="text-stone-500 dark:text-stone-400">Posts</span>
            </div>
            <button
              onClick={() => followers.length > 0 && setModalType("followers")}
              className="hover:underline disabled:no-underline cursor-pointer"
              disabled={followers.length === 0}
            >
              <span className="font-semibold text-stone-900 dark:text-stone-100">{followers.length}</span>{" "}
              <span className="text-stone-500 dark:text-stone-400">Followers</span>
            </button>
            <button
              onClick={() => following.length > 0 && setModalType("following")}
              className="hover:underline disabled:no-underline cursor-pointer"
              disabled={following.length === 0}
            >
              <span className="font-semibold text-stone-900 dark:text-stone-100">{following.length}</span>{" "}
              <span className="text-stone-500 dark:text-stone-400">Following</span>
            </button>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div>
        <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-6 pb-2 border-b border-stone-200 dark:border-stone-800">
          Published Articles
        </h2>

        {isContentBlocked ? (
          <div className="text-center py-16 glass-card rounded-lg max-w-lg mx-auto p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-stone-100 dark:bg-stone-900 flex items-center justify-center mx-auto text-stone-550 dark:text-stone-400 border border-stone-200 dark:border-stone-800">
              <Lock size={20} />
            </div>
            <h3 className="font-serif text-lg font-semibold text-stone-950 dark:text-stone-100">
              This account is private.
            </h3>
            <p className="text-sm text-stone-500 dark:text-stone-400 max-w-xs mx-auto">
              Follow @{profile.username} to view their published articles and updates.
            </p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-stone-500 dark:text-stone-400 text-sm font-serif">
            No articles published yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post) => (
              <article key={post.id} className="glass-card p-5 rounded-lg flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1 text-[11px] text-stone-500">
                    <Calendar size={10} />
                    {formatDate(post.publishedAt || post.createdAt)}
                  </span>
                  <Link to={`/posts/${post.id}`}>
                    <h3 className="text-xl font-serif font-bold text-stone-950 dark:text-stone-50 hover:underline leading-snug">
                      {post.title}
                    </h3>
                  </Link>
                  <p className="text-stone-605 dark:text-stone-350 text-xs line-clamp-3 leading-relaxed font-serif">
                    {post.content.replace(/[#*`_[\]]/g, "")}
                  </p>
                </div>
                <div className="pt-2 flex justify-between items-center border-t border-stone-100 dark:border-stone-850">
                  <Link
                    to={`/posts/${post.id}`}
                    className="text-xs font-semibold text-stone-800 dark:text-stone-200 hover:underline"
                  >
                    Read Story
                  </Link>
                  {post.coverImageUrl && (
                    <div className="w-12 h-8 rounded overflow-hidden">
                      <img src={post.coverImageUrl} alt="" className="w-full h-full object-cover filter grayscale" />
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-stone-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-800 max-w-lg w-full rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800">
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                Edit Profile Settings
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-250 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {editError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 border-l-2 border-red-500 text-red-700 dark:text-red-350 text-xs rounded">
                  {editError}
                </div>
              )}
              {editSuccess && (
                <div className="p-3 bg-green-50 dark:bg-green-950/20 border-l-2 border-green-500 text-green-700 dark:text-green-300 text-xs rounded">
                  {editSuccess}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.displayName}
                    onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-transparent border border-stone-300 dark:border-stone-700 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-500 text-stone-900 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                    Avatar URL
                  </label>
                  <input
                    type="text"
                    value={editForm.avatarUrl}
                    onChange={(e) => setEditForm({ ...editForm, avatarUrl: e.target.value })}
                    placeholder="https://image-url.com/profile.jpg"
                    className="w-full px-3 py-2 text-sm bg-transparent border border-stone-300 dark:border-stone-700 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-500 text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                  Bio / Tagline
                </label>
                <textarea
                  rows={3}
                  maxLength={500}
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  placeholder="Tell your readers a bit about yourself..."
                  className="w-full px-3 py-2 text-sm bg-transparent border border-stone-300 dark:border-stone-700 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-500 text-stone-900 dark:text-stone-100 resize-none font-serif"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                    Personal Website
                  </label>
                  <input
                    type="text"
                    value={editForm.website}
                    onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                    placeholder="https://krish.dev"
                    className="w-full px-3 py-2 text-xs bg-transparent border border-stone-300 dark:border-stone-700 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-500 text-stone-900 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                    GitHub URL
                  </label>
                  <input
                    type="text"
                    value={editForm.github}
                    onChange={(e) => setEditForm({ ...editForm, github: e.target.value })}
                    placeholder="https://github.com/username"
                    className="w-full px-3 py-2 text-xs bg-transparent border border-stone-300 dark:border-stone-700 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-500 text-stone-900 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                    LinkedIn URL
                  </label>
                  <input
                    type="text"
                    value={editForm.linkedin}
                    onChange={(e) => setEditForm({ ...editForm, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-3 py-2 text-xs bg-transparent border border-stone-300 dark:border-stone-700 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-500 text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 border-t border-stone-150 dark:border-stone-800 pt-4">
                <input
                  id="isPrivate"
                  type="checkbox"
                  checked={editForm.isPrivate}
                  onChange={(e) => setEditForm({ ...editForm, isPrivate: e.target.checked })}
                  className="w-4 h-4 rounded text-stone-950 focus:ring-stone-500 bg-transparent border-stone-300 dark:border-stone-700"
                />
                <div>
                  <label htmlFor="isPrivate" className="text-sm font-semibold text-stone-900 dark:text-stone-100 select-none">
                    Make account private
                  </label>
                  <p className="text-[11px] text-stone-550 dark:text-stone-400 leading-snug">
                    When active, only users who follow you will be able to read your articles.
                  </p>
                </div>
              </div>

              <div className="border-t border-stone-200 dark:border-stone-800 pt-4 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-stone-300 dark:border-stone-700 text-sm font-medium rounded-md text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 hover:opacity-90 disabled:opacity-50 text-sm font-medium rounded-md"
                >
                  {updating ? "Saving Changes..." : "Save Settings"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Followers / Following Lists Modal */}
      {modalType && (
        <div className="fixed inset-0 bg-stone-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-800 max-w-sm w-full rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 dark:border-stone-800">
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 capitalize">
                {modalType}
              </h3>
              <button
                onClick={() => setModalType(null)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-250 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 max-h-[50vh] overflow-y-auto space-y-3">
              {modalType === "followers"
                ? followers.map((f) => (
                    <Link
                      key={f.follower.id}
                      to={`/${f.follower.profile?.username}`}
                      onClick={() => setModalType(null)}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-950 transition-colors"
                    >
                      {f.follower.profile?.avatarUrl ? (
                        <img
                          src={f.follower.profile.avatarUrl}
                          alt=""
                          className="w-9 h-9 rounded-full object-cover border border-stone-200"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center text-sm font-medium text-stone-600 dark:text-stone-300 uppercase">
                          {f.follower.profile?.displayName?.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                          {f.follower.profile?.displayName}
                        </p>
                        <p className="text-xs text-stone-500 font-mono">@{f.follower.profile?.username}</p>
                      </div>
                    </Link>
                  ))
                : following.map((f) => (
                    <Link
                      key={f.following.id}
                      to={`/${f.following.profile?.username}`}
                      onClick={() => setModalType(null)}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-950 transition-colors"
                    >
                      {f.following.profile?.avatarUrl ? (
                        <img
                          src={f.following.profile.avatarUrl}
                          alt=""
                          className="w-9 h-9 rounded-full object-cover border border-stone-200"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center text-sm font-medium text-stone-600 dark:text-stone-300 uppercase">
                          {f.following.profile?.displayName?.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                          {f.following.profile?.displayName}
                        </p>
                        <p className="text-xs text-stone-500 font-mono">@{f.following.profile?.username}</p>
                      </div>
                    </Link>
                  ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
