<<<<<<< HEAD
# manzu5duty
滿築排班
=======
# 滿築5現場駐點排班表

一個現代化、直觀的排班管理系統，支援跨裝置資料同步和即時更新。

## 功能特色

- 📅 **月檢視與週檢視**：Google 日曆風格的現代化介面
- 🎨 **專屬顏色標示**：每位員工都有專屬顏色（黃詩晴-天藍色、楊茗傑-綠色、副店-紅色）
- 🖱️ **拖曳操作**：直觀的拖曳移動排班功能
- 📱 **響應式設計**：支援桌面和手機裝置
- ☁️ **雲端同步**：使用 Firebase Firestore 實現跨裝置資料同步
- 🏖️ **請假管理**：完整的請假標記和管理功能
- ⚡ **即時驗證**：排班規則即時驗證和錯誤提示

## 排班規則

### 平日排班
- **週一、週二、週五**：僅安排楊茗傑（標示「早會後」）
- **週三**：黃詩晴與副店輪流安排
- **週四**：全員固定休假

### 週末排班
- **週六、週日**：僅安排黃詩晴與副店，公平輪流

## 部署步驟

### 1. 設定 Firebase

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 建立新專案或選擇現有專案
3. 在專案設定中啟用 Firestore Database
4. 複製專案設定資訊

### 2. 更新 Firebase 設定

編輯 `script.js` 檔案，將 Firebase 設定更新為您的專案資訊：

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

### 3. 設定 Firestore 安全規則

在 Firebase Console 中設定 Firestore 安全規則：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // 開發環境，生產環境請設定適當的權限
    }
  }
}
```

### 4. 部署到 GitHub Pages

1. 將所有檔案上傳到 GitHub 儲存庫
2. 前往儲存庫設定 > Pages
3. 選擇 Source 為 "Deploy from a branch"
4. 選擇分支（通常是 main 或 master）
5. 儲存設定

### 5. 自訂網域（可選）

如果您有自己的網域，可以在 GitHub Pages 設定中新增自訂網域。

## 檔案結構

```
滿築排班/
├── index.html          # 主要 HTML 檔案
├── styles.css          # CSS 樣式檔案
├── script.js           # JavaScript 功能檔案
└── README.md           # 說明文件
```

## 使用說明

### 基本操作

1. **切換檢視模式**：點擊「月檢視」或「週檢視」按鈕
2. **選擇月份**：使用月份下拉選單選擇要查看的月份
3. **選擇週次**：在週檢視模式下使用週次下拉選單

### 排班操作

1. **拖曳移動**：直接拖曳「駐點」標籤到其他日期
2. **請假標記**：點擊格子中的「請假」按鈕
3. **取消請假**：再次點擊請假按鈕即可取消

### 資料同步

- 所有變更會自動儲存到 Firebase
- 每 30 秒自動儲存一次
- 支援多人同時編輯

## 技術規格

- **前端框架**：原生 HTML5 + CSS3 + JavaScript
- **資料庫**：Firebase Firestore
- **字體**：Noto Sans TC（Google Fonts）
- **響應式設計**：支援 480px 以上的螢幕寬度
- **瀏覽器支援**：Chrome、Firefox、Safari、Edge

## 自訂設定

### 修改人員資訊

在 `script.js` 中修改 `STAFF` 物件：

```javascript
const STAFF = {
    HUANG: { name: '黃詩晴', color: 'huang', class: 'shift-tag huang' },
    YANG: { name: '楊茗傑', color: 'yang', class: 'shift-tag yang' },
    DEPUTY: { name: '副店', color: 'deputy', class: 'shift-tag deputy' }
};
```

### 修改顏色主題

在 `styles.css` 中修改對應的顏色類別：

```css
.shift-tag.huang {
    background: #87CEEB; /* 天藍色 */
}

.shift-tag.yang {
    background: #90EE90; /* 綠色 */
}

.shift-tag.deputy {
    background: #FFB6C1; /* 紅色 */
}
```

## 故障排除

### 常見問題

1. **資料無法載入**
   - 檢查 Firebase 設定是否正確
   - 確認網路連線正常
   - 檢查瀏覽器控制台是否有錯誤訊息

2. **拖曳功能無法使用**
   - 確認瀏覽器支援 HTML5 拖曳 API
   - 檢查是否有 JavaScript 錯誤

3. **樣式顯示異常**
   - 確認 CSS 檔案已正確載入
   - 檢查瀏覽器是否支援 CSS Grid 和 Flexbox

### 支援

如有問題或建議，請透過 GitHub Issues 回報。

## 授權

本專案採用 MIT 授權條款。 
>>>>>>> c3e9ab7 (完成週檢視下一周功能與 Firestore 載入修正)
