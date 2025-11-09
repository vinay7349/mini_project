import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const Sidebar = () => {
  const location = useLocation()

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

      <div className="mt-8 pt-8 border-t border-indigo-700">
        <p className="text-xs text-indigo-300 text-center">
          team mind_master © 2025
        </p>
      </div>
    </aside>
  )
}

export default Sidebar

