// App JS - Course Learning Hub Logic

// App State
let currentView = 'home';
let currentCourseId = null;
let currentTab = 'prep'; // 'prep' or 'content'
let currentSlideIndex = 1;
let totalSlides = 1;
let slidesPattern = '';
let activeCourseData = null; // Unlocked data.json details for the course
let slideshowInterval = null;
let isSlideshowPlaying = false;
let pendingDownload = null; // { name, file }
let currentPdfDoc = null;
let currentRenderTask = null;

// Cache generated files for admin downloads
let generatedDataJson = null;
let generatedConfigJs = null;
let adminMode = 'new'; // 'new' or 'edit'
let isContentUnlocked = false;

// DOM Elements Cache
// DOM Elements Cache
const elements = {
  headerLogo: document.getElementById('btn-header-logo'),
  navHome: document.getElementById('btn-nav-home'),
  navAdmin: document.getElementById('btn-nav-admin'),
  
  homeView: document.getElementById('home-view'),
  courseView: document.getElementById('course-view'),
  adminView: document.getElementById('admin-view'),
  
  courseListContainer: document.getElementById('course-list-container'),
  btnBackHome: document.getElementById('btn-back-home'),
  
  // Search & Filter
  searchInput: document.getElementById('search-input'),
  dateFilter: document.getElementById('date-filter'),
  
  // Course details
  detailBadge: document.getElementById('course-detail-badge'),
  detailDate: document.getElementById('course-detail-date'),
  detailTitle: document.getElementById('course-detail-title'),
  detailInstructor: document.getElementById('course-detail-instructor'),
  
  // Tabs
  tabPrep: document.getElementById('tab-btn-prep'),
  tabContent: document.getElementById('tab-btn-content'),
  
  // Locked Banner Containers
  viewerLockedBanner: document.getElementById('viewer-locked-banner'),
  viewerActiveContent: document.getElementById('viewer-active-content'),
  btnUnlockViewer: document.getElementById('btn-unlock-content-via-viewer'),
  
  downloadsLockedBanner: document.getElementById('downloads-locked-banner'),
  downloadsActiveContent: document.getElementById('downloads-active-content'),
  btnUnlockDownloads: document.getElementById('btn-unlock-content-via-downloads'),
  
  // Slide Viewer
  slideViewerTitle: document.getElementById('slide-viewer-title'),
  slideStage: document.getElementById('slide-stage'),
  activeSlideImg: document.getElementById('active-slide-img'),
  activeSlideCanvas: document.getElementById('active-slide-canvas'),
  slideLoading: document.getElementById('slide-loading'),
  btnSlidePrev: document.getElementById('btn-slide-prev'),
  btnSlideNext: document.getElementById('btn-slide-next'),
  btnSlidePrevOverlay: document.getElementById('btn-slide-prev-overlay'),
  btnSlideNextOverlay: document.getElementById('btn-slide-next-overlay'),
  slideNumber: document.getElementById('slide-number'),
  slideProgressBar: document.getElementById('slide-progress-bar'),
  thumbnailsContainer: document.getElementById('slide-thumbnails-container'),
  btnTogglePlay: document.getElementById('btn-toggle-play'),
  playIcon: document.getElementById('play-icon'),
  pauseIcon: document.getElementById('pause-icon'),
  btnFullscreen: document.getElementById('btn-fullscreen'),
  
  // Downloads
  downloadsCardTitle: document.getElementById('downloads-card-title'),
  materialListContainer: document.getElementById('material-list-container'),
  downloadsCardDesc: document.getElementById('downloads-card-desc'),
  
  // Auth Modal
  authModal: document.getElementById('auth-modal'),
  authCourseTitle: document.getElementById('auth-course-title'),
  inputCoursePwd: document.getElementById('input-course-pwd'),
  btnTogglePwdVisibility: document.getElementById('btn-toggle-pwd-visibility'),
  eyeOpenIcon: document.getElementById('eye-open-icon'),
  eyeClosedIcon: document.getElementById('eye-closed-icon'),
  authErrorMsg: document.getElementById('auth-error-msg'),
  btnCancelAuth: document.getElementById('btn-cancel-auth'),
  btnSubmitAuth: document.getElementById('btn-submit-auth'),
  authSpinner: document.getElementById('auth-spinner'),
  btnCloseAuth: document.getElementById('btn-close-auth'),

  // Admin Auth Modal
  adminAuthModal: document.getElementById('admin-auth-modal'),
  inputAdminPwd: document.getElementById('input-admin-pwd'),
  btnToggleAdminPwdVisibility: document.getElementById('btn-toggle-admin-pwd-visibility'),
  adminEyeOpenIcon: document.getElementById('admin-eye-open-icon'),
  adminEyeClosedIcon: document.getElementById('admin-eye-closed-icon'),
  adminAuthErrorMsg: document.getElementById('admin-auth-error-msg'),
  btnCancelAdminAuth: document.getElementById('btn-cancel-admin-auth'),
  btnSubmitAdminAuth: document.getElementById('btn-submit-admin-auth'),
  adminAuthSpinner: document.getElementById('admin-auth-spinner'),
  btnCloseAdminAuth: document.getElementById('btn-close-admin-auth'),
  
  // Terms Modal
  termsModal: document.getElementById('terms-modal'),
  termsFilename: document.getElementById('terms-filename'),
  chkAgreeTerms: document.getElementById('chk-agree-terms'),
  btnCancelTerms: document.getElementById('btn-cancel-terms'),
  btnConfirmDownload: document.getElementById('btn-confirm-download'),
  btnCloseTerms: document.getElementById('btn-close-terms'),
  
  // Toast
  toast: document.getElementById('toast-notification'),
  toastMessageText: document.getElementById('toast-message-text'),
  
  // Dynamic Admin Form Elements
  formCourseId: document.getElementById('form-course-id'),
  btnGenerateId: document.getElementById('btn-generate-id'),
  formCourseTitle: document.getElementById('form-course-title'),
  formCourseDate: document.getElementById('form-course-date'),
  formCourseInstructor: document.getElementById('form-course-instructor'),
  formCourseDuration: document.getElementById('form-course-duration'),
  formCourseDescription: document.getElementById('form-course-description'),
  formCoursePwd: document.getElementById('form-course-pwd'),
  formCoursePwdToggle: document.getElementById('form-course-pwd-toggle'),
  
  formPrepPdfHint: document.getElementById('admin-prep-pdf-hint'),
  formPrepSlidesPdf: document.getElementById('form-prep-slides-pdf'),
  formContentPdfHint: document.getElementById('admin-content-pdf-hint'),
  formContentSlidesPdf: document.getElementById('form-content-slides-pdf'),
  tableUnifiedFiles: document.getElementById('table-unified-files').querySelector('tbody'),
  btnAddFileRow: document.getElementById('btn-add-file-row'),
  btnAddLinkRow: document.getElementById('btn-add-link-row'),
  formUploadFiles: document.getElementById('form-upload-files'),
  
  btnAdminSubmit: document.getElementById('btn-admin-submit'),
  btnAdminReset: document.getElementById('btn-admin-reset'),
  btnAdminDelete: document.getElementById('btn-admin-delete'),
  
  adminResultArea: document.getElementById('admin-result-area'),
  adminFolderName: document.getElementById('admin-result-foldername'),
  adminResultShell: document.getElementById('admin-result-shell'),
  btnDownloadDataJson: document.getElementById('btn-download-data-json'),
  btnDownloadConfigJs: document.getElementById('btn-download-config-js'),
  
  // Admin Mode Toggles
  adminTabNew: document.getElementById('btn-admin-mode-new'),
  adminTabEdit: document.getElementById('btn-admin-mode-edit'),
  adminFormTitle: document.getElementById('admin-form-title'),
  adminFormSubtitle: document.getElementById('admin-form-subtitle'),
  adminEditSelectorContainer: document.getElementById('admin-edit-course-selector-container'),
  selectEditCourse: document.getElementById('form-select-edit-course'),
  adminEditLoaderMethods: document.getElementById('admin-edit-loader-methods'),
  inputEditCoursePwd: document.getElementById('form-edit-course-pwd'),
  btnAdminLoadByPwd: document.getElementById('btn-admin-load-by-pwd'),
  inputEditCourseFile: document.getElementById('form-edit-course-file'),
  adminEditLoadStatus: document.getElementById('admin-edit-load-status')
};

// --- UTILITY FUNCTIONS ---

// SHA-256 Encryption Helper
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message.trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Get unlocked course hash from session
function getUnlockedHash(courseId) {
  return sessionStorage.getItem(`unlocked_${courseId}`);
}

// Set unlocked course hash in session
function setUnlockedHash(courseId, hash) {
  sessionStorage.setItem(`unlocked_${courseId}`, hash);
}

// Display Toast Notification
function showToast(message, isSuccess = true) {
  elements.toastMessageText.textContent = message;
  const icon = elements.toast.querySelector('.toast-icon');
  if (isSuccess) {
    icon.className = 'toast-icon text-success';
    icon.innerHTML = '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>';
  } else {
    icon.className = 'toast-icon text-error';
    icon.innerHTML = '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>';
  }
  
  elements.toast.classList.add('active');
  setTimeout(() => {
    elements.toast.classList.remove('active');
  }, 3000);
}

// Get file extension label
function getFileExtension(filename) {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
}

