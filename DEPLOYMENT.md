# 部署說明

## 快速開始（推薦）

### 方法一：直接使用（無需設定）

1. 下載所有檔案到您的電腦
2. 雙擊 `index-local.html` 檔案
3. 在瀏覽器中開啟即可使用

**優點：**
- 無需任何設定
- 立即可用
- 資料儲存在瀏覽器本地

**缺點：**
- 資料不會跨裝置同步
- 清除瀏覽器資料會遺失排班資訊

### 方法二：GitHub Pages 部署（推薦）

1. 建立 GitHub 儲存庫
2. 上傳所有檔案
3. 前往 Settings > Pages
4. 選擇 Source 為 "Deploy from a branch"
5. 選擇 main 分支
6. 儲存設定

**優點：**
- 可以透過網址分享給其他人
- 支援手機和電腦存取
- 免費託管

## 進階部署（Firebase 版本）

### 1. 設定 Firebase

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 建立新專案
3. 啟用 Firestore Database
4. 複製專案設定

### 2. 更新程式碼

編輯 `script.js` 檔案，更新 Firebase 設定：

```javascript
const firebaseConfig = {
    apiKey: "您的API金鑰",
    authDomain: "您的專案.firebaseapp.com",
    projectId: "您的專案ID",
    storageBucket: "您的專案.appspot.com",
    messagingSenderId: "您的發送者ID",
    appId: "您的應用程式ID"
};
```

### 3. 設定安全規則

在 Firebase Console 中設定 Firestore 安全規則：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 4. 使用 Firebase 版本

將 `index.html` 中的 script 標籤改為：

```html
<script src="script.js"></script>
```

## 檔案說明

| 檔案 | 說明 | 用途 |
|------|------|------|
| `index.html` | 主要 HTML 檔案（Firebase 版本） | 完整功能，支援跨裝置同步 |
| `index-local.html` | 簡化 HTML 檔案（本地版本） | 無需設定，立即可用 |
| `styles.css` | 樣式檔案 | 所有視覺設計 |
| `script.js` | JavaScript 檔案（Firebase 版本） | 完整功能邏輯 |
| `script-local.js` | JavaScript 檔案（本地版本） | 使用 localStorage |
| `README.md` | 說明文件 | 功能介紹和使用說明 |
| `DEPLOYMENT.md` | 部署說明 | 本檔案 |

## 功能對比

| 功能 | 本地版本 | Firebase 版本 |
|------|----------|---------------|
| 基本排班功能 | ✅ | ✅ |
| 拖曳移動 | ✅ | ✅ |
| 請假管理 | ✅ | ✅ |
| 月檢視/週檢視 | ✅ | ✅ |
| 資料持久化 | ✅ (localStorage) | ✅ (Firebase) |
| 跨裝置同步 | ❌ | ✅ |
| 多人協作 | ❌ | ✅ |
| 設定複雜度 | 簡單 | 中等 |

## 建議使用方式

### 個人使用
- 使用 `index-local.html`（本地版本）
- 無需任何設定，開啟即可使用

### 團隊使用
- 使用 `index.html`（Firebase 版本）
- 設定 Firebase 實現跨裝置同步
- 部署到 GitHub Pages 分享給團隊成員

## 故障排除

### 常見問題

1. **頁面無法載入**
   - 確認所有檔案都在同一資料夾
   - 檢查檔案名稱是否正確

2. **樣式顯示異常**
   - 確認 `styles.css` 檔案存在
   - 檢查網路連線（需要載入 Google Fonts）

3. **功能無法使用**
   - 開啟瀏覽器開發者工具檢查錯誤
   - 確認 JavaScript 檔案已正確載入

4. **Firebase 版本無法連線**
   - 檢查 Firebase 設定是否正確
   - 確認 Firestore 已啟用
   - 檢查安全規則設定

### 瀏覽器支援

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### 行動裝置支援

- iOS Safari 12+
- Android Chrome 60+
- 支援觸控拖曳操作

## 聯絡支援

如有問題或建議，請透過以下方式聯絡：

1. GitHub Issues
2. 電子郵件
3. 專案討論區

## 更新記錄

### v1.0.0
- 初始版本發布
- 支援基本排班功能
- 支援月檢視和週檢視
- 支援拖曳操作
- 支援請假管理
- 支援本地儲存和 Firebase 同步 