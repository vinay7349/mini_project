import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getBuzzFeed, getCultureCard } from '../services/api'
import CultureCard from '../components/CultureCard'

const Dashboard = () => {
  const [buzzFeed, setBuzzFeed] = useState([])
  const [location, setLocation] = useState('default')

  useEffect(() => {
    fetchBuzzFeed()
  }, [])

  const fetchBuzzFeed = async () => {
    try {
      const response = await getBuzzFeed({ location })
      setBuzzFeed(response.data.feed || [])
    } catch (error) {
      console.error('Error fetching buzz feed:', error)
    }
  }

  const quickActions = [
    { path: '/stays', icon: '🏨', label: 'Find Stays', color: 'bg-blue-500' },
    { path: '/places', icon: '🗺️', label: 'Explore Places', color: 'bg-green-500' },
    { path: '/events', icon: '📅', label: 'Join Events', color: 'bg-purple-500' },
    { path: '/emergency', icon: '🚨', label: 'Emergency', color: 'bg-red-500' },
  ]

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 rounded-xl shadow-lg">
        <h1 className="text-4xl font-bold mb-2">Welcome to SmartStay Navigator</h1>
        <p className="text-indigo-100">Your AI-powered travel companion for amazing adventures!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Link
            key={action.path}
            to={action.path}
            className={`${action.color} text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105`}
          >
            <div className="text-4xl mb-2">{action.icon}</div>
            <div className="font-semibold text-lg">{action.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            📰 Local Buzz Feed
          </h2>
          <div className="space-y-4">
            {buzzFeed.map((item, idx) => (
              <div key={idx} className="border-l-4 border-indigo-500 pl-4 py-2">
                <h3 className="font-semibold text-gray-800">{item.title}</h3>
                <p className="text-gray-600 text-sm mt-1">{item.content}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            🎭 Local Culture
          </h2>
          <CultureCard />
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4">🚀 Quick Tips</h2>
        <ul className="space-y-2 text-gray-700">
          <li>• Use the map to find nearby hostels and attractions</li>
          <li>• Join public events to connect with other travelers</li>
          <li>• Ask the AI assistant for personalized travel advice</li>
          <li>• Download maps for offline use</li>
          <li>• Use the translator to communicate with locals</li>
        </ul>
      </div>
    </div>
  )
}

export default Dashboard

