# چارەسەرکردنی کێشەکانی لۆگەکان

## ئەگەر لۆگەکان تۆمار ناکرێن:

### 1. دڵنیابوون لە چالاککردنی Realtime Database

1. بڕۆ بۆ: https://console.firebase.google.com/project/computer-syana/database
2. ئەگەر Realtime Database دروست نەکراوە:
   - کلیک لەسەر **"Create Database"**
   - هەڵبژێرە Location: **United States (us-central1)**
   - هەڵبژێرە: **"Start in test mode"**
   - کلیک لەسەر **"Enable"**

### 2. دامەزراندنی Realtime Database Rules

1. دوای دروستکردنی Database، بڕۆ بۆ تابی **"Rules"**
2. کۆپی کردنی ئەم ڕیوڵزە و Paste بکە:

```json
{
  "rules": {
    "logs": {
      ".read": "auth != null && (auth.token.email == 'dler@syana.com' || auth.token.email == 'imad@syana.com' || auth.token.email == 'azher@syana.com')",
      ".write": "auth != null && (auth.token.email == 'dler@syana.com' || auth.token.email == 'imad@syana.com' || auth.token.email == 'azher@syana.com')",
      ".indexOn": ["timestamp", "userEmail", "module"],
      "$logId": {
        ".validate": "newData.hasChildren(['action', 'module', 'userEmail', 'userName', 'timestamp'])"
      }
    }
  }
}
```

3. کلیک لەسەر **"Publish"**

### 3. دڵنیابوون لە Database URL

Database URL پێویستە بەم شێوەیە بێت:
```
https://computer-syana-default-rtdb.firebaseio.com
```

ئەگەر جیاوازە، پێویستە لە کۆنفیگی Firebase نوێی بکەیتەوە.

### 4. تاقیکردنەوە

دوای ئەنجامدانی هەنگاوەکانی سەرەوە:

1. **لۆگ ئاوت بکە** لە سیستەمەکە
2. **لۆگین بکەرەوە**
3. **کردارێک ئەنجام بدە** (وەک زیادکردنی شوێن)
4. **بڕۆ بۆ بەشی لۆگەکان** و ببینە ئایا لۆگەکان دەردەکەون

### 5. چێککردنی لە Console

ئەگەر هێشتا کارناکات:

1. لە سایتەکەدا **F12** دابگرە
2. بڕۆ بۆ تابی **Console**
3. کردارێک ئەنجام بدە
4. ئەگەر هەڵەیەک هەبێت، لە Console دەردەکەوێت

---

## لیستی هەموو کردارە لۆگکراوەکان

### سیستەم (Auth)
- ✅ چوونەژوورەوە
- ✅ دەرچوون

### کەرەستەکان (Assets)
- ✅ دروستکردنی کەرەستە
- ✅ نوێکردنەوەی کەرەستە
- ✅ سڕینەوەی کەرەستە
- ✅ سڕینەوەی کۆمەڵە کەرەستە

### شوێنەکان (Locations)
- ✅ دروستکردنی شوێن
- ✅ نوێکردنەوەی شوێن
- ✅ سڕینەوەی شوێن

### گواستنەوەکان (Transfers)
- ✅ دروستکردنی گواستنەوە
- ✅ گواستنەوەی کۆمەڵە
- ✅ سڕینەوەی گواستنەوە

### صیانەکردن (Maintenance)
- ✅ دروستکردنی تۆماری صیانە
- ✅ نوێکردنەوەی تۆماری صیانە
- ✅ سڕینەوەی تۆماری صیانە
- ✅ سڕینەوەی کۆمەڵە تۆماری صیانە

### ڕێکخستن (Settings)
- ✅ کردارەکانی براندەکان
- ✅ کردارەکانی کاتێگۆریەکان
- ✅ کردارەکانی جۆرەکانی صیانە
- ✅ کردارەکانی شوێنەکانی صیانە

---

## کردارە نالۆگکراوەکان (بە مەبەست)

ئەم کردارانە لۆگ ناکرێن چونکە ناگرنگن:

- ❌ بینینی لیستەکان
- ❌ گەڕان و فلتەرکردن
- ❌ چاپکردن
- ❌ ئێکسپۆرتی Excel
- ❌ بینینی پرۆفایلی شوێن
- ❌ نوێکردنەوەی داتا (Refresh)
