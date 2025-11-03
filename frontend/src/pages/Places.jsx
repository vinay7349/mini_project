import React, { useState, useEffect } from 'react'
import { getTouristSpots } from '../services/api'
import MapView from '../components/MapView'

const Places = () => {
  const [touristSpots, setTouristSpots] = useState([])
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState(null)
  const [category, setCategory] = useState('')

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

  const handleSurpriseMe = async () => {
    const params = { surprise: true }
    if (userLocation) {
      params.lat = userLocation.lat
      params.lon = userLocation.lon
    }
    const response = await getTouristSpots(params)
    if (response.data) {
      setTouristSpots([response.data])
    }
  }

  useEffect(() => {
    fetchTouristSpots({ category })
  }, [category, userLocation])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">🗺️ Explore Places</h1>
        <div className="flex space-x-2">
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
          <button
            onClick={handleSurpriseMe}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all"
          >
            🎁 Surprise Me!
          </button>
        </div>
      </div>

      <MapView touristSpots={touristSpots} userLocation={userLocation} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-8">Loading places...</div>
        ) : touristSpots.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            No places found. Try adjusting your filters.
          </div>
        ) : (
          touristSpots.map((spot) => (
            <div key={spot.id} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all">
              {spot.image_url && (
                <img
                  src={spot.image_url || 'https://via.placeholder.com/400x200?text=Tourist+Spot'}
                  alt={spot.name}
                  className="w-full h-48 object-cover rounded-lg mb-3"
                />
              )}
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{spot.name}</h3>
              <p className="text-gray-600 text-sm mb-2">{spot.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-indigo-600 font-medium">{spot.category}</span>
                {spot.distance && (
                  <span className="text-gray-500 text-sm">{spot.distance.toFixed(2)} km away</span>
                )}
              </div>
              {spot.rating && (
                <div className="mt-2">
                  <span className="text-yellow-500">⭐ {spot.rating}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Places

