<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { validateEmail, validatePassword } from '../utils/validation'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const name = ref('')
const error = ref('')
const loading = ref(false)

async function onSubmit(e) {
  e.preventDefault()
  error.value = ''
  const emailErr = validateEmail(email.value)
  const passErr = validatePassword(password.value)
  if (emailErr) { error.value = emailErr; return }
  if (passErr) { error.value = passErr; return }
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }
  loading.value = true
  try {
    const result = await authStore.register(email.value, password.value, name.value)
    if (result.success) {
      router.push(authStore.isAdmin ? '/admin' : '/')
    } else {
      error.value = result.error || 'Registration failed'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1>Register</h1>
      <p class="auth-subtitle">Create your SpendWise account</p>
      <form @submit="onSubmit" class="auth-form">
        <p v-if="error" class="error" role="alert">{{ error }}</p>
        <div class="form-row">
          <label for="name">Name (optional)</label>
          <input
            id="name"
            v-model="name"
            type="text"
            placeholder="Your name"
            autocomplete="name"
          />
        </div>
        <div class="form-row">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="you@example.com"
            required
            autocomplete="email"
          />
        </div>
        <div class="form-row">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="At least 6 characters"
            required
            autocomplete="new-password"
          />
        </div>
        <div class="form-row">
          <label for="confirmPassword">Confirm password</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            placeholder="••••••••"
            required
            autocomplete="new-password"
          />
        </div>
        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Creating account...' : 'Create account' }}
        </button>
      </form>
      <p class="auth-footer">
        Already have an account?
        <RouterLink to="/login" class="link">Login</RouterLink>
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
}
.auth-card {
  width: 100%;
  max-width: 380px;
  background: var(--card-bg);
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid var(--border);
}
.auth-card h1 {
  margin: 0 0 0.25rem 0;
  font-size: 1.5rem;
  color: var(--text);
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
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 1rem;
  background: var(--input-bg);
  color: var(--text);
}
.auth-form input:focus {
  outline: none;
  border-color: var(--primary);
}
.auth-form .btn-primary {
  width: 100%;
  margin-top: 0.5rem;
  padding: 0.75rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
}
.auth-form .btn-primary:hover:not(:disabled) {
  opacity: 0.9;
}
.auth-form .btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.auth-footer {
  margin: 1.5rem 0 0 0;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.95rem;
}
.auth-footer .link {
  color: var(--primary);
  text-decoration: none;
}
.auth-footer .link:hover {
  text-decoration: underline;
}
</style>