// Check if Prep files for a course are unlocked (on or before course date)
function checkPrepUnlocked(courseDateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const courseDate = new Date(courseDateStr);
  courseDate.setHours(0, 0, 0, 0);
  
  // Prep is unlocked if today is on or before the course date
  return today <= courseDate;
}

// --- ROUTING & VIEW CONTROLLER ---

function navigateTo(hashPath) {
  window.location.hash = hashPath;
}

function handleRoute() {
  const hash = window.location.hash || '#/';
  
  // Stop slide playback if page changes
  stopSlideshow();
  
  if (hash === '#/' || hash === '#') {
    switchView('home');
  } else if (hash.startsWith('#/course/')) {
    const courseId = hash.replace('#/course/', '');
    const course = COURSE_CATALOG.find(c => c.id === courseId);
    if (course) {
      currentCourseId = courseId;
      currentTab = 'prep'; // Reset to prep tab by default
      checkCourseAccess(course);
    } else {
      showToast('找不到該課程', false);
      navigateTo('#/');
    }
  } else if (hash === '#/admin-tools' || hash === '#admin-tools') {
    checkAdminAccess();
  } else {
    navigateTo('#/');
  }
}

// Admin Security Access Interception
function checkAdminAccess() {
  if (sessionStorage.getItem("admin_authenticated") === "true") {
    switchView('admin');
  } else {
    // Revert URL hash to previous view so they don't stay on #/admin-tools while locked
    window.location.hash = currentView === 'course' ? `#/course/${currentCourseId}` : '#/';
    openAdminAuthModal();
  }
}

function openAdminAuthModal() {
  elements.inputAdminPwd.value = '';
  elements.adminAuthErrorMsg.classList.add('hidden');
  elements.adminAuthSpinner.classList.add('hidden');
  elements.btnSubmitAdminAuth.removeAttribute('disabled');
  elements.adminAuthModal.classList.add('active');
  elements.inputAdminPwd.focus();
}

function closeAdminAuthModal() {
  elements.adminAuthModal.classList.remove('active');
}

async function handleAdminAuthSubmit() {
  const password = elements.inputAdminPwd.value;
  if (!password) {
    elements.inputAdminPwd.focus();
    return;
  }
  
  elements.adminAuthSpinner.classList.remove('hidden');
  elements.btnSubmitAdminAuth.setAttribute('disabled', 'true');
  elements.adminAuthErrorMsg.classList.add('hidden');
  
  try {
    const hash = await sha256(password);
    // Hash of admin123 is 240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9
    if (hash === '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9') {
      sessionStorage.setItem("admin_authenticated", "true");
      closeAdminAuthModal();
      showToast('管理員驗證成功！', true);
      navigateTo('#/admin-tools');
    } else {
      throw new Error('Wrong admin password');
    }
  } catch (error) {
    elements.adminAuthSpinner.classList.add('hidden');
    elements.btnSubmitAdminAuth.removeAttribute('disabled');
    elements.adminAuthErrorMsg.classList.remove('hidden');
    elements.inputAdminPwd.focus();
  }
}

function switchView(viewName) {
  currentView = viewName;
  
  // Navigation active links
  elements.navHome.classList.toggle('active', viewName === 'home');
  elements.navAdmin.classList.toggle('active', viewName === 'admin');
  
  // Views toggle
  elements.homeView.classList.toggle('active', viewName === 'home');
  elements.courseView.classList.toggle('active', viewName === 'course');
  elements.adminView.classList.toggle('active', viewName === 'admin');
  
  if (viewName === 'home') {
    renderCourseCatalog();
  } else if (viewName === 'admin') {
    switchAdminMode('new');
  }
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- RENDERING HOMEPAGE CATALOG ---

function renderCourseCatalog() {
  elements.courseListContainer.innerHTML = '';
  
  const searchQuery = (elements.searchInput.value || '').trim().toLowerCase();
  const dateFilter = elements.dateFilter.value;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // 1. Filter courses
  let filtered = COURSE_CATALOG.filter(course => {
    // Search match (title, instructor, or description)
    const matchSearch = !searchQuery || 
      course.title.toLowerCase().includes(searchQuery) ||
      course.instructor.toLowerCase().includes(searchQuery) ||
      course.description.toLowerCase().includes(searchQuery);
      
    // Date filter match
    const cDate = new Date(course.date);
    cDate.setHours(0, 0, 0, 0);
    
    let matchDate = true;
    if (dateFilter === 'upcoming') {
      matchDate = cDate >= today;
    } else if (dateFilter === 'past') {
      matchDate = cDate < today;
    } else if (dateFilter === 'this-month') {
      matchDate = cDate.getFullYear() === today.getFullYear() && cDate.getMonth() === today.getMonth();
    }
    
    return matchSearch && matchDate;
  });
  
  // 2. Sort courses by proximity to today's date (closest first)
  filtered.sort((a, b) => {
    const diffA = Math.abs(new Date(a.date) - today);
    const diffB = Math.abs(new Date(b.date) - today);
    return diffA - diffB;
  });
  
  if (filtered.length === 0) {
    elements.courseListContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-light);">沒有符合搜尋條件的課程。</div>';
    return;
  }
  
  // 3. Render cards
  filtered.forEach(course => {
    const unlockedHash = getUnlockedHash(course.id);
    const isPrepUnlocked = checkPrepUnlocked(course.date);
    const isFullyUnlocked = !course.isLocked || !!unlockedHash;
    
    const card = document.createElement('div');
    card.className = 'card course-card';
    card.id = `card-${course.id}`;
    
    // Add status class for top border coloring
    if (isFullyUnlocked) {
      card.classList.add('status-unlocked');
    } else if (isPrepUnlocked) {
      card.classList.add('status-prep');
    } else {
      card.classList.add('status-locked');
    }
    
    // Header
    const cardHeader = document.createElement('div');
    cardHeader.className = 'course-card-header';
    
    const formattedDate = course.date.replace(/-/g, '/');
    const dateBadge = document.createElement('span');
    dateBadge.className = 'badge badge-primary';
    dateBadge.textContent = formattedDate;
    
    const lockBadge = document.createElement('span');
    if (isFullyUnlocked) {
      lockBadge.className = 'badge badge-unlocked';
      lockBadge.innerHTML = `<svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>已完全解鎖`;
    } else if (isPrepUnlocked) {
      lockBadge.className = 'badge badge-prep';
      lockBadge.innerHTML = `<svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg>課前準備開放中`;
    } else {
      lockBadge.className = 'badge badge-lock';
      lockBadge.innerHTML = `<svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>需密碼解鎖`;
    }
    
    cardHeader.appendChild(dateBadge);
    cardHeader.appendChild(lockBadge);
    
    // Title
    const title = document.createElement('h3');
    title.className = 'course-card-title';
    title.textContent = course.title;
    
    // Description
    const desc = document.createElement('p');
    desc.className = 'course-card-desc';
    desc.textContent = course.description;
    
    // Footer details
    const footer = document.createElement('div');
    footer.className = 'course-card-footer';
    
    // Instructor badge inside footer
    const instructorBadge = document.createElement('div');
    instructorBadge.className = 'instructor-badge';
    instructorBadge.innerHTML = `<span class="instructor-avatar">${course.instructor.substring(0, 1)}</span><span class="instructor-name">${course.instructor}</span>`;
    
    // Dot separator
    const separator = document.createElement('span');
    separator.className = 'meta-separator';
    separator.textContent = '•';
    
    // Duration inside footer
    const duration = document.createElement('div');
    duration.className = 'course-card-duration';
    duration.innerHTML = `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg><span>時數: ${course.duration || 'N/A'}</span>`;
    
    footer.appendChild(instructorBadge);
    footer.appendChild(separator);
    footer.appendChild(duration);
    
    card.appendChild(cardHeader);
    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(footer);
    
    card.addEventListener('click', () => {
      navigateTo(`#/course/${course.id}`);
    });
    
    elements.courseListContainer.appendChild(card);
  });
}

// --- ACCESS CONTROL & SESSION VERIFICATION ---

function checkCourseAccess(course) {
  if (course.isLocked === false) {
    // Not locked, load course data directly using Course ID as the folder name!
    loadUnlockedCourseData(course.id, course.id);
    return;
  }
  
  const unlockedHash = getUnlockedHash(course.id);
  const isPrepUnlocked = checkPrepUnlocked(course.date);
  
  if (unlockedHash) {
    // Already fully unlocked in this session
    loadUnlockedCourseData(course.id, unlockedHash);
  } else if (isPrepUnlocked) {
    // Course date is today or future, Prep materials are free!
    // Enter course page directly but lock the Content tab.
    activeCourseData = null; // Private content not loaded yet
    renderCourseTabsLayout(false); // Locked Content Tab
  } else {
    // Date has passed, full lock prompt
    openAuthModal(course);
  }
}

function openAuthModal(course) {
  elements.authCourseTitle.textContent = course.title;
  elements.inputCoursePwd.value = '';
  elements.authErrorMsg.classList.add('hidden');
  elements.authSpinner.classList.add('hidden');
  elements.btnSubmitAuth.removeAttribute('disabled');
  elements.authModal.classList.add('active');
  elements.inputCoursePwd.focus();
}

function closeAuthModal() {
  elements.authModal.classList.remove('active');
  // If we cancel the auth modal and we don't have access, return to home
  const isPrepUnlocked = checkPrepUnlocked(COURSE_CATALOG.find(c => c.id === currentCourseId).date);
  const unlockedHash = getUnlockedHash(currentCourseId);
  
  if (!unlockedHash && !isPrepUnlocked) {
    navigateTo('#/');
  }
}

