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

    // OTP input - auto focus and number only
    document.getElementById('otpInput').addEventListener('input', function(e) {
        this.value = this.value.replace(/[^0-9]/g, '');
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
    } catch {
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

    const registerData = JSON.parse(localStorage.getItem('registerData'));
    const questionData = JSON.parse(localStorage.getItem('questionData'));

    signupBtn.disabled = true;
    signupBtn.innerHTML = '<span>กำลังสมัคร...</span>';

    pendingSignupData = { email, username, password, registerData, questionData };

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

    if (authData.user && !authData.session) {
        showOTPForm();
    } else if (authData.session) {
        showSuccessState();
    }
}

function showOTPForm() {
    document.getElementById('signupFormCard').style.display = 'none';
    document.getElementById('otpFormCard').style.display = 'block';
    document.getElementById('successState').style.display = 'none';
    document.getElementById('otpEmailDisplay').textContent = pendingSignupData.email;
    document.getElementById('otpInput').value = '';
    document.getElementById('otpStatus').textContent = '';
    document.getElementById('otpInput').focus();
}

function backToSignup() {
    document.getElementById('signupFormCard').style.display = 'block';
    document.getElementById('otpFormCard').style.display = 'none';
    document.getElementById('successState').style.display = 'none';
    
    const signupBtn = document.getElementById('signupBtn');
    signupBtn.disabled = false;
    signupBtn.innerHTML = `<span>สมัครสมาชิก</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7"></path>
        </svg>`;
}

async function verifyOTP() {
    const otp = document.getElementById('otpInput').value.trim();
    const statusEl = document.getElementById('otpStatus');
    const verifyBtn = document.getElementById('verifyOtpBtn');

    statusEl.textContent = '';
    statusEl.className = 'input-status';

    if (!otp || otp.length < 6) {
        statusEl.textContent = 'กรุณากรอกรหัส OTP 6 หลัก';
        statusEl.className = 'input-status error';
        return;
    }

    if (!pendingSignupData) {
        statusEl.textContent = 'ไม่พบข้อมูลการสมัคร';
        statusEl.className = 'input-status error';
        return;
    }

    verifyBtn.disabled = true;
    verifyBtn.innerHTML = '<span>กำลังยืนยัน...</span>';

    const { error } = await supabase.auth.verifyOtp({
        email: pendingSignupData.email,
        token: otp,
        type: 'signup'
    });

    if (error) {
        verifyBtn.disabled = false;
        verifyBtn.innerHTML = `<span>ยืนยัน</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"></path>
            </svg>`;
        statusEl.textContent = 'รหัส OTP ไม่ถูกต้อง กรุณาลองใหม่';
        statusEl.className = 'input-status error';
        return;
    }

    showSuccessState();
}

function showSuccessState() {
    localStorage.removeItem('registerData');
    localStorage.removeItem('questionData');
    
    document.getElementById('signupFormCard').style.display = 'none';
    document.getElementById('otpFormCard').style.display = 'none';
    document.getElementById('successState').style.display = 'block';
    document.getElementById('welcomeUsername').textContent = `ยินดีต้อนรับ ${pendingSignupData.username}`;
    
    pendingSignupData = null;
}
