import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  flexRender,
} from '@tanstack/react-table'
import {
  Search,
  Plus,
  Download,
  Trash2,
  Edit,
  ArrowRightLeft,
  ChevronDown,
  ChevronUp,
  Columns,
  Package,
  MapPin,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  RotateCcw,
} from 'lucide-react'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'
import { motion } from 'framer-motion'
import { assetsAPI } from '@/services/api'
import { useUIStore } from '@/store/useStore'
import { buildFullAssetString, debounce } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Checkbox } from '@/components/ui/Checkbox'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { AssetFormDialog } from './AssetFormDialog'
import { TransferDialog } from './TransferDialog'
import { ConfirmDialog } from './ConfirmDialog'
import { cn } from '@/lib/utils'
import { DataTableFilterPopover } from '@/components/ui/data-table/DataTableFilterPopover'
import { DataTableFilterChips } from '@/components/ui/data-table/DataTableFilterChips'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/ContextMenu'
import { useFilterStore } from '@/store/useFilterStore'
import { enterpriseFilterFn } from '@/lib/filterEngine'

function ColumnVisibilityMenu({ table }) {
  const [open, setOpen] = useState(false)
  const setColumnOrder = useUIStore((state) => state.setColumnOrder)
  const resetTableSettings = useUIStore((state) => state.resetTableSettings)

  const handleToggleColumn = (column) => {
    column.toggleVisibility()
  }

  const moveColumn = (columnId, direction) => {
    const currentOrder = table.getState().columnOrder?.length
      ? table.getState().columnOrder
      : table.getAllLeafColumns().map((column) => column.id)
    const currentIndex = currentOrder.indexOf(columnId)
    if (currentIndex === -1) return
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (targetIndex < 0 || targetIndex >= currentOrder.length) return
    const nextOrder = [...currentOrder]
    const [item] = nextOrder.splice(currentIndex, 1)
    nextOrder.splice(targetIndex, 0, item)
    setColumnOrder(nextOrder)
  }

  return (
    <div className="relative">
      <Button variant="outline" onClick={() => setOpen(!open)}>
        <Columns className="h-4 w-4" />
        ستوونەکان
      </Button>
      {open && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-full mt-2 w-64 rounded-md border bg-card p-4 shadow-lg z-50">
            <div className="mb-3 flex items-center justify-between border-b pb-2">
              <span className="text-xs text-muted-foreground">پیشاندان / ڕیزبەندی</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  resetTableSettings()
                  table.resetColumnOrder()
                }}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                ڕیسێت
              </Button>
            </div>
            <div className="space-y-2">
              {table.getAllLeafColumns().map((column) => {
                if (column.id === 'select' || column.id === 'actions' || column.id === 'rowNumber') return null
                return (
                  <div 
                    key={column.id} 
                    className="flex items-center gap-2 hover:bg-muted/50 p-1 rounded"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleToggleColumn(column)
                    }}
                  >
                    <Checkbox
                      checked={column.getIsVisible()}
                      readOnly
                    />
                    <span className="text-sm flex-1">{column.columnDef.header}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        moveColumn(column.id, 'up')
                      }}
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        moveColumn(column.id, 'down')
                      }}
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  )
}

const EMPTY_ARRAY = []

