import { ref, computed } from 'vue'

const USERS_KEY = 'spendwise-users'
const CURRENT_USER_KEY = 'spendwise-current-user'

const currentUser = ref(null)

async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

function loadUsers() {
  try {
    const stored = localStorage.getItem(USERS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function loadCurrentUser() {
  try {
    const id = localStorage.getItem(CURRENT_USER_KEY)
    if (!id) return null
    const users = loadUsers()
    return users.find((u) => u.id === id) || null
  } catch {
    return null
  }
}

export function useAuth() {
  if (!currentUser.value) {
    currentUser.value = loadCurrentUser()
  }

  const isAuthenticated = computed(() => !!currentUser.value)

  const register = async (email, password, name = '') => {
    const users = loadUsers()
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'Email already registered' }
    }
    const passwordHash = await hashPassword(password)
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2)
    const user = { id, email: email.trim().toLowerCase(), passwordHash, name: name.trim() }
    users.push(user)
    saveUsers(users)
    currentUser.value = { ...user }
    delete currentUser.value.passwordHash
    localStorage.setItem(CURRENT_USER_KEY, id)
    return { success: true }
  }

  const login = async (email, password) => {
    const users = loadUsers()
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (!user) return { success: false, error: 'Invalid email or password' }
    const passwordHash = await hashPassword(password)
    if (user.passwordHash !== passwordHash) {
      return { success: false, error: 'Invalid email or password' }
    }
    currentUser.value = { id: user.id, email: user.email, name: user.name }
    localStorage.setItem(CURRENT_USER_KEY, user.id)
    return { success: true }
  }

  const logout = () => {
    currentUser.value = null
    localStorage.removeItem(CURRENT_USER_KEY)
  }

  return {
    currentUser,
    isAuthenticated,
    register,
    login,
    logout,
  }
}
