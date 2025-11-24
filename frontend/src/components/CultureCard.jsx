import React, { useState, useEffect } from 'react'
import { getCultureCard, getPlaceStory } from '../services/api'
import { useAuth } from '../context/AuthContext'

const CultureCard = ({ placeName }) => {
  const { isAuthenticated } = useAuth()
  const [cultureInfo, setCultureInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      setCultureInfo(null)
      setLoading(false)
      return
    }

    if (placeName) {
      fetchPlaceStory(placeName)
    } else {
      fetchCultureCard()
    }
  }, [placeName, isAuthenticated])

  const fetchCultureCard = async () => {
    setLoading(true)
    try {
      const response = await getCultureCard({ location: 'default' })
      setCultureInfo(response.data)
    } catch (error) {
      console.error('Error fetching culture card:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPlaceStory = async (place) => {
    setLoading(true)
    try {
      const response = await getPlaceStory(place)
      setCultureInfo({
        card: {
          title: 'Travel Story',
          fact: response.data.story,
          category: 'story'
        }
      })
    } catch (error) {
      console.error('Error fetching place story:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    if (placeName) {
      fetchPlaceStory(placeName)
    } else {
      fetchCultureCard()
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center border border-indigo-100">
        <p className="text-lg font-semibold text-gray-800 mb-2">Sign in to unlock culture cards</p>
        <p className="text-gray-500 text-sm">
          Create an account to read local stories, traditions, and travel tips tailored for you.
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <p className="text-gray-500">Loading culture information...</p>
      </div>
    )
  }

  if (!cultureInfo || !cultureInfo.card) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-500">No culture information available.</p>
      </div>
    )
  }

  const card = cultureInfo.card

  return (
    <div className="bg-gradient-to-br from-purple-100 to-indigo-100 p-6 rounded-lg shadow-md border-2 border-purple-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">{card.title}</h3>
          <span className="inline-block px-3 py-1 bg-purple-200 text-purple-800 rounded-full text-sm">
            {card.category}
          </span>
        </div>
        <button
          onClick={handleRefresh}
          className="text-gray-600 hover:text-gray-800"
          title="Get another fact"
        >
          🔄
        </button>
      </div>
      <p className="text-gray-700 text-lg leading-relaxed">{card.fact}</p>
      <div className="mt-4 pt-4 border-t border-purple-300">
        <p className="text-sm text-gray-600 italic">
          💡 Discover more about local culture and traditions!
        </p>
      </div>
    </div>
  )
}

export default CultureCard

