# گۆڕانکارییەکانی بەشی ڕێکخستن (Settings)

## گۆڕانکارییەکان

### 1. **لیستەکان ئێستا لە Firestore هەڵدەگیرێن**

لە جیاتی localStorage، ئێستا هەموو لیستەکانی ڕێکخستن لە Firestore Collections هەڵدەگیرێن:

- `categories` - جۆرەکانی کەرەستە
- `brands` - براندەکان
- `maintenanceTypes` - جۆرەکانی کاری چاککردنەوە
- `maintenanceLocations` - شوێنەکانی صیانەکردن

### 2. **لیستەکان بەتاڵن لە سەرەتادا**

لێرە وەک localStorage نییە کە نمونەی سەرەتایی هەبوو. ئێستا دەبێت خۆت دانەکانی سەرەتایی زیاد بکەیت.

### 3. **لۆدینگ States زیاد کراوە**

هەموو دوگمەکانی زیادکردن، دەستکاریکردن و سڕینەوە ئێستا loading state نیشان دەدەن:

```jsx
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
```

### 4. **تۆماری لۆگ لە Firestore**

هەموو گۆڕانکارییەکان (زیادکردن، دەستکاریکردن، سڕینەوە) لە Firestore logs تۆمار دەکرێن.

## چۆنیەتی کارکردن

### زیادکردنی دانەیەکی نوێ:

1. بچۆ بۆ Settings
2. کلیک بکە لەسەر کارتی پێویست (جۆرەکان، براندەکان، ...)
3. ناوی دانەکە بنووسە
4. کلیک بکە لەسەر دوگمەی "زیادکردن"
5. دوگمەکە دەبێتە "چاوەڕێ بە..." لە کاتی پارکردندا
6. پاش تەواوبوون، دانەکە لە لیستەکەدا دەربکەوێت

### دەستکاریکردنی دانەیەک:

1. کلیک بکە لەسەر ئایکۆنی "دەستکاری" لە تەنیشت دانەکە
2. ناوی نوێ بنووسە
3. کلیک بکە لەسەر ✓ (تیکە سەوزەکە)
4. ئایکۆنەکە دەبێتە spinner لە کاتی پارکردندا
5. پاش تەواوبوون، ناوی نوێ دەربکەوێت

### سڕینەوەی دانەیەک:

1. کلیک بکە لەسەر ئایکۆنی "سڕینەوە" (سەتڵی سوور)
2. دیالۆگی confirm دەربکەوێت
3. کلیک بکە لەسەر "سڕینەوە"
4. دوگمەکە دەبێتە "سڕینەوە..." لە کاتی پارکردندا
5. پاش تەواوبوون، دانەکە لە لیستەکە دەسڕێتەوە

## Firestore Collections Structure

```
categories/
  ├── {id}
  │   ├── name: string
  │   ├── createdAt: timestamp
  │   └── updatedAt: timestamp (optional)

brands/
  ├── {id}
  │   ├── name: string
  │   ├── createdAt: timestamp
  │   └── updatedAt: timestamp (optional)

maintenanceTypes/
  ├── {id}
  │   ├── name: string
  │   ├── createdAt: timestamp
  │   └── updatedAt: timestamp (optional)

maintenanceLocations/
  ├── {id}
  │   ├── name: string
  │   ├── createdAt: timestamp
  │   └── updatedAt: timestamp (optional)
```

## Components Updated

1. ✅ `CategoriesDialog.jsx` - Firestore integration + loading states
2. ✅ `BrandsDialog.jsx` - Firestore integration + loading states
3. ✅ `MaintenanceTypesDialog.jsx` - Firestore integration + loading states
4. ✅ `MaintenanceLocationsDialog.jsx` - Firestore integration + loading states
5. ✅ `AssetFormDialog.jsx` - Read from Firestore instead of localStorage
6. ✅ `MaintenanceFormDialog.jsx` - Read from Firestore instead of localStorage

## تێبینییەکان

- هەموو گۆڕانکارییەکان یەکسەر لە Firestore پاش دەکرێن
- لیستەکان لە هەر جار کردنەوەدا لە Firestore دەخوێنرێنەوە
- هیچ دانەیەکی سەرەتایی نییە، پێویستە خۆت زیاد بکەیت
- هەموو کردارەکان loading indicator نیشان دەدەن
