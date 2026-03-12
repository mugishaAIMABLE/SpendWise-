/**
 * Formatting utilities for display
 */

export function formatCurrency(amount) {
  const num = Number(amount)
  if (Number.isNaN(num)) return '$0.00'
  return `$${num.toFixed(2)}`
}

export function formatDate(dateStr) {
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString()
}
