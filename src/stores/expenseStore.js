import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './authStore'
import { EXPENSE_CATEGORIES } from '../constants/categories'

function storageKey(userId) {
  return userId ? `spendwise-expenses-${userId}` : 'spendwise-expenses'
}

export const useExpenseStore = defineStore('expense', () => {
  const authStore = useAuthStore()
  const expenses = ref([])

  function getUserId() {
    return authStore.currentUser?.id ?? null
  }

  function loadExpenses() {
    const userId = getUserId()
    try {
      const key = storageKey(userId)
      const stored = localStorage.getItem(key)
      expenses.value = stored ? JSON.parse(stored) : []
    } catch {
      expenses.value = []
    }
  }

  function saveExpenses() {
    const userId = getUserId()
    const key = storageKey(userId)
    localStorage.setItem(key, JSON.stringify(expenses.value))
  }

  function addExpense(expense) {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2)
    expenses.value.push({ ...expense, id })
    saveExpenses()
  }

  function updateExpense(id, updates) {
    const index = expenses.value.findIndex((e) => e.id === id)
    if (index !== -1) {
      expenses.value[index] = { ...expenses.value[index], ...updates }
      saveExpenses()
    }
  }

  function deleteExpense(id) {
    expenses.value = expenses.value.filter((e) => e.id !== id)
    saveExpenses()
  }

  function getExpenseById(id) {
    return expenses.value.find((e) => e.id === id)
  }

  const totalToday = computed(() => {
    const today = new Date().toISOString().slice(0, 10)
    return expenses.value
      .filter((e) => e.date === today)
      .reduce((sum, e) => sum + Number(e.amount), 0)
  })

  const totalThisWeek = computed(() => {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    return expenses.value
      .filter((e) => new Date(e.date) >= startOfWeek)
      .reduce((sum, e) => sum + Number(e.amount), 0)
  })

  const totalThisMonth = computed(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    return expenses.value
      .filter((e) => {
        const d = new Date(e.date)
        return d.getFullYear() === year && d.getMonth() === month
      })
      .reduce((sum, e) => sum + Number(e.amount), 0)
  })

  const totalAll = computed(() =>
    expenses.value.reduce((sum, e) => sum + Number(e.amount), 0)
  )

  const byCategory = computed(() => {
    const map = {}
    EXPENSE_CATEGORIES.forEach((cat) => (map[cat] = 0))
    expenses.value.forEach((e) => {
      const cat = e.category || 'Other'
      map[cat] = (map[cat] || 0) + Number(e.amount)
    })
    return Object.entries(map)
      .filter(([, amount]) => amount > 0)
      .sort((a, b) => b[1] - a[1])
  })

  const highestExpense = computed(() => {
    if (expenses.value.length === 0) return null
    return expenses.value.reduce((max, e) =>
      Number(e.amount) > Number(max.amount) ? e : max
    )
  })

  return {
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    getExpenseById,
    loadExpenses,
    totalToday,
    totalThisWeek,
    totalThisMonth,
    totalAll,
    byCategory,
    highestExpense,
  }
})
