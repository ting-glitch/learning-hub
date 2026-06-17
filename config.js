// Global configuration for the Course Learning Hub
// This file is public and list the metadata for all courses.
// Secrets, slide structures, and actual download files are hidden inside the hashed folders.

const COURSE_CATALOG = [
  {
    "id": "course-0vvk06",
    "title": "零基礎 AI 協作開發 - 從 VBA 到 Vibe Coding應用實作",
    "date": "2026-07-14",
    "instructor": "Ting",
    "description": "以AI 協作開發為核心，帶領零基礎學員透過生成式AI工具，從Excel VBA自動化開始，逐步理解如何與AI溝通需求、生成程式、修正問題，並延伸至近年熱門的Vibe Coding與Google Antigravity開發實作。",
    "isLocked": true,
    "duration": "3 小時",
    "prep": {
      "downloads": [
        {
          "type": "file",
          "name": "Google Antigravity安裝教學.pdf",
          "file": "prep/downloads/Google Antigravity安裝教學.pdf",
          "size": "1.54 MB"
        },
        {
          "type": "link",
          "name": "Google Antigravity下載路徑",
          "url": "https://antigravity.google/",
          "description": ""
        },
        {
          "type": "link",
          "name": "Python下載路徑",
          "url": "https://www.python.org/",
          "description": ""
        },
        {
          "type": "link",
          "name": "Node.js下載路徑",
          "url": "https://nodejs.org/zh-tw/download/",
          "description": ""
        }
      ],
      "pdfSlidesFile": "prep/downloads/Google Antigravity安裝教學.pdf"
    }
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = COURSE_CATALOG;
}
