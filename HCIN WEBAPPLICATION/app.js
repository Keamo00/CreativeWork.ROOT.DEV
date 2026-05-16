/* ==================== DARK MODE ==================== */
// Dark mode is initialized in head of each HTML page directly
// The following function sets up the toggle button listener

function initDarkModeListener() {
    const darkModeBtn = document.getElementById('dark-mode-btn');

    if (darkModeBtn) {
        darkModeBtn.addEventListener('click', function () {
            document.documentElement.classList.toggle('dark-mode');
            const isNowDark = document.documentElement.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isNowDark);
            darkModeBtn.textContent = isNowDark ? '☀️' : '🌙';
        });

        // Set initial button text based on current state
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        darkModeBtn.textContent = isDarkMode ? '☀️' : '🌙';
    }
}

/* ==================== NAME INPUT MODAL ==================== */
function initNameModal() {
    const nameModal = document.getElementById('name-modal');
    const userNameInput = document.getElementById('user-name-input');
    const welcomeGreeting = document.getElementById('welcome-greeting');

    if (!nameModal) return; // Not on home page

    const savedName = localStorage.getItem('userName');

    // Always show the modal
    nameModal.classList.remove('hidden');
    
    // Pre-fill if a name was saved previously
    if (savedName && userNameInput) {
        userNameInput.value = savedName;
    }

    if (userNameInput) {
        userNameInput.focus();
        userNameInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                saveName();
            }
        });
    }
}

function resetName() {
    localStorage.removeItem('userName');
    const nameModal = document.getElementById('name-modal');
    const userNameInput = document.getElementById('user-name-input');

    nameModal.classList.remove('hidden');
    userNameInput.value = '';
    userNameInput.focus();
}

function saveName() {
    const userNameInput = document.getElementById('user-name-input');
    const welcomeGreeting = document.getElementById('welcome-greeting');
    const nameModal = document.getElementById('name-modal');

    let name = userNameInput.value.trim();

    if (name === '') {
        userNameInput.style.borderColor = '#ff7f7f';
        userNameInput.style.boxShadow = '0 0 0 3px rgba(255, 127, 127, 0.1)';
        userNameInput.focus();
        setTimeout(() => {
            userNameInput.style.borderColor = '';
            userNameInput.style.boxShadow = '';
        }, 2000);
        return;
    }

    // Capitalize first letter
    name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

    // Save to localStorage
    localStorage.setItem('userName', name);

    // Update greeting first
    if (welcomeGreeting) {
        welcomeGreeting.textContent = `Welcome to CampusCoin, ${name}! 👋`;
    }

    // Hide modal with fade animation
    nameModal.classList.add('hidden');
}

// Initialize name modal on page load
// This is now handled by the main initialization block above


/* ==================== DATA MANAGEMENT ==================== */
let appState = {
    currentMonth: 1,
    totalEarnings: 0,
    selectedTransaction: null
};

// Load from localStorage
function loadState() {
    const saved = localStorage.getItem('campuscoinState');
    if (saved) {
        appState = JSON.parse(saved);
        updateLoyaltyDisplay();
    }
}

// Save to localStorage
function saveState() {
    localStorage.setItem('campuscoinState', JSON.stringify(appState));
}

// ==================== REWARD TOAST NOTIFICATION ====================
function showRewardToast(amount) {
    const toast = document.createElement('div');
    toast.className = 'reward-toast';

    toast.innerHTML = `
        <div class="toast-icon">😊</div>
        <div class="toast-message">
            <b>Reward Earned!</b>
            <span>R${amount.toFixed(2)} added to Grocery eWallet</span>
        </div>
    `;

    document.body.appendChild(toast);

    // Auto-remove after 4 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.5s ease-in forwards';
        setTimeout(() => toast.remove(), 500);
    }, 4000);
}

