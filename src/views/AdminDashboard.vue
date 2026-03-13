<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { useExpenseStore } from '../stores/expenseStore'
import { formatCurrency } from '../utils/formatters'

const authStore = useAuthStore()
const expenseStore = useExpenseStore()

const selectedMonth = ref(new Date().getMonth())
const selectedYear = ref(new Date().getFullYear())
const expandedUser = ref(null)

const isOrgAdmin = computed(() => authStore.isAdmin && !!authStore.getOrganization())

const employees = computed(() => authStore.orgEmployees())

const monthOptions = computed(() => {
  const now = new Date()
  const options = []
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), i, 1)
    options.push({ value: i, label: d.toLocaleString('default', { month: 'long' }) })
  }
  return options
})

const yearOptions = computed(() => {
  const y = new Date().getFullYear()
  return [y, y - 1, y - 2]
})

const employeeExpenseData = computed(() => {
  const result = employees.value.map((emp) => {
    const expenses = expenseStore.loadExpensesForUser(emp.id)
    const filtered = expenses.filter((e) => {
      const d = new Date(e.date)
      return d.getMonth() === selectedMonth.value && d.getFullYear() === selectedYear.value
    })
    const total = filtered.reduce((sum, e) => sum + Number(e.amount), 0)
    return {
      ...emp,
      expenses: filtered.sort((a, b) => new Date(b.date) - new Date(a.date)),
      total,
    }
  })
  return result.sort((a, b) => b.total - a.total)
})

const orgTotal = computed(() =>
  employeeExpenseData.value.reduce((sum, e) => sum + e.total, 0)
)

function toggleExpand(userId) {
  expandedUser.value = expandedUser.value === userId ? null : userId
}

onMounted(() => {
  expenseStore.loadExpenses()
})
</script>

<template>
  <div class="admin-dashboard" role="main">
    <header class="page-header">
      <div class="header-content">
        <h1>Expense overview</h1>
        <p class="subtitle">
          {{ authStore.getOrganization()?.name || 'Organization' }} · Employee expenses for
          reimbursement
        </p>
        <div v-if="authStore.getOrganization()?.code" class="org-code-badge" title="Share this code with employees to join">
          <span class="org-code-label">Join code</span>
          <code class="org-code">{{ authStore.getOrganization().code }}</code>
        </div>
      </div>
    </header>

    <section v-if="isOrgAdmin" class="org-admin-section">
      <div class="period-selector">
        <label for="month">Period</label>
        <div class="period-inputs">
          <select id="month" v-model="selectedMonth" class="select" aria-label="Month">
            <option
              v-for="m in monthOptions"
              :key="m.value"
              :value="m.value"
            >
              {{ m.label }}
            </option>
          </select>
          <select v-model="selectedYear" class="select" aria-label="Year">
            <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>
      </div>

      <div class="summary-cards">
        <div class="summary-card primary">
          <span class="summary-label">Total reimbursable ({{ monthOptions[selectedMonth]?.label }} {{ selectedYear }})</span>
          <span class="summary-value">{{ formatCurrency(orgTotal) }}</span>
        </div>
        <div class="summary-card">
          <span class="summary-label">Employees with expenses</span>
          <span class="summary-value">{{ employeeExpenseData.filter((e) => e.total > 0).length }}</span>
        </div>
      </div>

      <div class="employees-section">
        <h2>By employee</h2>
        <div v-if="employeeExpenseData.length === 0" class="empty-state">
          <p>No employees in your organization yet.</p>
          <p class="hint">Employees join using your organization code.</p>
        </div>
        <div v-else class="employee-cards">
          <div
            v-for="emp in employeeExpenseData"
            :key="emp.id"
            class="employee-card"
            :class="{ expanded: expandedUser === emp.id }"
          >
            <button
              type="button"
              class="employee-header"
              @click="toggleExpand(emp.id)"
              :aria-expanded="expandedUser === emp.id"
            >
              <div class="employee-info">
                <span class="employee-name">{{ emp.name || emp.email }}</span>
                <span class="employee-email">{{ emp.email }}</span>
              </div>
              <div class="employee-total">
                {{ formatCurrency(emp.total) }}
              </div>
              <span class="expand-icon" aria-hidden="true">
                {{ expandedUser === emp.id ? '▼' : '▶' }}
              </span>
            </button>
            <div v-show="expandedUser === emp.id" class="employee-details">
              <div v-if="emp.expenses.length === 0" class="no-expenses">
                No expenses for this period.
              </div>
              <table v-else class="expenses-detail-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th class="amount-col">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="ex in emp.expenses" :key="ex.id">
                    <td>{{ new Date(ex.date).toLocaleDateString() }}</td>
                    <td>{{ ex.title }}</td>
                    <td><span class="category-tag">{{ ex.category }}</span></td>
                    <td class="amount-col">{{ formatCurrency(ex.amount) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section v-else class="legacy-admin-section">
      <p class="legacy-message">Admin overview (system-wide)</p>
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-label">Total users</span>
          <span class="stat-value">{{ authStore.allUsers().length }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.admin-dashboard {
  max-width: 900px;
  margin: 0 auto;
}
.page-header {
  margin-bottom: 2rem;
}
.header-content h1 {
  margin: 0 0 0.25rem 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text);
}
.subtitle {
  margin: 0 0 0.75rem 0;
  color: var(--text-muted);
  font-size: 1rem;
}
.org-code-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.75rem;
  background: var(--primary-alpha);
  border-radius: 8px;
}
.org-code-label {
  font-size: 0.85rem;
  color: var(--text-muted);
}
.org-code {
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: 0.08em;
  color: var(--primary);
}

.period-selector {
  margin-bottom: 1.5rem;
}
.period-selector label {
  display: block;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}
.period-inputs {
  display: flex;
  gap: 0.75rem;
}
.select {
  padding: 0.6rem 1rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 1rem;
  background: var(--input-bg);
  color: var(--text);
  min-width: 140px;
}
.select:focus {
  outline: none;
  border-color: var(--primary);
}

.summary-cards {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1rem;
  margin-bottom: 2rem;
}
.summary-card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--border);
}
.summary-card.primary {
  background: linear-gradient(135deg, var(--primary) 0%, #1d4ed8 100%);
  border-color: transparent;
  color: white;
}
.summary-card.primary .summary-label {
  color: rgba(255, 255, 255, 0.9);
}
.summary-label {
  display: block;
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-bottom: 0.35rem;
}
.summary-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--primary);
}
.summary-card.primary .summary-value {
  color: white;
}

