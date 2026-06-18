import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { ArrowRightLeft, Printer } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export function ReceiptDialog({ open, onOpenChange, transfer }) {
  if (!transfer) return null

  const handlePrint = () => {
    // Build receipt object safely
    const receipt = {
      date: transfer.date || new Date().toISOString(),
      fromLocation: transfer.fromLocation || 'نەزانراو',
      toLocation: transfer.toLocation || 'نەزانراو',
      assets: [{
        serialNumber: transfer.serialNumber || 'نەزانراو',
        macAddress: transfer.macAddress,
        category: transfer.assetName ? (transfer.assetName.split(' - ')[0] || 'کەرەستە') : 'کەرەستە',
        fullString: transfer.assetName || 'کەرەستە',
      }]
    }

    printReceipt(receipt)
  }

  const printReceipt = (receipt) => {
    const printWindow = window.open('', '', 'width=800,height=600')
    
    // Format date in Kurdish numbers
    const formatKurdishDate = (dateStr) => {
      const date = new Date(dateStr)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const latinDate = `${year}/${month}/${day}`
      
      // Convert to Kurdish numbers
      const kurdishNumbers = {
        '0': '٠', '1': '١', '2': '٢', '3': '٣', '4': '٤',
        '5': '٥', '6': '٦', '7': '٧', '8': '٨', '9': '٩'
      }
      return latinDate.replace(/[0-9]/g, (d) => kurdishNumbers[d])
    }
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ku">
      <head>
        <meta charset="UTF-8">
        <title>پسوڵەی گواستنەوە</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          body {
            font-family: 'Noto Kufi Arabic', 'Noto Sans Arabic', Arial, sans-serif;
            padding: 15px;
            direction: rtl;
            line-height: 1.5;
            color: #000;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #000;
          }
          .logo {
            width: 70px;
            height: 70px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          .logo img {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
          .header-text {
            text-align: right;
            flex: 1;
            padding-left: 15px;
          }
          .header-text h1 {
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 3px;
          }
          .header-text p {
            font-size: 12px;
            margin: 2px 0;
            font-weight: 500;
          }
          .date-section {
            display: flex;
            justify-content: space-between;
            margin: 15px 0;
            padding: 8px 10px;
            background: #f5f5f5;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 500;
          }
          .title-section {
            text-align: center;
            margin: 20px 0;
            padding: 10px;
            background: #f0f0f0;
            border-radius: 4px;
          }
          .title-section h2 {
            font-size: 15px;
            font-weight: 600;
          }
          .location-section {
            margin: 15px 0 12px 0;
            text-align: right;
            font-size: 13px;
            font-weight: 600;
          }
          .assets-table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0 30px 0;
          }
          .assets-table th,
          .assets-table td {
            border: 1px solid #000;
            padding: 6px 8px;
            text-align: center;
          }
          .assets-table th {
            background-color: #e0e0e0;
            font-weight: 600;
            font-size: 12px;
          }
          .assets-table td {
            background-color: #fff;
            font-size: 11px;
          }
          .assets-table tbody tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .signature-section {
            margin-top: 180px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          .signature-right {
            text-align: right;
            flex: 1;
            order: 1;
          }
          .signature-left {
            text-align: center;
            flex: 1;
            order: 2;
            padding-left: 50px;
          }
          .signature-box {
            margin-bottom: 35px;
          }
          .signature-line {
            width: 180px;
            border-top: 1px solid #000;
            margin-top: 120px;
            padding-top: 6px;
            text-align: center;
            font-weight: 600;
            font-size: 14px;
          }
          .footer-right {
            text-align: center;
            font-size: 15px;
            line-height: 1.4;
          }
          .footer-right p {
            font-weight: 500;
            margin: 2px 0;
          }
          @media print {
            body { 
              padding: 10px;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .date-section {
              background: #f5f5f5 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .title-section {
              background: #f0f0f0 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .assets-table th {
              background-color: #e0e0e0 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .assets-table tbody tr:nth-child(even) {
              background-color: #f9f9f9 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .signature-section { 
              page-break-inside: avoid;
            }
            .assets-table {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="header-text">
            <h1>حکومەتی هەرێمی کوردستان</h1>
            <p>بەڕێوەبەرایەتی ئاسایشی گەرمیان</p>
            <p>بەشی ئایتی و هونەری</p>
          </div>
          <div class="logo"><img src="../assets/logo.png" alt="Logo" /></div>
        </div>
        
        <div class="date-section">
          <div><strong>ژمارە:</strong> _______</div>
          <div><strong>بەروار:</strong> ${formatKurdishDate(receipt.date)}</div>
        </div>
        
        <div class="title-section">
          <h2>بۆ/ ${receipt.toLocation}</h2>
        </div>
        
        <div class="location-section">
          کەرەستەکان:
        </div>
        
        <table class="assets-table">
          <thead>
            <tr>
              <th style="width: 6%">ژ</th>
              <th style="width: 22%">جۆری کەرەستە</th>
              <th style="width: 42%">وەسفی تەواوی کەرەستە</th>
              <th style="width: 30%">سریاڵ نەمبەر یان ماک</th>
            </tr>
          </thead>
          <tbody>
            ${receipt.assets.map((asset, index) => `
              <tr>
                <td><strong>${index + 1}</strong></td>
                <td>${asset.category || '-'}</td>
                <td>${asset.fullString || '-'}</td>
                <td>${asset.serialNumber || (asset.macAddress ? asset.macAddress : '-')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="signature-section">
          <div class="signature-right">
            <div class="signature-box">
              <div class="signature-line">پێدەر</div>
            </div>
            <div class="signature-box">
              <div class="signature-line">وەرگر</div>
            </div>
          </div>
          <div class="signature-left">
            <div class="footer-right">
              <p><strong>بەشی ئایتی و هونەری</strong></p>
              <p>${formatKurdishDate(receipt.date)}</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `)
    printWindow.document.close()
    
    // Wait for fonts and images to load before printing
    if (printWindow.document.fonts) {
      printWindow.document.fonts.ready.then(() => {
        // Wait a bit more for images
        setTimeout(() => {
          printWindow.print()
        }, 500)
      })
    } else {
      // Fallback for browsers without font API
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print()
        }, 500)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            پسوڵەی گواستنەوە
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Preview of receipt info */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">بەروار:</span>
              <span className="font-medium">{formatDate(transfer.date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">لە شوێن:</span>
              <span className="font-medium">{transfer.fromLocation}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">بۆ شوێن:</span>
              <span className="font-medium">{transfer.toLocation}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">کەرەستە:</span>
              <span className="font-medium">{transfer.assetName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">ژمارەی زنجیرە:</span>
              <span className="font-mono">{transfer.serialNumber}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              داخستن
            </Button>
            <Button
              type="button"
              onClick={handlePrint}
            >
              <Printer className="h-4 w-4" />
              چاپکردن
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
