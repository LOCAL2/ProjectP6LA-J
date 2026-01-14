const questions = [
    {
        id: 1,
        text: "1. โดยปกติคุณกินอาหารครบ วันละ 3 มื้อ หรือไม่",
        choices: [
            { text: "ครบทุกวัน", value: 3 },
            { text: "ไม่ครบทุกวัน", value: 1 }
        ]
    },
    {
        id: 2,
        text: "2. คุณกินผัก วันละอย่างน้อย 4 ทัพพี กี่วันต่อสัปดาห์",
        choices: [
            { text: "ไม่กินเลย", value: 0 },
            { text: "1–3 วัน/สัปดาห์", value: 1 },
            { text: "4–6 วัน/สัปดาห์", value: 2 },
            { text: "ทุกวัน", value: 3 }
        ]
    },
    {
        id: 3,
        text: "3. คุณกินผลไม้รสไม่หวาน (เช่น ฝรั่ง ชมพู่ แอปเปิลเขียว) หรือไม่",
        choices: [
            { text: "ไม่กินเลย", value: 0 },
            { text: "กินน้อย/ไม่สม่ำเสมอ", value: 1 },
            { text: "กินเป็นประจำ", value: 3 }
        ]
    },
    {
        id: 4,
        text: "4. เวลากินอาหาร คุณเติมน้ำปลา ซีอิ๊ว หรือเครื่องปรุงเค็ม หรือไม่",
        choices: [
            { text: "ไม่เติมเลย", value: 3 },
            { text: "เติมบางครั้ง", value: 1 },
            { text: "เติมทุกครั้ง", value: 0 }
        ]
    },
    {
        id: 5,
        text: "5. คุณเติมน้ำตาลในอาหารหรือเครื่องดื่มบ่อยแค่ไหน",
        choices: [
            { text: "ไม่เติมเลย", value: 3 },
            { text: "เติมบางครั้ง", value: 1 },
            { text: "เติมทุกครั้ง", value: 0 }
        ]
    },
    {
        id: 6,
        text: "6. ใน 1 สัปดาห์ คุณดื่มเครื่องดื่มรสหวาน (น้ำอัดลม ชานม น้ำหวาน) กี่วัน",
        choices: [
            { text: "ไม่ดื่มเลย", value: 3 },
            { text: "1–3 วัน/สัปดาห์", value: 1 },
            { text: "ดื่มบ่อย/ทุกวัน", value: 0 }
        ]
    }
];

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

    const savedAnswers = localStorage.getItem('questionAnswers');
    if (savedAnswers) {
        answers = JSON.parse(savedAnswers);
    }

    const savedQuestion = localStorage.getItem('currentQuestion');
    if (savedQuestion) {
        const savedIndex = parseInt(savedQuestion);
        if (savedIndex >= 0 && savedIndex < questions.length) {
            currentQuestion = savedIndex;
        } else {
            currentQuestion = 0;
            localStorage.removeItem('currentQuestion');
            localStorage.removeItem('questionAnswers');
        }
    }

    renderQuestion();
});

function renderQuestion() {
    const question = questions[currentQuestion];
    const totalSteps = 8;
    const currentStep = currentQuestion + 3;
    const percent = Math.round((currentStep / totalSteps) * 100);

    document.getElementById('progressPercent').textContent = percent + '%';
    document.getElementById('stepText').textContent = `step ${currentStep} of ${totalSteps}`;
    document.getElementById('progressFill').style.width = percent + '%';
    document.getElementById('questionTitle').textContent = question.text;
    selectedValue = null;

    const choicesContainer = document.getElementById('questionChoices');
    choicesContainer.innerHTML = '';

    question.choices.forEach((choice) => {
        const choiceBtn = document.createElement('button');
        choiceBtn.className = 'choice-btn';
        choiceBtn.innerHTML = `
            <span class="choice-circle"></span>
            <span class="choice-text">${choice.text}</span>
        `;
        choiceBtn.onclick = () => selectAnswer(choice.value, choiceBtn);
        choicesContainer.appendChild(choiceBtn);
    });

    const isLastQuestion = currentQuestion === questions.length - 1;
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

    const question = questions[currentQuestion];
    answers[`q${question.id}`] = selectedValue;

    localStorage.setItem('questionAnswers', JSON.stringify(answers));
    localStorage.setItem('currentQuestion', currentQuestion + 1);

    if (currentQuestion < questions.length - 1) {
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

    const maxScore = 18;
    const healthScore = Math.round((totalScore / maxScore) * 100);

    let healthStatus = '';
    if (healthScore >= 80) {
        healthStatus = 'สุขภาพดี';
    } else if (healthScore >= 50) {
        healthStatus = 'ควรปรับปรุง';
    } else {
        healthStatus = 'เสี่ยง';
    }

    localStorage.setItem('questionData', JSON.stringify({
        answers,
        healthScore,
        healthStatus
    }));

    localStorage.removeItem('questionAnswers');
    localStorage.removeItem('currentQuestion');

    window.location.href = 'signup.html';
}