.employees-section h2 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin: 0 0 1rem 0;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  background: var(--card-bg);
  border-radius: 12px;
  border: 1px dashed var(--border);
  color: var(--text-muted);
}
.empty-state .hint {
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.employee-cards {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.employee-card {
  background: var(--card-bg);
  border-radius: 12px;
  border: 1px solid var(--border);
  overflow: hidden;
}
.employee-card.expanded {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.employee-header {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  color: inherit;
  font: inherit;
}
.employee-header:hover {
  background: var(--bg-secondary);
}
.employee-info {
  flex: 1;
  min-width: 0;
}
.employee-name {
  display: block;
  font-weight: 600;
  color: var(--text);
}
.employee-email {
  font-size: 0.85rem;
  color: var(--text-muted);
}
.employee-total {
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--primary);
}
.expand-icon {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.employee-details {
  padding: 0 1.25rem 1.25rem;
  border-top: 1px solid var(--border);
}
.no-expenses {
  padding: 1rem 0;
  color: var(--text-muted);
  font-size: 0.95rem;
}
.expenses-detail-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.75rem;
}
.expenses-detail-table th,
.expenses-detail-table td {
  padding: 0.6rem 0.75rem;
  text-align: left;
  border-bottom: 1px solid var(--border);
}
.expenses-detail-table th {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.expenses-detail-table .amount-col {
  text-align: right;
}
.category-tag {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  background: var(--primary-alpha);
  color: var(--primary);
  border-radius: 6px;
  font-size: 0.85rem;
}

.legacy-admin-section {
  padding: 2rem 0;
}
.legacy-message {
  color: var(--text-muted);
  margin-bottom: 1rem;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
}
.stat-card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 1.25rem;
  text-align: center;
  border: 1px solid var(--border);
}
.stat-label {
  display: block;
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-bottom: 0.25rem;
}
.stat-value {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--primary);
}
</style>
