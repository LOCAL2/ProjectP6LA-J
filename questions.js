const allHealthQuestions = [
    { id: 1, text: "คุณรู้สึกมีความสุขเป็นส่วนใหญ่หรือไม่?", choices: ["มีความสุขเป็นส่วนใหญ่", "มีบ้างบางวัน", "เฉย ๆ ไม่ได้รู้สึกพิเศษ", "ไม่ค่อยมีความสุข"], scores: [10, 7, 4, 0] },
    { id: 2, text: "คุณนอนหลับพักผ่อนเพียงพอ (7-8 ชั่วโมงต่อคืน) สม่ำเสมอหรือไม่?", choices: ["เพียงพอและสม่ำเสมอ", "เพียงพอบางวัน", "นอนไม่ถึง 7 ชั่วโมง", "พักผ่อนไม่เพียงพอเลย"], scores: [10, 7, 4, 0] },
    { id: 3, text: "ส่วนใหญ่คุณตื่นมาแล้วรู้สึกสดชื่นหรือไม่?", choices: ["สดชื่นมาก", "สดชื่นเป็นบางวัน", "เฉย ๆ", "รู้สึกอ่อนเพลีย"], scores: [10, 7, 4, 0] },
    { id: 4, text: "คุณมีเรื่องเครียดหรือวิตกกังวลมากเกินไปหรือไม่?", choices: ["ไม่มีเลย", "มีเล็กน้อย", "ค่อนข้างเครียด", "เครียดมาก"], scores: [10, 7, 4, 0] },
    { id: 5, text: "คุณสามารถงดเล่นมือถือหรือดูจอก่อนเข้านอนอย่างน้อย 30 นาทีได้เป็นส่วนใหญ่หรือไม่?", choices: ["ทำได้สม่ำเสมอ", "ทำได้บางวัน", "ทำได้น้อยมาก", "ทำไม่ได้เลย"], scores: [10, 7, 4, 0] },
    { id: 6, text: "คุณกินผักหรือผลไม้เป็นประจำทุกวันหรือไม่?", choices: ["กินทุกวัน", "เกือบทุกวัน", "กินบางวัน", "แทบไม่ได้กิน"], scores: [10, 7, 4, 0] },
    { id: 7, text: "คุณกินอาหารครบ 3 มื้อในแต่ละวันหรือไม่?", choices: ["ครบทุกวัน", "ขาดบางมื้อ", "กินไม่ครบหลายวัน", "กินไม่เป็นเวลา"], scores: [10, 7, 4, 0] },
    { id: 8, text: "คุณดื่มน้ำเปล่าเพียงพอ (ประมาณ 2 ลิตรต่อวัน) สม่ำเสมอหรือไม่?", choices: ["เพียงพอทุกวัน", "เพียงพอบางวัน", "ดื่มน้อยกว่าที่ควร", "แทบไม่ถึง 2 ลิตร"], scores: [10, 7, 4, 0] },
    { id: 9, text: "คุณทานของหวานหรือเครื่องดื่มที่มีน้ำตาลสูงบ่อยแค่ไหน?", choices: ["ไม่ค่อยทาน", "สัปดาห์ละ 1–2 ครั้ง", "เกือบทุกวัน", "ทุกวัน"], scores: [10, 7, 4, 0] },
    { id: 10, text: "คุณดื่มเครื่องดื่มแอลกอฮอล์หรือไม่?", choices: ["ไม่ดื่มเลย", "ดื่มเล็กน้อย", "ดื่ม 1–2 ครั้ง", "ดื่มหลายครั้ง"], scores: [10, 7, 4, 0] },
    { id: 11, text: "คุณมีการเดินหรือใช้บันไดแทนลิฟต์บ้างหรือไม่?", choices: ["ทำเป็นประจำ", "ทำบางครั้ง", "นาน ๆ ครั้ง", "ไม่ได้ทำเลย"], scores: [10, 7, 4, 0] },
    { id: 12, text: "คุณได้ออกกำลังกายติดต่อกันอย่างน้อย 30 นาที (อย่างน้อย 3-5 วัน) หรือไม่?", choices: ["ได้ครบตามเป้า", "ได้บางวัน", "ออกกำลังกายน้อย", "ไม่ได้ออกเลย"], scores: [10, 7, 4, 0] },
    { id: 13, text: "คุณมีการยืดเหยียดกล้ามเนื้อ ระหว่างสัปดาห์บ้างหรือไม่?", choices: ["ทำเป็นประจำ", "ทำบางวัน", "ทำน้อยมาก", "ไม่ได้ทำเลย"], scores: [10, 7, 4, 0] },
    { id: 14, text: "คุณนั่งทำงานติดต่อกันนานเกิน 2 ชั่วโมงโดยไม่ลุกเดินบ่อยหรือไม่?", choices: ["ไม่เกิน 2 ชั่วโมง", "บางครั้งเกิน", "เกินบ่อยครั้ง", "เกือบทุกวัน"], scores: [10, 7, 4, 0] },
    { id: 15, text: "คุณได้รับแสงแดดอ่อนๆ หรือได้ออกไปสูดอากาศข้างนอกบ้างหรือไม่?", choices: ["ได้ทุกวัน", "ได้บางวัน", "ได้น้อยมาก", "ไม่ได้เลย"], scores: [10, 7, 4, 0] },
    { id: 16, text: "คุณสูบบุหรี่หรือไม่?", choices: ["ไม่สูบ", "สูบบางครั้ง", "สูบเป็นประจำ", "สูบเป็นประจำ"], scores: [10, 7, 4, 0] },
    { id: 17, text: "ระบบขับถ่ายของคุณเป็นปกติสม่ำเสมอหรือไม่?", choices: ["ปกติทุกวัน", "ปกติเป็นส่วนใหญ่", "มีปัญหาบ้าง", "ไม่สม่ำเสมอ"], scores: [10, 7, 4, 0] },
    { id: 18, text: "คุณมีการพักสายตาจากหน้าจอระหว่างวันสม่ำเสมอหรือไม่?", choices: ["พักสม่ำเสมอ", "พักบางครั้ง", "พักน้อยมาก", "แทบไม่พักเลย"], scores: [10, 7, 4, 0] },
    { id: 19, text: "คุณทานอาหารเสริมตามที่กำหนดครบถ้วนหรือไม่?", choices: ["ครบถ้วนสม่ำเสมอ", "ขาดบางวัน", "ลืมบ่อย", "ไม่ได้ทาน"], scores: [10, 7, 4, 10] },
    { id: 20, text: "คุณได้พูดคุยหรือทำกิจกรรมร่วมกับคนในครอบครัวหรือเพื่อนบ้างหรือไม่?", choices: ["ได้ทำบ่อย", "ได้ทำบางครั้ง", "ได้น้อยมาก", "ไม่ได้เลย"], scores: [10, 7, 4, 0] }
];

