// Global variables
let apps = [];
let currentView = 'grid';

// DOM elements
const sidebar = document.querySelector('.sidebar');
const menuToggle = document.querySelector('.menu-toggle');
const navItems = document.querySelectorAll('.nav-item');
const tabContents = document.querySelectorAll('.tab-content');
const appsGrid = document.getElementById('appsGrid');
const searchInput = document.getElementById('searchInput');
const uploadForm = document.getElementById('uploadForm');
const uploadArea = document.getElementById('uploadArea');
const appFileInput = document.getElementById('appFile');
const modal = document.getElementById('appModal');
const modalContent = document.getElementById('modalContent');
const modalTitle = document.getElementById('modalTitle');
const closeModal = document.querySelector('.close');
const viewBtns = document.querySelectorAll('.view-btn');
const sortSelect = document.getElementById('sortSelect');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadApps();
    setupEventListeners();
    setupUploadArea();
});

// Setup event listeners
function setupEventListeners() {
    // Navigation
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const tab = this.getAttribute('data-tab');
            switchTab(tab);
        });
    });

    // Mobile menu toggle
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('open');
        });
    }

    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterApps(this.value);
        });
    }

    // View options
    viewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const view = this.getAttribute('data-view');
            switchView(view);
        });
    });

    // Sort functionality
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            sortApps(this.value);
        });
    }

    // Modal
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }

    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Upload form
    if (uploadForm) {
        uploadForm.addEventListener('submit', handleUpload);
    }

    // Upload area
    if (uploadArea) {
        uploadArea.addEventListener('click', function() {
            appFileInput.click();
        });
    }

    // File input change
    if (appFileInput) {
        appFileInput.addEventListener('change', function() {
            if (this.files.length > 0) {
                showUploadForm();
            }
        });
    }

    // Cancel upload
    const cancelUpload = document.getElementById('cancelUpload');
    if (cancelUpload) {
        cancelUpload.addEventListener('click', function() {
            hideUploadForm();
        });
    }
}

// Setup upload area with drag and drop
function setupUploadArea() {
    if (!uploadArea) return;

    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            appFileInput.files = files;
            showUploadForm();
        }
    });
}

// Switch tabs
function switchTab(tabName) {
    // Update navigation
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-tab') === tabName) {
            item.classList.add('active');
        }
    });

    // Update content
    tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === `${tabName}-tab`) {
            content.classList.add('active');
        }
    });

    // Update breadcrumb
    const breadcrumb = document.querySelector('.breadcrumb span');
    if (breadcrumb) {
        breadcrumb.textContent = tabName.charAt(0).toUpperCase() + tabName.slice(1);
    }
}

// Switch view (grid/list)
function switchView(view) {
    currentView = view;
    
    viewBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-view') === view) {
            btn.classList.add('active');
        }
    });

    renderApps();
}

// Load apps from API
async function loadApps() {
    try {
        const response = await fetch('/api/apps');
        apps = await response.json();
        renderApps();
    } catch (error) {
        console.error('Error loading apps:', error);
        showMessage('Error loading apps', 'error');
    }
}

// Render apps in the grid
function renderApps() {
    if (!appsGrid) return;

    if (apps.length === 0) {
        appsGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 48px;">
                <i class="fas fa-folder-open"></i>
                <h3>No apps yet</h3>
                <p>Upload your first app to get started</p>
            </div>
        `;
        return;
    }

    appsGrid.innerHTML = apps.map(app => createAppCard(app)).join('');
}

// Create app card
function createAppCard(app) {
    const fileType = getFileType(app.downloadUrl);
    const fileIcon = getFileIcon(fileType);
    
    return `
        <div class="file-card" onclick="showAppDetails(${app.id})">
            <div class="file-actions">
                <button class="action-btn" onclick="event.stopPropagation(); downloadApp('${app.downloadUrl}')">
                    <i class="fas fa-download"></i>
                </button>
            </div>
            <div class="file-icon ${fileType}">
                <i class="${fileIcon}"></i>
            </div>
            <div class="file-info">
                <h3>${app.name}</h3>
                <p>${app.description || 'No description'}</p>
                <div class="file-meta">
                    <span>${app.fileSize}</span>
                    <span>${app.downloads} downloads</span>
                </div>
            </div>
        </div>
    `;
}

// Get file type from URL
function getFileType(url) {
    const extension = url.split('.').pop().toLowerCase();
    switch (extension) {
        case 'apk':
        case 'aab':
            return 'android';
        case 'ipa':
            return 'ios';
        case 'exe':
        case 'msi':
            return 'windows';
        case 'dmg':
        case 'pkg':
            return 'macos';
        default:
            return 'generic';
    }
}

// Get file icon
function getFileIcon(fileType) {
    switch (fileType) {
        case 'android':
            return 'fab fa-android';
        case 'ios':
            return 'fab fa-apple';
        case 'windows':
            return 'fab fa-windows';
        case 'macos':
            return 'fab fa-apple';
        default:
            return 'fas fa-file';
    }
}

// Filter apps
function filterApps(searchTerm) {
    const filteredApps = apps.filter(app => 
        app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    renderFilteredApps(filteredApps);
}

// Render filtered apps
function renderFilteredApps(filteredApps) {
    if (!appsGrid) return;

    if (filteredApps.length === 0) {
        appsGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 48px;">
                <i class="fas fa-search"></i>
                <h3>No results found</h3>
                <p>Try adjusting your search terms</p>
            </div>
        `;
        return;
    }

    appsGrid.innerHTML = filteredApps.map(app => createAppCard(app)).join('');
}

