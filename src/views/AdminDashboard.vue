<script setup>
import { onMounted, computed } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { useExpenseStore } from '../stores/expenseStore'
import { formatCurrency } from '../utils/formatters'

const authStore = useAuthStore()
const expenseStore = useExpenseStore()

const users = computed(() => authStore.allUsers())
const totalUsers = computed(() => users.value.length)
const adminCount = computed(() => users.value.filter((u) => u.role === 'admin').length)
const userCount = computed(() => users.value.filter((u) => u.role === 'user').length)

onMounted(() => {
  expenseStore.loadExpenses()
})
</script>

<template>
  <div class="admin-dashboard" role="main">
    <header class="page-header">
      <h1>Admin Dashboard</h1>
      <p class="subtitle">System overview and user management</p>
    </header>

    <section class="stats-section" aria-labelledby="stats-heading">
      <h2 id="stats-heading" class="visually-hidden">System statistics</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-label">Total Users</span>
          <span class="stat-value">{{ totalUsers }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Admins</span>
          <span class="stat-value">{{ adminCount }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Regular Users</span>
          <span class="stat-value">{{ userCount }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Your Expenses (This Month)</span>
          <span class="stat-value">{{ formatCurrency(expenseStore.totalThisMonth) }}</span>
        </div>
      </div>
    </section>

    <section class="users-section" aria-labelledby="users-heading">
      <h2 id="users-heading">Registered Users</h2>
      <div class="users-table-wrap">
        <table class="users-table" role="table">
          <thead>
            <tr>
              <th scope="col">Email</th>
              <th scope="col">Name</th>
              <th scope="col">Role</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="users.length === 0">
              <td colspan="3" class="empty">No users registered yet.</td>
            </tr>
            <tr v-for="u in users" :key="u.id">
              <td>{{ u.email }}</td>
              <td>{{ u.name || '-' }}</td>
              <td>
                <span
                  class="role-badge"
                  :class="u.role === 'admin' ? 'role-admin' : 'role-user'"
                >
                  {{ u.role }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped>
.admin-dashboard { max-width: 900px; margin: 0 auto; }
.page-header { margin-bottom: 2rem; }
.page-header h1 { margin: 0 0 0.25rem 0; font-size: 1.75rem; color: var(--text); }
.subtitle { margin: 0; color: var(--text-muted); font-size: 1rem; }
.stats-section { margin-bottom: 2rem; }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; }
.stat-card { background: var(--card-bg); border-radius: 12px; padding: 1.25rem; text-align: center; border: 1px solid var(--border); }
.stat-label { display: block; font-size: 0.9rem; color: var(--text-muted); margin-bottom: 0.25rem; }
.stat-value { font-size: 1.4rem; font-weight: 700; color: var(--primary); }
.users-section h2 { font-size: 1.15rem; margin: 0 0 1rem 0; color: var(--text-secondary); }
.users-table-wrap { background: var(--card-bg); border-radius: 12px; overflow-x: auto; border: 1px solid var(--border); }
.users-table { width: 100%; border-collapse: collapse; }
.users-table th, .users-table td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid var(--border); }
.users-table th { font-weight: 600; color: var(--text-secondary); background: var(--bg-secondary); }
.users-table .empty { text-align: center; color: var(--text-muted); padding: 2rem; }
.role-badge { display: inline-block; padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.85rem; font-weight: 500; }
.role-admin { background: rgba(234,179,8,0.2); color: #b45309; }
.role-user { background: var(--primary-alpha); color: var(--primary); }
.visually-hidden { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
</style>