function shuffleAllQuestions() {
    const sorted = [...allHealthQuestions].sort((a, b) => a.id - b.id);
    return sorted;
}

let selectedQuestions = [];
let currentQuestion = 0;
let answers = {};
let selectedValue = null;

document.addEventListener('DOMContentLoaded', function() {
    const savedSize = localStorage.getItem('fontSize') || 'large';
    document.body.classList.add('font-' + savedSize);
    
    const registerData = JSON.parse(localStorage.getItem('registerData'));
    
    if (!registerData) {
        Swal.fire({ icon: 'error', title: 'ไม่พบข้อมูล', text: 'กรุณาเริ่มลงทะเบียนใหม่' }).then(() => {
            window.location.href = 'register.html';
        });
        return;
    }

    selectedQuestions = allHealthQuestions;
    
    const savedAnswers = localStorage.getItem('questionAnswers');
    if (savedAnswers) {
        answers = JSON.parse(savedAnswers);
    }

    const savedQuestion = localStorage.getItem('currentQuestion');
    if (savedQuestion) {
        const savedIndex = parseInt(savedQuestion);
        if (savedIndex >= 0 && savedIndex < selectedQuestions.length) {
            currentQuestion = savedIndex;
        } else {
            currentQuestion = 0;
            localStorage.removeItem('currentQuestion');
            localStorage.removeItem('questionAnswers');
        }
    }

    renderQuestion();
    
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' && selectedValue !== null) {
            goToNext();
        }
    });
});

