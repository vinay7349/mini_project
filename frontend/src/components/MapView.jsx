import React, { useEffect, useRef, useState } from 'react'
import L from 'leaflet'

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const MapView = ({ stays = [], touristSpots = [], events = [], userLocation = null }) => {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  useEffect(() => {
    if (!mapRef.current) return

    // Initialize map
    if (!mapInstanceRef.current) {
      const defaultLat = 13.3409  // Udupi coordinates (can be changed)
      const defaultLon = 74.7421

      mapInstanceRef.current = L.map(mapRef.current).setView(
        userLocation ? [userLocation.lat, userLocation.lon] : [defaultLat, defaultLon],
        13
      )

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current)
    }

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    // Add stay markers
    stays.forEach(stay => {
      const marker = L.marker([stay.latitude, stay.longitude])
        .addTo(mapInstanceRef.current)
        .bindPopup(`<b>${stay.name}</b><br>₹${stay.price_per_night}/night<br>Rating: ${stay.rating || 'N/A'}`)
      markersRef.current.push(marker)
    })

    // Add tourist spot markers
    touristSpots.forEach(spot => {
      const marker = L.marker([spot.latitude, spot.longitude], {
        icon: L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
        })
      })
        .addTo(mapInstanceRef.current)
        .bindPopup(`<b>${spot.name}</b><br>${spot.description || ''}`)
      markersRef.current.push(marker)
    })

    // Add event markers
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

    // Add user location marker
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

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [stays, touristSpots, events, userLocation])

  return (
    <div className="relative">
      <div ref={mapRef} className="w-full h-96 rounded-lg shadow-lg" />
      {isOffline && (
        <div className="absolute top-2 left-2 bg-yellow-100 px-3 py-1 rounded text-sm">
          📴 Offline Mode - Using cached maps
        </div>
      )}
    </div>
  )
}

export default MapView

