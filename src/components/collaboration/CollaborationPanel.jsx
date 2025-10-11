import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  UserPlus, 
  Share2, 
  MessageSquare, 
  Eye, 
  Edit3, 
  Lock,
  Globe,
  Copy,
  Check,
  Send
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function CollaborationPanel({ documentId, currentUser }) {
  const [collaborators, setCollaborators] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'owner', avatar: '👨‍💼', online: true },
    { id: 2, name: 'Sarah Wilson', email: 'sarah@example.com', role: 'editor', avatar: '👩‍💻', online: true },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'viewer', avatar: '👨‍🎨', online: false }
  ])
  const [activeTab, setActiveTab] = useState('members')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('viewer')
  const [messages, setMessages] = useState([
    { id: 1, user: 'John Doe', message: 'Great work on this document!', timestamp: '2 minutes ago', avatar: '👨‍💼' },
    { id: 2, user: 'Sarah Wilson', message: 'I\'ll review the extracted text and make corrections', timestamp: '5 minutes ago', avatar: '👩‍💻' }
  ])
  const [newMessage, setNewMessage] = useState('')
  const [shareLink, setShareLink] = useState(`https://textvision.ai/shared/${documentId}`)

  const handleInviteUser = () => {
    if (!inviteEmail) return

    const newCollaborator = {
      id: Date.now(),
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      avatar: '👤',
      online: false
    }

    setCollaborators(prev => [...prev, newCollaborator])
    setInviteEmail('')
    setShowInviteModal(false)
    toast.success(`Invitation sent to ${inviteEmail}`)
  }

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink)
    toast.success('Share link copied!')
  }

  const sendMessage = () => {
    if (!newMessage.trim()) return

    const message = {
      id: Date.now(),
      user: currentUser?.name || 'You',
      message: newMessage,
      timestamp: 'Just now',
      avatar: '👤'
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')
  }

  const removeCollaborator = (id) => {
    setCollaborators(prev => prev.filter(c => c.id !== id))
    toast.success('Collaborator removed')
  }

  const updateRole = (id, newRole) => {
    setCollaborators(prev => prev.map(c => 
      c.id === id ? { ...c, role: newRole } : c
    ))
    toast.success('Role updated')
  }

  const CollaboratorCard = ({ collaborator }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-white/10 hover:border-white/20 transition-all"
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-amber-500 flex items-center justify-center text-lg">
            {collaborator.avatar}
          </div>
          {collaborator.online && (
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900" />
          )}
        </div>
        <div>
          <h4 className="text-white font-medium">{collaborator.name}</h4>
          <p className="text-slate-400 text-sm">{collaborator.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <select
          value={collaborator.role}
          onChange={(e) => updateRole(collaborator.id, e.target.value)}
          className="px-3 py-1 rounded-lg bg-slate-700 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500"
        >
          <option value="owner">Owner</option>
          <option value="editor">Editor</option>
          <option value="viewer">Viewer</option>
        </select>
        {collaborator.id !== 1 && (
          <button
            onClick={() => removeCollaborator(collaborator.id)}
            className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
          >
            ×
          </button>
        )}
      </div>
    </motion.div>
  )

  return (
    <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-3xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-cyan-400" />
            Collaboration
          </h2>
          <button
            onClick={() => setShowInviteModal(true)}
            className="p-2 rounded-xl bg-gradient-to-r from-cyan-500 to-amber-500 text-white hover:scale-105 transition-transform"
          >
            <UserPlus className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('members')}
            className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'members'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Members
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'chat'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setActiveTab('share')}
            className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'share'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Share
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-h-96 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'members' && (
            <motion.div
              key="members"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {collaborators.map(collaborator => (
                <CollaboratorCard key={collaborator.id} collaborator={collaborator} />
              ))}
            </motion.div>
          )}

          {activeTab === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {messages.map(message => (
                  <div key={message.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-amber-500 flex items-center justify-center text-sm">
                      {message.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-medium text-sm">{message.user}</span>
                        <span className="text-slate-400 text-xs">{message.timestamp}</span>
                      </div>
                      <p className="text-slate-300 text-sm">{message.message}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button
                  onClick={sendMessage}
                  className="p-2 rounded-xl bg-gradient-to-r from-cyan-500 to-amber-500 text-white hover:scale-105 transition-transform"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'share' && (
            <motion.div
              key="share"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-white font-medium mb-2">Share Link</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shareLink}
                      readOnly
                      className="flex-1 px-3 py-2 bg-slate-800 border border-white/10 rounded-xl text-white text-sm"
                    />
                    <button
                      onClick={copyShareLink}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-white/10 rounded-xl text-white transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-white font-medium">Link Permissions</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3">
                      <input type="radio" name="permission" defaultChecked className="text-cyan-500" />
                      <span className="text-slate-300 text-sm">Anyone with link can view</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="radio" name="permission" className="text-cyan-500" />
                      <span className="text-slate-300 text-sm">Only invited members</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Globe className="w-4 h-4" />
                    <span>This document is publicly accessible</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowInviteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-slate-900 rounded-2xl p-6 border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">Invite Collaborator</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-white font-medium mb-2">Email Address</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="viewer">Viewer - Can view only</option>
                    <option value="editor">Editor - Can edit text</option>
                    <option value="owner">Owner - Full access</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 py-2 px-4 bg-slate-700 hover:bg-slate-600 rounded-xl text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInviteUser}
                  className="flex-1 py-2 px-4 bg-gradient-to-r from-cyan-500 to-amber-500 rounded-xl text-white font-semibold transition-all hover:scale-105"
                >
                  Send Invite
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
