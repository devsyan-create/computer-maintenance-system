import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const file = join(__dirname, 'db.json')
const adapter = new JSONFile(file)
const db = new Low(adapter, {})

const app = express()
const PORT = 5000
const JWT_SECRET = 'inventory-os-secret-key-2024'

app.use(cors())
app.use(express.json())

// Initialize database
await db.read()
db.data ||= {
  users: [{ id: '1', username: 'admin', password: 'admin123', name: 'بەڕێوەبەر' }],
  assets: [],
  locations: [],
  transfers: [],
  maintenance: [],
}
await db.write()

// Auth middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) {
    return res.status(401).json({ message: 'دەستپێگەیشتن ڕەتکرایەوە' })
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ message: 'تۆکێنی نادروست' })
  }
}

// Auth routes
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body
  const user = db.data.users.find(
    (u) => u.username === username && u.password === password
  )
  
  if (!user) {
    return res.status(401).json({ message: 'ناو یان وشەی نهێنی هەڵەیە' })
  }
  
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: '7d',
  })
  
  res.json({
    user: { id: user.id, username: user.username, name: user.name },
    token,
  })
})

// Assets routes
app.get('/api/assets', authMiddleware, (req, res) => {
  res.json(db.data.assets)
})

app.get('/api/assets/:id', authMiddleware, (req, res) => {
  const asset = db.data.assets.find((a) => a.id === req.params.id)
  if (!asset) {
    return res.status(404).json({ message: 'کەرەستە نەدۆزرایەوە' })
  }
  res.json(asset)
})