// ==================== CALCULATOR FUNCTIONS ====================
const budgetForm = document.getElementById('budget-form');
if (budgetForm) {
    budgetForm.addEventListener('submit', function (e) {
        e.preventDefault();
        calculateRewards();
    });

    // Add real-time calculation
    const inputs = document.querySelectorAll('#data-spend, #electricity-spend, #food-spend');
    inputs.forEach(input => {
        input.addEventListener('input', calculateRewards);
    });
}

function calculateRewards() {
    const dataSpend = parseFloat(document.getElementById('data-spend').value) || 0;
    const electricitySpend = parseFloat(document.getElementById('electricity-spend').value) || 0;
    const foodSpend = parseFloat(document.getElementById('food-spend').value) || 0;

    const total = dataSpend + electricitySpend + foodSpend;
    const rewards = total * 0.1; // 10% back in grocery vouchers

    const resultDiv = document.getElementById('calc-result');
    const calcWindow = document.getElementById('calculator-window');

    if (resultDiv) {
        if (total > 0) {
            resultDiv.textContent = `Total spent: R${total.toFixed(2)} | Potential Monthly Savings: R${rewards.toFixed(2)}`;
            resultDiv.classList.add('show');

            // Reaction: Glow on high values
            if (total > 1500 && calcWindow) {
                calcWindow.classList.add('high-value-glow');
            } else if (calcWindow) {
                calcWindow.classList.remove('high-value-glow');
            }

            // Update state
            appState.totalEarnings += rewards * 0.01; // Small increment for demo
            saveState();
        } else {
            resultDiv.classList.remove('show');
            if (calcWindow) calcWindow.classList.remove('high-value-glow');
        }
    }
}

// ==================== TRANSACTION FUNCTIONS ====================
function selectTransaction(type, element) {
    document.querySelectorAll('.transaction-item').forEach(item => {
        item.classList.remove('selected');
    });
    if (element) {
        element.classList.add('selected');
    }
    appState.selectedTransaction = type;
}

function completeTransaction() {
    const amount = parseFloat(document.getElementById('transaction-amount').value) || 0;

    if (!appState.selectedTransaction) {
        alert('Please select a service');
        return;
    }

    if (amount <= 0) {
        alert('Please enter an amount');
        return;
    }

    const reward = amount * 0.1;
    appState.totalEarnings += reward;
    saveState();

    // Clear form
    document.getElementById('transaction-amount').value = '';
    document.querySelectorAll('.transaction-item').forEach(item => {
        item.classList.remove('selected');
    });
    appState.selectedTransaction = null;

    // View visual feedback
    const transactBtn = document.querySelector('#transact-window .btn');
    const loyaltyIcon = document.querySelector('.taskbar-icon[title="Loyalty Rewards"]');
    
    if (transactBtn && loyaltyIcon) {
        const startRect = transactBtn.getBoundingClientRect();
        const endRect = loyaltyIcon.getBoundingClientRect();
        const startX = startRect.left + startRect.width / 2;
        const startY = startRect.top + startRect.height / 2;
        
        // If loyalty window is open, send to it instead
        const loyaltyWindow = document.getElementById('loyalty-window');
        let endX = endRect.left + endRect.width / 2;
        let endY = endRect.top;
        
        if (loyaltyWindow && !loyaltyWindow.classList.contains('hidden')) {
            const orbRect = loyaltyWindow.getBoundingClientRect();
            endX = orbRect.left + orbRect.width / 2;
            endY = orbRect.top + orbRect.height / 2;
        }

        spawnSmileyCoin(startX, startY, endX, endY);
    }

    // Show success
    showRewardToast(reward);
}

// ==================== LOYALTY FUNCTIONS ====================
function advanceLoyaltyMonth() {
    if (appState.currentMonth < 12) {
        appState.currentMonth++;
        saveState();
        updateLoyaltyDisplay();
        showRewardToast(500); // Bonus for completing month
    } else {
        alert('🎉 Congratulations! You\'ve reached the 12-month loyalty goal! Claim your R6,000 grocery reward!');
    }
}

