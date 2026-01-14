let currentUser = null;
let selectedMood = null;
let selectedMoodName = '';
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let imageData = null;
let isDevMode = false;

// Dev accounts
const DEV_EMAILS = ['time27535@gmail.com'];

// Daily Health Check Variables
let dailyQuestions = [];
let currentDailyQuestion = 0;
let dailyAnswers = [];
let todayCompleted = false;

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
        
        const colors = { success: '#10B981', error: '#EF4444', warning: '#F59E0B', info: '#3B82F6' };
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

const allHealthQuestions = [
    // 🥗 โภชนาการ
    { id: 1, text: "วันนี้คุณกินผักหรือผลไม้หรือไม่?", choices: ["ใช่", "ไม่"], scores: [10, 0] },
    { id: 2, text: "วันนี้คุณกินอาหารครบ 3 มื้อหรือไม่?", choices: ["ครบ", "ไม่ครบ"], scores: [10, 0] },
    { id: 3, text: "วันนี้คุณกินอาหารเช้าหรือไม่?", choices: ["ใช่", "ไม่"], scores: [10, 0] },
    { id: 4, text: "วันนี้คุณควบคุมน้ำตาลและไขมันหรือไม่?", choices: ["ใช่", "ไม่"], scores: [10, 0] },
    // 🚬 พฤติกรรมเสี่ยง
    { id: 5, text: "วันนี้คุณสูบบุหรี่หรือไม่?", choices: ["ไม่สูบ", "สูบ"], scores: [10, 0] },
    { id: 6, text: "วันนี้คุณดื่มแอลกอฮอล์หรือไม่?", choices: ["ไม่ดื่ม", "ดื่ม"], scores: [10, 0] },
    { id: 7, text: "วันนี้คุณดื่มคาเฟอีนมากเกินไปหรือไม่?", choices: ["ไม่", "ใช่"], scores: [10, 0] },
    // 🏃 การออกกำลังกาย
    { id: 8, text: "วันนี้คุณออกกำลังกายหรือไม่?", choices: ["ใช่", "ไม่"], scores: [10, 0] },
    { id: 9, text: "วันนี้คุณยืดเหยียดร่างกายหรือไม่?", choices: ["ใช่", "ไม่"], scores: [10, 0] },
    { id: 10, text: "วันนี้คุณเดินหรือใช้บันไดแทนลิฟต์หรือไม่?", choices: ["ใช่", "ไม่"], scores: [10, 0] },
    // 💧 ดูแลร่างกาย
    { id: 11, text: "วันนี้คุณดื่มน้ำครบ 8 แก้วหรือไม่?", choices: ["ใช่", "ไม่"], scores: [10, 0] },
    { id: 12, text: "วันนี้คุณนอนหลับเพียงพอหรือไม่? (7-8 ชม.)", choices: ["ใช่", "ไม่"], scores: [10, 0] },
    { id: 13, text: "วันนี้คุณล้างมือก่อนกินอาหารหรือไม่?", choices: ["ใช่", "ไม่"], scores: [10, 0] },
    // 🦷 สุขภาพช่องปาก
    { id: 14, text: "วันนี้คุณแปรงฟันครบ 2 ครั้งหรือไม่?", choices: ["ครบ", "ไม่ครบ"], scores: [10, 0] },
    { id: 15, text: "วันนี้คุณใช้ไหมขัดฟันหรือไม่?", choices: ["ใช่", "ไม่"], scores: [10, 0] },
    // 🧠 สุขภาพจิต
    { id: 16, text: "วันนี้คุณรู้สึกเครียดหรือไม่?", choices: ["ไม่เครียด", "เครียดเล็กน้อย", "เครียดมาก"], scores: [10, 5, 0] },
    { id: 17, text: "วันนี้คุณมีเวลาผ่อนคลายหรือไม่?", choices: ["ใช่", "ไม่"], scores: [10, 0] },
    { id: 18, text: "วันนี้คุณรู้สึกมีความสุขหรือไม่?", choices: ["มีความสุข", "เฉยๆ", "ไม่มีความสุข"], scores: [10, 5, 0] }
];

const moodColors = { blue: '#60A5FA', green: '#34D399', yellow: '#FBBF24', orange: '#FB923C', red: '#F87171' };
const monthNames = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
                   'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];

