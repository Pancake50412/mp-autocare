# 沐品 AutoCare 客戶管理系統

## 部署到 Vercel 步驟

### 第一次部署

1. 到 [vercel.com](https://vercel.com) 免費註冊（用 Google 登入即可）
2. 安裝 Git（如果電腦沒有）：https://git-scm.com
3. 把這個資料夾上傳到 GitHub：
   - 到 [github.com](https://github.com) 建立新 repository
   - 把整個 `mp-autocare` 資料夾上傳
4. 在 Vercel → New Project → 選擇你的 GitHub repo → Deploy
5. 幾分鐘後取得網址，例如 `mp-autocare.vercel.app`

### 手機加入主畫面（變成 App）

**iPhone：**
1. Safari 開啟網址
2. 點下方分享按鈕 □↑
3. 選「加入主畫面」
4. 完成！桌面會出現 App 圖示

**Android：**
1. Chrome 開啟網址
2. 點右上角 ⋮
3. 選「加入主畫面」

### 之後更新 App

1. 在 Claude 修改好程式碼
2. 下載新的 `App.jsx`
3. 替換 `src/App.jsx`
4. 重新上傳到 GitHub
5. Vercel 自動更新，幾分鐘後生效

## 專案結構

```
mp-autocare/
├── public/
│   ├── index.html      # 主頁面
│   └── manifest.json   # PWA 設定
├── src/
│   ├── index.js        # 入口點
│   └── App.jsx         # 主程式（每次更新替換這個）
├── package.json        # 套件設定
└── vercel.json         # Vercel 設定
```
