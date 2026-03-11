import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { hashPassword } from '../utils/auth'

export const ROLES = { ADMIN: 'admin', USER: 'user' }

const USERS_KEY = 'spendwise-users'
const CURRENT_USER_KEY = 'spendwise-current-user'

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref(null)

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
      const user = users.find((u) => u.id === id)
      if (!user) return null
      return { id: user.id, email: user.email, name: user.name, role: user.role || ROLES.USER }
    } catch {
      return null
    }
  }

  function init() {
    if (!currentUser.value) {
      currentUser.value = loadCurrentUser()
    }
  }

  const isAuthenticated = computed(() => !!currentUser.value)
  const isAdmin = computed(() => currentUser.value?.role === ROLES.ADMIN)
  const isUser = computed(() => currentUser.value?.role === ROLES.USER || !currentUser.value?.role)

  async function register(email, password, name = '') {
    init()
    const users = loadUsers()
    if (users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
      return { success: false, error: 'Email already registered' }
    }
    const passwordHash = await hashPassword(password)
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2)
    const role = users.length === 0 ? ROLES.ADMIN : ROLES.USER
    const user = {
      id,
      email: email.trim().toLowerCase(),
      passwordHash,
      name: name.trim(),
      role,
    }
    users.push(user)
    saveUsers(users)
    currentUser.value = { id, email: user.email, name: user.name, role }
    localStorage.setItem(CURRENT_USER_KEY, id)
    return { success: true }
  }

  async function login(email, password) {
    init()
    const users = loadUsers()
    const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
    if (!user) return { success: false, error: 'Invalid email or password' }
    const passwordHash = await hashPassword(password)
    if (user.passwordHash !== passwordHash) {
      return { success: false, error: 'Invalid email or password' }
    }
    const role = user.role || ROLES.USER
    currentUser.value = { id: user.id, email: user.email, name: user.name, role }
    localStorage.setItem(CURRENT_USER_KEY, user.id)
    return { success: true }
  }

  function logout() {
    currentUser.value = null
    localStorage.removeItem(CURRENT_USER_KEY)
  }

  function allUsers() {
    return loadUsers().map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name || '',
      role: u.role || ROLES.USER,
    }))
  }

  return {
    currentUser,
    isAuthenticated,
    isAdmin,
    isUser,
    init,
    register,
    login,
    logout,
    allUsers,
    ROLES,
  }
})
