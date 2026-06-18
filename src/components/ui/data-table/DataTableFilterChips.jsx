import React from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function DataTableFilterChips({ table }) {
  const columnFilters = table.getState().columnFilters

  if (!columnFilters || columnFilters.length === 0) return null

  const getFilterLabel = (columnId, filterValue) => {
    const column = table.getColumn(columnId)
    // Sometimes header is a function, if it is, we just show columnId
    let headerName = columnId
    if (column?.columnDef?.header && typeof column.columnDef.header === 'string') {
      headerName = column.columnDef.header
    }
    
    // Fallback if filterValue is just string (from simple filter)
    if (typeof filterValue === 'string') {
      return `${headerName}: ${filterValue}`
    }
    
    const conditions = filterValue?.conditions || []
    const faceted = filterValue?.facetedValues || []
    
    let labels = []
    
    if (faceted.length > 0) {
      if (faceted.length <= 3) {
        labels.push(`${headerName}: ${faceted.join(', ')}`)
      } else {
        labels.push(`${headerName}: ${faceted.length} دیاریکراوە`)
      }
    }
    
    if (conditions.length > 0) {
      const cond = conditions[0]
      const opLabel = getOperatorLabel(cond.operator)
      if (['isEmpty', 'isNotEmpty'].includes(cond.operator)) {
         labels.push(`${headerName} ${opLabel}`)
      } else {
         labels.push(`${headerName} ${opLabel} "${cond.value}"`)
      }
    }
    
    return labels.join(' | ') || `${headerName}: پاڵێوراوە`
  }

  const getOperatorLabel = (op) => {
    switch (op) {
      case 'contains': return 'دەگرێتەوە'
      case 'equals': return '='
      case 'notContains': return 'نایگرێتەوە'
      case 'startsWith': return 'دەستپێدەکات بە'
      case 'endsWith': return 'کۆتاییدێت بە'
      case 'isEmpty': return 'بەتاڵە'
      case 'isNotEmpty': return 'بەتاڵ نیە'
      case 'gt': return '>'
      case 'lt': return '<'
      case 'numEquals': return '='
      default: return op
    }
  }

  return (
    <div className="flex flex-wrap gap-2 items-center px-4 py-2 border-b bg-muted/20">
      <span className="text-xs text-muted-foreground font-medium">پاڵاوتنەکان:</span>
      {columnFilters.map((filter) => (
        <div key={filter.id} className="flex items-center gap-1 bg-primary/10 text-primary pl-1 pr-2 py-1 rounded-full text-xs font-medium border border-primary/20 shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 hover:bg-primary/20 rounded-full"
            onClick={() => {
              table.getColumn(filter.id)?.setFilterValue(undefined)
            }}
          >
            <X className="h-2.5 w-2.5" />
          </Button>
          <span className="max-w-[200px] truncate">{getFilterLabel(filter.id, filter.value)}</span>
        </div>
      ))}
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-6 text-xs text-muted-foreground hover:text-foreground hover:bg-muted ml-auto"
        onClick={() => table.resetColumnFilters()}
      >
        سڕینەوەی هەمووی
      </Button>
    </div>
  )
}
