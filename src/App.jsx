import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import Layout from './Layout'
import Landing from './Pages/Landing'
import Upload from './Pages/Upload'
import Results from './Pages/Results'
import History from './Pages/History'
import Dashboard from './components/dashboard/Dashboard'
import ApiDocumentation from './components/api/ApiDocumentation'
import AdminPanel from './components/admin/AdminPanel'
import WebhookManager from './components/api/WebhookManager'
import ExportManager from './components/export/ExportManager'
import './App.css'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/results" element={<Results />} />
            <Route path="/history" element={<History />} />
            <Route path="/api-docs" element={<ApiDocumentation />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/webhooks" element={<WebhookManager />} />
            <Route path="/export" element={<ExportManager documentData={{}} />} />
          </Routes>
        </Layout>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
            },
          }}
        />
      </Router>
    </QueryClientProvider>
  )
}

export default App
