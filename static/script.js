// DOM Elements
const searchInput = document.getElementById('searchInput');
const appsGrid = document.getElementById('appsGrid');
const appCards = document.querySelectorAll('.app-card');
const tabButtons = document.querySelectorAll('.tab-button');
const tabPanels = document.querySelectorAll('.tab-panel');

// Sample app data (this would come from Supabase in production)
const appsData = [
    {
        id: 1,
        name: 'Sample App 1',
        version: '1.0.0',
        category: 'Productivity',
        description: 'This is a sample app description. It showcases the features and functionality of the application. Users can learn about what the app does and its key features here.',
        features: [
            'Feature 1 description',
            'Feature 2 description',
            'Feature 3 description',
            'Feature 4 description'
        ],
        size: '15.2 MB',
        downloads: '1,234',
        updated: '2024-01-15',
        icon: 'https://via.placeholder.com/60/4F46E5/FFFFFF?text=App',
        screenshots: [
            'https://via.placeholder.com/300x600/4F46E5/FFFFFF?text=Screenshot+1',
            'https://via.placeholder.com/300x600/4F46E5/FFFFFF?text=Screenshot+2',
            'https://via.placeholder.com/300x600/4F46E5/FFFFFF?text=Screenshot+3'
        ],
        changelog: [
            {
                version: '1.0.0',
                date: '2024-01-15',
                changes: [
                    'Initial release',
                    'Core functionality implemented',
                    'Basic UI components'
                ]
            },
            {
                version: '0.9.0',
                date: '2024-01-10',
                changes: [
                    'Beta testing phase',
                    'Bug fixes and improvements'
                ]
            }
        ]
    },
    {
        id: 2,
        name: 'Sample App 2',
        version: '2.1.0',
        category: 'Utility',
        description: 'A utility app that helps users with various tasks and provides essential tools for daily use.',
        features: [
            'Advanced utility features',
            'Customizable interface',
            'Cloud sync support',
            'Offline functionality'
        ],
        size: '8.7 MB',
        downloads: '2,567',
        updated: '2024-01-20',
        icon: 'https://via.placeholder.com/60/10B981/FFFFFF?text=App',
        screenshots: [
            'https://via.placeholder.com/300x600/10B981/FFFFFF?text=Screenshot+1',
            'https://via.placeholder.com/300x600/10B981/FFFFFF?text=Screenshot+2'
        ],
        changelog: [
            {
                version: '2.1.0',
                date: '2024-01-20',
                changes: [
                    'Performance improvements',
                    'New utility features',
                    'Bug fixes'
                ]
            }
        ]
    },
    {
        id: 3,
        name: 'Sample App 3',
        version: '1.5.2',
        category: 'Entertainment',
        description: 'An entertainment app that provides users with various forms of digital content and interactive experiences.',
        features: [
            'Rich media content',
            'Interactive features',
            'Social sharing',
            'Personalized recommendations'
        ],
        size: '25.3 MB',
        downloads: '3,891',
        updated: '2024-01-18',
        icon: 'https://via.placeholder.com/60/F59E0B/FFFFFF?text=App',
        screenshots: [
            'https://via.placeholder.com/300x600/F59E0B/FFFFFF?text=Screenshot+1',
            'https://via.placeholder.com/300x600/F59E0B/FFFFFF?text=Screenshot+2',
            'https://via.placeholder.com/300x600/F59E0B/FFFFFF?text=Screenshot+3'
        ],
        changelog: [
            {
                version: '1.5.2',
                date: '2024-01-18',
                changes: [
                    'New entertainment features',
                    'UI improvements',
                    'Performance optimizations'
                ]
            }
        ]
    }
];

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Set up event listeners
    setupTabNavigation();
    setupAppSelection();
    setupSearch();
    
    // Load initial app data
    loadAppDetails(appsData[0]);
}

