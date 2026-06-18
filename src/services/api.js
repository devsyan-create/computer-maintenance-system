import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  limit as firestoreLimit,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth, db } from '@/config/firebase'
import { logAction, LOG_ACTIONS, LOG_MODULES } from './logger'

// Get current user for logging
const getCurrentUser = () => {
  return auth.currentUser ? {
    email: auth.currentUser.email,
    uid: auth.currentUser.uid,
  } : null
}

// Auth
export const authAPI = {
  login: async ({ email, password }) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email,
      }
      
      // Log login action with clean details
      await logAction(LOG_ACTIONS.LOGIN, LOG_MODULES.AUTH, {
        email: user.email || 'unknown',
      }, userData)
      
      return {
        user: userData,
        token: await user.getIdToken(),
      }
    } catch (error) {
      throw new Error('ئیمەیڵ یان وشەی نهێنی هەڵەیە')
    }
  },
  
  logout: async () => {
    const user = getCurrentUser()
    
    // Build details with only defined values
    const details = {}
    if (user?.email) details.email = user.email
    
    await logAction(LOG_ACTIONS.LOGOUT, LOG_MODULES.AUTH, details, user)
    await signOut(auth)
  },
}

// Assets
export const assetsAPI = {
  getAll: async () => {
    const querySnapshot = await getDocs(collection(db, 'assets'))
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  },
  
  getById: async (id) => {
    const docRef = doc(db, 'assets', id)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() }
    }
    throw new Error('کەرەستە نەدۆزرایەوە')
  },
  
  create: async (asset) => {
    const user = getCurrentUser()
    const { runTransaction } = await import('firebase/firestore')
    
    const newAsset = await runTransaction(db, async (transaction) => {
      const counterRef = doc(db, 'counters', 'assetSerial')
      const counterDoc = await transaction.get(counterRef)
      
      let nextId = 1
      if (counterDoc.exists()) {
        nextId = (counterDoc.data().current || 0) + 1
      }
      
      transaction.set(counterRef, { current: nextId }, { merge: true })
      
      const date = new Date()
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const randomFallback = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
      const formattedSerial = `AST-${year}${month}${day}-${String(nextId).padStart(4, '0')}`
      
      const assetData = {
        ...asset,
        serialNumber: asset.serialNumber || formattedSerial,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }
      
      const newAssetRef = doc(collection(db, 'assets'))
      transaction.set(newAssetRef, assetData)
      
      return { id: newAssetRef.id, ...assetData, serialNumber: assetData.serialNumber }
    })
    
    const details = {
      assetId: newAsset.id,
    }
    if (newAsset.serialNumber) details.serialNumber = newAsset.serialNumber
    if (newAsset.category) details.category = newAsset.category
    if (newAsset.brand) details.brand = newAsset.brand
    if (newAsset.model) details.model = newAsset.model
    if (newAsset.location) details.location = newAsset.location
    
    await logAction(LOG_ACTIONS.CREATE_ASSET, LOG_MODULES.ASSETS, details, user)
    
    return newAsset
  },
  
  update: async (id, asset) => {
    const user = getCurrentUser()
    const docRef = doc(db, 'assets', id)
    await updateDoc(docRef, {
      ...asset,
      updatedAt: serverTimestamp(),
    })
    
    // Build details object with only defined values
    const details = {
      assetId: id,
    }
    if (asset.serialNumber) details.serialNumber = asset.serialNumber
    if (asset.category) details.category = asset.category
    if (asset.brand) details.brand = asset.brand
    if (asset.model) details.model = asset.model
    
    await logAction(LOG_ACTIONS.UPDATE_ASSET, LOG_MODULES.ASSETS, details, user)
    
    return { id, ...asset }
  },
  
  delete: async (id) => {
    const user = getCurrentUser()
    
    const transfersQuery = query(collection(db, 'transfers'), where('assetId', '==', id), firestoreLimit(1))
    const maintenanceQuery = query(collection(db, 'maintenance'), where('assetId', '==', id), firestoreLimit(1))
    
    const [transfersSnap, maintenanceSnap] = await Promise.all([
      getDocs(transfersQuery),
      getDocs(maintenanceQuery)
    ])
    
    if (!transfersSnap.empty || !maintenanceSnap.empty) {
      throw new Error('ناتوانیت ئەم کەرەستەیە بسڕیتەوە چونکە تۆماری گواستنەوە یان چاککردنەوەی هەیە')
    }
    
    const assetDoc = await getDoc(doc(db, 'assets', id))
    const assetData = assetDoc.data()
    
    const details = {
      assetId: id,
    }
    if (assetData?.serialNumber) details.serialNumber = assetData.serialNumber
    if (assetData?.name) details.name = assetData.name
    if (assetData?.category) details.category = assetData.category
    if (assetData?.brand) details.brand = assetData.brand
    if (assetData?.model) details.model = assetData.model
    
    await deleteDoc(doc(db, 'assets', id))
    
    await logAction(LOG_ACTIONS.DELETE_ASSET, LOG_MODULES.ASSETS, details, user)
    
    return { success: true }
  },
  
  bulkDelete: async (ids) => {
    const user = getCurrentUser()
    
    // Get all asset data BEFORE deleting for logging
    const assetsData = await Promise.all(
      ids.map(async (id) => {
        const assetDoc = await getDoc(doc(db, 'assets', id))
        return { id, data: assetDoc.data() }
      })
    )
    
    // Delete all assets
    const batch = writeBatch(db)
    ids.forEach(id => {
      batch.delete(doc(db, 'assets', id))
    })
    await batch.commit()
    
    // Build clean assets array with only defined values
    const cleanAssets = assetsData.map(({ id, data }) => {
      const asset = { id }
      if (data?.serialNumber) asset.serialNumber = data.serialNumber
      if (data?.category) asset.category = data.category
      if (data?.brand) asset.brand = data.brand
      if (data?.model) asset.model = data.model
      return asset
    })
    
    // Log bulk delete with details
    await logAction(LOG_ACTIONS.BULK_DELETE_ASSETS, LOG_MODULES.ASSETS, {
      count: ids.length,
      assetIds: ids,
      assets: cleanAssets
    }, user)
    
    return { success: true }
  },
}

