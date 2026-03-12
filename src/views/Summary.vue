<script setup>
import { onMounted } from 'vue'
import { useExpenseStore } from '../stores/expenseStore'

const expenseStore = useExpenseStore()

onMounted(() => {
  expenseStore.loadExpenses()
})
</script>

<template>
  <div class="summary" role="main">
    <header class="page-header">
      <h1>Summary Report</h1>
      <p class="subtitle">Your spending overview</p>
    </header>

    <section class="totals-section">
      <h2>Totals</h2>
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
          <span class="total-value">{{ (expenseStore.totalThisMonth ?? 0).toFixed(2) }}Rwf</span>
        </div>
      </div>
    </section>

    <section class="category-section">
      <h2>Spending by Category</h2>
      <div v-if="!(expenseStore.byCategory ?? []).length" class="empty-state">
        No expenses yet. Add expenses on the Dashboard to see a breakdown.
      </div>
      <div v-else class="category-list">
        <div
          v-for="[category, amount] in (expenseStore.byCategory ?? [])"
          :key="category"
          class="category-item"
        >
          <span class="category-name">{{ category }}</span>
          <span class="category-amount">${{ Number(amount).toFixed(2) }}</span>
        </div>
      </div>
    </section>

    <section v-if="expenseStore.highestExpense" class="highest-section">
      <h2>Highest Expense</h2>
      <div class="highest-card">
        <div class="highest-detail">
          <span class="highest-title">{{ expenseStore.highestExpense.title }}</span>
          <span class="highest-category">{{ expenseStore.highestExpense.category }}</span>
          <span class="highest-date">
            {{ new Date(expenseStore.highestExpense.date).toLocaleDateString() }}
          </span>
        </div>
        <span class="highest-amount"
          >${{ Number(expenseStore.highestExpense.amount).toFixed(2) }}</span
        >
      </div>
    </section>

    <div v-else class="empty-state">No expenses recorded yet.</div>
  </div>
</template>

<style scoped>
.summary {
  max-width: 600px;
  margin: 0 auto;
  min-height: 200px;
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
h2 {
  font-size: 1.15rem;
  margin: 0 0 1rem 0;
  color: var(--text-secondary);
}
.totals-section {
  margin-bottom: 2rem;
}
.totals-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}
@media (max-width: 500px) {
  .totals-grid {
    grid-template-columns: 1fr;
  }
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
.category-section {
  margin-bottom: 2rem;
}
.category-list {
  background: var(--card-bg);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border);
}
.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border);
}
.category-item:last-child {
  border-bottom: none;
}
.category-name {
  font-weight: 500;
  color: var(--text);
}
.category-amount {
  font-weight: 600;
  color: var(--primary);
}
.highest-section {
  margin-bottom: 2rem;
}
.highest-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--card-bg);
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  border: 1px solid var(--border);
}
.highest-detail {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.highest-title {
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--text);
}
.highest-category {
  font-size: 0.9rem;
  color: var(--text-muted);
}
.highest-date {
  font-size: 0.85rem;
  color: var(--text-muted);
}
.highest-amount {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary);
}
.empty-state {
  text-align: center;
  color: var(--text-muted);
  padding: 2rem;
  background: var(--card-bg);
  border-radius: 12px;
  border: 1px dashed var(--border);
}
</style>