async function handleAuthSubmit() {
  const password = elements.inputCoursePwd.value;
  if (!password) {
    elements.inputCoursePwd.focus();
    return;
  }
  
  elements.authSpinner.classList.remove('hidden');
  elements.btnSubmitAuth.setAttribute('disabled', 'true');
  elements.authErrorMsg.classList.add('hidden');
  
  try {
    const hash = await sha256(password);
    const response = await fetch(`courses/${hash}/data.json`);
    
    if (response.ok) {
      const data = await response.json();
      setUnlockedHash(currentCourseId, hash);
      closeAuthModal();
      showToast('解鎖成功！已開啟完整正式內容。', true);
      
      activeCourseData = data;
      renderCourseTabsLayout(true); // Fully Unlocked
    } else {
      throw new Error('Wrong password');
    }
  } catch (error) {
    elements.authSpinner.classList.add('hidden');
    elements.btnSubmitAuth.removeAttribute('disabled');
    elements.authErrorMsg.classList.remove('hidden');
    elements.inputCoursePwd.focus();
  }
}

// Load private details using password hash
async function loadUnlockedCourseData(courseId, hash) {
  try {
    const response = await fetch(`courses/${hash}/data.json`);
    if (!response.ok) {
      throw new Error('Failed to fetch course data');
    }
    
    activeCourseData = await response.json();
    renderCourseTabsLayout(true); // Fully Unlocked
  } catch (error) {
    const course = COURSE_CATALOG.find(c => c.id === courseId);
    if (course && course.isLocked === false) {
      showToast('載入教材資料失敗，請聯絡管理員。', false);
    } else {
      showToast('載入私有教材失敗，請重新輸入密碼。', false);
      sessionStorage.removeItem(`unlocked_${courseId}`);
    }
    navigateTo('#/');
  }
}

// --- COURSE PAGE VIEW RENDERER ---

function renderCourseTabsLayout(isContentUnlocked) {
  const course = COURSE_CATALOG.find(c => c.id === currentCourseId);
  if (!course) return;
  
  // Set headers
  const formattedDate = course.date.replace(/-/g, '/');
  elements.detailTitle.textContent = course.title;
  elements.detailBadge.textContent = course.duration || '時數未知';
  elements.detailDate.textContent = formattedDate;
  elements.detailInstructor.textContent = course.instructor;
  
  switchTab(currentTab, isContentUnlocked);
  switchView('course');
}

function switchTab(tabName, isContentUnlocked) {
  currentTab = tabName;
  stopSlideshow();
  
  const course = COURSE_CATALOG.find(c => c.id === currentCourseId);
  const hasAccessToContent = (course && course.isLocked === false) || isContentUnlocked || !!getUnlockedHash(currentCourseId);
  
  // Toggle tab buttons class
  elements.tabPrep.classList.toggle('active', tabName === 'prep');
  elements.tabContent.classList.toggle('active', tabName === 'content');
  
  if (tabName === 'prep') {
    // Prep is always unlocked on details page
    elements.viewerLockedBanner.classList.add('hidden');
    elements.viewerActiveContent.classList.remove('hidden');
    elements.downloadsLockedBanner.classList.add('hidden');
    elements.downloadsActiveContent.classList.remove('hidden');
    
    renderPrepContent(course);
  } else {
    // Content tab
    if (hasAccessToContent) {
      elements.viewerLockedBanner.classList.add('hidden');
      elements.viewerActiveContent.classList.remove('hidden');
      elements.downloadsLockedBanner.classList.add('hidden');
      elements.downloadsActiveContent.classList.remove('hidden');
      
      renderMainContent();
    } else {
      // Locked content display
      elements.viewerActiveContent.classList.add('hidden');
      elements.viewerLockedBanner.classList.remove('hidden');
      
      elements.downloadsActiveContent.classList.add('hidden');
      elements.downloadsLockedBanner.classList.remove('hidden');
    }
  }
}

// Render "Course Prep" view
function renderPrepContent(course) {
  if (!course.prep) {
    elements.slideViewerTitle.innerHTML = `<svg class="icon text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>投影片線上瀏覽`;
    elements.thumbnailsContainer.innerHTML = '';
    elements.slideNumber.textContent = '第 0 / 0 頁';
    elements.slideProgressBar.style.width = '0%';
    elements.activeSlideImg.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><rect width="800" height="450" fill="%23f1f5f9"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16" fill="%2364748b">本課程無課前準備簡報</text></svg>';
    elements.activeSlideImg.classList.remove('hidden');
    elements.activeSlideCanvas.classList.add('hidden');
    
    elements.materialListContainer.innerHTML = '<div style="padding: 1.5rem; text-align: center; color: var(--text-light);">本課程無課前教材。</div>';
    return;
  }
  
  elements.slideViewerTitle.innerHTML = `<svg class="icon text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>課前準備簡報線上瀏覽`;
  elements.downloadsCardTitle.innerHTML = `<svg class="icon text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>課前準備教材下載`;
  elements.downloadsCardDesc.textContent = '請在課程開始前下載並閱讀以下課前準備教材：';
  
  const pathPrefix = `courses/${course.id}`;
  currentSlideIndex = 1;
  
  if (course.prep.pdfSlidesFile) {
    loadPdfSlides(`${pathPrefix}/${course.prep.pdfSlidesFile}`, pathPrefix);
  } else {
    currentPdfDoc = null;
    elements.activeSlideCanvas.classList.add('hidden');
    elements.activeSlideImg.classList.remove('hidden');
    elements.thumbnailsContainer.innerHTML = '';
    elements.slideNumber.textContent = '第 0 / 0 頁';
    elements.slideProgressBar.style.width = '0%';
    elements.activeSlideImg.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><rect width="800" height="450" fill="%23f1f5f9"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16" fill="%2364748b">本課程無課前準備簡報</text></svg>';
  }
  
  // Render Prep Downloads
  elements.materialListContainer.innerHTML = '';
  if (course.prep.downloads && course.prep.downloads.length > 0) {
    course.prep.downloads.forEach(dl => {
      renderFileRow(dl, `courses/${course.id}`);
    });
  } else {
    elements.materialListContainer.innerHTML = '<div style="padding: 1.5rem; text-align: center; color: var(--text-light);">本課程無課前教材。</div>';
  }
}

// Render unlocked "Course Content" view
function renderMainContent() {
  if (!activeCourseData) return;
  
  elements.slideViewerTitle.innerHTML = `<svg class="icon text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>正式課程簡報線上瀏覽`;
  elements.downloadsCardTitle.innerHTML = `<svg class="icon text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>正式課程教材下載`;
  elements.downloadsCardDesc.textContent = '供課後複習與練習使用，請下載所需教材檔案：';
  
  const course = COURSE_CATALOG.find(c => c.id === currentCourseId);
  const isLocked = course ? course.isLocked !== false : true;
  const pathPrefix = isLocked ? `courses/${getUnlockedHash(currentCourseId)}` : `courses/${currentCourseId}`;
  currentSlideIndex = 1;
  
  if (activeCourseData.pdfSlidesFile) {
    loadPdfSlides(`${pathPrefix}/${activeCourseData.pdfSlidesFile}`, pathPrefix);
  } else {
    currentPdfDoc = null;
    elements.activeSlideCanvas.classList.add('hidden');
    elements.activeSlideImg.classList.remove('hidden');
    elements.thumbnailsContainer.innerHTML = '';
    elements.slideNumber.textContent = '第 0 / 0 頁';
    elements.slideProgressBar.style.width = '0%';
    elements.activeSlideImg.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><rect width="800" height="450" fill="%23f1f5f9"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16" fill="%2364748b">本課程無正式課程簡報</text></svg>';
  }
  
  // Render Main Content Downloads
  elements.materialListContainer.innerHTML = '';
  if (!activeCourseData.downloads || activeCourseData.downloads.length === 0) {
    elements.materialListContainer.innerHTML = '<div style="padding: 1.5rem; text-align: center; color: var(--text-light);">本課程無正式教材。</div>';
    return;
  }
  activeCourseData.downloads.forEach(dl => {
    renderFileRow(dl, pathPrefix);
  });
}

