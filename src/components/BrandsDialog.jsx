import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit, Check, X, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ConfirmDialog } from './ConfirmDialog'
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/config/firebase'

export function BrandsDialog({ open, onOpenChange }) {
  const [brands, setBrands] = useState([])
  const [newBrand, setNewBrand] = useState('')
  const [editingIndex, setEditingIndex] = useState(null)
  const [editingValue, setEditingValue] = useState('')
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteIndex, setDeleteIndex] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (open) {
      loadBrands()
    }
  }, [open])

  const loadBrands = async () => {
    setIsLoading(true)
    try {
      const querySnapshot = await getDocs(collection(db, 'brands'))
      const data = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        name: doc.data().name 
      }))
      setBrands(data)
    } catch (error) {
      console.error('Error loading brands:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdd = async () => {
    if (!newBrand.trim() || brands.some(b => b.name === newBrand.trim())) {
      return
    }
    
    setIsAdding(true)
    try {
      const docRef = await addDoc(collection(db, 'brands'), {
        name: newBrand.trim(),
        createdAt: serverTimestamp(),
      })
      setBrands([...brands, { id: docRef.id, name: newBrand.trim() }])
      setNewBrand('')
    } catch (error) {
      console.error('Error adding brand:', error)
    } finally {
      setIsAdding(false)
    }
  }

  const handleDelete = (index) => {
    setDeleteIndex(index)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    setIsDeleting(true)
    try {
      const brand = brands[deleteIndex]
      await deleteDoc(doc(db, 'brands', brand.id))
      setBrands(brands.filter((_, i) => i !== deleteIndex))
      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error('Error deleting brand:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEdit = (index) => {
    setEditingIndex(index)
    setEditingValue(brands[index].name)
  }

  const handleSaveEdit = async () => {
    if (!editingValue.trim() || brands.some((b, i) => b.name === editingValue.trim() && i !== editingIndex)) {
      return
    }
    
    setIsSaving(true)
    try {
      const brand = brands[editingIndex]
      await updateDoc(doc(db, 'brands', brand.id), {
        name: editingValue.trim(),
        updatedAt: serverTimestamp(),
      })
      const updated = [...brands]
      updated[editingIndex] = { ...brand, name: editingValue.trim() }
      setBrands(updated)
      setEditingIndex(null)
      setEditingValue('')
    } catch (error) {
      console.error('Error updating brand:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingIndex(null)
    setEditingValue('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>بەڕێوەبردنی براندەکان</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Add new brand */}
          <div className="flex gap-2">
            <Input
              value={newBrand}
              onChange={(e) => setNewBrand(e.target.value)}
              placeholder="براندی نوێ زیاد بکە..."
              disabled={isAdding}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAdd()
                }
              }}
            />
            <Button onClick={handleAdd} disabled={isAdding || !newBrand.trim()}>
              {isAdding ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  چاوەڕێ بە...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  زیادکردن
                </>
              )}
            </Button>
          </div>

          {/* Brands list */}
          <div className="border rounded-lg divide-y max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                چاوەڕوان بە...
              </div>
            ) : brands.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                هیچ براندێک نییە
              </div>
            ) : (
              brands.map((brand, index) => (
                <div
                  key={brand.id}
                  className="flex items-center justify-between p-3 hover:bg-muted/50"
                >
                  {editingIndex === index ? (
                    <>
                      <Input
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        className="flex-1 ml-2"
                        autoFocus
                        disabled={isSaving}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveEdit()
                          } else if (e.key === 'Escape') {
                            handleCancelEdit()
                          }
                        }}
                      />
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleSaveEdit}
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4 text-green-600" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleCancelEdit}
                          disabled={isSaving}
                        >
                          <X className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="font-medium">{brand.name}</span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(index)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={() => onOpenChange(false)}>داخستن</Button>
          </div>
        </div>
      </DialogContent>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="سڕینەوەی براند"
        message="دڵنیای لە سڕینەوەی ئەم براندە؟ ئەم کردارە ناگەڕێتەوە."
        isLoading={isDeleting}
      />
    </Dialog>
  )
}
