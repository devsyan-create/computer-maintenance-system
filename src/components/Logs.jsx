import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { 
  ScrollText, 
  Filter, 
  User, 
  Calendar, 
  Activity,
  RefreshCw,
  Search,
} from 'lucide-react'
import { logsAPI } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { cn } from '@/lib/utils'

const ACTION_LABELS = {
  login: 'چوونەژوورەوە',
  logout: 'دەرچوون',
  create_asset: 'دروستکردنی کەرەستە',
  update_asset: 'نوێکردنەوەی کەرەستە',
  delete_asset: 'سڕینەوەی کەرەستە',
  bulk_delete_assets: 'سڕینەوەی کۆمەڵە کەرەستە',
  create_location: 'دروستکردنی شوێن',
  update_location: 'نوێکردنەوەی شوێن',
  delete_location: 'سڕینەوەی شوێن',
  create_transfer: 'گواستنەوە',
  bulk_transfer: 'گواستنەوەی کۆمەڵە',
  delete_transfer: 'سڕینەوەی لۆگی گواستنەوە',
  create_maintenance: 'دروستکردنی تۆماری صیانە',
  update_maintenance: 'نوێکردنەوەی تۆماری صیانە',
  delete_maintenance: 'سڕینەوەی تۆماری صیانە',
  bulk_delete_maintenance: 'سڕینەوەی کۆمەڵە تۆماری صیانە',
  create_brand: 'دروستکردنی براند',
  update_brand: 'نوێکردنەوەی براند',
  delete_brand: 'سڕینەوەی براند',
  create_category: 'دروستکردنی کاتێگۆری',
  update_category: 'نوێکردنەوەی کاتێگۆری',
  delete_category: 'سڕینەوەی کاتێگۆری',
  create_maintenance_type: 'دروستکردنی جۆری صیانە',
  update_maintenance_type: 'نوێکردنەوەی جۆری صیانە',
  delete_maintenance_type: 'سڕینەوەی جۆری صیانە',
  create_maintenance_location: 'دروستکردنی شوێنی صیانە',
  update_maintenance_location: 'نوێکردنەوەی شوێنی صیانە',
  delete_maintenance_location: 'سڕینەوەی شوێنی صیانە',
}

const MODULE_LABELS = {
  auth: 'سیستەم',
  assets: 'کەرەستەکان',
  locations: 'شوێنەکان',
  transfers: 'گواستنەوەکان',
  maintenance: 'صیانەکردن',
  settings: 'ڕێکخستن',
}

const getActionColor = (action) => {
  if (action.includes('create')) return 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400'
  if (action.includes('update')) return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
  if (action.includes('delete')) return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
  if (action === 'login') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
  if (action === 'logout') return 'bg-gray-100 text-gray-700 dark:bg-gray-950 dark:text-gray-400'
  return 'bg-primary/10 text-primary'
}