function renderQuestion() {
    const question = selectedQuestions[currentQuestion];
    const totalSteps = 22; 
    const currentStep = currentQuestion + 3; 
    const percent = Math.round((currentStep / totalSteps) * 100);

    document.getElementById('progressPercent').textContent = percent + '%';
    document.getElementById('stepText').textContent = `step ${currentStep} of ${totalSteps}`;
    document.getElementById('progressFill').style.width = percent + '%';
    document.getElementById('questionTitle').textContent = question.text;
    selectedValue = null;

    const choicesContainer = document.getElementById('questionChoices');
    choicesContainer.innerHTML = '';

    question.choices.forEach((choiceText, index) => {
        const choiceBtn = document.createElement('button');
        choiceBtn.className = 'choice-btn';
        choiceBtn.innerHTML = `
            <span class="choice-circle"></span>
            <span class="choice-text">${choiceText}</span>
        `;
        choiceBtn.onclick = () => selectAnswer(question.scores[index], choiceBtn);
        choicesContainer.appendChild(choiceBtn);
    });

    const isLastQuestion = currentQuestion === selectedQuestions.length - 1;
    document.getElementById('nextBtn').textContent = isLastQuestion ? 'เสร็จสิ้น' : 'ข้อถัดไป';
    document.getElementById('nextBtn').disabled = true;
}

function selectAnswer(value, btn) {
    document.querySelectorAll('.choice-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedValue = value;
    document.getElementById('nextBtn').disabled = false;
}

function goToNext() {
    if (selectedValue === null) {
        Swal.fire({ icon: 'warning', title: 'กรุณาเลือกคำตอบ' });
        return;
    }

    const question = selectedQuestions[currentQuestion];
    answers[`q${question.id}`] = selectedValue;

    localStorage.setItem('questionAnswers', JSON.stringify(answers));
    localStorage.setItem('currentQuestion', currentQuestion + 1);

    if (currentQuestion < selectedQuestions.length - 1) {
        currentQuestion++;
        renderQuestion();
    } else {
        finishQuestions();
    }
}

function finishQuestions() {
    let totalScore = 0;
    for (let key in answers) {
        totalScore += parseInt(answers[key]);
    }

    const maxScore = 200; 
    const healthScore = Math.round((totalScore / maxScore) * 100);

    let healthStatus = '';
    if (healthScore >= 80) {
        healthStatus = 'สุขภาพดีมาก';
    } else if (healthScore >= 60) {
        healthStatus = 'สุขภาพดี';
    } else if (healthScore >= 40) {
        healthStatus = 'ควรปรับปรุง';
    } else {
        healthStatus = 'เสี่ยง';
    }

    const registerData = JSON.parse(localStorage.getItem('registerData') || '{}');
    const guestId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
    const guestData = {
        id: guestId,
        nickname: registerData.nickname || 'ผู้ใช้ชั่วคราว',
        gender: registerData.gender || null,
        birthdate: registerData.birthdate || null,
        weight: registerData.weight || null,
        height: registerData.height || null,
        health_score: healthScore,
        created_at: new Date().toISOString(),
        mood_entries: [],
        daily_checks: [],
        weekly_checks: []
    };

    localStorage.setItem('guest_user_data', JSON.stringify(guestData));
    localStorage.setItem('guestMode', 'true');

    localStorage.setItem('questionData', JSON.stringify({
        answers,
        healthScore,
        healthStatus
    }));

    localStorage.setItem('showHealthResult', 'true');

    localStorage.removeItem('questionAnswers');
    localStorage.removeItem('currentQuestion');
    localStorage.removeItem('registerData');

    window.location.href = 'index.html';
}
