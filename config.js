var SUPABASE_URL = 'https://ekbmxftmujfzkobyiyvk.supabase.co';
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrYm14ZnRtdWpmemtvYnlpeXZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNDY4MjQsImV4cCI6MjA4MTgyMjgyNH0.NZaOQQCo270sDkatM8sY_BZQOnUrIan6gAsnRVQog6I';

// GROQ API Keys - ระบบจะสลับไปใช้ key ถัดไปอัตโนมัติถ้า key ปัจจุบันมีปัญหา
var GROQ_API_KEYS = [
    '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',
    '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',
    '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',
    // เพิ่ม API key อื่นๆ ได้ที่นี่
    // 'gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    // 'gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
];

// ระบบจัดการ API Key แบบ Fallback
var GroqAPI = {
    currentIndex: 0,
    failedKeys: new Set(),
    
    // ดึง key ที่ใช้งานได้
    getKey: function() {
        if (this.failedKeys.size >= GROQ_API_KEYS.length) {
            this.failedKeys.clear();
            this.currentIndex = 0;
        }
        
        let attempts = 0;
        while (attempts < GROQ_API_KEYS.length) {
            if (!this.failedKeys.has(this.currentIndex)) {
                return GROQ_API_KEYS[this.currentIndex];
            }
            this.currentIndex = (this.currentIndex + 1) % GROQ_API_KEYS.length;
            attempts++;
        }
        return GROQ_API_KEYS[0];
    },
    
    // เรียกเมื่อ key ปัจจุบัน fail
    markFailed: function() {
        this.failedKeys.add(this.currentIndex);
        this.currentIndex = (this.currentIndex + 1) % GROQ_API_KEYS.length;
        console.log(`GROQ API Key #${this.currentIndex} failed, switching to next key...`);
    },
    
    // เรียก API พร้อม auto-retry ด้วย key อื่น
    call: async function(options) {
        const maxRetries = GROQ_API_KEYS.length;
        let lastError = null;
        
        for (let i = 0; i < maxRetries; i++) {
            const apiKey = this.getKey();
            
            try {
                const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({
                        model: options.model || 'llama-3.1-8b-instant',
                        messages: options.messages,
                        max_tokens: options.max_tokens || 500,
                        temperature: options.temperature || 0.7
                    })
                });
                
                if (response.status === 429 || response.status === 401 || response.status === 403) {
                    this.markFailed();
                    lastError = new Error(`API Error: ${response.status}`);
                    continue;
                }
                
                if (!response.ok) {
                    throw new Error(`API Error: ${response.status}`);
                }
                
                return await response.json();
                
            } catch (error) {
                lastError = error;
                if (i < maxRetries - 1) {
                    this.markFailed();
                }
            }
        }
        
        throw lastError || new Error('All API keys failed');
    }
};

// สำหรับ backward compatibility
var GROQ_API_KEY = GROQ_API_KEYS[0];

if (typeof supabaseClient === 'undefined') {
    var supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
var supabase = supabaseClient;
