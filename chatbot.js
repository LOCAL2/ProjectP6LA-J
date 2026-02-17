// Chatbot configuration
const WEBSITE_INFO = `
คุณเป็นผู้ช่วยด้านสุขภาพชื่อ "Healthy Assistant" ของเว็บไซต์ "Healthy By Myself"

⚠️ กฎสำคัญ:
1. ตอบได้เฉพาะเรื่องสุขภาพและการใช้งานเว็บไซต์เท่านั้น
2. ห้ามตอบเรื่องอื่น (โปรแกรม, เกม, การเมือง, etc.)
3. ถ้าถามเรื่องอื่น ตอบว่า "ขอโทษครับ ผมตอบได้เฉพาะเรื่องสุขภาพครับ 😊"

📝 รูปแบบการตอบ (สำคัญมาก):
- ตอบเป็นข้อๆ โดยใช้ตัวเลข 1. 2. 3. หรือ • 
- แต่ละข้อขึ้นบรรทัดใหม่
- ตอบสั้นๆ 3-5 ข้อ
- ใช้ emoji 1-2 ตัว

ตัวอย่างการตอบที่ดี:
"เลิกบุหรี่ทำได้ดังนี้ครับ 💪

1. ลดจำนวนมวนลงทีละน้อย
2. หาอะไรทดแทน เช่น หมากฝรั่ง
3. หลีกเลี่ยงสถานการณ์ที่อยากสูบ
4. หาคนคอยให้กำลังใจ

สู้ๆ นะครับ! 😊"
`;

const SUGGESTED_QUESTIONS = [
    'เว็บนี้ใช้ทำอะไร?',
    'วิธีดูแลสุขภาพ?',
    'ลดน้ำหนักยังไงดี?',
    'เลิกบุหรี่ยังไง?'
];

let chatHistory = [];
let isChatOpen = false;

