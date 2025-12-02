import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const Sidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      checkAdminStatus()
    }
  }, [isAuthenticated])

  const checkAdminStatus = async () => {
    try {
      const response = await api.get('/api/admin/check')
      setIsAdmin(response.data.is_admin || false)
    } catch (error) {
      setIsAdmin(false)
    }
  }

  const navItems = [
    { path: '/', icon: '🏠', label: 'Home' },
    { path: '/places', icon: '🗺️', label: 'Map' },
    { path: '/stays', icon: '🏨', label: 'Stay' },
    { path: '/events', icon: '📅', label: 'Events' },
    { path: '/translator', icon: '🗣️', label: 'Translator' },
    { path: '/emergency', icon: '🚨', label: 'Emergency' },
    { path: '/ai-chat', icon: '🤖', label: 'AI Chat' },
    { path: '/culture', icon: '🎭', label: 'Culture' },
  ]

  // Add admin link if user is admin
  if (isAdmin) {
    navItems.push({ path: '/admin', icon: '🛡️', label: 'Admin' })
  } else if (isAuthenticated) {
    // Show admin login link for authenticated users who aren't admins
    navItems.push({ path: '/admin/login', icon: '🛡️', label: 'Admin Login' })
  }

  return (
    <aside className="w-64 bg-gradient-to-b from-indigo-900 to-purple-900 text-white p-4 shadow-lg">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">🧭 SmartStay</h1>
        <p className="text-sm text-indigo-200">team mind_master</p>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
              location.pathname === item.path
                ? 'bg-white text-indigo-900 font-semibold'
                : 'hover:bg-indigo-800 text-white'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-8 space-y-4 pt-8 border-t border-indigo-700">
        <div className="bg-white/10 rounded-xl p-4">
          {isAuthenticated ? (
            <>
              <p className="text-sm text-indigo-200">Logged in as</p>
              <p className="text-lg font-semibold">{user?.name}</p>
              <button
                onClick={logout}
                className="mt-3 w-full bg-white text-indigo-900 font-semibold py-2 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-indigo-100">
                Sign in to create events and unlock culture insights.
              </p>
              <button
                onClick={() => navigate('/auth')}
                className="mt-3 w-full bg-white text-indigo-900 font-semibold py-2 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                Login / Register
              </button>
            </>
          )}
        </div>
        <p className="text-xs text-indigo-300 text-center">
          team mind_master © 2025
        </p>
      </div>
    </aside>
  )
}

export default Sidebar

