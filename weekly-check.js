// Weekly health check questions with 4 choices each
const weeklyHealthQuestions = [
    { 
        id: 1, 
        text: "สัปดาห์นี้คุณรู้สึกมีความสุขเป็นส่วนใหญ่หรือไม่?", 
        choices: ["มีความสุขเป็นส่วนใหญ่", "มีบ้างบางวัน", "เฉย ๆ ไม่ได้รู้สึกพิเศษ", "ไม่ค่อยมีความสุข"], 
        scores: [10, 7, 4, 0] 
    },
    { 
        id: 2, 
        text: "สัปดาห์นี้คุณนอนหลับพักผ่อนเพียงพอ (7-8 ชั่วโมงต่อคืน) สม่ำเสมอหรือไม่?", 
        choices: ["เพียงพอและสม่ำเสมอ", "เพียงพอบางวัน", "นอนไม่ถึง 7 ชั่วโมง", "พักผ่อนไม่เพียงพอเลย"], 
        scores: [10, 7, 4, 0] 
    },
    { 
        id: 3, 
        text: "สัปดาห์นี้ส่วนใหญ่คุณตื่นมาแล้วรู้สึกสดชื่นหรือไม่?", 
        choices: ["สดชื่นมาก", "สดชื่นเป็นบางวัน", "เฉย ๆ", "รู้สึกอ่อนเพลีย"], 
        scores: [10, 7, 4, 0] 
    },
    { 
        id: 4, 
        text: "สัปดาห์นี้คุณมีเรื่องเครียดหรือวิตกกังวลมากเกินไปหรือไม่?", 
        choices: ["ไม่มีเลย", "มีเล็กน้อย", "ค่อนข้างเครียด", "เครียดมาก"], 
        scores: [10, 7, 4, 0] 
    },
    { 
        id: 5, 
        text: "สัปดาห์นี้คุณสามารถงดเล่นมือถือหรือดูจอก่อนเข้านอนอย่างน้อย 30 นาทีได้เป็นส่วนใหญ่หรือไม่?", 
        choices: ["ทำได้สม่ำเสมอ", "ทำได้บางวัน", "ทำได้น้อยมาก", "ทำไม่ได้เลย"], 
        scores: [10, 7, 4, 0] 
    },
    { 
        id: 6, 
        text: "สัปดาห์นี้คุณกินผักหรือผลไม้เป็นประจำทุกวันหรือไม่?", 
        choices: ["กินทุกวัน", "เกือบทุกวัน", "กินบางวัน", "แทบไม่ได้กิน"], 
        scores: [10, 7, 4, 0] 
    },
    { 
        id: 7, 
        text: "สัปดาห์นี้คุณกินอาหารครบ 3 มื้อในแต่ละวันหรือไม่?", 
        choices: ["ครบทุกวัน", "ขาดบางมื้อ", "กินไม่ครบหลายวัน", "กินไม่เป็นเวลา"], 
        scores: [10, 7, 4, 0] 
    },
    { 
        id: 8, 
        text: "สัปดาห์นี้คุณดื่มน้ำเปล่าเพียงพอ (ประมาณ 2 ลิตรต่อวัน) สม่ำเสมอหรือไม่?", 
        choices: ["เพียงพอทุกวัน", "เพียงพอบางวัน", "ดื่มน้อยกว่าที่ควร", "แทบไม่ถึง 2 ลิตร"], 
        scores: [10, 7, 4, 0] 
    },
    { 
        id: 9, 
        text: "สัปดาห์นี้คุณทานของหวานหรือเครื่องดื่มที่มีน้ำตาลสูงบ่อยแค่ไหน?", 
        choices: ["ไม่ค่อยทาน", "สัปดาห์ละ 1–2 ครั้ง", "เกือบทุกวัน", "ทุกวัน"], 
        scores: [10, 7, 4, 0] 
    },
    { 
        id: 10, 
        text: "สัปดาห์นี้คุณดื่มเครื่องดื่มแอลกอฮอล์หรือไม่?", 
        choices: ["ไม่ดื่มเลย", "ดื่มเล็กน้อย", "ดื่ม 1–2 ครั้ง", "ดื่มหลายครั้ง"], 
        scores: [10, 7, 4, 0] 
    },
    { 
        id: 11, 
        text: "สัปดาห์นี้คุณมีการเดินหรือใช้บันไดแทนลิฟต์บ้างหรือไม่?", 
        choices: ["ทำเป็นประจำ", "ทำบางครั้ง", "นาน ๆ ครั้ง", "ไม่ได้ทำเลย"], 
        scores: [10, 7, 4, 0] 
    },
    { 
        id: 12, 
        text: "สัปดาห์นี้คุณได้ออกกำลังกายติดต่อกันอย่างน้อย 30 นาที (อย่างน้อย 3-5 วัน) หรือไม่?", 
        choices: ["ได้ครบตามเป้า", "ได้บางวัน", "ออกกำลังกายน้อย", "ไม่ได้ออกเลย"], 
        scores: [10, 7, 4, 0] 
    },
    { 
        id: 13, 
        text: "สัปดาห์นี้คุณมีการยืดเหยียดกล้ามเนื้อ (Stretching) ระหว่างสัปดาห์บ้างหรือไม่?", 
        choices: ["ทำเป็นประจำ", "ทำบางวัน", "ทำน้อยมาก", "ไม่ได้ทำเลย"], 
        scores: [10, 7, 4, 0] 
    },
    { 
        id: 14, 
        text: "สัปดาห์นี้คุณนั่งทำงานติดต่อกันนานเกิน 2 ชั่วโมงโดยไม่ลุกเดินบ่อยหรือไม่?", 
        choices: ["ไม่เกิน 2 ชั่วโมง", "บางครั้งเกิน", "เกินบ่อยครั้ง", "เกือบทุกวัน"], 
        scores: [10, 7, 4, 0] 
    },
    { 
        id: 15, 
        text: "สัปดาห์นี้คุณได้รับแสงแดดอ่อนๆ หรือได้ออกไปสูดอากาศข้างนอกบ้างหรือไม่?", 
        choices: ["ได้ทุกวัน", "ได้บางวัน", "ได้น้อยมาก", "ไม่ได้เลย"], 
        scores: [10, 7, 4, 0] 
    },
    { 
        id: 16, 
        text: "สัปดาห์นี้คุณสูบบุหรี่หรือไม่?", 
        choices: ["ไม่สูบ", "สูบบางครั้ง", "สูบเป็นประจำ", "สูบบ่อยมาก"], 
        scores: [10, 7, 4, 0] 
    },
    { 
        id: 17, 
        text: "สัปดาห์นี้ระบบขับถ่ายของคุณเป็นปกติสม่ำเสมอหรือไม่?", 
        choices: ["ปกติทุกวัน", "ปกติเป็นส่วนใหญ่", "มีปัญหาบ้าง", "ไม่สม่ำเสมอ"], 
        scores: [10, 7, 4, 0] 
    },
    { 
        id: 18, 
        text: "สัปดาห์นี้คุณมีการพักสายตาจากหน้าจอระหว่างวันสม่ำเสมอหรือไม่?", 
        choices: ["พักสม่ำเสมอ", "พักบางครั้ง", "พักน้อยมาก", "แทบไม่พักเลย"], 
        scores: [10, 7, 4, 0] 
    },
    { 
        id: 19, 
        text: "สัปดาห์นี้คุณทานยาหรือวิตามินตามที่กำหนดครบถ้วนหรือไม่?", 
        choices: ["ครบถ้วนสม่ำเสมอ", "ขาดบางวัน", "ลืมบ่อย", "ไม่ได้ทาน"], 
        scores: [10, 7, 4, 0] 
    },
    { 
        id: 20, 
        text: "สัปดาห์นี้คุณได้พูดคุยหรือทำกิจกรรมร่วมกับคนในครอบครัวหรือเพื่อนบ้างหรือไม่?", 
        choices: ["ได้ทำบ่อย", "ได้ทำบางครั้ง", "ได้น้อยมาก", "ไม่ได้เลย"], 
        scores: [10, 7, 4, 0] 
    }
];