// Locations
export const locationsAPI = {
  getAll: async () => {
    const querySnapshot = await getDocs(collection(db, 'locations'))
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  },
  
  create: async (location) => {
    const user = getCurrentUser()
    const docRef = await addDoc(collection(db, 'locations'), {
      ...location,
      createdAt: serverTimestamp(),
    })
    
    await logAction(LOG_ACTIONS.CREATE_LOCATION, LOG_MODULES.LOCATIONS, {
      locationId: docRef.id,
      name: location.name,
    }, user)
    
    return { id: docRef.id, ...location }
  },
  
  update: async (id, location) => {
    const user = getCurrentUser()
    
    const locationDoc = await getDoc(doc(db, 'locations', id))
    const oldLocationData = locationDoc.data()
    const oldLocationName = oldLocationData?.name
    
    const locationRef = doc(db, 'locations', id)
    const locationUpdateData = {
      ...location,
      updatedAt: serverTimestamp(),
    }
    
    if (oldLocationName && location.name && oldLocationName !== location.name) {
      const assetsQuery = query(
        collection(db, 'assets'),
        where('location', '==', oldLocationName)
      )
      const assetsSnapshot = await getDocs(assetsQuery)
      
      const chunks = []
      for (let i = 0; i < assetsSnapshot.docs.length; i += 499) {
        chunks.push(assetsSnapshot.docs.slice(i, i + 499))
      }
      
      if (chunks.length === 0) {
        await updateDoc(locationRef, locationUpdateData)
      } else {
        for (let i = 0; i < chunks.length; i++) {
          const batch = writeBatch(db)
          
          chunks[i].forEach((assetDoc) => {
            batch.update(doc(db, 'assets', assetDoc.id), {
              location: location.name,
              updatedAt: serverTimestamp()
            })
          })
          
          if (i === chunks.length - 1) {
            batch.update(locationRef, locationUpdateData)
          }
          
          await batch.commit()
        }
      }
    } else {
      await updateDoc(locationRef, locationUpdateData)
    }
    
    await logAction(LOG_ACTIONS.UPDATE_LOCATION, LOG_MODULES.LOCATIONS, {
      locationId: id,
      oldName: oldLocationName,
      newName: location.name,
    }, user)
    
    return { id, ...location }
  },
  
  delete: async (id) => {
    const user = getCurrentUser()
    const locationDoc = await getDoc(doc(db, 'locations', id))
    const locationData = locationDoc.data()
    
    if (locationData?.name) {
      const assetsQuery = query(
        collection(db, 'assets'),
        where('location', '==', locationData.name),
        firestoreLimit(1)
      )
      const assetsSnapshot = await getDocs(assetsQuery)
      if (!assetsSnapshot.empty) {
        throw new Error('ناتوانیت ئەم شوێنە بسڕیتەوە چونکە کەرەستەی تێدایە')
      }
    }
    
    await deleteDoc(doc(db, 'locations', id))
    
    await logAction(LOG_ACTIONS.DELETE_LOCATION, LOG_MODULES.LOCATIONS, {
      locationId: id,
      name: locationData?.name,
    }, user)
    
    return { success: true }
  },
}

