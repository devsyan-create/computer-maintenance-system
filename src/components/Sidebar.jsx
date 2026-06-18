import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Package,
  MapPin,
  ArrowRightLeft,
  ChevronRight,
  ChevronLeft,
  LogOut,
  Settings,
  BarChart3,
  User,
  ScrollText,
} from 'lucide-react'
import { useUIStore, useAuthStore } from '@/store/useStore'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const menuItems = [
  { icon: LayoutDashboard, label: 'داشبۆرد', path: '/' },
  { icon: MapPin, label: 'شوێنەکان', path: '/locations' },
  { icon: Package, label: 'کۆی کەرەستەکان', path: '/assets' },
  { icon: ArrowRightLeft, label: 'گواستنەوەکان', path: '/transfers' },
  { icon: BarChart3, label: 'ئاماری صیانەکردن', path: '/stats' },
  { icon: ScrollText, label: 'لۆگەکان', path: '/logs' },
  { icon: Settings, label: 'ڕێکخستن', path: '/settings' },
]

// Helper function to get user display name
const getUserDisplayName = (email) => {
  const userMap = {
    'dler@syana.com': 'دلێر احمد',
    'imad@syana.com': 'عماد احمد',
    'azher@syana.com': 'ئاژێر صلاح',
  }
  return userMap[email] || email
}

export function Sidebar({ currentPath, onNavigate }) {
  const sidebarMode = useUIStore((state) => state.sidebarMode)
  const setSidebarMode = useUIStore((state) => state.setSidebarMode)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const toggleSidebar = () => {
    if (sidebarMode === 'full') {
      setSidebarMode('icon')
    } else if (sidebarMode === 'icon') {
      setSidebarMode('full')
    }
  }

  const isFull = sidebarMode === 'full'
  const isIcon = sidebarMode === 'icon'

  if (sidebarMode === 'hidden') {
    return null
  }

  const displayName = user?.email ? getUserDisplayName(user.email) : 'بەکارهێنەر'

  return (
    <motion.aside
      initial={false}
      animate={{
        width: isFull ? 280 : 80,
      }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="bg-card border-l border-border flex flex-col"
    >
      {/* Header */}
      <div className="px-4 py-[1.3125rem] border-b border-border flex items-center justify-between">
        {isFull && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-bold text-lg"
          >
            صیانەی کۆمپیوتەر
          </motion.div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={cn(isIcon && 'mx-auto')}
        >
          {isFull ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>

      {/* User Info */}
      <div className={cn(
        "px-4 py-3 border-b border-border bg-muted/30",
        isIcon && "px-2"
      )}>
        {isFull ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <User className="h-5 w-5 text-primary" />
          </div>
        )}
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPath === item.path

          return (
            <Button
              key={item.path}
              variant={isActive ? 'default' : 'ghost'}
              className={cn(
                'w-full justify-start',
                isIcon && 'justify-center px-0'
              )}
              onClick={() => onNavigate(item.path)}
            >
              <Icon className="h-5 w-5" />
              {isFull && <span className="mr-2">{item.label}</span>}
            </Button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10',
            isIcon && 'justify-center px-0'
          )}
          onClick={logout}
        >
          <LogOut className="h-5 w-5" />
          {isFull && <span className="mr-2">دەرچوون</span>}
        </Button>
      </div>
    </motion.aside>
  )
}