async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
            await supabase.auth.signOut();
            document.getElementById('landingPage').style.display = 'flex';
            return;
        }
        currentUser = user;
        showMainApp();
    } else {
        document.getElementById('landingPage').style.display = 'flex';
    }
}

function showLogin() {
    window.location.href = 'login.html';
}

function showRegister() {
    window.location.href = 'register.html';
}

async function logout() {
    await supabase.auth.signOut();
    currentUser = null;
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('landingPage').style.display = 'flex';
    resetForm();
}

function showMainApp() {
    document.getElementById('landingPage').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    
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
    
    // Load health score first for instant color display
    loadHealthScoreInstant();
    
    loadProfile();
    checkTodayCompletion();
}

// Load health score instantly without waiting for other data
async function loadHealthScoreInstant() {
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
    // Load user data for header greeting
    const { data: userData } = await supabase
        .from('users')
        .select('nickname, username')
        .eq('id', currentUser.id)
        .single();
    
    const displayName = userData?.nickname || userData?.username || currentUser.email?.split('@')[0] || 'ผู้ใช้';
    document.getElementById('currentUser').textContent = displayName;
}

function updateTodayDate() {
    const today = getCurrentDate();
    document.getElementById('todayDate').textContent = `${today.getDate()} ${monthNames[today.getMonth()]} ${today.getFullYear() + 543}`;
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

    const { error } = await supabase.from('mood_entries').upsert(entry, { onConflict: 'user_id,date' });
    
    if (error) {
        Modal.show({ type: 'error', title: 'เกิดข้อผิดพลาด', message: error.message });
        return;
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
    document.getElementById('smokingCheck').checked = false;
    document.getElementById('drinkingCheck').checked = false;
    document.getElementById('noteText').value = '';
    document.getElementById('imageUpload').value = '';
    document.getElementById('imagePreview').innerHTML = '';
    imageData = null;
}

function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById(tabName + 'Tab').classList.add('active');
    if (tabName === 'calendar') loadCalendar();
    else if (tabName === 'stats') loadStats();
    else if (tabName === 'history') loadHistory();
}

