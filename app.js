let currentUser = null;
let selectedMood = null;
let selectedMoodName = '';
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let imageData = null;
let isDevMode = false;
let isGuestMode = false;

// Apply saved font size on page load
(function() {
    const savedSize = localStorage.getItem('fontSize') || 'large';
    document.body.classList.add('font-' + savedSize);
})();

// Helper function to get supabase client
function getSupabase() {
    return window.supabaseClient;
}

// Mobile menu toggle function
function toggleMobileMenu() {
    const nav = document.querySelector('.landing-nav');
    const hamburger = document.querySelector('.hamburger-btn');
    const overlay = document.querySelector('.nav-overlay');
    
    if (nav && hamburger && overlay) {
        nav.classList.toggle('active');
        hamburger.classList.toggle('active');
        overlay.classList.toggle('active');
    }
}

// Make function globally accessible
window.toggleMobileMenu = toggleMobileMenu;

// Global function declarations to ensure they're available everywhere
// These will be assigned the actual function values later
window.startWeeklyCheck = null;
window.goToNextQuestion = null;
window.closeWeeklyCheckModal = null;

// Wait for supabase to be initialized from config.js
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    
    // Wait for supabase to be ready
    const waitForSupabase = () => {
        if (window.supabaseClient && window.supabaseClient.auth) {
            console.log('Supabase ready, checking auth...');
            checkAuth();
        } else {
            console.log('Waiting for supabase...');
            setTimeout(waitForSupabase, 100);
        }
    };
    waitForSupabase();
});

// Dev date offset for testing (load from localStorage)
let devDateOffset = parseInt(localStorage.getItem('devDateOffset') || '0');

// Get current date (with dev offset)
function getCurrentDate() {
    const date = new Date();
    if (isDevMode && devDateOffset > 0) {
        date.setDate(date.getDate() + devDateOffset);
    }
    return date;
}

// Dev accounts
const DEV_EMAILS = ['time27535@gmail.com', 'test@test.com'];

const GUEST_STORAGE_KEY = 'guest_user_data';
const TEST_USER_STORAGE_KEY = 'test_user_data';

// Helper function to check if current user is test user
function isTestUser() {
    return currentUser && currentUser.id === 'test-user-id';
}

