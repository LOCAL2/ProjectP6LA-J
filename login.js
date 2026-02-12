async function login() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!username || !password) {
        Swal.fire({ icon: 'warning', title: 'กรุณากรอกข้อมูล', text: 'กรุณากรอก Username และ Password' });
        return;
    }

    // ตรวจสอบว่า supabase พร้อมใช้งาน
    const supabase = window.supabaseClient;
    if (!supabase || !supabase.from) {
        Swal.fire({ 
            icon: 'error', 
            title: 'เกิดข้อผิดพลาด', 
            text: 'ระบบฐานข้อมูลไม่พร้อมใช้งาน กรุณาลองใหม่อีกครั้ง' 
        });
        return;
    }

    Swal.fire({ title: 'กำลังเข้าสู่ระบบ...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    try {
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('email')
            .eq('username', username)
            .maybeSingle();

        if (userError || !userData) {
            Swal.fire({ icon: 'error', title: 'ไม่พบผู้ใช้', text: 'ไม่พบ username นี้ในระบบ' });
            return;
        }

        const { data, error } = await supabase.auth.signInWithPassword({ 
            email: userData.email, 
            password: password 
        });

        if (error) {
            let errorMessage = error.message;
            if (error.message.includes('Invalid login credentials')) {
                errorMessage = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
            } else if (error.message.includes('Email not confirmed')) {
                errorMessage = 'กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ';
            } else if (error.message.includes('Email logins are disabled')) {
                errorMessage = 'ระบบ login ยังไม่เปิดใช้งาน';
            }
            Swal.fire({ icon: 'error', title: 'เข้าสู่ระบบไม่สำเร็จ', text: errorMessage });
            return;
        }

        // Clear guest mode data on successful login
        localStorage.removeItem('guestMode');
        localStorage.removeItem('guest_user_data');

        Swal.fire({ icon: 'success', title: 'เข้าสู่ระบบสำเร็จ!', timer: 1500, showConfirmButton: false }).then(() => {
            window.location.href = 'index.html';
        });
    } catch (error) {
        console.error('Login error:', error);
        Swal.fire({ 
            icon: 'error', 
            title: 'เกิดข้อผิดพลาด', 
            text: 'ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง' 
        });
    }
}

function showForgotPassword() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('forgotPasswordForm').style.display = 'block';
    document.getElementById('emailSentSuccess').style.display = 'none';
    document.getElementById('forgotEmail').value = '';
    document.getElementById('forgotEmailStatus').textContent = '';
}

function showLoginForm() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('forgotPasswordForm').style.display = 'none';
    document.getElementById('emailSentSuccess').style.display = 'none';
}

async function sendResetEmail() {
    const email = document.getElementById('forgotEmail').value.trim();
    const statusEl = document.getElementById('forgotEmailStatus');
    const sendBtn = document.getElementById('sendResetBtn');

    statusEl.textContent = '';
    statusEl.className = 'input-status';

    if (!email) {
        statusEl.textContent = 'กรุณากรอกอีเมล';
        statusEl.className = 'input-status error';
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        statusEl.textContent = 'รูปแบบอีเมลไม่ถูกต้อง';
        statusEl.className = 'input-status error';
        return;
    }

    sendBtn.disabled = true;
    sendBtn.textContent = 'กำลังส่ง...';

    try {
        const supabase = window.supabaseClient;
        const redirectUrl = window.location.origin + '/reset-password.html';
        
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: redirectUrl
        });
        
        if (error) {
            sendBtn.disabled = false;
            sendBtn.textContent = 'ส่งลิงก์รีเซ็ต';
            statusEl.textContent = error.message;
            statusEl.className = 'input-status error';
        } else {
            document.getElementById('forgotPasswordForm').style.display = 'none';
            document.getElementById('emailSentSuccess').style.display = 'block';
            document.getElementById('sentEmailDisplay').textContent = email;
        }
    } catch (error) {
        console.error('Reset password error:', error);
        sendBtn.disabled = false;
        sendBtn.textContent = 'ส่งลิงก์รีเซ็ต';
        statusEl.textContent = 'ไม่สามารถส่งอีเมลได้ กรุณาลองใหม่อีกครั้ง';
        statusEl.className = 'input-status error';
    }
}

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
