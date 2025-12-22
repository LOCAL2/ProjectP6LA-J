let currentUser = null;
let selectedMood = null;
let selectedMoodName = '';
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let imageData = null;

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
    updateTodayDate();
    loadStats();
    loadProfile();
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
    const today = new Date();
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
        Swal.fire({ icon: 'warning', title: 'กรุณาเลือกอารมณ์', text: 'กรุณาเลือกอารมณ์ของคุณก่อนบันทึก' });
        return;
    }

    const today = new Date();
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
        Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: error.message });
        return;
    }

    Swal.fire({ icon: 'success', title: 'บันทึกสำเร็จ!', text: 'บันทึกอารมณ์ของคุณเรียบร้อยแล้ว' });
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
        .select('date, mood, mood_name')
        .eq('user_id', currentUser.id)
        .gte('date', startDate)
        .lte('date', endDate);

    const entryMap = {};
    entries?.forEach(e => entryMap[e.date] = e);

    for (let day = 1; day <= lastDay.getDate(); day++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        dayDiv.textContent = day;
        
        const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        if (entryMap[dateKey]) {
            dayDiv.style.background = moodColors[entryMap[dateKey].mood];
            dayDiv.style.color = 'white';
            dayDiv.classList.add('has-entry');
            dayDiv.title = entryMap[dateKey].mood_name;
        }
        grid.appendChild(dayDiv);
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
        Swal.fire({ icon: 'warning', title: 'กรุณากรอกข้อมูล', text: 'กรุณากรอกน้ำหนักและส่วนสูง' });
        return;
    }
    
    Swal.fire({ title: 'กำลังบันทึก...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    
    const { error } = await supabase
        .from('users')
        .update({ 
            weight: parseFloat(weight), 
            height: parseInt(height) 
        })
        .eq('id', currentUser.id);
    
    if (error) {
        Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: error.message });
        return;
    }
    
    closeEditProfileModal();
    Swal.fire({ icon: 'success', title: 'บันทึกสำเร็จ!', text: 'อัพเดทข้อมูลเรียบร้อยแล้ว' });
    loadHistory();
}

checkAuth();
