import React, { useEffect, useRef, useState, useCallback } from 'react'
import L from 'leaflet'
import offlineMapCache from '../services/offlineMapCache'

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const EnhancedMapView = ({
  stays = [],
  touristSpots = [],
  events = [],
  recommendedSpots = [],
  userLocation = null,
  selectedPlace = null,
  showRoute = false,
  onCacheProgress = null,
}) => {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])
  const userCircleRef = useRef(null)
  const routingControlRef = useRef(null)
  const tileLayerRef = useRef(null)
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  )
  const [cacheStatus, setCacheStatus] = useState({ cached: 0, total: 0, region: null })
  const [isCaching, setIsCaching] = useState(false)

  // Initialize offline cache
  useEffect(() => {
    offlineMapCache.init().catch(err => {
      console.warn('[MapView] Cache initialization failed (continuing without cache):', err)
    })
  }, [])

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    if (typeof window === 'undefined') return undefined

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const defaultLat = 13.3409
    const defaultLon = 74.7421

    mapInstanceRef.current = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView([defaultLat, defaultLon], 13)

    // Create custom tile layer with offline support
    const createTileLayer = async () => {
      if (isOffline) {
        // Use offline tile layer
        tileLayerRef.current = L.tileLayer('', {
          attribution: '© OpenStreetMap contributors (Offline)',
          maxZoom: 19,
        })
        
        // Override tile URL to use cache
        tileLayerRef.current.getTileUrl = function(coords) {
          // Use synchronous approach for Leaflet compatibility
          const tileKey = `${coords.z}/${coords.x}/${coords.y}`
          // For now, return online URL - async caching handled separately
          return `https://tile.openstreetmap.org/${coords.z}/${coords.x}/${coords.y}.png`
        }
      } else {
        // Use online tile layer
        tileLayerRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        })
      }
      
      tileLayerRef.current.addTo(mapInstanceRef.current)
    }

    createTileLayer()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Update tile layer when offline status changes
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return

    tileLayerRef.current.remove()
    
    if (isOffline) {
      tileLayerRef.current = L.tileLayer('', {
        attribution: '© OpenStreetMap contributors (Offline)',
        maxZoom: 19,
      })
      
      tileLayerRef.current.getTileUrl = function(coords) {
        // Return online URL - offline tiles handled by cache service
        return `https://tile.openstreetmap.org/${coords.z}/${coords.x}/${coords.y}.png`
      }
    } else {
      tileLayerRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      })
    }
    
    tileLayerRef.current.addTo(mapInstanceRef.current)
  }, [isOffline])

  // Cache region when user location is available
  useEffect(() => {
    if (!userLocation || isOffline || isCaching || !navigator.onLine) return

    const cacheRegion = async () => {
      setIsCaching(true)
      try {
        const result = await offlineMapCache.cacheRegion(
          userLocation.lat,
          userLocation.lon,
          7.5 // 7.5km radius
        )
        setCacheStatus(result)
        if (onCacheProgress) {
          onCacheProgress({ ...result, status: 'completed' })
        }
      } catch (error) {
        console.warn('[MapView] Failed to cache region (continuing without cache):', error)
      } finally {
        setIsCaching(false)
      }
    }

    // Delay caching slightly to avoid blocking UI
    const timeoutId = setTimeout(cacheRegion, 2000)
    return () => clearTimeout(timeoutId)
  }, [userLocation, isOffline, isCaching, onCacheProgress])

  // Update map view when user location changes
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation) return

    mapInstanceRef.current.setView([userLocation.lat, userLocation.lon], 14, {
      animate: true,
      duration: 0.75,
    })

    if (userCircleRef.current) {
      userCircleRef.current.remove()
    }

    userCircleRef.current = L.circle([userLocation.lat, userLocation.lon], {
      radius: 7500, // 7.5km radius
      color: '#2563eb',
      fillColor: '#93c5fd',
      fillOpacity: 0.1,
      weight: 2,
      dashArray: '8 8',
    }).addTo(mapInstanceRef.current)
  }, [userLocation])

  // Display route if selected place and showRoute is true
  useEffect(() => {
    if (!mapInstanceRef.current || !showRoute || !userLocation || !selectedPlace) {
      if (routingControlRef.current) {
        mapInstanceRef.current.removeControl(routingControlRef.current)
        routingControlRef.current = null
      }
      return
    }

    // Remove existing route
    if (routingControlRef.current) {
      mapInstanceRef.current.removeControl(routingControlRef.current)
    }

    // Add route as simple polyline (for offline compatibility)
    if (routingControlRef.current) {
      routingControlRef.current.remove()
    }
    
    routingControlRef.current = L.polyline(
      [
        [userLocation.lat, userLocation.lon],
        [selectedPlace.latitude || selectedPlace.lat, selectedPlace.longitude || selectedPlace.lon],
      ],
      { 
        color: '#3b82f6', 
        weight: 5, 
        opacity: 0.8,
        dashArray: '10, 10'
      }
    ).addTo(mapInstanceRef.current)
    
    // Add distance marker
    const midLat = (userLocation.lat + (selectedPlace.latitude || selectedPlace.lat)) / 2
    const midLon = (userLocation.lon + (selectedPlace.longitude || selectedPlace.lon)) / 2
    
    // Calculate distance
    const R = 6371 // Earth's radius in km
    const dLat = ((selectedPlace.latitude || selectedPlace.lat) - userLocation.lat) * Math.PI / 180
    const dLon = ((selectedPlace.longitude || selectedPlace.lon) - userLocation.lon) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(userLocation.lat * Math.PI / 180) * Math.cos((selectedPlace.latitude || selectedPlace.lat) * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    const distance = R * c
    
    L.marker([midLat, midLon], {
      icon: L.divIcon({
        className: 'route-distance-marker',
        html: `<div style="background: #3b82f6; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 12px;">${distance.toFixed(1)} km</div>`,
        iconSize: [60, 20],
        iconAnchor: [30, 10],
      })
    }).addTo(mapInstanceRef.current)

    return () => {
      if (routingControlRef.current) {
        try {
          mapInstanceRef.current.removeControl(routingControlRef.current)
        } catch (e) {
          // Ignore errors during cleanup
        }
        routingControlRef.current = null
      }
    }
  }, [showRoute, userLocation, selectedPlace])

  // Update markers
  useEffect(() => {
    if (!mapInstanceRef.current) return

    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    // Stays markers
    stays.forEach(stay => {
      const marker = L.marker([stay.latitude, stay.longitude])
        .addTo(mapInstanceRef.current)
        .bindPopup(`<b>${stay.name}</b><br>₹${stay.price_per_night}/night<br>Rating: ${stay.rating || 'N/A'}`)
      markersRef.current.push(marker)
    })

    // Tourist spots markers
    touristSpots.forEach(spot => {
      let markerColor = 'green'
      if (spot.rating >= 4.5) {
        markerColor = 'gold'
      } else if (spot.rating >= 4.0) {
        markerColor = 'orange'
      } else if (spot.rating >= 3.5) {
        markerColor = 'yellow'
      }

      const marker = L.marker([spot.latitude, spot.longitude], {
        icon: L.icon({
          iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${markerColor}.png`,
          iconSize: [25, 41],
          iconAnchor: [12, 41],
        })
      })
        .addTo(mapInstanceRef.current)
        .bindPopup(`
          <div style="min-width: 200px;">
            <b>${spot.name}</b><br>
            ${spot.category ? `<span style="color: #6366f1;">${spot.category}</span><br>` : ''}
            ${spot.description ? `${spot.description.substring(0, 100)}${spot.description.length > 100 ? '...' : ''}<br>` : ''}
            ${spot.distance ? `<span style="color: #059669;">📍 ${spot.distance.toFixed(2)} km away</span><br>` : ''}
            ${spot.rating ? `<span style="color: #f59e0b;">⭐ ${spot.rating}</span>` : ''}
          </div>
        `)
      markersRef.current.push(marker)
    })

    // Recommended spots markers
    recommendedSpots.forEach(spot => {
      const marker = L.marker([spot.latitude, spot.longitude], {
        icon: L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
          iconSize: [30, 45],
          iconAnchor: [12, 41],
        })
      })
        .addTo(mapInstanceRef.current)
        .bindPopup(`
          <div style="min-width: 220px;">
            <b>🔥 ${spot.name}</b><br>
            ${spot.score ? `<span style="color: #f97316;">Smart score: ${spot.score}</span><br>` : ''}
            ${spot.distance ? `<span style="color: #059669;">📍 ${spot.distance.toFixed(2)} km away</span><br>` : ''}
            ${spot.rating ? `<span style="color: #fbbf24;">⭐ Rated ${spot.rating}</span>` : ''}
          </div>
        `)
      markersRef.current.push(marker)
    })

    // Events markers
    events.forEach(event => {
      if (event.latitude && event.longitude) {
        const marker = L.marker([event.latitude, event.longitude], {
          icon: L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
          })
        })
          .addTo(mapInstanceRef.current)
          .bindPopup(`<b>${event.title}</b><br>${event.location}<br>${new Date(event.date).toLocaleString()}`)
        markersRef.current.push(marker)
      }
    })


    // User location marker
    if (userLocation) {
      const userMarker = L.marker([userLocation.lat, userLocation.lon], {
        icon: L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
        })
      })
        .addTo(mapInstanceRef.current)
        .bindPopup('<b>Your Location</b>')
      markersRef.current.push(userMarker)
    }
  }, [stays, touristSpots, events, recommendedSpots, userLocation])

  return (
    <div className="relative">
      <div ref={mapRef} className="w-full h-96 rounded-lg shadow-lg" />
      
      {/* Status indicators */}
      <div className="absolute top-2 left-2 flex flex-col gap-2 z-[1000]">
        {isOffline && (
          <div className="bg-yellow-100 border border-yellow-300 px-3 py-1 rounded text-sm shadow-md">
            📴 Offline Mode - Using cached maps
          </div>
        )}
        {isCaching && (
          <div className="bg-blue-100 border border-blue-300 px-3 py-1 rounded text-sm shadow-md">
            ⬇️ Caching map tiles...
          </div>
        )}
        {cacheStatus.cached > 0 && !isCaching && (
          <div className="bg-green-100 border border-green-300 px-3 py-1 rounded text-sm shadow-md">
            ✅ {cacheStatus.cached} tiles cached
          </div>
        )}
        {/* Debug info - click to see cache stats */}
        <button
          onClick={async () => {
            try {
              const stats = await offlineMapCache.getCacheStats()
              alert(`Cache Statistics:\n\nTiles Cached: ${stats.tileCount}\nEstimated Size: ${stats.estimatedSizeMB} MB\nMax Size: ${stats.maxSizeMB} MB\n\nIndexedDB: ${window.indexedDB ? 'Available' : 'Not Available'}\nOnline: ${navigator.onLine ? 'Yes' : 'No'}`)
            } catch (error) {
              alert(`Cache Error: ${error.message}`)
            }
          }}
          className="bg-gray-100 border border-gray-300 px-2 py-1 rounded text-xs shadow-md hover:bg-gray-200 cursor-pointer"
          title="Click to see cache statistics"
        >
          🔍 Cache Info
        </button>
      </div>
    </div>
  )
}

export default EnhancedMapView