function updateLoyaltyDisplay() {
    const monthEl = document.getElementById('loyalty-month');
    const displayMonthEl = document.getElementById('current-month');
    const earnedRewardsEl = document.getElementById('earned-rewards');
    const progressText = document.getElementById('progress-text');
    const statusMessage = document.getElementById('status-message');

    if (monthEl) monthEl.textContent = `Month ${appState.currentMonth}`;
    if (displayMonthEl) displayMonthEl.textContent = appState.currentMonth;
    if (earnedRewardsEl) {
        earnedRewardsEl.textContent = 'R' + appState.totalEarnings.toFixed(2);
    }
    if (progressText) {
        progressText.textContent = `${appState.currentMonth}/12`;
    }

    // Update status message
    if (statusMessage) {
        let message = '';
        if (appState.currentMonth === 1) {
            message = '📌 Month 1: Keep spending smart to unlock rewards!';
        } else if (appState.currentMonth < 6) {
            message = `🌱 Month ${appState.currentMonth}: You're on the path to success!`;
        } else if (appState.currentMonth < 12) {
            message = `⭐ Month ${appState.currentMonth}: Almost there! Keep going!`;
        } else {
            message = '🏆 Month 12: You\'ve unlocked the R6,000 grocery reward!';
            statusMessage.style.backgroundColor = 'rgba(255, 215, 0, 0.2)';
            statusMessage.style.color = '#b8860b';
            statusMessage.style.borderLeftColor = 'gold';
        }
        statusMessage.textContent = message;
    }

    // Initialize or Update 3D Orb
    initOrUpdateOrb();
}

let orbScene, orbCamera, orbRenderer, orbMaterial, orbAnimationId;

function initOrUpdateOrb() {
    const container = document.getElementById('orb-container');
    const canvas = document.getElementById('orb-canvas');
    if (!container || !canvas || typeof THREE === 'undefined') return;

    // Calculate progress ratio
    let progressRatio = appState.currentMonth / 12;
    // Cap at 1
    progressRatio = Math.min(progressRatio, 1);

    if (!orbScene) {
        // Initialize Scene
        orbScene = new THREE.Scene();
        orbCamera = new THREE.PerspectiveCamera(50, container.offsetWidth / container.offsetHeight, 0.1, 100);
        orbCamera.position.z = 4;

        orbRenderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
        orbRenderer.setSize(container.offsetWidth, container.offsetHeight);
        orbRenderer.setPixelRatio(window.devicePixelRatio);

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        orbScene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 1);
        pointLight.position.set(2, 2, 2);
        orbScene.add(pointLight);

        // Geometry & Material
        const geometry = new THREE.SphereGeometry(1.5, 32, 32);
        // Base material is translucent white/glass
        orbMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            transmission: 0.8, // glass-like
            opacity: 1,
            metalness: 0,
            roughness: 0.1,
            ior: 1.5,
            emissive: new THREE.Color(0x63cdda), // Teal glow
            emissiveIntensity: progressRatio * 0.8, // Glow based on progress
            clearcoat: 1.0,
            clearcoatRoughness: 0.1
        });

        const sphere = new THREE.Mesh(geometry, orbMaterial);
        orbScene.add(sphere);

        // Core fill logic (Inner sphere)
        const innerGeo = new THREE.SphereGeometry(1.4, 32, 32);
        const innerMat = new THREE.MeshBasicMaterial({
            color: 0x5758bb,
            transparent: true,
            opacity: 0.8 * progressRatio
        });
        const innerSphere = new THREE.Mesh(innerGeo, innerMat);
        innerSphere.scale.set(progressRatio || 0.1, progressRatio || 0.1, progressRatio || 0.1);
        sphere.add(innerSphere);

        // Animation Loop
        const animateOrb = () => {
            orbAnimationId = requestAnimationFrame(animateOrb);
            sphere.rotation.y += 0.01;
            sphere.rotation.x += 0.005;
            
            // Pulse effect
            const time = Date.now() * 0.001;
            const pulse = Math.sin(time * 2) * 0.1 + 0.9;
            innerSphere.scale.setScalar(Math.max(0.1, progressRatio * pulse));

            orbRenderer.render(orbScene, orbCamera);
        };
        animateOrb();
    } else {
        // Update existing material and inner sphere scale mapping
        orbMaterial.emissiveIntensity = progressRatio * 0.8;
        orbScene.children.forEach(child => {
            if (child.isPointLight) return;
            // Find inner sphere and update target base scale
            if (child.children && child.children.length > 0) {
                 const innerMat = child.children[0].material;
                 innerMat.opacity = 0.8 * progressRatio;
            }
        });
    }
}

