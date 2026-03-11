<script setup>
import { ref, watch, computed } from 'vue'
import { EXPENSE_CATEGORIES } from '../constants/categories'
import { validateExpenseTitle, validateExpenseAmount, validateExpenseDate } from '../utils/validation'

const props = defineProps({
  modelValue: {
    type: Object,
    default: null,
  },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['submit', 'cancel'])

const title = ref('')
const category = ref('Food')
const amount = ref('')
const date = ref(new Date().toISOString().slice(0, 10))
const submitted = ref(false)

watch(
  () => props.modelValue,
  (expense) => {
    submitted.value = false
    if (expense) {
      title.value = expense.title || ''
      category.value = expense.category || 'Food'
      amount.value = expense.amount ? String(expense.amount) : ''
      date.value = expense.date || new Date().toISOString().slice(0, 10)
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

function resetForm() {
  title.value = ''
  category.value = 'Food'
  amount.value = ''
  date.value = new Date().toISOString().slice(0, 10)
}

const titleError = computed(() => (submitted.value ? validateExpenseTitle(title.value) : null))
const amountError = computed(() => (submitted.value ? validateExpenseAmount(amount.value) : null))
const dateError = computed(() => (submitted.value ? validateExpenseDate(date.value) : null))

function onSubmit(e) {
  e.preventDefault()
  submitted.value = true
  const numAmount = parseFloat(amount.value)
  if (validateExpenseTitle(title.value) || validateExpenseAmount(amount.value) || validateExpenseDate(date.value)) return
  submitted.value = false
  emit('submit', {
    title: title.value.trim(),
    category: category.value,
    amount: numAmount,
    date: date.value,
  })
  resetForm()
}

function onCancel() {
  submitted.value = false
  resetForm()
  emit('cancel')
}
</script>

<template>
  <form class="expense-form" @submit="onSubmit" novalidate role="form" aria-label="Expense form">
    <div class="form-row">
      <label for="title">Title</label>
      <input
        id="title"
        v-model="title"
        type="text"
        placeholder="e.g. Groceries"
        :aria-invalid="!!titleError"
        :aria-describedby="titleError ? 'title-error' : undefined"
      />
      <span v-if="titleError" id="title-error" class="field-error" role="alert">{{ titleError }}</span>
    </div>
    <div class="form-row">
      <label for="category">Category</label>
      <select id="category" v-model="category" required>
        <option v-for="cat in EXPENSE_CATEGORIES" :key="cat" :value="cat">
          {{ cat }}
        </option>
      </select>
    </div>
    <div class="form-row">
      <label for="amount">Amount</label>
      <input
        id="amount"
        v-model="amount"
        type="number"
        step="0.01"
        min="0.01"
        placeholder="0.00"
        :aria-invalid="!!amountError"
        :aria-describedby="amountError ? 'amount-error' : undefined"
      />
      <span v-if="amountError" id="amount-error" class="field-error" role="alert">{{ amountError }}</span>
    </div>
    <div class="form-row">
      <label for="date">Date</label>
      <input
        id="date"
        v-model="date"
        type="date"
        :aria-invalid="!!dateError"
      />
      <span v-if="dateError" class="field-error" role="alert">{{ dateError }}</span>
    </div>
    <div class="form-actions">
      <button type="submit" class="btn btn-primary" :disabled="loading" :aria-busy="loading">
        {{ loading ? 'Saving...' : (modelValue ? 'Save' : 'Add Expense') }}
      </button>
      <button type="button" class="btn btn-secondary" @click="onCancel">
        Cancel
      </button>
    </div>
  </form>
</template>

<style scoped>
.expense-form {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}
.form-row {
  margin-bottom: 1rem;
}
.form-row label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.35rem;
  color: var(--text-secondary);
}
.form-row input,
.form-row select {
  width: 100%;
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 1rem;
  background: var(--input-bg);
  color: var(--text);
}
.form-row input:focus,
.form-row select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-alpha);
}
.form-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.25rem;
}
.btn {
  padding: 0.6rem 1.25rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  font-size: 1rem;
}
.btn-primary {
  background: var(--primary);
  color: white;
}
.btn-primary:hover {
  opacity: 0.9;
}
.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text);
}
.btn-secondary:hover {
  background: var(--border);
}
.field-error {
  display: block;
  color: #e74c3c;
  font-size: 0.85rem;
  margin-top: 0.25rem;
}
.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
