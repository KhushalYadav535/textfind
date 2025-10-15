import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Upload, 
  History, 
  BarChart3, 
  Zap, 
  Users, 
  TrendingUp,
  Clock,
  FileText,
  Activity,
  Star
} from 'lucide-react'
import { useUserStore } from '../../store/userStore'
import { useAnalyticsStore } from '../../store/analyticsStore'
import { base44 } from '../../api/base44Client'

export default function Dashboard() {
  const { usage, profile, preferences } = useUserStore()
  const { 
    totalVisitors, 
    todayVisitors, 
    weeklyVisitors, 
    monthlyVisitors,
    totalPageViews,
    todayPageViews,
    onlineUsers,
    topCountries,
    deviceStats,
    init: initAnalytics 
  } = useAnalyticsStore()
  const [recentActivity, setRecentActivity] = useState([])
  const [stats, setStats] = useState({
    totalDocuments: 0,
    averageAccuracy: 0,
    timeSaved: 0,
    languagesUsed: []
  })

  useEffect(() => {
    initAnalytics()
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const history = await base44.entities.UploadHistory.list()
      const recent = history.slice(0, 5)
      
      const totalDocuments = history.length
      const averageAccuracy = history.reduce((acc, item) => 
        acc + (item.confidence_data?.overall || 0), 0) / totalDocuments || 0
      
      setRecentActivity(recent)
      setStats({
        totalDocuments,
        averageAccuracy: Math.round(averageAccuracy),
        timeSaved: totalDocuments * 2, // Assuming 2 minutes saved per document
        languagesUsed: ['English', 'Hindi', 'Spanish']
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    }
  }

  const StatCard = ({ icon, title, value, subtitle, color, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative p-6 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/10 backdrop-blur-sm hover:border-white/20 transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
          {icon}
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-green-400 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>+{trend}%</span>
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
      <p className="text-slate-400 text-sm">{title}</p>
      {subtitle && <p className="text-slate-500 text-xs mt-1">{subtitle}</p>}
    </motion.div>
  )

  const QuickAction = ({ icon, title, description, onClick, color }) => (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group w-full p-6 rounded-2xl bg-gradient-to-br from-slate-800/30 to-slate-900/30 border border-white/10 backdrop-blur-sm hover:border-white/20 transition-all duration-300 text-left"
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
          <p className="text-slate-400 text-sm">{description}</p>
        </div>
      </div>
    </motion.button>
  )

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-cyan-400 bg-clip-text text-transparent mb-2">
            Welcome back, {profile?.name || 'User'}! 👋
          </h1>
          <p className="text-slate-400 text-lg">
            Here's what's happening with your documents today
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Users className="w-6 h-6 text-white" />}
            title="Total Visitors"
            value={totalVisitors.toLocaleString()}
            subtitle="All time"
            color="from-cyan-500 to-cyan-600"
            trend="15"
          />
          <StatCard
            icon={<Activity className="w-6 h-6 text-white" />}
            title="Today's Visitors"
            value={todayVisitors.toLocaleString()}
            subtitle="Active today"
            color="from-amber-500 to-amber-600"
            trend="8"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6 text-white" />}
            title="Weekly Visitors"
            value={weeklyVisitors.toLocaleString()}
            subtitle="This week"
            color="from-green-500 to-green-600"
            trend="12"
          />
          <StatCard
            icon={<FileText className="w-6 h-6 text-white" />}
            title="Page Views"
            value={totalPageViews.toLocaleString()}
            subtitle="All time"
            color="from-purple-500 to-purple-600"
            trend="18"
          />
        </div>

        {/* Analytics Overview */}
        <div className="mb-8">
          <div className="p-8 rounded-3xl bg-slate-800/30 border border-white/10 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-cyan-400" />
              Website Analytics
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-400 mb-2">
                  {onlineUsers}
                </div>
                <div className="text-slate-400">Online Now</div>
                <div className="w-2 h-2 bg-green-400 rounded-full mx-auto mt-2 animate-pulse"></div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-400 mb-2">
                  {monthlyVisitors.toLocaleString()}
                </div>
                <div className="text-slate-400">This Month</div>
                <div className="text-green-400 text-sm mt-1">↗ +12%</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">
                  {todayPageViews.toLocaleString()}
                </div>
                <div className="text-slate-400">Today's Views</div>
                <div className="text-green-400 text-sm mt-1">↗ +8%</div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Top Countries</h3>
                <div className="space-y-3">
                  {topCountries.slice(0, 5).map((country, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{country.flag}</span>
                        <span className="text-slate-300">{country.country}</span>
                      </div>
                      <span className="text-white font-medium">{country.visitors.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Device Types</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Desktop</span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-slate-700 rounded-full h-2">
                        <div className="bg-cyan-400 h-2 rounded-full" style={{width: `${deviceStats.desktop}%`}}></div>
                      </div>
                      <span className="text-white font-medium w-12">{deviceStats.desktop}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Mobile</span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-slate-700 rounded-full h-2">
                        <div className="bg-amber-400 h-2 rounded-full" style={{width: `${deviceStats.mobile}%`}}></div>
                      </div>
                      <span className="text-white font-medium w-12">{deviceStats.mobile}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Tablet</span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-slate-700 rounded-full h-2">
                        <div className="bg-purple-400 h-2 rounded-full" style={{width: `${deviceStats.tablet}%`}}></div>
                      </div>
                      <span className="text-white font-medium w-12">{deviceStats.tablet}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <QuickAction
                icon={<Upload className="w-6 h-6 text-white" />}
                title="Upload Document"
                description="Extract text from images instantly"
                color="from-cyan-500 to-cyan-600"
                onClick={() => window.location.href = '/upload'}
              />
              <QuickAction
                icon={<History className="w-6 h-6 text-white" />}
                title="View History"
                description="Browse your processed documents"
                color="from-amber-500 to-amber-600"
                onClick={() => window.location.href = '/history'}
              />
              <QuickAction
                icon={<BarChart3 className="w-6 h-6 text-white" />}
                title="Analytics"
                description="Detailed usage and performance insights"
                color="from-green-500 to-green-600"
                onClick={() => {}}
              />
              <QuickAction
                icon={<Users className="w-6 h-6 text-white" />}
                title="Team Sharing"
                description="Collaborate with your team members"
                color="from-purple-500 to-purple-600"
                onClick={() => {}}
              />
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-xl bg-slate-800/30 border border-white/10 backdrop-blur-sm hover:border-white/20 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-amber-500/20">
                        <FileText className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">
                          {item.original_filename}
                        </p>
                        <p className="text-slate-400 text-sm">
                          {new Date(item.created_date).toLocaleDateString()}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                            {item.confidence_data?.overall || 0}% accuracy
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No recent activity</p>
                  <p className="text-sm">Upload your first document to get started</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