// Helper function to get test user data
function getTestUserData() {
    const data = localStorage.getItem(TEST_USER_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
}

// Helper function to save test user data
function saveTestUserData(data) {
    localStorage.setItem(TEST_USER_STORAGE_KEY, JSON.stringify(data));
}

// Weekly Health Check Variables
let weeklyQuestions = [];
let currentWeeklyQuestion = 0;
let weeklyAnswers = [];
let thisWeekCompleted = false;

// ==================== Custom Modal System ====================
const Modal = {
    show({ type = 'info', title = '', message = '', html = '', showCancel = false, confirmText = 'ตกลง', cancelText = 'ยกเลิก', onConfirm = null, onCancel = null, input = null, inputValue = '', width = '380px' }) {
        return new Promise((resolve) => {
            // Remove existing modal
            this.close();
            
            const icons = {
                success: '<svg viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12l2.5 2.5L16 9"/></svg>',
                error: '<svg viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>',
                warning: '<svg viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>',
                info: '<svg viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>',
                question: '<svg viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9 9a3 3 0 115.12 2.12A2.5 2.5 0 0012 14M12 17h.01"/></svg>'
            };
            
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            overlay.id = 'customModal';
            
            let inputHtml = '';
            if (input === 'number') {
                inputHtml = `<input type="number" id="modalInput" class="modal-input" value="${inputValue}" min="0" max="100">`;
            } else if (input === 'text') {
                inputHtml = `<input type="text" id="modalInput" class="modal-input" value="${inputValue}">`;
            }
            
            overlay.innerHTML = `
                <div class="modal-box" style="max-width: ${width}">
                    ${type ? `<div class="modal-icon">${icons[type] || icons.info}</div>` : ''}
                    ${title ? `<h3 class="modal-title">${title}</h3>` : ''}
                    ${message ? `<p class="modal-message">${message}</p>` : ''}
                    ${html ? `<div class="modal-html">${html}</div>` : ''}
                    ${inputHtml}
                    <div class="modal-buttons">
                        ${showCancel ? `<button class="modal-btn modal-btn-cancel" id="modalCancel">${cancelText}</button>` : ''}
                        <button class="modal-btn modal-btn-confirm" id="modalConfirm">${confirmText}</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(overlay);
            requestAnimationFrame(() => overlay.classList.add('show'));
            
            const confirmBtn = document.getElementById('modalConfirm');
            const cancelBtn = document.getElementById('modalCancel');
            const inputEl = document.getElementById('modalInput');
            
            if (inputEl) inputEl.focus();
            
            confirmBtn.onclick = () => {
                const value = inputEl ? inputEl.value : true;
                this.close();
                if (onConfirm) onConfirm(value);
                resolve({ confirmed: true, value });
            };
            
            if (cancelBtn) {
                cancelBtn.onclick = () => {
                    this.close();
                    if (onCancel) onCancel();
                    resolve({ confirmed: false, value: null });
                };
            }
            
            overlay.onclick = (e) => {
                if (e.target === overlay && !showCancel) {
                    this.close();
                    resolve({ confirmed: false, value: null });
                }
            };
        });
    },
    
    loading(message = 'กำลังโหลด...') {
        this.close();
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay show';
        overlay.id = 'customModal';
        overlay.innerHTML = `
            <div class="modal-box modal-loading">
                <div class="modal-spinner"></div>
                <p class="modal-message">${message}</p>
            </div>
        `;
        document.body.appendChild(overlay);
    },
    
    close() {
        const modal = document.getElementById('customModal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 200);
        }
    },
    
    toast(message, type = 'success', duration = 3000) {
        const existing = document.querySelector('.toast-notification');
        if (existing) existing.remove();
        
        const colors = { success: '#65c8ff', error: '#EF4444', warning: '#F59E0B', info: '#3B82F6' };
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.style.borderLeftColor = colors[type];
        toast.innerHTML = `<span>${message}</span>`;
        document.body.appendChild(toast);
        
        requestAnimationFrame(() => toast.classList.add('show'));
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
};

async function typeText(containerId, html, speed = 20) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Parse HTML and extract text with tags
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    container.innerHTML = '<span class="typing-cursor">|</span>';
    
    // Function to type content recursively
    async function typeNode(node, targetContainer) {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent;
            for (let i = 0; i < text.length; i++) {
                // Remove cursor, add char, add cursor back
                const cursor = targetContainer.querySelector('.typing-cursor');
                if (cursor) cursor.remove();
                
                targetContainer.insertAdjacentText('beforeend', text[i]);
                targetContainer.insertAdjacentHTML('beforeend', '<span class="typing-cursor">|</span>');
                
                // Variable speed - faster for spaces, slower for punctuation
                let delay = speed;
                if (text[i] === ' ') delay = speed / 2;
                else if ('.!?'.includes(text[i])) delay = speed * 3;
                else if (',;:'.includes(text[i])) delay = speed * 2;
                
                await new Promise(r => setTimeout(r, delay));
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            // Handle <br> tags
            if (node.tagName === 'BR') {
                const cursor = targetContainer.querySelector('.typing-cursor');
                if (cursor) cursor.remove();
                targetContainer.insertAdjacentHTML('beforeend', '<br><span class="typing-cursor">|</span>');
                await new Promise(r => setTimeout(r, speed));
                return;
            }
            
            // Create element and append to container
            const cursor = targetContainer.querySelector('.typing-cursor');
            if (cursor) cursor.remove();
            
            const newElement = document.createElement(node.tagName);
            // Copy attributes
            for (const attr of node.attributes) {
                newElement.setAttribute(attr.name, attr.value);
            }
            newElement.innerHTML = '<span class="typing-cursor">|</span>';
            targetContainer.appendChild(newElement);
            
            // Type children into new element
            for (const child of node.childNodes) {
                await typeNode(child, newElement);
            }
            
            // Move cursor back to parent
            const innerCursor = newElement.querySelector('.typing-cursor');
            if (innerCursor) innerCursor.remove();
            targetContainer.insertAdjacentHTML('beforeend', '<span class="typing-cursor">|</span>');
        }
    }
    
    // Type all nodes
    for (const child of tempDiv.childNodes) {
        await typeNode(child, container);
    }
    
    // Remove final cursor after a delay
    setTimeout(() => {
        const cursor = container.querySelector('.typing-cursor');
        if (cursor) cursor.remove();
    }, 500);
}

const allHealthQuestions = [
    { id: 1, text: "สัปดาห์นี้คุณรู้สึกมีความสุขเป็นส่วนใหญ่หรือไม่?", choices: ["ใช่", "บางครั้ง", "ไม่"], scores: [10, 5, 0] },
    { id: 2, text: "สัปดาห์นี้คุณนอนหลับพักผ่อนเพียงพอ (7-8 ชั่วโมงต่อคืน) สม่ำเสมอหรือไม่?", choices: ["ใช่", "บางครั้ง", "ไม่"], scores: [10, 5, 0] },
    { id: 3, text: "สัปดาห์นี้ส่วนใหญ่คุณตื่นมาแล้วรู้สึกสดชื่นหรือไม่?", choices: ["ใช่", "บางครั้ง", "ไม่"], scores: [10, 5, 0] },
    { id: 4, text: "สัปดาห์นี้คุณมีเรื่องเครียดหรือวิตกกังวลมากเกินไปหรือไม่?", choices: ["ไม่", "บางครั้ง", "ใช่"], scores: [10, 5, 0] },
    { id: 5, text: "สัปดาห์นี้คุณสามารถงดเล่นมือถือหรือดูจอก่อนเข้านอนอย่างน้อย 30 นาทีได้เป็นส่วนใหญ่หรือไม่?", choices: ["ใช่", "บางครั้ง", "ไม่"], scores: [10, 5, 0] },
    { id: 6, text: "สัปดาห์นี้คุณกินผักหรือผลไม้เป็นประจำทุกวันหรือไม่?", choices: ["ใช่", "บางครั้ง", "ไม่"], scores: [10, 5, 0] },
    { id: 7, text: "สัปดาห์นี้คุณกินอาหารครบ 3 มื้อในแต่ละวันหรือไม่?", choices: ["ใช่", "บางครั้ง", "ไม่"], scores: [10, 5, 0] },
    { id: 8, text: "สัปดาห์นี้คุณดื่มน้ำเปล่าเพียงพอ (ประมาณ 2 ลิตรต่อวัน) สม่ำเสมอหรือไม่?", choices: ["ใช่", "บางครั้ง", "ไม่"], scores: [10, 5, 0] },
    { id: 9, text: "สัปดาห์นี้คุณทานของหวานหรือเครื่องดื่มที่มีน้ำตาลสูงบ่อยแค่ไหน? (หรือสามารถเลี่ยงได้หรือไม่?)", choices: ["เลี่ยงได้", "บางครั้ง", "บ่อย"], scores: [10, 5, 0] },
    { id: 10, text: "สัปดาห์นี้คุณดื่มเครื่องดื่มแอลกอฮอล์หรือไม่?", choices: ["ไม่ดื่ม", "บางครั้ง", "ดื่มบ่อย"], scores: [10, 5, 0] },
    { id: 11, text: "สัปดาห์นี้คุณมีการเดินหรือใช้บันไดแทนลิฟต์บ้างหรือไม่?", choices: ["ใช่", "บางครั้ง", "ไม่"], scores: [10, 5, 0] },
    { id: 12, text: "สัปดาห์นี้คุณได้ออกกำลังกายติดต่อกันอย่างน้อย 30 นาที (อย่างน้อย 3-5 วัน) หรือไม่?", choices: ["ใช่", "บางครั้ง", "ไม่"], scores: [10, 5, 0] },
    { id: 13, text: "สัปดาห์นี้คุณมีการยืดเหยียดกล้ามเนื้อ (Stretching) ระหว่างสัปดาห์บ้างหรือไม่?", choices: ["ใช่", "บางครั้ง", "ไม่"], scores: [10, 5, 0] },
    { id: 14, text: "สัปดาห์นี้คุณนั่งทำงานติดต่อกันนานเกิน 2 ชั่วโมงโดยไม่ลุกเดินบ่อยหรือไม่?", choices: ["ไม่บ่อย", "บางครั้ง", "บ่อย"], scores: [10, 5, 0] },
    { id: 15, text: "สัปดาห์นี้คุณได้รับแสงแดดอ่อนๆ หรือได้ออกไปสูดอากาศข้างนอกบ้างหรือไม่?", choices: ["ใช่", "บางครั้ง", "ไม่"], scores: [10, 5, 0] },
    { id: 16, text: "สัปดาห์นี้คุณสูบบุหรี่หรือไม่?", choices: ["ไม่สูบ", "บางครั้ง", "สูบ"], scores: [10, 5, 0] },
    { id: 17, text: "สัปดาห์นี้ระบบขับถ่ายของคุณเป็นปกติสม่ำเสมอหรือไม่?", choices: ["ใช่", "บางครั้ง", "ไม่"], scores: [10, 5, 0] },
    { id: 18, text: "สัปดาห์นี้คุณมีการพักสายตาจากหน้าจอระหว่างวันสม่ำเสมอหรือไม่?", choices: ["ใช่", "บางครั้ง", "ไม่"], scores: [10, 5, 0] },
    { id: 19, text: "สัปดาห์นี้คุณทานยาหรือวิตามินตามที่กำหนดครบถ้วนหรือไม่?", choices: ["ใช่", "บางครั้ง", "ไม่"], scores: [10, 5, 0] },
    { id: 20, text: "สัปดาห์นี้คุณได้พูดคุยหรือทำกิจกรรมร่วมกับคนในครอบครัวหรือเพื่อนบ้างหรือไม่?", choices: ["ใช่", "บางครั้ง", "ไม่"], scores: [10, 5, 0] }
];

const moodColors = { blue: '#60A5FA', green: '#34D399', yellow: '#FBBF24', orange: '#FB923C', red: '#F87171' };
const monthNames = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
                   'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];

async function checkAuth() {
    try {
        // Check for incomplete questions first
        const savedQuestion = localStorage.getItem('currentQuestion');
        const savedAnswers = localStorage.getItem('questionAnswers');
        const registerData = localStorage.getItem('registerData');
        
        if (savedQuestion && savedAnswers && registerData) {
            const currentQ = parseInt(savedQuestion);
            if (currentQ > 0 && currentQ < 20) {
                Swal.fire({
                    icon: 'question',
                    title: 'คุณมีแบบสอบถามค้างอยู่',
                    text: `คุณทำแบบสอบถามไปแล้ว ${currentQ} ข้อจาก 20 ข้อ`,
                    showCancelButton: true,
                    confirmButtonText: 'ทำต่อ',
                    cancelButtonText: 'เริ่มใหม่',
                    confirmButtonColor: '#2572a2',
                    cancelButtonColor: '#d33'
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = 'questions.html';
                    } else {
                        localStorage.removeItem('currentQuestion');
                        localStorage.removeItem('questionAnswers');
                        localStorage.removeItem('registerData');
                    }
                });
                return;
            }
        }
        
        // Check for test account session
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            try {
                const user = JSON.parse(savedUser);
                if (user.id === 'test-user-id') {
                    currentUser = user;
                    isGuestMode = false;
                    
                    // Initialize test user data in localStorage if not exists
                    const testUserData = localStorage.getItem('test_user_data');
                    if (!testUserData) {
                        const initialData = {
                            id: 'test-user-id',
                            email: 'test@test.com',
                            username: 'test',
                            name: 'Test User',
                            health_score: 100,
                            mood_entries: [],
                            weekly_checks: [],
                            created_at: new Date().toISOString()
                        };
                        localStorage.setItem('test_user_data', JSON.stringify(initialData));
                    }
                    
                    showMainApp();
                    return;
                }
            } catch (e) {
                localStorage.removeItem('currentUser');
            }
        }
        
        // Check for guest mode first
        const guestMode = localStorage.getItem('guestMode');
        const guestData = localStorage.getItem(GUEST_STORAGE_KEY);
        
        if (guestMode === 'true' && guestData) {
            const guest = JSON.parse(guestData);
            currentUser = {
                id: guest.id,
                email: null,
                isGuest: true
            };
            isGuestMode = true;
            showMainApp();
            return;
        }
        
        const supabase = getSupabase();
        
        // console.log('supabase:', supabase);
        // console.log('supabase.auth:', supabase ? supabase.auth : 'no client');
        
        if (!supabase || !supabase.auth) {
            console.error('Supabase not initialized properly');
            document.getElementById('landingPage').style.display = 'flex';
            return;
        }

        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            console.error('Auth error:', error);
            // Clear invalid session data
            if (error.message && error.message.includes('Refresh Token')) {
                await supabase.auth.signOut();
                localStorage.clear();
            }
            document.getElementById('landingPage').style.display = 'flex';
            return;
        }

        if (session) {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) {
                await supabase.auth.signOut();
                document.getElementById('landingPage').style.display = 'flex';
                return;
            }
            currentUser = user;
            isGuestMode = false;
            localStorage.removeItem('guestMode');
            localStorage.removeItem(GUEST_STORAGE_KEY);
            showMainApp();
        } else {
            document.getElementById('landingPage').style.display = 'flex';
        }
    } catch (error) {
        console.error('Failed to check auth:', error);
        document.getElementById('landingPage').style.display = 'flex';
    }
}

function showLogin() {
    window.location.href = 'login.html';
}

function showRegister() {
    window.location.href = 'register.html';
}

function loginAsGuest() {
    const guestId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const guestData = {
        id: guestId,
        nickname: 'ผู้ใช้ชั่วคราว',
        health_score: 100,
        created_at: new Date().toISOString,
        mood_entries: [],
        daily_checks: []
    };

    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guestData));

    currentUser = {
        id: guestId,
        email: null,
        isGuest: true
    };
    isGuestMode = true;
    isDevMode = false;
    
    // Remove dev badge if exists (from previous dev login)
    const devBadge = document.querySelector('.dev-badge');
    if (devBadge) devBadge.remove();
    const devSkipContainer = document.querySelector('.dev-skip-container');
    if (devSkipContainer) devSkipContainer.remove();
    const devEditBtn = document.querySelector('.dev-edit-score-btn');
    if (devEditBtn) devEditBtn.remove();

    Modal.toast("เข้าสู้ระบบแบบชั่วคราวสำเร็จ", "success");
    showMainApp();
}

function logout() {
    // Only sign out if user is logged in with Supabase (not guest mode)
    const supabase = getSupabase();
    
    // Check if this is test user
    const isTestUser = currentUser && currentUser.id === 'test-user-id';
    
    if (!isGuestMode && !isTestUser && supabase && supabase.auth) {
        try {
            supabase.auth.signOut().catch(err => console.log('Sign out error:', err));
        } catch (error) {
            console.log('Sign out error:', error);
        }
    }
    
    currentUser = null;
    isDevMode = false;
    isGuestMode = false;
    
    // Clear localStorage
    localStorage.removeItem('guestMode');
    localStorage.removeItem('currentUser');
    
    // Remove dev badge if exists
    const devBadge = document.querySelector('.dev-badge');
    if (devBadge) devBadge.remove();
    
    // Remove dev skip button if exists
    const devSkipContainer = document.querySelector('.dev-skip-container');
    if (devSkipContainer) devSkipContainer.remove();
    
    // Remove dev edit score button if exists
    const devEditBtn = document.querySelector('.dev-edit-score-btn');
    if (devEditBtn) devEditBtn.remove();
    
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('landingPage').style.display = 'flex';
    resetForm();
    
    // Reload page to ensure clean state
    setTimeout(() => {
        location.reload();
    }, 100);
}

// Save weekly check data from weekly-check.html
async function saveWeeklyCheckData(data) {
    const { answers, healthScore, healthStatus } = data;
    const weekKey = getWeekKey();
    
    // Determine mood based on score
    let mood, moodName;
    if (healthScore >= 80) { mood = 'blue'; moodName = 'สุขมาก'; }
    else if (healthScore >= 60) { mood = 'green'; moodName = 'ดี'; }
    else if (healthScore >= 40) { mood = 'yellow'; moodName = 'ปกติ'; }
    else if (healthScore >= 20) { mood = 'orange'; moodName = 'เหนื่อย'; }
    else { mood = 'red'; moodName = 'เครียด'; }
    
    const weeklyCheckData = {
        user_id: currentUser.id,
        week_key: weekKey,
        answers: answers,
        health_score: healthScore,
        mood: mood,
        mood_name: moodName,
        completed_at: new Date().toISOString()
    };
    
    if (isTestUser()) {
        // Save to test user data
        const testData = getTestUserData() || {};
        if (!testData.weekly_checks) testData.weekly_checks = [];
        if (!testData.mood_entries) testData.mood_entries = [];
        
        // Remove existing entry for this week if any
        testData.weekly_checks = testData.weekly_checks.filter(check => check.week_key !== weekKey);
        testData.weekly_checks.push(weeklyCheckData);
        testData.health_score = healthScore;
        
        // Also save to mood_entries for calendar (use Monday of the week)
        const weekStart = getWeekStart();
        const dateKey = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`;
        
        // Remove existing entry for this date if any
        testData.mood_entries = testData.mood_entries.filter(entry => entry.date !== dateKey);
        testData.mood_entries.push({
            date: dateKey,
            mood: mood,
            mood_name: moodName,
            note: `คะแนนสุขภาพประจำสัปดาห์: ${healthScore}`
        });
        
        saveTestUserData(testData);
    } else if (isGuestMode) {
        const guestData = JSON.parse(localStorage.getItem(GUEST_STORAGE_KEY) || '{}');
        if (!guestData.weekly_checks) guestData.weekly_checks = [];
        if (!guestData.mood_entries) guestData.mood_entries = [];
        
        // Remove existing entry for this week if any
        guestData.weekly_checks = guestData.weekly_checks.filter(check => check.week_key !== weekKey);
        guestData.weekly_checks.push(weeklyCheckData);
        guestData.health_score = healthScore;
        
        // Also save to mood_entries for calendar (use Monday of the week)
        const weekStart = getWeekStart();
        const dateKey = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`;
        
        // Remove existing entry for this date if any
        guestData.mood_entries = guestData.mood_entries.filter(entry => entry.date !== dateKey);
        guestData.mood_entries.push({
            date: dateKey,
            mood: mood,
            mood_name: moodName,
            note: `คะแนนสุขภาพประจำสัปดาห์: ${healthScore}`
        });
        
        localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guestData));
    } else {
        // Save to weekly_checks table
        const supabase = getSupabase();
        await supabase.from('weekly_checks').upsert(weeklyCheckData, { onConflict: 'user_id,week_key' });
        
        // Update user's health score
        await supabase.from('users').update({ health_score: healthScore }).eq('id', currentUser.id);
        
        // Also save to mood_entries for calendar (use Monday of the week)
        const weekStart = getWeekStart();
        const dateKey = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`;
        
        await supabase.from('mood_entries').upsert({
            user_id: currentUser.id,
            date: dateKey,
            mood: mood,
            mood_name: moodName,
            note: `คะแนนสุขภาพประจำสัปดาห์: ${healthScore}`
        }, { onConflict: 'user_id,date' });
    }
    
    // Mark this week as completed
    thisWeekCompleted = true;
}

function showMainApp() {
    document.getElementById('landingPage').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    
    console.log('showMainApp called - isGuestMode:', isGuestMode);
    console.log('currentUser:', currentUser);
    
    // Show/hide guest mode UI elements
    const guestBadge = document.getElementById('guestBadge');
    const guestActions = document.getElementById('guestActions');
    const logoutBtn = document.getElementById('logoutBtn');
    
    console.log('Elements found:', {
        guestBadge: !!guestBadge,
        guestActions: !!guestActions,
        logoutBtn: !!logoutBtn
    });
    
    if (isGuestMode) {
        if (guestBadge) guestBadge.style.cssText = 'display: inline-flex !important';
        if (guestActions) guestActions.style.cssText = 'display: flex !important; gap: 10px';
        if (logoutBtn) logoutBtn.style.cssText = 'display: none !important';
        console.log('Guest mode UI shown');
    } else {
        if (guestBadge) guestBadge.style.cssText = 'display: none !important';
        if (guestActions) guestActions.style.cssText = 'display: none !important';
        if (logoutBtn) logoutBtn.style.cssText = 'display: inline-block !important';
        console.log('Logged-in user UI shown');
    }
    
    // Check if user is Dev
    isDevMode = DEV_EMAILS.includes(currentUser.email);
    if (isDevMode) {
        addDevBadge();
        // Clear all AI caches for Dev to always get fresh data
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('ai_questions_') || key.startsWith('ai_summary_')) {
                localStorage.removeItem(key);
            }
        });
    }
    
    updateTodayDate();
    
    // Check and save weekly check data if exists
    const weeklyCheckData = localStorage.getItem('weeklyCheckData');
    if (weeklyCheckData) {
        saveWeeklyCheckData(JSON.parse(weeklyCheckData));
        localStorage.removeItem('weeklyCheckData');
    }
    
    // Load health score first for instant color display
    loadHealthScoreInstant();
    
    loadProfile();
    checkThisWeekCompletion();
    
    // Check if we should show health result and switch to stats tab
    const showHealthResult = localStorage.getItem('showHealthResult');
    
    // Setup tab event listeners AFTER checking showHealthResult
    setupTabListeners();
    
    if (showHealthResult === 'true') {
        localStorage.removeItem('showHealthResult');
        currentTabIndex = 2;
        const tabButtons = document.querySelectorAll('.tab');
        tabButtons.forEach((tab, i) => {
            if (i === 2) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        
        // Hide all tabs
        const allTabIds = ['recordTab', 'calendarTab', 'statsTab', 'historyTab'];
        allTabIds.forEach((tabId) => {
            const element = document.getElementById(tabId);
            if (element) {
                element.classList.remove('active');
                element.style.display = 'none';
            }
        });
        
        // Show stats tab
        const statsTab = document.getElementById('statsTab');
        if (statsTab) {
            statsTab.style.display = 'block';
            statsTab.classList.add('active');
        }
        
        // Load stats
        loadStats();
        
        console.log('Stats tab should be visible now');
        
        // Show health result modal after tab switch
        setTimeout(() => {
            showHealthResultModal();
        }, 500);
    } else {
        // Force reset to first tab
        currentTabIndex = 0;
        switchTab('record');
    }
}

// Load health score instantly without waiting for other data
async function loadHealthScoreInstant() {
    if (isGuestMode) {
        const guestData = JSON.parse(localStorage.getItem(GUEST_STORAGE_KEY) || '{}');
        const healthScore = guestData.health_score ?? 100;
        
        // Update UI immediately
        document.getElementById('healthScore').textContent = healthScore;
        document.getElementById('aboutHealthScore').textContent = healthScore;
        updateHealthLevelCard(healthScore);
        
        // Then load full stats in background
        loadStats();
        return;
    }
    
    const supabase = getSupabase();
    const { data: userData } = await supabase
        .from('users')
        .select('health_score')
        .eq('id', currentUser.id)
        .single();
    
    const healthScore = userData?.health_score ?? 100;
    
    // Update UI immediately
    document.getElementById('healthScore').textContent = healthScore;
    document.getElementById('aboutHealthScore').textContent = healthScore;
    updateHealthLevelCard(healthScore);
    
    // Then load full stats in background
    loadStats();
}

async function loadProfile() {
    let displayName = 'ผู้ใช้';
    
    if (isTestUser()) {
        // Load from test user data
        const testData = getTestUserData() || {};
        displayName = testData.name || testData.username || 'Test User';
    } else if (isGuestMode) {
        const guestData = JSON.parse(localStorage.getItem(GUEST_STORAGE_KEY) || '{}');
        displayName = guestData.nickname || 'ผู้ใช้ชั่วคราว';
        if (!guestData.nickname) {
            guestData.nickname = 'ผู้ใช้ชั่วคราว';
            localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guestData));
        }
    } else {
        const supabase = getSupabase();
        const { data: userData } = await supabase
            .from('users')
            .select('nickname, username')
            .eq('id', currentUser.id)
            .single();
        displayName = userData?.nickname || userData?.username || currentUser.email?.split('@')[0] || 'ผู้ใช้';
    }
    
    document.getElementById('currentUser').textContent = displayName;
}

