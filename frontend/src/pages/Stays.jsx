import React, { useState, useEffect } from 'react'
import { getStays } from '../services/api'
import MapView from '../components/MapView'

const Stays = () => {
  const [stays, setStays] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    max_price: '',
    min_rating: '',
    distance: 10
  })
  const [userLocation, setUserLocation] = useState(null)

  useEffect(() => {
    getCurrentLocation()
    fetchStays()
  }, [])

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          })
        }
      )
    }
  }

  const fetchStays = async () => {
    setLoading(true)
    try {
      const params = { ...filters }
      if (userLocation) {
        params.lat = userLocation.lat
        params.lon = userLocation.lon
      }

      const response = await getStays(params)
      setStays(response.data || [])
    } catch (error) {
      console.error('Error fetching stays:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStays()
  }, [filters, userLocation])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">🏨 Find Stays</h1>

      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Price (₹/night)
            </label>
            <input
              type="number"
              value={filters.max_price}
              onChange={(e) => handleFilterChange('max_price', e.target.value)}
              placeholder="Any price"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Rating
            </label>
            <input
              type="number"
              min="1"
              max="5"
              step="0.1"
              value={filters.min_rating}
              onChange={(e) => handleFilterChange('min_rating', e.target.value)}
              placeholder="Any rating"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Distance (km)
            </label>
            <input
              type="number"
              value={filters.distance}
              onChange={(e) => handleFilterChange('distance', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      <MapView stays={stays} userLocation={userLocation} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-8">Loading stays...</div>
        ) : stays.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            No stays found. Try adjusting your filters.
          </div>
        ) : (
          stays.map((stay) => (
            <div key={stay.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{stay.name}</h3>
              <p className="text-gray-600 text-sm mb-3">{stay.address}</p>
              <div className="flex justify-between items-center mb-3">
                <span className="text-2xl font-bold text-indigo-600">
                  ₹{stay.price_per_night || 'N/A'}
                </span>
                {stay.rating && (
                  <span className="text-yellow-500 font-medium">⭐ {stay.rating}</span>
                )}
              </div>
              {stay.description && (
                <p className="text-gray-600 text-sm mb-3">{stay.description}</p>
              )}
              {stay.distance && (
                <p className="text-gray-500 text-sm mb-3">
                  📍 {stay.distance.toFixed(2)} km away
                </p>
              )}
              {stay.amenities && (
                <p className="text-gray-600 text-sm">✨ {stay.amenities}</p>
              )}
              {stay.contact && (
                <a
                  href={`tel:${stay.contact}`}
                  className="mt-3 inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  📞 Call Now
                </a>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Stays

