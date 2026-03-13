<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { validateEmail, validatePassword } from '../utils/validation'

const router = useRouter()
const authStore = useAuthStore()

const step = ref(1)
const userType = ref(null)
const orgMode = ref(null)

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const orgName = ref('')
const orgCode = ref('')

const error = ref('')
const loading = ref(false)

const USER_TYPES = authStore.USER_TYPES

const canProceed = computed(() => {
  if (step.value === 1) return userType.value !== null
  if (step.value === 2) {
    if (userType.value === USER_TYPES.ORGANIZATION) {
      if (orgMode.value === 'create') return orgName.value.trim().length >= 2
      if (orgMode.value === 'join') return orgCode.value.trim().length >= 4
      return false
    }
    return true
  }
  return true
})

function selectType(type) {
  userType.value = type
  if (type === USER_TYPES.ORGANIZATION) {
    orgMode.value = null
    orgName.value = ''
    orgCode.value = ''
  }
}

function selectOrgMode(mode) {
  orgMode.value = mode
}

function nextStep() {
  error.value = ''
  if (step.value === 1 && userType.value) {
    if (userType.value === USER_TYPES.INDIVIDUAL) {
      step.value = 3
    } else {
      step.value = 2
    }
  } else if (step.value === 2 && canProceed.value) {
    step.value = 3
  }
}

function backStep() {
  error.value = ''
  if (step.value === 2) step.value = 1
  else if (step.value === 3) step.value = userType.value === USER_TYPES.ORGANIZATION ? 2 : 1
}