// Sort apps
function sortApps(sortBy) {
    const sortedApps = [...apps].sort((a, b) => {
        switch (sortBy) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'date':
                return new Date(b.uploadDate) - new Date(a.uploadDate);
            case 'size':
                return parseFloat(a.fileSize) - parseFloat(b.fileSize);
            case 'downloads':
                return b.downloads - a.downloads;
            default:
                return 0;
        }
    });
    
    renderFilteredApps(sortedApps);
}

// Show app details in modal
async function showAppDetails(appId) {
    try {
        const response = await fetch(`/api/apps/${appId}`);
        const app = await response.json();
        
        modalTitle.textContent = app.name;
        modalContent.innerHTML = `
            <div style="display: grid; gap: 16px;">
                <div>
                    <h4>Description</h4>
                    <p>${app.description || 'No description available'}</p>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div>
                        <h4>Version</h4>
                        <p>${app.version}</p>
                    </div>
                    <div>
                        <h4>Category</h4>
                        <p>${app.category}</p>
                    </div>
                    <div>
                        <h4>File Size</h4>
                        <p>${app.fileSize}</p>
                    </div>
                    <div>
                        <h4>Downloads</h4>
                        <p>${app.downloads}</p>
                    </div>
                </div>
                <div>
                    <h4>Upload Date</h4>
                    <p>${app.uploadDate}</p>
                </div>
                <div style="display: flex; gap: 12px; margin-top: 16px;">
                    <button class="btn-primary" onclick="downloadApp('${app.downloadUrl}')">
                        <i class="fas fa-download"></i>
                        Download
                    </button>
                    <button class="btn-secondary" onclick="modal.style.display='none'">
                        Close
                    </button>
                </div>
            </div>
        `;
        
        modal.style.display = 'block';
    } catch (error) {
        console.error('Error loading app details:', error);
        showMessage('Error loading app details', 'error');
    }
}

// Download app
function downloadApp(url) {
    window.open(url, '_blank');
}

// Show upload form
function showUploadForm() {
    if (uploadForm) {
        uploadForm.style.display = 'block';
    }
    if (uploadArea) {
        uploadArea.style.display = 'none';
    }
}

// Hide upload form
function hideUploadForm() {
    if (uploadForm) {
        uploadForm.style.display = 'none';
        uploadForm.reset();
    }
    if (uploadArea) {
        uploadArea.style.display = 'block';
    }
    if (appFileInput) {
        appFileInput.value = '';
    }
}

// Handle file upload
async function handleUpload(e) {
    e.preventDefault();
    
    const formData = new FormData(uploadForm);
    
    try {
        const response = await fetch('/api/apps', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const newApp = await response.json();
            apps.push(newApp);
            renderApps();
            hideUploadForm();
            showMessage('App uploaded successfully!', 'success');
            switchTab('files');
        } else {
            const error = await response.json();
            showMessage(error.error || 'Upload failed', 'error');
        }
    } catch (error) {
        console.error('Upload error:', error);
        showMessage('Upload failed', 'error');
    }
}

// Show message
function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    const contentArea = document.querySelector('.content-area');
    if (contentArea) {
        contentArea.insertBefore(messageDiv, contentArea.firstChild);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
}

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js"></script>
