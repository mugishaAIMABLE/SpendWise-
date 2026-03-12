import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { hashPassword } from '../utils/auth'

export const USER_TYPES = { INDIVIDUAL: 'individual', ORGANIZATION: 'organization' }
export const ROLES = { ADMIN: 'admin', USER: 'user', EMPLOYEE: 'employee' }

const USERS_KEY = 'spendwise-users'
const ORGS_KEY = 'spendwise-organizations'
const CURRENT_USER_KEY = 'spendwise-current-user'

function generateOrgCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

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

  function loadOrgs() {
    try {
      const stored = localStorage.getItem(ORGS_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
  }

  function saveOrgs(orgs) {
    localStorage.setItem(ORGS_KEY, JSON.stringify(orgs))
  }

  function loadCurrentUser() {
    try {
      const id = localStorage.getItem(CURRENT_USER_KEY)
      if (!id) return null
      const users = loadUsers()
      const user = users.find((u) => u.id === id)
      if (!user) return null
      const org = user.organizationId ? loadOrgs().find((o) => o.id === user.organizationId) : null
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role || ROLES.USER,
        userType: user.userType || USER_TYPES.INDIVIDUAL,
        organizationId: user.organizationId || null,
        organizationName: org?.name || null,
        organizationCode: org?.code || null,
      }
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
  const isEmployee = computed(() => currentUser.value?.role === ROLES.EMPLOYEE)
  const isIndividual = computed(() => currentUser.value?.userType === USER_TYPES.INDIVIDUAL)
  const isOrganization = computed(() => currentUser.value?.userType === USER_TYPES.ORGANIZATION)

  async function register(payload) {
    init()
    const { email, password, name, userType, orgCreate, orgJoin } = payload
    const users = loadUsers()
    const trimmedEmail = email.trim().toLowerCase()
    if (users.some((u) => u.email === trimmedEmail)) {
      return { success: false, error: 'Email already registered' }
    }
    const passwordHash = await hashPassword(password)
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2)
    let role = ROLES.USER
    let organizationId = null

    if (userType === USER_TYPES.ORGANIZATION) {
      if (orgCreate?.name?.trim()) {
        const orgs = loadOrgs()
        const orgName = orgCreate.name.trim()
        const code = generateOrgCode()
        const org = { id: 'org-' + id, name: orgName, code, adminId: id }
        orgs.push(org)
        saveOrgs(orgs)
        organizationId = org.id
        role = ROLES.ADMIN
      } else if (orgJoin?.code?.trim()) {
        const orgs = loadOrgs()
        const code = orgJoin.code.trim().toUpperCase()
        const org = orgs.find((o) => o.code === code)
        if (!org) return { success: false, error: 'Invalid organization code' }
        organizationId = org.id
        role = ROLES.EMPLOYEE
      } else {
        return { success: false, error: 'Please create or join an organization' }
      }
    }

    const user = {
      id,
      email: trimmedEmail,
      passwordHash,
      name: (name || '').trim(),
      role,
      userType: userType || USER_TYPES.INDIVIDUAL,
      organizationId,
    }
    users.push(user)
    saveUsers(users)

    const org = organizationId ? loadOrgs().find((o) => o.id === organizationId) : null
    currentUser.value = {
      id,
      email: user.email,
      name: user.name,
      role,
      userType: user.userType,
      organizationId,
      organizationName: org?.name || null,
      organizationCode: org?.code || null,
    }
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
    const org = user.organizationId ? loadOrgs().find((o) => o.id === user.organizationId) : null
    currentUser.value = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role || ROLES.USER,
      userType: user.userType || USER_TYPES.INDIVIDUAL,
      organizationId: user.organizationId || null,
      organizationName: org?.name || null,
      organizationCode: org?.code || null,
    }
    localStorage.setItem(CURRENT_USER_KEY, user.id)
    return { success: true }
  }

  function logout() {
    currentUser.value = null
    localStorage.removeItem(CURRENT_USER_KEY)
  }

  function allUsers() {
    return loadUsers().map((u) => {
      const org = u.organizationId ? loadOrgs().find((o) => o.id === u.organizationId) : null
      return {
        id: u.id,
        email: u.email,
        name: u.name || '',
        role: u.role || ROLES.USER,
        userType: u.userType || USER_TYPES.INDIVIDUAL,
        organizationId: u.organizationId,
        organizationName: org?.name,
      }
    })
  }

  function orgEmployees() {
    const orgId = currentUser.value?.organizationId
    if (!orgId || currentUser.value?.role !== ROLES.ADMIN) return []
    return loadUsers().filter((u) => u.organizationId === orgId && u.role === ROLES.EMPLOYEE)
  }

  function getOrganization() {
    const orgId = currentUser.value?.organizationId
    if (!orgId) return null
    return loadOrgs().find((o) => o.id === orgId)
  }

  return {
    currentUser,
    isAuthenticated,
    isAdmin,
    isUser,
    isEmployee,
    isIndividual,
    isOrganization,
    init,
    register,
    login,
    logout,
    allUsers,
    orgEmployees,
    getOrganization,
    USER_TYPES,
    ROLES,
  }
})
