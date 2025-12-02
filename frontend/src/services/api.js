import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    config.headers = config.headers || {}

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('smartstay_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }

    // Add timestamp to prevent caching
    config.params = {
      ...config.params,
      _t: Date.now()
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Check if we're offline
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      error.isOffline = true
      error.message = 'You are currently offline. Some features may not be available.'
      // Don't reject for offline - return a graceful response
      return Promise.resolve({
        data: null,
        offline: true,
        message: error.message
      })
    }

    // Handle network errors
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout. Please check your connection and try again.'
    } else if (error.code === 'ERR_NETWORK' || !error.response) {
      // Check if backend is reachable
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        error.message = 'Cannot connect to server. The backend may be offline or unreachable.'
      } else {
        error.message = 'You are currently offline. Please check your internet connection.'
        error.isOffline = true
      }
    } else if (error.response) {
      // Server responded with error status
      const status = error.response.status
      if (status === 404) {
        error.message = 'API endpoint not found. Please check the backend routes.'
      } else if (status >= 500) {
        error.message = 'Server error. Please try again later.'
      }
    }
    
    // For offline errors, return a graceful response instead of rejecting
    if (error.isOffline) {
      return Promise.resolve({
        data: null,
        offline: true,
        message: error.message,
        error: error
      })
    }
    
    return Promise.reject(error)
  }
)

// Stays API
export const getStays = (params) => api.get('/api/stays', { params })
export const getStay = (id) => api.get(`/api/stays/${id}`)
export const createStay = (data) => api.post('/api/stays', data)

// Tourist Spots API
export const getTouristSpots = (params) => api.get('/api/tourist-spots', { params })
export const getTouristSpot = (id) => api.get(`/api/tourist-spots/${id}`)
export const createTouristSpot = (data) => api.post('/api/tourist-spots', data)
export const getPlaceRecommendations = (params) => api.get('/api/tourist-spots/recommendations', { params })

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

// Translator API with fallback
const translateTextWithFallback = async (data) => {
  try {
    // Try backend API first
    const response = await api.post('/api/translate', data)
    return response
  } catch (error) {
    console.warn('Backend translation failed, using fallback:', error.message)
    // Fallback to direct API call
    return translateTextFallback(data)
  }
}

const translateTextFallback = async (data) => {
  const { text, source_lang, target_lang } = data
  
  if (!text || !text.trim()) {
    throw new Error('No text provided')
  }

  if (source_lang === target_lang) {
    return {
      data: {
        translated_text: text,
        original_text: text,
        source_lang,
        target_lang,
        success: true,
        fallback: true
      }
    }
  }

  try {
    // Try Google Translate API directly from client
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source_lang}&tl=${target_lang}&dt=t&q=${encodeURIComponent(text)}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    if (response.ok) {
      const data = await response.json()
      if (data && Array.isArray(data) && data[0] && Array.isArray(data[0])) {
        const translated = data[0].map(item => item[0]).join('')
        return {
          data: {
            translated_text: translated,
            original_text: text,
            source_lang,
            target_lang,
            success: true,
            fallback: true
          }
        }
      }
    }
  } catch (error) {
    console.error('Fallback translation error:', error)
  }

  // Last resort: Try MyMemory API
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${source_lang}|${target_lang}`
    const response = await fetch(url)
    
    if (response.ok) {
      const data = await response.json()
      if (data.responseStatus === 200 && data.responseData?.translatedText) {
        return {
          data: {
            translated_text: data.responseData.translatedText,
            original_text: text,
            source_lang,
            target_lang,
            success: true,
            fallback: true
          }
        }
      }
    }
  } catch (error) {
    console.error('MyMemory fallback error:', error)
  }

  throw new Error('All translation services are unavailable. Please check your internet connection.')
}

const detectLanguageWithFallback = async (data) => {
  try {
    // Try backend API first
    const response = await api.post('/api/translate/detect', data)
    return response
  } catch (error) {
    console.warn('Backend language detection failed, using fallback:', error.message)
    // Fallback: return default
    return {
      data: {
        detected_language: 'en',
        confidence: 0.5,
        fallback: true
      }
    }
  }
}

// Translator API
export const translateText = translateTextWithFallback
export const detectLanguage = detectLanguageWithFallback

// Auth API
export const registerUser = (data) => api.post('/api/auth/register', data)
export const loginUser = (data) => api.post('/api/auth/login', data)
export const fetchProfile = () => api.get('/api/auth/me')

// Social API
export const getFriendConnections = (params) => api.get('/api/friends', { params })

// Enhanced Map API
export const suggestPlaces = (data) => api.post('/api/map/places/suggest', data)
export const calculateRoute = (data) => api.post('/api/map/route', data)

// Health check function
export const checkBackendHealth = async () => {
  try {
    const response = await api.get('/')
    return { healthy: true, data: response.data }
  } catch (error) {
    return { healthy: false, error: error.message }
  }
}

export default api
