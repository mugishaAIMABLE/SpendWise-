<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { validateEmail, validatePassword } from '../utils/validation'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function onSubmit(e) {
  e.preventDefault()
  error.value = ''
  const emailErr = validateEmail(email.value)
  const passErr = validatePassword(password.value)
  if (emailErr) { error.value = emailErr; return }
  if (passErr) { error.value = passErr; return }
  loading.value = true
  try {
    const result = await authStore.login(email.value, password.value)
    if (result.success) {
      router.push(authStore.isAdmin ? '/admin' : '/')
    } else {
      error.value = result.error || 'Login failed'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-header">
        <h1 class="brand-title">SpendWise</h1>
        <p class="auth-subtitle">Sign in to your account</p>
      </div>
      <form @submit="onSubmit" class="auth-form" novalidate>
        <p v-if="error" id="login-error" class="error" role="alert">{{ error }}</p>
        <div class="form-row">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="you@example.com"
            required
            autocomplete="email"
            :aria-invalid="!!error"
          />
        </div>
        <div class="form-row">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            required
            autocomplete="current-password"
            :aria-invalid="!!error"
          />
        </div>
        <button type="submit" class="btn-primary" :disabled="loading" :aria-busy="loading">
          {{ loading ? 'Signing in...' : 'Sign in' }}
        </button>
      </form>
      <p class="auth-footer">
        Don't have an account?
        <RouterLink to="/register" class="link">Create one</RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 2rem 0;
}
.auth-card {
  width: 100%;
  max-width: 400px;
  background: var(--card-bg);
  border-radius: 16px;
  padding: 2.25rem;
  border: 1px solid var(--border);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
}
.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}
.brand-title {
  margin: 0 0 0.25rem 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary);
}
.auth-subtitle {
  margin: 0 0 1.5rem 0;
  color: var(--text-muted);
  font-size: 0.95rem;
}
.auth-form .error {
  color: #e74c3c;
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
}
.auth-form .form-row {
  margin-bottom: 1rem;
}
.auth-form label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.35rem;
  color: var(--text-secondary);
}
.auth-form input {
  width: 100%;
  padding: 0.65rem 0.85rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 1rem;
  background: var(--input-bg);
  color: var(--text);
}
.auth-form input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-alpha);
}
.auth-form .btn-primary {
  width: 100%;
  margin-top: 0.5rem;
  padding: 0.8rem;
  background: linear-gradient(135deg, var(--primary) 0%, #1d4ed8 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
}
.auth-form .btn-primary:hover:not(:disabled) {
  opacity: 0.95;
}
.auth-form .btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.auth-footer {
  margin: 1.75rem 0 0 0;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.95rem;
}
.auth-footer .link {
  color: var(--primary);
  text-decoration: none;
  font-weight: 500;
}
.auth-footer .link:hover {
  text-decoration: underline;
}
</style>
