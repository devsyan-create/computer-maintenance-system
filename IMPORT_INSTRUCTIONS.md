# ڕێنمایی ناردنی داتاکان بۆ Firestore

## ١. پێشمەرجەکان

پێویستە Firestore Rules ـەکان لە Firebase Console دا publish بکەیت:

### چۆنیەتی publish کردنی Rules:

1. بچۆ بۆ: https://console.firebase.google.com
2. هەڵبژێرە پرۆژەکەت: **computer-syana**
3. لە لایەنی چەپەوە کلیک بکە لەسەر **Firestore Database**
4. کلیک بکە لەسەر تابی **Rules**
5. کۆپی بکە ناوەڕۆکی خوارەوە:

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authorized
    function isAuthorized() {
      return request.auth != null && 
             request.auth.token.email in [
               'dler@syana.com',
               'imad@syana.com',
               'azher@syana.com'
             ];
    }
    
    // Assets collection
    match /assets/{assetId} {
      allow read, write: if isAuthorized();
    }
    
    // Locations collection
    match /locations/{locationId} {
      allow read, write: if isAuthorized();
    }
    
    // Transfers collection
    match /transfers/{transferId} {
      allow read, write: if isAuthorized();
    }
    
    // Maintenance collection
    match /maintenance/{maintenanceId} {
      allow read, write: if isAuthorized();
    }
    
    // Settings collections
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
    
    // Logs collection
    match /logs/{logId} {
      allow read: if isAuthorized();
      allow create: if isAuthorized();
    }
  }
}
```

6. کلیک بکە لەسەر **Publish**

---

## ٢. ناردنی داتاکان

### ڕێگەی یەکەم: بەکارهێنانی بەرنامەکە (ئاسانترین):

دوای publish کردنی Rules:

1. لە بەرنامەکە بچۆ بۆ **Settings**
2. زیاد بکە:
   - **Categories** (11 دانە)
   - **Brands** (25 دانە)
   - **Locations** (167 دانە)

یان دەتوانیت بە یەکجار لە Firebase Console import بکەیت.

---

### ڕێگەی دووەم: Import لە Firebase Console:

#### A. ناردنی Categories, Brands, Locations:

1. لە Firebase Console بچۆ بۆ **Firestore Database**
2. کلیک بکە لەسەر **Start collection**
3. ناوی collection: `categories`
4. یەک بە یەک زیاد بکە لە `categories_import.json`

یان بەکارهێنانی Firebase CLI:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Import data (requires Firebase Blaze plan)
firebase firestore:import ./firestore_backup --project computer-syana
```

---

### ڕێگەی سێیەم: بەکارهێنانی سکریپتی Node.js:

دوای publish کردنی Rules، بە ئەم فەرمانانە import بکە:

```bash
# Login to your account first
npm run dev
# Then in browser, login with one of the authorized emails:
# - dler@syana.com
# - imad@syana.com  
# - azher@syana.com

# After login, the upload script can work
node upload_to_firestore.js
```

---

## ٣. فایلە ئامادەکراوەکان

✅ **categories_import.json** - 11 جۆری کەرەستە:
- All In One
- Card Printer
- Desktop
- Flash Drive
- Laptop
- Monitor
- Phone
- Printer
- Scanner
- Smart Phone
- Tablet

✅ **brands_import.json** - 25 براند

✅ **locations_import.json** - 167 شوێن

✅ **assets_import.json** - 379 کەرەستە

---

## ٤. ئاگاداری

⚠️ پێش ناردنی داتاکان:

1. دڵنیابە کە Firestore Rules publish کراوە
2. دڵنیابە کە لەگەڵ ئەکاونتێکی مۆڵەتدارەوە login کردووە
3. تاقیکردنەوەی سەرەتایی: تەنها چەند دانەیەک زیاد بکە بۆ ئەزموون

---

## ٥. چارەسەری گرفتەکان

### گرفت: "PERMISSION_DENIED"
**چارەسەر**: دڵنیابە کە:
- Firestore Rules publish کراوە
- لەگەڵ ئەکاونتێکی مۆڵەتدار login کردووە

### گرفت: "INVALID_ARGUMENT"  
**چارەسەر**: دڵنیابە کە:
- Rules ـەکان بە دروستی نووسراون
- هەموو collection names ڕاست نووسراون

---

## ٦. ئەگەر دەتەوێت بە دەستی زیاد بکەیت

دەتوانیت لە بەرنامەکە بە دەستی:

1. بچۆ Settings
2. کلیک بکە لەسەر هەر کارتێک
3. یەک بە یەک زیاد بکە

بۆ Assets:
1. بچۆ Dashboard یان Locations
2. کلیک بکە لەسەر "زیادکردنی کەرەستە"
3. زانیارییەکان پڕ بکەرەوە
