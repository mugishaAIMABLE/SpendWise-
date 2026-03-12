/**
 * Formatting utilities for display
 */

export function formatCurrency(amount) {
  const num = Number(amount)
  if (Number.isNaN(num)) return '0rwf'
  return `${num.toFixed(0)}Rwf`
n}

export function formatDate(dateStr) {
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString()
}
