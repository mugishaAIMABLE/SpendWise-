<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useExpenseStore } from '../stores/expenseStore'
import ExpenseForm from '../components/ExpenseForm.vue'
import ExpenseTable from '../components/ExpenseTable.vue'
import { formatCurrency } from '../utils/formatters'

const router = useRouter()
const authStore = useAuthStore()
const expenseStore = useExpenseStore()

const isOrgAdmin = computed(() => authStore.isAdmin && !!authStore.getOrganization())
const employees = computed(() => authStore.orgEmployees())

const employeeExpenseSummary = computed(() => {
  const now = new Date()
  const thisMonth = now.getMonth()
  const thisYear = now.getFullYear()
  return employees.value.map((emp) => {
    const expenses = expenseStore.loadExpensesForUser(emp.id)
    const total = expenses
      .filter((e) => {
        const d = new Date(e.date)
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear
      })
      .reduce((sum, e) => sum + Number(e.amount), 0)
    return { ...emp, total }
  }).filter((e) => e.total > 0)
})
const employeeTotalThisMonth = computed(() =>
  employeeExpenseSummary.value.reduce((s, e) => s + e.total, 0)
)

onMounted(() => {
  expenseStore.loadExpenses()
})

const editingExpense = ref(null)

function handleSubmit(payload) {
  if (editingExpense.value) {
    expenseStore.updateExpense(editingExpense.value.id, payload)
    editingExpense.value = null
  } else {
    expenseStore.addExpense(payload)
  }
}

function handleEdit(expense) {
  editingExpense.value = { ...expense }
}

function handleDelete(id) {
  expenseStore.deleteExpense(id)
  if (editingExpense.value?.id === id) {
    editingExpense.value = null
  }
}

function handleCancel() {
  editingExpense.value = null
}
</script>

<template>
  <div class="dashboard" role="main">
    <header class="page-header">
      <h1>Dashboard</h1>
      <p class="subtitle">Track and manage your expenses</p>
    </header>

    <section class="totals-section">
      <div class="totals-grid">
        <div class="total-card">
          <span class="total-label">Today</span>
          <span class="total-value">${{ (expenseStore.totalToday ?? 0).toFixed(2) }}</span>
        </div>
        <div class="total-card">
          <span class="total-label">This Week</span>
          <span class="total-value">${{ (expenseStore.totalThisWeek ?? 0).toFixed(2) }}</span>
        </div>
        <div class="total-card">
          <span class="total-label">This Month</span>
          <span class="total-value">${{ (expenseStore.totalThisMonth ?? 0).toFixed(2) }}</span>
        </div>
      </div>
    </section>

    <section v-if="isOrgAdmin" class="employee-expenses-section">
      <h2>Employee expenses (this month)</h2>
      <p class="employee-section-hint">Expenses submitted by your employees for reimbursement.</p>
      <div v-if="employeeExpenseSummary.length === 0" class="employee-empty">
        No employee expenses this month yet.
      </div>
      <div v-else class="employee-summary-cards">
        <div
          v-for="emp in employeeExpenseSummary"
          :key="emp.id"
          class="employee-summary-card"
        >
          <span class="employee-summary-name">{{ emp.name || emp.email }}</span>
          <span class="employee-summary-total">{{ formatCurrency(emp.total) }}</span>
        </div>
        <div class="employee-summary-total-row">
          <span>Total (this month)</span>
          <span class="employee-total-value">{{ formatCurrency(employeeTotalThisMonth) }}</span>
        </div>
      </div>
      <RouterLink to="/admin" class="btn-view-all">View full details in Admin →</RouterLink>
    </section>

    <section class="expenses-section">
      <h2>{{ editingExpense ? 'Edit Expense' : 'Add Expense' }}</h2>
      <ExpenseForm
        :model-value="editingExpense"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />

      <h2>Your Expenses</h2>
      <ExpenseTable
        :expenses="expenseStore.expenses ?? []"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </section>
  </div>
</template>

<style scoped>
.dashboard {
  max-width: 900px;
  margin: 0 auto;
}
.page-header {
  margin-bottom: 2rem;
}
.page-header h1 {
  margin: 0 0 0.25rem 0;
  font-size: 1.75rem;
  color: var(--text);
}
.subtitle {
  margin: 0;
  color: var(--text-muted);
  font-size: 1rem;
}
.totals-section {
  margin-bottom: 2rem;
}
.totals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
}
.total-card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 1.25rem;
  text-align: center;
  border: 1px solid var(--border);
}
.total-label {
  display: block;
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-bottom: 0.25rem;
}
.total-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary);
}
.expenses-section h2 {
  font-size: 1.15rem;
  margin: 0 0 0.75rem 0;
  color: var(--text-secondary);
}
.expenses-section h2:not(:first-of-type) {
  margin-top: 2rem;
}

.employee-expenses-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--card-bg);
  border-radius: 12px;
  border: 1px solid var(--border);
}
.employee-expenses-section h2 {
  margin: 0 0 0.35rem 0;
  font-size: 1.15rem;
  color: var(--text);
}
.employee-section-hint {
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
  color: var(--text-muted);
}
.employee-empty {
  color: var(--text-muted);
  padding: 1rem 0;
}
.employee-summary-cards {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}
.employee-summary-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--bg-secondary);
  border-radius: 8px;
}
.employee-summary-name {
  font-weight: 500;
  color: var(--text);
}
.employee-summary-total {
  font-weight: 600;
  color: var(--primary);
}
.employee-summary-total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border);
  font-weight: 600;
  color: var(--text);
}
.employee-total-value {
  color: var(--primary);
  font-size: 1.1rem;
}
.btn-view-all {
  display: inline-block;
  margin-top: 0.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--primary);
  text-decoration: none;
}
.btn-view-all:hover {
  text-decoration: underline;
}
</style>
