<script setup>
import { useRouter } from 'vue-router'
import { RouterLink, RouterView } from 'vue-router'
import { useAuthStore } from './stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="app">
    <nav v-if="authStore.isAuthenticated" class="nav" role="navigation" aria-label="Main">
      <div class="nav-links">
        <RouterLink to="/" class="nav-link" active-class="active">Dashboard</RouterLink>
        <RouterLink
          v-if="authStore.isAdmin"
          to="/admin"
          class="nav-link"
          active-class="active"
        >
          Admin
        </RouterLink>
        <RouterLink to="/summary" class="nav-link" active-class="active">
          Summary
        </RouterLink>
      </div>
      <div class="nav-user">
        <span class="user-email" :title="authStore.currentUser?.role">
          {{ authStore.currentUser?.email }}
          <span v-if="authStore.isAdmin" class="role-tag">(Admin)</span>
        </span>
        <button
          type="button"
          class="btn-logout"
          @click="handleLogout"
          aria-label="Log out"
        >
          Logout
        </button>
      </div>
    </nav>
    <main class="main">
      <div class="main-inner">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: var(--card-bg);
  border-bottom: 1px solid var(--border);
}
.nav-links {
  display: flex;
  gap: 0.5rem;
}
.nav-user {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.user-email {
  font-size: 0.9rem;
  color: var(--text-muted);
}
.btn-logout {
  padding: 0.4rem 0.8rem;
  font-size: 0.9rem;
  background: transparent;
  color: var(--text-muted);
  border: 1px solid var(--border);
  border-radius: 6px;
  cursor: pointer;
}
.btn-logout:hover {
  color: #e74c3c;
  border-color: #e74c3c;
}
.nav-link {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 500;
}
.nav-link:hover {
  color: var(--text);
  background: var(--bg-secondary);
}
.nav-link.active {
  color: var(--primary);
  background: var(--primary-alpha);
}
.main {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 1.5rem;
  background: var(--bg);
  color: var(--text);
}
.main-inner {
  min-height: 300px;
  width: 100%;
}
.role-tag {
  font-size: 0.8rem;
  color: var(--text-muted);
}
@media (max-width: 600px) {
  .nav {
    flex-wrap: wrap;
  }
  .nav-user {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
