import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { assetsAPI, locationsAPI } from '@/services/api'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/config/firebase'

export function AssetFormDialog({ open, onOpenChange, asset, defaultLocation, onSuccess }) {
  const queryClient = useQueryClient()
  const [isInitialized, setIsInitialized] = useState(false)
  
  const [formData, setFormData] = useState({
    category: '',
    brand: '',
    model: '',
    cpu: '',
    ram: '',
    storage: '',
    macAddress: '',
    location: '',
    user: '',
    status: 'چالاک',
    notes: '',
  })

  const { data: locations = [], isLoading: locationsLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: locationsAPI.getAll,
    enabled: open,
  })

  // Load categories and brands from Firestore
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [isLoadingOptions, setIsLoadingOptions] = useState(false)
  
  useEffect(() => {
    if (open) {
      loadOptions()
    }
  }, [open])

  const loadOptions = async () => {
    setIsLoadingOptions(true)
    try {
      const [categoriesSnap, brandsSnap] = await Promise.all([
        getDocs(collection(db, 'categories')),
        getDocs(collection(db, 'brands')),
      ])
      
      setCategories(categoriesSnap.docs.map(doc => doc.data().name))
      setBrands(brandsSnap.docs.map(doc => doc.data().name))
    } catch (error) {
      console.error('Error loading options:', error)
    } finally {
      setIsLoadingOptions(false)
    }
  }

  useEffect(() => {
    if (open && !isInitialized) {
      if (asset) {
        setFormData(asset)
      } else {
        setFormData({
          category: '',
          brand: '',
          model: '',
          cpu: '',
          ram: '',
          storage: '',
          macAddress: '',
          location: defaultLocation || '',
          user: '',
          status: 'چالاک',
          notes: '',
        })
      }
      setIsInitialized(true)
    }
    
    if (!open && isInitialized) {
      setIsInitialized(false)
    }
  }, [open, asset, defaultLocation, isInitialized])

  const mutation = useMutation({
    mutationFn: (data) =>
      asset ? assetsAPI.update(asset.id, data) : assetsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['assets'])
      toast.success(asset ? 'کەرەستە نوێکرایەوە' : 'کەرەستە زیادکرا')
      onSuccess()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    // Add defaultLocation if provided
    const dataToSubmit = {
      ...formData,
      location: defaultLocation || formData.location,
    }
    mutation.mutate(dataToSubmit)
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-5xl"
        onClose={() => onOpenChange(false)}
      >
        <DialogHeader>
          <DialogTitle>
            {asset ? 'دەستکاریکردنی کەرەستە' : 'زیادکردنی کەرەستەی نوێ'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {defaultLocation && (
            <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-sm">
                <span className="font-medium">شوێن:</span> {defaultLocation}
              </p>
            </div>
          )}

          {asset && (
            <div className="p-3 bg-muted rounded-lg border">
              <p className="text-sm">
                <span className="font-medium">ژمارەی زنجیرە:</span> {asset.serialNumber}
              </p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">جۆر *</label>
              <Select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                required
              >
                <option value="">هەڵبژێرە</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">براند</label>
              <Select
                value={formData.brand}
                onChange={(e) => handleChange('brand', e.target.value)}
              >
                <option value="">هەڵبژێرە</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">مۆدێل</label>
              <Input
                value={formData.model}
                onChange={(e) => handleChange('model', e.target.value)}
                placeholder="Latitude 5420"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">CPU</label>
              <Input
                value={formData.cpu}
                onChange={(e) => handleChange('cpu', e.target.value)}
                placeholder="Intel i5-1135G7"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">RAM</label>
              <Input
                value={formData.ram}
                onChange={(e) => handleChange('ram', e.target.value)}
                placeholder="8GB DDR4"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Storage</label>
              <Input
                value={formData.storage}
                onChange={(e) => handleChange('storage', e.target.value)}
                placeholder="256GB SSD"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">MAC Address</label>
              <Input
                value={formData.macAddress}
                onChange={(e) => handleChange('macAddress', e.target.value)}
                placeholder="00:1A:2B:3C:4D:5E"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">بەکارهێنەر</label>
              <Input
                value={formData.user}
                onChange={(e) => handleChange('user', e.target.value)}
                placeholder="ناوی بەکارهێنەر"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">دۆخ</label>
              <Select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
              >
                <option value="چالاک">چالاک</option>
                <option value="ناچالاک">ناچالاک</option>
                <option value="چاککردنەوە">چاککردنەوە</option>
              </Select>
            </div>

            {!defaultLocation && (
              <div className="space-y-2">
                <label className="text-sm font-medium">شوێن *</label>
                <Select
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  required
                >
                  <option value="">هەڵبژێرە</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.name}>
                      {loc.name}
                    </option>
                  ))}
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">تێبینی</label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="تێبینی زیادە..."
            />
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              پاشگەزبوونەوە
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  چاوەڕوانبە...
                </>
              ) : asset ? (
                'نوێکردنەوە'
              ) : (
                'زیادکردن'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
