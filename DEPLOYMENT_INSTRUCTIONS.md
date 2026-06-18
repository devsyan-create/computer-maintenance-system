# ڕێنماییەکانی Deploy کردن - Deployment Instructions

## ✅ گۆڕانکاریەکان Build کران

Build سەرکەوتوو بوو! فایلەکان ئامادەن لە فۆڵدەری `dist/`

## ⚠️ کێشەی Production Deploy

کاتێک هەوڵمان دا `netlify deploy --prod` بەکاربهێنین، هەڵەی `Forbidden` هات.

```
netlify deploy --prod
 »   JSONHTTPError: Forbidden
```

بەڵام **Draft deploy** سەرکەوتوو بوو:
```
https://6a267c0a84c6149bc6e62f9e--computer-syana.netlify.app
```

---

## ✅ چارەسەر: Deploy لە Netlify Dashboard

### ڕێگای 1: Publish Draft Deploy

1. بڕۆ بۆ: https://app.netlify.com/projects/computer-syana/deploys
2. دەبینیت "Draft Deploy" لە لیستدا
3. کلیک بکە لەسەر draft deploy-ەکە
4. کلیک بکە لەسەر دوگمەی **"Publish deploy"**
5. ئەمە draft-ەکە دەگێڕێتەوە بۆ production!

### ڕێگای 2: Manual Drag & Drop

1. بڕۆ بۆ: https://app.netlify.com/drop
2. فۆڵدەری `dist` ڕاکێشە و بهێنە
3. سایتەکەت upload دەکات و بڵاودەکاتەوە

### ڕێگای 3: Git Auto Deploy (پێشنیارکراو)

ئەگەر پڕۆژەکەت لە GitHub هەیە:

1. بڕۆ بۆ: https://app.netlify.com/projects/computer-syana/settings/general
2. لە بەشی "Build & deploy" → "Continuous deployment"
3. Link repository-ەکەت
4. هەر جارێک push بکەیت بۆ Git، ئۆتۆماتیکی deploy دەکرێت

---

## 🔧 بۆچی "Forbidden" هەڵە هات؟

چەند هۆکارێک دەتوانێت:

1. **Permission Issue**: ئەکاونتەکەت ڕەنگە production deploy permission نەبێت
2. **Plan Limitation**: Free plan لەسەر Netlify ڕەنگە سنووردار بێت
3. **API Token**: ڕەنگە بپێویست token نوێ بکەیتەوە

### چاککردنی Token (ئەگەر پێویست بێت):

```bash
# Logout from Netlify CLI
netlify logout

# Login again
netlify login

# Try deploy again
netlify deploy --prod
```

---

## 📦 ئەوەی ئێستا Deploy کراوە

**Draft URL (ئامادەیە بۆ تاقیکردنەوە):**
```
https://6a267c0a84c6149bc6e62f9e--computer-syana.netlify.app
```

**Production URL (دوای publish کردن):**
```
https://computer-syana.netlify.app
```

---

## ✅ چی لە Build دایە؟

هەموو گۆڕانکاریە نوێیەکان:

✅ `generateSerialNumber()` - serialNumber ئۆتۆماتیکی  
✅ چاککردنی `assetsAPI.delete()` - لۆگ پێش سڕینەوە  
✅ چاککردنی `assetsAPI.bulkDelete()` - لۆگی تەواو  
✅ console.log زیاتر بۆ دیباگ  
✅ تەواوی logging system بۆ assets  

---

## 🎯 هەنگاوەکانی داهاتوو

1. **لە ئێستادا**: بڕۆ بۆ draft URL و تاقیبکەرەوە:
   ```
   https://6a267c0a84c6149bc6e62f9e--computer-syana.netlify.app
   ```

2. **ئەگەر باش بوو**: لە Netlify Dashboard publish بکە بۆ production

3. **بەدیهێنانی کارکردن**: 
   - لۆگین بکە
   - کەرەستە زیاد بکە
   - کەرەستە بسڕەوە
   - بڕۆ بۆ "لۆگەکان" - هەموو کردارەکان دەبینیت!

---

## 🚀 ڕێگای خێرا بۆ Publish

**لە Terminal:**

ئەگەر "Forbidden" چاک نەبوو، ئەم کۆمانانە تاقی بکەرەوە:

```bash
# Method 1: Logout & Login again
netlify logout
netlify login
netlify deploy --prod

# Method 2: Use full command
netlify deploy --prod --dir=dist --site=computer-syana

# Method 3: Open browser to publish
netlify open:site
# Then go to Deploys tab and publish the draft
```

**لە Browser:**

1. بڕۆ بۆ: https://app.netlify.com/projects/computer-syana/deploys
2. کلیک لەسەر draft deploy
3. **"Publish deploy"** کلیک بکە

---

## 📊 Build Statistics

```
Build Time: 8.04s
Bundle Size: 1,511.29 kB (minified)
Gzip Size: 414.06 kB
Files: 3 (HTML, CSS, JS)
```

---

**تێبینی:** Draft deploy-ەکە **تەواوە و ئامادەیە!** تەنها پێویستە لە Netlify Dashboard publish بکرێت بۆ production URL.

**نووسەر:** Kiro AI Assistant  
**بەروار:** 2026-06-08
