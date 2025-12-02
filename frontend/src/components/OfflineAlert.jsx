import React, { useState, useEffect } from 'react'

const OfflineAlert = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline) return null

  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 text-yellow-800 p-4 mb-4 shadow-md rounded-r-lg">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <svg className="h-5 w-5 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="font-bold text-lg">You're Currently Offline</p>
          </div>
          <p className="text-sm mb-3">
            Some features may be limited. The map will work if tiles were previously cached.
          </p>
          
          {showDetails && (
            <div className="mt-3 pt-3 border-t border-yellow-300 text-xs space-y-2">
              <p><strong>What still works:</strong></p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>Cached map tiles (if previously downloaded)</li>
                <li>Previously loaded places and events</li>
                <li>Offline navigation features</li>
              </ul>
              <p className="mt-2"><strong>What doesn't work:</strong></p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>New API requests</li>
                <li>Real-time data updates</li>
                <li>Creating new events or places</li>
              </ul>
            </div>
          )}
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-yellow-700 underline hover:text-yellow-900 mt-2"
          >
            {showDetails ? 'Hide details' : 'Show details'}
          </button>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="ml-4 bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 transition-colors"
          title="Try to reconnect"
        >
          Retry
        </button>
      </div>
    </div>
  )
}

export default OfflineAlert
