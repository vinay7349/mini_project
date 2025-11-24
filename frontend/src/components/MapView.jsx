import React, { useEffect, useRef, useState } from 'react'
import L from 'leaflet'

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const MapView = ({
  stays = [],
  touristSpots = [],
  events = [],
  friends = [],
  recommendedSpots = [],
  userLocation = null,
}) => {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])
  const userCircleRef = useRef(null)
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  )

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

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const defaultLat = 13.3409
    const defaultLon = 74.7421

    mapInstanceRef.current = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView([defaultLat, defaultLon], 13)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapInstanceRef.current)

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

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
      radius: 1500,
      color: '#2563eb',
      fillColor: '#93c5fd',
      fillOpacity: 0.15,
      weight: 1,
      dashArray: '4 6',
    }).addTo(mapInstanceRef.current)
  }, [userLocation])

  useEffect(() => {
    if (!mapInstanceRef.current) return

    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    stays.forEach(stay => {
      const marker = L.marker([stay.latitude, stay.longitude])
        .addTo(mapInstanceRef.current)
        .bindPopup(`<b>${stay.name}</b><br>₹${stay.price_per_night}/night<br>Rating: ${stay.rating || 'N/A'}`)
      markersRef.current.push(marker)
    })

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
            ${spot.rating ? `<span style="color: #f59e0b;">⭐ ${spot.rating} ${spot.rating >= 4.5 ? 'Excellent' : spot.rating >= 4.0 ? 'Very Good' : ''}</span>` : ''}
          </div>
        `)
      markersRef.current.push(marker)
    })

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

    friends.forEach(friend => {
      if (!friend.latitude || !friend.longitude) return
      const marker = L.marker([friend.latitude, friend.longitude], {
        icon: L.divIcon({
          className: 'friend-marker',
          html: `
            <div style="display:flex;flex-direction:column;align-items:center;">
              <div style="width:36px;height:36px;border-radius:9999px;border:2px solid ${friend.is_online ? '#22c55e' : '#94a3b8'};overflow:hidden;box-shadow:0 2px 6px rgba(15,23,42,0.25);">
                <img src="${friend.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(friend.name || 'Friend')}" 
                     alt="${friend.name}"
                     style="width:100%;height:100%;object-fit:cover;" />
              </div>
              <span style="margin-top:4px;background:#fff;padding:2px 6px;border-radius:9999px;font-size:11px;font-weight:600;color:#0f172a;box-shadow:0 2px 6px rgba(15,23,42,0.15);">
                ${friend.name?.split(' ')[0] || 'Friend'}
              </span>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [10, 40],
        })
      })
        .addTo(mapInstanceRef.current)
        .bindPopup(`
          <div style="min-width: 220px;">
            <b>${friend.name}</b><br>
            ${friend.status ? `${friend.status}<br>` : ''}
            ${friend.favorite_place ? `<span style="color:#6366f1;">Loves ${friend.favorite_place}</span><br>` : ''}
            ${friend.distance ? `<span style="color:#10b981;">📍 ${friend.distance.toFixed(2)} km away</span>` : ''}
          </div>
        `)
      markersRef.current.push(marker)
    })

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
  }, [stays, touristSpots, events, friends, recommendedSpots, userLocation])

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

