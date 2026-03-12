import { ref, computed } from 'vue'
import { EXPENSE_CATEGORIES } from '../constants/categories'

function storageKey(userId) {
  return userId ? `spendwise-expenses-${userId}` : 'spendwise-expenses'
}

const expenses = ref([])

function loadExpenses(userId) {
  try {
    const key = storageKey(userId)
    const stored = localStorage.getItem(key)
    expenses.value = stored ? JSON.parse(stored) : []
  } catch (e) {
    expenses.value = []
  }
}

function saveExpenses(userId) {
  const key = storageKey(userId)
  localStorage.setItem(key, JSON.stringify(expenses.value))
}

export function useExpenses(userId = null) {
  loadExpenses(userId)

  const addExpense = (expense) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2)
    expenses.value.push({ ...expense, id })
    saveExpenses(userId)
  }

  const updateExpense = (id, updates) => {
    const index = expenses.value.findIndex((e) => e.id === id)
    if (index !== -1) {
      expenses.value[index] = { ...expenses.value[index], ...updates }
      saveExpenses(userId)
    }
  }

  const deleteExpense = (id) => {
    expenses.value = expenses.value.filter((e) => e.id !== id)
    saveExpenses(userId)
  }

  const getExpenseById = (id) => expenses.value.find((e) => e.id === id)

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
    totalToday,
    totalThisWeek,
    totalThisMonth,
    totalAll,
    byCategory,
    highestExpense,
  }
}
