<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  expenses: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['edit', 'delete'])

const sortBy = ref('date')
const sortOrder = ref('desc')

const sortedExpenses = computed(() => {
  const list = [...props.expenses]
  list.sort((a, b) => {
    let cmp = 0
    if (sortBy.value === 'date') {
      cmp = new Date(a.date) - new Date(b.date)
    } else if (sortBy.value === 'amount') {
      cmp = Number(a.amount) - Number(b.amount)
    } else if (sortBy.value === 'title') {
      cmp = (a.title || '').localeCompare(b.title || '')
    } else if (sortBy.value === 'category') {
      cmp = (a.category || '').localeCompare(b.category || '')
    }
    return sortOrder.value === 'asc' ? cmp : -cmp
  })
  return list
})

function toggleSort(field) {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = field
    sortOrder.value = 'desc'
  }
}

function confirmDelete(expense) {
  if (confirm(`Delete "${expense.title}"?`)) {
    emit('delete', expense.id)
  }
}
</script>

<template>
  <div class="expense-table-wrap" role="region" aria-label="Expense list">
    <table class="expense-table" role="table">
      <thead>
        <tr>
          <th
            scope="col"
            @click="toggleSort('date')"
            @keydown.enter="toggleSort('date')"
            @keydown.space.prevent="toggleSort('date')"
            class="sortable"
            tabindex="0"
          >
            Date {{ sortBy === 'date' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}
          </th>
          <th
            scope="col"
            @click="toggleSort('title')"
            @keydown.enter="toggleSort('title')"
            @keydown.space.prevent="toggleSort('title')"
            class="sortable"
            tabindex="0"
          >
            Title {{ sortBy === 'title' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}
          </th>
          <th
            scope="col"
            @click="toggleSort('category')"
            @keydown.enter="toggleSort('category')"
            @keydown.space.prevent="toggleSort('category')"
            class="sortable"
            tabindex="0"
          >
            Category {{ sortBy === 'category' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}
          </th>
          <th
            scope="col"
            @click="toggleSort('amount')"
            @keydown.enter="toggleSort('amount')"
            @keydown.space.prevent="toggleSort('amount')"
            class="sortable amount-col"
            tabindex="0"
          >
            Amount {{ sortBy === 'amount' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}
          </th>
          <th scope="col" class="actions-col">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="sortedExpenses.length === 0">
          <td colspan="5" class="empty">No expenses yet. Add your first expense above.</td>
        </tr>
        <tr v-for="expense in sortedExpenses" :key="expense.id">
          <td>{{ new Date(expense.date).toLocaleDateString() }}</td>
          <td>{{ expense.title }}</td>
          <td>
            <span class="category-badge">{{ expense.category }}</span>
          </td>
          <td class="amount">${{ Number(expense.amount).toFixed(2) }}</td>
          <td class="actions">
            <button class="btn-icon" title="Edit" aria-label="Edit expense" @click="emit('edit', expense)">
              Edit
            </button>
            <button
              class="btn-icon btn-danger"
              title="Delete"
              aria-label="Delete expense"
              @click="confirmDelete(expense)"
            >
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.expense-table-wrap {
  background: var(--card-bg);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 1.5rem;
}
.expense-table {
  width: 100%;
  border-collapse: collapse;
}
.expense-table th,
.expense-table td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid var(--border);
}
.expense-table th {
  font-weight: 600;
  color: var(--text-secondary);
  background: var(--bg-secondary);
}
.expense-table th.sortable {
  cursor: pointer;
}
.expense-table th.sortable:hover {
  color: var(--primary);
}
.expense-table .amount-col {
  text-align: right;
}
.expense-table .amount {
  text-align: right;
  font-weight: 500;
}
.expense-table .category-badge {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  background: var(--primary-alpha);
  color: var(--primary);
  border-radius: 6px;
  font-size: 0.9rem;
}
.expense-table .actions {
  white-space: nowrap;
}
.expense-table .actions-col {
  width: 1%;
}
.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.35rem 0.6rem;
  margin-right: 0.25rem;
  font-size: 0.9rem;
  color: var(--primary);
}
.btn-icon:hover {
  text-decoration: underline;
}
.btn-danger {
  color: #e74c3c;
}
.empty {
  text-align: center;
  color: var(--text-muted);
  padding: 2rem;
}
</style>
