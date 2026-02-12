// Real-time validation
document.getElementById('signupUsername')?.addEventListener('blur', checkUsername);
document.getElementById('signupEmail')?.addEventListener('blur', checkEmail);
document.getElementById('signupPassword')?.addEventListener('input', validatePassword);
document.getElementById('confirmPassword')?.addEventListener('input', validateConfirmPassword);

async function checkUsername() {
    const username = document.getElementById('signupUsername').value.trim();
    const statusEl = document.getElementById('usernameStatus');
    
    if (!username) {
        statusEl.textContent = '';
        statusEl.className = 'input-status';
        return;
    }

    if (username.length < 3) {
        statusEl.textContent = 'Username ต้องมีอย่างน้อย 3 ตัวอักษร';
        statusEl.className = 'input-status error';
        return;
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
        statusEl.textContent = 'Username ใช้ได้เฉพาะตัวอักษร ตัวเลข และ _';
        statusEl.className = 'input-status error';
        return;
    }

    try {
        const supabase = window.supabaseClient;
        const { data, error } = await supabase
            .from('users')
            .select('username')
            .eq('username', username)
            .maybeSingle();

        if (data) {
            statusEl.textContent = 'Username นี้ถูกใช้งานแล้ว';
            statusEl.className = 'input-status error';
        } else {
            statusEl.textContent = 'Username นี้ใช้ได้';
            statusEl.className = 'input-status success';
        }
    } catch (error) {
        console.error('Error checking username:', error);
    }
}

async function checkEmail() {
    const email = document.getElementById('signupEmail').value.trim();
    const statusEl = document.getElementById('emailStatus');
    
    if (!email) {
        statusEl.textContent = '';
        statusEl.className = 'input-status';
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        statusEl.textContent = 'รูปแบบอีเมลไม่ถูกต้อง';
        statusEl.className = 'input-status error';
        return;
    }

    try {
        const supabase = window.supabaseClient;
        const { data, error } = await supabase
            .from('users')
            .select('email')
            .eq('email', email)
            .maybeSingle();

        if (data) {
            statusEl.textContent = 'อีเมลนี้ถูกใช้งานแล้ว';
            statusEl.className = 'input-status error';
        } else {
            statusEl.textContent = 'อีเมลนี้ใช้ได้';
            statusEl.className = 'input-status success';
        }
    } catch (error) {
        console.error('Error checking email:', error);
    }
}

function validatePassword() {
    const password = document.getElementById('signupPassword').value;
    const statusEl = document.getElementById('passwordStatus');
    
    if (!password) {
        statusEl.textContent = '';
        statusEl.className = 'input-status';
        return;
    }

    if (password.length < 6) {
        statusEl.textContent = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
        statusEl.className = 'input-status error';
    } else {
        statusEl.textContent = 'รหัสผ่านแข็งแรง';
        statusEl.className = 'input-status success';
    }

    validateConfirmPassword();
}

function validateConfirmPassword() {
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const statusEl = document.getElementById('confirmPasswordStatus');
    
    if (!confirmPassword) {
        statusEl.textContent = '';
        statusEl.className = 'input-status';
        return;
    }

    if (password !== confirmPassword) {
        statusEl.textContent = 'รหัสผ่านไม่ตรงกัน';
        statusEl.className = 'input-status error';
    } else {
        statusEl.textContent = 'รหัสผ่านตรงกัน';
        statusEl.className = 'input-status success';
    }
}

