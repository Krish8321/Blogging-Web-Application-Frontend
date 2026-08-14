import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PenSquare, User, LogOut, Menu, X, LayoutDashboard, BookOpen } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);


  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const activeLink = (path) => {
    return location.pathname === path
      ? "text-stone-900 dark:text-stone-100 font-medium"
      : "text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition-colors";
  };

  return (
    <nav className="glass-nav sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <img
                src="/logo.png"
                alt="Batman Logo"
                className="h-8 w-auto object-contain shrink-0"
              />
              <span className="font-serif text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 relative">
                Ink
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-stone-900 dark:bg-stone-100 group-hover:w-full transition-all duration-300"></span>
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 self-end mb-1.5"></span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/feed" className={`flex items-center gap-1.5 text-sm ${activeLink("/feed")}`}>
              <BookOpen size={16} />
              <span>Feed</span>
            </Link>

            <Link to="/discover" className={`flex items-center gap-1.5 text-sm ${activeLink("/discover")}`}>
              <User size={16} />
              <span>Discover</span>
            </Link>

            {user && (
              <>
                <Link to="/dashboard" className={`flex items-center gap-1.5 text-sm ${activeLink("/dashboard")}`}>
                  <LayoutDashboard size={16} />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/write"
                  className="flex items-center gap-1.5 text-sm bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 px-3.5 py-1.5 rounded-md hover:bg-stone-800 dark:hover:bg-stone-200 transition-all font-medium"
                >
                  <PenSquare size={15} />
                  <span>Write</span>
                </Link>
              </>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-4">


            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center space-x-3">
                <Link
                  to={`/${user.profile?.username}`}
                  className="flex items-center gap-2 hover:opacity-85 transition-opacity"
                >
                  {user.profile?.avatarUrl ? (
                    <img
                      src={user.profile.avatarUrl}
                      alt={user.profile.displayName}
                      className="w-8 h-8 rounded-full border border-stone-200 dark:border-stone-800 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center text-sm font-medium text-stone-600 dark:text-stone-300 uppercase">
                      {user.profile?.displayName?.charAt(0) || "U"}
                    </div>
                  )}
                  <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
                    {user.profile?.displayName || "Profile"}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-stone-500 hover:text-red-600 dark:text-stone-400 dark:hover:text-red-400 transition-colors"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-sm text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 font-medium px-3 py-1.5"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm bg-stone-900 text-white dark:bg-white dark:text-stone-950 px-4 py-2 rounded-md hover:opacity-90 transition-opacity font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu button */}
          <div className="flex items-center space-x-2 md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800 transition-colors"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-b border-stone-200 dark:border-stone-850 bg-[#faf9f6] dark:bg-[#0c0a09] px-4 pt-2 pb-4 space-y-1">
          <Link
            to="/feed"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            Feed
          </Link>
          <Link
            to="/discover"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            Discover
          </Link>
          {user ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                Dashboard
              </Link>
              <Link
                to="/write"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                Write Post
              </Link>
              <div className="border-t border-stone-200 dark:border-stone-800 my-2 pt-2">
                <Link
                  to={`/${user.profile?.username}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  <User size={16} />
                  <span>{user.profile?.displayName || "Profile"}</span>
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 dark:text-red-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2 border-t border-stone-200 dark:border-stone-800 pt-3 mt-2">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="text-center py-2 px-4 border border-stone-300 dark:border-stone-700 rounded-md text-sm font-medium text-stone-700 dark:text-stone-350 hover:bg-stone-50 dark:hover:bg-stone-900"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="text-center py-2 px-4 bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 rounded-md text-sm font-medium hover:opacity-95"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
