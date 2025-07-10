// Global variables
let apps = [];
let filteredApps = [];

// DOM elements
const navButtons = document.querySelectorAll('.nav-btn');
const tabContents = document.querySelectorAll('.tab-content');
const appsGrid = document.getElementById('appsGrid');
const searchInput = document.getElementById('searchInput');
const uploadForm = document.getElementById('uploadForm');
const modal = document.getElementById('appModal');
const modalContent = document.getElementById('modalContent');
const closeModal = document.querySelector('.close');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    initializeSearch();
    initializeUpload();
    initializeModal();
    loadApps();
});

// Tab navigation
function initializeTabs() {
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Update active button
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Show target tab
            tabContents.forEach(tab => tab.classList.remove('active'));
            document.getElementById(`${targetTab}-tab`).classList.add('active');
        });
    });
}

// Search functionality
function initializeSearch() {
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        filterApps(searchTerm);
    });
}

function filterApps(searchTerm) {
    filteredApps = apps.filter(app => 
        app.name.toLowerCase().includes(searchTerm) ||
        app.description.toLowerCase().includes(searchTerm) ||
        app.category.toLowerCase().includes(searchTerm)
    );
    renderApps(filteredApps);
}

// Upload functionality
function initializeUpload() {
    uploadForm.addEventListener('submit', async (e) => {
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
                renderApps(apps);
                uploadForm.reset();
                showNotification('App uploaded successfully!', 'success');
                
                // Switch to apps tab
                document.querySelector('[data-tab="apps"]').click();
            } else {
                const error = await response.json();
                showNotification(error.error || 'Upload failed', 'error');
            }
        } catch (error) {
            showNotification('Upload failed. Please try again.', 'error');
        }
    });
}

// Modal functionality
function initializeModal() {
    // Close modal when clicking X
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
        }
    });
}

// Load apps from server
async function loadApps() {
    try {
        const response = await fetch('/api/apps');
        if (response.ok) {
            apps = await response.json();
            filteredApps = apps;
            renderApps(apps);
        } else {
            showNotification('Failed to load apps', 'error');
        }
    } catch (error) {
        showNotification('Failed to load apps. Please try again.', 'error');
    }
}

// Render apps in the grid
function renderApps(appsToRender) {
    if (appsToRender.length === 0) {
        appsGrid.innerHTML = `
            <div class="no-apps">
                <i class="fas fa-search"></i>
                <h3>No apps found</h3>
                <p>Try adjusting your search criteria</p>
            </div>
        `;
        return;
    }
    
    appsGrid.innerHTML = appsToRender.map(app => `
        <div class="app-card" onclick="showAppDetails(${app.id})">
            <div class="app-header">
                <div class="app-info">
                    <h3>${escapeHtml(app.name)}</h3>
                    <span class="version">v${escapeHtml(app.version)}</span>
                </div>
                <span class="app-category">${escapeHtml(app.category)}</span>
            </div>
            
            <p class="app-description">${escapeHtml(app.description || 'No description available')}</p>
            
            <div class="app-stats">
                <span><i class="fas fa-download"></i> ${app.downloads} downloads</span>
                <span><i class="fas fa-calendar"></i> ${app.uploadDate}</span>
            </div>
            
            <div class="app-actions">
                <a href="${app.downloadUrl}" class="btn btn-primary" onclick="event.stopPropagation()">
                    <i class="fas fa-download"></i>
                    Download (${app.fileSize})
                </a>
                <button class="btn btn-secondary" onclick="event.stopPropagation(); showAppDetails(${app.id})">
                    <i class="fas fa-info-circle"></i>
                    Details
                </button>
            </div>
        </div>
    `).join('');
}

// Show app details in modal
async function showAppDetails(appId) {
    try {
        const response = await fetch(`/api/apps/${appId}`);
        if (response.ok) {
            const app = await response.json();
            showAppModal(app);
        } else {
            showNotification('Failed to load app details', 'error');
        }
    } catch (error) {
        showNotification('Failed to load app details', 'error');
    }
}

// Show app modal
function showAppModal(app) {
    modalContent.innerHTML = `
        <div class="app-details">
            <div class="app-header">
                <div class="app-info">
                    <h2>${escapeHtml(app.name)}</h2>
                    <span class="version">v${escapeHtml(app.version)}</span>
                </div>
                <span class="app-category">${escapeHtml(app.category)}</span>
            </div>
            
            <div class="app-description">
                <h3>Description</h3>
                <p>${escapeHtml(app.description || 'No description available')}</p>
            </div>
            
            <div class="app-stats-grid">
                <div class="stat">
                    <i class="fas fa-download"></i>
                    <span>${app.downloads} downloads</span>
                </div>
                <div class="stat">
                    <i class="fas fa-calendar"></i>
                    <span>Uploaded: ${app.uploadDate}</span>
                </div>
                <div class="stat">
                    <i class="fas fa-file"></i>
                    <span>Size: ${app.fileSize}</span>
                </div>
            </div>
            
            <div class="modal-actions">
                <a href="${app.downloadUrl}" class="btn btn-primary">
                    <i class="fas fa-download"></i>
                    Download App
                </a>
                <button class="btn btn-secondary" onclick="modal.style.display='none'">
                    Close
                </button>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideIn 0.3s ease;
    `;
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// File upload drag and drop
document.addEventListener('DOMContentLoaded', function() {
    const fileUpload = document.querySelector('.file-upload');
    const fileInput = document.getElementById('appFile');
    const fileLabel = document.querySelector('.file-upload-label span');
    
    if (fileUpload && fileInput) {
        // Drag and drop functionality
        fileUpload.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileUpload.style.background = 'rgba(102, 126, 234, 0.2)';
        });
        
        fileUpload.addEventListener('dragleave', (e) => {
            e.preventDefault();
            fileUpload.style.background = 'rgba(102, 126, 234, 0.05)';
        });
        
        fileUpload.addEventListener('drop', (e) => {
            e.preventDefault();
            fileUpload.style.background = 'rgba(102, 126, 234, 0.05)';
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                fileInput.files = files;
                updateFileLabel(files[0].name);
            }
        });
        
        // File input change
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                updateFileLabel(e.target.files[0].name);
            }
        });
    }
    
    function updateFileLabel(fileName) {
        fileLabel.textContent = fileName;
        fileLabel.style.color = '#667eea';
        fileLabel.style.fontWeight = '600';
    }
});

// Add some additional CSS for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .app-details {
        padding: 0;
    }
    
    .app-details .app-header {
        margin-bottom: 1.5rem;
    }
    
    .app-details .app-description h3 {
        margin-bottom: 0.5rem;
        color: #333;
    }
    
    .app-stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
        margin: 1.5rem 0;
    }
    
    .stat {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px;
        background: #f8f9fa;
        border-radius: 8px;
        font-size: 0.9rem;
    }
    
    .stat i {
        color: #667eea;
    }
    
    .modal-actions {
        display: flex;
        gap: 10px;
        margin-top: 1.5rem;
    }
    
    .no-apps {
        text-align: center;
        padding: 3rem;
        color: white;
    }
    
    .no-apps i {
        font-size: 3rem;
        margin-bottom: 1rem;
        opacity: 0.7;
    }
    
    .no-apps h3 {
        margin-bottom: 0.5rem;
    }
    
    .no-apps p {
        opacity: 0.8;
    }
`;
document.head.appendChild(notificationStyles);