function updateTodayDate() {
    const today = getCurrentDate();
    
    // คำนวณวันจันทร์และวันอาทิตย์ของสัปดาห์นี้
    const currentDay = today.getDay(); // 0 = อาทิตย์, 1 = จันทร์, ..., 6 = เสาร์
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; // ถ้าเป็นวันอาทิตย์ให้ย้อนกลับ 6 วัน
    const sundayOffset = currentDay === 0 ? 0 : 7 - currentDay; // ถ้าเป็นวันอาทิตย์ก็คือวันนี้
    
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    
    const sunday = new Date(today);
    sunday.setDate(today.getDate() + sundayOffset);
    
    // Format: "3 - 9 กุมภาพันธ์ 2569" หรือ "28 มกราคม - 3 กุมภาพันธ์ 2569"
    const mondayDate = monday.getDate();
    const sundayDate = sunday.getDate();
    const mondayMonth = monday.getMonth();
    const sundayMonth = sunday.getMonth();
    const sundayYear = sunday.getFullYear() + 543;
    
    let weekRangeText;
    if (mondayMonth === sundayMonth) {
        // เดือนเดียวกัน
        weekRangeText = `${mondayDate} - ${sundayDate} ${monthNames[sundayMonth]} ${sundayYear}`;
    } else {
        // คนละเดือน
        weekRangeText = `${mondayDate} ${monthNames[mondayMonth]} - ${sundayDate} ${monthNames[sundayMonth]} ${sundayYear}`;
    }
    
    const weekRangeElement = document.getElementById('weekRange');
    if (weekRangeElement) {
        weekRangeElement.textContent = weekRangeText;
    }
}

function selectMood(color, name) {
    document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('active'));
    event.target.closest('.mood-btn').classList.add('active');
    selectedMood = color;
    selectedMoodName = name;
}

function previewImage() {
    const file = document.getElementById('imageUpload').files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imageData = e.target.result;
            document.getElementById('imagePreview').innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    }
}

async function saveEntry() {
    if (!selectedMood) {
        Modal.show({ type: 'warning', title: 'กรุณาเลือกอารมณ์', message: 'กรุณาเลือกอารมณ์ของคุณก่อนบันทึก' });
        return;
    }

    const today = getCurrentDate();
    const dateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const entry = {
        user_id: currentUser.id,
        date: dateKey,
        mood: selectedMood,
        mood_name: selectedMoodName,
        smoking: document.getElementById('smokingCheck').checked,
        drinking: document.getElementById('drinkingCheck').checked,
        note: document.getElementById('noteText').value,
        image: imageData
    };

    if (isGuestMode) {
        const guestData = JSON.parse(localStorage.getItem(GUEST_STORAGE_KEY) || '{}');
        if (!guestData.mood_entries) guestData.mood_entries = [];
        const existingIndex = guestData.mood_entries.findIndex(e => e.date === dateKey);
        if (existingIndex >= 0) {
            guestData.mood_entries[existingIndex] = entry;
        } else {
            guestData.mood_entries.push(entry);
        }
        localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guestData));
    } else {
        const supabase = getSupabase();
        const { error } = await supabase.from('mood_entries').upsert(entry, { onConflict: 'user_id,date' });
        
        if (error) {
            Modal.show({ type: 'error', title: 'เกิดข้อผิดพลาด', message: error.message });
            return;
        }
    }

    Modal.toast('บันทึกอารมณ์เรียบร้อยแล้ว', 'success');
    resetForm();
    loadCalendar();
    loadStats();
    loadHistory();
}

function resetForm() {
    selectedMood = null;
    selectedMoodName = '';
    document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('active'));
    
    const smokingCheck = document.getElementById('smokingCheck');
    const drinkingCheck = document.getElementById('drinkingCheck');
    const noteText = document.getElementById('noteText');
    const imageUpload = document.getElementById('imageUpload');
    const imagePreview = document.getElementById('imagePreview');
    
    if (smokingCheck) smokingCheck.checked = false;
    if (drinkingCheck) drinkingCheck.checked = false;
    if (noteText) noteText.value = '';
    if (imageUpload) imageUpload.value = '';
    if (imagePreview) imagePreview.innerHTML = '';
    imageData = null;
}

// Tab switching with sliding animation
let currentTabIndex = 0;
const tabNames = ['record', 'calendar', 'stats', 'history'];

function setupTabListeners() {
    const tabs = document.querySelectorAll('.tab');
    const tabNames = ['record', 'calendar', 'stats', 'history'];
    
    tabs.forEach((tab, index) => {
        // Remove existing listeners
        tab.removeEventListener('click', handleTabClick);
        
        // Add new listener
        tab.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            
            const tabName = tabNames[index];
            switchTab(tabName);
            
            return false;
        });
    });
}

function handleTabClick(event) {
    // This is just a placeholder for removeEventListener
}

function switchTab(tabName) {
    const newIndex = tabNames.indexOf(tabName);
    if (newIndex === -1) return;
    
    const oldIndex = currentTabIndex;
    if (oldIndex === newIndex) return;
    
    currentTabIndex = newIndex;
    
    // Update tab buttons
    const tabButtons = document.querySelectorAll('.tab');
    tabButtons.forEach((tab, i) => {
        tab.classList.toggle('active', i === newIndex);
    });
    
    // Hide all tabs
    const allTabIds = ['recordTab', 'calendarTab', 'statsTab', 'historyTab'];
    allTabIds.forEach((tabId) => {
        const element = document.getElementById(tabId);
        if (element) {
            element.classList.remove('active');
            element.style.display = 'none';
        }
    });
    
    // Show selected tab
    const activeTabId = allTabIds[newIndex];
    const activeElement = document.getElementById(activeTabId);
    if (activeElement) {
        activeElement.style.display = 'block';
        activeElement.classList.add('active');
    }
    
    // Load content
    if (tabName === 'calendar') {
        loadCalendar();
    } else if (tabName === 'stats') {
        loadStats();
    } else if (tabName === 'history') {
        loadHistory();
    }
}

async function loadCalendar() {
    try {
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        
        // Get today's date for highlighting
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Get user registration date and weekly checks
        let userCreatedDate = null;
        let weeklyChecks = [];
        
        if (isGuestMode) {
            const guestData = JSON.parse(localStorage.getItem(GUEST_STORAGE_KEY) || '{}');
            userCreatedDate = guestData.created_at ? new Date(guestData.created_at) : new Date();
            weeklyChecks = guestData.weekly_checks || [];
        } else {
            try {
                const supabase = getSupabase();
                const { data: userData } = await supabase
                    .from('users')
                    .select('created_at')
                    .eq('id', currentUser.id)
                    .single();
                
                userCreatedDate = userData?.created_at ? new Date(userData.created_at) : new Date();
                
                // Try to get weekly checks data
                const { data: weeklyChecksData } = await supabase
                    .from('weekly_checks')
                    .select('week_key, health_score, completed_at')
                    .eq('user_id', currentUser.id);
                
                weeklyChecks = weeklyChecksData || [];
            } catch (error) {
                userCreatedDate = new Date();
                weeklyChecks = [];
            }
        }
        
        if (userCreatedDate) userCreatedDate.setHours(0, 0, 0, 0);
        
        // Update calendar header
        document.getElementById('calendarMonth').textContent = `${monthNames[currentMonth]} ${currentYear + 543}`;
        const grid = document.getElementById('calendarGrid');
        if (!grid) {
            return;
        }
        
        grid.innerHTML = '';
        
        // Create simple day-based calendar for now
        const daysInMonth = lastDay.getDate();
        const firstDayOfWeek = firstDay.getDay();
        
        // Add empty cells for days before month starts
        for (let i = 0; i < firstDayOfWeek; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            emptyDay.style.cssText = 'opacity: 0.3; background: #f9fafb;';
            grid.appendChild(emptyDay);
        }
        
        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayDate = new Date(currentYear, currentMonth, day);
            const dayDiv = document.createElement('div');
            dayDiv.className = 'calendar-day';
            
            // Check if today
            const isToday = dayDate.toDateString() === today.toDateString();
            if (isToday) {
                dayDiv.classList.add('today');
            }
            
            // Day number
            const dayNum = document.createElement('div');
            dayNum.className = 'day-number';
            dayNum.textContent = day;
            dayDiv.appendChild(dayNum);
            
            // Check if this day has any weekly check data
            const hasData = weeklyChecks.some(check => {
                const checkDate = new Date(check.completed_at);
                return checkDate.getDate() === day && 
                       checkDate.getMonth() === currentMonth && 
                       checkDate.getFullYear() === currentYear;
            });
            
            if (hasData) {
                dayDiv.classList.add('has-entry');
                const badge = document.createElement('div');
                badge.className = 'entry-badge';
                badge.textContent = '✓';
                badge.style.cssText = `
                    position: absolute;
                    bottom: 2px;
                    right: 2px;
                    background: #22c55e;
                    color: white;
                    border-radius: 50%;
                    width: 16px;
                    height: 16px;
                    font-size: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                `;
                dayDiv.appendChild(badge);
                
                // Add click event to show AI recommendation
                dayDiv.style.cursor = 'pointer';
                dayDiv.onclick = () => showAIRecommendation(dayDate, weeklyChecks);
            }
            
            grid.appendChild(dayDiv);
        }
        
    } catch (error) {
        // Fallback: Show basic calendar
        document.getElementById('calendarMonth').textContent = `${monthNames[currentMonth]} ${currentYear + 543}`;
        const grid = document.getElementById('calendarGrid');
        if (grid) {
            grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 20px; color: #6b7280;">ปฏิทินพร้อมใช้งาน</div>';
        }
    }
}

// Show message for missed days
function showMissedDayMessage(dateKey) {
    const dateParts = dateKey.split('-');
    const displayDate = `${parseInt(dateParts[2])} ${monthNames[parseInt(dateParts[1]) - 1]} ${parseInt(dateParts[0]) + 543}`;
    
    Modal.show({
        type: 'warning',
        title: `${displayDate}`,
        message: 'คุณไม่ได้ทำแบบประเมินสุขภาพ',
        html: `
            <div style="text-align: center; margin-top: 10px;">
                <p style="color: #6b7280; font-size: 13px;">พยายามทำแบบประเมินทุกวันเพื่อติดตามสุขภาพของคุณ</p>
            </div>
        `,
        width: '350px'
    });
}

// Show message for today (not completed yet)
function showTodayNotCompletedMessage() {
    Modal.show({
        type: 'info',
        title: 'สัปดาห์นี้',
        message: 'คุณยังไม่ได้ทำแบบประเมินสุขภาพสัปดาห์นี้',
        html: `
            <div style="text-align: center; margin-top: 10px;">
                <p style="color: #6b7280; font-size: 13px;">กดปุ่ม "เริ่ม!" เพื่อทำแบบประเมินสุขภาพประจำวันได้เลย</p>
            </div>
        `,
        width: '350px'
    });
}

// Show message for future days
function showFutureDayMessage(dateKey) {
    const dateParts = dateKey.split('-');
    const displayDate = `${parseInt(dateParts[2])} ${monthNames[parseInt(dateParts[1]) - 1]} ${parseInt(dateParts[0]) + 543}`;
    
    Modal.show({
        type: 'info',
        title: `${displayDate}`,
        message: 'สัปดาห์นี้ยังมาไม่ถึง',
        html: `
            <div style="text-align: center; margin-top: 10px;">
                <p style="color: #6b7280; font-size: 13px;">กลับมาทำแบบประเมินสุขภาพในวันนั้นนะ!</p>
            </div>
        `,
        width: '350px'
    });
}

async function showWeekDetails(weekKey, weekData) {
    const weekStart = weekData.weekStart;
    const weekEnd = weekData.weekEnd;
    const healthScore = weekData.health_score;
    
    const formatDate = (date) => {
        return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear() + 543}`;
    };
    
    const displayPeriod = `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;
    
    Modal.show({
        type: '',
        title: `รายสัปดาห์: ${displayPeriod}`,
        html: `
            <div style="text-align: center;">
                <div style="display: inline-block; padding: 8px 20px; border-radius: 20px; background: ${getHealthColor(healthScore)}; color: white; font-weight: 600; font-size: 16px; margin-bottom: 15px;">
                    คะแนนสุขภาพ: ${healthScore} คะแนน
                </div>
                <div style="background: #f9fafb; padding: 15px; border-radius: 8px; text-align: left; margin-top: 10px;">
                    <h4 style="margin-bottom: 10px; color: #374151;">📊 ข้อมูลสัปดาห์นี้</h4>
                    <p style="font-size: 13px; color: #6b7280; margin: 5px 0;">
                        <strong>วันที่ทำ:</strong> ${new Date(weekData.completed_at).toLocaleDateString('th-TH')}
                    </p>
                    <p style="font-size: 13px; color: #6b7280; margin: 5px 0;">
                        <strong>สถานะ:</strong> ${healthScore >= 80 ? 'สุขภาพดีมาก' : healthScore >= 60 ? 'สุขภาพดี' : healthScore >= 40 ? 'สุขภาพปานกลาง' : 'สุขภาพต้องการการดูแล'}
                    </p>
                </div>
            </div>
        `,
        width: '450px'
    });
}

function getHealthColor(score) {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#eab308';
    if (score >= 40) return '#f97316';
    return '#ef4444';
}

function previousMonth() {
    currentMonth--;
    if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    loadCalendar();
}

function nextMonth() {
    currentMonth++;
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    loadCalendar();
}

