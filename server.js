const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.zip': 'application/zip',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8'
};

const crypto = require('crypto');

function saveCourse(data, res) {
  const {
    courseId,
    title,
    date,
    instructor,
    duration,
    description,
    isLocked,
    password,
    prepSlidesFile,
    contentSlidesFile,
    files,
    isEditMode,
    isContentUnlocked,
    prepReminder,
    contentReminder,
    assignmentUrl
  } = data;
  
  if (!courseId || !title || !date || !instructor || !duration) {
    res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ success: false, error: '缺少必要欄位！' }));
    return;
  }
  
  const hash = isLocked ? crypto.createHash('sha256').update(password).digest('hex') : '';
  const contentDirName = isLocked ? hash : courseId;
  
  // Find old hashed directory if editing
  let oldContentDirName = null;
  let oldDataJson = null;
  if (isEditMode) {
    const coursesParentPath = path.join(__dirname, 'courses');
    if (fs.existsSync(coursesParentPath)) {
      const items = fs.readdirSync(coursesParentPath);
      for (const item of items) {
        const itemPath = path.join(coursesParentPath, item);
        const stat = fs.statSync(itemPath);
        if (stat.isDirectory() && /^[a-f0-9]{64}$/i.test(item)) {
          const dataJsonPath = path.join(itemPath, 'data.json');
          if (fs.existsSync(dataJsonPath)) {
            try {
              const data = JSON.parse(fs.readFileSync(dataJsonPath, 'utf8'));
              if (data.courseId === courseId) {
                oldContentDirName = item;
                oldDataJson = data;
                break;
              }
            } catch (e) {}
          }
        }
      }
    }
  }

  // If old hashed directory exists and hash has changed, rename it first
  if (oldContentDirName && contentDirName !== oldContentDirName) {
    const oldDir = path.join(__dirname, 'courses', oldContentDirName);
    const newDir = path.join(__dirname, 'courses', contentDirName);
    try {
      if (fs.existsSync(oldDir)) {
        if (fs.existsSync(newDir)) {
          fs.rmSync(newDir, { recursive: true, force: true });
        }
        fs.renameSync(oldDir, newDir);
        console.log(`Renamed hashed directory from ${oldContentDirName} to ${contentDirName}`);
      }
    } catch (err) {
      console.error('Rename hashed directory failed:', err);
    }
  }
  
  const prepDirPath = path.join(__dirname, 'courses', courseId, 'prep', 'downloads');
  const contentDirPath = path.join(__dirname, 'courses', contentDirName, 'downloads');
  
  try {
    fs.mkdirSync(prepDirPath, { recursive: true });
    fs.mkdirSync(contentDirPath, { recursive: true });
  } catch (err) {
    console.error('建立資料夾失敗:', err);
    res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ success: false, error: '建立伺服器資料夾失敗' }));
    return;
  }
  
  const prepDownloads = [];
  const contentDownloads = [];
  
  for (const file of files) {
    const isLink = file.type === 'link';
    if (isLink) {
      const { name, url, description, category } = file;
      const linkObj = {
        type: 'link',
        name,
        url,
        description
      };
      if (category === 'prep') {
        prepDownloads.push(linkObj);
      } else {
        contentDownloads.push(linkObj);
      }
      continue;
    }

    const { name, size, category, base64, isNew } = file;
    const fileDestDir = category === 'prep' ? prepDirPath : contentDirPath;
    const fileDestPath = path.join(fileDestDir, name);
    
    if (isNew && base64) {
      try {
        const base64Data = base64.includes(';base64,') ? base64.split(';base64,')[1] : base64;
        const buffer = Buffer.from(base64Data, 'base64');
        fs.writeFileSync(fileDestPath, buffer);
        console.log(`已儲存檔案: ${fileDestPath}`);
      } catch (err) {
        console.error(`寫入檔案 ${name} 失敗:`, err);
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, error: `寫入檔案 ${name} 失敗` }));
        return;
      }
    }
    
    const fileObj = {
      type: 'file',
      name,
      file: category === 'prep' ? `prep/downloads/${name}` : `downloads/${name}`,
      size
    };

    if (category === 'prep') {
      prepDownloads.push(fileObj);
    } else {
      contentDownloads.push(fileObj);
    }
  }
  
  // If editing and content is locked, merge existing content downloads
  if (isEditMode && !isContentUnlocked && oldDataJson) {
    if (oldDataJson.downloads) {
      for (const dl of oldDataJson.downloads) {
        contentDownloads.push(dl);
      }
    }
  }
  
  let finalContentSlidesFile = contentSlidesFile;
  let finalContentReminder = contentReminder;
  let finalAssignmentUrl = assignmentUrl;
  
  if (isEditMode && !isContentUnlocked && oldDataJson) {
    if (!finalContentSlidesFile) {
      finalContentSlidesFile = oldDataJson.pdfSlidesFile;
    }
    if (typeof finalContentReminder === 'undefined' || finalContentReminder === '') {
      finalContentReminder = oldDataJson.reminder || '';
    }
    if (typeof finalAssignmentUrl === 'undefined' || finalAssignmentUrl === '') {
      finalAssignmentUrl = oldDataJson.assignmentUrl || '';
    }
  }

  const dataJsonContent = {
    courseId: courseId,
    downloads: contentDownloads
  };
  
  if (oldDataJson && oldDataJson.hints) {
    dataJsonContent.hints = oldDataJson.hints;
  }
  
  if (finalContentSlidesFile) {
    dataJsonContent.pdfSlidesFile = finalContentSlidesFile;
  }
  if (finalContentReminder) {
    dataJsonContent.reminder = finalContentReminder;
  }
  if (finalAssignmentUrl) {
    dataJsonContent.assignmentUrl = finalAssignmentUrl;
  }
  
  const dataJsonPath = path.join(__dirname, 'courses', contentDirName, 'data.json');
  try {
    fs.writeFileSync(dataJsonPath, JSON.stringify(dataJsonContent, null, 2), 'utf8');
    console.log(`已更新 data.json: ${dataJsonPath}`);
  } catch (err) {
    console.error('寫入 data.json 失敗:', err);
    res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ success: false, error: '寫入 data.json 失敗' }));
    return;
  }
  
  const configJsPath = path.join(__dirname, 'config.js');
  let catalog = [];
  
  try {
    if (fs.existsSync(configJsPath)) {
      delete require.cache[require.resolve('./config.js')];
      catalog = require('./config.js');
    }
  } catch (err) {
    console.error('讀取 config.js 失敗:', err);
  }
  
  const existingIdx = catalog.findIndex(c => c.id === courseId);
  const defaultDesc = isLocked 
    ? `這是 ${title} 的課程模組簡介。您可以在首頁直接點開此課程，並且透過密碼進入瀏覽。`
    : `這是 ${title} 的課程模組簡介。本課程無密碼保護，您可以直接進入瀏覽。`;
  
  let chosenDescription = description ? description.trim() : '';
  if (!chosenDescription) {
    chosenDescription = existingIdx > -1 ? catalog[existingIdx].description : defaultDesc;
  }
  
  const newCourseObject = {
    id: courseId,
    title: title,
    date: date,
    instructor: instructor,
    description: chosenDescription,
    isLocked: isLocked,
    duration: duration,
    prep: {
      downloads: prepDownloads
    }
  };
  
  if (prepSlidesFile) {
    newCourseObject.prep.pdfSlidesFile = prepSlidesFile;
  }
  
  if (prepReminder) {
    newCourseObject.prep.reminder = prepReminder;
  }
  
  if (existingIdx > -1) {
    catalog[existingIdx] = newCourseObject;
  } else {
    catalog.push(newCourseObject);
  }
  
  const configContent = `// Global configuration for the Course Learning Hub
// This file is public and list the metadata for all courses.
// Secrets, slide structures, and actual download files are hidden inside the hashed folders.

const COURSE_CATALOG = ${JSON.stringify(catalog, null, 2)};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = COURSE_CATALOG;
}
`;
  
  try {
    fs.writeFileSync(configJsPath, configContent, 'utf8');
    console.log(`已成功更新 config.js`);
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ success: true, courseId }));
  } catch (err) {
    console.error('寫入 config.js 失敗:', err);
    res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ success: false, error: '寫入 config.js 失敗' }));
  }
}