// Render individual file downloads row or reference link row
function renderFileRow(fileData, rootPath) {
  const isLink = fileData.type === 'link' || !!fileData.url;
  
  const item = document.createElement('div');
  item.className = 'material-item';
  
  const info = document.createElement('div');
  info.className = 'material-info';
  
  const extBox = document.createElement('div');
  if (isLink) {
    extBox.className = 'file-icon-box';
    extBox.style.backgroundColor = 'var(--primary-light)';
    extBox.style.color = 'var(--primary)';
    extBox.style.border = '1px solid var(--primary-border)';
    extBox.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="icon" style="width: 18px; height: 18px;"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`;
  } else {
    const ext = getFileExtension(fileData.name);
    extBox.className = `file-icon-box ext-${ext || 'other'}`;
    extBox.textContent = ext.toUpperCase().substring(0, 4) || 'FILE';
  }
  
  const details = document.createElement('div');
  details.className = 'material-details';
  
  const nameSpan = document.createElement('span');
  nameSpan.className = 'material-name';
  nameSpan.textContent = fileData.name;
  nameSpan.title = fileData.name;
  
  const metaSpan = document.createElement('span');
  metaSpan.className = 'material-meta';
  
  if (isLink) {
    let metaHTML = `<span class="material-meta-link" title="${fileData.url}">連結: ${fileData.url}</span>`;
    if (fileData.description) {
      metaHTML += `<span class="meta-separator">•</span><span style="color: var(--text-medium); font-weight: 500;">說明: ${fileData.description}</span>`;
    }
    metaSpan.innerHTML = metaHTML;
  } else {
    metaSpan.innerHTML = `<span>大小: ${fileData.size}</span>`;
  }
  
  details.appendChild(nameSpan);
  details.appendChild(metaSpan);
  
  info.appendChild(extBox);
  info.appendChild(details);
  
  const btn = document.createElement('button');
  btn.className = 'btn btn-icon btn-download-action';
  if (isLink) {
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="icon"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>`;
    btn.title = '開啟連結';
  } else {
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`;
    btn.title = '下載檔案';
  }
  
  item.appendChild(info);
  item.appendChild(btn);
  
  // Click handler
  item.addEventListener('click', (e) => {
    e.preventDefault();
    if (isLink) {
      window.open(fileData.url, '_blank');
    } else {
      triggerDownloadAgreement(fileData, rootPath);
    }
  });
  
  elements.materialListContainer.appendChild(item);
}

// --- SLIDE VIEWER CONTROLLERS ---

async function loadPdfSlides(pdfUrl, pathPrefix) {
  elements.slideLoading.classList.add('active');
  elements.activeSlideImg.classList.add('hidden');
  elements.activeSlideCanvas.classList.remove('hidden');
  
  try {
    currentPdfDoc = await pdfjsLib.getDocument(pdfUrl).promise;
    totalSlides = currentPdfDoc.numPages;
    
    renderThumbnails(pathPrefix);
    displaySlide(currentSlideIndex, pathPrefix);
  } catch (error) {
    console.error('Failed to load PDF slides:', error);
    elements.slideLoading.classList.remove('active');
    currentPdfDoc = null;
    totalSlides = 1;
    
    // Fallback to error graphic on canvas
    const canvas = elements.activeSlideCanvas;
    const context = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 450;
    context.fillStyle = '#f1f5f9';
    context.fillRect(0, 0, 800, 450);
    context.fillStyle = '#64748b';
    context.font = '20px sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('PDF 簡報載入失敗', 400, 225);
    
    elements.slideNumber.textContent = '第 0 / 0 頁';
    elements.slideProgressBar.style.width = '0%';
  }
}

async function renderPdfPage(pageNumber) {
  if (!currentPdfDoc) return;
  
  // Cancel previous render task if active
  if (currentRenderTask) {
    try {
      currentRenderTask.cancel();
    } catch(e) {}
    currentRenderTask = null;
  }
  
  elements.slideLoading.classList.add('active');
  
  try {
    const page = await currentPdfDoc.getPage(pageNumber);
    const canvas = elements.activeSlideCanvas;
    const context = canvas.getContext('2d');
    
    // Scale up for high-DPI screens to prevent blurriness
    const scale = window.devicePixelRatio > 1 ? 2.0 : 1.5;
    const viewport = page.getViewport({ scale: scale });
    
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    const renderContext = {
      canvasContext: context,
      viewport: viewport
    };
    
    currentRenderTask = page.render(renderContext);
    await currentRenderTask.promise;
    currentRenderTask = null;
    elements.slideLoading.classList.remove('active');
  } catch (err) {
    if (err.name !== 'RenderingCancelledException') {
      console.error('PDF page render error:', err);
      elements.slideLoading.classList.remove('active');
    }
  }
}

function displaySlide(index, pathPrefix) {
  if (index < 1 || index > totalSlides) return;
  currentSlideIndex = index;
  
  elements.slideNumber.textContent = `第 ${index} / ${totalSlides} 頁`;
  const percentage = (index / totalSlides) * 100;
  elements.slideProgressBar.style.width = `${percentage}%`;
  
  elements.btnSlidePrev.disabled = index === 1;
  elements.btnSlidePrevOverlay.style.display = index === 1 ? 'none' : 'flex';
  
  elements.btnSlideNext.disabled = index === totalSlides;
  elements.btnSlideNextOverlay.style.display = index === totalSlides ? 'none' : 'flex';
  
  // Mark Active Thumbnail
  const thumbs = elements.thumbnailsContainer.querySelectorAll('.thumbnail-item');
  thumbs.forEach(t => {
    const isCurrent = parseInt(t.getAttribute('data-index')) === index;
    t.classList.toggle('active', isCurrent);
    if (isCurrent) {
      t.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  });

  if (currentPdfDoc) {
    renderPdfPage(index);
  } else {
    elements.slideLoading.classList.add('active');
    elements.activeSlideImg.classList.add('fade-out');
    
    const slidePath = slidesPattern.replace('{n}', index);
    const fullUrl = `${pathPrefix}/${slidePath}`;
    
    elements.activeSlideImg.src = fullUrl;
    
    elements.activeSlideImg.onload = () => {
      elements.slideLoading.classList.remove('active');
      elements.activeSlideImg.classList.remove('fade-out');
      elements.activeSlideImg.classList.add('fade-in');
    };
    
    elements.activeSlideImg.onerror = () => {
      elements.slideLoading.classList.remove('active');
      elements.activeSlideImg.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><rect width="800" height="450" fill="%23f1f5f9"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="20" fill="%2364748b">投影片載入失敗</text></svg>';
      elements.activeSlideImg.classList.remove('fade-out');
    };
  }
}

function renderThumbnails(pathPrefix) {
  elements.thumbnailsContainer.innerHTML = '';
  
  for (let i = 1; i <= totalSlides; i++) {
    const item = document.createElement('div');
    item.className = 'thumbnail-item';
    item.setAttribute('data-index', i);
    
    if (currentPdfDoc) {
      // PDF thumbnail: show a placeholder with PDF page number
      const placeholder = document.createElement('div');
      placeholder.className = 'pdf-thumbnail-placeholder';
      placeholder.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        <span>P. ${i}</span>
      `;
      item.appendChild(placeholder);
    } else {
      const img = document.createElement('img');
      const slidePath = slidesPattern.replace('{n}', i);
      img.src = `${pathPrefix}/${slidePath}`;
      img.alt = `Slide ${i}`;
      img.loading = 'lazy';
      item.appendChild(img);
    }
    
    item.addEventListener('click', () => {
      stopSlideshow();
      displaySlide(i, pathPrefix);
    });
    
    elements.thumbnailsContainer.appendChild(item);
  }
}

function nextSlide() {
  const isContent = currentTab === 'content';
  const pathPrefix = isContent ? `courses/${getUnlockedHash(currentCourseId)}` : `courses/${currentCourseId}`;
  
  if (currentSlideIndex < totalSlides) {
    displaySlide(currentSlideIndex + 1, pathPrefix);
  } else if (isSlideshowPlaying) {
    displaySlide(1, pathPrefix);
  }
}

function prevSlide() {
  const isContent = currentTab === 'content';
  const pathPrefix = isContent ? `courses/${getUnlockedHash(currentCourseId)}` : `courses/${currentCourseId}`;
  
  if (currentSlideIndex > 1) {
    displaySlide(currentSlideIndex - 1, pathPrefix);
  }
}

function toggleSlideshow() {
  if (isSlideshowPlaying) {
    stopSlideshow();
  } else {
    startSlideshow();
  }
}

function startSlideshow() {
  isSlideshowPlaying = true;
  elements.playIcon.classList.add('hidden');
  elements.pauseIcon.classList.remove('hidden');
  
  slideshowInterval = setInterval(() => {
    nextSlide();
  }, 3500);
}

function stopSlideshow() {
  isSlideshowPlaying = false;
  elements.playIcon.classList.remove('hidden');
  elements.pauseIcon.classList.add('hidden');
  
  if (slideshowInterval) {
    clearInterval(slideshowInterval);
    slideshowInterval = null;
  }
}

function toggleFullscreen() {
  const viewerCard = document.querySelector('.viewer-card');
  if (!document.fullscreenElement) {
    viewerCard.requestFullscreen().catch(() => {
      showToast('無法進入全螢幕模式', false);
    });
  } else {
    document.exitFullscreen();
  }
}

document.addEventListener('fullscreenchange', () => {
  const viewerCard = document.querySelector('.viewer-card');
  if (document.fullscreenElement) {
    viewerCard.classList.add('fullscreen-mode');
  } else {
    viewerCard.classList.remove('fullscreen-mode');
  }
});

// Touch Swipe Handlers for mobile
let touchStartX = 0;
let touchEndX = 0;
elements.slideStage.addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].screenX;
}, { passive: true });
elements.slideStage.addEventListener('touchend', e => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
}, { passive: true });

function handleSwipe() {
  const diff = touchStartX - touchEndX;
  const swipeThreshold = 50;
  if (diff > swipeThreshold) {
    stopSlideshow();
    nextSlide();
  } else if (diff < -swipeThreshold) {
    stopSlideshow();
    prevSlide();
  }
}

// --- CONTROLLED DOWNLOADS ---

function triggerDownloadAgreement(material, rootPath) {
  pendingDownload = {
    name: material.name,
    file: `${rootPath}/${material.file}`
  };
  elements.termsFilename.textContent = material.name;
  elements.chkAgreeTerms.checked = false;
  elements.btnConfirmDownload.setAttribute('disabled', 'true');
  elements.termsModal.classList.add('active');
}

