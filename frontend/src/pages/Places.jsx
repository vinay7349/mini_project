import React, { useState, useEffect } from 'react'
import { getTouristSpots } from '../services/api'
import MapView from '../components/MapView'

const Places = () => {
  const [touristSpots, setTouristSpots] = useState([])
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState(null)
  const [category, setCategory] = useState('')
  const [sortBy, setSortBy] = useState('nearest') // nearest, rating, name
  const [showNearest, setShowNearest] = useState(true)
  const [showBest, setShowBest] = useState(true)

  useEffect(() => {
    getCurrentLocation()
    fetchTouristSpots()
  }, [])

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          })
        },
        (error) => {
          console.error('Error getting location:', error)
        }
      )
    }
  }

  const fetchTouristSpots = async (params = {}) => {
    setLoading(true)
    try {
      const queryParams = { ...params }
      if (userLocation) {
        queryParams.lat = userLocation.lat
        queryParams.lon = userLocation.lon
      }
      if (category) queryParams.category = category

      const response = await getTouristSpots(queryParams)
      setTouristSpots(response.data || [])
    } catch (error) {
      console.error('Error fetching tourist spots:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTouristSpots({ category })
  }, [category, userLocation])

  // Sort places based on selected sort option
  const sortedSpots = [...touristSpots].sort((a, b) => {
    if (sortBy === 'nearest') {
      return (a.distance || 999) - (b.distance || 999)
    } else if (sortBy === 'rating') {
      return (b.rating || 0) - (a.rating || 0)
    } else if (sortBy === 'name') {
      return a.name.localeCompare(b.name)
    }
    return 0
  })

  // Get nearest places (top 3)
  const nearestPlaces = sortedSpots
    .filter(spot => spot.distance !== undefined)
    .slice(0, 3)

  // Get best places (top 3 by rating)
  const bestPlaces = [...touristSpots]
    .filter(spot => spot.rating && spot.rating >= 4.0)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 3)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-gray-800">🗺️ Explore Places</h1>
        <div className="flex space-x-2 flex-wrap">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Categories</option>
            <option value="beach">Beach</option>
            <option value="temple">Temple</option>
            <option value="museum">Museum</option>
            <option value="park">Park</option>
            <option value="restaurant">Restaurant</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="nearest">📍 Nearest First</option>
            <option value="rating">⭐ Best Rated</option>
            <option value="name">🔤 Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Nearest Places Section */}
      {showNearest && nearestPlaces.length > 0 && userLocation && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-gray-800">📍 Nearest Places to You</h2>
            <button
              onClick={() => setShowNearest(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {nearestPlaces.map((spot, index) => (
              <div key={spot.id} className="bg-white p-3 rounded-lg shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</span>
                      <h3 className="font-semibold text-gray-800">{spot.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{spot.category}</p>
                    <p className="text-indigo-600 font-medium text-sm mt-1">
                      📍 {spot.distance?.toFixed(2)} km away
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Best Places Section */}
      {showBest && bestPlaces.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-gray-800">⭐ Best Rated Places</h2>
            <button
              onClick={() => setShowBest(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {bestPlaces.map((spot) => (
              <div key={spot.id} className="bg-white p-3 rounded-lg shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{spot.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{spot.category}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-yellow-500 text-lg">⭐</span>
                      <span className="font-medium text-gray-700">{spot.rating}</span>
                      {spot.distance && (
                        <span className="text-gray-500 text-sm">• {spot.distance.toFixed(2)} km</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <MapView touristSpots={touristSpots} userLocation={userLocation} />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">All Places</h2>
          <span className="text-gray-500 text-sm">
            {sortedSpots.length} {sortedSpots.length === 1 ? 'place' : 'places'} found
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full text-center py-8">Loading places...</div>
          ) : sortedSpots.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              No places found. Try adjusting your filters.
            </div>
          ) : (
            sortedSpots.map((spot) => {
              const isNearest = nearestPlaces.some(p => p.id === spot.id)
              const isBest = bestPlaces.some(p => p.id === spot.id)
              
              return (
                <div 
                  key={spot.id} 
                  className={`bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all ${
                    isNearest ? 'border-2 border-blue-400' : isBest ? 'border-2 border-yellow-400' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-xl font-semibold text-gray-800">{spot.name}</h3>
                        {isNearest && (
                          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-semibold">
                            📍 Nearest
                          </span>
                        )}
                        {isBest && (
                          <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full font-semibold">
                            ⭐ Best
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {spot.image_url && (
                    <img
                      src={spot.image_url || 'https://via.placeholder.com/400x200?text=Tourist+Spot'}
                      alt={spot.name}
                      className="w-full h-48 object-cover rounded-lg mb-3"
                    />
                  )}
                  <p className="text-gray-600 text-sm mb-2">{spot.description}</p>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-indigo-600 font-medium">{spot.category}</span>
                    {spot.distance && (
                      <span className="text-gray-500 text-sm font-medium">
                        📍 {spot.distance.toFixed(2)} km
                      </span>
                    )}
                  </div>
                  {spot.rating && (
                    <div className="flex items-center space-x-2">
                      <span className="text-yellow-500">⭐</span>
                      <span className="font-medium text-gray-700">{spot.rating}</span>
                      <span className="text-gray-400 text-sm">
                        {spot.rating >= 4.5 ? 'Excellent' : spot.rating >= 4.0 ? 'Very Good' : spot.rating >= 3.5 ? 'Good' : 'Fair'}
                      </span>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export default Places

