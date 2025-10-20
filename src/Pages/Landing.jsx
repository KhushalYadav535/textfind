import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { useAnalyticsStore } from "../store/analyticsStore";
import { ArrowRight, Zap, Shield, Globe, Sparkles, Users, TrendingUp, Award } from "lucide-react";

export default function Landing() {
  const { init: initAnalytics, totalVisitors, todayVisitors } = useAnalyticsStore();

  useEffect(() => {
    initAnalytics(); // Initialize analytics when landing page loads
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative px-6 py-32 md:py-40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-8">
            {/* Animated headline */}
            <div className="space-y-4">
              
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight animate-fade-in-up animation-delay-200">
                <span className="block bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent animate-gradient">
                  Image → Text
                </span>
                <span className="block mt-2 bg-gradient-to-r from-cyan-400 via-amber-400 to-cyan-400 bg-clip-text text-transparent animate-gradient-reverse">
                  Instant. Accurate.
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-400">
                Transform any image into editable text in seconds. 
                <span className="text-cyan-400"> No limits. No hassle.</span>
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animation-delay-600">
              <Link to={createPageUrl("Upload")}>
                <button className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-amber-500 rounded-2xl text-white font-semibold text-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/50">
                  <span className="relative z-10 flex items-center gap-2">
                    Start Converting
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </Link>
              
              <Link to={createPageUrl("Dashboard")}>
                <button className="px-8 py-4 bg-slate-700/50 hover:bg-slate-600/50 backdrop-blur-sm border border-slate-600/50 rounded-2xl text-white font-semibold text-lg transition-all duration-300 hover:scale-105">
                  Go to Dashboard
                </button>
              </Link>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-32 animate-fade-in-up animation-delay-800">
            <FeatureCard
              icon={<Zap className="w-8 h-8" />}
              title="Lightning Fast"
              description="Process images in seconds with our optimized OCR engine"
              gradient="from-cyan-500/20 to-cyan-600/20"
              iconBg="from-cyan-500 to-cyan-600"
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title="99% Accurate"
              description="Industry-leading accuracy with confidence scoring"
              gradient="from-amber-500/20 to-amber-600/20"
              iconBg="from-amber-500 to-amber-600"
            />
            <FeatureCard
              icon={<Globe className="w-8 h-8" />}
              title="Multi-Language"
              description="Support for 100+ languages and scripts"
              gradient="from-purple-500/20 to-purple-600/20"
              iconBg="from-purple-500 to-purple-600"
            />
            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="Team Ready"
              description="Collaborate with your team and share documents securely"
              gradient="from-green-500/20 to-green-600/20"
              iconBg="from-green-500 to-green-600"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-amber-400 bg-clip-text text-transparent">
                {totalVisitors.toLocaleString()}
              </div>
              <p className="text-slate-400">Total Visitors</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-amber-400 bg-clip-text text-transparent">
                {todayVisitors.toLocaleString()}
              </div>
              <p className="text-slate-400">Today's Visitors</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-amber-400 bg-clip-text text-transparent">
                99.5%
              </div>
              <p className="text-slate-400">Accuracy Rate</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-amber-400 bg-clip-text text-transparent">
                50K+
              </div>
              <p className="text-slate-400">Happy Users</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Documents?
          </h2>
          <p className="text-xl text-slate-400 mb-8">
            Join thousands of users who trust TextMitra for their OCR needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl("Upload")}>
              <button className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-amber-500 rounded-2xl text-white font-semibold text-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/50">
                <span className="relative z-10 flex items-center gap-2">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </Link>
            <Link to={createPageUrl("Dashboard")}>
              <button className="px-8 py-4 bg-slate-700/50 hover:bg-slate-600/50 backdrop-blur-sm border border-slate-600/50 rounded-2xl text-white font-semibold text-lg transition-all duration-300 hover:scale-105">
                View Dashboard
              </button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

function FeatureCard({ icon, title, description, gradient, iconBg }) {
  return (
    <div className={`group relative p-8 rounded-3xl bg-gradient-to-br ${gradient} backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl`}>
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative z-10 space-y-4">
        <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${iconBg} shadow-lg`}>
          {icon}
        </div>
        <h3 className="text-2xl font-bold text-white">{title}</h3>
        <p className="text-slate-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}