function createChatModal() {
    const modal = document.createElement('div');
    modal.id = 'chatModal';
    modal.className = 'chat-modal';
    modal.innerHTML = `
        <div class="chat-container">
            <div class="chat-header">
                <div class="chat-header-info">
                    <div class="chat-avatar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                    </div>
                    <div>
                        <h3>Healthy Assistant</h3>
                        <span class="chat-status">ออนไลน์</span>
                    </div>
                </div>
                <button class="chat-close" onclick="toggleChat()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div class="chat-messages" id="chatMessages">
                <div class="chat-welcome">
                    <p>สวัสดีครับ! 👋</p>
                    <p>ผมเป็นผู้ช่วยของ Healthy By Myself</p>
                    <p>มีอะไรให้ช่วยไหมครับ?</p>
                </div>
                <div class="suggested-questions">
                    ${SUGGESTED_QUESTIONS.map(q => `<button class="suggest-btn" onclick="askQuestion('${q}')">${q}</button>`).join('')}
                </div>
            </div>
            <div class="chat-input-area">
                <input type="text" id="chatInput" placeholder="พิมพ์ข้อความ..." onkeypress="handleKeyPress(event)">
                <button class="chat-send" onclick="sendMessage()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function toggleChat() {
    const modal = document.getElementById('chatModal');
    if (!modal) {
        createChatModal();
    }
    
    const chatModal = document.getElementById('chatModal');
    isChatOpen = !isChatOpen;
    chatModal.classList.toggle('open', isChatOpen);
    
    if (isChatOpen) {
        document.getElementById('chatInput').focus();
    }
}

function askQuestion(question) {
    document.getElementById('chatInput').value = question;
    sendMessage();
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

async function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    addMessage(message, 'user');
    input.value = '';
    
    showTyping();
    
    try {
        const response = await callGroqAPI(message);
        hideTyping();
        addMessage(response, 'bot');
    } catch (error) {
        hideTyping();
        addMessage('ขอโทษครับ เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง', 'bot');
    }
}

function getCurrentDateInfo() {
    const now = new Date();
    const thaiDays = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
    const thaiMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 
                       'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
    
    const dayName = thaiDays[now.getDay()];
    const date = now.getDate();
    const month = thaiMonths[now.getMonth()];
    const year = now.getFullYear() + 543;
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    
    return `สัปดาห์นี้คือวัน${dayName}ที่ ${date} ${month} พ.ศ. ${year} เวลา ${hours}:${minutes} น.`;
}

async function callGroqAPI(userMessage) {
    chatHistory.push({ role: 'user', content: userMessage });
    
    const systemPrompt = WEBSITE_INFO + `\n\nข้อมูลวันที่และเวลาปัจจุบัน: ${getCurrentDateInfo()}\nถ้าผู้ใช้ถามเรื่องวันที่ เวลา หรือสัปดาห์นี้วันอะไร ให้ตอบจากข้อมูลนี้`;
    
    const messages = [
        { role: 'system', content: systemPrompt },
        ...chatHistory.slice(-10)
    ];
    
    const apiKey = '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';
    
    // console.log('Chatbot API Key check:', apiKey ? `Key found (${apiKey.substring(0, 10)}...)` : 'No key');
    
    // ถ้าไม่มี API key หรือไม่ถูกต้อง ใช้ fallback
    if (!apiKey || apiKey.length < 20) {
        console.log('No valid GROQ API key for chatbot, using fallback');
        return getChatbotFallbackResponse(userMessage);
    }
    
    try {
        // เรียก GROQ API
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: messages,
                temperature: 0.5,
                max_tokens: 500
            })
        });

        if (!response.ok) {
            console.log('Chatbot API request failed, using fallback');
            return getChatbotFallbackResponse(userMessage);
        }

        const data = await response.json();
        const botMessage = data.choices[0].message.content;
        
        chatHistory.push({ role: 'assistant', content: botMessage });
        
        return botMessage;
    } catch (error) {
        console.error('Error calling GROQ API for chatbot:', error);
        return getChatbotFallbackResponse(userMessage);
    }
}

// Fallback responses for chatbot
function getChatbotFallbackResponse(userMessage) {
    const msg = userMessage.toLowerCase();
    
    if (msg.includes('เว็บ') || msg.includes('ใช้') || msg.includes('ทำอะไร')) {
        return `เว็บไซต์นี้ช่วยคุณดูแลสุขภาพครับ 🏥

1. บันทึกสุขภาพรายสัปดาห์
2. ตรวจสอบคะแนนสุขภาพ
3. ดูสถิติและกราฟ
4. รับคำแนะนำจาก AI

ลองเริ่มใช้งานได้เลยครับ! 😊`;
    }
    
    if (msg.includes('ลดน้ำหนัก') || msg.includes('ผอม')) {
        return `วิธีลดน้ำหนักที่ดี 💪

1. กินอาหารครบ 5 หมู่ แต่ลดปริมาณ
2. ออกกำลังกายสม่ำเสมอ 30 นาที/วัน
3. ดื่มน้ำเปล่าเยอะๆ
4. นอนหลับพักผ่อนให้เพียงพอ
5. หลีกเลี่ยงของหวานและทอด

ค่อยๆ ทำไปนะครับ! 😊`;
    }
    
    if (msg.includes('บุหรี่') || msg.includes('เลิกสูบ')) {
        return `เลิกบุหรี่ทำได้ดังนี้ครับ 💪

1. ลดจำนวนมวนลงทีละน้อย
2. หาอะไรทดแทน เช่น หมากฝรั่ง
3. หลีกเลี่ยงสถานการณ์ที่อยากสูบ
4. หาคนคอยให้กำลังใจ
5. ปรึกษาแพทย์ถ้าจำเป็น

สู้ๆ นะครับ! 😊`;
    }
    
    if (msg.includes('ออกกำลัง') || msg.includes('exercise')) {
        return `แนะนำการออกกำลังกายครับ 🏃

1. เริ่มจากเดินเร็ว 20-30 นาที
2. ค่อยๆ เพิ่มเป็นวิ่งเบาๆ
3. ยืดเหยียดก่อนและหลังออกกำลัง
4. ทำสัปดาห์ละ 3-5 วัน
5. ฟังร่างกายตัวเอง

เริ่มได้เลยครับ! 💪`;
    }
    
    if (msg.includes('นอน') || msg.includes('หลับ')) {
        return `เคล็ดลับนอนหลับดี 😴

1. นอนและตื่นเวลาเดิมทุกวัน
2. หลีกเลี่ยงหน้าจอก่อนนอน 1 ชม.
3. ห้องนอนมืดและเย็นสบาย
4. ไม่กินอาหารหนักก่อนนอน
5. ผ่อนคลายด้วยการอ่านหนังสือ

ฝันดีนะครับ! 🌙`;
    }
    
    // Default response
    return `ขอบคุณที่ถามครับ! 😊

ผมตอบได้เรื่อง:
• การใช้งานเว็บไซต์
• การดูแลสุขภาพ
• การออกกำลังกาย
• การลดน้ำหนัก
• การเลิกบุหรี่

มีอะไรให้ช่วยไหมครับ?`;
}

function formatMessage(text) {
    let formatted = text.replace(/\n/g, '<br>');
    formatted = formatted.replace(/(<br>){3,}/g, '<br><br>');
    formatted = formatted.replace(/^(<br>)+/, '');
    return formatted;
}

function addMessage(text, sender) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    const formattedText = sender === 'bot' ? formatMessage(text) : text;
    messageDiv.innerHTML = `<div class="message-bubble">${formattedText}</div>`;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showTyping() {
    const messagesContainer = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typingIndicator';
    typingDiv.className = 'chat-message bot';
    typingDiv.innerHTML = `
        <div class="message-bubble typing">
            <span></span><span></span><span></span>
        </div>
    `;
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function hideTyping() {
    const typing = document.getElementById('typingIndicator');
    if (typing) typing.remove();
}

document.addEventListener('DOMContentLoaded', function() {
    const chatbotBtns = document.querySelectorAll('.chatbot-btn');
    chatbotBtns.forEach(btn => {
        btn.onclick = toggleChat;
        btn.style.cursor = 'pointer';
    });
});
