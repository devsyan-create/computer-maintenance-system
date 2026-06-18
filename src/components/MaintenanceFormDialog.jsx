import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { maintenanceAPI } from '@/services/api'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/config/firebase'

export function MaintenanceFormDialog({ open, onOpenChange, record, defaultYear, defaultMonth, onSuccess }) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    location: '',
    department: '',
    maintenanceType: '',
    month: `${new Date().getMonth() + 1}`,
    year: `${new Date().getFullYear()}`,
    cost: '',
    details: '',
  })

  // Load locations and types from Firestore
  const [locations, setLocations] = useState([])
  const [types, setTypes] = useState([])
  const [isLoadingOptions, setIsLoadingOptions] = useState(false)

  useEffect(() => {
    if (open) {
      loadOptions()
      
      // Set form data
      if (record) {
        setFormData({
          location: record.location || '',
          department: record.department || '',
          maintenanceType: record.maintenanceType || '',
          month: `${record.month || new Date(record.createdAt || Date.now()).getMonth() + 1}`,
          year: `${record.year || new Date(record.createdAt || Date.now()).getFullYear()}`,
          cost: record.cost || '',
          details: record.details || '',
        })
      } else {
        setFormData({
          location: '',
          department: '',
          maintenanceType: '',
          month: defaultMonth ? `${defaultMonth}` : `${new Date().getMonth() + 1}`,
          year: defaultYear || `${new Date().getFullYear()}`,
          cost: '',
          details: '',
        })
      }
    }
  }, [open, record, defaultYear, defaultMonth])

  const loadOptions = async () => {
    setIsLoadingOptions(true)
    try {
      const [locationsSnap, typesSnap] = await Promise.all([
        getDocs(collection(db, 'maintenanceLocations')),
        getDocs(collection(db, 'maintenanceTypes')),
      ])
      
      setLocations(locationsSnap.docs.map(doc => doc.data().name))
      setTypes(typesSnap.docs.map(doc => doc.data().name))
    } catch (error) {
      console.error('Error loading options:', error)
    } finally {
      setIsLoadingOptions(false)
    }
  }

  const createMutation = useMutation({
    mutationFn: maintenanceAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['maintenance'])
      toast.success('تۆمار زیادکرا')
      onSuccess()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => maintenanceAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['maintenance'])
      toast.success('تۆمار نوێکرایەوە')
      onSuccess()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (record) {
      updateMutation.mutate({ id: record.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>
            {record ? 'دەستکاریکردنی تۆمار' : 'زیادکردنی تۆماری نوێ'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">شوێن *</label>
            <Select
              value={formData.location}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, location: e.target.value }))
              }
              required
            >
              <option value="">هەڵبژاردنی شوێن</option>
              {locations.map((location, index) => (
                <option key={index} value={location}>
                  {location}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">بەش-هۆبە</label>
            <Input
              value={formData.department}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, department: e.target.value }))
              }
              placeholder="بەش یان هۆبە..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">جۆری کاری چاککردنەوە *</label>
            <Select
              value={formData.maintenanceType}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, maintenanceType: e.target.value }))
              }
              required
            >
              <option value="">هەڵبژاردنی جۆری کار</option>
              {types.map((type, index) => (
                <option key={index} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">ساڵ *</label>
              <Select
                value={formData.year}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, year: e.target.value }))
                }
                required
                disabled={defaultYear !== null && defaultYear !== undefined}
              >
                {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((year) => (
                  <option key={year} value={`${year}`}>
                    {year}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">مانگ *</label>
              <Select
                value={formData.month}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, month: e.target.value }))
                }
                required
                disabled={defaultMonth !== null && defaultMonth !== undefined}
              >
                <option value="1">مانگی یەک</option>
                <option value="2">مانگی دوو</option>
                <option value="3">مانگی سێ</option>
                <option value="4">مانگی چوار</option>
                <option value="5">مانگی پێنج</option>
                <option value="6">مانگی شەش</option>
                <option value="7">مانگی حەوت</option>
                <option value="8">مانگی هەشت</option>
                <option value="9">مانگی نۆ</option>
                <option value="10">مانگی دە</option>
                <option value="11">مانگی یازدە</option>
                <option value="12">مانگی دوازدە</option>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">تێچوون</label>
            <Input
              type="number"
              min="0"
              value={formData.cost}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, cost: e.target.value }))
              }
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">وردەکاری</label>
            <Input
              value={formData.details}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, details: e.target.value }))
              }
              placeholder="زانیاری زیاتر..."
            />
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              پاشگەزبوونەوە
            </Button>
            <Button type="submit">
              {record ? 'نوێکردنەوە' : 'زیادکردن'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
