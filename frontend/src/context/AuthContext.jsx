import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { loginUser, registerUser, fetchProfile } from '../services/api'

const AuthContext = createContext({
  user: null,
  token: null,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  refreshProfile: async () => {},
})

const TOKEN_KEY = 'smartstay_token'
const USER_KEY = 'smartstay_user'

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  })
  const [loadingProfile, setLoadingProfile] = useState(false)

  const persistSession = (nextToken, nextUser) => {
    setToken(nextToken)
    setUser(nextUser)
    if (nextToken) {
      localStorage.setItem(TOKEN_KEY, nextToken)
    } else {
      localStorage.removeItem(TOKEN_KEY)
    }
    if (nextUser) {
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
    } else {
      localStorage.removeItem(USER_KEY)
    }
  }

  const login = async (credentials) => {
    const response = await loginUser(credentials)
    persistSession(response.data.token, response.data.user)
    return response.data
  }

  const register = async (payload) => {
    const response = await registerUser(payload)
    persistSession(response.data.token, response.data.user)
    return response.data
  }

  const refreshProfile = async () => {
    if (!token) return
    setLoadingProfile(true)
    try {
      const response = await fetchProfile()
      if (response.data?.user) {
        persistSession(token, response.data.user)
      }
    } catch (error) {
      console.error('Failed to refresh profile', error)
      persistSession(null, null)
    } finally {
      setLoadingProfile(false)
    }
  }

  const logout = () => {
    persistSession(null, null)
  }

  useEffect(() => {
    if (token && !user && !loadingProfile) {
      refreshProfile()
    }
  }, [token])

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
      refreshProfile,
      loadingProfile,
    }),
    [token, user, loadingProfile]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)