app.post('/api/assets', authMiddleware, async (req, res) => {
  // Generate automatic serial number
  const year = new Date().getFullYear()
  const existingAssets = db.data.assets.filter(a => 
    a.serialNumber && a.serialNumber.startsWith(`SN-${year}-`)
  )
  const nextNumber = existingAssets.length + 1
  const autoSerialNumber = `SN-${year}-${String(nextNumber).padStart(4, '0')}`
  
  const asset = {
    id: `asset-${Date.now()}`,
    ...req.body,
    serialNumber: autoSerialNumber,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  
  // Check for duplicate MAC address
  if (asset.macAddress) {
    const duplicateMac = db.data.assets.find(
      (a) => a.macAddress === asset.macAddress
    )
    if (duplicateMac) {
      return res.status(400).json({ message: 'MAC Address دووبارەیە' })
    }
  }
  
  db.data.assets.push(asset)
  
  // Update location count
  const location = db.data.locations.find((l) => l.name === asset.location)
  if (location) {
    location.assetCount = (location.assetCount || 0) + 1
  }
  
  await db.write()
  res.status(201).json(asset)
})

app.put('/api/assets/:id', authMiddleware, async (req, res) => {
  const index = db.data.assets.findIndex((a) => a.id === req.params.id)
  if (index === -1) {
    return res.status(404).json({ message: 'کەرەستە نەدۆزرایەوە' })
  }
  
  const oldAsset = db.data.assets[index]
  const updatedAsset = {
    ...oldAsset,
    ...req.body,
    id: oldAsset.id,
    updatedAt: new Date().toISOString(),
  }
  
  // Check for duplicate serial number
  const duplicate = db.data.assets.find(
    (a) => a.serialNumber === updatedAsset.serialNumber && a.id !== updatedAsset.id
  )
  if (duplicate) {
    return res.status(400).json({ message: 'ژمارەی زنجیرە دووبارەیە' })
  }
  
  // Update location counts if location changed
  if (oldAsset.location !== updatedAsset.location) {
    const oldLocation = db.data.locations.find((l) => l.name === oldAsset.location)
    if (oldLocation) {
      oldLocation.assetCount = Math.max(0, (oldLocation.assetCount || 1) - 1)
    }
    
    const newLocation = db.data.locations.find((l) => l.name === updatedAsset.location)
    if (newLocation) {
      newLocation.assetCount = (newLocation.assetCount || 0) + 1
    }
  }
  
  db.data.assets[index] = updatedAsset
  await db.write()
  res.json(updatedAsset)
})

app.delete('/api/assets/:id', authMiddleware, async (req, res) => {
  const index = db.data.assets.findIndex((a) => a.id === req.params.id)
  if (index === -1) {
    return res.status(404).json({ message: 'کەرەستە نەدۆزرایەوە' })
  }
  
  const asset = db.data.assets[index]
  
  // Update location count
  const location = db.data.locations.find((l) => l.name === asset.location)
  if (location) {
    location.assetCount = Math.max(0, (location.assetCount || 1) - 1)
  }
  
  db.data.assets.splice(index, 1)
  await db.write()
  res.json({ message: 'کەرەستە سڕایەوە' })
})

app.post('/api/assets/bulk-delete', authMiddleware, async (req, res) => {
  const { ids } = req.body
  
  ids.forEach((id) => {
    const index = db.data.assets.findIndex((a) => a.id === id)
    if (index !== -1) {
      const asset = db.data.assets[index]
      const location = db.data.locations.find((l) => l.name === asset.location)
      if (location) {
        location.assetCount = Math.max(0, (location.assetCount || 1) - 1)
      }
      db.data.assets.splice(index, 1)
    }
  })
  
  await db.write()
  res.json({ message: 'کەرەستەکان سڕانەوە' })
})

// Locations routes
app.get('/api/locations', authMiddleware, (req, res) => {
  res.json(db.data.locations)
})

app.post('/api/locations', authMiddleware, async (req, res) => {
  const location = {
    id: `location-${Date.now()}`,
    ...req.body,
    assetCount: 0,
    createdAt: new Date().toISOString(),
  }
  
  db.data.locations.push(location)
  await db.write()
  res.status(201).json(location)
})

app.put('/api/locations/:id', authMiddleware, async (req, res) => {
  const index = db.data.locations.findIndex((l) => l.id === req.params.id)
  if (index === -1) {
    return res.status(404).json({ message: 'شوێن نەدۆزرایەوە' })
  }
  
  const oldLocation = db.data.locations[index]
  const updatedLocation = {
    ...oldLocation,
    ...req.body,
    id: oldLocation.id,
  }
  
  // Update all assets with this location
  if (oldLocation.name !== updatedLocation.name) {
    db.data.assets.forEach((asset) => {
      if (asset.location === oldLocation.name) {
        asset.location = updatedLocation.name
      }
    })
  }
  
  db.data.locations[index] = updatedLocation
  await db.write()
  res.json(updatedLocation)
})

app.delete('/api/locations/:id', authMiddleware, async (req, res) => {
  const index = db.data.locations.findIndex((l) => l.id === req.params.id)
  if (index === -1) {
    return res.status(404).json({ message: 'شوێن نەدۆزرایەوە' })
  }
  
  const location = db.data.locations[index]
  
  // Check if location has assets
  const hasAssets = db.data.assets.some((a) => a.location === location.name)
  if (hasAssets) {
    return res.status(400).json({ message: 'ناتوانی شوێنێک بسڕیتەوە کە کەرەستەی تێدایە' })
  }
  
  db.data.locations.splice(index, 1)
  await db.write()
  res.json({ message: 'شوێن سڕایەوە' })
})

// Transfers routes
app.get('/api/transfers', authMiddleware, (req, res) => {
  res.json(db.data.transfers)
})

app.post('/api/transfers', authMiddleware, async (req, res) => {
  const { assetId, fromLocation, toLocation } = req.body
  
  const asset = db.data.assets.find((a) => a.id === assetId)
  if (!asset) {
    return res.status(404).json({ message: 'کەرەستە نەدۆزرایەوە' })
  }
  
  // Update asset location
  const oldLocation = asset.location
  asset.location = toLocation
  asset.updatedAt = new Date().toISOString()
  
  // Update location counts
  const oldLoc = db.data.locations.find((l) => l.name === oldLocation)
  if (oldLoc) {
    oldLoc.assetCount = Math.max(0, (oldLoc.assetCount || 1) - 1)
  }
  
  const newLoc = db.data.locations.find((l) => l.name === toLocation)
  if (newLoc) {
    newLoc.assetCount = (newLoc.assetCount || 0) + 1
  }
  
  // Create transfer record
  const transfer = {
    id: `transfer-${Date.now()}`,
    assetId,
    assetName: `${asset.category} - ${asset.brand} ${asset.model}`,
    serialNumber: asset.serialNumber,
    fromLocation: oldLocation,
    toLocation,
    date: new Date().toISOString(),
  }
  
  db.data.transfers.push(transfer)
  await db.write()
  
  // Generate receipt
  const receipt = {
    date: transfer.date,
    fromLocation: oldLocation,
    toLocation,
    assets: [{
      serialNumber: asset.serialNumber,
      category: asset.category,
      fullString: `${asset.category} - ${asset.brand} ${asset.model}`,
    }],
  }
  
  res.json({ transfer, receipt })
})

app.post('/api/transfers/bulk', authMiddleware, async (req, res) => {
  const { assetIds, toLocation } = req.body
  
  const transfers = []
  const receiptAssets = []
  
  assetIds.forEach((assetId) => {
    const asset = db.data.assets.find((a) => a.id === assetId)
    if (asset) {
      const oldLocation = asset.location
      asset.location = toLocation
      asset.updatedAt = new Date().toISOString()
      
      // Update location counts
      const oldLoc = db.data.locations.find((l) => l.name === oldLocation)
      if (oldLoc) {
        oldLoc.assetCount = Math.max(0, (oldLoc.assetCount || 1) - 1)
      }
      
      const newLoc = db.data.locations.find((l) => l.name === toLocation)
      if (newLoc) {
        newLoc.assetCount = (newLoc.assetCount || 0) + 1
      }
      
      const transfer = {
        id: `transfer-${Date.now()}-${assetId}`,
        assetId,
        assetName: `${asset.category} - ${asset.brand} ${asset.model}`,
        serialNumber: asset.serialNumber,
        fromLocation: oldLocation,
        toLocation,
        date: new Date().toISOString(),
      }
      
      transfers.push(transfer)
      db.data.transfers.push(transfer)
      
      receiptAssets.push({
        serialNumber: asset.serialNumber,
        category: asset.category,
        fullString: `${asset.category} - ${asset.brand} ${asset.model}`,
      })
    }
  })
  
  await db.write()
  
  const receipt = {
    date: new Date().toISOString(),
    fromLocation: null,
    toLocation,
    assets: receiptAssets,
  }
  
  res.json({ transfers, receipt })
})

app.delete('/api/transfers/:id', authMiddleware, async (req, res) => {
  const index = db.data.transfers.findIndex((t) => t.id === req.params.id)
  if (index === -1) {
    return res.status(404).json({ message: 'گواستنەوە نەدۆزرایەوە' })
  }
  
  db.data.transfers.splice(index, 1)
  await db.write()
  res.json({ message: 'لۆگی گواستنەوە سڕایەوە' })
})

// Statistics routes
app.get('/api/stats/dashboard', authMiddleware, (req, res) => {
  const now = new Date()
  const thisMonth = now.getMonth()
  const thisYear = now.getFullYear()
  
  const assetsThisMonth = db.data.assets.filter((a) => {
    const created = new Date(a.createdAt)
    return created.getMonth() === thisMonth && created.getFullYear() === thisYear
  }).length
  
  const transfersThisMonth = db.data.transfers.filter((t) => {
    const created = new Date(t.date)
    return created.getMonth() === thisMonth && created.getFullYear() === thisYear
  }).length
  
  const recentTransfers = db.data.transfers
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)
  
  res.json({
    totalAssets: db.data.assets.length,
    totalLocations: db.data.locations.length,
    totalTransfers: db.data.transfers.length,
    activeAssets: db.data.assets.filter((a) => a.status === 'چالاک').length,
    assetsThisMonth,
    transfersThisMonth,
    recentTransfers,
  })
})

