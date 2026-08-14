import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../hooks/useApi";
import { User, Users, Globe, ArrowRight, Search } from "lucide-react";

export default function Discover() {
  const [creators, setCreators] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCreators = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/users");
      if (res.data?.success) {
        setCreators(
          res.data.users.map((user) => ({
            id: user.id,
            ...user.profile,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to load creators", err);
      setError("Could not load creators feed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreators();
  }, []);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) {
      fetchCreators();
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await api.get(`/users/search?username=${encodeURIComponent(query)}`);
      if (res.data?.success) {
        setCreators(
          res.data.users.map((user) => ({
            id: user.id,
            ...user.profile,
          }))
        );
      }
    } catch (err) {
      console.error("Search failed", err);
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    fetchCreators();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="border-b border-stone-250 dark:border-stone-800 pb-8 mb-10">
        <h1 className="text-4xl md:text-5xl font-bold font-serif text-stone-900 dark:text-stone-100 mb-3">
          Discover Creators
        </h1>
        <p className="text-stone-500 dark:text-stone-400 max-w-xl text-sm md:text-base font-serif italic">
          Explore active writers, read their journals, and connect with minds from around the world.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="mb-8 max-w-md">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder="Search by username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-16 py-2.5 border border-stone-300 dark:border-stone-800 rounded-lg bg-stone-50 dark:bg-stone-900/30 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-sm font-serif transition-all"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
            <Search size={16} />
          </div>
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-semibold text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-44 bg-stone-200 dark:bg-stone-850 rounded-xl"></div>
          ))}
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-350 rounded border-l-2 border-red-500 text-sm">
          {error}
        </div>
      ) : creators.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-stone-300 dark:border-stone-800 rounded-lg p-6">
          <Users size={40} className="mx-auto text-stone-400 mb-4" />
          <h3 className="font-serif text-lg font-semibold text-stone-900 dark:text-stone-100">
            No creators found.
          </h3>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1 max-w-xs mx-auto">
            {searchQuery ? `No matching users found for "${searchQuery}"` : "Once writers register, they will appear here!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {creators.map((creator) => (
            <div
              key={creator.id}
              className="glass-card p-6 rounded-xl flex flex-col justify-between hover:shadow-md transition-shadow relative"
            >
              <div className="space-y-4">
                {/* Header info */}
                <div className="flex items-center gap-4">
                  {creator.avatarUrl ? (
                    <img
                      src={creator.avatarUrl}
                      alt={creator.displayName}
                      className="w-12 h-12 rounded-full object-cover border border-stone-200"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center text-lg font-bold text-stone-600 dark:text-stone-300 uppercase">
                      {creator.displayName?.charAt(0) || "U"}
                    </div>
                  )}
                  <div>
                    <h3 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-lg leading-snug">
                      {creator.displayName}
                    </h3>
                    <p className="text-xs text-stone-450 dark:text-stone-400 font-mono">@{creator.username}</p>
                  </div>
                </div>

                {/* Bio snippet */}
                {creator.bio ? (
                  <p className="text-stone-650 dark:text-stone-350 text-xs font-serif line-clamp-2 italic">
                    "{creator.bio}"
                  </p>
                ) : (
                  <p className="text-stone-400 text-[11px] font-serif italic">No biography provided.</p>
                )}
              </div>

              {/* Action trigger */}
              <div className="mt-6 pt-4 border-t border-stone-150 dark:border-stone-850 flex justify-between items-center text-xs">
                {creator.website ? (
                  <a
                    href={creator.website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-stone-500 hover:text-stone-800 dark:hover:text-stone-300"
                  >
                    <Globe size={12} /> Visit site
                  </a>
                ) : (
                  <span className="text-stone-350 dark:text-stone-600 italic">No links</span>
                )}
                <Link
                  to={`/${creator.username}`}
                  className="inline-flex items-center gap-1 font-semibold text-stone-900 dark:text-stone-100 hover:underline"
                >
                  View Profile <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
