# ڕێنمایی دیپلۆی کردن لەسەر Netlify

## ڕێگای یەکەم: لە ڕێگەی Netlify UI (پێشنیارکراو)

### 1. Push کردنی کۆدەکە بۆ GitHub

```bash
# دروستکردنی Git Repository (ئەگەر نەبێت)
git init

# زیادکردنی هەموو فایلەکان
git add .

# کۆمیت
git commit -m "Initial commit with Firebase integration"

# Push بۆ GitHub
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### 2. Import کردنی پرۆژەکە لە Netlify

1. بڕۆ بۆ: https://app.netlify.com
2. کلیک لەسەر **"Add new site"** > **"Import an existing project"**
3. هەڵبژێرە **"GitHub"**
4. ریپۆزیتۆریەکەت هەڵبژێرە
5. Build settings ئۆتۆماتیک دەناسرێتەوە (بەهۆی netlify.toml)

### 3. زیادکردنی Environment Variables

لە **Site configuration** > **Environment variables**، ئەم ڤاریابڵانە زیاد بکە:

```
VITE_FIREBASE_API_KEY = AIzaSyDAX5WbGYqz6ASWQ7QqrAYJgZqHb_LO9LM
VITE_FIREBASE_AUTH_DOMAIN = computer-syana.firebaseapp.com
VITE_FIREBASE_PROJECT_ID = computer-syana
VITE_FIREBASE_STORAGE_BUCKET = computer-syana.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID = 110153829555
VITE_FIREBASE_APP_ID = 1:110153829555:web:1a970060724c30d01b74c6
VITE_FIREBASE_MEASUREMENT_ID = G-0953Q1G098
```

### 4. Deploy بکە

کلیک لەسەر **"Deploy site"** - دیپلۆی کردنەکە دەست پێدەکات!

---

## ڕێگای دووەم: لە ڕێگەی Netlify CLI

### 1. دامەزراندنی Netlify CLI

```bash
npm install -g netlify-cli
```

### 2. لۆگین بکە

```bash
netlify login
```

### 3. دروستکردنی سایتی نوێ

```bash
netlify init
```

هەڵبژاردنەکان:
- **Create & configure a new site**: بەڵێ
- **Team**: تیمەکەت هەڵبژێرە
- **Site name**: ناوێک بۆ سایتەکە (بۆ نموونە: computer-syana)
- **Build command**: `npm run build`
- **Publish directory**: `dist`

### 4. زیادکردنی Environment Variables

```bash
netlify env:set VITE_FIREBASE_API_KEY "AIzaSyDAX5WbGYqz6ASWQ7QqrAYJgZqHb_LO9LM"
netlify env:set VITE_FIREBASE_AUTH_DOMAIN "computer-syana.firebaseapp.com"
netlify env:set VITE_FIREBASE_PROJECT_ID "computer-syana"
netlify env:set VITE_FIREBASE_STORAGE_BUCKET "computer-syana.firebasestorage.app"
netlify env:set VITE_FIREBASE_MESSAGING_SENDER_ID "110153829555"
netlify env:set VITE_FIREBASE_APP_ID "1:110153829555:web:1a970060724c30d01b74c6"
netlify env:set VITE_FIREBASE_MEASUREMENT_ID "G-0953Q1G098"
```

### 5. دیپلۆی بکە

```bash
# Build local بکە
npm run build

# دیپلۆی کردن
netlify deploy --prod
```

---

## ڕێگای سێیەم: Drag & Drop لە Netlify

### 1. Build local بکە

```bash
npm run build
```

### 2. بڕۆ بۆ Netlify

https://app.netlify.com/drop

### 3. فۆڵدەری `dist` بکێشە و بیخەرە سەر پەیجەکە

⚠️ **تێبینی**: بەم ڕێگەیە ناتوانیت Environment Variables زیاد بکەیت، بۆیە پێشنیاری یەکەم یان دووەم باشترە.

---

## نوێکردنەوەی Authorized Domains لە Firebase

دوای دیپلۆی کردنەکە، پێویستە دۆمەینی Netlify زیاد بکەیت بە لیستی Authorized domains:

1. بڕۆ بۆ: https://console.firebase.google.com/project/computer-syana/authentication/settings
2. خوار بڕۆ بۆ **"Authorized domains"**
3. کلیک لەسەر **"Add domain"**
4. دۆمەینی Netlifyت زیاد بکە (بۆ نموونە: `your-site-name.netlify.app`)
5. **Save** بکە

---

## تاقیکردنەوە

دوای دیپلۆی کردنەکە:

1. ✅ سەردانی URLی Netlify بکە
2. ✅ تاقی لۆگین بکەرەوە بە یەکێک لە ٣ ئیمەیڵە مۆڵەتپێدراوەکان
3. ✅ تاقیکردنەوەی کارەکانی CRUD (دروستکردن، خوێندنەوە، نوێکردنەوە، سڕینەوە)

---

## Custom Domain (ئیختیاری)

ئەگەر دۆمەینی تایبەتت هەیە:

1. لە Netlify: **Domain settings** > **Add custom domain**
2. DNS ڕێکخستنەکانی پێبدە
3. دۆمەینەکە زیاد بکە لە Firebase Authorized domains

---

## Continuous Deployment

لەگەڵ ڕێگای یەکەم (GitHub integration)، هەر جارێک کۆدێک push بکەیتە GitHub، Netlify ئۆتۆماتیک ریدیپلۆی دەکاتەوە! 🚀

---

## چارەسەرکردنی کێشەکان

### ئەگەر پەیجەکە سپی بوو:
- چێککردنی Console (F12 > Console tab)
- دڵنیابوون لە Environment Variables دروست زیادکراون

### ئەگەر لۆگین کارناکات:
- دڵنیابوون لە دۆمەینی Netlify زیادکراوە لە Firebase Authorized domains
- چێککردنی Firestore Rules

### ئەگەر بیلد شکستی هێنا:
- چێککردنی لۆگەکانی Netlify
- دڵنیابوون لە هەموو Dependencies دامەزراون: `npm install`