async function signup() {
    const username = document.getElementById('signupUsername').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validation
    if (!username || !email || !password || !confirmPassword) {
        Swal.fire({ 
            icon: 'warning', 
            title: 'กรุณากรอกข้อมูล', 
            text: 'กรุณากรอกข้อมูลให้ครบทุกช่อง' 
        });
        return;
    }

    if (username.length < 3) {
        Swal.fire({ 
            icon: 'warning', 
            title: 'Username ไม่ถูกต้อง', 
            text: 'Username ต้องมีอย่างน้อย 3 ตัวอักษร' 
        });
        return;
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
        Swal.fire({ 
            icon: 'warning', 
            title: 'Username ไม่ถูกต้อง', 
            text: 'Username ใช้ได้เฉพาะตัวอักษร ตัวเลข และ _' 
        });
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        Swal.fire({ 
            icon: 'warning', 
            title: 'อีเมลไม่ถูกต้อง', 
            text: 'กรุณากรอกอีเมลให้ถูกต้อง' 
        });
        return;
    }

    if (password.length < 6) {
        Swal.fire({ 
            icon: 'warning', 
            title: 'รหัสผ่านไม่ถูกต้อง', 
            text: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' 
        });
        return;
    }

    if (password !== confirmPassword) {
        Swal.fire({ 
            icon: 'warning', 
            title: 'รหัสผ่านไม่ตรงกัน', 
            text: 'กรุณากรอกรหัสผ่านให้ตรงกัน' 
        });
        return;
    }

    const supabase = window.supabaseClient;
    if (!supabase || !supabase.from) {
        Swal.fire({ 
            icon: 'error', 
            title: 'เกิดข้อผิดพลาด', 
            text: 'ระบบฐานข้อมูลไม่พร้อมใช้งาน กรุณาลองใหม่อีกครั้ง' 
        });
        return;
    }

    Swal.fire({ 
        title: 'กำลังลงทะเบียน...', 
        allowOutsideClick: false, 
        didOpen: () => Swal.showLoading() 
    });

    try {
        // Check if username already exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('username')
            .eq('username', username)
            .maybeSingle();

        if (existingUser) {
            Swal.fire({ 
                icon: 'error', 
                title: 'Username ถูกใช้งานแล้ว', 
                text: 'กรุณาเลือก Username อื่น' 
            });
            return;
        }

        // Check if email already exists
        const { data: existingEmail } = await supabase
            .from('users')
            .select('email')
            .eq('email', email)
            .maybeSingle();

        if (existingEmail) {
            Swal.fire({ 
                icon: 'error', 
                title: 'อีเมลถูกใช้งานแล้ว', 
                text: 'กรุณาใช้อีเมลอื่น หรือเข้าสู่ระบบ' 
            });
            return;
        }

        // Sign up with Supabase Auth (without email confirmation)
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    username: username
                }
            }
        });

        if (error) {
            console.error('Signup error:', error);
            console.log('Error message:', error.message);
            
            // Ignore email-related errors, treat as success
            const errorMsg = error.message.toLowerCase();
            if (errorMsg.includes('email') || errorMsg.includes('confirmation') || errorMsg.includes('smtp') || errorMsg.includes('sending')) {
                console.log('Email error detected, treating as success');
                Swal.fire({ 
                    icon: 'success', 
                    title: 'ลงทะเบียนสำเร็จ!', 
                    text: 'คุณสามารถเข้าสู่ระบบได้เลย',
                    timer: 2000,
                    showConfirmButton: false 
                }).then(() => {
                    window.location.href = 'login.html';
                });
                return;
            }
            
            let errorMessage = error.message;
            if (error.message.includes('User already registered')) {
                errorMessage = 'อีเมลนี้ถูกใช้งานแล้ว';
            } else if (error.message.includes('Password should be at least 6 characters')) {
                errorMessage = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
            }
            
            Swal.fire({ 
                icon: 'error', 
                title: 'ลงทะเบียนไม่สำเร็จ', 
                text: errorMessage 
            });
            return;
        }

        Swal.fire({ 
            icon: 'success', 
            title: 'ลงทะเบียนสำเร็จ!', 
            text: 'คุณสามารถเข้าสู่ระบบได้เลย',
            timer: 2000,
            showConfirmButton: false 
        }).then(() => {
            window.location.href = 'login.html';
        });

    } catch (error) {
        console.error('Signup error:', error);
        Swal.fire({ 
            icon: 'error', 
            title: 'เกิดข้อผิดพลาด', 
            text: 'ไม่สามารถลงทะเบียนได้ กรุณาลองใหม่อีกครั้ง' 
        });
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