async function loadStats() {
    let entries = [];
    let healthScore = 100;
    
    if (isTestUser()) {
        // Load from test user data
        const testData = getTestUserData() || {};
        entries = testData.mood_entries || [];
        healthScore = testData.health_score || 100;
    } else if (isGuestMode) {
        const guestData = JSON.parse(localStorage.getItem(GUEST_STORAGE_KEY) || '{}');
        entries = guestData.mood_entries || [];
        healthScore = guestData.health_score || 100;
    } else {
        const supabase = getSupabase();
        const { data: entriesData } = await supabase
            .from('mood_entries')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('date', { ascending: true });
        
        entries = entriesData || [];

        // Get health score from users table
        const { data: userData } = await supabase
            .from('users')
            .select('health_score')
            .eq('id', currentUser.id)
            .single();
        
        if (userData && userData.health_score !== null) {
            healthScore = userData.health_score;
        }
    }

    document.getElementById('totalEntries').textContent = entries.length;
    document.getElementById('healthScore').textContent = healthScore;
    
    // Update health level card
    updateHealthLevelCard(healthScore);
    
    // Add Dev edit button for health score
    // TODO: Implement addDevHealthScoreButton function
    // if (isDevMode) {
    //     addDevHealthScoreButton();
    // }

    // Get recent entries
    const recent7 = entries ? entries.slice(-7) : [];
    const recent30 = entries ? entries.slice(-30) : [];
    
    const moodValues = { blue: 50, green: 40, yellow: 30, orange: 20, red: 10 };

    // Create 30-day Bar Chart
    if (window.healthRadarChartInstance) window.healthRadarChartInstance.destroy();
    const ctx30 = document.getElementById('healthRadarChart');
    if (ctx30) {
        window.healthRadarChartInstance = new Chart(ctx30, {
            type: 'bar',
            data: {
                labels: recent30.map(e => e.date.split('-')[2] + '/' + e.date.split('-')[1]),
                datasets: [
                    {
                        label: 'คะแนนสุขภาพ',
                        data: recent30.map(e => moodValues[e.mood] || 0),
                        backgroundColor: recent30.map(e => {
                            const colors = {
                                'red': '#ef4444',
                                'orange': '#f97316',
                                'yellow': '#eab308',
                                'green': '#22c55e',
                                'blue': '#60a5fa'
                            };
                            return colors[e.mood] || '#9ca3af';
                        }),
                        borderColor: recent30.map(e => {
                            const colors = {
                                'red': '#dc2626',
                                'orange': '#ea580c',
                                'yellow': '#ca8a04',
                                'green': '#16a34a',
                                'blue': '#3b82f6'
                            };
                            return colors[e.mood] || '#6b7280';
                        }),
                        borderWidth: 2,
                        borderRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 60,
                        ticks: {
                            stepSize: 10,
                            font: {
                                family: 'Mitr',
                                size: 12
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        ticks: {
                            font: {
                                family: 'Mitr',
                                size: 10
                            },
                            maxRotation: 90,
                            minRotation: 90
                        },
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const moodNames = {
                                    50: 'สุขมาก',
                                    40: 'ดี',
                                    30: 'ปกติ',
                                    20: 'เหนื่อย',
                                    10: 'เครียด'
                                };
                                return `${moodNames[context.parsed.y] || 'ไม่ระบุ'}: ${context.parsed.y} คะแนน`;
                            }
                        },
                        titleFont: {
                            family: 'Mitr'
                        },
                        bodyFont: {
                            family: 'Mitr'
                        }
                    }
                }
            }
        });
    }
    
    // Load question review
    loadQuestionReview();
}

function loadQuestionReview() {
    const questionData = JSON.parse(localStorage.getItem('questionData') || '{}');
    const reviewCard = document.getElementById('questionReviewCard');
    const reviewList = document.getElementById('questionReviewList');
    
    if (!questionData.answers || Object.keys(questionData.answers).length === 0) {
        reviewCard.style.display = 'none';
        return;
    }
    
    reviewCard.style.display = 'block';
    reviewList.innerHTML = '';
    
    // Get all questions from app.js
    const questionMeanings = allHealthQuestions;
    
    // Sort answers by question ID
    const sortedAnswers = Object.entries(questionData.answers).sort((a, b) => {
        const idA = parseInt(a[0].replace('q', ''));
        const idB = parseInt(b[0].replace('q', ''));
        return idA - idB;
    });
    
    sortedAnswers.forEach(([key, score], index) => {
        const questionId = parseInt(key.replace('q', ''));
        const question = questionMeanings.find(q => q.id === questionId);
        
        if (!question) return;
        
        // Find which choice was selected based on score
        let selectedChoiceIndex = question.scores.indexOf(score);
        if (selectedChoiceIndex === -1) selectedChoiceIndex = 0;
        
        const questionItem = document.createElement('div');
        questionItem.className = 'question-review-item expanded';
        questionItem.innerHTML = `
            <div class="question-review-header">
                <div class="question-number">${index + 1}</div>
                <div class="question-text">${question.text}</div>
            </div>
            <div class="question-choices">
                ${question.choices.map((choice, i) => `
                    <div class="choice-option ${i === selectedChoiceIndex ? 'selected' : ''}">
                        <div class="choice-circle"></div>
                        <div class="choice-label">${choice}</div>
                    </div>
                `).join('')}
            </div>
        `;
        
        reviewList.appendChild(questionItem);
    });
}

function calculateWeekData(entries, weekIndex) {
    // Split entries into weeks
    const weekSize = weekIndex < 2 ? 7 : 16; // Week 1, 2 = 7 days each, Week 3-4 = 16 days
    const startIndex = weekIndex === 0 ? 0 : (weekIndex === 1 ? 7 : 14);
    const endIndex = weekIndex === 0 ? 7 : (weekIndex === 1 ? 14 : 30);
    
    const weekEntries = entries.slice(startIndex, endIndex);
    
    const counts = { blue: 0, green: 0, yellow: 0, orange: 0, red: 0 };
    weekEntries.forEach(e => {
        if (counts.hasOwnProperty(e.mood)) {
            counts[e.mood]++;
        }
    });
    
    return [counts.blue, counts.green, counts.yellow, counts.orange, counts.red];
}

function updateHealthLevelCard(score) {
    const card = document.getElementById('healthLevelCard');
    const text = document.getElementById('healthLevelText');
    
    // Remove all color classes
    card.classList.remove('stat-card-green', 'stat-card-yellow', 'stat-card-orange', 'stat-card-red', 'stat-card-gray');
    
    if (score === null || score === undefined) {
        card.classList.add('stat-card-gray');
        text.textContent = 'ไม่มีข้อมูล';
    } else if (score >= 80) {
        card.classList.add('stat-card-green');
        text.textContent = 'สุขภาพดีมาก';
    } else if (score >= 60) {
        card.classList.add('stat-card-yellow');
        text.textContent = 'สุขภาพปานกลาง';
    } else if (score >= 40) {
        card.classList.add('stat-card-orange');
        text.textContent = 'สุขภาพเริ่มเสี่ยง';
    } else {
        card.classList.add('stat-card-red');
        text.textContent = 'สุขภาพไม่ดี';
    }
}

async function showHealthResultModal() {
    // Get data from localStorage (could be from questions.js or weekly-check.js)
    const guestData = JSON.parse(localStorage.getItem(GUEST_STORAGE_KEY) || '{}');
    const questionData = JSON.parse(localStorage.getItem('questionData') || '{}');
    
    // Use health score from guest data (updated by saveWeeklyCheckData)
    const healthScore = guestData.health_score ?? 100;
    
    // Get answers from questionData for AI recommendations
    const answers = questionData.answers || {};
    
    let healthLevel = '';
    let healthColor = '';
    let healthMessage = '';
    let healthIcon = '';
    
    if (healthScore >= 80) {
        healthLevel = 'สุขภาพดีมาก';
        healthColor = '#22c55e';
        healthIcon = '🎉';
        healthMessage = 'ยอดเยี่ยม! คุณมีสุขภาพที่ดีมาก<br>รักษาพฤติกรรมที่ดีนี้ต่อไปนะ';
    } else if (healthScore >= 60) {
        healthLevel = 'สุขภาพปานกลาง';
        healthColor = '#eab308';
        healthIcon = '😊';
        healthMessage = 'ดีแล้ว! แต่ยังมีจุดที่ควรปรับปรุง<br>พยายามดูแลสุขภาพให้ดีขึ้นนะ';
    } else if (healthScore >= 40) {
        healthLevel = 'สุขภาพเริ่มเสี่ยง';
        healthColor = '#f97316';
        healthIcon = '😟';
        healthMessage = 'ควรระวัง! สุขภาพของคุณเริ่มเสี่ยง<br>ควรปรับเปลี่ยนพฤติกรรมโดยเร็ว';
    } else {
        healthLevel = 'สุขภาพไม่ดี';
        healthColor = '#ef4444';
        healthIcon = '😰';
        healthMessage = 'ต้องระวัง! สุขภาพของคุณไม่ดี<br>ควรดูแลตัวเองอย่างจริงจัง';
    }
    
    // Show initial modal
    Modal.show({
        type: 'success',
        title: `ผลการประเมินสุขภาพ ${healthIcon}`,
        html: `
            <div style="margin: 20px 0;">
                <div style="font-size: 48px; font-weight: 700; color: ${healthColor}; margin-bottom: 10px;">
                    ${healthScore}
                </div>
                <div style="font-size: 20px; font-weight: 600; color: ${healthColor}; margin-bottom: 15px;">
                    ${healthLevel}
                </div>
                <div style="font-size: 16px; color: #2572a2; line-height: 1.6; margin-bottom: 20px;">
                    ${healthMessage}
                </div>
                <div id="aiRecommendations" style="text-align: left; font-size: 14px; color: #2572a2; line-height: 1.8;">
                    <div style="text-align: center; padding: 20px;">
                        <div class="modal-spinner"></div>
                        <p style="margin-top: 10px; color: #2572a2;">กำลังวิเคราะห์และสร้างคำแนะนำ...</p>
                    </div>
                </div>
            </div>
        `,
        confirmText: 'เข้าใจแล้ว',
        width: '650px'
    });
    
    // Get AI recommendations
    const recommendations = await getHealthRecommendations(answers, healthScore);
    
    // Update modal with recommendations
    const aiRecommendationsDiv = document.getElementById('aiRecommendations');
    if (aiRecommendationsDiv && recommendations) {
        // Format the recommendations for better readability
        const formattedRecommendations = recommendations
            .replace(/\n/g, '<br>')
            .replace(/📌/g, '<br><span style="color: #2572a2;">📌')
            .replace(/🎯/g, '<br><span style="color: #2572a2;">🎯')
            .replace(/⚠️/g, '<br><span style="color: #2572a2;">⚠️')
            .replace(/💪/g, '<br><span style="color: #2572a2;">💪')
            .replace(/•/g, '<br>&nbsp;&nbsp;•')
            .replace(/<\/strong>/g, '</span><br>')
            .replace(/(<br>){3,}/g, '<br><br>');
        
        const shortText = formattedRecommendations.substring(0, 400);
        const hasMore = formattedRecommendations.length > 400;
        
        aiRecommendationsDiv.innerHTML = `
            <div style="background: #f8fafc; padding: 15px; border-radius: 10px; border-left: 4px solid ${healthColor};">
                <div style="font-weight: 600; margin-bottom: 15px; color: ${healthColor}; font-size: 15px;">💡 คำแนะนำเฉพาะสำหรับคุณ</div>
                <div id="recommendationText" style="line-height: 1.9; white-space: pre-wrap; color: #2572a2;">${shortText}${hasMore ? '...' : ''}</div>
                ${hasMore ? `
                    <div id="fullRecommendation" style="display: none; line-height: 1.9; white-space: pre-wrap; color: #2572a2;">${formattedRecommendations}</div>
                    <button id="toggleBtn" style="margin-top: 15px; padding: 10px 20px; background: ${healthColor}; color: white; border: none; border-radius: 8px; cursor: pointer; font-family: 'Mitr', sans-serif; font-size: 14px; font-weight: 500; transition: all 0.2s;">
                        แสดงเพิ่มเติม ▼
                    </button>
                ` : ''}
            </div>
        `;
        
        // Add event listener after creating the button
        if (hasMore) {
            setTimeout(() => {
                const toggleBtn = document.getElementById('toggleBtn');
                if (toggleBtn) {
                    toggleBtn.addEventListener('click', toggleRecommendation);
                }
            }, 100);
        }
    }
}

// Global function for toggle
function toggleRecommendation() {
    const shortDiv = document.getElementById('recommendationText');
    const fullDiv = document.getElementById('fullRecommendation');
    const btn = document.getElementById('toggleBtn');
    
    // Silently return if elements don't exist (modal might be closed)
    if (!shortDiv || !fullDiv || !btn) {
        return;
    }
    
    if (fullDiv.style.display === 'none') {
        shortDiv.style.display = 'none';
        fullDiv.style.display = 'block';
        btn.textContent = 'แสดงน้อยลง ▲';
    } else {
        shortDiv.style.display = 'block';
        fullDiv.style.display = 'none';
        btn.textContent = 'แสดงเพิ่มเติม ▼';
    }
}

async function getHealthRecommendations(answers, healthScore) {
    try {
        // Analyze answers to find problem areas
        const problems = [];
        
        // Map question IDs to their meanings
        const questionMeanings = {
            1: 'ความสุข',
            2: 'การนอนหลับ',
            3: 'ความสดชื่น',
            4: 'ความเครียด',
            5: 'การใช้มือถือก่อนนอน',
            6: 'การกินผักผลไม้',
            7: 'การกินอาหารครบมื้อ',
            8: 'การดื่มน้ำ',
            9: 'การทานของหวาน',
            10: 'การดื่มแอลกอฮอล์',
            11: 'การเดินและใช้บันได',
            12: 'การออกกำลังกาย',
            13: 'การยืดเหยียด',
            14: 'การนั่งนาน',
            15: 'การรับแสงแดด',
            16: 'การสูบบุหรี่',
            17: 'ระบบขับถ่าย',
            18: 'การพักสายตา',
            19: 'การทานยา/วิตามิน',
            20: 'การพูดคุยกับคนอื่น'
        };
        
        // Find low score answers (0 or 5 points)
        for (const [key, value] of Object.entries(answers)) {
            const questionId = parseInt(key.replace('q', ''));
            if (value <= 5) {
                problems.push(questionMeanings[questionId]);
            }
        }
        
        const apiKey = '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';
        
        const prompt = `คุณเป็นผู้เชี่ยวชาญด้านสุขภาพ ผู้ใช้ได้คะแนนสุขภาพ ${healthScore}/100 จากการตอบคำถาม 20 ข้อ และมีปัญหาในด้าน: ${problems.join(', ')}

กรุณาให้คำแนะนำที่ละเอียดและครบถ้วน โดย:
1. วิเคราะห์ปัญหาแต่ละด้านอย่างเฉพาะเจาะจง
2. ให้คำแนะนำที่ปฏิบัติได้จริงในชีวิตประจำวัน อย่างน้อย 5-7 ข้อ
3. เตือนถึงความเสี่ยงต่อสุขภาพและวิธีป้องกันอย่างละเอียด
4. กำหนดเป้าหมายระยะสั้นและระยะยาว
5. ให้กำลังใจและแนวทางปรับปรุง
6. ใช้ภาษาที่เข้าใจง่าย เป็นกันเอง

รูปแบบ (ต้องครบทุกหัวข้อ):

📌 สรุปสถานะสุขภาพ:
[วิเคราะห์คะแนนและปัญหาหลักที่พบ 2-3 ประโยค]

🎯 คำแนะนำเร่งด่วน (ต้องมีอย่างน้อย 5 ข้อ):
• [คำแนะนำเฉพาะเจาะจงที่ 1 พร้อมวิธีปฏิบัติ]
• [คำแนะนำเฉพาะเจาะจงที่ 2 พร้อมวิธีปฏิบัติ]
• [คำแนะนำเฉพาะเจาะจงที่ 3 พร้อมวิธีปฏิบัติ]
• [คำแนะนำเฉพาะเจาะจงที่ 4 พร้อมวิธีปฏิบัติ]
• [คำแนะนำเฉพาะเจาะจงที่ 5 พร้อมวิธีปฏิบัติ]

⚠️ ความเสี่ยงและการป้องกัน (ต้องมีอย่างน้อย 3 ข้อ):
• [ความเสี่ยงที่ 1 และวิธีป้องกันอย่างละเอียด]
• [ความเสี่ยงที่ 2 และวิธีป้องกันอย่างละเอียด]
• [ความเสี่ยงที่ 3 และวิธีป้องกันอย่างละเอียด]

💪 เป้าหมายระยะสั้น (1-2 สัปดาห์):
• [เป้าหมายที่ 1 ที่วัดผลได้]
• [เป้าหมายที่ 2 ที่วัดผลได้]
• [เป้าหมายที่ 3 ที่วัดผลได้]

🌟 เป้าหมายระยะยาว (1-3 เดือน):
• [เป้าหมายระยะยาวที่ 1]
• [เป้าหมายระยะยาวที่ 2]

💬 กำลังใจ:
[ข้อความให้กำลังใจและแรงบันดาลใจ 1-2 ประโยค]

หมายเหตุ: ต้องให้คำแนะนำครบทุกหัวข้อและละเอียดพอที่จะนำไปปฏิบัติได้จริง`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: 'คุณเป็นผู้เชี่ยวชาญด้านสุขภาพที่ให้คำแนะนำที่ละเอียด ครบถ้วน และปฏิบัติได้จริง คุณต้องให้คำแนะนำครบทุกหัวข้อที่กำหนด' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();
        return data.choices[0].message.content;
        
    } catch (error) {
        console.error('Error getting recommendations:', error);
        return 'ไม่สามารถสร้างคำแนะนำได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง';
    }
}