// Maintenance routes
app.get('/api/maintenance', authMiddleware, (req, res) => {
  res.json(db.data.maintenance || [])
})

app.get('/api/maintenance/:id', authMiddleware, (req, res) => {
  const record = (db.data.maintenance || []).find((m) => m.id === req.params.id)
  if (!record) {
    return res.status(404).json({ message: 'تۆمار نەدۆزرایەوە' })
  }
  res.json(record)
})

app.post('/api/maintenance', authMiddleware, async (req, res) => {
  if (!db.data.maintenance) {
    db.data.maintenance = []
  }
  
  const record = {
    id: `maintenance-${Date.now()}`,
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  
  db.data.maintenance.push(record)
  await db.write()
  res.status(201).json(record)
})

app.put('/api/maintenance/:id', authMiddleware, async (req, res) => {
  if (!db.data.maintenance) {
    db.data.maintenance = []
  }
  
  const index = db.data.maintenance.findIndex((m) => m.id === req.params.id)
  if (index === -1) {
    return res.status(404).json({ message: 'تۆمار نەدۆزرایەوە' })
  }
  
  const oldRecord = db.data.maintenance[index]
  const updatedRecord = {
    ...oldRecord,
    ...req.body,
    id: oldRecord.id,
    updatedAt: new Date().toISOString(),
  }
  
  db.data.maintenance[index] = updatedRecord
  await db.write()
  res.json(updatedRecord)
})

app.delete('/api/maintenance/:id', authMiddleware, async (req, res) => {
  if (!db.data.maintenance) {
    db.data.maintenance = []
  }
  
  const index = db.data.maintenance.findIndex((m) => m.id === req.params.id)
  if (index === -1) {
    return res.status(404).json({ message: 'تۆمار نەدۆزرایەوە' })
  }
  
  db.data.maintenance.splice(index, 1)
  await db.write()
  res.json({ message: 'تۆمار سڕایەوە' })
})

app.post('/api/maintenance/bulk-delete', authMiddleware, async (req, res) => {
  if (!db.data.maintenance) {
    db.data.maintenance = []
  }
  
  const { ids } = req.body
  
  ids.forEach((id) => {
    const index = db.data.maintenance.findIndex((m) => m.id === id)
    if (index !== -1) {
      db.data.maintenance.splice(index, 1)
    }
  })
  
  await db.write()
  res.json({ message: 'تۆمارەکان سڕانەوە' })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})
