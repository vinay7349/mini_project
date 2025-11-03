import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Stays API
export const getStays = (params) => api.get('/api/stays', { params })
export const getStay = (id) => api.get(`/api/stays/${id}`)
export const createStay = (data) => api.post('/api/stays', data)

// Tourist Spots API
export const getTouristSpots = (params) => api.get('/api/tourist-spots', { params })
export const getTouristSpot = (id) => api.get(`/api/tourist-spots/${id}`)
export const createTouristSpot = (data) => api.post('/api/tourist-spots', data)

// Events API
export const getEvents = (params) => api.get('/api/events', { params })
export const getEvent = (id) => api.get(`/api/events/${id}`)
export const createEvent = (data) => api.post('/api/events', data)
export const markInterest = (id) => api.post(`/api/events/${id}/interest`)
export const addComment = (id, data) => api.post(`/api/events/${id}/comments`, data)
export const suggestEvents = (params) => api.get('/api/events/suggest', { params })

// Emergency API
export const getEmergencyContacts = (params) => api.get('/api/emergency', { params })

// Culture API
export const getCultureCard = (params) => api.get('/api/culture', { params })
export const getPlaceStory = (placeName) => api.get(`/api/culture/story/${placeName}`)
export const getBuzzFeed = (params) => api.get('/api/buzz-feed', { params })

// AI API
export const aiChat = (data) => api.post('/api/ai/chat', data)
export const generateItinerary = (data) => api.post('/api/ai/itinerary', data)
export const aiEventCreate = (data) => api.post('/api/ai/event-create', data)

export default api

