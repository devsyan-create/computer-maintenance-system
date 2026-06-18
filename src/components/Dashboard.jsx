import { useQuery } from '@tanstack/react-query'
import { Package, MapPin, ArrowRightLeft, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { statsAPI } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

function StatCard({ icon: Icon, title, value, trend, loading }) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <Skeleton className="h-32" />
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-md hover:border-primary/50 transition-all h-full">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{value}</h3>
                <p className="text-sm text-muted-foreground">{title}</p>
              </div>
            </div>
          </div>
          {trend && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>{trend}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: statsAPI.getDashboard,
  })

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold leading-tight">داشبۆرد</h1>
              <p className="text-sm text-muted-foreground">پێشاندانی ئاماری گشتی</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8 overflow-auto flex-1">

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Package}
          title="کۆی کەرەستەکان"
          value={stats?.totalAssets || 0}
          trend={`${stats?.assetsThisMonth || 0} ئەم مانگە`}
          loading={isLoading}
        />
        <StatCard
          icon={MapPin}
          title="شوێنەکان"
          value={stats?.totalLocations || 0}
          loading={isLoading}
        />
        <StatCard
          icon={ArrowRightLeft}
          title="گواستنەوەکان"
          value={stats?.totalTransfers || 0}
          trend={`${stats?.transfersThisMonth || 0} ئەم مانگە`}
          loading={isLoading}
        />
        <StatCard
          icon={Package}
          title="کەرەستەی چالاک"
          value={stats?.activeAssets || 0}
          loading={isLoading}
        />
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>چالاکی دوایی</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : stats?.recentTransfers?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentTransfers.map((transfer) => (
                <div
                  key={transfer.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <p className="font-medium">{transfer.assetName}</p>
                    <p className="text-sm text-muted-foreground">
                      {transfer.fromLocation} ← {transfer.toLocation}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(transfer.date).toLocaleDateString('ku')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              هیچ چالاکییەک نییە
            </p>
          )}
        </CardContent>
      </Card>
    </div>
    </div>
  )
}
