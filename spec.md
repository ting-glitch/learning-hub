# Course Learning Hub - 技術規格說明書 (Specification)

本文件詳細記錄了 Course Learning Hub (課程學習中心) 的系統架構、資料結構、API 端點與資安機制規格。

---

## 🛠️ 系統架構

系統採輕量級無套件依賴架構設計，分為前端 SPA 與後端 Node.js 原生 HTTP 伺服器。

```text
+-------------------------------------------------------+
|                       學員/講師                       |
+--------------------------+----------------------------+
                           | HTTP / JSON API
                           v
+--------------------------+----------------------------+
|                  server.js (Node.js)                  |
|  - 靜態檔案伺服 & MIME 映射                           |
|  - API 處理 (/api/save-course, /api/delete-course)    |
|  - 實體磁碟檔案存取 (fs)                               |
+--------------------------+----------------------------+
                           | 讀寫 config.js & 實體目錄
                           v
+--------------------------+----------------------------+
|                      courses/                         |
|  - 公開目錄: courses/[courseId]/                      |
|  - 私有雜湊: courses/[SHA256(pwd)]/data.json          |
+-------------------------------------------------------+
```

### 1. 前端架構
*   **單頁應用 (SPA)**：以單一 `index.html` 載入，利用 `window.location.hash` 進行前端路由切換（首頁、課程內容頁、管理工具頁）。
*   **無依賴 UI 系統**：使用客製化 CSS 變數定義設計系統，不依賴 Tailwind 或 Bootstrap，完美支援行動端（自適應網頁設計 Breakpoints: `768px`, `576px`, `480px`）。
*   **簡報引擎**：載入外部 CDN 之 `pdf.js`，在 Canvas 上實體化渲染高解析度的投影片頁面，並支援快軌縮圖生成。

### 2. 後端架構
*   **原生 Node.js HTTP 模組**：不使用 Express。使用內建 `http`、`fs`、`path` 與 `crypto` 模組，具備高載入效能與零安全性維護成本。
*   **MIME 映射**：手動對應 `.html`, `.css`, `.js`, `.json`, `.pdf`, `.zip` 等格式的 `Content-Type` 頭部。
*   **持久化層**：直接對應本地資料夾檔案讀寫，課程中介資料以 JS 模組（`config.js`）方式同步儲存。

---

## 📊 資料結構規格 (Data Schemas)

### 1. 全域公開目錄 `config.js`
存放於根目錄，供前端首頁渲染課程卡片與課前教材之用。內容規格如下：

```javascript
const COURSE_CATALOG = [
  {
    "id": "course-xyz",         // 課程唯一識別碼 (英文數字)
    "title": "課程標題",
    "date": "2026-07-15",       // 課程日期 (YYYY-MM-DD)
    "instructor": "講師姓名",
    "description": "自訂簡介",
    "isLocked": true,           // 是否啟用密碼保護
    "duration": "4 小時",
    "prep": {
      "downloads": [            // 課前準備下載與連結清單 (有序)
        {
          "type": "file",
          "name": "prep_guide.pdf",
          "file": "prep/downloads/prep_guide.pdf",
          "size": "1.5 MB"
        },
        {
          "type": "link",
          "name": "Docker 官網",
          "url": "https://www.docker.com",
          "description": "請課前安裝完成"
        }
      ],
      "pdfSlidesFile": "prep/downloads/prep_guide.pdf", // 課前簡報播放來源
      "reminder": "請務必於課前安裝完成 VS Code 軟體" // (選填) 課前準備提示文字
    }
  }
];
```

### 2. 正式課程私有配置 `data.json`
存放在密碼保護的雜湊資料夾中（若無密碼，則存放在課程 ID 同名資料夾中）。

