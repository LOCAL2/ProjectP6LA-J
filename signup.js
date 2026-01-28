let isUsernameAvailable = false;
let pendingSignupData = null;

document.addEventListener('DOMContentLoaded', function() {
    const registerData = JSON.parse(localStorage.getItem('registerData'));
    const questionData = JSON.parse(localStorage.getItem('questionData'));
    
    if (!registerData || !questionData) {
        Swal.fire({ icon: 'error', title: 'ไม่พบข้อมูล', text: 'กรุณาเริ่มลงทะเบียนใหม่' }).then(() => {
            window.location.href = 'register.html';
        });
        return;
    }

    document.getElementById('signupUsername').addEventListener('blur', checkUsername);
    document.getElementById('signupConfirmPassword').addEventListener('input', checkPasswordMatch);
    
    document.getElementById('signupForm').addEventListener('submit', function(e) {
        e.preventDefault();
        signup();
    });
});

function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        btn.classList.add('showing');
    } else {
        input.type = 'password';
        btn.classList.remove('showing');
    }
}

async function checkUsername() {
    const username = document.getElementById('signupUsername').value.trim();
    const statusEl = document.getElementById('usernameStatus');
    
    if (!username) {
        statusEl.textContent = '';
        isUsernameAvailable = false;
        return;
    }

    if (username.length < 3) {
        statusEl.textContent = 'Username ต้องมีอย่างน้อย 3 ตัวอักษร';
        statusEl.className = 'input-status error';
        isUsernameAvailable = false;
        return;
    }

    statusEl.textContent = 'กำลังตรวจสอบ...';
    statusEl.className = 'input-status checking';

    try {
        // ตรวจสอบว่า supabase พร้อมใช้งาน
        if (!supabase || !supabase.from) {
            statusEl.textContent = 'Username นี้สามารถใช้ได้';
            statusEl.className = 'input-status success';
            isUsernameAvailable = true;
            return;
        }

        const { data } = await supabase
            .from('users')
            .select('username')
            .eq('username', username)
            .maybeSingle();

        if (data) {
            statusEl.textContent = 'Username นี้ถูกใช้แล้ว';
            statusEl.className = 'input-status error';
            isUsernameAvailable = false;
        } else {
            statusEl.textContent = 'Username นี้สามารถใช้ได้';
            statusEl.className = 'input-status success';
            isUsernameAvailable = true;
        }
    } catch (error) {
        console.error('Username check error:', error);
        statusEl.textContent = 'Username นี้สามารถใช้ได้';
        statusEl.className = 'input-status success';
        isUsernameAvailable = true;
    }
}

function checkPasswordMatch() {
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    const statusEl = document.getElementById('passwordStatus');

    if (!confirmPassword) {
        statusEl.textContent = '';
        return;
    }

    if (password === confirmPassword) {
        statusEl.textContent = 'รหัสผ่านตรงกัน';
        statusEl.className = 'input-status success';
    } else {
        statusEl.textContent = 'รหัสผ่านไม่ตรงกัน';
        statusEl.className = 'input-status error';
    }
}

async function signup() {
    const email = document.getElementById('signupEmail').value.trim();
    const username = document.getElementById('signupUsername').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    const signupBtn = document.getElementById('signupBtn');

    if (!email || !username || !password || !confirmPassword) {
        Swal.fire({ icon: 'warning', title: 'กรุณากรอกข้อมูล', text: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
        return;
    }

    if (username.length < 3) {
        Swal.fire({ icon: 'warning', title: 'Username ไม่ถูกต้อง', text: 'Username ต้องมีอย่างน้อย 3 ตัวอักษร' });
        return;
    }

    if (password.length < 6) {
        Swal.fire({ icon: 'warning', title: 'รหัสผ่านสั้นเกินไป', text: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' });
        return;
    }

    if (password !== confirmPassword) {
        Swal.fire({ icon: 'error', title: 'รหัสผ่านไม่ตรงกัน', text: 'กรุณากรอกรหัสผ่านให้ตรงกัน' });
        return;
    }

    // ตรวจสอบว่า supabase พร้อมใช้งาน
    if (!supabase || !supabase.auth) {
        Swal.fire({ 
            icon: 'error', 
            title: 'เกิดข้อผิดพลาด', 
            text: 'ระบบไม่พร้อมใช้งาน กรุณาลองใหม่อีกครั้ง' 
        });
        return;
    }

    const registerData = JSON.parse(localStorage.getItem('registerData'));
    const questionData = JSON.parse(localStorage.getItem('questionData'));

    signupBtn.disabled = true;
    signupBtn.innerHTML = '<span>กำลังสมัคร...</span>';

    pendingSignupData = { email, username, password, registerData, questionData };

    try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username,
                    nickname: registerData.nickname,
                    gender: registerData.gender,
                    age: registerData.age,
                    birthdate: registerData.birthdate,
                    weight: registerData.weight,
                    height: registerData.height,
                    health_score: questionData.healthScore,
                    health_status: questionData.healthStatus,
                    answers: JSON.stringify(questionData.answers)
                }
            }
        });

        if (authError) {
            signupBtn.disabled = false;
            signupBtn.innerHTML = `<span>สมัครสมาชิก</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M5 12h14M12 5l7 7-7 7"></path>
                </svg>`;
            
            let errorMsg = authError.message;
            if (authError.message.includes('already registered')) {
                errorMsg = 'อีเมลนี้ถูกใช้งานแล้ว';
            }
            Swal.fire({ icon: 'error', title: 'สมัครสมาชิกไม่สำเร็จ', text: errorMsg });
            return;
        }

        if (authData.session) {
            // Direct redirect to main app - no confirmation needed
            window.location.href = 'index.html';
        } else {
            Swal.fire({ 
                icon: 'error', 
                title: 'สมัครสมาชิกไม่สำเร็จ', 
                text: 'ไม่สามารถสร้างเซสชันได้ กรุณาลองใหม่' 
            });
        }
    } catch (error) {
        console.error('Signup error:', error);
        signupBtn.disabled = false;
        signupBtn.innerHTML = `<span>สมัครสมาชิก</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"></path>
            </svg>`;
        Swal.fire({ 
            icon: 'error', 
            title: 'เกิดข้อผิดพลาด', 
            text: 'ไม่สามารถสมัครสมาชิกได้ กรุณาลองใหม่อีกครั้ง' 
        });
    }
}