async function loadHistory() {
    let userData = null;

    if (isTestUser()) {
        // Load from test user data
        const testData = getTestUserData() || {};
        userData = {
            nickname: testData.name || 'Test User',
            username: testData.username || 'test',
            email: testData.email || 'test@test.com',
            birthdate: testData.birthdate || null,
            weight: testData.weight || null,
            height: testData.height || null,
            health_score: testData.health_score ?? 100
        };
    } else if(isGuestMode) {
        const guestData = JSON.parse(localStorage.getItem(GUEST_STORAGE_KEY) || '{}');
        if (!guestData.nickname) {
            guestData.nickname = 'ผู้ใช้ชั่วคราว';
            localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guestData));
        }

        userData = {
            nickname: guestData.nickname,
            username: guestData.nickname,
            email: 'ผู้ใช้ชั่วคราว (ไม่มีอีเมล)',
            birthdate: guestData.birthdate || null,
            weight: guestData.weight || null,
            height: guestData.height || null,
            health_score: guestData.health_score ?? 100
        };
    } else{
        const supabase = getSupabase();
        const { data } = await supabase
            .from('users')
            .select('*')
            .eq('id', currentUser.id)
            .single();
        userData = data;
    };

    if (userData) {
        document.getElementById('aboutName').textContent = userData.nickname || userData.username || 'ไม่ระบุชื่อ';
        document.getElementById('aboutEmail').textContent = userData.email || currentUser.email || 'ไม่ระบุอีเมล';
        
        // Format birthdate
        if (userData.birthdate) {
            const date = new Date(userData.birthdate);
            document.getElementById('aboutBirthdate').textContent = `วันเกิด: ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear() + 543}`;
        } else {
            document.getElementById('aboutBirthdate').textContent = 'วันเกิด: ไม่ระบุ';
        }
        
        // Weight and Height
        const weight = userData.weight ? `${userData.weight} กก.` : 'ไม่ระบุ';
        const height = userData.height ? `${userData.height} ซม.` : 'ไม่ระบุ';
        document.getElementById('aboutWeight').textContent = `น้ำหนัก ${weight}`;
        document.getElementById('aboutHeight').textContent = `ส่วนสูง ${height}`;
        
        // Calculate BMI
        if (userData.weight && userData.height) {
            const heightM = userData.height / 100;
            const bmi = (userData.weight / (heightM * heightM)).toFixed(1);
            const bmiInfo = getBMICategory(parseFloat(bmi));
            const bmiPercent = Math.min(Math.max((parseFloat(bmi) - 10) / 35 * 100, 0), 100);
            
            document.getElementById('aboutBMI').innerHTML = `
                <div class="bmi-gauge-container">
                    <div class="bmi-gauge">
                        <div class="bmi-gauge-bar">
                            <div class="bmi-gauge-fill" style="width: ${bmiPercent}%"></div>
                            <div class="bmi-gauge-pointer" style="left: ${bmiPercent}%"></div>
                        </div>
                        <div class="bmi-gauge-labels">
                            <span>ผอม</span>
                            <span>ปกติ</span>
                            <span>อ้วน</span>
                        </div>
                    </div>
                    <div class="bmi-value-display">
                        <span class="bmi-number">${bmi}</span>
                    </div>
                </div>
            `;
            document.getElementById('bmiCategory').innerHTML = `
                <span class="bmi-status">${bmiInfo.category}</span>
            `;
            document.getElementById('bmiCategory').className = `bmi-category ${bmiInfo.colorClass}`;
            document.getElementById('bmiDescription').textContent = bmiInfo.description;
        } else {
            document.getElementById('aboutBMI').innerHTML = `
                <div class="bmi-gauge-container">
                    <div class="bmi-gauge">
                        <div class="bmi-gauge-bar">
                            <div class="bmi-gauge-fill" style="width: 0%"></div>
                        </div>
                        <div class="bmi-gauge-labels">
                            <span>ผอม</span>
                            <span>ปกติ</span>
                            <span>อ้วน</span>
                        </div>
                    </div>
                    <div class="bmi-value-display bmi-no-data">
                        <span class="bmi-number">--</span>
                    </div>
                </div>
            `;
            document.getElementById('bmiCategory').textContent = 'ไม่มีข้อมูล';
            document.getElementById('bmiCategory').className = 'bmi-category bmi-no-data';
            document.getElementById('bmiDescription').textContent = 'กรุณากรอกน้ำหนักและส่วนสูง';
        }
        
        // Health score
        document.getElementById('aboutHealthScore').textContent = userData.health_score || 100;
    } else {
        document.getElementById('aboutName').textContent = 'ไม่ระบุชื่อ';
        document.getElementById('aboutEmail').textContent = currentUser.email || 'ไม่ระบุอีเมล';
        document.getElementById('aboutBirthdate').textContent = 'วันเกิด: ไม่ระบุ';
        document.getElementById('aboutWeight').textContent = 'น้ำหนัก: ไม่ระบุ';
        document.getElementById('aboutHeight').textContent = 'ส่วนสูง: ไม่ระบุ';
        document.getElementById('aboutBMI').textContent = 'BMI ของคุณ: ไม่สามารถคำนวณได้';
        document.getElementById('bmiCategory').textContent = '';
        document.getElementById('bmiDescription').textContent = '';
        document.getElementById('aboutHealthScore').textContent = '100';
    }
}

function getBMICategory(bmi) {
    if (bmi >= 30) {
        return {
            category: 'อ้วนมาก',
            colorClass: 'bmi-danger',
            range: '≥ 30.0',
            description: 'เสี่ยงโรคร้ายแรง ควรปรับอาหารและออกกำลังกาย'
        };
    } else if (bmi >= 25) {
        return {
            category: 'น้ำหนักเกิน',
            colorClass: 'bmi-warning',
            range: '25.0 - 29.9',
            description: 'เสี่ยงเบาหวาน/ความดัน ควรควบคุมน้ำหนัก'
        };
    } else if (bmi >= 18.5) {
        return {
            category: 'น้ำหนักปกติ',
            colorClass: 'bmi-normal',
            range: '18.5 - 24.9',
            description: 'สุขภาพดี รักษาระดับนี้ไว้'
        };
    } else {
        return {
            category: 'น้ำหนักต่ำ',
            colorClass: 'bmi-underweight',
            range: '< 18.5',
            description: 'ควรเพิ่มสารอาหารและออกกำลังกาย'
        };
    }
}

// Edit Profile Functions
async function showEditProfileModal() {
    // Load current data
    if (isGuestMode) {
        const guestData = JSON.parse(localStorage.getItem(GUEST_STORAGE_KEY) || '{}');
        document.getElementById('editBirthdate').value = guestData.birthdate || '';
        document.getElementById('editWeight').value = guestData.weight || '';
        document.getElementById('editHeight').value = guestData.height || '';
    } else {
        const supabase = getSupabase();
        const { data: userData } = await supabase
            .from('users')
            .select('weight, height, birthdate')
            .eq('id', currentUser.id)
            .single();
        
        if (userData) {
            document.getElementById('editBirthdate').value = userData.birthdate || '';
            document.getElementById('editWeight').value = userData.weight || '';
            document.getElementById('editHeight').value = userData.height || '';
        }
    }
    
    document.getElementById('editProfileModal').style.display = 'flex';
}

function closeEditProfileModal() {
    document.getElementById('editProfileModal').style.display = 'none';
}

async function saveProfile() {
    const birthdate = document.getElementById('editBirthdate').value;
    const weight = document.getElementById('editWeight').value;
    const height = document.getElementById('editHeight').value;
    
    if (!weight || !height) {
        Modal.show({ type: 'warning', title: 'กรุณากรอกข้อมูล', message: 'กรุณากรอกน้ำหนักและส่วนสูง' });
        return;
    }
    
    Modal.loading('กำลังบันทึก...');
    
    if (isGuestMode) {
        const guestData = JSON.parse(localStorage.getItem(GUEST_STORAGE_KEY) || '{}');
        guestData.birthdate = birthdate || null;
        guestData.weight = parseFloat(weight);
        guestData.height = parseInt(height);
        localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guestData));
        
        closeEditProfileModal();
        Modal.close();
        Modal.toast('อัพเดทข้อมูลเรียบร้อยแล้ว', 'success');
        loadHistory();
    } else {
        const supabase = getSupabase();
        const { error } = await supabase
            .from('users')
            .update({ 
                birthdate: birthdate || null,
                weight: parseFloat(weight), 
                height: parseInt(height) 
            })
            .eq('id', currentUser.id);
        
        if (error) {
            Modal.show({ type: 'error', title: 'เกิดข้อผิดพลาด', message: error.message });
            return;
        }
        
        closeEditProfileModal();
        Modal.close();
        Modal.toast('อัพเดทข้อมูลเรียบร้อยแล้ว', 'success');
        loadHistory();
    }
}

// ==================== Weekly Health Check Functions ====================

// Get the start of current week (Monday)
function getWeekStart(date = new Date()) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
}

// Get the end of current week (Sunday 23:59:59)
function getWeekEnd(date = new Date()) {
    const weekStart = getWeekStart(date);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    return weekEnd;
}

// Get week key for database (YYYY-WW format)
function getWeekKey(date = new Date()) {
    const weekStart = getWeekStart(date);
    const year = weekStart.getFullYear();
    const weekNum = getWeekNumber(weekStart);
    return `${year}-W${String(weekNum).padStart(2, '0')}`;
}

// Get ISO week number
function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

async function checkThisWeekCompletion() {
    const weekKey = getWeekKey();
    let healthScore = null;
    
    if (isTestUser()) {
        // Check test user data
        const testData = getTestUserData() || {};
        healthScore = testData.health_score || 100;
        const weeklyChecks = testData.weekly_checks || [];
        const thisWeekCheck = weeklyChecks.find(check => check.week_key === weekKey);
        
        if (thisWeekCheck) {
            thisWeekCompleted = true;
            updateStartButton(true, healthScore);
        } else {
            thisWeekCompleted = false;
            updateStartButton(false, healthScore);
        }
    } else if (isGuestMode) {
        const guestData = JSON.parse(localStorage.getItem(GUEST_STORAGE_KEY) || '{}');
        healthScore = guestData.health_score || 100;
        const weeklyChecks = guestData.weekly_checks || [];
        const thisWeekCheck = weeklyChecks.find(check => check.week_key === weekKey);
        
        if (thisWeekCheck) {
            thisWeekCompleted = true;
            updateStartButton(true, healthScore);
        } else {
            thisWeekCompleted = false;
            updateStartButton(false, healthScore);
        }
    } else {
        const supabase = getSupabase();
        const { data: userData } = await supabase
            .from('users')
            .select('health_score')
            .eq('id', currentUser.id)
            .single();
        
        if (userData && userData.health_score !== null) {
            healthScore = userData.health_score;
        }
        
        let data = null;
        try {
            const result = await supabase
                .from('weekly_checks')
                .select('*')
                .eq('user_id', currentUser.id)
                .eq('week_key', weekKey)
                .maybeSingle();
            
            if (!result.error) {
                data = result.data;
            }
        } catch (error) {
            console.log('Weekly checks table not available yet');
            data = null;
        }
        
        if (data) {
            thisWeekCompleted = true;
            updateStartButton(true, healthScore);
        } else {
            thisWeekCompleted = false;
            updateStartButton(false, healthScore);
        }
    }
}

function updateStartButton(completed, healthScore = null) {
    const btn = document.querySelector('.btn-start');
    if (btn) {
        btn.classList.remove('btn-completed', 'btn-health-green', 'btn-health-yellow', 'btn-health-orange', 'btn-health-red', 'btn-health-gray');
        
        if (completed) {
            btn.textContent = 'ทำแล้วสัปดาห์นี้';
            btn.disabled = true;
            btn.classList.add('btn-completed');
        } else {
            btn.textContent = 'เริ่ม!';
            btn.disabled = false;
            
            // Set color based on health score
            if (healthScore === null || healthScore === undefined) {
                btn.classList.add('btn-health-gray');
            } else if (healthScore >= 80) {
                btn.classList.add('btn-health-green');
            } else if (healthScore >= 60) {
                btn.classList.add('btn-health-yellow');
            } else if (healthScore >= 40) {
                btn.classList.add('btn-health-orange');
            } else {
                btn.classList.add('btn-health-red');
            }
        }
        
        updateDevSkipButton(completed);
    }
}

function addDevBadge() {
    const userNameSpan = document.getElementById('currentUser');
    if (userNameSpan && !document.querySelector('.dev-badge')) {
        const badge = document.createElement('span');
        badge.className = 'dev-badge';
        // Text is set via CSS ::after content
        userNameSpan.parentNode.insertBefore(badge, userNameSpan.nextSibling);
    }
}

