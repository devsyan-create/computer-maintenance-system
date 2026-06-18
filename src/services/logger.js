import { ref, push, serverTimestamp } from 'firebase/database'
import { realtimeDb } from '@/config/firebase'

/**
 * Log an action to Firebase Realtime Database
 * @param {string} action - نوعی کردار (create, update, delete, transfer, etc.)
 * @param {string} module - مۆدیول (assets, locations, transfers, maintenance)
 * @param {object} details - وردەکاریی کردارەکە
 * @param {object} user - زانیاری بەکارهێنەر
 */
// Helper function to remove undefined values from object
function cleanObject(obj) {
  if (!obj || typeof obj !== 'object') return obj
  
  const cleaned = {}
  Object.keys(obj).forEach(key => {
    const value = obj[key]
    if (value !== undefined && value !== null) {
      if (typeof value === 'object' && !Array.isArray(value)) {
        cleaned[key] = cleanObject(value)
      } else if (Array.isArray(value)) {
        cleaned[key] = value.map(item => 
          typeof item === 'object' ? cleanObject(item) : item
        ).filter(item => item !== undefined && item !== null)
      } else {
        cleaned[key] = value
      }
    }
  })
  return cleaned
}

export async function logAction(action, module, details, user) {
  try {
    console.log('🔥 Logging action:', { action, module, details, user })
    console.log('🔥 Database URL:', import.meta.env.VITE_FIREBASE_DATABASE_URL)
    console.log('🔥 realtimeDb instance:', realtimeDb)
    
    // Clean details to remove undefined values
    const cleanedDetails = cleanObject(details || {})
    
    const logsRef = ref(realtimeDb, 'logs')
    const newLogRef = await push(logsRef, {
      action, // create, update, delete, transfer, login, logout
      module, // assets, locations, transfers, maintenance, auth
      details: cleanedDetails, // Cleaned JSON object with details
      userEmail: user?.email || 'unknown',
      userName: getUserDisplayName(user?.email),
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString(), // For local sorting
    })
    
    console.log('✅ Log saved successfully:', newLogRef.key)
    console.log('✅ Log data:', { action, module, details: cleanedDetails, user: user?.email })
  } catch (error) {
    console.error('❌ Failed to log action:', error)
    console.error('❌ Error details:', error.message, error.code)
    // Don't throw - logging failure shouldn't break the app
  }
}

// Helper function to get user display name
function getUserDisplayName(email) {
  const userMap = {
    'dler@syana.com': 'دلێر احمد',
    'imad@syana.com': 'عماد احمد',
    'azher@syana.com': 'ئاژێر صلاح',
  }
  return userMap[email] || email || 'بەکارهێنەر'
}

// Action types for consistency
export const LOG_ACTIONS = {
  // Auth
  LOGIN: 'login',
  LOGOUT: 'logout',
  
  // Assets  
  CREATE_ASSET: 'create_asset',
  UPDATE_ASSET: 'update_asset',
  DELETE_ASSET: 'delete_asset',
  BULK_DELETE_ASSETS: 'bulk_delete_assets',
  
  // Locations
  CREATE_LOCATION: 'create_location',
  UPDATE_LOCATION: 'update_location',
  DELETE_LOCATION: 'delete_location',
  
  // Transfers
  CREATE_TRANSFER: 'create_transfer',
  BULK_TRANSFER: 'bulk_transfer',
  DELETE_TRANSFER: 'delete_transfer',
  
  // Maintenance
  CREATE_MAINTENANCE: 'create_maintenance',
  UPDATE_MAINTENANCE: 'update_maintenance',
  DELETE_MAINTENANCE: 'delete_maintenance',
  BULK_DELETE_MAINTENANCE: 'bulk_delete_maintenance',
  
  // Brands
  CREATE_BRAND: 'create_brand',
  UPDATE_BRAND: 'update_brand',
  DELETE_BRAND: 'delete_brand',
  
  // Categories
  CREATE_CATEGORY: 'create_category',
  UPDATE_CATEGORY: 'update_category',
  DELETE_CATEGORY: 'delete_category',
  
  // Maintenance Types
  CREATE_MAINTENANCE_TYPE: 'create_maintenance_type',
  UPDATE_MAINTENANCE_TYPE: 'update_maintenance_type',
  DELETE_MAINTENANCE_TYPE: 'delete_maintenance_type',
  
  // Maintenance Locations
  CREATE_MAINTENANCE_LOCATION: 'create_maintenance_location',
  UPDATE_MAINTENANCE_LOCATION: 'update_maintenance_location',
  DELETE_MAINTENANCE_LOCATION: 'delete_maintenance_location',
}

// Module names
export const LOG_MODULES = {
  AUTH: 'auth',
  ASSETS: 'assets',
  LOCATIONS: 'locations',
  TRANSFERS: 'transfers',
  MAINTENANCE: 'maintenance',
  SETTINGS: 'settings',
}
