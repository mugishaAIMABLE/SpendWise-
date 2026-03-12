import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import Dashboard from '../views/Dashboard.vue'
import AdminDashboard from '../views/AdminDashboard.vue'
import Summary from '../views/Summary.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'Login', component: Login, meta: { guest: true } },
    { path: '/register', name: 'Register', component: Register, meta: { guest: true } },
    {
      path: '/admin',
      name: 'AdminDashboard',
      component: AdminDashboard,
      meta: { requiresAuth: true, role: 'admin' },
    },
    {
      path: '/',
      name: 'Dashboard',
      component: Dashboard,
      meta: { requiresAuth: true },
    },
    {
      path: '/summary',
      name: 'Summary',
      component: Summary,
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  authStore.init()
  const isAuth = authStore.isAuthenticated
  const requiresAuth = to.meta.requiresAuth
  const guestOnly = to.meta.guest
  const requiredRole = to.meta.role

  if (requiresAuth && !isAuth) {
    next('/login')
  } else if (requiresAuth && requiredRole && authStore.currentUser?.role !== requiredRole) {
    if (authStore.isAdmin) {
      next('/admin')
    } else {
      next('/')
    }
  } else if (guestOnly && isAuth) {
    if (authStore.isAdmin) {
      next('/admin')
    } else {
      next('/')
    }
  } else {
    next()
  }
})

export default router
