import { useState } from 'react'
import { Settings as SettingsIcon, Tags, MapPin, Wrench, Award } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { CategoriesDialog } from './CategoriesDialog'
import { BrandsDialog } from './BrandsDialog'
import { MaintenanceLocationsDialog } from './MaintenanceLocationsDialog'
import { MaintenanceTypesDialog } from './MaintenanceTypesDialog'

export function Settings() {
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
  const [isBrandsOpen, setIsBrandsOpen] = useState(false)
  const [isMaintenanceLocationsOpen, setIsMaintenanceLocationsOpen] = useState(false)
  const [isMaintenanceTypesOpen, setIsMaintenanceTypesOpen] = useState(false)

  const settingsCards = [
    {
      id: 'asset-categories',
      title: 'جۆرەکانی کەرەستە',
      description: 'بەڕێوەبردنی جۆرەکانی کەرەستە',
      icon: Tags,
      onClick: () => setIsCategoriesOpen(true),
    },
    {
      id: 'asset-brands',
      title: 'براندەکان',
      description: 'بەڕێوەبردنی براندەکانی کەرەستە',
      icon: Award,
      onClick: () => setIsBrandsOpen(true),
    },
    {
      id: 'maintenance-locations',
      title: 'شوێنەکانی صیانەکردن',
      description: 'بەڕێوەبردنی شوێنەکان بۆ ئاماری صیانەکردن',
      icon: MapPin,
      onClick: () => setIsMaintenanceLocationsOpen(true),
    },
    {
      id: 'maintenance-types',
      title: 'جۆرەکانی کاری چاککردنەوە',
      description: 'بەڕێوەبردنی جۆرەکانی کاری صیانەکردن',
      icon: Wrench,
      onClick: () => setIsMaintenanceTypesOpen(true),
    },
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <SettingsIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold leading-tight">ڕێکخستن</h1>
              <p className="text-sm text-muted-foreground">ڕێکخستنەکانی سیستەم</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8 overflow-auto flex-1">
        {/* Settings Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {settingsCards.map((setting) => {
            const Icon = setting.icon
            return (
              <div
                key={setting.id}
                style={{ opacity: 1, transform: 'none' }}
              >
                <div
                  className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md hover:border-primary/50 transition-all h-full cursor-pointer"
                  onClick={setting.onClick}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{setting.title}</h3>
                          <p className="text-sm text-muted-foreground">{setting.description}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-xs text-primary pt-2 border-t bg-primary/5 -mx-4 -mb-4 px-4 pb-4 rounded-b-lg">
                      <span>کلیک بکە بۆ بەڕێوەبردن</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Info Section */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="text-2xl font-semibold leading-none tracking-tight">دەربارەی سیستەم</h3>
          </div>
          <div className="p-6 pt-0">
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">ناوی سیستەم:</span>
                <span className="font-medium">Inventory OS</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">وەشان:</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">وەسف:</span>
                <span className="font-medium">سیستەمی بەڕێوەبردنی کەرەستە و صیانەکردن</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <CategoriesDialog
        open={isCategoriesOpen}
        onOpenChange={setIsCategoriesOpen}
      />

      <BrandsDialog
        open={isBrandsOpen}
        onOpenChange={setIsBrandsOpen}
      />

      <MaintenanceLocationsDialog
        open={isMaintenanceLocationsOpen}
        onOpenChange={setIsMaintenanceLocationsOpen}
      />

      <MaintenanceTypesDialog
        open={isMaintenanceTypesOpen}
        onOpenChange={setIsMaintenanceTypesOpen}
      />
    </div>
  )
}
