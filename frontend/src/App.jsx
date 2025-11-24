import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Places from './pages/Places'
import Stays from './pages/Stays'
import Events from './pages/Events'
import AIChat from './pages/AIChat'
import TranslatorPage from './pages/Translator'
import EmergencyPanel from './components/EmergencyPanel'
import CultureCard from './components/CultureCard'
import OfflineAlert from './components/OfflineAlert'
import AIChatBox from './components/AIChatBox'
import AuthPage from './pages/Auth'

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showAIChat, setShowAIChat] = useState(false)

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <Router>
      <div className="flex h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">
          {!isOnline && <OfflineAlert />}
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/places" element={<Places />} />
            <Route path="/stays" element={<Stays />} />
            <Route path="/events" element={<Events />} />
            <Route path="/translator" element={<TranslatorPage />} />
            <Route path="/emergency" element={<EmergencyPanel />} />
            <Route path="/culture" element={<CultureCard />} />
            <Route path="/ai-chat" element={<AIChat />} />
            <Route path="/auth" element={<AuthPage />} />
          </Routes>
        </main>
        
        {/* Floating AI Help Button */}
        <button
          onClick={() => setShowAIChat(!showAIChat)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all z-50"
          aria-label="AI Assistant"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>

        {/* AI Chat Box Modal */}
        {showAIChat && (
          <div className="fixed bottom-24 right-6 w-96 h-96 bg-white rounded-lg shadow-2xl z-50 border border-gray-200">
            <AIChatBox onClose={() => setShowAIChat(false)} />
          </div>
        )}
      </div>
    </Router>
  )
}

export default App

