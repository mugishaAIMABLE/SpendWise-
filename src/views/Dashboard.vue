<script setup>
import { ref, onMounted } from 'vue'
import { useExpenseStore } from '../stores/expenseStore'
import ExpenseForm from '../components/ExpenseForm.vue'
import ExpenseTable from '../components/ExpenseTable.vue'

const expenseStore = useExpenseStore()

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
          <span class="total-value">{{ (expenseStore.totalToday ?? 0).toFixed(0) }}Rwf</span>
        </div>
        <div class="total-card">
          <span class="total-label">This Week</span>
          <span class="total-value">{{ (expenseStore.totalThisWeek ?? 0).toFixed(0) }}Rwf</span>
        </div>
        <div class="total-card">
          <span class="total-label">This Month</span>
          <span class="total-value">{{ (expenseStore.totalThisMonth ?? 0).toFixed(0) }}Rwf</span>
        </div>
      </div>
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
</style>
