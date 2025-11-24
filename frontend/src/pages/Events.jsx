import React, { useState, useEffect } from 'react'
import { getEvents, suggestEvents } from '../services/api'
import EventCard from '../components/EventCard'
import EventForm from '../components/EventForm'
import MapView from '../components/MapView'
import { useAuth } from '../context/AuthContext'

const Events = () => {
  const { isAuthenticated } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [userLocation, setUserLocation] = useState(null)
  const [searchTag, setSearchTag] = useState('')
  const [aiSuggestion, setAiSuggestion] = useState('')

  useEffect(() => {
    fetchEvents()
  }, [])

  const getCurrentLocation = () => {
    if (!isAuthenticated) return
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        })
      })
    }
  }

  const fetchEvents = async (params = {}) => {
    setLoading(true)
    try {
      const queryParams = { ...params }
      if (isAuthenticated && userLocation) {
        queryParams.lat = userLocation.lat
        queryParams.lon = userLocation.lon
      }
      if (searchTag) queryParams.tag = searchTag

      const response = await getEvents(queryParams)
      setEvents(response.data || [])
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      getCurrentLocation()
    } else {
      setUserLocation(null)
    }
  }, [isAuthenticated])

  useEffect(() => {
    fetchEvents()
  }, [searchTag, userLocation, isAuthenticated])

  const handleAISuggestion = async () => {
    if (!aiSuggestion.trim()) return

    try {
      const response = await suggestEvents({
        interest: aiSuggestion,
        location: userLocation ? 'current location' : 'unknown'
      })
      
      // Update events with AI suggestions
      if (response.data.events && response.data.events.length > 0) {
        setEvents(response.data.events)
      }
      
      alert(response.data.suggestion)
    } catch (error) {
      console.error('Error getting AI suggestion:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">📅 Public Events & Community</h1>
        <button
          onClick={() => (isAuthenticated ? setShowForm(!showForm) : alert('Please login to create events.'))}
          className={`bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg transition-all ${
            isAuthenticated ? 'hover:shadow-lg' : 'opacity-60 cursor-not-allowed'
          }`}
          disabled={!isAuthenticated}
        >
          + Create Event
        </button>
      </div>

      {!isAuthenticated && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg">
          <p className="font-semibold">Login required</p>
          <p className="text-sm">
            Create an account or login to publish events and see what’s happening nearest to you.
          </p>
        </div>
      )}

      {showForm && (
        <EventForm
          onEventCreated={() => {
            setShowForm(false)
            fetchEvents()
          }}
          onClose={() => setShowForm(false)}
        />
      )}

      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search by Tag
            </label>
            <input
              type="text"
              value={searchTag}
              onChange={(e) => setSearchTag(e.target.value)}
              placeholder="e.g., adventure, music, beach"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              AI Event Assistant
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={aiSuggestion}
                onChange={(e) => setAiSuggestion(e.target.value)}
                placeholder="Show me adventure events near me"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleAISuggestion}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                🤖 Ask AI
              </button>
            </div>
          </div>
        </div>
      </div>

      <MapView events={events} userLocation={userLocation} />

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No events found. Be the first to create one!
          </div>
        ) : (
          events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onUpdate={() => {
                // Refetch event with comments
                fetchEvents()
              }}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default Events

