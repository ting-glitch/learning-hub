const http = require('http');
const fs = require('fs');
const path = require('path');

const API_SAVE_URL = 'http://localhost:8080/api/save-course';
const API_DELETE_URL = 'http://localhost:8080/api/delete-course';

// Utility helper to perform POST requests
function postJSON(url, payload) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const postData = JSON.stringify(payload);
    
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = http.request(options, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: JSON.parse(body)
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            rawBody: body
          });
        }
      });
    });
    
    req.on('error', (e) => reject(e));
    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('Starting API validation tests for Reference Links & Sorting...');
  
  // Test Course Data containing files and links in a specific order:
  // 1. Reference Link (Prep)
  // 2. PDF Slide File (Prep)
  // 3. Zip file (Content)
  // 4. Reference Link (Content)
  const testCourse = {
    courseId: 'sorting-test-course',
    title: '排序與連結測試課程',
    date: '2026-07-15',
    instructor: 'Sorting Tester',
    duration: '4 小時',
    description: '自訂的測試簡介內容',
    isLocked: true,
    password: 'sortpassword',
    prepSlidesFile: 'prep/downloads/test_prep_slides.pdf',
    contentSlidesFile: '',
    files: [
      {
        type: 'link',
        name: '課前安裝指南網址',
        url: 'https://docs.docker.com/get-docker/',
        description: 'Docker 下載官網，請於課前安裝完成',
        category: 'prep'
      },
      {
        type: 'file',
        name: 'test_prep_slides.pdf',
        size: '1.5 MB',
        category: 'prep',
        isNew: true,
        base64: 'data:application/pdf;base64,JVBERi0xLjQKJcfsj6y...='
      },
      {
        type: 'file',
        name: 'test_exercise.zip',
        size: '10 MB',
        category: 'content',
        isNew: true,
        base64: 'UEsDBBQAAAAIA...'
      },
      {
        type: 'link',
        name: '正式課後問卷',
        url: 'https://forms.google.com/test',
        description: '請於課後協助填寫滿意度問卷',
        category: 'content'
      }
    ]
  };

  try {
    // 1. Send save-course request
    console.log('\n--- Test 1: Saving Course with Links & Custom Order ---');
    const saveRes = await postJSON(API_SAVE_URL, testCourse);
    console.log('Save response status:', saveRes.statusCode);
    console.log('Save response data:', saveRes.data);
    
    if (saveRes.statusCode !== 200 || !saveRes.data.success) {
      throw new Error('Save course request failed');
    }
    
    // 2. Verify on disk
    console.log('\n--- Test 2: Verifying Disk Changes & Ordering ---');
    const coursePath = path.join(__dirname, '..', 'courses', 'sorting-test-course');
    const prepSlidesPath = path.join(coursePath, 'prep', 'downloads', 'test_prep_slides.pdf');
    
    const hash = 'e698bcec134086d1c134720a49b12e8beb40bcb50bf395110e9467114c5efd47'; // Correct SHA256 of sortpassword
    const hashedCoursePath = path.join(__dirname, '..', 'courses', hash);
    const contentFilePath = path.join(hashedCoursePath, 'downloads', 'test_exercise.zip');
    const dataJsonPath = path.join(hashedCoursePath, 'data.json');
    const configJsPath = path.join(__dirname, '..', 'config.js');
    
    console.log('Verifying prep file written:', fs.existsSync(prepSlidesPath));
    console.log('Verifying content file written:', fs.existsSync(contentFilePath));
    console.log('Verifying data.json written:', fs.existsSync(dataJsonPath));
    
    if (!fs.existsSync(prepSlidesPath) || !fs.existsSync(contentFilePath) || !fs.existsSync(dataJsonPath)) {
      throw new Error('Disk files write verification failed');
    }
    
    // Verify config.js contains the prep items in correct order
    delete require.cache[require.resolve('../config.js')];
    const catalog = require('../config.js');
    const courseInCatalog = catalog.find(c => c.id === 'sorting-test-course');
    console.log('Found course in catalog:', !!courseInCatalog);
    
    if (!courseInCatalog) {
      throw new Error('Course not found in config.js catalog');
    }
    
    console.log('Catalog Description:', courseInCatalog.description);
    if (courseInCatalog.description !== '自訂的測試簡介內容') {
      throw new Error('Course description was not saved correctly!');
    }
    
    console.log('Catalog Prep downloads order:', courseInCatalog.prep.downloads);
    if (courseInCatalog.prep.downloads.length !== 2) {
      throw new Error('Prep downloads length is not 2');
    }
    if (courseInCatalog.prep.downloads[0].type !== 'link' || courseInCatalog.prep.downloads[1].type !== 'file') {
      throw new Error('Prep downloads sorting order or type mapping failed!');
    }
    
    // Verify data.json contains the content items in correct order
    const dataJson = JSON.parse(fs.readFileSync(dataJsonPath, 'utf8'));
    console.log('data.json downloads order:', dataJson.downloads);
    if (dataJson.downloads.length !== 2) {
      throw new Error('data.json downloads length is not 2');
    }
    if (dataJson.downloads[0].type !== 'file' || dataJson.downloads[1].type !== 'link') {
      throw new Error('Content downloads sorting order or type mapping failed!');
    }
    
    // --- Test 2.5: Editing course while content is locked ---
    console.log('\n--- Test 2.5: Editing Course while Content is Locked ---');
    const editPayload = {
      courseId: 'sorting-test-course',
      title: '排序與連結測試課程已更新',
      date: '2026-07-15',
      instructor: 'Sorting Tester',
      duration: '4 小時',
      description: '自訂的測試簡介內容',
      isLocked: true,
      password: 'sortpassword',
      prepSlidesFile: 'prep/downloads/test_prep_slides.pdf',
      contentSlidesFile: '',
      files: [
        {
          type: 'link',
          name: '課前安裝指南網址',
          url: 'https://docs.docker.com/get-docker/',
          description: 'Docker 下載官網，請於課前安裝完成',
          category: 'prep'
        },
        {
          type: 'file',
          name: 'test_prep_slides.pdf',
          size: '1.5 MB',
          category: 'prep',
          isNew: false
        }
      ],
      isEditMode: true,
      isContentUnlocked: false
    };
    
    const editRes = await postJSON(API_SAVE_URL, editPayload);
    console.log('Edit response status:', editRes.statusCode);
    console.log('Edit response data:', editRes.data);
    
    if (editRes.statusCode !== 200 || !editRes.data.success) {
      throw new Error('Edit course request failed');
    }
    
    // Verify data.json on disk STILL contains the content downloads!
    const dataJsonAfterEdit = JSON.parse(fs.readFileSync(dataJsonPath, 'utf8'));
    console.log('data.json downloads after edit:', dataJsonAfterEdit.downloads);
    if (dataJsonAfterEdit.downloads.length !== 2) {
      throw new Error('Content downloads were overwritten or lost!');
    }
    if (dataJsonAfterEdit.downloads[0].type !== 'file' || dataJsonAfterEdit.downloads[1].type !== 'link') {
      throw new Error('Content downloads data corrupted!');
    }
    
    // Verify config.js contains the updated course title
    delete require.cache[require.resolve('../config.js')];
    const updatedCatalog = require('../config.js');
    const updatedCourse = updatedCatalog.find(c => c.id === 'sorting-test-course');
    console.log('Updated Title in config.js:', updatedCourse.title);
    if (updatedCourse.title !== '排序與連結測試課程已更新') {
      throw new Error('Course title was not updated!');
    }
    
    // --- Test 2.6: Changing Password / Hashed Directory ---
    console.log('\n--- Test 2.6: Changing Password & Verifying Hashed Directory Renaming ---');
    const pwdChangePayload = {
      courseId: 'sorting-test-course',
      title: '排序與連結測試課程已更新',
      date: '2026-07-15',
      instructor: 'Sorting Tester',
      duration: '4 小時',
      description: '自訂的測試簡介內容',
      isLocked: true,
      password: 'newsortpassword', // password changed!
      prepSlidesFile: 'prep/downloads/test_prep_slides.pdf',
      contentSlidesFile: '',
      files: [
        {
          type: 'link',
          name: '課前安裝指南網址',
          url: 'https://docs.docker.com/get-docker/',
          description: 'Docker 下載官網，請於課前安裝完成',
          category: 'prep'
        },
        {
          type: 'file',
          name: 'test_prep_slides.pdf',
          size: '1.5 MB',
          category: 'prep',
          isNew: false
        }
      ],
      isEditMode: true,
      isContentUnlocked: false
    };
    
    const pwdChangeRes = await postJSON(API_SAVE_URL, pwdChangePayload);
    console.log('Password Change response status:', pwdChangeRes.statusCode);
    console.log('Password Change response data:', pwdChangeRes.data);
    
    if (pwdChangeRes.statusCode !== 200 || !pwdChangeRes.data.success) {
      throw new Error('Password Change request failed');
    }
    
    // Verify directory renamed and files preserved
    const newHash = '826fbaaf0b53d5e16ff25b903b743164c4cedbae956e44c960ba43d7818be381'; // SHA256 of newsortpassword
    const newHashedCoursePath = path.join(__dirname, '..', 'courses', newHash);
    const newContentFilePath = path.join(newHashedCoursePath, 'downloads', 'test_exercise.zip');
    const newDataJsonPath = path.join(newHashedCoursePath, 'data.json');
    
    console.log('Old hashed folder deleted:', !fs.existsSync(hashedCoursePath));
    console.log('New hashed folder created:', fs.existsSync(newHashedCoursePath));
    console.log('Content file exists under new hash:', fs.existsSync(newContentFilePath));
    console.log('data.json exists under new hash:', fs.existsSync(newDataJsonPath));
    
    if (fs.existsSync(hashedCoursePath) || !fs.existsSync(newHashedCoursePath) || !fs.existsSync(newContentFilePath) || !fs.existsSync(newDataJsonPath)) {
      throw new Error('Hashed directory renaming or file migration failed!');
    }
    
    console.log('\n--- Test 3: Deleting Test Course ---');
    const deleteRes = await postJSON(API_DELETE_URL, { courseId: 'sorting-test-course' });
    console.log('Delete response status:', deleteRes.statusCode);
    
    if (deleteRes.statusCode !== 200 || !deleteRes.data.success) {
      throw new Error('Delete course request failed');
    }
    
    console.log('Verifying cleanups...');
    console.log('Prep slides deleted:', !fs.existsSync(prepSlidesPath));
    console.log('New hashed folder deleted:', !fs.existsSync(newHashedCoursePath));
    
    if (fs.existsSync(prepSlidesPath) || fs.existsSync(newHashedCoursePath)) {
      throw new Error('Directory cleanup failed!');
    }
    
    console.log('\n🎉 ALL REFERENCE LINKS AND SORTING TESTS PASSED SUCCESSFULLY!');
  } catch (error) {
    console.error('\n❌ Test execution failed:', error.message);
    process.exit(1);
  }
}

runTests();