function updateDevSkipButton(completed) {
    // Remove existing skip button container
    const existingContainer = document.querySelector('.dev-skip-container');
    if (existingContainer) {
        existingContainer.remove();
    }
    
    // Add skip button for Dev users (always show, not just when completed)
    if (isDevMode) {
        const btn = document.querySelector('.btn-start');
        if (btn && btn.parentNode) {
            const container = document.createElement('div');
            container.className = 'dev-skip-container';
            
        // Add skip button for Dev users (always show, not just when completed)
        if (isDevMode) {
            const btn = document.querySelector('.btn-start');
            if (btn && btn.parentNode) {
                const container = document.createElement('div');
                container.className = 'dev-skip-container';
                
                const skipBtn = document.createElement('button');
                skipBtn.className = 'dev-skip-btn';
                skipBtn.textContent = completed ? 'ทำใหม่ (Dev)' : 'ข้าม (Dev)';
                skipBtn.onclick = () => devSkipWeeklyCheck();
                
                container.appendChild(skipBtn);
                btn.parentNode.insertBefore(container, btn.nextSibling);
            }
        }
    }
    
    async function devSkipWeeklyCheck() {
        if (!isDevMode) return;
        
        const weekKey = getWeekKey();
        
        // Generate random answers for all 20 questions
        const answers = allHealthQuestions.map(q => {
            const randomChoiceIndex = Math.floor(Math.random() * q.choices.length);
            return {
                questionId: q.id,
                questionText: q.text,
                choice: randomChoiceIndex,
                choiceText: q.choices[randomChoiceIndex],
                score: q.scores[randomChoiceIndex]
            };
        });
        
        const totalScore = answers.reduce((sum, answer) => sum + answer.score, 0);
        const healthScore = Math.round((totalScore / 200) * 100); // 200 is max possible score (20 questions * 10 points)
        
        const weeklyCheckData = {
            user_id: currentUser.id,
            week_key: weekKey,
            answers: answers,
            total_score: totalScore,
            health_score: healthScore,
            completed_at: new Date().toISOString()
        };
        
        if (isTestUser()) {
            // Save to test user data
            const testData = getTestUserData() || {};
            if (!testData.weekly_checks) testData.weekly_checks = [];
            if (!testData.mood_entries) testData.mood_entries = [];
            
            // Remove existing entry for this week if any
            testData.weekly_checks = testData.weekly_checks.filter(check => check.week_key !== weekKey);
            testData.weekly_checks.push(weeklyCheckData);
            testData.health_score = healthScore;
            
            // Also save to mood_entries for calendar
            const weekStart = getWeekStart();
            const dateKey = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`;
            
            let mood, moodName;
            if (healthScore >= 80) { mood = 'blue'; moodName = 'สุขมาก'; }
            else if (healthScore >= 60) { mood = 'green'; moodName = 'ดี'; }
            else if (healthScore >= 40) { mood = 'yellow'; moodName = 'ปกติ'; }
            else if (healthScore >= 20) { mood = 'orange'; moodName = 'เหนื่อย'; }
            else { mood = 'red'; moodName = 'เครียด'; }
            
            testData.mood_entries = testData.mood_entries.filter(entry => entry.date !== dateKey);
            testData.mood_entries.push({
                date: dateKey,
                mood: mood,
                mood_name: moodName,
                note: `คะแนนสุขภาพประจำสัปดาห์: ${healthScore}`
            });
            
            saveTestUserData(testData);
        } else if (isGuestMode) {
            const guestData = JSON.parse(localStorage.getItem(GUEST_STORAGE_KEY) || '{}');
            if (!guestData.weekly_checks) guestData.weekly_checks = [];
            
            // Remove existing entry for this week if any
            guestData.weekly_checks = guestData.weekly_checks.filter(check => check.week_key !== weekKey);
            guestData.weekly_checks.push(weeklyCheckData);
            guestData.health_score = healthScore;
            
            localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guestData));
        } else {
            // Save to database
            const supabase = getSupabase();
            await supabase.from('weekly_checks').upsert(weeklyCheckData, { onConflict: 'user_id,week_key' });
            await supabase.from('users').update({ health_score: healthScore }).eq('id', currentUser.id);
        }
        
        Modal.toast(`Dev: ข้ามแบบทดสอบสำเร็จ (คะแนน: ${healthScore})`, 'success');
        await checkThisWeekCompletion();
        loadStats();
    }
}

// Dev date offset for testing (load from localStorage)
let devDateOffset = parseInt(localStorage.getItem('devDateOffset') || '0');

// Get current date (with dev offset)
async function devSkipToNextDay() {
    if (!isDevMode) return;
    
    const result = await Modal.show({
        type: 'question',
        title: 'Dev Mode - ข้ามวัน',
        message: `ข้ามไปวันถัดไป? (ปัจจุบัน +${devDateOffset} วัน)`,
        showCancel: true,
        confirmText: 'ข้ามวัน',
        cancelText: 'รีเซ็ต'
    });
    
    if (result.confirmed) {
        devDateOffset++;
        localStorage.setItem('devDateOffset', devDateOffset.toString());
        
        // Clear question cache for new day
        const todayKey = getTodayKey();
        localStorage.removeItem(`ai_questions_${todayKey}`);
        
        // Re-check completion for new "day"
        await checkThisWeekCompletion();
        updateTodayDate();
        loadCalendar();
        
        Modal.toast(`ข้ามไปวันที่ +${devDateOffset}`, 'success');
    } else {
        // Reset offset and clear all caches
        devDateOffset = 0;
        localStorage.setItem('devDateOffset', '0');
        
        // Clear all question caches
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('ai_questions_') || key.startsWith('ai_summary_')) {
                localStorage.removeItem(key);
            }
        });
        
        await checkThisWeekCompletion();
        updateTodayDate();
        loadCalendar();
        
        Modal.toast('รีเซ็ตกลับวันจริงและล้าง cache แล้ว', 'info');
    }
}

// Dev function to adjust health score
async function devAdjustHealthScore() {
    if (!isDevMode) return;
    
    const supabase = getSupabase();
    const { data: userData } = await supabase
        .from('users')
        .select('health_score')
        .eq('id', currentUser.id)
        .single();
    
    const currentScore = userData?.health_score ?? 100;
    
    const result = await Modal.show({
        title: 'ปรับคะแนนสุขภาพ',
        html: `
            <div style="text-align: center;">
                <p style="margin-bottom: 12px; color: #666;">คะแนนปัจจุบัน: <strong>${currentScore}</strong></p>
                <div style="display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; margin-bottom: 15px;">
                    <button type="button" class="preset-btn" onclick="document.getElementById('modalInput').value=100">100</button>
                    <button type="button" class="preset-btn" onclick="document.getElementById('modalInput').value=80">80</button>
                    <button type="button" class="preset-btn" onclick="document.getElementById('modalInput').value=60">60</button>
                    <button type="button" class="preset-btn" onclick="document.getElementById('modalInput').value=40">40</button>
                    <button type="button" class="preset-btn" onclick="document.getElementById('modalInput').value=20">20</button>
                    <button type="button" class="preset-btn" onclick="document.getElementById('modalInput').value=0">0</button>
                </div>
            </div>
        `,
        input: 'number',
        inputValue: currentScore,
        showCancel: true,
        confirmText: 'บันทึก',
        cancelText: 'ยกเลิก'
    });
    
    if (result.confirmed && result.value !== null) {
        const score = parseInt(result.value);
        if (score < 0 || score > 100) {
            Modal.show({ type: 'warning', title: 'ข้อผิดพลาด', message: 'คะแนนต้องอยู่ระหว่าง 0-100' });
            return;
        }
        
        const { error } = await supabase
            .from('users')
            .update({ health_score: score })
            .eq('id', currentUser.id);
        
        if (error) {
            Modal.show({ type: 'error', title: 'เกิดข้อผิดพลาด', message: error.message });
            return;
        }
        
        document.getElementById('healthScore').textContent = score;
        document.getElementById('aboutHealthScore').textContent = score;
        updateHealthLevelCard(score);
        updateStartButton(todayCompleted, score);
        
        Modal.toast(`อัพเดทคะแนนเป็น ${score} แล้ว`, 'success');
    }
}

// Add Dev button to edit health score
function addDevHealthScoreButton() {
    // Remove existing button first
    const existingBtn = document.querySelector('.dev-edit-score-btn');
    if (existingBtn) {
        existingBtn.remove();
    }
    
    if (!isDevMode) return;
    
    // Find the health score stat card
    const healthScoreElement = document.getElementById('healthScore');
    if (healthScoreElement) {
        const statCard = healthScoreElement.closest('.stat-card');
        if (statCard && !statCard.querySelector('.dev-edit-score-btn')) {
            const editBtn = document.createElement('button');
            editBtn.className = 'dev-edit-score-btn';
            editBtn.innerHTML = 'แก้ไข';
            editBtn.onclick = devAdjustHealthScore;
            statCard.appendChild(editBtn);
        }
    }
}

// Get today's date key for caching
function getTodayKey() {
    const today = getCurrentDate();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

// Fallback questions (used when AI fails)
function getFallbackQuestions() {
    // Use true random shuffle for variety
    const shuffled = [...allHealthQuestions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 5);
}

async function generateAIQuestions() {
    const todayKey = getTodayKey();
    const cacheKey = `ai_questions_${todayKey}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
        try {
            return JSON.parse(cached);
        } catch (e) {
            localStorage.removeItem(cacheKey);
        }
    }
    
    try {
        const prompt = `สร้าง 5 คำถามพฤติกรรมสุขภาพประจำสัปดาห์ ขึ้นต้นด้วย "สัปดาห์นี้คุณ" ลงท้าย "หรือไม่?"

สุ่มจากหัวข้อ:
🥗 โภชนาการ: กินอาหารครบ 5 หมู่, กินผักผลไม้, ควบคุมน้ำตาล/ไขมัน, ไม่ข้ามมื้อเช้า
🚬 พฤติกรรมเสี่ยง: สูบบุหรี่, ดื่มแอลกอฮอล์, ดื่มคาเฟอีนมากเกินไป
🏃 การออกกำลังกาย: ออกกำลังกาย, ยืดเหยียด, เดินหรือใช้บันได
💧 ดูแลร่างกาย: ดื่มน้ำ 8 แก้ว, นอนหลับ 7-8 ชม., ล้างมือก่อนกินอาหาร
🦷 สุขภาพช่องปาก: แปรงฟัน 2 ครั้ง, ใช้ไหมขัดฟัน
🧠 สุขภาพจิต: จัดการความเครียด, ผ่อนคลาย, มองโลกในแง่บวก

ตอบ JSON เท่านั้น:
[{"id":1,"text":"สัปดาห์นี้คุณดื่มน้ำครบ 8 แก้วหรือไม่?","choices":["ใช่","ไม่"],"scores":[10,0]}]`;

        const data = await GroqAPI.call({
            model: 'llama-3.1-8b-instant',
            messages: [
                { role: 'system', content: 'ตอบเฉพาะ JSON array เท่านั้น ไม่มีข้อความอื่น ภาษาไทย' },
                { role: 'user', content: prompt }
            ],
            max_tokens: 600,
            temperature: 0.8
        });
        let content = data.choices[0].message.content;
        console.log('AI Response:', content); // Debug log
        
        // Clean up content - remove markdown code blocks if present
        content = content.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
        
        // Try to extract JSON array
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (!jsonMatch) throw new Error('No JSON array found');
        
        // Clean the JSON string
        let jsonStr = jsonMatch[0];
        // Fix common JSON issues
        jsonStr = jsonStr.replace(/,\s*]/g, ']'); // Remove trailing commas
        jsonStr = jsonStr.replace(/,\s*}/g, '}'); // Remove trailing commas in objects
        jsonStr = jsonStr.replace(/'/g, '"'); // Replace single quotes with double quotes
        jsonStr = jsonStr.replace(/(\w+):/g, '"$1":'); // Add quotes to unquoted keys
        jsonStr = jsonStr.replace(/""+/g, '"'); // Fix double quotes
        
        let questions;
        try {
            questions = JSON.parse(jsonStr);
        } catch (e) {
            console.error('JSON Parse Error:', jsonStr);
            throw e;
        }
        
        if (!Array.isArray(questions) || questions.length < 5) {
            throw new Error('Invalid questions count');
        }
        
        const validQuestions = questions.slice(0, 5).map((q, i) => ({
            id: i + 100, 
            text: q.text || `คำถามที่ ${i + 1}`,
            choices: q.choices || ['ใช่', 'ไม่'],
            scores: q.scores || [10, 0]
        }));
        
        localStorage.setItem(cacheKey, JSON.stringify(validQuestions));
        
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('ai_questions_') && key !== cacheKey) {
                localStorage.removeItem(key);
            }
        });
        
        return validQuestions;
    } catch (error) {
        console.error('AI Questions Error:', error);
        return null;
    }
}

async function startWeeklyCheck() {
    if (thisWeekCompleted) {
        Modal.show({ type: 'info', title: 'ทำแล้วสัปดาห์นี้', message: 'คุณได้ทำแบบประเมินสุขภาพสัปดาห์นี้แล้ว กลับมาใหม่สัปดาห์หน้านะ!' });
        return;
    }
    
    // Redirect to weekly check page
    window.location.href = 'weekly-check.html';
}

// Ensure function is globally accessible
window.startWeeklyCheck = startWeeklyCheck;

function renderProgressDots() {
    const container = document.getElementById('progressDots');
    container.innerHTML = '';
    // Show 20 dots for 20 questions, but make them smaller
    for (let i = 0; i < 20; i++) {
        const dot = document.createElement('span');
        dot.className = 'progress-dot-small' + (i < currentWeeklyQuestion ? ' completed' : '') + (i === currentWeeklyQuestion ? ' active' : '');
        container.appendChild(dot);
    }
}

function renderWeeklyQuestion() {
    const question = weeklyQuestions[currentWeeklyQuestion];
    const questionNum = currentWeeklyQuestion + 1;
    
    // Update all question number displays
    document.getElementById('currentQuestionNum').textContent = questionNum;
    document.getElementById('totalQuestionNum').textContent = '20';
    const badgeNum = document.getElementById('questionBadgeNum');
    if (badgeNum) badgeNum.textContent = questionNum;
    
    // Update progress bar
    const progressFill = document.getElementById('weeklyProgressFill');
    if (progressFill) progressFill.style.width = (questionNum / 20 * 100) + '%';
    
    // Update question text
    document.getElementById('weeklyQuestion').textContent = question.text;
    
    // Update next button text
    const nextBtn = document.getElementById('weeklyNextBtn');
    nextBtn.textContent = questionNum === 20 ? 'เสร็จสิ้น' : 'ถัดไป';
    nextBtn.disabled = true;
    
    // Render choices
    const choicesContainer = document.getElementById('weeklyChoices');
    choicesContainer.innerHTML = '';
    
    question.choices.forEach((choice, index) => {
        const btn = document.createElement('button');
        btn.className = 'weekly-choice-btn';
        btn.innerHTML = `<span class="choice-icon">${getChoiceIcon(choice)}</span><span>${choice}</span>`;
        btn.onclick = () => selectWeeklyAnswer(index, question.scores[index]);
        choicesContainer.appendChild(btn);
    });
    
    renderProgressDots();
}

