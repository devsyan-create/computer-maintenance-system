# ڕێنمایی دامەزراندنی Firebase

پرۆژەکە ئێستا بە Firebase Firestore و Firebase Authentication و Firebase Realtime Database کاردەکات.

## ١. دامەزراندنی یەکەم جار

### دروستکردنی بەکارهێنەر لە Firebase Console

چونکە لۆگین تەنها بە ئیمەیڵ و پاسۆردە (بێ دروستکردنی ئەکاونت لە ناو ئەپەکە)، پێویستە بەکارهێنەران لە Firebase Console دروست بکەیت:

1. بڕۆ بۆ [Firebase Console](https://console.firebase.google.com)
2. پرۆژەکەت هەڵبژێرە: `computer-syana`
3. لە لای چەپەوە کلیک لەسەر **Authentication** بکە
4. لە تابی **Users** کلیک لەسەر **Add User** بکە
5. ئیمەیڵ و پاسۆرد دابنێ بۆ بەکارهێنەرەکە

### چالاککردنی Realtime Database

1. لە Firebase Console، بڕۆ بۆ **Realtime Database**
2. کلیک لەسەر **Create Database**
3. هەڵبژێرە **Start in test mode** (دواتر ڕیوڵز زیاد دەکەین)
4. دڵنیابە لە ناوچەکە (location): `us-central1`

### دامەزراندنی Firestore Security Rules

1. لە Firebase Console، بڕۆ بۆ **Firestore Database**
2. کلیک لەسەر تابی **Rules**
3. کۆپی کردنی ناوەڕۆکی فایلی `firestore.rules` و paste بکە
4. کلیک لەسەر **Publish** بکە

### دامەزراندنی Realtime Database Rules

1. لە Firebase Console، بڕۆ بۆ **Realtime Database**
2. کلیک لەسەر تابی **Rules**
3. کۆپی کردنی ناوەڕۆکی فایلی `database.rules.json` و paste بکە
4. کلیک لەسەر **Publish** بکە

## ٢. کارپێکردنی پرۆژەکە

```bash
# دامەزراندنی پێداویستییەکان (ئەگەر پێشتر نەکراوە)
npm install

# کارپێکردنی Development Server
npm run dev
```

ئەپەکە لەسەر `http://localhost:3001` کاردەکات

## ٣. چوونەژوورەوە

- **ئیمەیڵ**: ئەو ئیمەیڵەی لە Firebase Console دروستت کردووە
- **پاسۆرد**: ئەو پاسۆردەی لە Firebase Console دروستت کردووە

## ٤. ستراکچەری داتابەیسەکان

### Firestore Collections

```
/assets           - کەرەستەکان
/locations        - شوێنەکان  
/transfers        - گواستنەوەکان
/maintenance      - تۆمارەکانی چاککردنەوە
```

### Realtime Database

```
/logs             - لۆگەکانی سیستەم (ڕەیڵتایم)
```

## ٥. تێبینیەکان

- سێرڤەری Node.js (Express) ئیتر پێویست ناکات
- فایلی `server/db.json` ئیتر بەکارنایەت
- داتاکانی سەرەکی لە Firebase Firestore هەڵدەگیرێن
- لۆگەکان لە Firebase Realtime Database هەڵدەگیرێن
- Authentication لە ڕێگەی Firebase Authentication کاردەکات

## ٦. بیلدکردنی بۆ Production

```bash
npm run build
```

فایلەکانی بیلدکراو لە فۆڵدەری `dist` دەبن و دەتوانیت بیانهێنیتە سەر Firebase Hosting یان هەر hosting service-ێکی تر.

## ٧. Firebase Hosting (ئیختیاری)

ئەگەر دەتەوێت لەسەر Firebase Hosting هۆست بکەیت:

```bash
# دامەزراندنی Firebase CLI
npm install -g firebase-tools

# لۆگین بکە
firebase login

# دەستپێکردنی Hosting
firebase init hosting

# دیپلۆی کردن
npm run build
firebase deploy --only hosting
```
