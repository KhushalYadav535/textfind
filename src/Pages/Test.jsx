import React, { useState } from 'react'
import PDFTestDemo from '../components/test/PDFTestDemo'
import HindiTextTest from '../components/test/HindiTextTest'

export default function Test() {
  const [activeTab, setActiveTab] = useState('general')

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          PDF Processing Test Center
        </h1>
        
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setActiveTab('general')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'general'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              General PDF Test
            </button>
            <button
              onClick={() => setActiveTab('hindi')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'hindi'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Hindi Text Test
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'general' && <PDFTestDemo />}
        {activeTab === 'hindi' && <HindiTextTest />}
      </div>
    </div>
  )
}