// ==================== PAGE INITIALIZATION ====================
// Main initialization that runs once when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Initialize all features
        initDarkModeListener();
        initNameModal();
        loadState();
        updateLoyaltyDisplay();
        initThreeJsAura();
        initRippleEffects();
        initWindowAnimations();
    });
} else {
    // DOM is already loaded
    initDarkModeListener();
    initNameModal();
    loadState();
    updateLoyaltyDisplay();
    initThreeJsAura();
    initRippleEffects();
    initWindowAnimations();
}

// ==================== SPATIAL UI: THREE.JS AURA ====================
function initThreeJsAura() {
    // Determine if we are on a page where we want the aura (like desktop)
    const isDesktop = document.querySelector('.desktop');
    if (!isDesktop || typeof THREE === 'undefined') return;

    const canvas = document.createElement('canvas');
    canvas.id = 'bg-canvas';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1';
    isDesktop.insertBefore(canvas, isDesktop.firstChild);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#f0f4f8'); // Base light tone

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create soft blobs
    const geometry = new THREE.SphereGeometry(2, 64, 64);
    
    // Shader to create a soft, gradient blob effect
    const material1 = new THREE.MeshBasicMaterial({ color: 0x9D7FBB, transparent: true, opacity: 0.4 }); // Pink/Purple
    const material2 = new THREE.MeshBasicMaterial({ color: 0x63cdda, transparent: true, opacity: 0.3 }); // Teal
    
    const blob1 = new THREE.Mesh(geometry, material1);
    blob1.position.set(-2, 1, -2);
    blob1.scale.set(1.5, 1, 1);
    scene.add(blob1);

    const blob2 = new THREE.Mesh(geometry, material2);
    blob2.position.set(2, -1, -3);
    blob2.scale.set(1.2, 1.5, 1.2);
    scene.add(blob2);

    let mouseX = 0;
    let mouseY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        // Slow organic rotation and morphing
        blob1.rotation.x = elapsedTime * 0.2;
        blob1.rotation.y = elapsedTime * 0.3;
        
        blob2.rotation.x = -elapsedTime * 0.15;
        blob2.rotation.y = -elapsedTime * 0.25;

        // Blob pulsing
        blob1.scale.x = 1.5 + Math.sin(elapsedTime * 0.5) * 0.2;
        blob2.scale.y = 1.5 + Math.cos(elapsedTime * 0.4) * 0.3;

        // Subtle reaction to mouse
        blob1.position.x += (mouseX * 1 - blob1.position.x) * 0.05;
        blob1.position.y += (mouseY * 1 - blob1.position.y) * 0.05 + Math.sin(elapsedTime) * 0.01;

        blob2.position.x += (mouseX * -1.5 - blob2.position.x) * 0.04;
        blob2.position.y += (mouseY * -1.5 - blob2.position.y) * 0.04 + Math.cos(elapsedTime) * 0.01;

        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// ==================== SPATIAL UI: LIQUID BUTTONS ====================
function initRippleEffects() {
    const buttons = document.querySelectorAll('.transaction-item, .btn');
    
    buttons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            let x, y;
            if (e.clientX === 0 && e.clientY === 0) {
                // Keyboard trigger
                const rect = btn.getBoundingClientRect();
                x = rect.width / 2;
                y = rect.height / 2;
            } else {
                const rect = btn.getBoundingClientRect();
                x = e.clientX - rect.left;
                y = e.clientY - rect.top;
            }

            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            // Add styles dynamically if not in CSS
            ripple.style.position = 'absolute';
            ripple.style.background = 'rgba(255, 255, 255, 0.4)';
            ripple.style.borderRadius = '50%';
            ripple.style.transform = 'translate(-50%, -50%) scale(0)';
            ripple.style.pointerEvents = 'none';
            // Determine size based on button dimensions
            const size = Math.max(btn.offsetWidth, btn.offsetHeight) * 2;
            ripple.style.width = `${size}px`;
            ripple.style.height = `${size}px`;
            
            // Ensure button has relative position and overflow hidden
            if (getComputedStyle(btn).position === 'static') {
                btn.style.position = 'relative';
            }
            btn.style.overflow = 'hidden';

            btn.appendChild(ripple);

            // Animate with GSAP if available, else CSS
            if (typeof gsap !== 'undefined') {
                gsap.to(ripple, {
                    scale: 1,
                    opacity: 0,
                    duration: 0.6,
                    ease: "power2.out",
                    onComplete: () => ripple.remove()
                });
            } else {
                ripple.style.transition = 'transform 0.6s ease-out, opacity 0.6s ease-out';
                requestAnimationFrame(() => {
                    ripple.style.transform = 'translate(-50%, -50%) scale(1)';
                    ripple.style.opacity = '0';
                    setTimeout(() => ripple.remove(), 600);
                });
            }
        });
    });
}