function closeTermsModal() {
  elements.termsModal.classList.remove('active');
  pendingDownload = null;
}

function executeDownload() {
  if (!pendingDownload) return;
  
  const link = document.createElement('a');
  link.href = pendingDownload.file;
  link.download = pendingDownload.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showToast(`開始下載：${pendingDownload.name}`);
  closeTermsModal();
}

// --- DYNAMIC ADMIN FORM & RESOURCES EXPORTER ---

// Helper: Rebuild select dropdown options for PDF slides from the unified table
function updatePdfDropdowns() {
  const currentPrepVal = elements.formPrepSlidesPdf.value;
  const currentContentVal = elements.formContentSlidesPdf.value;
  
  const prepPdfFiles = [];
  const contentPdfFiles = [];
  
  const rows = elements.tableUnifiedFiles.querySelectorAll('tr');
  rows.forEach(row => {
    const nameInput = row.querySelector('.file-name-input');
    const categorySelect = row.querySelector('.file-category-select');
    if (nameInput && categorySelect) {
      const name = nameInput.value.trim();
      const category = categorySelect.value;
      if (name.toLowerCase().endsWith('.pdf')) {
        if (category === 'prep') {
          prepPdfFiles.push(name);
        } else if (category === 'content') {
          contentPdfFiles.push(name);
        }
      }
    }
  });
  
  // 1. Rebuild Prep dropdown options
  elements.formPrepSlidesPdf.innerHTML = '';
  const defaultPrepOpt = document.createElement('option');
  defaultPrepOpt.value = '';
  defaultPrepOpt.textContent = '-- 請選擇課前準備簡報 (PDF) --';
  elements.formPrepSlidesPdf.appendChild(defaultPrepOpt);
  
  prepPdfFiles.forEach(pdf => {
    const opt = document.createElement('option');
    opt.value = `prep/downloads/${pdf}`;
    opt.textContent = pdf;
    elements.formPrepSlidesPdf.appendChild(opt);
  });
  
  const hasPrepVal = prepPdfFiles.some(pdf => `prep/downloads/${pdf}` === currentPrepVal);
  elements.formPrepSlidesPdf.value = hasPrepVal ? currentPrepVal : '';
  
  // 2. Rebuild Content dropdown options
  elements.formContentSlidesPdf.innerHTML = '';
  const defaultContentOpt = document.createElement('option');
  defaultContentOpt.value = '';
  defaultContentOpt.textContent = '-- 請選擇正式課程簡報 (PDF) --';
  elements.formContentSlidesPdf.appendChild(defaultContentOpt);
  
  contentPdfFiles.forEach(pdf => {
    const opt = document.createElement('option');
    opt.value = `downloads/${pdf}`;
    opt.textContent = pdf;
    elements.formContentSlidesPdf.appendChild(opt);
  });
  
  const hasContentVal = contentPdfFiles.some(pdf => `downloads/${pdf}` === currentContentVal);
  elements.formContentSlidesPdf.value = hasContentVal ? currentContentVal : '';
}

// Helper: Add files or reference links row dynamically in admin form
function addFileRow(filename = '', size = '', category = 'content', isNew = false, base64 = '', type = 'file', url = '', description = '') {
  const tr = document.createElement('tr');
  tr.setAttribute('data-is-new', isNew ? 'true' : 'false');
  tr.setAttribute('data-base64', base64 || '');
  tr.setAttribute('data-type', type);
  
  const tdName = document.createElement('td');
  if (type === 'link') {
    tdName.innerHTML = `
      <div class="link-inputs-container">
        <input type="text" placeholder="連結名稱 (例如: 參考網站)" class="form-control file-name-input" value="${filename}">
        <input type="text" placeholder="連結網址 (例如: https://...)" class="form-control file-url-input" value="${url}">
        <input type="text" placeholder="連結說明 (例如: 補充閱讀資料)" class="form-control file-desc-input" value="${description}">
      </div>
    `;
  } else {
    tdName.innerHTML = `<input type="text" placeholder="例如: lesson_handout.zip" class="form-control file-name-input" value="${filename}">`;
  }
  
  const tdSize = document.createElement('td');
  if (type === 'link') {
    tdSize.innerHTML = `<span class="badge badge-prep" style="background-color: var(--primary-light); color: var(--primary); font-weight: 500;">外部連結</span>`;
  } else {
    tdSize.innerHTML = `<input type="text" placeholder="例如: 3.4 MB" class="form-control file-size-input" value="${size}">`;
  }
  
  const tdCategory = document.createElement('td');
  tdCategory.innerHTML = `
    <select class="form-control select-control file-category-select">
      <option value="prep" ${category === 'prep' ? 'selected' : ''}>課前準備 (Prep)</option>
      <option value="content" ${category === 'content' ? 'selected' : ''}>正式課程 (Content)</option>
    </select>
  `;
  
  const tdSorting = document.createElement('td');
  tdSorting.style.textAlign = 'center';
  tdSorting.innerHTML = `
    <div style="display: flex; gap: 0.25rem; justify-content: center;">
      <button class="btn btn-sm btn-secondary btn-move-up" style="padding: 0.2rem 0.4rem; font-size: 0.7rem;" type="button" title="上移">▲</button>
      <button class="btn btn-sm btn-secondary btn-move-down" style="padding: 0.2rem 0.4rem; font-size: 0.7rem;" type="button" title="下移">▼</button>
    </div>
  `;
  
  const tdDelete = document.createElement('td');
  tdDelete.style.textAlign = 'center';
  tdDelete.innerHTML = `<button class="btn btn-sm btn-danger-sm btn-delete-row">刪除</button>`;
  
  tr.appendChild(tdName);
  tr.appendChild(tdSize);
  tr.appendChild(tdCategory);
  tr.appendChild(tdSorting);
  tr.appendChild(tdDelete);
  
  // Disable fields if editing and content is locked
  if (adminMode === 'edit' && category === 'content' && !isContentUnlocked) {
    const inputs = tr.querySelectorAll('input, select, button');
    inputs.forEach(el => {
      if (isNew && el === categorySelect) {
        el.disabled = false;
      } else {
        el.disabled = true;
      }
    });
  }
  
  // Bind sorting buttons
  tdSorting.querySelector('.btn-move-up').addEventListener('click', () => {
    const prev = tr.previousElementSibling;
    if (prev) {
      tr.parentNode.insertBefore(tr, prev);
      updatePdfDropdowns();
    }
  });
  tdSorting.querySelector('.btn-move-down').addEventListener('click', () => {
    const next = tr.nextElementSibling;
    if (next) {
      tr.parentNode.insertBefore(next, tr);
      updatePdfDropdowns();
    }
  });
  
  // Bind delete button listener
  tdDelete.querySelector('.btn-delete-row').addEventListener('click', () => {
    tr.remove();
    updatePdfDropdowns();
  });
  
  // Bind input listener on filename
  const nameInput = tdName.querySelector('.file-name-input');
  nameInput.addEventListener('input', () => {
    updatePdfDropdowns();
  });
  
  // Bind change listener on category select
  const categorySelect = tdCategory.querySelector('.file-category-select');
  categorySelect.addEventListener('change', () => {
    updatePdfDropdowns();
    if (adminMode === 'edit' && categorySelect.value === 'content' && !isContentUnlocked) {
      const inputs = tr.querySelectorAll('input, select, button');
      inputs.forEach(el => {
        if (el !== categorySelect) {
          el.disabled = true;
        }
      });
    } else {
      const inputs = tr.querySelectorAll('input, select, button');
      inputs.forEach(el => el.disabled = false);
    }
  });
  
  elements.tableUnifiedFiles.appendChild(tr);
  
  // Update dropdowns immediately
  updatePdfDropdowns();
}

// Helper: format URL (add protocol prefix if missing)
function formatUrl(url) {
  url = url.trim();
  if (!url) return '';
  if (!/^[a-z0-9+-.]+:\/\//i.test(url) && !/^\/\//.test(url)) {
    return 'http://' + url;
  }
  return url;
}

// Gather files array from dynamic admin tables
function getFilesFromTable() {
  const files = [];
  const rows = elements.tableUnifiedFiles.querySelectorAll('tr');
  let hasError = false;
  let errorMsg = '';

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const isLink = row.getAttribute('data-type') === 'link';
    const nameInput = row.querySelector('.file-name-input');
    const categorySelect = row.querySelector('.file-category-select');
    
    if (isLink) {
      const urlInput = row.querySelector('.file-url-input');
      const descInput = row.querySelector('.file-desc-input');
      if (nameInput && urlInput && categorySelect) {
        const nameVal = nameInput.value.trim();
        const urlVal = urlInput.value.trim();
        const descVal = descInput ? descInput.value.trim() : '';
        const categoryVal = categorySelect.value;
        
        if (!nameVal && !urlVal) {
          hasError = true;
          errorMsg = '參考連結的「名稱」與「網址」不可為空！';
          break;
        } else if (!nameVal) {
          hasError = true;
          errorMsg = '請填寫參考連結的「名稱」！';
          break;
        } else if (!urlVal) {
          hasError = true;
          errorMsg = '請填寫參考連結的「網址」！';
          break;
        }
        
        const formattedUrl = formatUrl(urlVal);
        
        files.push({
          type: 'link',
          name: nameVal,
          url: formattedUrl,
          description: descVal,
          category: categoryVal
        });
      }
    } else {
      const sizeInput = row.querySelector('.file-size-input');
      if (nameInput && sizeInput && categorySelect) {
        const nameVal = nameInput.value.trim();
        const sizeVal = sizeInput.value.trim();
        const categoryVal = categorySelect.value;
        const isNew = row.getAttribute('data-is-new') === 'true';
        const base64 = row.getAttribute('data-base64') || '';
        
        if (!nameVal && !sizeVal) {
          hasError = true;
          errorMsg = '檔案的「名稱」與「大小」不可為空！';
          break;
        } else if (!nameVal) {
          hasError = true;
          errorMsg = '請填寫檔案的「名稱」！';
          break;
        } else if (!sizeVal) {
          hasError = true;
          errorMsg = '請填寫檔案的「大小」！';
          break;
        }
        
        files.push({
          type: 'file',
          name: nameVal,
          size: sizeVal,
          category: categoryVal,
          isNew: isNew,
          base64: base64
        });
      }
    }
  }
  
  if (hasError) {
    showToast(errorMsg, false);
    return null;
  }
  return files;
}

