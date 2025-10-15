import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "./utils";
import { Sparkles, Upload, User, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "./store/authStore";
import { useUserStore } from "./store/userStore";
import { useAnalyticsStore } from "./store/analyticsStore";
import toast from "react-hot-toast";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const { user, isAuthenticated, signOut, init: initAuth } = useAuthStore();
  const { usage, init: initUser } = useUserStore();
  const { incrementPageView, init: initAnalytics } = useAnalyticsStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    initAuth();
    initUser();
    initAnalytics();
    incrementPageView(); // Track page views
  }, [location.pathname]); // Track on route change

  const handleSignOut = async () => {
    const result = await signOut();
    if (result.success) {
      toast.success('Signed out successfully');
      setShowUserMenu(false);
    } else {
      toast.error('Failed to sign out');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-40 -right-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Glassmorphic navbar */}
      <nav className="relative z-50 border-b border-white/5 backdrop-blur-xl bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl("Landing")} className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-amber-500 rounded-xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-gradient-to-r from-cyan-500 to-amber-500 p-2 rounded-xl">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-amber-400 bg-clip-text text-transparent">
                TextVision
              </span>
            </Link>

            <div className="flex items-center gap-2">
              <Link to={createPageUrl("Upload")}>
                <button className={`px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 ${
                  location.pathname === createPageUrl("Upload")
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}>
                  <Upload className="w-4 h-4" />
                  <span className="hidden sm:inline">Upload</span>
                </button>
              </Link>

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-300"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-amber-500 flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="hidden sm:inline text-sm">{user?.email}</span>
                  </button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-0 top-full mt-2 w-64 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50"
                      >
                        <div className="p-4 border-b border-white/10">
                          <p className="text-white font-medium">{user?.email}</p>
                          <p className="text-slate-400 text-sm">Free Plan • {usage.monthlyUploads}/{usage.monthlyLimit} uploads</p>
                        </div>
                        <div className="p-2">
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-amber-500 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <main className="relative z-10">
        {children}
      </main>

      {/* Toast Container */}
      <div id="toast-container"></div>
    </div>
  );
}