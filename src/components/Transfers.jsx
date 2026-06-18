import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowRightLeft, Calendar, Trash2, Eye, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { transfersAPI } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from './ConfirmDialog'
import { ReceiptDialog } from './ReceiptDialog'
import { formatDate } from '@/lib/utils'

export function Transfers() {
  const queryClient = useQueryClient()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteTransferId, setDeleteTransferId] = useState(null)
  const [isReceiptOpen, setIsReceiptOpen] = useState(false)
  const [selectedTransfer, setSelectedTransfer] = useState(null)

  const { data: transfers = [], isLoading } = useQuery({
    queryKey: ['transfers'],
    queryFn: transfersAPI.getAll,
  })

  const deleteMutation = useMutation({
    mutationFn: transfersAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['transfers'])
      toast.success('لۆگی گواستنەوە سڕایەوە')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const handleDelete = (id) => {
    setDeleteTransferId(id)
    setIsDeleteDialogOpen(true)
  }

  const handleViewReceipt = (transfer) => {
    setSelectedTransfer(transfer)
    setIsReceiptOpen(true)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <ArrowRightLeft className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold leading-tight">گواستنەوەکان</h1>
              <p className="text-sm text-muted-foreground">مێژووی گواستنەوەی کەرەستەکان</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8 overflow-auto flex-1">

      <Card>
        <CardHeader>
          <CardTitle>هەموو گواستنەوەکان</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              <ArrowRightLeft className="h-12 w-12 mx-auto mb-4 opacity-50 animate-pulse" />
              <p>بارکردنی گواستنەوەکان...</p>
            </div>
          ) : transfers.length > 0 ? (
            <div className="space-y-3">
              {transfers.map((transfer) => (
                <div
                  key={transfer.id}
                  className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <ArrowRightLeft className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{transfer.assetName}</p>
                    <p className="text-sm text-muted-foreground">
                      {transfer.serialNumber}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-sm">
                      <span className="px-2 py-0.5 rounded bg-red-100 text-red-800">
                        {transfer.fromLocation}
                      </span>
                      <ArrowRightLeft className="h-3 w-3" />
                      <span className="px-2 py-0.5 rounded bg-green-100 text-green-800">
                        {transfer.toLocation}
                      </span>
                    </div>
                  </div>
                  <div className="text-left text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(transfer.date)}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewReceipt(transfer)}
                      title="سەیرکردنی پسوڵە"
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(transfer.id)}
                      title="سڕینەوەی لۆگ"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <ArrowRightLeft className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>هیچ گواستنەوەیەک نییە</p>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={() => {
          deleteMutation.mutate(deleteTransferId, {
            onSettled: () => {
              setIsDeleteDialogOpen(false)
              setDeleteTransferId(null)
            }
          })
        }}
        title="سڕینەوەی لۆگی گواستنەوە"
        message="دڵنیای لە سڕینەوەی ئەم لۆگە؟ ئەم کردارە ناگەڕێتەوە."
        isLoading={deleteMutation.isPending}
      />

      <ReceiptDialog
        open={isReceiptOpen}
        onOpenChange={setIsReceiptOpen}
        transfer={selectedTransfer}
      />
    </div>
    </div>
  )
}
