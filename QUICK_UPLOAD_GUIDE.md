# ڕێنمایی خێرای ناردنی داتا

## کێشەکە چییە؟

بەرنامەکە داتا لە Firestore دەخوێنێتەوە، بەڵام هیچ داتایەک لە Firestore نییە.
بۆیە هیچ شتێک دەرناکەوێت!

---

## چارەسەر - ٣ ڕێگە:

### ✅ ڕێگەی ١: بە دەستی زیاد بکە لە بەرنامەکە (ئاسانترین)

#### ١. Categories زیاد بکە:

1. بکەرەوە بەرنامەکە → Login بکە
2. Settings → جۆرەکانی کەرەستە
3. زیاد بکە ئەم ١١ دانەیە:

```
All In One
Desktop
Laptop
Printer
Scanner
Monitor
Phone
Smart Phone
Tablet
Card Printer
Flash Drive
```

#### ٢. Brands زیاد بکە:

Settings → براندەکان → زیاد بکە:

```
HP
Dell
Lenovo
Asus
Acer
Apple
Samsung
Canon
Epson
Toshiba
Brother
Lexmark
Xerox
Ricoh
Konica Minolta
LG
Huawei
Xiaomi
(و هەر براندێکی تر کە پێویستە)
```

#### ٣. Locations زیاد بکە:

Dashboard → Locations → زیادکردنی شوێن

یان

لە `locations_import.json` کۆپی بکە بە دەستی

#### ٤. Assets زیاد بکە:

Dashboard → زیادکردنی کەرەستە
یان
Locations → هەڵبژاردنی شوێنێک → زیادکردنی کەرەستە

---

### ✅ ڕێگەی ٢: بەکارهێنانی فایلی HTML

١. فایلی `check_firestore.html` بکەرەوە لە browser
٢. ئیمەیڵ و password بنووسە
٣. کلیک بکە لەسەر "Login & Check"
٤. دەبینیت کە چەند دانە لە هەر collection دا هەیە

ئەگەر ٠ بوو، واتە پێویستە بە دەستی زیاد بکەیت.

---

### ✅ ڕێگەی ٣: سکریپتی Node.js

**تێبینی:** پێویستە Firestore Rules publish بکەیت یەکەم!

١. دەستکاری `upload_with_admin.js`:

```javascript
// لە نزیکەی ڕیزی ٢٤
const email = 'azher@syana.com';  // ئیمەیڵەکەت
const password = 'YOUR_PASSWORD';   // وشەی نهێنیەکەت
```

٢. جێبەجێکردن:

```bash
node upload_with_admin.js
```

---

## پشتڕاستکردنەوە

دوای زیادکردنی داتا:

١. **لە بەرنامەکە:**
   - Dashboard → دەبێت ژمارەکان ببینیت
   - Settings → دەبێت لیستەکان پڕ بن

٢. **لە Firebase Console:**
   - بچۆ https://console.firebase.google.com
   - پرۆژە: computer-syana
   - Firestore Database → Data
   - پشکنین بکە کە collections هەن

---

## گرنگ! ⚠️

### دڵنیابە لە Firestore Rules:

١. بچۆ Firebase Console
٢. Firestore Database → Rules  
٣. دڵنیابە کە ئەم collections ـانە تێدان:

```
match /categories/{categoryId} {
  allow read, write: if isAuthorized();
}

match /brands/{brandId} {
  allow read, write: if isAuthorized();
}

match /maintenanceTypes/{typeId} {
  allow read, write: if isAuthorized();
}

match /maintenanceLocations/{locationId} {
  allow read, write: if isAuthorized();
}
```

٤. کلیک بکە لەسەر **Publish**

---

## یارمەتی خێرا

### دەتەوێت تەنها تاقیکردنەوە بکەیت?

زیاد بکە چەند دانەیەک:
- ٣-٤ Category
- ٣-٤ Brand  
- ٢-٣ Location
- ٥-١٠ Asset

ئەوە بەسە بۆ بینینی کارکردنی بەرنامەکە!

---

## هاوکاری پێویستە؟

ئەگەر کێشەت هەیە:

١. فایلی `check_firestore.html` بکەرەوە → ببینە چەند دانە هەیە
٢. Console.log لە browser ببینە بۆ هەڵەکان
٣. Firebase Console → Firestore Rules پشکنین بکە
