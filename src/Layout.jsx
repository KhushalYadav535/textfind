import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "./utils";
import { Sparkles, Upload, History, User, LogOut, Settings, CreditCard, Bell, Search, Code } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "./store/authStore";
import { useUserStore } from "./store/userStore";
import AuthModal from "./components/auth/AuthModal";
import toast from "react-hot-toast";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const { user, isAuthenticated, signOut, init: initAuth } = useAuthStore();
  const { usage, init: initUser } = useUserStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    initAuth();
    initUser();
  }, []);

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
              {/* Search Bar */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all text-sm w-64"
                />
              </div>

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
              <Link to={createPageUrl("History")}>
                <button className={`px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 ${
                  location.pathname === createPageUrl("History")
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}>
                  <History className="w-4 h-4" />
                  <span className="hidden sm:inline">History</span>
                </button>
              </Link>
              
              <Link to="/api-docs">
                <button className={`px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 ${
                  location.pathname === "/api-docs"
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}>
                  <Code className="w-4 h-4" />
                  <span className="hidden sm:inline">API</span>
                </button>
              </Link>

              {/* Notifications */}
              <button className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-300">
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

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
                          <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                            <User className="w-4 h-4" />
                            Profile Settings
                          </button>
                          <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                            <CreditCard className="w-4 h-4" />
                            Billing & Plans
                          </button>
                          <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                            <Settings className="w-4 h-4" />
                            Preferences
                          </button>
                          <hr className="my-2 border-white/10" />
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
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-amber-500 rounded-xl text-white font-semibold text-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <main className="relative z-10">
        {children}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* Toast Container */}
      <div id="toast-container"></div>
    </div>
  );
}