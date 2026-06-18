import { useState, useMemo, useRef, useEffect, forwardRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit, Trash2, MapPin, Eye, Search, MoreVertical, Palette, GripVertical } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay, defaultDropAnimationSideEffects } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { locationsAPI, assetsAPI } from '@/services/api'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { LocationProfile } from './LocationProfile'
import { ConfirmDialog } from './ConfirmDialog'

const COLORS = [
  { class: 'bg-primary', text: 'text-primary', border: 'border-primary', bgLight: 'bg-primary/10' },
  { class: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500', bgLight: 'bg-blue-500/10' },
  { class: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-500', bgLight: 'bg-emerald-500/10' },
  { class: 'bg-violet-500', text: 'text-violet-500', border: 'border-violet-500', bgLight: 'bg-violet-500/10' },
  { class: 'bg-rose-500', text: 'text-rose-500', border: 'border-rose-500', bgLight: 'bg-rose-500/10' },
  { class: 'bg-amber-500', text: 'text-amber-500', border: 'border-amber-500', bgLight: 'bg-amber-500/10' },
  { class: 'bg-slate-500', text: 'text-slate-500', border: 'border-slate-500', bgLight: 'bg-slate-500/10' },
]

const LocationCardContent = forwardRef(({ location, assetCount, onEdit, onDelete, onView, onColorChange, dragHandleProps, isDragging, isOverlay, style }, ref) => {
  const [showMenu, setShowMenu] = useState(false)
  const [showColors, setShowColors] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false)
        setShowColors(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedColor = COLORS.find(c => c.class === location.color) || COLORS[0]

  return (
    <div ref={ref} style={style} className={`h-full relative ${showMenu ? 'z-20' : 'z-0'} ${isDragging ? 'opacity-40 grayscale z-0' : ''} ${isOverlay ? 'scale-105 shadow-2xl rotate-2 z-50 cursor-grabbing' : ''}`}>
      <Card className={`cursor-pointer hover:shadow-md transition-all h-full relative overflow-visible border-t-4 ${selectedColor.border}`} onClick={() => onView(location)}>
        <CardContent className="p-4 flex flex-col h-full">
          <div className="flex items-start justify-between mb-3 gap-2">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className={`h-12 w-12 shrink-0 rounded-lg ${selectedColor.bgLight} flex items-center justify-center transition-colors`}>
                <MapPin className={`h-6 w-6 ${selectedColor.text} transition-colors`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg leading-tight mb-1 break-words">{location.name}</h3>
                <p className="text-sm text-muted-foreground whitespace-nowrap">{assetCount} کەرەستە</p>
              </div>
            </div>
            <div className="flex gap-1 shrink-0 relative" ref={menuRef} onClick={(e) => e.stopPropagation()}>
              <div {...dragHandleProps} className={`cursor-grab hover:bg-muted p-2 rounded-md flex items-center justify-center -ml-2 ${isOverlay ? 'cursor-grabbing' : ''}`}>
                <GripVertical className="h-5 w-5 text-muted-foreground/50 hover:text-foreground transition-colors" />
              </div>
              <Button variant="ghost" size="icon" onClick={() => { setShowMenu(!showMenu); setShowColors(false) }}>
                <MoreVertical className="h-5 w-5 text-muted-foreground" />
              </Button>
              
              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 top-full mt-1 w-48 rounded-md shadow-lg bg-card border border-border z-50 py-1 overflow-hidden"
                  >
                    {!showColors ? (
                      <>
                        <button onClick={() => setShowColors(true)} className="w-full text-right px-4 py-2 text-sm hover:bg-muted flex items-center gap-2">
                          <Palette className="h-4 w-4" /> گۆڕینی ڕەنگ
                        </button>
                        <button onClick={() => { onEdit(location); setShowMenu(false) }} className="w-full text-right px-4 py-2 text-sm hover:bg-muted flex items-center gap-2">
                          <Edit className="h-4 w-4" /> دەستکاریکردن
                        </button>
                        <button onClick={() => { onDelete(location.id); setShowMenu(false) }} className="w-full text-right px-4 py-2 text-sm text-destructive hover:bg-muted flex items-center gap-2 border-t mt-1 pt-2">
                          <Trash2 className="h-4 w-4" /> سڕینەوە
                        </button>
                      </>
                    ) : (
                      <div className="p-3 grid grid-cols-4 gap-2">
                        {COLORS.map(c => (
                          <button
                            key={c.class}
                            onClick={() => { onColorChange(location, c.class); setShowMenu(false); setShowColors(false) }}
                            className={`h-6 w-6 rounded-full ${c.class} ring-offset-background hover:scale-110 transition-transform ${location.color === c.class ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                            title={c.class}
                          />
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          {location.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3 break-words">
              {location.description}
            </p>
          )}
          <div className="flex items-center gap-2 text-primary text-xs font-medium pt-2 border-t mt-auto">
            <Eye className="h-3.5 w-3.5" />
            <span>کلیک بکە بۆ بینینی کەرەستەکان</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
})

function SortableLocationCard(props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.location.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <LocationCardContent
      ref={setNodeRef}
      style={style}
      isDragging={isDragging}
      dragHandleProps={{ ...attributes, ...listeners }}
      {...props}
    />
  )
}

export function Locations() {
  const queryClient = useQueryClient()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingLocation, setEditingLocation] = useState(null)
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [viewingLocation, setViewingLocation] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteLocationId, setDeleteLocationId] = useState(null)
  const [activeId, setActiveId] = useState(null)

  const { data: locations = [], isLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: locationsAPI.getAll,
  })

  const { data: assets = [] } = useQuery({
    queryKey: ['assets'],
    queryFn: assetsAPI.getAll,
  })

  // Calculate asset count for each location AND SORT by order
  const locationsWithCount = useMemo(() => {
    return locations
      .map(location => ({
        ...location,
        assetCount: assets.filter(asset => asset.location === location.name).length
      }))
      .sort((a, b) => (a.order || 0) - (b.order || 0))
  }, [locations, assets])

  // Filter locations based on search
  const filteredLocations = useMemo(() => {
    if (!searchQuery) return locationsWithCount
    const query = searchQuery.toLowerCase()
    return locationsWithCount.filter(loc => 
      loc.name.toLowerCase().includes(query) ||
      (loc.description && loc.description.toLowerCase().includes(query))
    )
  }, [locationsWithCount, searchQuery])

  const createMutation = useMutation({
    mutationFn: locationsAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['locations'])
      toast.success('شوێن زیادکرا')
      setIsFormOpen(false)
      setFormData({ name: '', description: '' })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => locationsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['locations'])
      queryClient.invalidateQueries(['assets'])
      toast.success('شوێن نوێکرایەوە')
      setIsFormOpen(false)
      setEditingLocation(null)
      setFormData({ name: '', description: '' })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: locationsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['locations'])
      toast.success('شوێن سڕایەوە')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const reorderMutation = useMutation({
    mutationFn: async (updates) => {
      const promises = updates.map(update => locationsAPI.update(update.id, { order: update.order }))
      await Promise.all(promises)
    },
    onMutate: async (updates) => {
      await queryClient.cancelQueries(['locations'])
      const previousLocations = queryClient.getQueryData(['locations'])
      
      queryClient.setQueryData(['locations'], old => {
        if (!old) return old
        const newLocations = [...old]
        updates.forEach(update => {
          const index = newLocations.findIndex(l => l.id === update.id)
          if (index !== -1) {
            newLocations[index] = { ...newLocations[index], order: update.order }
          }
        })
        return newLocations
      })
      
      return { previousLocations }
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['locations'], context.previousLocations)
      toast.error('هەڵەیەک ڕوویدا لە کاتی گۆڕینی ڕیزبەندی')
    },
    onSettled: () => {
      queryClient.invalidateQueries(['locations'])
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingLocation) {
      updateMutation.mutate({ id: editingLocation.id, data: formData })
    } else {
      createMutation.mutate({ ...formData, order: locations.length })
    }
  }

  const handleColorChange = (location, newColor) => {
    updateMutation.mutate({ id: location.id, data: { color: newColor } })
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event) => {
    setActiveId(event.active.id)
  }

  const handleDragCancel = () => {
    setActiveId(null)
  }

  const handleDragEnd = (event) => {
    setActiveId(null)
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = locationsWithCount.findIndex(l => l.id === active.id)
      const newIndex = locationsWithCount.findIndex(l => l.id === over.id)

      const newOrder = arrayMove(locationsWithCount, oldIndex, newIndex)
      
      const updates = newOrder
        .map((loc, index) => {
          if ((loc.order ?? -1) !== index) {
            return { id: loc.id, order: index }
          }
          return null
        })
        .filter(Boolean)

      if (updates.length > 0) {
        reorderMutation.mutate(updates)
      }
    }
  }

  const activeLocation = activeId ? locationsWithCount.find(l => l.id === activeId) : null

  const dropAnimationConfig = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.4',
        },
      },
    }),
  }

  const handleEdit = (location) => {
    setEditingLocation(location)
    setFormData({ name: location.name, description: location.description || '' })
    setIsFormOpen(true)
  }

  const handleDelete = (id) => {
    setDeleteLocationId(id)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    deleteMutation.mutate(deleteLocationId, {
      onSettled: () => {
        setIsDeleteDialogOpen(false)
        setDeleteLocationId(null)
      }
    })
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const handleViewLocation = (location) => {
    setViewingLocation(location)
  }

  // If viewing a location, show its profile
  if (viewingLocation) {
    return (
      <LocationProfile 
        location={viewingLocation} 
        onBack={() => setViewingLocation(null)}
      />
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold leading-tight">شوێنەکان</h1>
              <p className="text-sm text-muted-foreground">بەڕێوەبردنی شوێنەکان</p>
            </div>
          </div>
          
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="گەڕان لە شوێنەکان..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
          
          <Button
            onClick={() => {
              setEditingLocation(null)
              setFormData({ name: '', description: '' })
              setIsFormOpen(true)
            }}
            className="shrink-0"
          >
            <Plus className="h-4 w-4" />
            زیادکردنی شوێن
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-8 overflow-auto flex-1">

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : filteredLocations.length > 0 ? (
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext 
            items={filteredLocations.map(l => l.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredLocations.map((location) => (
                <SortableLocationCard
                  key={location.id}
                  location={location}
                  assetCount={location.assetCount}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onView={handleViewLocation}
                  onColorChange={handleColorChange}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay dropAnimation={dropAnimationConfig}>
            {activeLocation ? (
              <LocationCardContent
                location={activeLocation}
                assetCount={activeLocation.assetCount}
                isOverlay
                dragHandleProps={{}}
                onView={() => {}}
                onEdit={() => {}}
                onDelete={() => {}}
                onColorChange={() => {}}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              {searchQuery ? 'هیچ شوێنێک نەدۆزرایەوە' : 'هیچ شوێنێک نییە'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Location Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent onClose={() => setIsFormOpen(false)}>
          <DialogHeader>
            <DialogTitle>
              {editingLocation ? 'دەستکاریکردنی شوێن' : 'زیادکردنی شوێنی نوێ'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">ناوی شوێن *</label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
                placeholder="بەشی IT، ئۆفیسی سەرەکی..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">وەسف</label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="وەسفی شوێن..."
              />
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
                disabled={isSubmitting}
              >
                پاشگەزبوونەوە
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="h-4 w-4 border-2 border-current border-t-transparent rounded-full"
                    />
                    {editingLocation ? 'نوێکردنەوە...' : 'زیادکردن...'}
                  </>
                ) : (
                  editingLocation ? 'نوێکردنەوە' : 'زیادکردن'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="سڕینەوەی شوێن"
        message="دڵنیای لە سڕینەوەی ئەم شوێنە؟ ئەم کردارە ناگەڕێتەوە."
        isLoading={deleteMutation.isPending}
      />
    </div>
    </div>
  )
}
