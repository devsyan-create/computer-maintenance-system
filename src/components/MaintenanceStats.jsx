import { useState, useMemo, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table'
import {
  Search,
  Plus,
  Download,
  Trash2,
  Edit,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Calendar,
  Wallet,
  ArrowLeft,
} from 'lucide-react'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'
import { maintenanceAPI } from '@/services/api'
import { debounce } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Checkbox } from '@/components/ui/Checkbox'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { Select } from '@/components/ui/Select'
import { Card, CardContent } from '@/components/ui/Card'
import { MaintenanceFormDialog } from './MaintenanceFormDialog'
import { ConfirmDialog } from './ConfirmDialog'
import { cn } from '@/lib/utils'

const MONTHS = [
  'مانگی یەک',
  'مانگی دوو',
  'مانگی سێ',
  'مانگی چوار',
  'مانگی پێنج',
  'مانگی شەش',
  'مانگی حەوت',
  'مانگی هەشت',
  'مانگی نۆ',
  'مانگی دە',
  'مانگی یازدە',
  'مانگی دوازدە',
]

export function MaintenanceStats() {
  const queryClient = useQueryClient()
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState([])
  const [rowSelection, setRowSelection] = useState({})
  const [editingRecord, setEditingRecord] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [selectedYear, setSelectedYear] = useState(`${new Date().getFullYear()}`)
  const [selectedMonth, setSelectedMonth] = useState(null) // null means overview mode

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['maintenance'],
    queryFn: maintenanceAPI.getAll,
  })

  const deleteMutation = useMutation({
    mutationFn: maintenanceAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['maintenance'])
      toast.success('تۆمار سڕایەوە')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: maintenanceAPI.bulkDelete,
    onSuccess: () => {
      queryClient.invalidateQueries(['maintenance'])
      setRowSelection({})
      toast.success('تۆمارەکان سڕانەوە')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const columns = useMemo(
    () => [
      {
        id: 'select',
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
        header: 'ژ',
        cell: ({ row }) => <span>{row.index + 1}</span>,
      },
      {
        accessorKey: 'year',
        header: 'ساڵ',
      },
      {
        accessorKey: 'month',
        header: 'مانگ',
        cell: ({ row }) => MONTHS[Number(row.original.month || 1) - 1] || '-',
      },
      {
        accessorKey: 'location',
        header: 'شوێن',
      },
      {
        accessorKey: 'department',
        header: 'بەش-هۆبە',
      },
      {
        accessorKey: 'maintenanceType',
        header: 'جۆری کاری چاککردنەوە',
      },
      {
        accessorKey: 'cost',
        header: 'تێچوون',
        cell: ({ row }) => row.original.cost || '-',
      },
      {
        accessorKey: 'locationAndType',
        header: 'شوێن و جۆری کار',
        cell: ({ row }) => (
          <div className="text-sm">
            <div className="font-medium">{row.original.location}</div>
            <div className="text-muted-foreground">{row.original.maintenanceType}</div>
          </div>
        ),
      },
      {
        accessorKey: 'details',
        header: 'وردەکاری',
      },
      {
        id: 'actions',
        header: 'کردارەکان',
        cell: ({ row }) => (
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setEditingRecord(row.original)
                setIsFormOpen(true)
              }}
            >
              <Edit className="h-4 w-4" />
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
    []
  )

  const yearOptions = useMemo(() => {
    const sourceYears = records
      .map((item) => Number(item.year || new Date(item.createdAt || Date.now()).getFullYear()))
      .filter(Boolean)
    const currentYear = new Date().getFullYear()
    const years = new Set([currentYear, currentYear + 1, currentYear + 2, ...sourceYears])
    return [...years].sort((a, b) => b - a).map((year) => `${year}`)
  }, [records])

  const filteredByYear = useMemo(
    () =>
      records.filter((item) => {
        const year = Number(item.year || new Date(item.createdAt || Date.now()).getFullYear())
        return `${year}` === selectedYear
      }),
    [records, selectedYear]
  )

  const filteredRecords = useMemo(
    () => {
      if (selectedMonth === null) return filteredByYear
      return filteredByYear.filter((item) => Number(item.month || 1) === selectedMonth)
    },
    [filteredByYear, selectedMonth]
  )

  const monthlyStats = useMemo(
    () =>
      MONTHS.map((name, idx) => {
        const monthNumber = idx + 1
        const monthRecords = filteredByYear.filter((item) => Number(item.month || 1) === monthNumber)
        const totalCost = monthRecords.reduce((sum, item) => sum + Number(item.cost || 0), 0)
        return {
          monthNumber,
          name,
          count: monthRecords.length,
          totalCost,
        }
      }),
    [filteredByYear]
  )

  const table = useReactTable({
    data: filteredRecords,
    columns,
    state: {
      globalFilter,
      sorting,
      rowSelection,
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const selectedRows = table.getSelectedRowModel().rows
  const selectedRecords = selectedRows.map((row) => row.original)

  const handleExport = () => {
    const dataToExport = selectedRecords.length > 0 ? selectedRecords : filteredRecords
    const ws = XLSX.utils.json_to_sheet(dataToExport)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Maintenance')
    const filename = selectedMonth !== null 
      ? `maintenance-${MONTHS[selectedMonth - 1]}-${selectedYear}-${Date.now()}.xlsx`
      : `maintenance-stats-${Date.now()}.xlsx`
    XLSX.writeFile(wb, filename)
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
          <div className="flex items-center gap-2 shrink-0">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold leading-tight">
                {selectedMonth !== null ? `${MONTHS[selectedMonth - 1]} - ${selectedYear}` : 'ئاماری صیانەکردن'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {selectedMonth !== null ? `تۆماری کارەکانی ${MONTHS[selectedMonth - 1]}` : 'بەڕێوەبردنی تۆماری صیانەکردن'}
              </p>
            </div>
          </div>
          
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="گەڕان لە تۆمارەکان..."
              onChange={(e) => debouncedSearch(e.target.value)}
              className="pr-10"
            />
          </div>
          
          <div className="flex gap-2 shrink-0">
            {selectedMonth !== null && (
              <Button
                variant="outline"
                onClick={() => setSelectedMonth(null)}
              >
                <ArrowLeft className="h-4 w-4" />
                گەڕانەوە
              </Button>
            )}
            <Button
              variant="destructive"
              disabled={selectedRecords.length === 0}
              onClick={() => {
                setDeleteTarget({ type: 'bulk', ids: selectedRecords.map((r) => r.id), count: selectedRecords.length })
                setIsDeleteDialogOpen(true)
              }}
            >
              <Trash2 className="h-4 w-4" />
              سڕینەوە ({selectedRecords.length})
            </Button>
            {selectedMonth !== null && (
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4" />
                هەناردە
              </Button>
            )}
            <Button
              onClick={() => {
                setEditingRecord(null)
                setIsFormOpen(true)
              }}
            >
              <Plus className="h-4 w-4" />
              زیادکردنی تۆمار
            </Button>
          </div>
        </div>
      </div>

      {selectedMonth === null && (
        <>
          <div className="p-4 border-b bg-muted/30">
            <div className="max-w-xs">
              <div className="space-y-2">
                <label className="text-sm font-medium">ساڵی ئامار</label>
                <Select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>

          <div className="p-4 border-b bg-background">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {monthlyStats.map((item) => (
                <Card 
                  key={item.monthNumber} 
                  className="border-primary/10 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedMonth(item.monthNumber)}
                >
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm">{item.name}</p>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-2xl font-bold">{item.count}</p>
                    <p className="text-xs text-muted-foreground">ژمارەی تۆمارەکان</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground border-t pt-2">
                      <Wallet className="h-3.5 w-3.5" />
                      کۆی تێچوون: {item.totalCost}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Table - Only show when a month is selected */}
      {selectedMonth !== null && (
        <ScrollArea className="flex-1">
          <div className="max-w-none">
            <table className="w-full">
              <thead className="bg-card sticky top-0 z-10 border-b">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-3 text-right text-sm font-medium border-b"
                      >
                        {header.isPlaceholder ? null : (
                          <div
                            className={cn(
                              'flex items-center gap-2',
                              header.column.getCanSort() && 'cursor-pointer select-none'
                            )}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {header.column.getIsSorted() === 'asc' && (
                              <ChevronUp className="h-4 w-4" />
                            )}
                            {header.column.getIsSorted() === 'desc' && (
                              <ChevronDown className="h-4 w-4" />
                            )}
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
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 text-sm">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            {!isLoading && filteredRecords.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>هیچ تۆمارێک نییە لەم مانگەدا</p>
              </div>
            )}
          </div>
        </ScrollArea>
      )}

      {/* Dialogs */}
      <MaintenanceFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        record={editingRecord}
        defaultYear={selectedYear}
        defaultMonth={selectedMonth}
        onSuccess={() => {
          setIsFormOpen(false)
          setEditingRecord(null)
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
        title={deleteTarget?.type === 'bulk' ? `سڕینەوەی ${deleteTarget.count} تۆمار` : 'سڕینەوەی تۆمار'}
        message={deleteTarget?.type === 'bulk' 
          ? `دڵنیای لە سڕینەوەی ${deleteTarget.count} تۆمار؟ ئەم کردارە ناگەڕێتەوە.`
          : 'دڵنیای لە سڕینەوەی ئەم تۆمارە؟ ئەم کردارە ناگەڕێتەوە.'
        }
        isLoading={deleteMutation.isPending || bulkDeleteMutation.isPending}
      />
    </div>
  )
}