function getChoiceIcon(choice) {
    const icons = {
        'ใช่': '✓',
        'ไม่': '✗',
        'ครบ': '✓',
        'ไม่ครบ': '✗',
        'ไม่สูบ': '🚭',
        'สูบ': '🚬',
        'ไม่ดื่ม': '🚫',
        'ดื่ม': '🍺',
        'ไม่เครียด': '😊',
        'เครียดเล็กน้อย': '😐',
        'เครียดมาก': '😰',
        'มีความสุข': '😊',
        'เฉยๆ': '😐',
        'ไม่มีความสุข': '😢',
        'บ่อย': '✓',
        'ไม่บ่อย': '✗',
        'ไม่กิน': '✓',
        'กิน': '🍟'
    };
    return icons[choice] || '•';
}

let selectedWeeklyChoice = null;
let selectedWeeklyScore = null;

function selectWeeklyAnswer(choiceIndex, score) {
    // Remove previous selection
    const btns = document.querySelectorAll('.weekly-choice-btn');
    btns.forEach(btn => btn.classList.remove('selected'));
    
    // Add selection to clicked button
    btns[choiceIndex].classList.add('selected');
    
    // Store selection
    selectedWeeklyChoice = choiceIndex;
    selectedWeeklyScore = score;
    
    // Enable next button
    document.getElementById('weeklyNextBtn').disabled = false;
}

async function goToNextQuestion() {
    if (selectedWeeklyChoice === null) return;
    
    // Save answer with full question and choice text
    const currentQuestion = weeklyQuestions[currentWeeklyQuestion];
    weeklyAnswers.push({
        questionId: currentQuestion.id,
        questionText: currentQuestion.text,
        choiceText: currentQuestion.choices[selectedWeeklyChoice],
        choice: selectedWeeklyChoice,
        score: selectedWeeklyScore
    });
    
    // Reset selection
    selectedWeeklyChoice = null;
    selectedWeeklyScore = null;
    
    if (currentWeeklyQuestion < 19) { // 0-19 = 20 questions
        currentWeeklyQuestion++;
        renderWeeklyQuestion();
        document.getElementById('weeklyNextBtn').disabled = true;
        document.getElementById('weeklyNextBtn').textContent = currentWeeklyQuestion === 19 ? 'เสร็จสิ้น' : 'ถัดไป';
        renderProgressDots();
    } else {
        await completeWeeklyCheck();
    }
}

// Ensure function is globally accessible
window.goToNextQuestion = goToNextQuestion;