function deleteCourse(courseId, res) {
  const configJsPath = path.join(__dirname, 'config.js');
  let catalog = [];
  
  try {
    if (fs.existsSync(configJsPath)) {
      delete require.cache[require.resolve('./config.js')];
      catalog = require('./config.js');
    }
  } catch (err) {
    console.error('讀取 config.js 失敗:', err);
  }
  
  const courseIdx = catalog.findIndex(c => c.id === courseId);
  if (courseIdx === -1) {
    res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ success: false, error: '找不到該課程！' }));
    return;
  }
  
  // 1. Delete course public directory
  const publicDirPath = path.join(__dirname, 'courses', courseId);
  try {
    if (fs.existsSync(publicDirPath)) {
      fs.rmSync(publicDirPath, { recursive: true, force: true });
      console.log(`已刪除公開課程目錄: ${publicDirPath}`);
    }
  } catch (err) {
    console.error(`刪除公開目錄 ${publicDirPath} 失敗:`, err);
  }
  
  // 2. Scan and delete hashed directory
  const coursesParentPath = path.join(__dirname, 'courses');
  try {
    if (fs.existsSync(coursesParentPath)) {
      const items = fs.readdirSync(coursesParentPath);
      for (const item of items) {
        const itemPath = path.join(coursesParentPath, item);
        const stat = fs.statSync(itemPath);
        if (stat.isDirectory() && /^[a-f0-9]{64}$/i.test(item)) {
          const dataJsonPath = path.join(itemPath, 'data.json');
          if (fs.existsSync(dataJsonPath)) {
            try {
              const data = JSON.parse(fs.readFileSync(dataJsonPath, 'utf8'));
              if (data.courseId === courseId) {
                fs.rmSync(itemPath, { recursive: true, force: true });
                console.log(`已刪除雜湊課程目錄: ${itemPath}`);
              }
            } catch (jsonErr) {
              // Ignore invalid JSON
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('掃描與刪除雜湊目錄失敗:', err);
  }
  
  // 3. Remove from catalog
  catalog.splice(courseIdx, 1);
  
  const configContent = `// Global configuration for the Course Learning Hub
// This file is public and list the metadata for all courses.
// Secrets, slide structures, and actual download files are hidden inside the hashed folders.

const COURSE_CATALOG = ${JSON.stringify(catalog, null, 2)};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = COURSE_CATALOG;
}
`;
  
  try {
    fs.writeFileSync(configJsPath, configContent, 'utf8');
    console.log(`已成功更新 config.js`);
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ success: true }));
  } catch (err) {
    console.error('寫入 config.js 失敗:', err);
    res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ success: false, error: '更新 config.js 失敗' }));
  }
}

