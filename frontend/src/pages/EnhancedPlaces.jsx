import React, { useState, useEffect } from 'react'
import { 
  getTouristSpots, 
  getPlaceRecommendations, 
  suggestPlaces,
  calculateRoute
} from '../services/api'
import EnhancedMapView from '../components/EnhancedMapView'

const EnhancedPlaces = () => {
  const [touristSpots, setTouristSpots] = useState([])
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState(null)
  const [category, setCategory] = useState('')
  const [aiSuggestions, setAiSuggestions] = useState([])
  const [aiLoading, setAiLoading] = useState(false)
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [showRoute, setShowRoute] = useState(false)
  const [routeInfo, setRouteInfo] = useState(null)
  const [preferences, setPreferences] = useState({
    prioritize: 'balanced',
    min_rating: 0,
    max_distance: 10,
  })
  const [nearestRadius, setNearestRadius] = useState(10) // Radius for nearest places filter

  useEffect(() => {
    getCurrentLocation()
    fetchTouristSpots()
  }, [])

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      // Request location with options for better accuracy
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          })
          console.log('[EnhancedPlaces] Location obtained:', position.coords.latitude, position.coords.longitude)
        },
        (error) => {
          console.error('[EnhancedPlaces] Error getting location:', error)
          // Show user-friendly error message
          if (error.code === error.PERMISSION_DENIED) {
            console.warn('[EnhancedPlaces] Location permission denied. Nearest places will not be available.')
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    } else {
      console.warn('[EnhancedPlaces] Geolocation is not supported by this browser.')
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
      
      // Handle offline response
      if (response.data?.offline) {
        console.warn('[EnhancedPlaces] Offline mode - using cached data if available')
        // Keep existing data if available, don't clear it
        return
      }
      
      setTouristSpots(response.data || [])
    } catch (error) {
      console.error('Error fetching tourist spots:', error)
      // Don't clear data on error - keep what we have
      if (!navigator.onLine) {
        console.warn('[EnhancedPlaces] Offline - keeping existing data')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Fetch places when category changes or when location becomes available
    if (userLocation) {
      fetchTouristSpots({ category })
    } else {
      // Still fetch places even without location (for initial load)
      fetchTouristSpots({ category })
    }
  }, [category, userLocation])

  // Fetch AI-powered suggestions
  const fetchAISuggestions = async () => {
    if (!userLocation || !category) return

    setAiLoading(true)
    try {
      const response = await suggestPlaces({
        lat: userLocation.lat,
        lon: userLocation.lon,
        category: category,
        radius_km: preferences.max_distance,
        limit: 10,
        preferences: {
          prioritize: preferences.prioritize,
          min_rating: preferences.min_rating,
          max_distance: preferences.max_distance,
        }
      })

      setAiSuggestions(response.data?.places || [])
    } catch (error) {
      console.error('Error fetching AI suggestions:', error)
    } finally {
      setAiLoading(false)
    }
  }

  useEffect(() => {
    if (category && userLocation) {
      fetchAISuggestions()
    } else {
      setAiSuggestions([])
    }
  }, [category, userLocation, preferences])

  const handlePlaceSelect = async (place) => {
    setSelectedPlace(place)
    setShowRoute(true)

    if (userLocation) {
      try {
        const response = await calculateRoute({
          from: { lat: userLocation.lat, lon: userLocation.lon },
          to: { lat: place.latitude, lon: place.longitude },
          mode: 'driving'
        })
        setRouteInfo(response.data)
      } catch (error) {
        console.error('Error calculating route:', error)
      }
    }
  }


  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'hotels', label: '🏨 Hotels' },
    { value: 'restaurants', label: '🍽️ Restaurants' },
    { value: 'atms', label: '🏦 ATMs' },
    { value: 'tourist_attractions', label: '🗺️ Tourist Attractions' },
    { value: 'emergency_services', label: '🚨 Emergency Services' },
  ]

  // Calculate distance for places if user location is available
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  // Add distance to spots if user location is available
  const spotsWithDistance = userLocation
    ? touristSpots.map(spot => {
        // Calculate distance if not already provided by API
        const distance = spot.distance !== undefined && spot.distance !== null
          ? spot.distance
          : (spot.latitude && spot.longitude
              ? calculateDistance(userLocation.lat, userLocation.lon, spot.latitude, spot.longitude)
              : null)
        
        return {
          ...spot,
          distance: distance
        }
      })
    : touristSpots

  // Sort places by distance for nearest places
  const sortedSpots = [...spotsWithDistance].sort((a, b) => {
    const distA = a.distance !== undefined && a.distance !== null ? a.distance : 999999
    const distB = b.distance !== undefined && b.distance !== null ? b.distance : 999999
    return distA - distB
  })

  // Get nearest places within selected radius, sorted by rating (best spots first)
  const nearestPlaces = sortedSpots
    .filter(spot => {
      const hasDistance = spot.distance !== undefined && spot.distance !== null && spot.distance < 999999
      const hasCoords = spot.latitude && spot.longitude
      const withinRadius = hasDistance && spot.distance <= nearestRadius
      return hasDistance && hasCoords && withinRadius
    })
    .sort((a, b) => {
      // Sort by rating first (best rated), then by distance
      const ratingA = a.rating || 0
      const ratingB = b.rating || 0
      if (Math.abs(ratingB - ratingA) > 0.1) {
        return ratingB - ratingA // Higher rating first
      }
      return (a.distance || 999) - (b.distance || 999) // Then by distance
    })
    .slice(0, 5) // Show top 5 best spots within radius

  // Debug logging
  useEffect(() => {
    if (userLocation) {
      console.log('[EnhancedPlaces] Debug Info:')
      console.log('  - User Location:', userLocation)
      console.log('  - Total Tourist Spots:', touristSpots.length)
      console.log('  - Spots with Distance:', spotsWithDistance.filter(s => s.distance !== undefined && s.distance !== null).length)
      console.log('  - Nearest Places Found:', nearestPlaces.length)
      if (nearestPlaces.length > 0) {
        console.log('  - Nearest Places:', nearestPlaces.map(p => `${p.name} (${p.distance?.toFixed(2)} km)`))
      }
    }
  }, [userLocation, touristSpots.length, nearestPlaces.length])

  // Get best places (top 3 by rating)
  const bestPlaces = [...touristSpots]
    .filter(spot => spot.rating && spot.rating >= 4.0)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 3)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">🗺️ Enhanced Map Explorer</h1>
          <p className="text-gray-600 mt-1">AI-powered place discovery with offline navigation</p>
        </div>
        <div className="flex space-x-2 flex-wrap">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {categoryOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Location Status */}
      {!userLocation && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-blue-600">📍</span>
            <p className="text-sm text-blue-800">
              Requesting your location to show nearest places... Please allow location access when prompted.
            </p>
          </div>
        </div>
      )}

      {/* Nearest Places Section */}
      {nearestPlaces.length > 0 && userLocation ? (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800">⭐ Best Spots Within Your Radius</h2>
              <p className="text-sm text-gray-600 mt-1">Top rated places sorted by quality within {nearestRadius} km</p>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-700 font-medium whitespace-nowrap">
                Radius: <span className="text-indigo-600 font-bold">{nearestRadius} km</span>
              </label>
              <input
                type="range"
                min="1"
                max="50"
                step="1"
                value={nearestRadius}
                onChange={(e) => setNearestRadius(Number(e.target.value))}
                className="w-32 accent-indigo-600"
              />
              <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                {nearestPlaces.length} found
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nearestPlaces.map((spot, index) => (
              <div
                key={spot.id}
                className="bg-white p-4 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-all border-2 border-indigo-300 hover:border-indigo-500"
                onClick={() => handlePlaceSelect(spot)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-2xl">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '⭐'}
                      </span>
                      <h3 className="font-bold text-gray-800 text-lg">{spot.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{spot.category || 'Tourist Spot'}</p>
                    
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center space-x-2">
                        {spot.rating && (
                          <>
                            <span className="text-yellow-500 text-lg">⭐</span>
                            <span className="font-bold text-gray-800">{spot.rating}</span>
                            <span className="text-xs text-gray-500">
                              {spot.rating >= 4.5 ? 'Excellent' : spot.rating >= 4.0 ? 'Very Good' : 'Good'}
                            </span>
                          </>
                        )}
                      </div>
                      <p className="text-indigo-600 font-semibold text-sm">
                        📍 {spot.distance?.toFixed(2)} km
                      </p>
                    </div>
                    
                    {spot.description && (
                      <p className="text-xs text-gray-500 mt-2 line-clamp-2">{spot.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : userLocation && touristSpots.length === 0 ? (
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="text-yellow-800 text-sm font-semibold mb-2">
            ⚠️ No places found in database
          </p>
          <p className="text-yellow-700 text-sm">
            There are no tourist spots in the database. Please add some places first, or check if the backend is connected properly.
          </p>
        </div>
      ) : userLocation && touristSpots.length > 0 && nearestPlaces.length === 0 ? (
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-yellow-800 text-sm font-semibold mb-1">
                ⚠️ No places found within {nearestRadius} km radius
              </p>
              <p className="text-yellow-700 text-sm mb-3">
                Found {touristSpots.length} places, but none are within {nearestRadius} km. Try increasing the radius.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-700">Radius:</label>
              <input
                type="range"
                min="1"
                max="50"
                step="1"
                value={nearestRadius}
                onChange={(e) => setNearestRadius(Number(e.target.value))}
                className="w-24 accent-yellow-600"
              />
              <span className="text-xs font-bold text-yellow-700">{nearestRadius} km</span>
            </div>
          </div>
          <p className="text-yellow-600 text-xs">
            💡 Tip: Increase the radius slider above to find more places near you.
          </p>
        </div>
      ) : null}

      {/* Best Places Section */}
      {bestPlaces.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-gray-800">⭐ Best Rated Places</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {bestPlaces.map((spot) => (
              <div
                key={spot.id}
                className="bg-white p-3 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-all"
                onClick={() => handlePlaceSelect(spot)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{spot.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{spot.category || 'Tourist Spot'}</p>
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

      {/* AI Suggestions Panel */}
      {category && userLocation && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg border border-indigo-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">🤖 AI-Powered Suggestions</h2>
              <p className="text-sm text-gray-600 mt-1">
                Intelligent recommendations based on distance, rating, safety, and relevance
              </p>
            </div>
            <div className="flex gap-2">
              <select
                value={preferences.prioritize}
                onChange={(e) => setPreferences({ ...preferences, prioritize: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="balanced">⚖️ Balanced</option>
                <option value="distance">📍 Distance</option>
                <option value="rating">⭐ Rating</option>
                <option value="safety">🛡️ Safety</option>
              </select>
              <input
                type="range"
                min="0"
                max="20"
                value={preferences.max_distance}
                onChange={(e) => setPreferences({ ...preferences, max_distance: Number(e.target.value) })}
                className="w-32"
              />
              <span className="text-sm text-gray-600 self-center">{preferences.max_distance} km</span>
            </div>
          </div>

          {aiLoading ? (
            <div className="text-center py-8 text-gray-500">
              <div className="animate-spin inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
              <p className="mt-2">Analyzing places with AI...</p>
            </div>
          ) : aiSuggestions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No suggestions found. Try adjusting your filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {aiSuggestions.map((place, index) => (
                <div
                  key={place.id || index}
                  className={`bg-white p-4 rounded-lg border-2 shadow-sm cursor-pointer transition-all hover:shadow-md ${
                    selectedPlace?.id === place.id ? 'border-indigo-500' : 'border-gray-200'
                  }`}
                  onClick={() => handlePlaceSelect(place)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📍'}</span>
                        <h3 className="text-lg font-semibold text-gray-800">{place.name}</h3>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{place.category || place.type}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                        Score: {place.score}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mt-3">
                    <div>
                      <span className="font-semibold">📍 Distance:</span> {place.distance?.toFixed(2)} km
                    </div>
                    {place.rating && (
                      <div>
                        <span className="font-semibold">⭐ Rating:</span> {place.rating}
                      </div>
                    )}
                    {place.safety_score && (
                      <div>
                        <span className="font-semibold">🛡️ Safety:</span> {place.safety_score.toFixed(1)}
                      </div>
                    )}
                    {place.relevance_score && (
                      <div>
                        <span className="font-semibold">🎯 Relevance:</span> {place.relevance_score.toFixed(1)}
                      </div>
                    )}
                  </div>

                  {place.description && (
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">{place.description}</p>
                  )}

                  {selectedPlace?.id === place.id && showRoute && routeInfo && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="text-xs text-gray-600">
                        <div>📏 Distance: {routeInfo.distance_km} km</div>
                        <div>⏱️ Est. Time: {routeInfo.estimated_time_minutes} min</div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Enhanced Map View */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Interactive Map</h2>
          {selectedPlace && (
            <button
              onClick={() => {
                setShowRoute(!showRoute)
                setSelectedPlace(null)
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
            >
              {showRoute ? 'Hide Route' : 'Show Route'}
            </button>
          )}
        </div>
        <EnhancedMapView
          touristSpots={touristSpots}
          recommendedSpots={aiSuggestions}
          userLocation={userLocation}
          selectedPlace={selectedPlace}
          showRoute={showRoute}
        />
      </div>

      {/* All Places List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">All Places</h2>
          <span className="text-gray-500 text-sm">
            {touristSpots.length} {touristSpots.length === 1 ? 'place' : 'places'} found
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full text-center py-8">Loading places...</div>
          ) : touristSpots.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              No places found. Try adjusting your filters.
            </div>
          ) : (
            touristSpots.map((spot) => (
              <div
                key={spot.id}
                className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer"
                onClick={() => handlePlaceSelect(spot)}
              >
                <h3 className="text-xl font-semibold text-gray-800">{spot.name}</h3>
                {spot.image_url && (
                  <img
                    src={spot.image_url}
                    alt={spot.name}
                    className="w-full h-48 object-cover rounded-lg mb-3 mt-2"
                  />
                )}
                <p className="text-gray-600 text-sm mb-2">{spot.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-indigo-600 font-medium">{spot.category}</span>
                  {spot.distance && (
                    <span className="text-gray-500 text-sm font-medium">
                      📍 {spot.distance.toFixed(2)} km
                    </span>
                  )}
                </div>
                {spot.rating && (
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-yellow-500">⭐</span>
                    <span className="font-medium text-gray-700">{spot.rating}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default EnhancedPlaces