// Helper: Generate Course ID as a random alphanumeric string
function generateRandomCourseId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let rand = '';
  for (let i = 0; i < 6; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `course-${rand}`;
}

// Helper: Disable/Enable only Content Settings fields
function setAdminContentFieldsDisabled(disabled) {
  elements.formContentSlidesPdf.disabled = disabled;
  
  // Disable category select, name input, size input, and delete button for content files in the unified table
  const rows = elements.tableUnifiedFiles.querySelectorAll('tr');
  rows.forEach(row => {
    const categorySelect = row.querySelector('.file-category-select');
    if (categorySelect && categorySelect.value === 'content') {
      const inputs = row.querySelectorAll('input, select, button');
      inputs.forEach(el => {
        el.disabled = disabled;
      });
    }
  });
}

// Helper: Disable/Enable all form fields (excluding verification loaders)
function setAdminFieldsDisabled(disabled) {
  elements.formCourseTitle.disabled = disabled;
  elements.formCourseDate.disabled = disabled;
  elements.formCourseInstructor.disabled = disabled;
  elements.formCourseDuration.disabled = disabled;
  elements.formCourseDescription.disabled = disabled;
  elements.formCoursePwd.disabled = disabled;
  
  elements.formPrepSlidesPdf.disabled = disabled;
  elements.btnAddFileRow.disabled = disabled;
  elements.btnAddLinkRow.disabled = disabled;
  elements.formUploadFiles.disabled = disabled;
  
  // Disable all inputs/selects/buttons in the unified files table
  const rows = elements.tableUnifiedFiles.querySelectorAll('tr');
  rows.forEach(row => {
    const inputs = row.querySelectorAll('input, select, button');
    inputs.forEach(el => {
      el.disabled = disabled;
    });
  });
  
  setAdminContentFieldsDisabled(disabled);
  elements.btnAdminSubmit.disabled = disabled;
}

// --- ADMIN MODE & EDITING COURSE FUNCTIONS ---

function switchAdminMode(mode) {
  adminMode = mode;
  handleResetAdminForm();
  
  if (mode === 'new') {
    elements.adminTabNew.classList.add('active');
    elements.adminTabEdit.classList.remove('active');
    elements.adminFormTitle.textContent = '新增全新課程';
    elements.adminFormSubtitle.textContent = '填寫下方表單以產生新課程的雜湊資料夾結構、檔案與設定檔。';
    elements.adminEditSelectorContainer.classList.add('hidden');
    elements.formCourseId.value = generateRandomCourseId();
    elements.btnAdminSubmit.textContent = '建立課程';
  } else {
    elements.adminTabNew.classList.remove('active');
    elements.adminTabEdit.classList.add('active');
    elements.adminFormTitle.textContent = '編輯既有課程資訊';
    elements.adminFormSubtitle.textContent = '請先從下方選單選擇欲修改的課程。您必須輸入密碼或載入 data.json 才能解鎖編輯此課程的正式課程部分。';
    elements.adminEditSelectorContainer.classList.remove('hidden');
    elements.btnGenerateId.classList.add('hidden');
    elements.btnAdminDelete.classList.add('hidden');
    setAdminFieldsDisabled(true);
    elements.btnAdminSubmit.textContent = '編輯完成';
    
    // Populate dropdown selector
    populateEditCourseSelector();
  }
}

function populateEditCourseSelector() {
  elements.selectEditCourse.innerHTML = '<option value="">-- 請選擇課程 --</option>';
  
  COURSE_CATALOG.forEach(course => {
    const opt = document.createElement('option');
    opt.value = course.id;
    opt.textContent = `${course.date.replace(/-/g, '/')} - ${course.title} (${course.instructor})`;
    elements.selectEditCourse.appendChild(opt);
  });
}

function clearContentFilesFromTable() {
  const rows = elements.tableUnifiedFiles.querySelectorAll('tr');
  rows.forEach(row => {
    const categorySelect = row.querySelector('.file-category-select');
    if (categorySelect && categorySelect.value === 'content') {
      row.remove();
    }
  });
}

async function handleSelectEditCourseChange() {
  const courseId = elements.selectEditCourse.value;
  if (!courseId) {
    handleResetAdminForm();
    elements.adminEditLoaderMethods.classList.add('hidden');
    elements.btnAdminDelete.classList.add('hidden');
    return;
  }
  
  const course = COURSE_CATALOG.find(c => c.id === courseId);
  if (!course) return;
  
  // 1. Populate basic public info
  elements.formCourseId.value = course.id;
  elements.formCourseTitle.value = course.title;
  elements.formCourseDate.value = course.date;
  elements.formCourseInstructor.value = course.instructor;
  elements.formCourseDuration.value = course.duration;
  elements.formCourseDescription.value = course.description || '';
  
  // 2. Populate Prep downloads in unified table
  elements.tableUnifiedFiles.innerHTML = '';
  if (course.prep && course.prep.downloads) {
    course.prep.downloads.forEach(f => {
      if (f.type === 'link' || f.url) {
        addFileRow(f.name, '', 'prep', false, '', 'link', f.url, f.description);
      } else {
        const filename = f.file.replace('prep/downloads/', '');
        addFileRow(filename, f.size, 'prep', false, '', 'file');
      }
    });
  }
  
  // Select Prep slide PDF
  if (course.prep && course.prep.pdfSlidesFile) {
    elements.formPrepSlidesPdf.value = course.prep.pdfSlidesFile;
  } else {
    elements.formPrepSlidesPdf.value = '';
  }
  
  // Clear Content private details (wait for password/json load)
  elements.formCoursePwd.value = '';
  elements.formContentSlidesPdf.innerHTML = '<option value="">-- 請先解鎖並在下方教材清單中新增 PDF 檔案 --</option>';
  clearContentFilesFromTable();
  
  // UNLOCK basic fields, lock only content settings
  elements.formCourseTitle.disabled = false;
  elements.formCourseDate.disabled = false;
  elements.formCourseInstructor.disabled = false;
  elements.formCourseDuration.disabled = false;
  elements.formCourseDescription.disabled = false;
  
  elements.formPrepSlidesPdf.disabled = false;
  elements.btnAddFileRow.disabled = false;
  elements.btnAddLinkRow.disabled = false;
  elements.formUploadFiles.disabled = false;
  
  // Disable content inputs in table, enable prep inputs
  const rows = elements.tableUnifiedFiles.querySelectorAll('tr');
  rows.forEach(row => {
    const categorySelect = row.querySelector('.file-category-select');
    const inputs = row.querySelectorAll('input, select, button');
    if (categorySelect && categorySelect.value === 'prep') {
      inputs.forEach(el => el.disabled = false);
    } else {
      inputs.forEach(el => el.disabled = true);
    }
  });
  
  elements.btnAdminSubmit.disabled = false;
  elements.btnAdminDelete.classList.remove('hidden');
  
  if (course.isLocked === false) {
    // Automatically load data.json using course.id
    elements.adminEditLoaderMethods.classList.add('hidden');
    elements.adminEditLoadStatus.style.display = 'block';
    elements.adminEditLoadStatus.style.color = 'var(--success)';
    elements.adminEditLoadStatus.textContent = '🔓 此課程無密碼保護，已自動解鎖並載入所有教材與簡報設定。';
    
    if (elements.formCoursePwdToggle) {
      elements.formCoursePwdToggle.checked = false;
      elements.formCoursePwd.disabled = true;
      elements.formCoursePwd.placeholder = '此課程無密碼保護，將公開存取';
      elements.formCoursePwd.value = '';
    }
    
    try {
      const response = await fetch(`./courses/${course.id}/data.json`);
      if (response.ok) {
        const data = await response.json();
        
        // Populate Content downloads in unified table
        clearContentFilesFromTable();
        if (data.downloads) {
          data.downloads.forEach(f => {
            if (f.type === 'link' || f.url) {
              addFileRow(f.name, '', 'content', false, '', 'link', f.url, f.description);
            } else {
              const filename = f.file.replace('downloads/', '');
              addFileRow(filename, f.size, 'content', false, '', 'file');
            }
          });
        }
        
        // Select Content slide PDF
        if (data.pdfSlidesFile) {
          elements.formContentSlidesPdf.value = data.pdfSlidesFile;
        } else {
          elements.formContentSlidesPdf.value = '';
        }
      }
    } catch (e) {
      clearContentFilesFromTable();
      updatePdfDropdowns();
    }
    
    setAdminContentFieldsDisabled(false);
    isContentUnlocked = true;
  } else {
    // Locked course: original logic
    elements.adminEditLoaderMethods.classList.remove('hidden');
    elements.adminEditLoadStatus.style.display = 'block';
    elements.adminEditLoadStatus.style.color = 'var(--text-medium)';
    elements.adminEditLoadStatus.textContent = '🔒 已載入基本公開資料（您可直接修改課程日期與基本資訊）。輸入密碼或載入 data.json 可解鎖編輯正式課程教材設定。';
    elements.inputEditCoursePwd.value = '';
    
    if (elements.formCoursePwdToggle) {
      elements.formCoursePwdToggle.checked = true;
      elements.formCoursePwd.disabled = false;
      elements.formCoursePwd.placeholder = '例如: vue2026';
    }
    
    setAdminContentFieldsDisabled(true);
    isContentUnlocked = false;
  }
}

