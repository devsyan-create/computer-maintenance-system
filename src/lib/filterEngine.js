import { isBefore, isAfter, isSameDay, startOfDay, endOfDay } from 'date-fns'

export const enterpriseFilterFn = (row, columnId, filterValue) => {
  if (!filterValue) return true

  const cellValue = row.getValue(columnId)

  // Support simple string search (fallback)
  if (typeof filterValue === 'string') {
    return String(cellValue ?? '').toLowerCase().includes(filterValue.toLowerCase())
  }

  const { facetedValues, conditions } = filterValue

  // 1. Faceted Values (Checkbox list)
  // If facetedValues is defined and has items, the cellValue must be in the list
  if (facetedValues && facetedValues.length > 0) {
    if (!facetedValues.includes(String(cellValue ?? ''))) {
      return false
    }
  }

  // 2. Conditions (e.g. contains, >, <, equals)
  if (conditions && conditions.length > 0) {
    let result = evaluateCondition(cellValue, conditions[0])

    for (let i = 1; i < conditions.length; i++) {
      const cond = conditions[i]
      const condResult = evaluateCondition(cellValue, cond)
      
      if (cond.logic === 'OR' || cond.logic === 'or') {
        result = result || condResult
      } else {
        // Default to AND
        result = result && condResult
      }
    }

    if (!result) return false
  }

  return true
}

const evaluateCondition = (cellValue, { operator, value }) => {
  const strValue = String(cellValue ?? '').toLowerCase()
  const strFilter = String(value ?? '').toLowerCase()
  const numValue = Number(cellValue)
  const numFilter = Number(value)

  switch (operator) {
    // Text
    case 'contains': return strValue.includes(strFilter)
    case 'notContains': return !strValue.includes(strFilter)
    case 'startsWith': return strValue.startsWith(strFilter)
    case 'endsWith': return strValue.endsWith(strFilter)
    case 'equals': return strValue === strFilter
    case 'notEquals': return strValue !== strFilter
    case 'isEmpty': return strValue === '' || cellValue == null
    case 'isNotEmpty': return strValue !== '' && cellValue != null
    
    // Numbers
    case 'numEquals': return numValue === numFilter
    case 'numNotEquals': return numValue !== numFilter
    case 'gt': return numValue > numFilter
    case 'gte': return numValue >= numFilter
    case 'lt': return numValue < numFilter
    case 'lte': return numValue <= numFilter
    
    // Dates
    case 'dateEquals':
      if (!cellValue) return false
      return isSameDay(new Date(cellValue), new Date(value))
    case 'beforeDate':
      if (!cellValue) return false
      return isBefore(new Date(cellValue), startOfDay(new Date(value)))
    case 'afterDate':
      if (!cellValue) return false
      return isAfter(new Date(cellValue), endOfDay(new Date(value)))
      
    // Boolean
    case 'isTrue': return cellValue === true || strValue === 'true'
    case 'isFalse': return cellValue === false || strValue === 'false'

    default:
      return true
  }
}
