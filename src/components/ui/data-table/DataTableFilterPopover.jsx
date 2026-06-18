import React, { useState, useMemo } from 'react'
import { Filter, ArrowDown, ArrowUp, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { Checkbox } from '@/components/ui/Checkbox'

export function DataTableFilterPopover({ column }) {
  const currentFilter = column.getFilterValue() || { conditions: [], facetedValues: [] }
  
  const handleSort = (desc) => {
    column.toggleSorting(desc)
  }

  const condition = currentFilter.conditions?.[0] || { operator: 'contains', value: '' }
  const [operator, setOperator] = useState(condition.operator)
  const [condValue, setCondValue] = useState(condition.value)

  const facets = column.getFacetedUniqueValues()
  const facetEntries = useMemo(() => {
    if (!facets) return []
    return Array.from(facets.entries()).sort((a, b) => {
      const valA = String(a[0] ?? '')
      const valB = String(b[0] ?? '')
      return valA.localeCompare(valB)
    })
  }, [facets])

  const [facetSearch, setFacetSearch] = useState('')
  const filteredFacets = facetEntries.filter(([val]) => String(val ?? '').toLowerCase().includes(facetSearch.toLowerCase()))

  const selectedFacets = currentFilter.facetedValues || []

  const applyFilter = (facets, cond) => {
    const conditions = cond.value || ['isEmpty', 'isNotEmpty'].includes(cond.operator) ? [cond] : []
    if (facets.length === 0 && conditions.length === 0) {
      column.setFilterValue(undefined)
    } else {
      column.setFilterValue({ facetedValues: facets, conditions })
    }
  }

  const toggleFacet = (val) => {
    const strVal = String(val ?? '')
    let newFacets = [...selectedFacets]
    if (newFacets.includes(strVal)) {
      newFacets = newFacets.filter(v => v !== strVal)
    } else {
      newFacets.push(strVal)
    }
    applyFilter(newFacets, { operator, value: condValue })
  }

  const toggleAll = () => {
    if (selectedFacets.length === facetEntries.length) {
      applyFilter([], { operator, value: condValue })
    } else {
      applyFilter(facetEntries.map(([v]) => String(v ?? '')), { operator, value: condValue })
    }
  }

  const handleApplyCondition = (e) => {
    const val = e.target.value
    setCondValue(val)
    applyFilter(selectedFacets, { operator, value: val })
  }

  const handleOperatorChange = (e) => {
    const val = e.target.value
    setOperator(val)
    applyFilter(selectedFacets, { operator: val, value: condValue })
  }

  const clearFilter = () => {
    setOperator('contains')
    setCondValue('')
    setFacetSearch('')
    column.setFilterValue(undefined)
  }

  const isActive = currentFilter.conditions?.length > 0 || currentFilter.facetedValues?.length > 0

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className={`h-6 w-6 ml-1 flex-shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
          <Filter className="h-3.5 w-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0 bg-card border shadow-xl" align="start" onClick={(e) => e.stopPropagation()}>
        {/* Sorting */}
        <div className="p-2 border-b flex flex-col gap-1">
          <Button variant="ghost" className="justify-start h-8 px-2 text-xs" onClick={() => handleSort(false)}>
            <ArrowUp className="mr-2 h-3.5 w-3.5" /> ڕیزبەندی (A → Z)
          </Button>
          <Button variant="ghost" className="justify-start h-8 px-2 text-xs" onClick={() => handleSort(true)}>
            <ArrowDown className="mr-2 h-3.5 w-3.5" /> ڕیزبەندی (Z → A)
          </Button>
        </div>

        {/* Condition Filter */}
        <div className="p-2 border-b">
          <div className="text-xs font-semibold mb-2 px-1 text-muted-foreground">پاڵاوتنی دەق/ژمارە</div>
          <div className="flex flex-col gap-2">
            <select 
              value={operator} 
              onChange={handleOperatorChange}
              className="flex h-8 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="contains">تێیدایە (Contains)</option>
              <option value="equals">یەکسانە (Equals)</option>
              <option value="notContains">تێیدانیە (Not Contains)</option>
              <option value="startsWith">دەستپێدەکات بە</option>
              <option value="endsWith">کۆتاییدێت بە</option>
              <option value="isEmpty">بەتاڵە (Empty)</option>
              <option value="isNotEmpty">بەتاڵ نیە</option>
              <option value="gt">گەورەترە لە (&gt;)</option>
              <option value="lt">بچوکترە لە (&lt;)</option>
              <option value="numEquals">ژمارە یەکسانە (=)</option>
            </select>
            {!['isEmpty', 'isNotEmpty'].includes(operator) && (
              <Input 
                className="h-8 text-xs" 
                placeholder="بەهای پاڵاوتن..." 
                value={condValue}
                onChange={handleApplyCondition}
              />
            )}
          </div>
        </div>

        {/* Faceted Checklist */}
        <div className="p-2">
          <div className="relative mb-2">
            <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input 
              className="h-8 text-xs pr-7" 
              placeholder="گەڕان لە ناو لیست..." 
              value={facetSearch}
              onChange={(e) => setFacetSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 px-2 py-1.5 hover:bg-muted rounded-sm cursor-pointer" onClick={toggleAll}>
            <Checkbox 
              checked={selectedFacets.length === facetEntries.length && facetEntries.length > 0} 
            />
            <span className="text-xs font-medium">(دیاریکردنی هەمووی)</span>
          </div>
          <ScrollArea className="h-40 mt-1">
            <div className="flex flex-col pr-2 space-y-1">
              {filteredFacets.map(([val, count]) => {
                const isChecked = selectedFacets.includes(String(val ?? ''))
                return (
                  <div 
                    key={String(val)} 
                    className="flex items-center justify-between px-2 py-1.5 hover:bg-muted rounded-sm cursor-pointer"
                    onClick={() => toggleFacet(val)}
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox checked={isChecked} />
                      <span className="text-xs truncate max-w-[130px]">{val === '' || val == null ? '(بەتاڵ)' : String(val)}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground bg-muted-foreground/10 px-1.5 rounded">{count}</span>
                  </div>
                )
              })}
              {filteredFacets.length === 0 && (
                <div className="text-xs text-center text-muted-foreground py-4">هیچ نەدۆزرایەوە</div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Actions */}
        {isActive && (
          <div className="p-2 border-t bg-muted/30">
            <Button variant="ghost" className="w-full h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={clearFilter}>
              <X className="h-3.5 w-3.5 mr-1" /> سڕینەوەی پاڵاوتن
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
