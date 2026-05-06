import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)      // { name, email, token }
  const [ready, setReady] = useState(false)   // localStorage okundu mu

  useEffect(() => {
    const stored = localStorage.getItem('tp_user')
    if (stored) setUser(JSON.parse(stored))
    setReady(true)
  }, [])

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem('tp_user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('tp_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, ready }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)