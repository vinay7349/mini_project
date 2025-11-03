import React, { useState, useEffect } from 'react'
import { getEmergencyContacts } from '../services/api'

const EmergencyPanel = () => {
  const [contacts, setContacts] = useState(null)
  const [country, setCountry] = useState('india')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchContacts()
  }, [country])

  const fetchContacts = async () => {
    setLoading(true)
    try {
      const response = await getEmergencyContacts({ country })
      setContacts(response.data.contacts)
    } catch (error) {
      console.error('Error fetching emergency contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCall = (number) => {
    window.location.href = `tel:${number}`
  }

  const emergencyTypes = [
    { key: 'police', label: 'Police', icon: '👮', color: 'bg-blue-500' },
    { key: 'fire', label: 'Fire Department', icon: '🔥', color: 'bg-red-500' },
    { key: 'ambulance', label: 'Ambulance', icon: '🚑', color: 'bg-red-600' },
    { key: 'women_helpline', label: 'Women Helpline', icon: '👩', color: 'bg-pink-500' },
    { key: 'disaster_management', label: 'Disaster Management', icon: '⚠️', color: 'bg-orange-500' },
  ]

  return (
    <div className="space-y-6">
      <div className="bg-red-600 text-white p-6 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-2">🚨 Emergency Helpline</h1>
        <p className="text-red-100">Quick access to emergency services</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Country/Region
        </label>
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="india">India</option>
          <option value="usa">United States</option>
          <option value="uk">United Kingdom</option>
          <option value="default">Other</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading emergency contacts...</div>
      ) : contacts ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {emergencyTypes.map((type) => {
            const number = contacts[type.key]
            if (!number) return null

            return (
              <div
                key={type.key}
                className={`${type.color} text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105`}
              >
                <div className="text-4xl mb-3">{type.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{type.label}</h3>
                <p className="text-2xl font-bold mb-4">{number}</p>
                <button
                  onClick={() => handleCall(number)}
                  className="w-full bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 font-semibold transition-colors"
                >
                  📞 Call Now
                </button>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No emergency contacts available for this region.
        </div>
      )}

      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
        <h3 className="font-semibold mb-2">⚠️ Important Reminders</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• In life-threatening emergencies, call the appropriate number immediately</li>
          <li>• Stay calm and provide clear information about your location</li>
          <li>• Keep this page bookmarked for quick access</li>
          <li>• Share your location with emergency services if possible</li>
        </ul>
      </div>
    </div>
  )
}

export default EmergencyPanel

