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
import { base44 } from '../../api/base44Client'

export default function Dashboard() {
  const { usage, profile, preferences } = useUserStore()
  const [recentActivity, setRecentActivity] = useState([])
  const [stats, setStats] = useState({
    totalDocuments: 0,
    averageAccuracy: 0,
    timeSaved: 0,
    languagesUsed: []
  })

  useEffect(() => {
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
            icon={<FileText className="w-6 h-6 text-white" />}
            title="Documents Processed"
            value={stats.totalDocuments}
            subtitle="All time"
            color="from-cyan-500 to-cyan-600"
            trend="12"
          />
          <StatCard
            icon={<Star className="w-6 h-6 text-white" />}
            title="Average Accuracy"
            value={`${stats.averageAccuracy}%`}
            subtitle="Last 30 days"
            color="from-amber-500 to-amber-600"
            trend="5"
          />
          <StatCard
            icon={<Clock className="w-6 h-6 text-white" />}
            title="Time Saved"
            value={`${stats.timeSaved}m`}
            subtitle="Estimated"
            color="from-green-500 to-green-600"
            trend="8"
          />
          <StatCard
            icon={<Activity className="w-6 h-6 text-white" />}
            title="Monthly Usage"
            value={`${usage.monthlyUploads}/${usage.monthlyLimit}`}
            subtitle="Uploads this month"
            color="from-purple-500 to-purple-600"
          />
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