async function loadCalendar() {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDay = firstDay.getDay();
    
    // Get today's date for highlighting
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayDay = today.getDate();
    const todayMonth = today.getMonth();
    const todayYear = today.getFullYear();
    
    // Get user registration date to know when they started
    const { data: userData } = await supabase
        .from('users')
        .select('created_at')
        .eq('id', currentUser.id)
        .single();
    
    const userCreatedDate = userData?.created_at ? new Date(userData.created_at) : null;
    if (userCreatedDate) userCreatedDate.setHours(0, 0, 0, 0);
    
    document.getElementById('calendarMonth').textContent = `${monthNames[currentMonth]} ${currentYear + 543}`;
    const grid = document.getElementById('calendarGrid');
    grid.innerHTML = '';

    for (let i = 0; i < startDay; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'calendar-day';
        emptyDiv.style.opacity = '0.3';
        grid.appendChild(emptyDiv);
    }

    const startDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
    const endDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${lastDay.getDate()}`;
    
    const { data: entries } = await supabase
        .from('mood_entries')
        .select('date, mood, mood_name, note')
        .eq('user_id', currentUser.id)
        .gte('date', startDate)
        .lte('date', endDate);

    const entryMap = {};
    entries?.forEach(e => entryMap[e.date] = e);

    // Mood labels for badge
    const moodLabels = { blue: 'ดีมาก', green: 'ดี', yellow: 'ปกติ', orange: 'เหนื่อย', red: 'แย่' };

    for (let day = 1; day <= lastDay.getDate(); day++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        dayDiv.style.position = 'relative';
        
        const thisDate = new Date(currentYear, currentMonth, day);
        thisDate.setHours(0, 0, 0, 0);
        
        const dayNum = document.createElement('span');
        dayNum.className = 'day-number';
        dayNum.textContent = day;
        dayDiv.appendChild(dayNum);
        
        const isToday = day === todayDay && currentMonth === todayMonth && currentYear === todayYear;
        if (isToday) {
            dayDiv.classList.add('today');
        }
        
        const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isFutureDay = thisDate > today;
        
        if (entryMap[dateKey]) {
            dayDiv.classList.add('has-entry');

            const badge = document.createElement('span');
            badge.className = `mood-badge mood-${entryMap[dateKey].mood}`;
            badge.textContent = moodLabels[entryMap[dateKey].mood] || '✓';
            dayDiv.appendChild(badge);
            
            dayDiv.onclick = () => showDayDetails(dateKey, entryMap[dateKey]);
        } else {
            const isPastDay = thisDate < today;
            const isAfterRegistration = !userCreatedDate || thisDate >= userCreatedDate;
            
            if (isPastDay && isAfterRegistration && !isToday) {
                dayDiv.classList.add('missed-day');
                dayDiv.title = 'ไม่ได้ทำแบบทดสอบ';
                
                // Add click handler to show missed day message
                const missedDateKey = dateKey;
                dayDiv.onclick = () => showMissedDayMessage(missedDateKey);
            } else if (isToday) {
                // Today but not completed yet
                dayDiv.style.cursor = 'pointer';
                dayDiv.onclick = () => showTodayNotCompletedMessage();
            } else if (isFutureDay) {
                // Future day
                const futureDateKey = dateKey;
                dayDiv.style.cursor = 'pointer';
                dayDiv.onclick = () => showFutureDayMessage(futureDateKey);
            }
        }
        grid.appendChild(dayDiv);
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
        title: 'วันนี้',
        message: 'คุณยังไม่ได้ทำแบบประเมินสุขภาพวันนี้',
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
        message: 'วันนี้ยังมาไม่ถึง',
        html: `
            <div style="text-align: center; margin-top: 10px;">
                <p style="color: #6b7280; font-size: 13px;">กลับมาทำแบบประเมินสุขภาพในวันนั้นนะ!</p>
            </div>
        `,
        width: '350px'
    });
}

// Show day details with AI recommendation
async function showDayDetails(dateKey, entry) {
    const dateParts = dateKey.split('-');
    const displayDate = `${parseInt(dateParts[2])} ${monthNames[parseInt(dateParts[1]) - 1]} ${parseInt(dateParts[0]) + 543}`;
    const moodColorMap = { blue: '#3B82F6', green: '#10B981', yellow: '#F59E0B', orange: '#F97316', red: '#EF4444' };
    
    // Show modal immediately with loading state
    Modal.show({
        type: '',
        title: `${displayDate}`,
        html: `
            <div style="text-align: center;">
                <div style="display: inline-block; padding: 6px 16px; border-radius: 16px; background: ${moodColorMap[entry.mood]}; color: white; font-weight: 600; font-size: 14px;">
                    ${entry.mood_name}
                </div>
                ${entry.note ? `<p style="color: #6b7280; font-size: 13px; margin-top: 10px;">${entry.note}</p>` : ''}
                <div id="summaryContainer" style="margin-top: 12px;">
                    <p style="color: #9ca3af; font-size: 13px;">กำลังโหลดคำแนะนำ...</p>
                </div>
            </div>
        `,
        width: '400px'
    });
    
    // Load AI summary in background
    const { data: checkData } = await supabase
        .from('daily_checks')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('date', dateKey)
        .single();
    
    const summaryContainer = document.getElementById('summaryContainer');
    if (!summaryContainer) return;
    
    if (checkData) {
        const cacheKey = `ai_summary_${dateKey}`;
        let aiSummary = localStorage.getItem(cacheKey);
        
        if (!aiSummary && checkData.answers) {
            try {
                const answers = JSON.parse(checkData.answers);
                aiSummary = await getAIHealthSummary(answers, checkData.percentage, entry.mood_name);
                localStorage.setItem(cacheKey, aiSummary);
            } catch (e) {
                aiSummary = 'ไม่สามารถโหลดคำแนะนำได้';
            }
        }
        
        if (aiSummary) {
            // Clean up AI response
            aiSummary = aiSummary.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
            aiSummary = aiSummary.replace(/^(สรุปผลสุขภาพ|สรุป)(วันนี้)?:?\s*/i, '');
            
            summaryContainer.innerHTML = `
                <div style="background: #f9fafb; padding: 12px; border-radius: 8px; text-align: left;">
                    <div style="font-size: 13px; line-height: 1.6;">${aiSummary}</div>
                </div>
            `;
        } else {
            summaryContainer.innerHTML = '<p style="color: #9ca3af; font-size: 13px;">ไม่มีคำแนะนำ</p>';
        }
    } else {
        summaryContainer.innerHTML = '<p style="color: #9ca3af; font-size: 13px;">ไม่มีข้อมูลการเช็คสุขภาพ</p>';
    }
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
    const { data: entries } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('date', { ascending: true });

    // Get health score from users table
    let healthScore = 100;
    const { data: userData } = await supabase
        .from('users')
        .select('health_score')
        .eq('id', currentUser.id)
        .single();
    
    if (userData && userData.health_score !== null) {
        healthScore = userData.health_score;
    }

    document.getElementById('totalEntries').textContent = entries ? entries.length : 0;
    document.getElementById('healthScore').textContent = healthScore;
    
    // Update health level card
    updateHealthLevelCard(healthScore);
    
    // Add Dev edit button for health score
    addDevHealthScoreButton();

    // Get recent entries
    const recent7 = entries ? entries.slice(-7) : [];
    const recent30 = entries ? entries.slice(-30) : [];
    
    const moodValues = { blue: 50, green: 40, yellow: 30, orange: 20, red: 10 };

    // Create 7-day Line Chart
    if (window.healthChartInstance) window.healthChartInstance.destroy();
    const ctx7 = document.getElementById('healthChart');
    if (ctx7) {
        window.healthChartInstance = new Chart(ctx7, {
            type: 'line',
            data: {
                labels: recent7.map(e => e.date.split('-')[2] + '/' + e.date.split('-')[1]),
                datasets: [
                    { 
                        label: 'แดง', 
                        data: recent7.map(e => e.mood === 'red' ? moodValues[e.mood] : null), 
                        borderColor: '#ef4444', 
                        backgroundColor: '#ef4444',
                        tension: 0.4,
                        pointRadius: 5
                    },
                    { 
                        label: 'เขียว', 
                        data: recent7.map(e => e.mood === 'green' || e.mood === 'blue' ? moodValues[e.mood] : null), 
                        borderColor: '#22c55e', 
                        backgroundColor: '#22c55e',
                        tension: 0.4,
                        pointRadius: 5
                    },
                    { 
                        label: 'เหลือง', 
                        data: recent7.map(e => e.mood === 'yellow' || e.mood === 'orange' ? moodValues[e.mood] : null), 
                        borderColor: '#eab308', 
                        backgroundColor: '#eab308',
                        tension: 0.4,
                        pointRadius: 5
                    }
                ]
            },
            options: { 
                responsive: true, 
                scales: { 
                    y: { 
                        min: 0, 
                        max: 60,
                        ticks: {
                            stepSize: 10
                        }
                    } 
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    // Create 30-day Radar Chart
    if (window.healthRadarChartInstance) window.healthRadarChartInstance.destroy();
    const ctx30 = document.getElementById('healthRadarChart');
    if (ctx30) {
        window.healthRadarChartInstance = new Chart(ctx30, {
            type: 'radar',
            data: {
                labels: ['สุขมาก', 'ดี', 'ปกติ', 'เหนื่อย', 'เครียด'],
                datasets: [
                    {
                        label: 'สัปดาห์ที่ 1',
                        data: calculateWeekData(recent30, 0),
                        backgroundColor: 'rgba(96, 165, 250, 0.3)',
                        borderColor: 'rgba(96, 165, 250, 1)',
                        borderWidth: 2,
                        pointBackgroundColor: 'rgba(96, 165, 250, 1)'
                    },
                    {
                        label: 'สัปดาห์ที่ 2',
                        data: calculateWeekData(recent30, 1),
                        backgroundColor: 'rgba(59, 130, 246, 0.3)',
                        borderColor: 'rgba(59, 130, 246, 1)',
                        borderWidth: 2,
                        pointBackgroundColor: 'rgba(59, 130, 246, 1)'
                    },
                    {
                        label: 'สัปดาห์ที่ 3-4',
                        data: calculateWeekData(recent30, 2),
                        backgroundColor: 'rgba(30, 64, 175, 0.3)',
                        borderColor: 'rgba(30, 64, 175, 1)',
                        borderWidth: 2,
                        pointBackgroundColor: 'rgba(30, 64, 175, 1)'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 10,
                        ticks: {
                            stepSize: 2
                        },
                        pointLabels: {
                            font: {
                                size: 14,
                                family: 'Mitr'
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            font: {
                                family: 'Mitr'
                            }
                        }
                    }
                }
            }
        });
    }
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

async function loadHistory() {
    // Load user data for "About You" page from users table
    const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', currentUser.id)
        .single();

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
    const { data: userData } = await supabase
        .from('users')
        .select('weight, height')
        .eq('id', currentUser.id)
        .single();
    
    if (userData) {
        document.getElementById('editWeight').value = userData.weight || '';
        document.getElementById('editHeight').value = userData.height || '';
    }
    
    document.getElementById('editProfileModal').style.display = 'flex';
}

function closeEditProfileModal() {
    document.getElementById('editProfileModal').style.display = 'none';
}

async function saveProfile() {
    const weight = document.getElementById('editWeight').value;
    const height = document.getElementById('editHeight').value;
    
    if (!weight || !height) {
        Modal.show({ type: 'warning', title: 'กรุณากรอกข้อมูล', message: 'กรุณากรอกน้ำหนักและส่วนสูง' });
        return;
    }
    
    Modal.loading('กำลังบันทึก...');
    
    const { error } = await supabase
        .from('users')
        .update({ 
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

// ==================== Daily Health Check Functions ====================

async function checkTodayCompletion() {
    const today = getCurrentDate();
    const dateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    // Get health score from users table
    let healthScore = null;
    const { data: userData } = await supabase
        .from('users')
        .select('health_score')
        .eq('id', currentUser.id)
        .single();
    
    if (userData && userData.health_score !== null) {
        healthScore = userData.health_score;
    }
    
    const { data } = await supabase
        .from('daily_checks')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('date', dateKey)
        .single();
    
    if (data) {
        todayCompleted = true;
        updateStartButton(true, healthScore);
    } else {
        todayCompleted = false;
        updateStartButton(false, healthScore);
    }
}

function updateStartButton(completed, healthScore = null) {
    const btn = document.querySelector('.btn-start');
    if (btn) {
        // Remove all color classes
        btn.classList.remove('btn-completed', 'btn-health-green', 'btn-health-yellow', 'btn-health-orange', 'btn-health-red', 'btn-health-gray');
        
        if (completed) {
            btn.textContent = 'ทำแล้ววันนี้';
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
        
        // Add Dev skip button if Dev mode
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
            
            const skipBtn = document.createElement('button');
            skipBtn.className = 'btn-dev-skip';
            skipBtn.innerHTML = '<span class="dev-skip-icon"><span>ข้ามวัน</span>';
            skipBtn.onclick = devSkipToNextDay;
            
            container.appendChild(skipBtn);
            btn.parentNode.appendChild(container);
        }
    }
}

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
        await checkTodayCompletion();
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
        
        await checkTodayCompletion();
        updateTodayDate();
        loadCalendar();
        
        Modal.toast('รีเซ็ตกลับวันจริงและล้าง cache แล้ว', 'info');
    }
}

// Dev function to adjust health score
async function devAdjustHealthScore() {
    if (!isDevMode) return;
    
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
        const prompt = `สร้าง 5 คำถามพฤติกรรมสุขภาพประจำวัน ขึ้นต้นด้วย "วันนี้คุณ" ลงท้าย "หรือไม่?"

สุ่มจากหัวข้อ:
🥗 โภชนาการ: กินอาหารครบ 5 หมู่, กินผักผลไม้, ควบคุมน้ำตาล/ไขมัน, ไม่ข้ามมื้อเช้า
🚬 พฤติกรรมเสี่ยง: สูบบุหรี่, ดื่มแอลกอฮอล์, ดื่มคาเฟอีนมากเกินไป
🏃 การออกกำลังกาย: ออกกำลังกาย, ยืดเหยียด, เดินหรือใช้บันได
💧 ดูแลร่างกาย: ดื่มน้ำ 8 แก้ว, นอนหลับ 7-8 ชม., ล้างมือก่อนกินอาหาร
🦷 สุขภาพช่องปาก: แปรงฟัน 2 ครั้ง, ใช้ไหมขัดฟัน
🧠 สุขภาพจิต: จัดการความเครียด, ผ่อนคลาย, มองโลกในแง่บวก

ตอบ JSON เท่านั้น:
[{"id":1,"text":"วันนี้คุณดื่มน้ำครบ 8 แก้วหรือไม่?","choices":["ใช่","ไม่"],"scores":[10,0]}]`;

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

async function startDailyCheck() {
    if (todayCompleted) {
        Modal.show({ type: 'info', title: 'ทำแล้ววันนี้', message: 'คุณได้ทำแบบประเมินสุขภาพวันนี้แล้ว กลับมาใหม่พรุ่งนี้นะ!' });
        return;
    }
    
    Modal.loading('กำลังเตรียมคำถาม...');
    
    const aiQuestions = await generateAIQuestions();
    dailyQuestions = aiQuestions || getFallbackQuestions();
    
    Modal.close();
    
    currentDailyQuestion = 0;
    dailyAnswers = [];
    
    renderProgressDots();
    renderDailyQuestion();
    document.getElementById('dailyCheckModal').style.display = 'flex';
}

function renderProgressDots() {
    const container = document.getElementById('progressDots');
    container.innerHTML = '';
    for (let i = 0; i < 5; i++) {
        const dot = document.createElement('span');
        dot.className = 'progress-dot' + (i < currentDailyQuestion ? ' completed' : '') + (i === currentDailyQuestion ? ' active' : '');
        container.appendChild(dot);
    }
}

function renderDailyQuestion() {
    const question = dailyQuestions[currentDailyQuestion];
    const questionNum = currentDailyQuestion + 1;
    
    // Update all question number displays
    document.getElementById('currentQuestionNum').textContent = questionNum;
    const badgeNum = document.getElementById('questionBadgeNum');
    if (badgeNum) badgeNum.textContent = questionNum;
    
    // Update progress bar
    const progressFill = document.getElementById('dailyProgressFill');
    if (progressFill) progressFill.style.width = (questionNum * 20) + '%';
    
    // Update question text
    document.getElementById('dailyQuestion').textContent = question.text;
    
    // Update next button text
    const nextBtn = document.getElementById('dailyNextBtn');
    nextBtn.textContent = questionNum === 5 ? 'เสร็จสิ้น' : 'ถัดไป';
    nextBtn.disabled = true;
    
    // Render choices
    const choicesContainer = document.getElementById('dailyChoices');
    choicesContainer.innerHTML = '';
    
    question.choices.forEach((choice, index) => {
        const btn = document.createElement('button');
        btn.className = 'daily-choice-btn';
        btn.innerHTML = `<span class="choice-icon">${getChoiceIcon(choice)}</span><span>${choice}</span>`;
        btn.onclick = () => selectDailyAnswer(index, question.scores[index]);
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

let selectedDailyChoice = null;
let selectedDailyScore = null;

function selectDailyAnswer(choiceIndex, score) {
    // Remove previous selection
    const btns = document.querySelectorAll('.daily-choice-btn');
    btns.forEach(btn => btn.classList.remove('selected'));
    
    // Add selection to clicked button
    btns[choiceIndex].classList.add('selected');
    
    // Store selection
    selectedDailyChoice = choiceIndex;
    selectedDailyScore = score;
    
    // Enable next button
    document.getElementById('dailyNextBtn').disabled = false;
}

async function goToNextQuestion() {
    if (selectedDailyChoice === null) return;
    
    // Save answer with full question and choice text
    const currentQuestion = dailyQuestions[currentDailyQuestion];
    dailyAnswers.push({
        questionId: currentQuestion.id,
        questionText: currentQuestion.text,
        choiceText: currentQuestion.choices[selectedDailyChoice],
        choice: selectedDailyChoice,
        score: selectedDailyScore
    });
    
    // Reset selection
    selectedDailyChoice = null;
    selectedDailyScore = null;
    
    if (currentDailyQuestion < 4) {
        currentDailyQuestion++;
        renderDailyQuestion();
        document.getElementById('dailyNextBtn').disabled = true;
        document.getElementById('dailyNextBtn').textContent = currentDailyQuestion === 4 ? 'เสร็จสิ้น' : 'ถัดไป';
    } else {
        await completeDailyCheck();
    }
}

async function completeDailyCheck() {
    const totalScore = dailyAnswers.reduce((sum, a) => sum + a.score, 0);
    const maxScore = 50;
    const percentage = Math.round((totalScore / maxScore) * 100);
    
    const today = getCurrentDate();
    const dateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    // Determine mood based on score
    let mood, moodName;
    if (percentage >= 80) { mood = 'blue'; moodName = 'สุขมาก'; }
    else if (percentage >= 60) { mood = 'green'; moodName = 'ดี'; }
    else if (percentage >= 40) { mood = 'yellow'; moodName = 'ปกติ'; }
    else if (percentage >= 20) { mood = 'orange'; moodName = 'เหนื่อย'; }
    else { mood = 'red'; moodName = 'เครียด'; }
    
    // Save to daily_checks table
    await supabase.from('daily_checks').upsert({
        user_id: currentUser.id,
        date: dateKey,
        answers: JSON.stringify(dailyAnswers),
        score: totalScore,
        percentage: percentage,
        mood: mood,
        mood_name: moodName
    }, { onConflict: 'user_id,date' });
    
    // Also save to mood_entries for calendar
    await supabase.from('mood_entries').upsert({
        user_id: currentUser.id,
        date: dateKey,
        mood: mood,
        mood_name: moodName,
        note: `เช็คสุขภาพประจำวัน: ${percentage}%`
    }, { onConflict: 'user_id,date' });
    
    // Calculate average health score from all daily checks
    const { data: allChecks } = await supabase
        .from('daily_checks')
        .select('percentage')
        .eq('user_id', currentUser.id);
    
    let avgScore = percentage;
    if (allChecks && allChecks.length > 0) {
        const total = allChecks.reduce((sum, check) => sum + check.percentage, 0);
        avgScore = Math.round(total / allChecks.length);
    }
    
    // Update health_score in users table with average
    await supabase.from('users').update({
        health_score: avgScore
    }).eq('id', currentUser.id);
    
    // Update UI immediately
    document.getElementById('healthScore').textContent = avgScore;
    document.getElementById('aboutHealthScore').textContent = avgScore;
    updateHealthLevelCard(avgScore);
    
    closeDailyCheckModal();
    
    Modal.loading('กำลังวิเคราะห์ผลลัพธ์...');
    
    const aiSummary = await getAIHealthSummary(dailyAnswers, percentage, moodName);
    
    const resultType = percentage >= 60 ? 'success' : percentage >= 40 ? 'warning' : 'error';
    Modal.show({
        type: resultType,
        title: `คะแนนวันนี้ ${percentage}%`,
        html: `
            <div style="text-align: center; margin-bottom: 12px;">
                <span style="font-weight: 600;">${moodName}</span>
                <span style="color: #6b7280;"> (${totalScore}/${maxScore})</span>
            </div>
            <div style="background: #f9fafb; padding: 12px; border-radius: 8px; text-align: left; font-size: 13px; line-height: 1.5;">
                <p style="font-weight: 600; margin-bottom: 8px; color: #7aa449;">💡 สรุป</p>
                <div>${aiSummary}</div>
            </div>
        `,
        width: '420px'
    });
    
    todayCompleted = true;
    updateStartButton(true);
    loadCalendar();
    loadStats();
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
1. สถานะวันนี้ - อธิบายภาพรวม 1-2 ประโยค
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
            const topic = questionText.replace('วันนี้คุณ', '').replace('หรือไม่?', '').replace('หรือไม่', '');
            badAnswers.push(topic || choiceText);
        }
    });
    
    let summary = '';
    
    // Overall status
    if (percentage >= 80) {
        summary += '🎉 <strong>ยอดเยี่ยม!</strong> วันนี้คุณดูแลสุขภาพได้ดีมาก<br><br>';
    } else if (percentage >= 60) {
        summary += '😊 <strong>ดีครับ!</strong> วันนี้สุขภาพโดยรวมอยู่ในเกณฑ์ดี<br><br>';
    } else if (percentage >= 40) {
        summary += '😐 <strong>พอใช้ครับ</strong> มีบางจุดที่ควรปรับปรุง<br><br>';
    } else {
        summary += '😟 <strong>ควรปรับปรุง</strong> วันนี้มีหลายจุดที่ต้องดูแลเพิ่ม<br><br>';
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
    
    return summary;
}

function closeDailyCheckModal() {
    document.getElementById('dailyCheckModal').style.display = 'none';
}

checkAuth();
