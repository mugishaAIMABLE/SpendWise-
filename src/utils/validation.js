/**
 * Validation utilities for user input
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateEmail(email) {
  if (!email || typeof email !== 'string') return 'Email is required'
  const trimmed = email.trim()
  if (!trimmed) return 'Email is required'
  if (!EMAIL_REGEX.test(trimmed)) return 'Enter a valid email address'
  return null
}

export function validatePassword(password, minLength = 6) {
  if (!password || typeof password !== 'string') return 'Password is required'
  if (password.length < minLength) {
    return `Password must be at least ${minLength} characters`
  }
  return null
}

export function validateExpenseTitle(title) {
  if (!title || typeof title !== 'string') return 'Title is required'
  const trimmed = title.trim()
  if (!trimmed) return 'Title is required'
  if (trimmed.length > 200) return 'Title must be 200 characters or less'
  return null
}

export function validateExpenseAmount(amount) {
  if (amount === '' || amount === null || amount === undefined) {
    return 'Amount is required'
  }
  const num = Number(amount)
  if (Number.isNaN(num)) return 'Enter a valid number'
  if (num <= 0) return 'Amount must be greater than 0'
  return null
}

export function validateExpenseDate(date) {
  if (!date) return 'Date is required'
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return 'Enter a valid date'
  return null
}
