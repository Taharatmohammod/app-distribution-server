// Supabase Configuration
const SUPABASE_URL = 'https://wgogoihxbasjhviqqfvk.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indnb2dvaWh4YmFzamh2aXFxZnZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxOTA2MDAsImV4cCI6MjA2Nzc2NjYwMH0._oAZ_22HKlhtLwZBei-cBpY3d9Sm_Lyc9E58jSF4Hwc'

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// DOM Elements
const searchInput = document.getElementById('searchInput');
const appsGrid = document.getElementById('appsGrid');
const tabButtons = document.querySelectorAll('.tab-button');
const tabPanels = document.querySelectorAll('.tab-panel');
const sliderTrack = document.getElementById('sliderTrack');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const sliderIndicators = document.getElementById('sliderIndicators');

// Global variables
let allApps = [];
let filteredApps = [];
let currentSlide = 0;
let slideInterval;

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    // Set up event listeners
    setupTabNavigation();
    setupSearch();
    setupHeroSlider();
    
    // Load apps from Supabase
    await loadAppsFromSupabase();
}

// Load Apps from Supabase
async function loadAppsFromSupabase() {
    try {
        const { data, error } = await supabase
            .from('apps')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Error fetching apps:', error);
            showError('Failed to load apps. Please try again later.');
            return;
        }
        
        allApps = data || [];
        filteredApps = [...allApps];
        
        if (allApps.length === 0) {
            showNoAppsMessage();
        } else {
            renderAppsList(allApps);
            // Load first app details
            loadAppDetails(allApps[0]);
        }
        
        // Update hero slider with new apps
        createHeroSlides();
        
    } catch (error) {
        console.error('Error loading apps:', error);
        showError('Failed to load apps. Please try again later.');
    }
}

// Render Apps List
function renderAppsList(apps) {
    if (apps.length === 0) {
        appsGrid.innerHTML = `
            <div class="no-apps-message">
                <h3>No apps available</h3>
                <p>Check back later for new apps!</p>
            </div>
        `;
        return;
    }
    
    appsGrid.innerHTML = apps.map((app, index) => `
        <div class="app-card ${index === 0 ? 'active' : ''}" data-app-id="${app.id}">
            <div class="app-icon">
                <img src="${app.icon_url || 'https://via.placeholder.com/60/4F46E5/FFFFFF?text=App'}" alt="${app.name} Icon">
            </div>
            <div class="app-info">
                <h3>${app.name}</h3>
                <p>Version ${app.version}</p>
                <span class="app-category">${app.category}</span>
            </div>
        </div>
    `).join('');
    
    // Set up app selection
    setupAppSelection();
}

// Show No Apps Message
function showNoAppsMessage() {
    appsGrid.innerHTML = `
        <div class="no-apps-message">
            <h3>No apps available yet</h3>
            <p>Apps will appear here once they are uploaded to the system.</p>
        </div>
    `;
    
    // Clear app details
    clearAppDetails();
}

// Clear App Details
function clearAppDetails() {
    const selectedAppInfo = document.querySelector('.selected-app-info');
    if (selectedAppInfo) {
        selectedAppInfo.innerHTML = `
            <img src="https://via.placeholder.com/80/4F46E5/FFFFFF?text=No+App" alt="No App Icon" class="selected-app-icon">
            <div>
                <h2>No App Selected</h2>
                <p>Select an app to view details</p>
            </div>
        `;
    }
    
    // Clear all tab content
    tabPanels.forEach(panel => {
        panel.innerHTML = `
            <div class="no-app-selected">
                <h3>No App Selected</h3>
                <p>Please select an app from the list to view its details.</p>
            </div>
        `;
    });
}