let currentQuestion = 0;
let answers = {};
let selectedValue = null;

document.addEventListener('DOMContentLoaded', function() {
    renderQuestionNavigation();
    renderQuestion();
    
    // Add keyboard event listener for Enter key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' && selectedValue !== null) {
            goToNext();
        }
    });
});

function renderQuestionNavigation() {
    const navContainer = document.getElementById('questionNavScroll');
    navContainer.innerHTML = '';
    
    weeklyHealthQuestions.forEach((question, index) => {
        const navItem = document.createElement('button');
        navItem.className = 'question-nav-item';
        navItem.textContent = index + 1;
        navItem.onclick = () => goToQuestion(index);
        
        // Mark as active if current question
        if (index === currentQuestion) {
            navItem.classList.add('active');
        }
        
        // Mark as completed if answered
        if (answers[`q${question.id}`] !== undefined) {
            navItem.classList.add('completed');
        }
        
        navContainer.appendChild(navItem);
    });
    
    // Scroll to active question
    scrollToActiveQuestion();
}

function scrollToActiveQuestion() {
    const activeItem = document.querySelector('.question-nav-item.active');
    if (activeItem) {
        activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
}

function goToQuestion(index) {
    if (index >= 0 && index < weeklyHealthQuestions.length) {
        currentQuestion = index;
        renderQuestionNavigation();
        renderQuestion();
    }
}

function renderQuestion() {
    const question = weeklyHealthQuestions[currentQuestion];
    const totalSteps = 20;
    const currentStep = currentQuestion + 1;
    const percent = Math.round((currentStep / totalSteps) * 100);

    document.getElementById('progressPercent').textContent = percent + '%';
    document.getElementById('stepText').textContent = `step ${currentStep} of ${totalSteps}`;
    document.getElementById('progressFill').style.width = percent + '%';
    document.getElementById('questionTitle').textContent = question.text;
    selectedValue = null;

    const choicesContainer = document.getElementById('questionChoices');
    choicesContainer.innerHTML = '';

    // Create choice buttons
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

    // Check if this question was already answered
    const savedAnswer = answers[`q${question.id}`];
    if (savedAnswer !== undefined) {
        const choiceBtns = document.querySelectorAll('.choice-btn');
        const answerIndex = question.scores.indexOf(savedAnswer);
        if (answerIndex !== -1 && choiceBtns[answerIndex]) {
            choiceBtns[answerIndex].classList.add('selected');
            selectedValue = savedAnswer;
            document.getElementById('nextBtn').disabled = false;
        }
    }

    const isLastQuestion = currentQuestion === weeklyHealthQuestions.length - 1;
    document.getElementById('nextBtn').textContent = isLastQuestion ? 'เสร็จสิ้น' : 'ข้อถัดไป';
    
    if (selectedValue === null) {
        document.getElementById('nextBtn').disabled = true;
    }
    
    // Update navigation bar
    renderQuestionNavigation();
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

    const question = weeklyHealthQuestions[currentQuestion];
    answers[`q${question.id}`] = selectedValue;

    if (currentQuestion < weeklyHealthQuestions.length - 1) {
        currentQuestion++;
        renderQuestion();
    } else {
        // Check if all questions are answered before finishing
        checkAndFinish();
    }
}

function checkAndFinish() {
    const unansweredQuestions = [];
    
    weeklyHealthQuestions.forEach((question, index) => {
        if (answers[`q${question.id}`] === undefined) {
            unansweredQuestions.push(index + 1);
        }
    });
    
    if (unansweredQuestions.length > 0) {
        Swal.fire({
            icon: 'warning',
            title: 'ยังตอบไม่ครบ',
            html: `คุณยังไม่ได้ตอบคำถามข้อที่: <strong>${unansweredQuestions.join(', ')}</strong><br><br>กรุณาตอบให้ครบทุกข้อก่อนเสร็จสิ้น`,
            confirmButtonText: 'ตกลง'
        });
    } else {
        finishWeeklyCheck();
    }
}

async function finishWeeklyCheck() {
    let totalScore = 0;
    for (let key in answers) {
        totalScore += parseInt(answers[key]);
    }

    const maxScore = 200; // 20 questions * 10 points each
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

    // Save weekly check data
    const weeklyCheckData = {
        answers,
        healthScore,
        healthStatus,
        date: new Date().toISOString()
    };

    localStorage.setItem('weeklyCheckData', JSON.stringify(weeklyCheckData));
    localStorage.setItem('showHealthResult', 'true');

    // Redirect back to main app (will show modal there)
    window.location.href = 'index.html';
}
