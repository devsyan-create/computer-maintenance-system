import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('ku', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export function buildFullAssetString(asset) {
  const parts = []
  
  if (asset.category) parts.push(asset.category)
  if (asset.brand || asset.model) {
    parts.push(`${asset.brand || ''} ${asset.model || ''}`.trim())
  }
  
  const specs = []
  if (asset.cpu) specs.push(asset.cpu)
  if (asset.ram) specs.push(asset.ram)
  if (asset.storage) specs.push(asset.storage)
  
  if (specs.length > 0) {
    parts.push(`(${specs.join('/')})`)
  }
  
  return parts.join(' - ')
}
