import React, { useState, useEffect } from 'react'
import { aiChat, generateItinerary } from '../services/api'

const AIChat = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm your AI travel companion. I can help you plan trips, find places, suggest events, and answer travel questions. How can I assist you today?"
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [itineraryMode, setItineraryMode] = useState(false)
  const [itineraryData, setItineraryData] = useState({
    budget: '',
    location: '',
    duration: '1 day'
  })
  const [userLocation, setUserLocation] = useState(null)

  useEffect(() => {
    // Get user location for location-based suggestions
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          })
        },
        () => {
          console.log('Location access denied or unavailable')
        }
      )
    }
  }, [])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    const currentInput = input
    setInput('')
    setLoading(true)

    try {
      // Check if user wants itinerary
      if (currentInput.toLowerCase().includes('itinerary') || currentInput.toLowerCase().includes('plan')) {
        setItineraryMode(true)
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'I can help you create a detailed itinerary! Please provide the budget, location, and duration.'
        }])
      } else {
        // Send conversation history for context
        const conversationHistory = messages
          .filter(msg => msg.role !== 'system') // Exclude system messages
          .map(msg => ({ role: msg.role, content: msg.content }))
        
        const response = await aiChat({ 
          message: currentInput,
          conversation_history: conversationHistory,
          user_location: userLocation  // Send location for location-based suggestions
        })
        
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: response.data.response 
        }])
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again or check your connection. Make sure OPENAI_API_KEY is set in your backend .env file for ChatGPT integration.'
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateItinerary = async () => {
    if (!itineraryData.location || !itineraryData.budget) {
      alert('Please provide location and budget')
      return
    }

    setLoading(true)
    try {
      const response = await generateItinerary(itineraryData)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.data.itinerary
      }])
      setItineraryMode(false)
      setItineraryData({ budget: '', location: '', duration: '1 day' })
    } catch (error) {
      console.error('Error generating itinerary:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">🤖 AI Travel Assistant</h1>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="h-96 overflow-y-auto mb-4 space-y-4 pb-4 border-b">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl px-4 py-2 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 px-4 py-2 rounded-lg">
                <span className="text-gray-500">Thinking...</span>
              </div>
            </div>
          )}
        </div>

        {itineraryMode && (
          <div className="mb-4 p-4 bg-indigo-50 rounded-lg">
            <h3 className="font-semibold mb-2">Create Itinerary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="number"
                placeholder="Budget (₹)"
                value={itineraryData.budget}
                onChange={(e) => setItineraryData({ ...itineraryData, budget: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                placeholder="Location"
                value={itineraryData.location}
                onChange={(e) => setItineraryData({ ...itineraryData, location: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
              <select
                value={itineraryData.duration}
                onChange={(e) => setItineraryData({ ...itineraryData, duration: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="1 day">1 Day</option>
                <option value="2 days">2 Days</option>
                <option value="3 days">3 Days</option>
                <option value="1 week">1 Week</option>
              </select>
            </div>
            <button
              onClick={handleGenerateItinerary}
              className="mt-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
            >
              Generate Itinerary
            </button>
            <button
              onClick={() => setItineraryMode(false)}
              className="mt-2 ml-2 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        )}

        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything about your trip..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="font-semibold mb-2">💡 Quick Tips</h3>
          <p className="text-sm text-gray-600">
            Ask me about places to visit, directions, events, or local culture.
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="font-semibold mb-2">🗺️ Directions</h3>
          <p className="text-sm text-gray-600">
            I can help you find the best routes and nearby attractions.
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="font-semibold mb-2">📅 Planning</h3>
          <p className="text-sm text-gray-600">
            Ask me to create an itinerary for your trip!
          </p>
        </div>
      </div>
    </div>
  )
}

export default AIChat