// Tab Navigation
function setupTabNavigation() {
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all buttons and panels
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanels.forEach(panel => panel.classList.remove('active'));
            
            // Add active class to clicked button and corresponding panel
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// App Selection
function setupAppSelection() {
    appCards.forEach(card => {
        card.addEventListener('click', function() {
            const appId = parseInt(this.getAttribute('data-app-id'));
            const selectedApp = appsData.find(app => app.id === appId);
            
            if (selectedApp) {
                // Update active card
                appCards.forEach(c => c.classList.remove('active'));
                this.classList.add('active');
                
                // Load app details
                loadAppDetails(selectedApp);
            }
        });
    });
}

// Search Functionality
function setupSearch() {
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        
        appCards.forEach(card => {
            const appName = card.querySelector('h3').textContent.toLowerCase();
            const appCategory = card.querySelector('.app-category').textContent.toLowerCase();
            
            if (appName.includes(searchTerm) || appCategory.includes(searchTerm)) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

// Load App Details
function loadAppDetails(app) {
    // Update app header
    const selectedAppInfo = document.querySelector('.selected-app-info');
    selectedAppInfo.innerHTML = `
        <img src="${app.icon}" alt="App Icon" class="selected-app-icon">
        <div>
            <h2>${app.name}</h2>
            <p>Version ${app.version} • ${app.category}</p>
        </div>
    `;
    
    // Update Details tab
    updateDetailsTab(app);
    
    // Update Screenshots tab
    updateScreenshotsTab(app);
    
    // Update Changelog tab
    updateChangelogTab(app);
    
    // Update Install tab
    updateInstallTab(app);
}

// Update Details Tab
function updateDetailsTab(app) {
    const detailsPanel = document.getElementById('details');
    
    detailsPanel.innerHTML = `
        <div class="app-description">
            <h3>About this app</h3>
            <p>${app.description}</p>
        </div>
        
        <div class="app-features">
            <h3>Features</h3>
            <ul>
                ${app.features.map(feature => `<li>${feature}</li>`).join('')}
            </ul>
        </div>
        
        <div class="app-meta">
            <div class="meta-item">
                <span class="label">Size:</span>
                <span class="value">${app.size}</span>
            </div>
            <div class="meta-item">
                <span class="label">Downloads:</span>
                <span class="value">${app.downloads}</span>
            </div>
            <div class="meta-item">
                <span class="label">Updated:</span>
                <span class="value">${app.updated}</span>
            </div>
        </div>
    `;
}

// Update Screenshots Tab
function updateScreenshotsTab(app) {
    const screenshotsPanel = document.getElementById('screenshots');
    
    screenshotsPanel.innerHTML = `
        <div class="screenshots-grid">
            ${app.screenshots.map(screenshot => `
                <div class="screenshot">
                    <img src="${screenshot}" alt="Screenshot">
                </div>
            `).join('')}
        </div>
    `;
}

// Update Changelog Tab
function updateChangelogTab(app) {
    const changelogPanel = document.getElementById('changelog');
    
    changelogPanel.innerHTML = `
        <div class="changelog">
            ${app.changelog.map(version => `
                <div class="version-entry">
                    <h3>Version ${version.version} (${version.date})</h3>
                    <ul>
                        ${version.changes.map(change => `<li>${change}</li>`).join('')}
                    </ul>
                </div>
            `).join('')}
        </div>
    `;
}

// Update Install Tab
function updateInstallTab(app) {
    const installPanel = document.getElementById('install');
    
    installPanel.innerHTML = `
        <div class="install-section">
            <div class="install-header">
                <h3>Install ${app.name}</h3>
                <p>Download and install the APK file on your Android device</p>
            </div>
            
            <div class="download-options">
                <div class="download-card">
                    <div class="download-icon">📱</div>
                    <h4>Direct Download</h4>
                    <p>Download the APK file directly to your device</p>
                    <button class="download-btn primary" onclick="downloadApp('${app.name}')">Download APK</button>
                </div>
                
                <div class="download-card">
                    <div class="download-icon">📱</div>
                    <h4>QR Code</h4>
                    <p>Scan the QR code with your phone to download</p>
                    <div class="qr-code">
                        <img src="https://via.placeholder.com/150/000000/FFFFFF?text=QR" alt="QR Code">
                    </div>
                </div>
            </div>
            
            <div class="install-instructions">
                <h4>Installation Instructions</h4>
                <ol>
                    <li>Download the APK file to your Android device</li>
                    <li>Go to Settings > Security > Unknown Sources</li>
                    <li>Enable "Allow installation from unknown sources"</li>
                    <li>Open the downloaded APK file</li>
                    <li>Tap "Install" when prompted</li>
                    <li>Wait for installation to complete</li>
                    <li>Open the app from your app drawer</li>
                </ol>
            </div>
        </div>
    `;
}

// Download App Function
function downloadApp(appName) {
    // This would integrate with your actual download system
    alert(`Download started for ${appName}. This would trigger the actual APK download in production.`);
    
    // In production, this would:
    // 1. Generate a download link from Supabase storage
    // 2. Track download count
    // 3. Handle the actual file download
}

// Utility function to format numbers
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Utility function to generate QR code URL
function generateQRCode(downloadUrl) {
    // This would generate a QR code for the download URL
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(downloadUrl)}`;
}

// Future: Supabase Integration
// When you're ready to integrate with Supabase, you would:
// 1. Initialize Supabase client
// 2. Fetch apps from the database
// 3. Update the loadAppDetails function to use real data
// 4. Implement actual download functionality
// 5. Add download tracking

/*
// Example Supabase integration:
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'
const supabase = createClient(supabaseUrl, supabaseKey)

async function fetchApps() {
    const { data, error } = await supabase
        .from('apps')
        .select('*')
        .order('created_at', { ascending: false })
    
    if (error) {
        console.error('Error fetching apps:', error)
        return []
    }
    
    return data
}

async function downloadApp(appId) {
    // Get the download URL from Supabase storage
    const { data, error } = await supabase.storage
        .from('apks')
        .createSignedUrl(`${appId}.apk`, 60)
    
    if (error) {
        console.error('Error generating download URL:', error)
        return
    }
    
    // Trigger download
    window.open(data.signedUrl, '_blank')
    
    // Track download
    await supabase
        .from('downloads')
        .insert({ app_id: appId, downloaded_at: new Date() })
}
*/ 