async function handleEditCourseLoadByPwd() {
  const pwd = elements.inputEditCoursePwd.value.trim();
  const courseId = elements.selectEditCourse.value;
  
  if (!pwd) {
    elements.inputEditCoursePwd.focus();
    return;
  }
  
  const statusEl = elements.adminEditLoadStatus;
  statusEl.style.display = 'block';
  statusEl.style.color = 'var(--text-light)';
  statusEl.textContent = '正在驗證密碼與載入設定中...';
  
  try {
    const hash = await sha256(pwd);
    const response = await fetch(`./courses/${hash}/data.json`);
    
    if (!response.ok) {
      throw new Error('NotFound');
    }
    
    const data = await response.json();
    
    // Successfully retrieved! Populate private fields
    elements.formCoursePwd.value = pwd;
    
    // Populate Content downloads in unified table
    clearContentFilesFromTable();
    if (data.downloads) {
      data.downloads.forEach(f => {
        if (f.type === 'link' || f.url) {
          addFileRow(f.name, '', 'content', false, '', 'link', f.url, f.description);
        } else {
          const filename = f.file.replace('downloads/', '');
          addFileRow(filename, f.size, 'content', false, '', 'file');
        }
      });
    }
    
    // Select the slide file
    if (data.pdfSlidesFile) {
      elements.formContentSlidesPdf.value = data.pdfSlidesFile;
    } else {
      elements.formContentSlidesPdf.value = '';
    }
    
    // Unlock content fields
    setAdminContentFieldsDisabled(false);
    isContentUnlocked = true;
    
    statusEl.style.color = 'var(--success)';
    statusEl.textContent = '✅ 正式課程內容載入成功！已帶入所有簡報與教材，已解鎖編輯權限。';
    elements.inputEditCoursePwd.value = '';
    showToast('載入成功！已解鎖正式課程編輯權限。');
  } catch (err) {
    statusEl.style.color = 'var(--error)';
    statusEl.textContent = '❌ 載入失敗：密碼錯誤，或該課程尚無對應的 data.json 檔案。';
    showToast('載入失敗，請檢查密碼。', false);
  }
}

function handleEditCourseLoadByFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  const statusEl = elements.adminEditLoadStatus;
  statusEl.style.display = 'block';
  statusEl.style.color = 'var(--text-light)';
  statusEl.textContent = '正在解析 JSON 檔案...';
  
  const reader = new FileReader();
  reader.onload = function(event) {
    try {
      const data = JSON.parse(event.target.result);
      
      // Populate Content downloads in unified table
      clearContentFilesFromTable();
      if (data.downloads) {
        data.downloads.forEach(f => {
          if (f.type === 'link' || f.url) {
            addFileRow(f.name, '', 'content', false, '', 'link', f.url, f.description);
          } else {
            const filename = f.file.replace('downloads/', '');
            addFileRow(filename, f.size, 'content', false, '', 'file');
          }
        });
      }
      
      // Select the slide file
      if (data.pdfSlidesFile) {
        elements.formContentSlidesPdf.value = data.pdfSlidesFile;
      } else {
        elements.formContentSlidesPdf.value = '';
      }
      
      // Unlock content fields
      setAdminContentFieldsDisabled(false);
      isContentUnlocked = true;
      
      statusEl.style.color = 'var(--success)';
      statusEl.textContent = '✅ 檔案載入成功！請記得在下方手動填寫「解鎖密碼」以更新或重設雜湊路徑，已解鎖編輯權限。';
      showToast('設定載入成功！已解鎖正式課程編輯權限。');
    } catch (err) {
      statusEl.style.color = 'var(--error)';
      statusEl.textContent = '❌ 解析失敗：檔案格式不正確。請確保上傳的是正確的 data.json 檔案。';
      showToast('檔案解析失敗', false);
    }
  };
  reader.readAsText(file);
}

async function handleAdminSubmit() {
  const courseId = elements.formCourseId.value.trim();
  const title = elements.formCourseTitle.value.trim();
  const date = elements.formCourseDate.value;
  const instructor = elements.formCourseInstructor.value.trim();
  const duration = elements.formCourseDuration.value.trim();
  const description = elements.formCourseDescription.value.trim();
  
  const isLocked = elements.formCoursePwdToggle.checked;
  const password = isLocked ? elements.formCoursePwd.value.trim() : '';
  
  if (!courseId || !title || !date || !instructor || !duration || (isLocked && !password)) {
    showToast('請填寫所有必要的欄位！', false);
    return;
  }
  
  const prepSlidesFile = elements.formPrepSlidesPdf.value;
  const contentSlidesFile = elements.formContentSlidesPdf.value;
  const files = getFilesFromTable();
  if (files === null) {
    return;
  }
  
  const payload = {
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
    isEditMode: adminMode === 'edit',
    isContentUnlocked: isContentUnlocked
  };
  
  // Disable submit button and show status
  elements.btnAdminSubmit.disabled = true;
  elements.btnAdminSubmit.textContent = adminMode === 'new' ? '正在建立課程...' : '正在儲存更新...';
  
  try {
    const response = await fetch('/api/save-course', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    if (result.success) {
      showToast(adminMode === 'new' ? '課程建立成功！' : '更新儲存成功！', true);
      setTimeout(() => {
        window.location.hash = '#/';
        window.location.reload();
      }, 1000);
    } else {
      showToast('儲存失敗：' + (result.error || '未知錯誤'), false);
      elements.btnAdminSubmit.disabled = false;
      elements.btnAdminSubmit.textContent = adminMode === 'new' ? '建立課程' : '編輯完成';
    }
  } catch (err) {
    console.error('儲存課程失敗:', err);
    showToast('連線伺服器失敗，請確認伺服器正在執行。', false);
    elements.btnAdminSubmit.disabled = false;
    elements.btnAdminSubmit.textContent = adminMode === 'new' ? '建立課程' : '編輯完成';
  }
}

async function handleAdminDeleteCourse() {
  const courseId = elements.formCourseId.value.trim();
  const title = elements.formCourseTitle.value.trim();
  if (!courseId) return;
  
  const ok = confirm(`⚠️ 確定要刪除整個課程「${title}」嗎？\n此動作將會從磁碟中徹底刪除該課程與所有關聯檔案，且無法復原！`);
  if (!ok) return;
  
  elements.btnAdminDelete.disabled = true;
  elements.btnAdminDelete.textContent = '正在刪除...';
  
  try {
    const response = await fetch('/api/delete-course', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ courseId })
    });
    
    const result = await response.json();
    if (result.success) {
      showToast('課程已成功刪除！', true);
      setTimeout(() => {
        window.location.hash = '#/';
        window.location.reload();
      }, 1000);
    } else {
      showToast('刪除失敗：' + (result.error || '未知錯誤'), false);
      elements.btnAdminDelete.disabled = false;
      elements.btnAdminDelete.textContent = '❌ 刪除此課程';
    }
  } catch (err) {
    console.error('刪除課程失敗:', err);
    showToast('連線伺服器失敗，請確認伺服器正在執行。', false);
    elements.btnAdminDelete.disabled = false;
    elements.btnAdminDelete.textContent = '❌ 刪除此課程';
  }
}

function handleResetAdminForm() {
  elements.formCourseId.value = '';
  elements.formCourseTitle.value = '';
  elements.formCourseDate.value = '';
  elements.formCourseInstructor.value = '';
  elements.formCourseDuration.value = '';
  elements.formCourseDescription.value = '';
  elements.formCoursePwd.value = '';
  
  if (elements.formCoursePwdToggle) {
    elements.formCoursePwdToggle.checked = true;
    elements.formCoursePwd.disabled = false;
    elements.formCoursePwd.placeholder = '例如: vue2026';
  }
  
  elements.formPrepSlidesPdf.value = '';
  elements.formContentSlidesPdf.value = '';
  
  elements.tableUnifiedFiles.innerHTML = '';
  elements.adminResultArea.classList.add('hidden');
  
  // Clear edit loader specifics
  if (elements.inputEditCoursePwd) elements.inputEditCoursePwd.value = '';
  if (elements.inputEditCourseFile) elements.inputEditCourseFile.value = '';
  if (elements.adminEditLoadStatus) {
    elements.adminEditLoadStatus.style.display = 'none';
    elements.adminEditLoadStatus.textContent = '';
  }
  
  generatedDataJson = null;
  generatedConfigJs = null;
  
  // Rebuild select options
  updatePdfDropdowns();
}