// Transfers
export const transfersAPI = {
  getAll: async () => {
    const querySnapshot = await getDocs(collection(db, 'transfers'))
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  },
  
  create: async (transfer) => {
    const user = getCurrentUser()
    
    if (!transfer.assetId) {
      throw new Error('assetId پێویستە')
    }
    
    const assetDoc = await getDoc(doc(db, 'assets', transfer.assetId))
    if (!assetDoc.exists()) {
      throw new Error('کەرەستە نەدۆزرایەوە')
    }
    
    const assetData = assetDoc.data()
    
    const transferData = {
      assetId: transfer.assetId,
      assetName: [assetData.category, assetData.brand, assetData.model].filter(Boolean).join(' - '),
      serialNumber: assetData.serialNumber,
      fromLocation: transfer.fromLocation,
      toLocation: transfer.toLocation,
      date: new Date().toISOString(),
      createdAt: serverTimestamp(),
    }
    
    const batch = writeBatch(db)
    const assetRef = doc(db, 'assets', transfer.assetId)
    const transferRef = doc(collection(db, 'transfers'))
    
    batch.update(assetRef, {
      location: transfer.toLocation,
      updatedAt: serverTimestamp(),
    })
    batch.set(transferRef, transferData)
    
    await batch.commit()
    
    const logDetails = {
      transferId: transferRef.id,
    }
    if (transfer.fromLocation) logDetails.from = transfer.fromLocation
    if (transfer.toLocation) logDetails.to = transfer.toLocation
    if (assetData.serialNumber) logDetails.serialNumber = assetData.serialNumber
    if (assetData.category) logDetails.category = assetData.category
    if (assetData.brand) logDetails.brand = assetData.brand
    if (assetData.model) logDetails.model = assetData.model
    logDetails.assetCount = 1
    
    await logAction(LOG_ACTIONS.CREATE_TRANSFER, LOG_MODULES.TRANSFERS, logDetails, user)
    
    return { 
      id: transferRef.id, 
      ...transferData,
    }
  },
  
  bulkTransfer: async (data) => {
    const user = getCurrentUser()
    
    if (!data.assetIds || data.assetIds.length === 0) {
      throw new Error('assetIds پێویستە')
    }
    
    // 1. Get asset details and update locations
    const assetsDetails = []
    const batch = writeBatch(db)
    
    for (const assetId of data.assetIds) {
      const assetDoc = await getDoc(doc(db, 'assets', assetId))
      if (assetDoc.exists()) {
        const assetData = assetDoc.data()
        
        // Update asset location
        batch.update(doc(db, 'assets', assetId), {
          location: data.toLocation,
          updatedAt: serverTimestamp(),
        })
        
        // Store transfer record
        const transferData = {
          assetId,
          assetName: [assetData.category, assetData.brand, assetData.model].filter(Boolean).join(' - '),
          serialNumber: assetData.serialNumber,
          fromLocation: assetData.location,
          toLocation: data.toLocation,
          date: new Date().toISOString(),
          createdAt: serverTimestamp(),
        }
        
        const docRef = doc(collection(db, 'transfers'))
        batch.set(docRef, transferData)
        
        // For logging
        const details = {}
        if (assetData.serialNumber) details.serialNumber = assetData.serialNumber
        if (assetData.category) details.category = assetData.category
        if (assetData.brand) details.brand = assetData.brand
        assetsDetails.push(details)
      }
    }
    
    // 2. Commit all changes
    await batch.commit()
    
    // 3. Build clean log details
    const logDetails = {
      transferCount: data.assetIds.length,
    }
    if (data.toLocation) logDetails.to = data.toLocation
    if (assetsDetails.length > 0) logDetails.assets = assetsDetails
    
    await logAction(LOG_ACTIONS.BULK_TRANSFER, LOG_MODULES.TRANSFERS, logDetails, user)
    
    return { success: true }
  },
  
  delete: async (id) => {
    const user = getCurrentUser()
    
    // Get transfer data BEFORE deleting for logging
    const transferDoc = await getDoc(doc(db, 'transfers', id))
    if (!transferDoc.exists()) {
      throw new Error('گواستنەوە نەدۆزرایەوە')
    }
    
    const transferData = transferDoc.data()
    
    // Build details with only defined values
    const details = {
      transferId: id,
    }
    if (transferData?.serialNumber) details.serialNumber = transferData.serialNumber
    if (transferData?.assetName) details.assetName = transferData.assetName
    if (transferData?.fromLocation) details.from = transferData.fromLocation
    if (transferData?.toLocation) details.to = transferData.toLocation
    if (transferData?.date) details.date = transferData.date
    
    // Log BEFORE deleting
    await logAction(LOG_ACTIONS.DELETE_TRANSFER, LOG_MODULES.TRANSFERS, details, user)
    
    // Then delete
    await deleteDoc(doc(db, 'transfers', id))
    
    return { success: true }
  },
}