async function completeWeeklyCheck() {
    const totalScore = weeklyAnswers.reduce((sum, a) => sum + a.score, 0);
    const maxScore = 200; // 20 questions * 10 points each
    const healthScore = Math.round((totalScore / maxScore) * 100);
    
    const weekKey = getWeekKey();
    
    // Determine mood based on score
    let mood, moodName;
    if (healthScore >= 80) { mood = 'blue'; moodName = 'สุขมาก'; }
    else if (healthScore >= 60) { mood = 'green'; moodName = 'ดี'; }
    else if (healthScore >= 40) { mood = 'yellow'; moodName = 'ปกติ'; }
    else if (healthScore >= 20) { mood = 'orange'; moodName = 'เหนื่อย'; }
    else { mood = 'red'; moodName = 'เครียด'; }
    
    const weeklyCheckData = {
        user_id: currentUser.id,
        week_key: weekKey,
        answers: weeklyAnswers,
        total_score: totalScore,
        health_score: healthScore,
        mood: mood,
        mood_name: moodName,
        completed_at: new Date().toISOString()
    };
    
    if (isTestUser()) {
        // Save to test user data
        console.log('Saving to test user data...');
        const testData = getTestUserData() || {};
        if (!testData.weekly_checks) testData.weekly_checks = [];
        
        // Remove existing entry for this week if any
        testData.weekly_checks = testData.weekly_checks.filter(check => check.week_key !== weekKey);
        testData.weekly_checks.push(weeklyCheckData);
        testData.health_score = healthScore;
        
        saveTestUserData(testData);
        console.log('Saved to test user data successfully');
    } else if (isGuestMode) {
        console.log('Saving to guest data...');
        const guestData = JSON.parse(localStorage.getItem(GUEST_STORAGE_KEY) || '{}');
        if (!guestData.weekly_checks) guestData.weekly_checks = [];
        
        // Remove existing entry for this week if any
        guestData.weekly_checks = guestData.weekly_checks.filter(check => check.week_key !== weekKey);
        guestData.weekly_checks.push(weeklyCheckData);
        guestData.health_score = healthScore;
        
        localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guestData));
        console.log('Saved to guest data successfully');
    } else {
        console.log('Saving to Supabase...');
        // Save to weekly_checks table
        const supabase = getSupabase();
        await supabase.from('weekly_checks').upsert(weeklyCheckData, { onConflict: 'user_id,week_key' });
        
        // Update user's health score
        await supabase.from('users').update({ health_score: healthScore }).eq('id', currentUser.id);
        
        // Also save to mood_entries for calendar (use Monday of the week)
        const weekStart = getWeekStart();
        const dateKey = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`;
        
        await supabase.from('mood_entries').upsert({
            user_id: currentUser.id,
            date: dateKey,
            mood: mood,
            mood_name: moodName,
            note: `เช็คสุขภาพประจำสัปดาห์: ${healthScore}%`
        }, { onConflict: 'user_id,date' });
        console.log('Saved to Supabase successfully');
    }
    
    // Update UI immediately
    document.getElementById('healthScore').textContent = healthScore;
    document.getElementById('aboutHealthScore').textContent = healthScore;
    updateHealthLevelCard(healthScore);
    
    closeWeeklyCheckModal();
    
    // Show result modal
    const resultType = healthScore >= 60 ? 'success' : healthScore >= 40 ? 'warning' : 'error';
    Modal.show({
        type: resultType,
        title: `คะแนนสัปดาห์นี้ ${healthScore}%`,
        html: `
            <div style="text-align: center; margin-bottom: 12px;">
                <span style="font-weight: 600;">${moodName}</span>
                <span style="color: #6b7280;"> (${totalScore}/${maxScore})</span>
            </div>
            <div style="background: #f9fafb; padding: 12px; border-radius: 8px; text-align: left; font-size: 13px; line-height: 1.5;">
                <p style="font-weight: 600; margin-bottom: 8px; color: #65c8ff;">💡 สรุปสัปดาห์นี้</p>
                <div id="aiTypingContainer"><span class="typing-cursor">|</span></div>
            </div>
        `,
        width: '420px'
    });
    
    // Generate AI summary
    generateAISummary(weeklyAnswers, healthScore);
    
    // Refresh data
    await checkThisWeekCompletion();
    loadStats();
    loadCalendar();
    loadHistory();
}

// Generate AI Summary based on answers using GROQ API
async function generateAISummary(answers, healthScore) {
    const container = document.getElementById('aiTypingContainer');
    if (!container) return;
    
    // Hardcode API key
    const apiKey = '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';
    
    // console.log('Summary API Key check:', apiKey ? `Key found (${apiKey.substring(0, 10)}...)` : 'No key');
    
    // ถ้าไม่มี API key หรือ key ไม่ถูกต้อง ใช้ fallback ทันที
    if (!apiKey || apiKey.length < 20) {
        console.log('No valid GROQ API key, using fallback');
        await showFallbackSummary(healthScore);
        return;
    }
    
    try {
        // สร้าง prompt สำหรับ AI
        const questionsText = answers.map((a, i) => 
            `${i + 1}. ${allHealthQuestions[i].text}\n   คำตอบ: ${a.choice} (${a.score} คะแนน)`
        ).join('\n\n');
        
        const prompt = `คุณเป็นผู้เชี่ยวชาญด้านสุขภาพ วิเคราะห์ผลการตอบคำถามสุขภาพสัปดาห์นี้และให้สรุปแบบละเอียด:

คะแนนสุขภาพรวม: ${healthScore}/100

คำถามและคำตอบ:
${questionsText}

กรุณาสรุปในรูปแบบนี้ (ต้องมี emoji และขึ้นบรรทัดใหม่ชัดเจน):

📊 สรุปภาพรวม
[สรุป 1-2 ประโยคว่าสัปดาห์นี้เป็นยังไง]

✅ จุดที่ทำได้ดี
• [ข้อ 1]
• [ข้อ 2]

⚠️ จุดที่ควรปรับปรุง
• [ข้อ 1]
• [ข้อ 2]

💡 แนวทางแก้ไข
1. [คำแนะนำข้อ 1]
2. [คำแนะนำข้อ 2]
3. [คำแนะนำข้อ 3]

ตอบเป็นภาษาไทยที่เป็นกันเอง อ่านง่าย และให้กำลังใจ ห้ามใช้ markdown แต่ให้ขึ้นบรรทัดใหม่ชัดเจน`;

        // เรียก GROQ API
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: 'คุณเป็นผู้เชี่ยวชาญด้านสุขภาพที่ให้คำแนะนำเป็นภาษาไทยอย่างเป็นกันเอง อ่านง่าย และให้กำลังใจ ตอบแบบมีโครงสร้างชัดเจน'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 600
            })
        });

        if (!response.ok) {
            console.log('API request failed, using fallback');
            await showFallbackSummary(healthScore);
            return;
        }

        const data = await response.json();
        const aiSummary = data.choices[0].message.content;
        
        // แสดงผลด้วย typing animation
        await typeText('aiTypingContainer', aiSummary, 30);
        
    } catch (error) {
        console.error('Error generating AI summary:', error);
        await showFallbackSummary(healthScore);
    }
}

// Fallback summary function
async function showFallbackSummary(healthScore) {
    let fallbackSummary = '';
    if (healthScore >= 80) {
        fallbackSummary = `📊 สรุปภาพรวม
ยอดเยี่ยม! คุณดูแลสุขภาพได้ดีมาก

✅ จุดที่ทำได้ดี
• รักษาพฤติกรรมสุขภาพได้สม่ำเสมอ
• มีวินัยในการดูแลตัวเอง

💡 แนวทางแก้ไข
1. รักษาพฤติกรรมดีๆ แบบนี้ต่อไป
2. เป็นแบบอย่างที่ดีให้คนรอบข้าง
3. ท้าทายตัวเองด้วยเป้าหมายใหม่ๆ`;
    } else if (healthScore >= 60) {
        fallbackSummary = `� สรุปภาพรวม
ดีมาก! คุณดูแลสุขภาพได้ดี แต่ยังมีบางจุดที่สามารถปรับปรุงได้

✅ จุดที่ทำได้ดี
• มีความตั้งใจในการดูแลสุขภาพ
• มีพฤติกรรมสุขภาพที่ดีหลายด้าน

⚠️ จุดที่ควรปรับปรุง
• การออกกำลังกายยังไม่สม่ำเสมอ
• การพักผ่อนอาจยังไม่เพียงพอ

💡 แนวทางแก้ไข
1. ตั้งเป้าออกกำลังกายสัปดาห์ละ 3-5 วัน
2. นอนให้ครบ 7-8 ชั่วโมงทุกคืน
3. ดื่มน้ำเปล่าให้เพียงพอ 8 แก้วต่อวัน`;
    } else if (healthScore >= 40) {
        fallbackSummary = `📊 สรุปภาพรวม
คุณกำลังทำได้ดีอยู่แล้ว แต่ควรให้ความสำคัญกับสุขภาพมากขึ้น

⚠️ จุดที่ควรปรับปรุง
• การพักผ่อนยังไม่เพียงพอ
• การออกกำลังกายน้อยเกินไป
• การกินอาหารยังไม่สมดุล

💡 แนวทางแก้ไข
1. เริ่มนอนให้ตรงเวลาและครบ 7-8 ชั่วโมง
2. เดินหรือยืดเหยียดร่างกายวันละ 20-30 นาที
3. กินผักผลไม้ให้มากขึ้น ลดของทอดและหวาน
4. ดื่มน้ำเปล่าแทนเครื่องดื่มหวาน`;
    } else {
        fallbackSummary = `📊 สรุปภาพรวม
อย่าท้อใจ! ทุกคนเริ่มต้นจากจุดศูนย์ และคุณสามารถปรับปรุงได้

⚠️ จุดที่ควรปรับปรุง
• พฤติกรรมสุขภาพหลายด้านยังไม่เหมาะสม
• ขาดการดูแลตัวเองอย่างสม่ำเสมอ

💡 แนวทางแก้ไข
1. เริ่มจากการนอนให้เพียงพอ 7-8 ชั่วโมงทุกคืน
2. ดื่มน้ำเปล่าวันละ 6-8 แก้ว
3. เดินหรือเคลื่อนไหวร่างกายวันละ 15-20 นาที
4. กินอาหารครบ 3 มื้อ เพิ่มผักผลไม้
5. หลีกเลี่ยงบุหรี่และแอลกอฮอล์

เริ่มทีละขั้นตอน ค่อยๆ ทำไป คุณทำได้แน่นอน! 💪`;
    }
    
    await typeText('aiTypingContainer', fallbackSummary, 30);
}

function closeWeeklyCheckModal() {
    document.getElementById('weeklyCheckModal').style.display = 'none';
    
    // Reset variables
    currentWeeklyQuestion = 0;
    weeklyAnswers = [];
    weeklyQuestions = [];
    selectedWeeklyChoice = null;
    selectedWeeklyScore = null;
}

// AI Health Summary Function
async function getAIHealthSummary(answers, percentage, moodName) {
    try {
        // Build answer summary for AI using stored question/choice text
        const answerDetails = answers.map(a => {
            const questionText = a.questionText || 'คำถาม';
            const choiceText = a.choiceText || 'ไม่ระบุ';
            const isGood = a.score >= 5;
            return `- ${questionText}: ${choiceText} (${isGood ? 'ดี' : 'ควรปรับปรุง'})`;
        }).join('\n');
        
        const prompt = `วิเคราะห์ผลสุขภาพประจำวัน:
คะแนน: ${percentage}%
อารมณ์: ${moodName}

ผลการตอบ:
${answerDetails}

ตอบใน 3 ส่วน (ไม่ต้องมีหัวข้อ "สรุป" เพราะมีอยู่แล้ว):
1. สถานะสัปดาห์นี้ - อธิบายภาพรวม 1-2 ประโยค
2. จุดที่ทำได้ดี - ระบุพฤติกรรมดีพร้อมคำชมสั้นๆ
3. ควรปรับปรุง - คำแนะนำเฉพาะเจาะจงที่ปฏิบัติได้`;

        const data = await GroqAPI.call({
            model: 'llama-3.1-8b-instant',
            messages: [
                { role: 'system', content: 'ผู้เชี่ยวชาญสุขภาพ ตอบภาษาไทย กระชับ ตรงประเด็น ไม่ต้องขึ้นต้นด้วย "สรุป" หรือหัวข้อซ้ำ' },
                { role: 'user', content: prompt }
            ],
            max_tokens: 300,
            temperature: 0.4
        });
        
        let content = data.choices[0].message.content;
        // Convert markdown to HTML
        content = content.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        content = content.replace(/\n/g, '<br>');
        return content;
    } catch (error) {
        console.error('AI Summary Error:', error);
        return generateFallbackSummary(answers, percentage, moodName);
    }
}

// Fallback summary when AI is unavailable
function generateFallbackSummary(answers, percentage, moodName) {
    const goodAnswers = [];
    const badAnswers = [];
    
    answers.forEach(a => {
        const choiceText = a.choiceText || 'ไม่ระบุ';
        const questionText = a.questionText || '';
        
        if (a.score >= 5) {
            goodAnswers.push(choiceText);
        } else {
            // Extract topic from question
            const topic = questionText.replace('สัปดาห์นี้คุณ', '').replace('หรือไม่?', '').replace('หรือไม่', '');
            badAnswers.push(topic || choiceText);
        }
    });
    
    let summary = '';
    
    // Overall status
    if (percentage >= 80) {
        summary += '🎉 <strong>ยอดเยี่ยม!</strong> สัปดาห์นี้คุณดูแลสุขภาพได้ดีมาก<br><br>';
    } else if (percentage >= 60) {
        summary += '😊 <strong>ดีครับ!</strong> สัปดาห์นี้สุขภาพโดยรวมอยู่ในเกณฑ์ดี<br><br>';
    } else if (percentage >= 40) {
        summary += '😐 <strong>พอใช้ครับ</strong> มีบางจุดที่ควรปรับปรุง<br><br>';
    } else {
        summary += '😟 <strong>ควรปรับปรุง</strong> สัปดาห์นี้มีหลายจุดที่ต้องดูแลเพิ่ม<br><br>';
    }
    
    // Good points
    if (goodAnswers.length > 0) {
        summary += '✅ <strong>ทำได้ดี</strong> ' + goodAnswers.slice(0, 2).join(', ') + '<br>';
    }
    
    // Bad points
    if (badAnswers.length > 0) {
        summary += '⚠️ <strong>ควรปรับปรุง</strong> ' + badAnswers.slice(0, 2).join(', ') + '<br><br>';
    }
    
    // Tips based on issues
    const tips = {
        'ดื่มน้ำเปล่าอย่างน้อย 8 แก้ว': '💧 พยายามดื่มน้ำให้ครบ 8 แก้วนะครับ',
        'กินผักหรือผลไม้': '🥗 เพิ่มผักผลไม้ในมื้ออาหารนะครับ',
        'ออกกำลังกาย': '🏃 ลองเดินเล่น 15-30 นาทีนะครับ',
        'นอนหลับเพียงพอ': '😴 พยายามนอนให้ครบ 7-8 ชั่วโมงนะครับ',
        'รู้สึกเครียด': '🧘 ลองหาเวลาพักผ่อนหรือทำสมาธินะครับ',
        'สูบบุหรี่': '🚭 ลองลดการสูบบุหรี่ทีละน้อยนะครับ',
        'ดื่มแอลกอฮอล์': '🚫 ลดการดื่มแอลกอฮอล์จะดีต่อสุขภาพครับ'
    };
    
    if (badAnswers.length > 0) {
        for (const bad of badAnswers) {
            for (const [key, tip] of Object.entries(tips)) {
                if (bad.includes(key.substring(0, 10))) {
                    summary += tip;
                    break;
                }
            }
            break; // Show only 1 tip
        }
    } else {
        summary += '💪 รักษาพฤติกรรมดีๆ แบบนี้ต่อไปนะครับ!';
}

// Update UI immediately
document.getElementById('healthScore').textContent = healthScore;
document.getElementById('aboutHealthScore').textContent = healthScore;
updateHealthLevelCard(healthScore);

closeWeeklyCheckModal();

// Show result modal
const resultType = healthScore >= 60 ? 'success' : healthScore >= 40 ? 'warning' : 'error';
Modal.show({
    type: resultType,
    title: `คะแนนสัปดาห์นี้ ${healthScore}%`,
    html: `
        <div style="text-align: center; margin-bottom: 12px;">
            <span style="font-weight: 600;">${moodName}</span>
            <span style="color: #6b7280;"> (${totalScore}/${maxScore})</span>
        </div>
        <div style="background: #f9fafb; padding: 12px; border-radius: 8px; text-align: left; font-size: 13px; line-height: 1.5;">
            <p style="font-weight: 600; margin-bottom: 8px; color: #65c8ff;">สรุปสัปดาห์นี้</p>
            <div id="aiTypingContainer"><span class="typing-cursor">|</span></div>
        </div>
    `,
    width: '420px'
});
        
// Generate AI summary
generateAISummary(weeklyAnswers, healthScore);
        
// Refresh data
checkThisWeekCompletion();
loadStats();
loadCalendar();
loadHistory();
}

function closeWeeklyCheckModal() {
    document.getElementById('weeklyCheckModal').style.display = 'none';
    
    // Reset variables
    currentWeeklyQuestion = 0;
    weeklyAnswers = [];
    weeklyQuestions = [];
    selectedWeeklyChoice = null;
    selectedWeeklyScore = null;
}

// AI Health Summary Function
async function getAIHealthSummary(answers, percentage, moodName) {
    try {
        // Build answer summary for AI using stored question/choice text
        const answerDetails = answers.map(a => {
            const questionText = a.questionText || 'คำถาม';
            const choiceText = a.choiceText || 'ไม่ระบุ';
            const isGood = a.score >= 5;
            return `- ${questionText}: ${choiceText} (${isGood ? 'ดี' : 'ควรปรับปรุง'})`;
        }).join('\n');
        
        const prompt = `วิเคราะห์ผลสุขภาพประจำวัน:
คะแนน: ${percentage}%
อารมณ์: ${moodName}

ผลการตอบ:
${answerDetails}

ตอบใน 3 ส่วน (ไม่ต้องมีหัวข้อ "สรุป" เพราะมีอยู่แล้ว):
1. สถานะสัปดาห์นี้ - อธิบายภาพรวม 1-2 ประโยค
2. จุดที่ทำได้ดี - ระบุพฤติกรรมดีพร้อมคำชมสั้นๆ
3. ควรปรับปรุง - คำแนะนำเฉพาะเจาะจงที่ปฏิบัติได้`;

        const data = await GroqAPI.call({
            model: 'llama-3.1-8b-instant',
            messages: [
                { role: 'system', content: 'ผู้เชี่ยวชาญสุขภาพ ตอบภาษาไทย กระชับ ตรงประเด็น ไม่ต้องขึ้นต้นด้วย "สรุป" หรือหัวข้อซ้ำ' },
                { role: 'user', content: prompt }
            ],
            max_tokens: 300,
            temperature: 0.4
        });
        
        let content = data.choices[0].message.content;
        // Convert markdown to HTML
        content = content.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        content = content.replace(/\n/g, '<br>');
        return content;
    } catch (error) {
        console.error('AI Summary Error:', error);
        return generateFallbackSummary(answers, percentage, moodName);
    }
}

// Fallback summary when AI is unavailable
function generateFallbackSummary(answers, percentage, moodName) {
    const goodAnswers = [];
    const badAnswers = [];
    
    answers.forEach(a => {
        const choiceText = a.choiceText || 'ไม่ระบุ';
        const questionText = a.questionText || '';
        
        if (a.score >= 5) {
            goodAnswers.push(choiceText);
        } else {
            // Extract topic from question
            const topic = questionText.replace('สัปดาห์นี้คุณ', '').replace('หรือไม่?', '').replace('หรือไม่', '');
            badAnswers.push(topic || choiceText);
        }
    });
    
    let summary = '';
    
    // Overall status
    if (percentage >= 80) {
        summary += 'ยอดเยี่ยม! สัปดาห์นี้คุณดูแลสุขภาพได้ดีมาก<br><br>';
    } else if (percentage >= 60) {
        summary += 'ดีครับ! สัปดาห์นี้สุขภาพโดยรวมอยู่ในเกณฑ์ดี<br><br>';
    } else if (percentage >= 40) {
        summary += 'พอใช้ครับ มีบางจุดที่ควรปรับปรุง<br><br>';
    } else {
        summary += 'ควรปรับปรุง สัปดาห์นี้มีหลายจุดที่ต้องดูแลเพิ่ม<br><br>';
    }
    
    // Good points
    if (goodAnswers.length > 0) {
        summary += 'ทำได้ดี ' + goodAnswers.slice(0, 2).join(', ') + '<br>';
    }
    
    // Bad points
    if (badAnswers.length > 0) {
        summary += 'ควรปรับปรุง ' + badAnswers.slice(0, 2).join(', ') + '<br><br>';
    }
    
    // Tips based on issues
    const tips = {
        'ดื่มน้ำเปล่าอย่างน้อย 8 แก้ว': 'พยายามดื่มน้ำให้ครบ 8 แก้วนะครับ',
        'กินผักหรือผลไม้': 'เพิ่มผักผลไม้ในมื้ออาหารนะครับ',
        'ออกกำลังกาย': 'ลองเดินเล่น 15-30 นาทีนะครับ',
        'นอนหลับเพียงพอ': 'พยายามนอนให้ครบ 7-8 ชั่วโมงนะครับ',
        'รู้สึกเครียด': 'ลองหาเวลาพักผ่อนหรือทำสมาธินะครับ',
        'สูบบุหรี่': 'ลองลดการสูบบุหรี่ทีละน้อยนะครับ',
        'ดื่มแอลกอฮอล์': 'ลดการดื่มแอลกอฮอล์จะดีต่อสุขภาพครับ'
    };
    
    if (badAnswers.length > 0) {
        for (const bad of badAnswers) {
            for (const [key, tip] of Object.entries(tips)) {
                if (bad.includes(key.substring(0, 10))) {
                    summary += tip;
                    break;
                }
            }
            break; // Show only 1 tip
        }
    } else {
        summary += 'รักษาพฤติกรรมดีๆ แบบนี้ต่อไปนะครับ!';
    }

    return summary;

}
}
// Ensure all weekly check functions are globally accessible
window.startWeeklyCheck = startWeeklyCheck;
window.goToNextQuestion = goToNextQuestion;
window.closeWeeklyCheckModal = function() {
    const modal = document.getElementById('weeklyCheckModal');
    if (modal) {
        modal.style.display = 'none';
    }
    
    // Reset variables
    currentWeeklyQuestion = 0;
    weeklyAnswers = [];
    weeklyQuestions = [];
    if (typeof selectedWeeklyChoice !== 'undefined') {
        selectedWeeklyChoice = null;
    }
    if (typeof selectedWeeklyScore !== 'undefined') {
        selectedWeeklyScore = null;
    }
};

// Also add direct function for backup
function closeWeeklyCheckModal() {
    const modal = document.getElementById('weeklyCheckModal');
    if (modal) {
        modal.style.display = 'none';
    }
    
    // Reset variables
    currentWeeklyQuestion = 0;
    weeklyAnswers = [];
    weeklyQuestions = [];
}

// End of file


// AI Recommendation Modal Functions
async function showAIRecommendation(date, weeklyChecks) {
    const modal = document.getElementById('aiRecommendationModal');
    const dateElement = document.getElementById('aiRecommendationDate');
    const contentElement = document.getElementById('aiRecommendationContent');
    
    // Format date
    const thaiMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 
                        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
    const day = date.getDate();
    const month = thaiMonths[date.getMonth()];
    const year = date.getFullYear() + 543;
    
    dateElement.textContent = `วันที่ ${day} ${month} ${year}`;
    contentElement.innerHTML = '<p style="text-align: center; color: #9ca3af;">กำลังโหลดคำแนะนำ...</p>';
    modal.style.display = 'flex';
    
    try {
        // Find the weekly check data for this date
        const checkData = weeklyChecks.find(check => {
            const checkDate = new Date(check.completed_at);
            return checkDate.getDate() === date.getDate() && 
                   checkDate.getMonth() === date.getMonth() && 
                   checkDate.getFullYear() === date.getFullYear();
        });
        
        if (!checkData) {
            contentElement.innerHTML = '<p style="text-align: center; color: #9ca3af;">ไม่พบข้อมูลสำหรับวันนี้</p>';
            return;
        }
        
        // Get AI summary from localStorage or database
        const weekKey = checkData.week_key;
        let aiSummary = null;
        
        if (isGuestMode) {
            const guestData = JSON.parse(localStorage.getItem(GUEST_STORAGE_KEY) || '{}');
            const checks = guestData.weekly_checks || [];
            const check = checks.find(c => c.week_key === weekKey);
            aiSummary = check?.ai_summary;
        } else {
            const supabase = getSupabase();
            const { data } = await supabase
                .from('weekly_checks')
                .select('ai_summary')
                .eq('user_id', currentUser.id)
                .eq('week_key', weekKey)
                .single();
            
            aiSummary = data?.ai_summary;
        }
        
        if (aiSummary) {
            // Format AI summary with proper HTML
            const formattedSummary = aiSummary
                .replace(/\n\n/g, '</p><p>')
                .replace(/\n/g, '<br>');
            contentElement.innerHTML = `<p>${formattedSummary}</p>`;
        } else {
            contentElement.innerHTML = '<p style="text-align: center; color: #9ca3af;">ไม่มีคำแนะนำสำหรับวันนี้</p>';
        }
        
    } catch (error) {
        console.error('Error loading AI recommendation:', error);
        contentElement.innerHTML = '<p style="text-align: center; color: #ef4444;">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>';
    }
}

function closeAIRecommendationModal() {
    document.getElementById('aiRecommendationModal').style.display = 'none';
}
