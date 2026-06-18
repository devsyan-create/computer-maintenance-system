# 🎉 دیپلۆی بە سەرکەوتوویی تەواو بوو!

## 🌐 URLەکانی سایت

### Production URL (سەرەکی):
**https://computer-syana.netlify.app**

### Netlify Dashboard:
**https://app.netlify.com/projects/computer-syana**

---

## ⚠️ هەنگاوی کۆتایی - زۆر گرنگە!

پێش ئەوەی سایتەکە کاربکات، پێویستە دۆمەینی Netlify زیاد بکەیت بە Firebase Authorized Domains:

### چۆنیەتی:

1. **بڕۆ بۆ Firebase Console:**
   ```
   https://console.firebase.google.com/project/computer-syana/authentication/settings
   ```

2. **خوار بڕۆ بۆ بەشی "Authorized domains"**

3. **کلیک لەسەر "Add domain"**

4. **ئەم دۆمەینە زیاد بکە:**
   ```
   computer-syana.netlify.app
   ```

5. **کلیک لەسەر "Add"**

---

## ✅ لیستی تەواوکراوەکان

- ✅ سایتی Netlify دروستکرا
- ✅ هەموو Environment Variables زیادکران
- ✅ کۆد بیلد کرا
- ✅ سایت دیپلۆی کرا لەسەر Production
- ✅ SPA Redirects کۆنفیگ کرا
- ⏳ **چاوەڕوانی: دۆمەین زیادکردن لە Firebase** (خۆت بیکە)

---

## 🔐 چوونەژوورەوە

دوای زیادکردنی دۆمەینەکە لە Firebase، دەتوانیت لۆگین بکەیت بە:

- **dler@syana.com** + پاسۆردەکەت
- **imad@syana.com** + پاسۆردەکەت
- **azher@syana.com** + پاسۆردەکەت

---

## 🔄 نوێکردنەوەی سایت

هەر جارێک دەتەوێت گۆڕانکاری بکەیت:

```bash
# دوای گۆڕانکاری کۆدەکە
netlify deploy --prod
```

یان ئەگەر بیلدی نوێت پێویستە:
```bash
npm run build
netlify deploy --prod
```

---

## 📊 Environment Variables

هەموو ئەم ڤاریابڵانە لە Netlify هەڵگیراون:

- ✅ VITE_FIREBASE_API_KEY
- ✅ VITE_FIREBASE_AUTH_DOMAIN
- ✅ VITE_FIREBASE_PROJECT_ID
- ✅ VITE_FIREBASE_STORAGE_BUCKET
- ✅ VITE_FIREBASE_MESSAGING_SENDER_ID
- ✅ VITE_FIREBASE_APP_ID
- ✅ VITE_FIREBASE_MEASUREMENT_ID

---

## 🛠️ بەڕێوەبردن

### بینینی لۆگەکان:
```bash
netlify logs
```

### بینینی Environment Variables:
```bash
netlify env:list
```

### گۆڕینی Environment Variable:
```bash
netlify env:set VARIABLE_NAME "new_value"
netlify deploy --prod
```

---

## 🚀 تایبەتمەندییەکانی ئەکتیڤ

- ✅ Firebase Authentication (ئیمەیڵ/پاسۆرد)
- ✅ Firebase Firestore (داتابەیسی هەور)
- ✅ تەنها ٣ ئیمەیڵ مۆڵەتپێدراون
- ✅ SPA Routing بە Netlify Redirects
- ✅ تەواو ئامادەیە بۆ بەکارهێنان

---

## 📞 پشتگیری

ئەگەر کێشەیەکت هەبوو:

1. چێککردنی لۆگەکان: https://app.netlify.com/projects/computer-syana/logs
2. چێککردنی Browser Console (F12)
3. دڵنیابوون لە دۆمەینەکە زیادکراوە لە Firebase

---

**سەرکەوتوو بیت! 🎊**