```json
{
  "courseId": "course-xyz",
  "downloads": [                // 正式課程下載與連結清單 (有序)
    {
      "type": "file",
      "name": "lesson_code.zip",
      "file": "downloads/lesson_code.zip",
      "size": "10 MB"
    },
    {
      "type": "link",
      "name": "滿意度問卷",
      "url": "https://forms.google.com/test",
      "description": "請課後填寫"
    }
  ],
  "pdfSlidesFile": "downloads/final_slides.pdf", // 正式課程簡報播放來源
  "reminder": "本週作業期限截止至下週三中午 12:00", // (選填) 正式課程提示文字
  "assignmentUrl": "https://forms.gle/xyz"        // (選填) 作業繳交連結
}
```

---

## 🔒 資訊安全規格 (Security Protocols)

### 1. 管理員安全驗證 (Admin Authentication)
*   **本機雜湊比對**：管理工具登入密碼 `admin123` 的 SHA-256 雜湊碼固化於前端 `app.js`：
    `240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9`
*   **會話保持**：驗證成功後於 `sessionStorage` 寫入 `admin_authenticated = "true"`。路由監聽器在存取 `#admin-tools` 時會主動檢查此狀態，未授權者會立即被重導向至首頁，並彈出驗證視窗。

### 2. 密碼防護與防目錄穿越機制 (Course Locking)
*   **私有路徑隱形化**：當課程啟用密碼保護時，正式課程的 `data.json` 與實體教材皆存放在 `courses/[SHA-256 雜湊路徑]/` 目錄下。
*   **金鑰衍生雜湊**：雜湊值是由學員輸入的密碼衍生計算。未輸入正確密碼前，前端無法得知雜湊路徑，進而無法向伺服器發送請求獲取 `data.json` 或檔案目錄。
*   **路徑穿越防禦**：`server.js` 對所有檔案讀取請求進行正規化路徑檢查，防範目錄穿越攻擊（Directory Traversal）：
    `path.normalize(decodedPath).replace(/^(\.\.(\/|\\|$))+/, '')`

---

## 📡 API 端點規格 (REST Endpoints)

### 1. 建立/更新課程 `POST /api/save-course`
*   **說明**：新增或編輯既有課程。
*   **請求 Payload**：
    ```json
    {
      "courseId": "course-xyz",
      "title": "課程標題",
      "date": "2026-07-15",
      "instructor": "講師",
      "duration": "4 小時",
      "description": "自訂簡介",
      "isLocked": true,
      "password": "課程解鎖密碼",
      "prepSlidesFile": "prep/downloads/guide.pdf",
      "contentSlidesFile": "downloads/slides.pdf",
      "files": [
        {
          "type": "file",
          "name": "guide.pdf",
          "size": "1.2 MB",
          "category": "prep",
          "isNew": true,
          "base64": "data:application/pdf;base64,..."
        }
      ],
      "isEditMode": true,
      "isContentUnlocked": false
    }
    ```
*   **後端行為**：
    1.  若為編輯模式且密碼有變更：搜尋舊雜湊資料夾並將其重新命名為新密碼雜湊，實現無痛檔案移轉。
    2.  若正式課程為鎖定狀態（`isContentUnlocked === false`）：主動讀取伺服器既有的 `data.json`，將正式內容與新修改的課前準備資料合併，防止資料遺失。
    3.  解開 Base64 檔案寫入實體磁碟目錄下。
    4.  生成 `data.json` 並覆寫 `config.js` 的 `COURSE_CATALOG` 清單。
*   **回應**：`{ "success": true, "courseId": "course-xyz" }` 或 `{ "success": false, "error": "錯誤原因" }`。

### 2. 刪除課程 `POST /api/delete-course`
*   **說明**：徹底刪除課程及其磁碟上的實體檔案。
*   **請求 Payload**：`{ "courseId": "course-xyz" }`。
*   **後端行為**：
    1.  從 `config.js` 移去該課程中介資料。
    2.  遞迴刪除 `courses/course-xyz` 公開目錄。
    3.  掃描並遞迴刪除以 64 位雜湊命名且內容屬於該 `courseId` 的私有資料夾。
*   **回應**：`{ "success": true }`。
