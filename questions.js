// All 20 health questions
const allHealthQuestions = [
    { id: 1, text: "สัปดาห์นี้คุณรู้สึกมีความสุขเป็นส่วนใหญ่หรือไม่?", choices: ["ใช่", "บางครั้ง", "ไม่"], scores: [10, 5, 0] },
    { id: 2, text: "สัปดาห์นี้คุณนอนหลับพักผ่อนเพียงพอ (7-8 ชั่วโมงต่อคืน) สม่ำเสมอหรือไม่?", choices: ["ใช่", "บางครั้ง", "ไม่"], scores: [10, 5, 0] },
    { id: 3, text: "สัปดาห์นี้ส่วนใหญ่คุณตื่นมาแล้วรู้สึกสดชื่นหรือไม่?", choices: ["ใช่", "บางครั้ง", "ไม่"], scores: [10, 5, 0] },
    { id: 4, text: "สัปดาห์นี้คุณมีเรื่องเครียดหรือวิตกกังวลมากเกินไปหรือไม่?", choices: ["ไม่", "บางครั้ง", "ใช่"], scores: [10, 5, 0] },
    { id: 5, text: "สัปดาห์นี้คุณสามารถงดเล่นมือถือหรือดูจอก่อนเข้านอนอย่างน้อย 30 นาทีได้เป็นส่วนใหญ่หรือไม่?", choices: ["ใช่", "บางครั้ง", "ไม่"], scores: [10, 5, 0] },
    { id: 6, text: "สัปดาห์นี้คุณกินผักหรือผลไม้เป็นประจำทุกวันหรือไม่?", choices: ["ใช่", "บางครั้ง", "ไม่"], scores: [10, 5, 0] },
    { id: 7, text: "สัปดาห์นี้คุณกินอาหารครบ 3 มื้อในแต่ละวันหรือไม่?", choices: ["ใช่", "บางครั้ง", "ไม่"], scores: [10, 5, 0] },
    { id: 8, text: "สัปดาห์นี้คุณดื่มน้ำเปล่าเพียงพอ (ประมาณ 2 ลิตรต่อวัน) สม่ำเสมอหรือไม่?", choices: ["ใช่", "บางครั้ง", "ไม่"], scores: [10, 5, 0] },
    { id: 9, text: "สัปดาห์นี้คุณทานของหวานหรือเครื่องดื่มที่มีน้ำตาลสูงบ่อยแค่ไหน?", choices: ["เลี่ยงได้", "บางครั้ง", "บ่อย"], scores: [10, 5, 0] },
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

// Function to shuffle all 20 questions (different order for each person)
function shuffleAllQuestions() {
    const shuffled = [...allHealthQuestions].sort(() => Math.random() - 0.5);
    return shuffled;
}

let selectedQuestions = [];
let currentQuestion = 0;
let answers = {};
let selectedValue = null;

document.addEventListener('DOMContentLoaded', function() {
    const registerData = JSON.parse(localStorage.getItem('registerData'));
    
    if (!registerData) {
        Swal.fire({ icon: 'error', title: 'ไม่พบข้อมูล', text: 'กรุณาเริ่มลงทะเบียนใหม่' }).then(() => {
            window.location.href = 'register.html';
        });
        return;
    }

    // Shuffle all 20 questions
    selectedQuestions = shuffleAllQuestions();
    
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
    
    // Add keyboard event listener for Enter key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' && selectedValue !== null) {
            goToNext();
        }
    });
});

function renderQuestion() {
    const question = selectedQuestions[currentQuestion];
    const totalSteps = 23; // 3 register steps + 20 questions
    const currentStep = currentQuestion + 4; // Start from step 4 (after 3 register steps)
    const percent = Math.round((currentStep / totalSteps) * 100);

    document.getElementById('progressPercent').textContent = percent + '%';
    document.getElementById('stepText').textContent = `step ${currentStep} of ${totalSteps}`;
    document.getElementById('progressFill').style.width = percent + '%';
    document.getElementById('questionTitle').textContent = question.text;
    selectedValue = null;

    const choicesContainer = document.getElementById('questionChoices');
    choicesContainer.innerHTML = '';

    // Create choice buttons from the new format
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

    // Create guest user automatically
    const registerData = JSON.parse(localStorage.getItem('registerData') || '{}');
    const guestId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
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

    // Save guest data
    localStorage.setItem('guest_user_data', JSON.stringify(guestData));
    localStorage.setItem('guestMode', 'true');

    // Save question data
    localStorage.setItem('questionData', JSON.stringify({
        answers,
        healthScore,
        healthStatus
    }));

    // Set flag to show result modal and switch to stats tab
    localStorage.setItem('showHealthResult', 'true');

    localStorage.removeItem('questionAnswers');
    localStorage.removeItem('currentQuestion');
    localStorage.removeItem('registerData');

    window.location.href = 'index.html';
}