// ==================== SPATIAL UI: WINDOW ANIMATIONS ====================
function initWindowAnimations() {
    const windows = document.querySelectorAll('.window');
    if (windows.length === 0 || typeof gsap === 'undefined') return;

    // Apply floating idle animation
    windows.forEach((win, index) => {
        // Add floating class for CSS animation
        win.classList.add('floating-window');
        // Offset animations so they don't move together
        win.style.animationDelay = `${index * 0.5}s`;
    });
}

// ==================== SPATIAL UI: SMILEY COIN ====================
function spawnSmileyCoin(startX, startY, endX, endY) {
    if (typeof gsap === 'undefined') return;
    
    const coin = document.createElement('div');
    coin.innerHTML = '🪙';
    coin.style.position = 'fixed';
    coin.style.left = startX + 'px';
    coin.style.top = startY + 'px';
    coin.style.fontSize = '30px';
    coin.style.zIndex = '9999';
    coin.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))';
    coin.style.pointerEvents = 'none';
    
    document.body.appendChild(coin);
    
    // Calculate arc
    const midX = startX + (endX - startX) / 2;
    const midY = startY - 200; // Arch height
    
    gsap.to(coin, {
        duration: 1,
        motionPath: {
            path: [
                {x: 0, y: 0},
                {x: midX - startX, y: midY - startY},
                {x: endX - startX, y: endY - startY}
            ],
            type: "soft"
        },
        scale: 1.5,
        rotation: 720,
        ease: "power1.inOut",
        onComplete: () => {
            coin.remove();
            // Flash effect on orb container
            const orbContainer = document.getElementById('loyalty-window');
            if (orbContainer && !orbContainer.classList.contains('hidden')) {
                gsap.fromTo(orbContainer, 
                    { boxShadow: '0 0 30px rgba(99, 205, 218, 0.8)' },
                    { boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)', duration: 0.8 }
                );
            }
        }
    });
}

// ==================== ACCESSIBILITY ====================
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // Close modals or dialogs if needed
        const nameModal = document.getElementById('name-modal');
        if (nameModal && !nameModal.classList.contains('hidden')) {
            const nameInput = document.getElementById('user-name-input');
            if (nameInput.value.trim() !== '') {
                nameModal.classList.add('hidden');
            }
        }
    }
});