export function LocationProfile({ location, onBack }) {
  const queryClient = useQueryClient()
  const [globalFilter, setGlobalFilter] = useState('')
  const [rowSelection, setRowSelection] = useState({})
  
  // Enterprise Filter State
  const tableFilters = useFilterStore(state => state.tableFilters['location-profile'] || EMPTY_ARRAY)
  const setTableFilters = (updater) => useFilterStore.getState().setColumnFilters('location-profile', updater)
  
  const tableSorting = useFilterStore(state => state.tableSorting['location-profile'] || EMPTY_ARRAY)
  const setTableSorting = (updater) => useFilterStore.getState().setColumnSorting('location-profile', updater)
  const [editingAsset, setEditingAsset] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isTransferOpen, setIsTransferOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [transferAssets, setTransferAssets] = useState([])
  const columnVisibility = useUIStore((state) => state.columnVisibility)
  const setColumnVisibility = useUIStore((state) => state.setColumnVisibility)
  const columnOrder = useUIStore((state) => state.columnOrder)
  const setColumnOrder = useUIStore((state) => state.setColumnOrder)
  const columnSizing = useUIStore((state) => state.columnSizing)
  const setColumnSizing = useUIStore((state) => state.setColumnSizing)

  const { data: allAssets = EMPTY_ARRAY, isLoading } = useQuery({
    queryKey: ['assets'],
    queryFn: assetsAPI.getAll,
  })

  // Filter assets for this location - use useMemo to prevent recalculation
  const assets = useMemo(
    () => allAssets.filter(asset => asset.location === location.name),
    [allAssets, location.name]
  )

  const deleteMutation = useMutation({
    mutationFn: assetsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['assets'])
      queryClient.invalidateQueries(['locations'])
      toast.success('کەرەستە سڕایەوە')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: assetsAPI.bulkDelete,
    onSuccess: () => {
      queryClient.invalidateQueries(['assets'])
      queryClient.invalidateQueries(['locations'])
      setRowSelection({})
      toast.success('کەرەستەکان سڕانەوە')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const columns = useMemo(
    () => [
      {
        id: 'select',
        enableColumnFilter: false,
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllRowsSelected()}
            onClick={(e) => {
              e.stopPropagation()
              table.toggleAllRowsSelected(!table.getIsAllRowsSelected())
            }}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onClick={(e) => {
              e.stopPropagation()
              row.toggleSelected(!row.getIsSelected())
            }}
          />
        ),
      },
      {
        id: 'rowNumber',
        enableColumnFilter: false,
        header: 'ژ',
        cell: ({ row }) => <span>{row.index + 1}</span>,
      },
      {
        accessorKey: 'user',
        header: 'بەکارهێنەر',
        filterFn: enterpriseFilterFn,
      },
      {
        accessorKey: 'fullString',
        header: 'وەسفی تەواوی',
        filterFn: enterpriseFilterFn,
        cell: ({ row }) => buildFullAssetString(row.original),
      },
      {
        accessorKey: 'category',
        header: 'جۆر',
        filterFn: enterpriseFilterFn,
      },
      {
        accessorKey: 'brand',
        header: 'براند',
        filterFn: enterpriseFilterFn,
      },
      {
        accessorKey: 'model',
        header: 'مۆدێل',
        filterFn: enterpriseFilterFn,
      },
      {
        accessorKey: 'cpu',
        header: 'CPU',
        filterFn: enterpriseFilterFn,
      },
      {
        accessorKey: 'ram',
        header: 'RAM',
        filterFn: enterpriseFilterFn,
      },
      {
        accessorKey: 'storage',
        header: 'Storage',
        filterFn: enterpriseFilterFn,
      },
      {
        id: 'macSerial',
        header: 'MAC/Serial',
        filterFn: enterpriseFilterFn,
        accessorFn: (row) => `${row.macAddress || ''} ${row.serialNumber || ''}`,
        cell: ({ row }) => (
          <div className="text-xs">
            {row.original.macAddress && <div>MAC: {row.original.macAddress}</div>}
            {row.original.serialNumber && <div>S/N: {row.original.serialNumber}</div>}
          </div>
        ),
      },
      {
        accessorKey: 'notes',
        header: 'تێبینی',
        filterFn: enterpriseFilterFn,
      },
      {
        id: 'actions',
        header: 'کردارەکان',
        enableColumnFilter: false,
        cell: ({ row }) => (
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setEditingAsset(row.original)
                setIsFormOpen(true)
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setTransferAssets([row.original])
                setIsTransferOpen(true)
              }}
            >
              <ArrowRightLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setDeleteTarget({ type: 'single', id: row.original.id })
                setIsDeleteDialogOpen(true)
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ),
      },
    ],
    [setEditingAsset, setIsFormOpen, setTransferAssets, setIsTransferOpen]
  )

  const table = useReactTable({
    data: assets,
    columns,
    state: {
      globalFilter,
      columnFilters: tableFilters,
      sorting: tableSorting,
      rowSelection,
      columnVisibility,
      columnOrder,
      columnSizing,
    },
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setTableFilters,
    onSortingChange: setTableSorting,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    onColumnSizingChange: setColumnSizing,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  const selectedRows = table.getSelectedRowModel().rows
  const selectedAssets = selectedRows.map((row) => row.original)

  const handleExport = () => {
    const dataToExport = selectedAssets.length > 0 ? selectedAssets : assets
    const ws = XLSX.utils.json_to_sheet(dataToExport)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Assets')
    XLSX.writeFile(wb, `${location.name}-assets-${Date.now()}.xlsx`)
    toast.success('فایل هەناردە کرا')
  }

  const handleSearch = (value) => {
    setGlobalFilter(value)
  }

  const debouncedSearch = useMemo(
    () => debounce(handleSearch, 300),
    []
  )

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center gap-4">
          {/* Location Info */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-md border shrink-0">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-bold leading-tight">{location.name}</h2>
              <p className="text-xs text-muted-foreground">{assets.length} کەرەستە</p>
            </div>
          </div>
          
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="گەڕان بە ژمارەی زنجیرە، جۆر، براند، مۆدێل..."
              onChange={(e) => debouncedSearch(e.target.value)}
              className="pr-10 h-10"
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              disabled={selectedAssets.length === 0}
              onClick={() => {
                setTransferAssets(selectedAssets)
                setIsTransferOpen(true)
              }}
            >
              <ArrowRightLeft className="h-4 w-4" />
              گواستنەوە ({selectedAssets.length})
            </Button>
            <Button
              variant="destructive"
              disabled={selectedAssets.length === 0}
              onClick={() => {
                setDeleteTarget({ type: 'bulk', ids: selectedAssets.map((a) => a.id), count: selectedAssets.length })
                setIsDeleteDialogOpen(true)
              }}
            >
              <Trash2 className="h-4 w-4" />
              سڕینەوە ({selectedAssets.length})
            </Button>
            <ColumnVisibilityMenu table={table} />
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4" />
              هەناردە
            </Button>
            <Button onClick={() => {
              setEditingAsset(null)
              setIsFormOpen(true)
            }}>
              <Plus className="h-4 w-4" />
              زیادکردنی کەرەستە
            </Button>
          </div>
          
          {/* Divider */}
          <div className="h-8 w-px bg-border" />
          
          {/* Back Button */}
          <Button variant="destructive" onClick={onBack} className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
            گەڕانەوە
          </Button>
        </div>
      </div>

      {/* Table */}
      <DataTableFilterChips table={table} />
      <ScrollArea className="flex-1">
        <div className="max-w-none">
          {isLoading ? (
            <div className="p-4">
              <TableSkeleton />
            </div>
          ) : (
            <table className="bg-card" style={{ tableLayout: 'fixed', width: table.getTotalSize() }}>
              <thead className="bg-card sticky top-0 z-10 border-b">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-3 text-right text-sm font-medium border-b relative group"
                        style={{ width: header.getSize() }}
                      >
                        {header.isPlaceholder ? null : (
                          <div className="flex items-center gap-1 justify-end w-full">
                            <div
                              className={cn(
                                'flex items-center gap-2 cursor-pointer select-none'
                              )}
                              onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                            >
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                              {header.column.getIsSorted() === 'asc' && (
                                <ChevronUp className="h-3.5 w-3.5" />
                              )}
                              {header.column.getIsSorted() === 'desc' && (
                                <ChevronDown className="h-3.5 w-3.5" />
                              )}
                            </div>
                            {header.column.getCanFilter() && (
                              <DataTableFilterPopover column={header.column} />
                            )}
                          </div>
                        )}
                        {header.column.getCanResize() && (
                          <div
                            onMouseDown={header.getResizeHandler()}
                            onTouchStart={header.getResizeHandler()}
                            onDoubleClick={() => header.column.resetSize()}
                            className={cn(
                              "absolute top-0 -left-2 w-4 h-full cursor-col-resize z-20 flex justify-center touch-none select-none",
                              header.column.getIsResizing() && "is-resizing"
                            )}
                          >
                            <div className={cn(
                              "h-full w-[2px] transition-colors duration-200",
                              header.column.getIsResizing() ? "bg-primary" : "bg-transparent group-hover:bg-border/50 hover:!bg-primary"
                            )} />
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => row.toggleSelected()}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const value = cell.getValue()
                      return (
                        <td key={cell.id} className="px-4 py-3 text-sm" style={{ width: cell.column.getSize() }}>
                          <ContextMenu>
                            <ContextMenuTrigger asChild>
                              <div className="w-full h-full min-h-[1.5rem]">
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </div>
                            </ContextMenuTrigger>
                            <ContextMenuContent>
                              <ContextMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (value !== undefined && cell.column.getCanFilter()) {
                                    cell.column.setFilterValue({ facetedValues: [String(value ?? '')], conditions: [] })
                                  }
                                }}
                              >
                                پاڵاوتن بەم بەهایە
                              </ContextMenuItem>
                              <ContextMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (value !== undefined && cell.column.getCanFilter()) {
                                    cell.column.setFilterValue({ 
                                      facetedValues: [], 
                                      conditions: [{ operator: 'notEquals', value: String(value ?? '') }] 
                                    })
                                  }
                                }}
                              >
                                دەرکردنی ئەم بەهایە
                              </ContextMenuItem>
                              <ContextMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  cell.column.setFilterValue(undefined)
                                }}
                              >
                                سڕینەوەی پاڵاوتن
                              </ContextMenuItem>
                            </ContextMenuContent>
                          </ContextMenu>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!isLoading && assets.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="mb-4">هیچ کەرەستەیەک لەم شوێنە نییە</p>
              <Button
                onClick={() => {
                  setEditingAsset(null)
                  setIsFormOpen(true)
                }}
              >
                <Plus className="h-4 w-4" />
                زیادکردنی یەکەم کەرەستە
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Dialogs */}
      <AssetFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        asset={editingAsset}
        defaultLocation={location.name}
        onSuccess={() => {
          setIsFormOpen(false)
          setEditingAsset(null)
          queryClient.invalidateQueries(['assets'])
          queryClient.invalidateQueries(['locations'])
        }}
      />

      <TransferDialog
        open={isTransferOpen}
        onOpenChange={setIsTransferOpen}
        assets={transferAssets}
        onSuccess={() => {
          setIsTransferOpen(false)
          setTransferAssets([])
          setRowSelection({})
          queryClient.invalidateQueries(['assets'])
          queryClient.invalidateQueries(['locations'])
        }}
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={() => {
          if (deleteTarget?.type === 'single') {
            deleteMutation.mutate(deleteTarget.id, {
              onSettled: () => {
                setIsDeleteDialogOpen(false)
                setDeleteTarget(null)
              }
            })
          } else if (deleteTarget?.type === 'bulk') {
            bulkDeleteMutation.mutate(deleteTarget.ids, {
              onSettled: () => {
                setIsDeleteDialogOpen(false)
                setDeleteTarget(null)
                setRowSelection({})
              }
            })
          }
        }}
        title={deleteTarget?.type === 'bulk' ? `سڕینەوەی ${deleteTarget.count} کەرەستە` : 'سڕینەوەی کەرەستە'}
        message={deleteTarget?.type === 'bulk' 
          ? `دڵنیای لە سڕینەوەی ${deleteTarget.count} کەرەستە؟ ئەم کردارە ناگەڕێتەوە.`
          : 'دڵنیای لە سڕینەوەی ئەم کەرەستەیە؟ ئەم کردارە ناگەڕێتەوە.'
        }
        isLoading={deleteMutation.isPending || bulkDeleteMutation.isPending}
      />
    </div>
  )
}