// Show Error Message
function showError(message) {
    appsGrid.innerHTML = `
        <div class="error-message">
            <h3>Error</h3>
            <p>${message}</p>
            <button onclick="loadAppsFromSupabase()" class="retry-btn">Try Again</button>
        </div>
    `;
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
    const appCards = document.querySelectorAll('.app-card');
    
    appCards.forEach(card => {
        card.addEventListener('click', function() {
            const appId = parseInt(this.getAttribute('data-app-id'));
            const selectedApp = allApps.find(app => app.id === appId);
            
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

// Search Functionality with Error Handling
function setupSearch() {
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            filteredApps = [...allApps];
            renderAppsList(filteredApps);
            return;
        }
        
        // Filter apps based on search term
        filteredApps = allApps.filter(app => 
            app.name.toLowerCase().includes(searchTerm) ||
            app.category.toLowerCase().includes(searchTerm) ||
            app.description.toLowerCase().includes(searchTerm)
        );
        
        if (filteredApps.length === 0) {
            showSearchError(searchTerm);
        } else {
            renderAppsList(filteredApps);
        }
    });
}

// Show Search Error with Suggestions
function showSearchError(searchTerm) {
    // Get random suggestions (up to 3 apps that don't match the search)
    const suggestions = allApps
        .filter(app => 
            !app.name.toLowerCase().includes(searchTerm) &&
            !app.category.toLowerCase().includes(searchTerm)
        )
        .slice(0, 3);
    
    appsGrid.innerHTML = `
        <div class="search-error">
            <div class="error-content">
                <h3>No apps found for "${searchTerm}"</h3>
                <p>We couldn't find any apps matching your search.</p>
                
                ${suggestions.length > 0 ? `
                    <div class="suggestions">
                        <h4>You may like these apps:</h4>
                        <div class="suggestion-cards">
                            ${suggestions.map(app => `
                                <div class="suggestion-card" onclick="selectSuggestion(${app.id})">
                                    <img src="${app.icon_url || 'https://via.placeholder.com/40/4F46E5/FFFFFF?text=App'}" alt="${app.name}">
                                    <div>
                                        <h5>${app.name}</h5>
                                        <span>${app.category}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <button onclick="clearSearch()" class="clear-search-btn">
                    <i class="fas fa-times"></i> Clear Search
                </button>
            </div>
        </div>
    `;
}

// Select Suggestion
function selectSuggestion(appId) {
    const selectedApp = allApps.find(app => app.id === appId);
    if (selectedApp) {
        searchInput.value = '';
        filteredApps = [...allApps];
        renderAppsList(filteredApps);
        loadAppDetails(selectedApp);
    }
}

// Clear Search
function clearSearch() {
    searchInput.value = '';
    filteredApps = [...allApps];
    renderAppsList(filteredApps);
}

// Load App Details
function loadAppDetails(app) {
    // Update app header
    const selectedAppInfo = document.querySelector('.selected-app-info');
    selectedAppInfo.innerHTML = `
        <img src="${app.icon_url || 'https://via.placeholder.com/80/4F46E5/FFFFFF?text=App'}" alt="App Icon" class="selected-app-icon">
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
            <p>${app.description || 'No description available.'}</p>
        </div>
        
        <div class="app-features">
            <h3>Features</h3>
            <ul>
                ${(app.features || []).map(feature => `<li>${feature}</li>`).join('')}
                ${(app.features || []).length === 0 ? '<li>Features will be added soon</li>' : ''}
            </ul>
        </div>
        
        <div class="app-meta">
            <div class="meta-item">
                <span class="label">Size:</span>
                <span class="value">${app.file_size || 'Unknown'}</span>
            </div>
            <div class="meta-item">
                <span class="label">Downloads:</span>
                <span class="value">${formatNumber(app.download_count || 0)}</span>
            </div>
            <div class="meta-item">
                <span class="label">Updated:</span>
                <span class="value">${formatDate(app.updated_at || app.created_at)}</span>
            </div>
        </div>
    `;
}

// Update Screenshots Tab
function updateScreenshotsTab(app) {
    const screenshotsPanel = document.getElementById('screenshots');
    
    if (app.screenshots && app.screenshots.length > 0) {
        screenshotsPanel.innerHTML = `
            <div class="screenshots-grid">
                ${app.screenshots.map(screenshot => `
                    <div class="screenshot">
                        <img src="${screenshot}" alt="Screenshot">
                    </div>
                `).join('')}
            </div>
        `;
    } else {
        screenshotsPanel.innerHTML = `
            <div class="no-screenshots">
                <h3>No Screenshots Available</h3>
                <p>Screenshots will be added soon.</p>
            </div>
        `;
    }
}

// Update Changelog Tab
function updateChangelogTab(app) {
    const changelogPanel = document.getElementById('changelog');
    // Ensure changelog is an array
    const changelog = Array.isArray(app.changelog) ? app.changelog : [];
    if (changelog.length > 0) {
        changelogPanel.innerHTML = `
            <div class="changelog">
                ${changelog.map(version => `
                    <div class="version-entry">
                        <h3>Version ${version.version} (${formatDate(version.date)})</h3>
                        <ul>
                            ${(Array.isArray(version.changes) ? version.changes : []).map(change => `<li>${change}</li>`).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>
        `;
    } else {
        changelogPanel.innerHTML = `
            <div class="no-changelog">
                <h3>No Changelog Available</h3>
                <p>Changelog will be added soon.</p>
            </div>
        `;
    }
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
                    <button class="download-btn primary" onclick="downloadApp(${app.id}, '${app.name}')">Download APK</button>
                </div>
                
                <div class="download-card">
                    <div class="download-icon">📱</div>
                    <h4>QR Code</h4>
                    <p>Scan the QR code with your phone to download</p>
                    <div class="qr-code">
                        <img src="${generateQRCode(app.download_url)}" alt="QR Code">
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
async function downloadApp(appId, appName) {
    try {
        // Get signed URL from Supabase storage
        const { data, error } = await supabase.storage
            .from('apks')
            .createSignedUrl(`${appId}.apk`, 60);
        
        if (error) {
            console.error('Error generating download URL:', error);
            alert('Download failed. Please try again later.');
            return;
        }
        
        // Track download
        await supabase
            .from('downloads')
            .insert({ 
                app_id: appId, 
                downloaded_at: new Date().toISOString() 
            });
        
        // Trigger download
        window.open(data.signedUrl, '_blank');
        
    } catch (error) {
        console.error('Error downloading app:', error);
        alert('Download failed. Please try again later.');
    }
}

// Utility Functions
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatDate(dateString) {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

function generateQRCode(downloadUrl) {
    if (!downloadUrl) return 'https://via.placeholder.com/150/000000/FFFFFF?text=QR';
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(downloadUrl)}`;
}

// Hero Slider Functions
function setupHeroSlider() {
    // Create hero slides from featured apps
    createHeroSlides();
    
    // Set up navigation
    prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
    nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));
    
    // Auto-advance slides
    startAutoSlide();
}

function createHeroSlides() {
    // Create slides from the first 3 apps (or create default slides if no apps)
    const slides = allApps.length > 0 ? allApps.slice(0, 3) : createDefaultSlides();
    
    sliderTrack.innerHTML = slides.map((slide, index) => `
        <div class="slider-slide" data-slide="${index}">
            <div class="slide-content">
                <h2>${slide.name || slide.title}</h2>
                <p>${slide.description || slide.subtitle}</p>
                <div class="slide-actions">
                    <button class="slide-btn primary" onclick="selectAppFromSlider(${slide.id || index})">
                        <i class="fas fa-download"></i> Download Now
                    </button>
                    <button class="slide-btn secondary" onclick="viewAppDetails(${slide.id || index})">
                        <i class="fas fa-info-circle"></i> Learn More
                    </button>
                </div>
            </div>
            <img src="${slide.icon_url || slide.image}" alt="${slide.name || slide.title}" class="slide-image">
        </div>
    `).join('');
    
    // Create indicators
    createIndicators(slides.length);
    
    // Show first slide
    goToSlide(0);
}

function createDefaultSlides() {
    return [
        {
            title: "Welcome to TMS App Store",
            subtitle: "Discover amazing apps and download them instantly",
            image: "https://via.placeholder.com/200x200/4F46E5/FFFFFF?text=TMS",
            id: 0
        },
        {
            title: "Easy App Distribution",
            subtitle: "Upload and share your apps with the world",
            image: "https://via.placeholder.com/200x200/10B981/FFFFFF?text=Apps",
            id: 1
        },
        {
            title: "Secure Downloads",
            subtitle: "All apps are verified and safe to download",
            image: "https://via.placeholder.com/200x200/F59E0B/FFFFFF?text=Secure",
            id: 2
        }
    ];
}

function createIndicators(count) {
    sliderIndicators.innerHTML = Array.from({ length: count }, (_, i) => `
        <div class="indicator ${i === 0 ? 'active' : ''}" onclick="goToSlide(${i})"></div>
    `).join('');
}

function goToSlide(index) {
    const slides = document.querySelectorAll('.slider-slide');
    const indicators = document.querySelectorAll('.indicator');
    
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    
    currentSlide = index;
    
    // Update slider position
    sliderTrack.style.transform = `translateX(-${index * 100}%)`;
    
    // Update indicators
    indicators.forEach((indicator, i) => {
        indicator.classList.toggle('active', i === index);
    });
    
    // Update navigation buttons
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === slides.length - 1;
}

function startAutoSlide() {
    slideInterval = setInterval(() => {
        goToSlide(currentSlide + 1);
    }, 5000); // Change slide every 5 seconds
}

function stopAutoSlide() {
    clearInterval(slideInterval);
}

function selectAppFromSlider(appId) {
    // Find the app and select it in the main list
    const app = allApps.find(app => app.id === appId);
    if (app) {
        // Scroll to main content and select the app
        document.querySelector('.main-content').scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
            const appCard = document.querySelector(`[data-app-id="${appId}"]`);
            if (appCard) {
                appCard.click();
            }
        }, 1000);
    }
}

function viewAppDetails(appId) {
    selectAppFromSlider(appId);
}

// Enhanced Tab Navigation with Animations
function setupTabNavigation() {
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all buttons and panels
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanels.forEach(panel => panel.classList.remove('active'));
            
            // Add active class to clicked button and corresponding panel
            this.classList.add('active');
            const targetPanel = document.getElementById(targetTab);
            targetPanel.classList.add('active');
            
            // Add animation to the new panel
            targetPanel.style.animation = 'tabSlide 0.3s ease-out';
            setTimeout(() => {
                targetPanel.style.animation = '';
            }, 300);
        });
    });
}

// Enhanced App Selection with Animations
function setupAppSelection() {
    const appCards = document.querySelectorAll('.app-card');
    
    appCards.forEach(card => {
        card.addEventListener('click', function() {
            const appId = parseInt(this.getAttribute('data-app-id'));
            const selectedApp = allApps.find(app => app.id === appId);
            
            if (selectedApp) {
                // Update active card with animation
                appCards.forEach(c => {
                    c.classList.remove('active');
                    c.style.animation = '';
                });
                
                this.classList.add('active');
                this.style.animation = 'pulse 0.5s ease-out';
                
                // Load app details with fade animation
                loadAppDetails(selectedApp);
            }
        });
    });
}

// Auto-refresh apps every 30 seconds to catch new uploads
setInterval(async () => {
    await loadAppsFromSupabase();
}, 30000); 