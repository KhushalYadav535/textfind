import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  FileText, 
  BarChart3, 
  Settings, 
  Shield, 
  Eye, 
  Edit3, 
  Trash2,
  Search,
  Filter,
  Download,
  Plus,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Activity,
  Globe,
  Server,
  Database
} from 'lucide-react'

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', plan: 'Pro', status: 'active', signupDate: '2024-01-15', uploads: 245, lastActive: '2 hours ago' },
    { id: 2, name: 'Sarah Wilson', email: 'sarah@example.com', plan: 'Free', status: 'active', signupDate: '2024-01-20', uploads: 89, lastActive: '1 day ago' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', plan: 'Enterprise', status: 'inactive', signupDate: '2024-01-10', uploads: 1024, lastActive: '1 week ago' },
    { id: 4, name: 'Emma Davis', email: 'emma@example.com', plan: 'Pro', status: 'active', signupDate: '2024-01-25', uploads: 156, lastActive: '30 minutes ago' }
  ])
  const [documents, setDocuments] = useState([
    { id: 1, user: 'John Doe', filename: 'invoice.pdf', size: '2.3 MB', status: 'processed', uploadDate: '2024-01-15', accuracy: 95.5 },
    { id: 2, user: 'Sarah Wilson', filename: 'receipt.jpg', size: '1.8 MB', status: 'processing', uploadDate: '2024-01-20', accuracy: null },
    { id: 3, user: 'Mike Johnson', filename: 'contract.docx', size: '5.2 MB', status: 'processed', uploadDate: '2024-01-10', accuracy: 98.2 },
    { id: 4, user: 'Emma Davis', filename: 'report.pdf', size: '3.1 MB', status: 'error', uploadDate: '2024-01-25', accuracy: null }
  ])

  const stats = {
    totalUsers: 1247,
    activeUsers: 892,
    totalDocuments: 15432,
    processedToday: 342,
    revenue: 12450,
    systemHealth: 99.8
  }

  const TabButton = ({ id, label, icon, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        isActive
          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
          : 'text-slate-400 hover:text-white hover:bg-white/5'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  )

  const StatCard = ({ icon, title, value, subtitle, color, trend }) => (
    <div className={`p-6 rounded-2xl bg-gradient-to-br ${color} border border-white/10 backdrop-blur-sm`}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-xl bg-white/10">
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
      <p className="text-white/80 text-sm">{title}</p>
      {subtitle && <p className="text-white/60 text-xs mt-1">{subtitle}</p>}
    </div>
  )

  const UserRow = ({ user }) => (
    <tr className="border-b border-white/10">
      <td className="py-4 px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-amber-500 flex items-center justify-center">
            <span className="text-white font-medium">
              {user.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <div className="text-white font-medium">{user.name}</div>
            <div className="text-slate-400 text-sm">{user.email}</div>
          </div>
        </div>
      </td>
      <td className="py-4 px-6">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          user.plan === 'Enterprise' 
            ? 'bg-amber-500/20 text-amber-400' 
            : user.plan === 'Pro' 
            ? 'bg-cyan-500/20 text-cyan-400'
            : 'bg-slate-500/20 text-slate-400'
        }`}>
          {user.plan}
        </span>
      </td>
      <td className="py-4 px-6">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          user.status === 'active' 
            ? 'bg-green-500/20 text-green-400' 
            : 'bg-red-500/20 text-red-400'
        }`}>
          {user.status}
        </span>
      </td>
      <td className="py-4 px-6 text-white">{user.uploads}</td>
      <td className="py-4 px-6 text-slate-400 text-sm">{user.lastActive}</td>
      <td className="py-4 px-6">
        <div className="flex gap-2">
          <button className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <Eye className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <Edit3 className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  )

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-80 bg-slate-900/50 backdrop-blur-sm border-r border-white/10 p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-amber-400 bg-clip-text text-transparent">
              Admin Panel
            </h1>
            <p className="text-slate-400 text-sm mt-1">TextVision Management</p>
          </div>

          <div className="space-y-2">
            <TabButton
              id="dashboard"
              label="Dashboard"
              icon={<BarChart3 className="w-5 h-5" />}
              isActive={activeTab === 'dashboard'}
              onClick={() => setActiveTab('dashboard')}
            />
            <TabButton
              id="users"
              label="User Management"
              icon={<Users className="w-5 h-5" />}
              isActive={activeTab === 'users'}
              onClick={() => setActiveTab('users')}
            />
            <TabButton
              id="documents"
              label="Documents"
              icon={<FileText className="w-5 h-5" />}
              isActive={activeTab === 'documents'}
              onClick={() => setActiveTab('documents')}
            />
            <TabButton
              id="analytics"
              label="Analytics"
              icon={<Activity className="w-5 h-5" />}
              isActive={activeTab === 'analytics'}
              onClick={() => setActiveTab('analytics')}
            />
            <TabButton
              id="system"
              label="System Health"
              icon={<Server className="w-5 h-5" />}
              isActive={activeTab === 'system'}
              onClick={() => setActiveTab('system')}
            />
            <TabButton
              id="settings"
              label="Settings"
              icon={<Settings className="w-5 h-5" />}
              isActive={activeTab === 'settings'}
              onClick={() => setActiveTab('settings')}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {activeTab === 'dashboard' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h2>
                <p className="text-slate-400">Monitor your TextVision platform performance</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  icon={<Users className="w-6 h-6 text-white" />}
                  title="Total Users"
                  value={stats.totalUsers.toLocaleString()}
                  subtitle={`${stats.activeUsers} active`}
                  color="from-cyan-500/20 to-cyan-600/20"
                  trend="12"
                />
                <StatCard
                  icon={<FileText className="w-6 h-6 text-white" />}
                  title="Documents Processed"
                  value={stats.totalDocuments.toLocaleString()}
                  subtitle={`${stats.processedToday} today`}
                  color="from-amber-500/20 to-amber-600/20"
                  trend="8"
                />
                <StatCard
                  icon={<DollarSign className="w-6 h-6 text-white" />}
                  title="Monthly Revenue"
                  value={`$${stats.revenue.toLocaleString()}`}
                  subtitle="This month"
                  color="from-green-500/20 to-green-600/20"
                  trend="15"
                />
                <StatCard
                  icon={<Activity className="w-6 h-6 text-white" />}
                  title="System Health"
                  value={`${stats.systemHealth}%`}
                  subtitle="Uptime"
                  color="from-purple-500/20 to-purple-600/20"
                  trend="2"
                />
              </div>

              {/* Recent Activity */}
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="p-6 rounded-2xl bg-slate-800/30 border border-white/10 backdrop-blur-sm">
                  <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-500/20">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      </div>
                      <div>
                        <p className="text-white text-sm">New user registered</p>
                        <p className="text-slate-400 text-xs">2 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-cyan-500/20">
                        <FileText className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-white text-sm">Document processed</p>
                        <p className="text-slate-400 text-xs">5 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-500/20">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-white text-sm">System warning</p>
                        <p className="text-slate-400 text-xs">1 hour ago</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-slate-800/30 border border-white/10 backdrop-blur-sm">
                  <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-700/50 hover:bg-slate-700 border border-white/10 transition-colors">
                      <Plus className="w-5 h-5 text-cyan-400" />
                      <span className="text-white">Add New User</span>
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-700/50 hover:bg-slate-700 border border-white/10 transition-colors">
                      <Download className="w-5 h-5 text-cyan-400" />
                      <span className="text-white">Export Data</span>
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-700/50 hover:bg-slate-700 border border-white/10 transition-colors">
                      <Settings className="w-5 h-5 text-cyan-400" />
                      <span className="text-white">System Settings</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">User Management</h2>
                  <p className="text-slate-400">Manage user accounts and permissions</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-amber-500 rounded-xl text-white font-semibold hover:scale-105 transition-transform">
                  <Plus className="w-4 h-4" />
                  Add User
                </button>
              </div>

              {/* Filters */}
              <div className="flex gap-4 p-4 bg-slate-800/30 rounded-xl border border-white/10">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
                <select className="px-4 py-2 bg-slate-700 border border-white/10 rounded-lg text-white">
                  <option>All Plans</option>
                  <option>Free</option>
                  <option>Pro</option>
                  <option>Enterprise</option>
                </select>
                <select className="px-4 py-2 bg-slate-700 border border-white/10 rounded-lg text-white">
                  <option>All Status</option>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>

              {/* Users Table */}
              <div className="bg-slate-800/30 rounded-2xl border border-white/10 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th className="text-left py-4 px-6 text-white font-semibold">User</th>
                      <th className="text-left py-4 px-6 text-white font-semibold">Plan</th>
                      <th className="text-left py-4 px-6 text-white font-semibold">Status</th>
                      <th className="text-left py-4 px-6 text-white font-semibold">Uploads</th>
                      <th className="text-left py-4 px-6 text-white font-semibold">Last Active</th>
                      <th className="text-left py-4 px-6 text-white font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <UserRow key={user.id} user={user} />
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'documents' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Document Management</h2>
                <p className="text-slate-400">Monitor and manage processed documents</p>
              </div>

              <div className="bg-slate-800/30 rounded-2xl border border-white/10 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th className="text-left py-4 px-6 text-white font-semibold">Document</th>
                      <th className="text-left py-4 px-6 text-white font-semibold">User</th>
                      <th className="text-left py-4 px-6 text-white font-semibold">Size</th>
                      <th className="text-left py-4 px-6 text-white font-semibold">Status</th>
                      <th className="text-left py-4 px-6 text-white font-semibold">Accuracy</th>
                      <th className="text-left py-4 px-6 text-white font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map(doc => (
                      <tr key={doc.id} className="border-b border-white/10">
                        <td className="py-4 px-6 text-white font-medium">{doc.filename}</td>
                        <td className="py-4 px-6 text-slate-400">{doc.user}</td>
                        <td className="py-4 px-6 text-slate-400">{doc.size}</td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            doc.status === 'processed' 
                              ? 'bg-green-500/20 text-green-400' 
                              : doc.status === 'processing'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {doc.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-slate-400">
                          {doc.accuracy ? `${doc.accuracy}%` : '-'}
                        </td>
                        <td className="py-4 px-6 text-slate-400">{doc.uploadDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'system' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">System Health</h2>
                <p className="text-slate-400">Monitor system performance and resources</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-slate-800/30 border border-white/10">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Server className="w-5 h-5 text-cyan-400" />
                    Server Status
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">API Server</span>
                      <span className="text-green-400">Online</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Database</span>
                      <span className="text-green-400">Online</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">OCR Engine</span>
                      <span className="text-green-400">Online</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">File Storage</span>
                      <span className="text-green-400">Online</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-slate-800/30 border border-white/10">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Database className="w-5 h-5 text-cyan-400" />
                    Resource Usage
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-slate-400">CPU Usage</span>
                        <span className="text-white">45%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div className="bg-cyan-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-slate-400">Memory Usage</span>
                        <span className="text-white">62%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div className="bg-amber-500 h-2 rounded-full" style={{ width: '62%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-slate-400">Storage</span>
                        <span className="text-white">78%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