// Statistics
export const statsAPI = {
  getDashboard: async () => {
    // Get all collections data
    const [assets, locations, transfers, maintenance] = await Promise.all([
      getDocs(collection(db, 'assets')),
      getDocs(collection(db, 'locations')),
      getDocs(collection(db, 'transfers')),
      getDocs(collection(db, 'maintenance')),
    ])

    const assetsData = assets.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    const locationsData = locations.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    const transfersData = transfers.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    const maintenanceData = maintenance.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    // Calculate statistics
    const totalAssets = assetsData.length
    const totalLocations = locationsData.length
    const activeAssets = assetsData.filter(a => a.status === 'کارپێکراو').length
    const inRepairAssets = maintenanceData.filter(m => m.status === 'لەژێر چاککردنەوەدایە').length

    return {
      totalAssets,
      totalLocations,
      activeAssets,
      inRepairAssets,
      recentTransfers: transfersData.slice(-5).reverse(),
      assetsByLocation: locationsData.map(loc => ({
        location: loc.name,
        count: assetsData.filter(a => a.currentLocation === loc.name).length,
      })),
    }
  },
}

// Maintenance
export const maintenanceAPI = {
  getAll: async () => {
    const querySnapshot = await getDocs(collection(db, 'maintenance'))
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  },
  
  getById: async (id) => {
    const docRef = doc(db, 'maintenance', id)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() }
    }
    throw new Error('تۆمارەکە نەدۆزرایەوە')
  },
  
  create: async (record) => {
    const user = getCurrentUser()
    const docRef = await addDoc(collection(db, 'maintenance'), {
      ...record,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    
    await logAction(LOG_ACTIONS.CREATE_MAINTENANCE, LOG_MODULES.MAINTENANCE, {
      maintenanceId: docRef.id,
      assetId: record.assetId,
      type: record.type,
    }, user)
    
    return { id: docRef.id, ...record }
  },
  
  update: async (id, record) => {
    const user = getCurrentUser()
    const docRef = doc(db, 'maintenance', id)
    await updateDoc(docRef, {
      ...record,
      updatedAt: serverTimestamp(),
    })
    
    await logAction(LOG_ACTIONS.UPDATE_MAINTENANCE, LOG_MODULES.MAINTENANCE, {
      maintenanceId: id,
      changes: record,
    }, user)
    
    return { id, ...record }
  },
  
  delete: async (id) => {
    const user = getCurrentUser()
    await deleteDoc(doc(db, 'maintenance', id))
    
    await logAction(LOG_ACTIONS.DELETE_MAINTENANCE, LOG_MODULES.MAINTENANCE, {
      maintenanceId: id,
    }, user)
    
    return { success: true }
  },
  
  bulkDelete: async (ids) => {
    const user = getCurrentUser()
    const batch = writeBatch(db)
    ids.forEach(id => {
      batch.delete(doc(db, 'maintenance', id))
    })
    await batch.commit()
    
    await logAction(LOG_ACTIONS.BULK_DELETE_MAINTENANCE, LOG_MODULES.MAINTENANCE, {
      count: ids.length,
      maintenanceIds: ids,
    }, user)
    
    return { success: true }
  },
}

// Logs
export const logsAPI = {
  getAll: async (limitCount = 100) => {
    // Import Realtime Database functions
    const { ref, query, orderByChild, limitToLast, get } = await import('firebase/database')
    const { realtimeDb } = await import('@/config/firebase')
    
    const logsRef = ref(realtimeDb, 'logs')
    const logsQuery = query(logsRef, orderByChild('timestamp'), limitToLast(limitCount))
    
    const snapshot = await get(logsQuery)
    const logs = []
    
    snapshot.forEach((childSnapshot) => {
      logs.push({
        id: childSnapshot.key,
        ...childSnapshot.val()
      })
    })
    
    // Reverse to show newest first
    return logs.reverse()
  },
  
  getByUser: async (userEmail, limitCount = 50) => {
    const { ref, query, orderByChild, equalTo, limitToLast, get } = await import('firebase/database')
    const { realtimeDb } = await import('@/config/firebase')
    
    const logsRef = ref(realtimeDb, 'logs')
    const logsQuery = query(logsRef, orderByChild('userEmail'), equalTo(userEmail), limitToLast(limitCount))
    
    const snapshot = await get(logsQuery)
    const logs = []
    
    snapshot.forEach((childSnapshot) => {
      logs.push({
        id: childSnapshot.key,
        ...childSnapshot.val()
      })
    })
    
    return logs.reverse()
  },
  
  getByModule: async (module, limitCount = 50) => {
    const { ref, query, orderByChild, equalTo, limitToLast, get } = await import('firebase/database')
    const { realtimeDb } = await import('@/config/firebase')
    
    const logsRef = ref(realtimeDb, 'logs')
    const logsQuery = query(logsRef, orderByChild('module'), equalTo(module), limitToLast(limitCount))
    
    const snapshot = await get(logsQuery)
    const logs = []
    
    snapshot.forEach((childSnapshot) => {
      logs.push({
        id: childSnapshot.key,
        ...childSnapshot.val()
      })
    })
    
    return logs.reverse()
  },
}