export function Logs() {
  const [filterModule, setFilterModule] = useState('all')
  const [filterUser, setFilterUser] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const { data: logs = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ['logs'],
    queryFn: () => logsAPI.getAll(200),
  })

  // Get unique users and modules for filters
  const users = [...new Set(logs.map(log => log.userEmail))].filter(Boolean)
  const modules = [...new Set(logs.map(log => log.module))].filter(Boolean)

  // Filter logs
  const filteredLogs = logs.filter(log => {
    if (filterModule !== 'all' && log.module !== filterModule) return false
    if (filterUser !== 'all' && log.userEmail !== filterUser) return false
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      return (
        log.userName?.toLowerCase().includes(search) ||
        log.userEmail?.toLowerCase().includes(search) ||
        ACTION_LABELS[log.action]?.toLowerCase().includes(search) ||
        MODULE_LABELS[log.module]?.toLowerCase().includes(search)
      )
    }
    return true
  })

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'ئێستا'
    
    try {
      // Handle Realtime Database timestamp (number in milliseconds)
      if (typeof timestamp === 'number') {
        const date = new Date(timestamp)
        return format(date, 'yyyy/MM/dd - HH:mm:ss', { locale: ar })
      }
      // Handle Firestore timestamp
      if (timestamp.toDate) {
        const date = timestamp.toDate()
        return format(date, 'yyyy/MM/dd - HH:mm:ss', { locale: ar })
      }
      // Handle ISO string
      if (typeof timestamp === 'string') {
        const date = new Date(timestamp)
        return format(date, 'yyyy/MM/dd - HH:mm:ss', { locale: ar })
      }
      return 'نادیار'
    } catch {
      return 'نادیار'
    }
  }

  const formatDetails = (details) => {
    if (!details || typeof details !== 'object') return null
    
    const items = []
    
    // Asset details
    if (details.name) items.push(`ناو: ${details.name}`)
    if (details.assetName) items.push(`کەرەستە: ${details.assetName}`)
    if (details.serialNumber) items.push(`ژمارەی زنجیرە: ${details.serialNumber}`)
    if (details.category) items.push(`جۆر: ${details.category}`)
    if (details.brand) items.push(`براند: ${details.brand}`)
    if (details.model) items.push(`مۆدێل: ${details.model}`)
    
    // Transfer details - show direction clearly
    if (details.from && details.to) {
      items.push(`گواستنەوە: ${details.from} → ${details.to}`)
    } else if (details.to) {
      items.push(`بۆ: ${details.to}`)
    } else if (details.from) {
      items.push(`لە: ${details.from}`)
    }
    
    // Date for transfers
    if (details.date) {
      try {
        const date = new Date(details.date)
        const formatted = date.toLocaleDateString('en-GB')
        items.push(`بەروار: ${formatted}`)
      } catch {
        // Ignore invalid dates
      }
    }
    
    // Counts
    if (details.count) items.push(`ژمارە: ${details.count}`)
    if (details.assetCount) items.push(`${details.assetCount} کەرەستە`)
    if (details.transferCount) items.push(`${details.transferCount} گواستنەوە`)
    
    // Assets array (for bulk operations)
    if (details.assets && Array.isArray(details.assets) && details.assets.length > 0) {
      const assetsList = details.assets
        .map(a => {
          const parts = []
          if (a.serialNumber) parts.push(a.serialNumber)
          if (a.category) parts.push(a.category)
          if (a.brand) parts.push(a.brand)
          return parts.join(' - ')
        })
        .filter(Boolean)
        .slice(0, 3) // Show max 3 items
      
      if (assetsList.length > 0) {
        items.push(`کەرەستەکان: ${assetsList.join(' • ')}`)
        if (details.assets.length > 3) {
          items.push(`و ${details.assets.length - 3} کەرەستەی تر...`)
        }
      }
    }
    
    return items.length > 0 ? items.join(' • ') : null
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <ScrollText className="h-6 w-6" />
                لۆگەکانی سیستەم
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                تۆمارکردنی هەموو کردارەکان لە سیستەمدا
              </p>
            </div>
            <Button 
              onClick={() => refetch()} 
              disabled={isFetching}
              size="sm"
            >
              <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
              نوێکردنەوە
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">کۆی لۆگەکان</p>
                    <p className="text-2xl font-bold">{filteredLogs.length}</p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Activity className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">بەکارهێنەران</p>
                    <p className="text-2xl font-bold">{users.length}</p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">مۆدیولەکان</p>
                    <p className="text-2xl font-bold">{modules.length}</p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <ScrollText className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Filter className="h-4 w-4" />
                فلتەرکردن و گەڕان
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="گەڕان لە لۆگەکان..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">مۆدیول</label>
                  <Select value={filterModule} onChange={(e) => setFilterModule(e.target.value)}>
                    <option value="all">هەموو مۆدیولەکان</option>
                    {modules.map(module => (
                      <option key={module} value={module}>
                        {MODULE_LABELS[module] || module}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">بەکارهێنەر</label>
                  <Select value={filterUser} onChange={(e) => setFilterUser(e.target.value)}>
                    <option value="all">هەموو بەکارهێنەران</option>
                    {users.map(user => (
                      <option key={user} value={user}>
                        {user}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logs List */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center justify-between">
                <span>لیستی کردارەکان</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {filteredLogs.length} تۆمار
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="text-center py-12">
                  <ScrollText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
                  <p className="text-muted-foreground">هیچ لۆگێک نەدۆزرایەوە</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={cn(
                            "px-2.5 py-1 rounded-md text-xs font-medium",
                            getActionColor(log.action)
                          )}>
                            {ACTION_LABELS[log.action] || log.action}
                          </span>
                          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground">
                            {MODULE_LABELS[log.module] || log.module}
                          </span>
                        </div>
                        
                        {formatDetails(log.details) && (
                          <p className="text-sm text-muted-foreground">
                            {formatDetails(log.details)}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {log.userName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatTimestamp(log.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  )
}
