import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Webhook, 
  Plus, 
  Settings, 
  Trash2, 
  Copy, 
  Check, 
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  Lock,
  Eye,
  Edit3,
  TestTube,
  Send
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function WebhookManager() {
  const [webhooks, setWebhooks] = useState([
    {
      id: 1,
      name: 'Document Processed',
      url: 'https://myapp.com/webhooks/document-processed',
      events: ['document.completed', 'document.failed'],
      status: 'active',
      secret: 'whsec_1234567890abcdef',
      lastTriggered: '2 hours ago',
      successRate: 98.5
    },
    {
      id: 2,
      name: 'User Signup',
      url: 'https://myapp.com/webhooks/user-signup',
      events: ['user.created'],
      status: 'active',
      secret: 'whsec_fedcba0987654321',
      lastTriggered: '1 day ago',
      successRate: 100
    },
    {
      id: 3,
      name: 'Payment Success',
      url: 'https://myapp.com/webhooks/payment-success',
      events: ['payment.succeeded'],
      status: 'inactive',
      secret: 'whsec_abcdef1234567890',
      lastTriggered: '1 week ago',
      successRate: 95.2
    }
  ])

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingWebhook, setEditingWebhook] = useState(null)
  const [newWebhook, setNewWebhook] = useState({
    name: '',
    url: '',
    events: [],
    status: 'active',
    secret: ''
  })

  const availableEvents = [
    { id: 'document.completed', name: 'Document Completed', description: 'Triggered when OCR processing is finished' },
    { id: 'document.failed', name: 'Document Failed', description: 'Triggered when OCR processing fails' },
    { id: 'user.created', name: 'User Created', description: 'Triggered when a new user signs up' },
    { id: 'user.updated', name: 'User Updated', description: 'Triggered when user profile is updated' },
    { id: 'payment.succeeded', name: 'Payment Succeeded', description: 'Triggered when payment is successful' },
    { id: 'payment.failed', name: 'Payment Failed', description: 'Triggered when payment fails' },
    { id: 'subscription.created', name: 'Subscription Created', description: 'Triggered when user subscribes to a plan' },
    { id: 'subscription.cancelled', name: 'Subscription Cancelled', description: 'Triggered when subscription is cancelled' }
  ]

  const generateSecret = () => {
    const secret = 'whsec_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    setNewWebhook(prev => ({ ...prev, secret }))
  }

  const createWebhook = () => {
    if (!newWebhook.name || !newWebhook.url || newWebhook.events.length === 0) {
      toast.error('Please fill in all required fields')
      return
    }

    const webhook = {
      ...newWebhook,
      id: Date.now(),
      lastTriggered: 'Never',
      successRate: 0
    }

    setWebhooks(prev => [...prev, webhook])
    setNewWebhook({ name: '', url: '', events: [], status: 'active', secret: '' })
    setShowCreateModal(false)
    toast.success('Webhook created successfully!')
  }

  const updateWebhook = (id, updates) => {
    setWebhooks(prev => prev.map(webhook => 
      webhook.id === id ? { ...webhook, ...updates } : webhook
    ))
    setEditingWebhook(null)
    toast.success('Webhook updated successfully!')
  }

  const deleteWebhook = (id) => {
    setWebhooks(prev => prev.filter(webhook => webhook.id !== id))
    toast.success('Webhook deleted successfully!')
  }

  const toggleWebhookStatus = (id) => {
    setWebhooks(prev => prev.map(webhook => 
      webhook.id === id ? { ...webhook, status: webhook.status === 'active' ? 'inactive' : 'active' } : webhook
    ))
  }

  const testWebhook = (webhook) => {
    toast.success(`Test webhook sent to ${webhook.url}`)
  }

  const copyWebhookUrl = (webhook) => {
    navigator.clipboard.writeText(webhook.url)
    toast.success('Webhook URL copied to clipboard!')
  }

  const WebhookCard = ({ webhook }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-slate-800/30 border border-white/10 backdrop-blur-sm hover:border-white/20 transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">{webhook.name}</h3>
          <p className="text-slate-400 text-sm break-all">{webhook.url}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            webhook.status === 'active' 
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-red-500/20 text-red-400'
          }`}>
            {webhook.status}
          </span>
          <button
            onClick={() => toggleWebhookStatus(webhook.id)}
            className={`p-2 rounded-lg transition-colors ${
              webhook.status === 'active' 
                ? 'hover:bg-red-500/20 text-green-400' 
                : 'hover:bg-green-500/20 text-red-400'
            }`}
          >
            {webhook.status === 'active' ? <Eye className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div>
          <h4 className="text-white font-medium mb-2">Events</h4>
          <div className="flex flex-wrap gap-2">
            {webhook.events.map(event => (
              <span key={event} className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded-lg text-xs">
                {event}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-400">Last Triggered:</span>
            <p className="text-white">{webhook.lastTriggered}</p>
          </div>
          <div>
            <span className="text-slate-400">Success Rate:</span>
            <p className="text-white">{webhook.successRate}%</p>
          </div>
        </div>

        <div>
          <span className="text-slate-400 text-sm">Secret:</span>
          <div className="flex items-center gap-2 mt-1">
            <code className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300 font-mono">
              {webhook.secret.substring(0, 20)}...
            </code>
            <button
              onClick={() => navigator.clipboard.writeText(webhook.secret)}
              className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <Copy className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => testWebhook(webhook)}
          className="flex items-center gap-2 px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-lg text-cyan-400 text-sm transition-colors"
        >
          <TestTube className="w-4 h-4" />
          Test
        </button>
        <button
          onClick={() => copyWebhookUrl(webhook)}
          className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 border border-white/10 rounded-lg text-white text-sm transition-colors"
        >
          <Copy className="w-4 h-4" />
          Copy URL
        </button>
        <button
          onClick={() => setEditingWebhook(webhook)}
          className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 border border-white/10 rounded-lg text-white text-sm transition-colors"
        >
          <Edit3 className="w-4 h-4" />
          Edit
        </button>
        <button
          onClick={() => deleteWebhook(webhook.id)}
          className="flex items-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 text-sm transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>
    </motion.div>
  )

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-cyan-400 bg-clip-text text-transparent mb-2">
            Webhook Manager
          </h1>
          <p className="text-xl text-slate-400">
            Configure webhooks to receive real-time notifications about events
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-amber-500 rounded-xl text-white font-semibold hover:scale-105 transition-transform"
        >
          <Plus className="w-5 h-5" />
          Create Webhook
        </button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="p-6 rounded-2xl bg-slate-800/30 border border-white/10 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <Webhook className="w-6 h-6 text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">Total Webhooks</h3>
          </div>
          <p className="text-3xl font-bold text-white">{webhooks.length}</p>
        </div>
        
        <div className="p-6 rounded-2xl bg-slate-800/30 border border-white/10 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Active</h3>
          </div>
          <p className="text-3xl font-bold text-white">
            {webhooks.filter(w => w.status === 'active').length}
          </p>
        </div>
        
        <div className="p-6 rounded-2xl bg-slate-800/30 border border-white/10 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <h3 className="text-lg font-semibold text-white">Inactive</h3>
          </div>
          <p className="text-3xl font-bold text-white">
            {webhooks.filter(w => w.status === 'inactive').length}
          </p>
        </div>
        
        <div className="p-6 rounded-2xl bg-slate-800/30 border border-white/10 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-6 h-6 text-amber-400" />
            <h3 className="text-lg font-semibold text-white">Avg Success Rate</h3>
          </div>
          <p className="text-3xl font-bold text-white">
            {Math.round(webhooks.reduce((acc, w) => acc + w.successRate, 0) / webhooks.length)}%
          </p>
        </div>
      </div>

      {/* Webhooks List */}
      <div className="space-y-6">
        {webhooks.map(webhook => (
          <WebhookCard key={webhook.id} webhook={webhook} />
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-2xl bg-slate-900 rounded-2xl p-6 border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-white mb-6">Create New Webhook</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">Webhook Name</label>
                <input
                  type="text"
                  value={newWebhook.name}
                  onChange={(e) => setNewWebhook(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="My Webhook"
                  className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Webhook URL</label>
                <input
                  type="url"
                  value={newWebhook.url}
                  onChange={(e) => setNewWebhook(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://your-app.com/webhook"
                  className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Events</label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {availableEvents.map(event => (
                    <label key={event.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 border border-white/10 hover:border-white/20 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newWebhook.events.includes(event.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewWebhook(prev => ({ ...prev, events: [...prev.events, event.id] }))
                          } else {
                            setNewWebhook(prev => ({ ...prev, events: prev.events.filter(ev => ev !== event.id) }))
                          }
                        }}
                        className="mt-1 text-cyan-500"
                      />
                      <div>
                        <div className="text-white font-medium text-sm">{event.name}</div>
                        <div className="text-slate-400 text-xs">{event.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Secret Key</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newWebhook.secret}
                    onChange={(e) => setNewWebhook(prev => ({ ...prev, secret: e.target.value }))}
                    placeholder="Webhook secret for security"
                    className="flex-1 px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    onClick={generateSecret}
                    className="px-4 py-3 bg-slate-700 hover:bg-slate-600 border border-white/10 rounded-xl text-white transition-colors"
                  >
                    Generate
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-3 px-4 bg-slate-700 hover:bg-slate-600 rounded-xl text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createWebhook}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-cyan-500 to-amber-500 rounded-xl text-white font-semibold hover:scale-105 transition-transform"
              >
                Create Webhook
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
