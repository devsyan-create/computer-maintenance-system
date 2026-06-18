# چۆنیەتی ناردنی داتاکان بۆ Firestore

## ئامادەکاری

### ١. Publish کردنی Firestore Rules

**پێویستی بە ئەنجامدانە (یەک جار):**

1. بچۆ بۆ: https://console.firebase.google.com
2. هەڵبژێرە: **computer-syana**
3. **Firestore Database** → **Rules**
4. کۆپی بکە ناوەڕۆکی فایلی `firestore.rules` 
5. **Publish** بکە

---

## ڕێگەی نار دن

### ڕێگەی یەکەم: بەکارهێنانی سکریپتی Node.js ✅ (پێشنیارکراو)

#### هەنگاوەکان:

**١. دەستکاری سکریپتەکە:**

کردنەوەی فایلی `upload_with_admin.js` و گۆڕینی:

```javascript
const email = 'azher@syana.com';     // ئیمەیڵەکەت
const password = 'YOUR_PASSWORD';     // وشەی نهێنیەکەت
```

**٢. جێبەجێکردنی سکریپت:**

```bash
node upload_with_admin.js
```

**٣. چاوەڕوانبە:**
- Categories: چەند چرکە
- Brands: چەند چرکە  
- Locations: 1-2 خولەک
- Assets: 5-10 خولەک (379 دانە)

---

### ڕێگەی دووەم: بە دەستی لە بەرنامەکە 🖱️

#### بۆ Categories, Brands, شوێنەکانی صیانە، جۆرەکانی کار:

1. بکەرەوە بەرنامەکە و login بکە
2. بچۆ **Settings**
3. کلیک بکە لەسەر هەر کارتێک
4. زیاد بکە یەک بە یەک لە فایلە JSON ـەکانەوە

**فایلەکان:**
- `categories_import.json` → 11 دانە
- `brands_import.json` → 25 دانە  
- `locations_import.json` (بۆ Maintenance) → هەر چەندێک پێویستە
- `maintenanceTypes` → دەستی زیاد بکە

#### بۆ Locations (Asset Locations):

1. بچۆ **Locations** 
2. **زیادکردنی شوێن**
3. زیاد بکە لە `locations_import.json` (167 دانە)

#### بۆ Assets:

**تێبینی:** 379 asset زۆرە بۆ زیادکردنی دەستی!  
بەڵام دەتوانیت گرنگەکان بە دەستی زیاد بکەیت:

1. بچۆ **Dashboard** یان **Locations**
2. **زیادکردنی کەرەستە**
3. پڕکردنەوەی فۆرمەکە

---

### ڕێگەی سێیەم: Firebase CLI Import 💻

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize (یەک جار)
firebase init firestore

# Export format نییە بۆ direct import
# پێویستە بە Firebase Admin SDK
```

---

## گرفتە باوەکان

### گرفت: "PERMISSION_DENIED"

✅ **چارەسەر:**
1. دڵنیابە Rules publish کراوە
2. دڵنیابە لەگەڵ ئەکاونتی ڕاست login کردووە:
   - dler@syana.com
   - imad@syana.com
   - azher@syana.com

### گرفت: "INVALID_ARGUMENT"

✅ **چارەسەر:**
- Rules ـەکان ڕاست نین
- بچۆ Firebase Console و Rules check بکە

### گرفت: "Too many requests"

✅ **چارەسەر:**
- سکریپتەکە خۆکار delay دەکات
- دووبارە run بکەرەوە بۆ تەواوکردنی ماوەکە

---

## پشتڕاستکردنەوە

دوای upload، پشتڕاست بکەرەوە:

1. بچۆ Firebase Console
2. **Firestore Database** → **Data**
3. پشکنین بکە:
   - ✅ categories: 11 document
   - ✅ brands: 25 document
   - ✅ locations: 167 document
   - ✅ assets: 379 document

یان لە بەرنامەکە:
- بچۆ **Dashboard** → دەبێت ژمارەکان ببینیت
- بچۆ **Locations** → دەبێت لیستی شوێنەکان ببینیت

---

## تێبینیەکان

⚠️ **گرنگ:**
- Upload یەک جار بکە (دووبارە upload دووبارەی داتا دروست دەکات)
- یەکەم Categories و Brands upload بکە پێش Assets
- Asset import کاتی دەوێت (~10 خولەک)

💡 **سەرنج:**
- دەتوانیت بە بەشەکان upload بکەیت
- دەتوانیت سکریپتەکە بگۆڕیت بۆ upload کردنی تەنها بەشێک

---

## یارمەتی

ئەگەر کێشەیەک هەبوو:
1. پشکنینی console log ـەکان
2. پشکنینی Firebase Console → Firestore Rules
3. دڵنیابوون لە authentication