async function onSubmit(e) {
  e.preventDefault()
  error.value = ''
  const emailErr = validateEmail(email.value)
  const passErr = validatePassword(password.value)
  if (emailErr) {
    error.value = emailErr
    return
  }
  if (passErr) {
    error.value = passErr
    return
  }
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  const payload = {
    email: email.value,
    password: password.value,
    name: name.value,
    userType: userType.value || USER_TYPES.INDIVIDUAL,
  }
  if (userType.value === USER_TYPES.ORGANIZATION) {
    if (orgMode.value === 'create') payload.orgCreate = { name: orgName.value }
    else if (orgMode.value === 'join') payload.orgJoin = { code: orgCode.value }
  }

  loading.value = true
  try {
    const result = await authStore.register(payload)
    if (result.success) {
      router.push(result.role === authStore.ROLES.ADMIN ? '/admin' : '/')
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
      <div class="auth-header">
        <h1>Create account</h1>
        <p class="auth-subtitle">Join SpendWise to track expenses</p>
      </div>

      <form v-if="step < 3" @submit.prevent="nextStep" class="auth-form">
        <div v-if="step === 1" class="step-content">
          <label class="step-label">How will you use SpendWise?</label>
          <div class="type-cards">
            <button
              type="button"
              class="type-card"
              :class="{ selected: userType === USER_TYPES.INDIVIDUAL }"
              @click="selectType(USER_TYPES.INDIVIDUAL)"
            >
              <span class="type-icon" aria-hidden="true">👤</span>
              <span class="type-title">Individual</span>
              <span class="type-desc">Track your personal monthly spending</span>
            </button>
            <button
              type="button"
              class="type-card"
              :class="{ selected: userType === USER_TYPES.ORGANIZATION }"
              @click="selectType(USER_TYPES.ORGANIZATION)"
            >
              <span class="type-icon" aria-hidden="true">🏢</span>
              <span class="type-title">Organization</span>
              <span class="type-desc">Employees add expenses for reimbursement</span>
            </button>
          </div>
        </div>

        <div v-if="step === 2 && userType === USER_TYPES.ORGANIZATION" class="step-content">
          <label class="step-label">Organization setup</label>
          <div class="org-mode-tabs">
            <button
              type="button"
              class="org-tab"
              :class="{ active: orgMode === 'create' }"
              @click="selectOrgMode('create')"
            >
              Create organization
            </button>
            <button
              type="button"
              class="org-tab"
              :class="{ active: orgMode === 'join' }"
              @click="selectOrgMode('join')"
            >
              Join with code
            </button>
          </div>
          <div v-if="orgMode === 'create'" class="form-row">
            <label for="orgName">Organization name</label>
            <input
              id="orgName"
              v-model="orgName"
              type="text"
              placeholder="e.g. Acme Inc."
              autocomplete="organization"
            />
          </div>
          <div v-else-if="orgMode === 'join'" class="form-row">
            <label for="orgCode">Organization code</label>
            <input
              id="orgCode"
              v-model="orgCode"
              type="text"
              placeholder="e.g. ABC123"
              autocomplete="off"
              maxlength="8"
            />
            <span class="field-hint">Get this from your organization admin</span>
          </div>
        </div>

        <div v-if="step === 2 && userType === USER_TYPES.INDIVIDUAL" class="step-content">
          <p class="step-continue">Continue with your details below.</p>
        </div>

        <div class="form-actions-row">
          <button v-if="step > 1" type="button" class="btn-secondary" @click="backStep">
            Back
          </button>
          <button
            v-if="step < 3"
            type="submit"
            class="btn-primary"
            :disabled="!canProceed"
          >
            {{ step === 2 && (userType === USER_TYPES.INDIVIDUAL || canProceed) ? 'Continue' : step === 1 ? 'Continue' : 'Continue' }}
          </button>
        </div>
      </form>

      <form v-else @submit="onSubmit" class="auth-form">
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
        <div class="form-actions-row">
          <button type="button" class="btn-secondary" @click="backStep">
            Back
          </button>
          <button type="submit" class="btn-primary btn-full" :disabled="loading">
            {{ loading ? 'Creating account...' : 'Create account' }}
          </button>
        </div>
      </form>

      <p class="auth-footer">
        Already have an account?
        <RouterLink to="/login" class="link">Log in</RouterLink>
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
  max-width: 440px;
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
.auth-card h1 {
  margin: 0 0 0.25rem 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text);
}
.auth-subtitle {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.95rem;
}

.step-label {
  display: block;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 1rem;
  font-size: 1rem;
}
.step-continue {
  color: var(--text-muted);
  margin: 0 0 1rem 0;
}

.type-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.type-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.25rem;
  border: 2px solid var(--border);
  border-radius: 12px;
  background: var(--input-bg);
  cursor: pointer;
  text-align: center;
  transition: all 0.2s ease;
}
.type-card:hover {
  border-color: var(--primary);
  background: var(--primary-alpha);
}
.type-card.selected {
  border-color: var(--primary);
  background: var(--primary-alpha);
  box-shadow: 0 0 0 1px var(--primary);
}
.type-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}
.type-title {
  font-weight: 600;
  color: var(--text);
  margin-bottom: 0.25rem;
}
.type-desc {
  font-size: 0.8rem;
  color: var(--text-muted);
  line-height: 1.3;
}

.org-mode-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.org-tab {
  flex: 1;
  padding: 0.6rem 1rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--input-bg);
  color: var(--text-secondary);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.org-tab:hover {
  border-color: var(--primary);
  color: var(--primary);
}
.org-tab.active {
  border-color: var(--primary);
  background: var(--primary-alpha);
  color: var(--primary);
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
.field-hint {
  display: block;
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 0.35rem;
}

.form-actions-row {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
}
.form-actions-row .btn-primary,
.form-actions-row .btn-full {
  flex: 1;
}

.btn-primary,
.btn-secondary {
  padding: 0.7rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  border: none;
  transition: opacity 0.2s;
}
.btn-primary {
  background: linear-gradient(135deg, var(--primary) 0%, #1d4ed8 100%);
  color: white;
}
.btn-primary:hover:not(:disabled) {
  opacity: 0.95;
}
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text);
  border: 1px solid var(--border);
}
.btn-secondary:hover {
  background: var(--border);
}
.btn-full {
  width: 100%;
  margin-top: 0.5rem;
  padding: 0.8rem;
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

@media (max-width: 480px) {
  .type-cards {
    grid-template-columns: 1fr;
  }
}
</style>
