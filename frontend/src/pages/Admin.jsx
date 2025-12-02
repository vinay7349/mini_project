import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const Admin = () => {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [events, setEvents] = useState([])
  const [places, setPlaces] = useState([])
  const [stays, setStays] = useState([])
  const [activeTab, setActiveTab] = useState('dashboard')
  const [recentActivity, setRecentActivity] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login')
      return
    }

    checkAdminStatus()
  }, [isAuthenticated, navigate])

  const checkAdminStatus = async () => {
    try {
      const response = await api.get('/api/admin/check')
      if (response.data.is_admin) {
        setIsAdmin(true)
        fetchStats()
        fetchRecentActivity()
      } else {
        setIsAdmin(false)
      }
    } catch (error) {
      setIsAdmin(false)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/admin/stats')
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchRecentActivity = async () => {
    // Simulate recent activity (in real app, this would come from backend)
    const activities = [
      { type: 'user', action: 'New user registered', time: '2 minutes ago', icon: '👤' },
      { type: 'event', action: 'Event created', time: '15 minutes ago', icon: '📅' },
      { type: 'place', action: 'New place added', time: '1 hour ago', icon: '🗺️' },
      { type: 'user', action: 'User role updated', time: '2 hours ago', icon: '🔄' },
    ]
    setRecentActivity(activities)
  }

  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/admin/users')
      setUsers(response.data.users || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchEvents = async () => {
    try {
      const response = await api.get('/api/admin/events')
      setEvents(response.data.events || [])
    } catch (error) {
      console.error('Error fetching events:', error)
    }
  }

  const fetchPlaces = async () => {
    try {
      const response = await api.get('/api/admin/places')
      setPlaces(response.data.places || [])
    } catch (error) {
      console.error('Error fetching places:', error)
    }
  }

  const fetchStays = async () => {
    try {
      const response = await api.get('/api/admin/stays')
      setStays(response.data.stays || [])
    } catch (error) {
      console.error('Error fetching stays:', error)
    }
  }

  const updateUserRole = async (userId, newRole) => {
    try {
      await api.put(`/api/admin/users/${userId}/role`, { role: newRole })
      alert(`✅ User role updated to ${newRole}`)
      fetchUsers()
      fetchRecentActivity()
    } catch (error) {
      alert('❌ Error updating user role')
      console.error(error)
    }
  }

  const deleteEvent = async (eventId) => {
    if (!window.confirm('⚠️ Are you sure you want to delete this event? This action cannot be undone.')) return
    
    try {
      await api.delete(`/api/admin/events/${eventId}`)
      alert('✅ Event deleted successfully')
      fetchEvents()
      fetchRecentActivity()
    } catch (error) {
      alert('❌ Error deleting event')
      console.error(error)
    }
  }

  const deletePlace = async (placeId) => {
    if (!window.confirm('⚠️ Are you sure you want to delete this place? This action cannot be undone.')) return
    
    try {
      await api.delete(`/api/admin/places/${placeId}`)
      alert('✅ Place deleted successfully')
      fetchPlaces()
      fetchRecentActivity()
    } catch (error) {
      alert('❌ Error deleting place')
      console.error(error)
    }
  }

  const deleteStay = async (stayId) => {
    if (!window.confirm('⚠️ Are you sure you want to delete this stay? This action cannot be undone.')) return
    
    try {
      await api.delete(`/api/admin/stays/${stayId}`)
      alert('✅ Stay deleted successfully')
      fetchStays()
      fetchRecentActivity()
    } catch (error) {
      alert('❌ Error deleting stay')
      console.error(error)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      if (activeTab === 'users') fetchUsers()
      if (activeTab === 'events') fetchEvents()
      if (activeTab === 'places') fetchPlaces()
      if (activeTab === 'stays') fetchStays()
    }
  }, [activeTab, isAdmin])

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredEvents = events.filter(e =>
    e.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.location?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading Admin Panel...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border-2 border-red-200">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
              <span className="text-4xl">🔒</span>
            </div>
            <h2 className="text-2xl font-bold text-red-800 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-6">
              You do not have admin privileges. Only administrators can access this panel.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/admin/login')}
                className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-semibold transition-colors"
              >
                🔐 Try Admin Login
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                <span className="text-3xl">🛡️</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Admin Control Panel</h1>
                <p className="text-white/80 text-sm">SmartStay Navigator Management</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-white/80">Logged in as</p>
                <p className="font-semibold">{user?.name || user?.email}</p>
              </div>
              <button
                onClick={() => navigate('/')}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
              >
                🏠 Home
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden">
          <div className="flex border-b overflow-x-auto">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-6 py-4 font-semibold transition-all whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'border-b-4 border-indigo-600 text-indigo-600 bg-indigo-50'
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
              }`}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-4 font-semibold transition-all whitespace-nowrap ${
                activeTab === 'users'
                  ? 'border-b-4 border-indigo-600 text-indigo-600 bg-indigo-50'
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
              }`}
            >
              👥 Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-6 py-4 font-semibold transition-all whitespace-nowrap ${
                activeTab === 'events'
                  ? 'border-b-4 border-indigo-600 text-indigo-600 bg-indigo-50'
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
              }`}
            >
              📅 Events ({events.length})
            </button>
            <button
              onClick={() => setActiveTab('places')}
              className={`px-6 py-4 font-semibold transition-all whitespace-nowrap ${
                activeTab === 'places'
                  ? 'border-b-4 border-indigo-600 text-indigo-600 bg-indigo-50'
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
              }`}
            >
              🗺️ Places ({places.length})
            </button>
            <button
              onClick={() => setActiveTab('stays')}
              className={`px-6 py-4 font-semibold transition-all whitespace-nowrap ${
                activeTab === 'stays'
                  ? 'border-b-4 border-indigo-600 text-indigo-600 bg-indigo-50'
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
              }`}
            >
              🏨 Stays ({stays.length})
            </button>
          </div>

          <div className="p-6">
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && stats && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm mb-1">Total Users</p>
                        <p className="text-4xl font-bold">{stats.users.total}</p>
                        <p className="text-blue-100 text-xs mt-2">
                          {stats.users.admins} admins, {stats.users.regular} regular
                        </p>
                      </div>
                      <div className="text-5xl opacity-50">👥</div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm mb-1">Events</p>
                        <p className="text-4xl font-bold">{stats.content.events}</p>
                        <p className="text-green-100 text-xs mt-2">Active events</p>
                      </div>
                      <div className="text-5xl opacity-50">📅</div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm mb-1">Tourist Places</p>
                        <p className="text-4xl font-bold">{stats.content.places}</p>
                        <p className="text-purple-100 text-xs mt-2">Registered places</p>
                      </div>
                      <div className="text-5xl opacity-50">🗺️</div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100 text-sm mb-1">Stays</p>
                        <p className="text-4xl font-bold">{stats.content.stays}</p>
                        <p className="text-orange-100 text-xs mt-2">Accommodations</p>
                      </div>
                      <div className="text-5xl opacity-50">🏨</div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span>📈</span> Recent Activity
                  </h3>
                  <div className="space-y-3">
                    {recentActivity.map((activity, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="text-2xl">{activity.icon}</div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{activity.action}</p>
                          <p className="text-sm text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold mb-4">⚡ Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => setActiveTab('users')}
                      className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-4 rounded-lg transition-all transform hover:scale-105"
                    >
                      <div className="text-2xl mb-2">👥</div>
                      <p className="font-semibold">Manage Users</p>
                    </button>
                    <button
                      onClick={() => setActiveTab('events')}
                      className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-4 rounded-lg transition-all transform hover:scale-105"
                    >
                      <div className="text-2xl mb-2">📅</div>
                      <p className="font-semibold">Manage Events</p>
                    </button>
                    <button
                      onClick={() => {
                        fetchStats()
                        fetchRecentActivity()
                        alert('✅ Dashboard refreshed!')
                      }}
                      className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-4 rounded-lg transition-all transform hover:scale-105"
                    >
                      <div className="text-2xl mb-2">🔄</div>
                      <p className="font-semibold">Refresh Data</p>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="🔍 Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={fetchUsers}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                    >
                      🔄 Refresh
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-md">
                    <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                      <tr>
                        <th className="border p-3 text-left">Name</th>
                        <th className="border p-3 text-left">Email</th>
                        <th className="border p-3 text-left">Role</th>
                        <th className="border p-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                          <td className="border p-3 font-medium">{u.name}</td>
                          <td className="border p-3 text-gray-600">{u.email}</td>
                          <td className="border p-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              u.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {u.role || 'user'}
                            </span>
                          </td>
                          <td className="border p-3">
                            <select
                              value={u.role || 'user'}
                              onChange={(e) => updateUserRole(u.id, e.target.value)}
                              className="px-3 py-1 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Events Tab */}
            {activeTab === 'events' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <h2 className="text-2xl font-bold text-gray-800">Event Management</h2>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="🔍 Search events..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={fetchEvents}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                    >
                      🔄 Refresh
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredEvents.map((event) => (
                    <div key={event.id} className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-lg text-gray-800 flex-1">{event.title}</h3>
                        <button
                          onClick={() => deleteEvent(event.id)}
                          className="text-red-600 hover:text-red-800 text-xl"
                          title="Delete event"
                        >
                          🗑️
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{event.location}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>📍 {event.visibility_radius_km || 10}km radius</span>
                        <span>👥 {event.interested_count || 0} interested</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Places Tab */}
            {activeTab === 'places' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <h2 className="text-2xl font-bold text-gray-800">Place Management</h2>
                  <button
                    onClick={fetchPlaces}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                  >
                    🔄 Refresh
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {places.map((place) => (
                    <div key={place.id} className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-lg text-gray-800 flex-1">{place.name}</h3>
                        <button
                          onClick={() => deletePlace(place.id)}
                          className="text-red-600 hover:text-red-800 text-xl"
                          title="Delete place"
                        >
                          🗑️
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{place.category}</p>
                      {place.rating && (
                        <div className="flex items-center gap-1 text-yellow-500">
                          <span>⭐</span>
                          <span className="text-sm">{place.rating}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stays Tab */}
            {activeTab === 'stays' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <h2 className="text-2xl font-bold text-gray-800">Stay Management</h2>
                  <button
                    onClick={fetchStays}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                  >
                    🔄 Refresh
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stays.map((stay) => (
                    <div key={stay.id} className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-lg text-gray-800 flex-1">{stay.name}</h3>
                        <button
                          onClick={() => deleteStay(stay.id)}
                          className="text-red-600 hover:text-red-800 text-xl"
                          title="Delete stay"
                        >
                          🗑️
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{stay.address}</p>
                      {stay.price_per_night && (
                        <p className="text-indigo-600 font-semibold">₹{stay.price_per_night}/night</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Admin
