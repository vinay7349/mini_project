import React, { useState, useEffect } from 'react'
import { markInterest, addComment, getEvent } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const EventCard = ({ event, onUpdate }) => {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [commentAuthor, setCommentAuthor] = useState('')
  const [fullEvent, setFullEvent] = useState(event)
  const [loadingComments, setLoadingComments] = useState(false)

  useEffect(() => {
    setFullEvent(event)
  }, [event])

  useEffect(() => {
    if (showComments && (!fullEvent.comments || fullEvent.comments.length === 0)) {
      fetchFullEvent()
    }
  }, [showComments])

  const fetchFullEvent = async () => {
    setLoadingComments(true)
    try {
      const response = await getEvent(event.id)
      setFullEvent(response.data)
    } catch (error) {
      console.error('Error fetching event details:', error)
    } finally {
      setLoadingComments(false)
    }
  }

  const handleInterest = async () => {
    if (!isAuthenticated) {
      alert('Please login to mark interest in events.')
      navigate('/auth')
      return
    }

    try {
      await markInterest(event.id)
      setFullEvent(prev => ({ ...prev, interested_count: (prev.interested_count || 0) + 1 }))
      if (onUpdate) onUpdate()
    } catch (error) {
      console.error('Error marking interest:', error)
    }
  }

  const handleAddComment = async () => {
    if (!isAuthenticated) {
      alert('Please login to add comments.')
      navigate('/auth')
      return
    }

    if (!commentText.trim()) return

    try {
      await addComment(event.id, {
        author: commentAuthor || user?.name || 'Anonymous',
        comment: commentText
      })
      setCommentText('')
      setCommentAuthor('')
      // Refresh comments
      await fetchFullEvent()
      if (onUpdate) onUpdate()
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }

  const handleShowComments = () => {
    if (!isAuthenticated) {
      alert('Please login to view comments and messages.')
      navigate('/auth')
      return
    }
    setShowComments(!showComments)
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{event.title}</h3>
          <p className="text-gray-600 text-sm mb-2">{event.description}</p>
          <div className="flex flex-wrap gap-2 text-sm text-gray-500">
            <span>📍 {event.location}</span>
            <span>🗓️ {new Date(event.date).toLocaleString()}</span>
            {event.organizer && <span>👤 {event.organizer}</span>}
          </div>
          {event.tags && (
            <div className="mt-2 flex flex-wrap gap-2">
              {event.tags.split(',').map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs"
                >
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <button
          onClick={handleInterest}
          className="flex items-center space-x-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors"
        >
          <span>👍</span>
          <span>{fullEvent.interested_count || 0} Interested</span>
        </button>

        <button
          onClick={handleShowComments}
          className="text-indigo-600 hover:text-indigo-800"
          disabled={!isAuthenticated}
        >
          💬 {fullEvent.comments?.length || 0} Comments
        </button>
      </div>

      {showComments && (
        <div className="mt-4 border-t pt-4">
          {loadingComments ? (
            <div className="text-center py-4 text-gray-500">Loading comments...</div>
          ) : (
            <>
              <div className="space-y-2 mb-4">
                {fullEvent.comments && fullEvent.comments.length > 0 ? (
                  fullEvent.comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 p-3 rounded">
                      <p className="font-medium text-sm">{comment.author}</p>
                      <p className="text-gray-700 text-sm">{comment.comment}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">No comments yet. Be the first to comment!</div>
                )}
              </div>
            </>
          )}

          {isAuthenticated ? (
            <div className="space-y-2">
              <input
                type="text"
                placeholder={`Your name (optional) - Logged in as ${user?.name || 'User'}`}
                value={commentAuthor}
                onChange={(e) => setCommentAuthor(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <textarea
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows="2"
              />
              <button
                onClick={handleAddComment}
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                Add Comment
              </button>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-center">
              <p className="text-yellow-800 text-sm font-semibold mb-2">Login Required</p>
              <p className="text-yellow-700 text-xs mb-3">You must be logged in to view and add comments.</p>
              <button
                onClick={() => navigate('/auth')}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm"
              >
                Login / Register
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default EventCard