const server = http.createServer((req, res) => {
  // 1. 解析與解碼網址 (支援中文檔名)
  let urlPath = req.url.split('?')[0];
  let decodedPath = '';
  try {
    decodedPath = decodeURIComponent(urlPath);
  } catch (e) {
    decodedPath = urlPath;
  }

  // Intercept API routes
  if (req.method === 'POST' && decodedPath === '/api/save-course') {
    let body = [];
    req.on('data', chunk => {
      body.push(chunk);
      // Protect against extremely large payloads (e.g. limit to 100MB)
      let currentLength = Buffer.concat(body).length;
      if (currentLength > 100 * 1024 * 1024) {
        req.destroy();
        res.writeHead(413, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, error: '檔案大小超出限制！' }));
      }
    }).on('end', () => {
      try {
        const payloadStr = Buffer.concat(body).toString('utf8');
        const payload = JSON.parse(payloadStr);
        saveCourse(payload, res);
      } catch (err) {
        console.error('解析儲存課程請求 JSON 失敗:', err);
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, error: '無效的 JSON 格式' }));
      }
    });
    return;
  }

  if (req.method === 'POST' && decodedPath === '/api/delete-course') {
    let body = [];
    req.on('data', chunk => {
      body.push(chunk);
    }).on('end', () => {
      try {
        const payloadStr = Buffer.concat(body).toString('utf8');
        const payload = JSON.parse(payloadStr);
        deleteCourse(payload.courseId, res);
      } catch (err) {
        console.error('解析刪除課程請求 JSON 失敗:', err);
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, error: '無效的 JSON 格式' }));
      }
    });
    return;
  }

  // 2. 設定預設首頁
  if (decodedPath === '/') {
    decodedPath = '/index.html';
  }

  // 3. 確保路徑安全，防止目錄穿越
  const safePath = path.normalize(decodedPath).replace(/^(\.\.(\/|\\|$))+/, '');
  const filePath = path.join(__dirname, safePath);

  // 4. 讀取檔案並回傳
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // 檔案不存在
      console.log(`\x1b[31m[404] Not Found: ${decodedPath}\x1b[0m`);
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('找不到網頁 (404 Not Found)');
      return;
    }

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        console.log(`\x1b[31m[500] Error reading: ${decodedPath}\x1b[0m`);
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('伺服器錯誤 (500 Internal Server Error)');
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      // 支援跨域請求 (以防萬一)
      res.writeHead(200, {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Cache-Control': 'no-cache'
      });
      res.end(content);
      console.log(`\x1b[32m[200] OK: ${decodedPath}\x1b[0m`);
    });
  });
});

// 監聽錯誤事件 (例如連接埠被佔用)
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n\x1b[31m[錯誤] 連接埠 ${PORT} 已被佔用！\x1b[0m`);
    console.error(`請關閉其他正在運行此伺服器的視窗，或是其他佔用 ${PORT} 的程式。`);
    console.error(`您也可以在工作管理員中結束 "Node.js JavaScript Runtime" 程序。\n`);
  } else {
    console.error(`\n\x1b[31m[伺服器錯誤] ${err.message}\x1b[0m\n`);
  }
  process.exit(1);
});

// 啟動伺服器
server.listen(PORT, () => {
  console.log('==========================================');
  console.log('  Learning Hub - 課程學習中心 本地伺服器  ');
  console.log('==========================================');
  console.log(' 伺服器已成功啟動！');
  console.log(' 正在為您自動開啟網站網頁...');
  console.log('\n    \x1b[36m\x1b[1mhttp://localhost:8080\x1b[0m');
  console.log('\n 提示: 按 \x1b[33mCtrl + C\x1b[0m 可以關閉伺服器。');
  console.log('==========================================');
  console.log('伺服器連線紀錄:');

  // 自動開啟預設瀏覽器
  const url = `http://localhost:${PORT}`;
  const startCmd = process.platform === 'win32' ? `start ${url}` :
                   process.platform === 'darwin' ? `open ${url}` :
                   `xdg-open ${url}`;
  require('child_process').exec(startCmd);
});