// Copy to clipboard helper
function setupClipboardCopy() {
  const copyButtons = document.querySelectorAll('.btn-copy');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-clipboard-target');
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        navigator.clipboard.writeText(targetEl.textContent)
          .then(() => {
            const originalText = btn.textContent;
            btn.textContent = '已複製！';
            btn.classList.replace('btn-secondary', 'btn-primary');
            setTimeout(() => {
              btn.textContent = originalText;
              btn.classList.replace('btn-primary', 'btn-secondary');
            }, 2000);
          })
          .catch(() => {
            showToast('複製失敗，請手動選取複製。', false);
          });
      }
    });
  });
}

function handleUploadFilesSelect(e) {
  const files = e.target.files;
  if (!files || files.length === 0) return;
  
  Array.from(files).forEach(file => {
    const reader = new FileReader();
    reader.onload = function(event) {
      const base64 = event.target.result;
      const sizeStr = formatBytes(file.size);
      let defaultCategory = file.name.toLowerCase().endsWith('.pdf') ? 'prep' : 'content';
      if (adminMode === 'edit' && !isContentUnlocked) {
        defaultCategory = 'prep';
      }
      addFileRow(file.name, sizeStr, defaultCategory, true, base64);
    };
    reader.readAsDataURL(file);
  });
  
  e.target.value = '';
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// --- INITIALIZATION & EVENT BINDINGS ---

function bindEvents() {
  // Navigation Routing
  window.addEventListener('hashchange', handleRoute);
  
  // Password toggle checkbox event listener
  if (elements.formCoursePwdToggle) {
    elements.formCoursePwdToggle.addEventListener('change', () => {
      if (elements.formCoursePwdToggle.checked) {
        elements.formCoursePwd.disabled = false;
        elements.formCoursePwd.placeholder = '例如: vue2026';
        elements.formCoursePwd.focus();
      } else {
        elements.formCoursePwd.disabled = true;
        elements.formCoursePwd.placeholder = '此課程無密碼保護，將公開存取';
        elements.formCoursePwd.value = '';
      }
    });
  }
  
  elements.headerLogo.addEventListener('click', e => {
    e.preventDefault();
    navigateTo('#/');
  });
  
  elements.navHome.addEventListener('click', e => {
    e.preventDefault();
    navigateTo('#/');
  });
  
  elements.navAdmin.addEventListener('click', e => {
    e.preventDefault();
    navigateTo('#/admin-tools');
  });
  
  // Search & Filter event bindings
  elements.searchInput.addEventListener('input', renderCourseCatalog);
  elements.dateFilter.addEventListener('change', renderCourseCatalog);
  
  // Back Nav
  elements.btnBackHome.addEventListener('click', () => {
    navigateTo('#/');
  });
  
  // Auth Password Modal
  elements.btnCancelAuth.addEventListener('click', closeAuthModal);
  elements.btnCloseAuth.addEventListener('click', closeAuthModal);
  elements.btnSubmitAuth.addEventListener('click', handleAuthSubmit);
  elements.inputCoursePwd.addEventListener('keypress', e => {
    if (e.key === 'Enter') {
      handleAuthSubmit();
    }
  });
  
  // Toggle Pwd Visibility
  elements.btnTogglePwdVisibility.addEventListener('click', () => {
    const isPwd = elements.inputCoursePwd.type === 'password';
    elements.inputCoursePwd.type = isPwd ? 'text' : 'password';
    elements.eyeOpenIcon.classList.toggle('hidden', !isPwd);
    elements.eyeClosedIcon.classList.toggle('hidden', isPwd);
  });

  // Admin Auth Password Modal
  elements.btnCancelAdminAuth.addEventListener('click', closeAdminAuthModal);
  elements.btnCloseAdminAuth.addEventListener('click', closeAdminAuthModal);
  elements.btnSubmitAdminAuth.addEventListener('click', handleAdminAuthSubmit);
  elements.inputAdminPwd.addEventListener('keypress', e => {
    if (e.key === 'Enter') {
      handleAdminAuthSubmit();
    }
  });
  
  // Toggle Admin Pwd Visibility
  elements.btnToggleAdminPwdVisibility.addEventListener('click', () => {
    const isPwd = elements.inputAdminPwd.type === 'password';
    elements.inputAdminPwd.type = isPwd ? 'text' : 'password';
    elements.adminEyeOpenIcon.classList.toggle('hidden', !isPwd);
    elements.adminEyeClosedIcon.classList.toggle('hidden', isPwd);
  });
  
  // Course page Unlock Banner buttons
  elements.btnUnlockViewer.addEventListener('click', () => {
    const course = COURSE_CATALOG.find(c => c.id === currentCourseId);
    openAuthModal(course);
  });
  elements.btnUnlockDownloads.addEventListener('click', () => {
    const course = COURSE_CATALOG.find(c => c.id === currentCourseId);
    openAuthModal(course);
  });
  
  // Prep & Content Tabs bindings
  elements.tabPrep.addEventListener('click', () => {
    switchTab('prep', false);
  });
  elements.tabContent.addEventListener('click', () => {
    switchTab('content', false);
  });
  
  // Slide Viewer Controls
  elements.btnSlidePrev.addEventListener('click', () => {
    stopSlideshow();
    prevSlide();
  });
  elements.btnSlideNext.addEventListener('click', () => {
    stopSlideshow();
    nextSlide();
  });
  elements.btnSlidePrevOverlay.addEventListener('click', (e) => {
    e.stopPropagation();
    stopSlideshow();
    prevSlide();
  });
  elements.btnSlideNextOverlay.addEventListener('click', (e) => {
    e.stopPropagation();
    stopSlideshow();
    nextSlide();
  });
  
  elements.btnTogglePlay.addEventListener('click', toggleSlideshow);
  elements.btnFullscreen.addEventListener('click', toggleFullscreen);
  
  // Keyboard listeners for slides
  document.addEventListener('keydown', e => {
    if (currentView !== 'course') return;
    
    // Check if Content is locked before running keys
    const isContent = currentTab === 'content';
    const hasAccess = isContent ? !!getUnlockedHash(currentCourseId) : true;
    if (!hasAccess) return;
    
    if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
      return;
    }
    
    if (e.key === 'ArrowRight' || e.key === 'PageDown') {
      stopSlideshow();
      nextSlide();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      stopSlideshow();
      prevSlide();
    } else if (e.key === ' ') {
      e.preventDefault();
      toggleSlideshow();
    } else if (e.key === 'f' || e.key === 'F') {
      toggleFullscreen();
    }
  });
  
  // Terms agreement checks
  elements.chkAgreeTerms.addEventListener('change', () => {
    if (elements.chkAgreeTerms.checked) {
      elements.btnConfirmDownload.removeAttribute('disabled');
    } else {
      elements.btnConfirmDownload.setAttribute('disabled', 'true');
    }
  });
  elements.btnCancelTerms.addEventListener('click', closeTermsModal);
  elements.btnCloseTerms.addEventListener('click', closeTermsModal);
  elements.btnConfirmDownload.addEventListener('click', executeDownload);
  
  // Dynamic Admin Form triggers
  elements.btnAddFileRow.addEventListener('click', () => {
    const defaultCat = (adminMode === 'edit' && !isContentUnlocked) ? 'prep' : 'content';
    addFileRow('', '', defaultCat, true, '', 'file');
  });
  elements.btnAddLinkRow.addEventListener('click', () => {
    const defaultCat = (adminMode === 'edit' && !isContentUnlocked) ? 'prep' : 'content';
    addFileRow('', '', defaultCat, true, '', 'link');
  });
  elements.formUploadFiles.addEventListener('change', handleUploadFilesSelect);
  
  elements.btnAdminSubmit.addEventListener('click', handleAdminSubmit);
  elements.btnAdminReset.addEventListener('click', handleResetAdminForm);
  
  // Generate random Course ID
  elements.btnGenerateId.addEventListener('click', () => {
    elements.formCourseId.value = generateRandomCourseId();
  });
  
  // Delete course action
  elements.btnAdminDelete.addEventListener('click', handleAdminDeleteCourse);

  // Admin Mode Tabs
  elements.adminTabNew.addEventListener('click', () => switchAdminMode('new'));
  elements.adminTabEdit.addEventListener('click', () => switchAdminMode('edit'));
  
  // Edit selector changes
  elements.selectEditCourse.addEventListener('change', handleSelectEditCourseChange);
  
  // Edit loaders
  elements.btnAdminLoadByPwd.addEventListener('click', handleEditCourseLoadByPwd);
  elements.inputEditCoursePwd.addEventListener('keypress', e => {
    if (e.key === 'Enter') handleEditCourseLoadByPwd();
  });
  elements.inputEditCourseFile.addEventListener('change', handleEditCourseLoadByFile);
  
  // Admin dynamic file downloads
  elements.btnDownloadDataJson.addEventListener('click', () => {
    if (generatedDataJson) triggerFileDownload('data.json', generatedDataJson);
  });
  elements.btnDownloadConfigJs.addEventListener('click', () => {
    if (generatedConfigJs) triggerFileDownload('config.js', generatedConfigJs);
  });
}

// Bootstrap
document.addEventListener('DOMContentLoaded', () => {
  bindEvents();
  setupClipboardCopy();
  handleRoute();
});
