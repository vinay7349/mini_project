import React, { useState, useEffect } from 'react'
import { getEvents } from '../services/api'
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
    // Require authentication to fetch events
    if (!isAuthenticated) {
      setEvents([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const queryParams = { ...params }
      if (userLocation) {
        queryParams.lat = userLocation.lat
        queryParams.lon = userLocation.lon
      }
      const response = await getEvents(queryParams)
      setEvents(response.data || [])
    } catch (error) {
      console.error('Error fetching events:', error)
      setEvents([])
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
  }, [userLocation, isAuthenticated])


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
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 text-yellow-900 p-6 rounded-lg shadow-lg">
          <div className="flex items-start gap-4">
            <div className="text-4xl">🔒</div>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-2">Login Required</h2>
              <p className="text-sm mb-4">
                You must be logged in to view events, see community messages, and participate in the community.
              </p>
              <button
                onClick={() => window.location.href = '/auth'}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Login / Register Now
              </button>
            </div>
          </div>
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

      {isAuthenticated && (
        <>
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
        </>
      )}
    </div>
  )
}

export default Events

