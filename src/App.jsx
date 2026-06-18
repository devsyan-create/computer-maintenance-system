import { useState } from 'react'
import { Toaster } from 'sonner'
import { useAuthStore, useUIStore } from '@/store/useStore'
import { Login } from '@/components/Login'
import { Sidebar } from '@/components/Sidebar'
import { Dashboard } from '@/components/Dashboard'
import { AssetsTable } from '@/components/AssetsTable'
import { Locations } from '@/components/Locations'
import { Transfers } from '@/components/Transfers'
import { MaintenanceStats } from '@/components/MaintenanceStats'
import { Logs } from '@/components/Logs'
import { Settings } from '@/components/Settings'

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [currentPath, setCurrentPath] = useState('/')
  
  // test

  if (!isAuthenticated) {
    return (
      <>
        <Login />
        <Toaster position="top-center" richColors />
      </>
    )
  }

  const renderContent = () => {
    switch (currentPath) {
      case '/':
        return <Dashboard />
      case '/assets':
        return <AssetsTable />
      case '/locations':
        return <Locations />
      case '/transfers':
        return <Transfers />
      case '/stats':
        return <MaintenanceStats />
      case '/logs':
        return <Logs />
      case '/settings':
        return <Settings />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar currentPath={currentPath} onNavigate={setCurrentPath} />
      <main className="flex-1 overflow-hidden flex flex-col">
        {renderContent()}
      </main>
      <Toaster position="top-center" richColors />
    </div>
  )
}

export default App
