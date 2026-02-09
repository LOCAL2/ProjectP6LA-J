document.addEventListener('DOMContentLoaded', async function() {
    try {
        // ตรวจสอบว่า supabase พร้อมใช้งาน
        const supabase = window.supabaseClient;
        if (!supabase || !supabase.auth) {
            document.getElementById('errorState').style.display = 'block';
            document.getElementById('resetFormCard').style.display = 'none';
            document.getElementById('successState').style.display = 'none';
            return;
        }

        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
            document.getElementById('errorState').style.display = 'block';
            document.getElementById('resetFormCard').style.display = 'none';
            document.getElementById('successState').style.display = 'none';
            return;
        }

        document.getElementById('errorState').style.display = 'none';
        document.getElementById('resetFormCard').style.display = 'block';
        document.getElementById('successState').style.display = 'none';

        document.getElementById('newPassword').addEventListener('input', checkPasswordLength);
        document.getElementById('confirmPassword').addEventListener('input', checkPasswordMatch);

        document.getElementById('resetForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            await resetPassword();
        });
    } catch (error) {
        console.error('Reset password initialization error:', error);
        document.getElementById('errorState').style.display = 'block';
        document.getElementById('resetFormCard').style.display = 'none';
        document.getElementById('successState').style.display = 'none';
    }
});

function checkPasswordLength() {
    const password = document.getElementById('newPassword').value;
    const statusEl = document.getElementById('newPasswordStatus');

    if (!password) {
        statusEl.textContent = '';
        statusEl.className = 'input-status';
        return;
    }

    if (password.length >= 6) {
        statusEl.textContent = 'ความยาวรหัสผ่านถูกต้อง';
        statusEl.className = 'input-status success';
    } else {
        statusEl.textContent = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
        statusEl.className = 'input-status error';
    }
    
    checkPasswordMatch();
}

function checkPasswordMatch() {
    const password = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const statusEl = document.getElementById('passwordStatus');

    if (!confirmPassword) {
        statusEl.textContent = '';
        statusEl.className = 'input-status';
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

async function resetPassword() {
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const formError = document.getElementById('formError');
    const submitBtn = document.getElementById('submitBtn');

    formError.textContent = '';
    formError.className = 'input-status';

    if (!newPassword || !confirmPassword) {
        formError.textContent = 'กรุณากรอกรหัสผ่านให้ครบ';
        formError.className = 'input-status error';
        return;
    }

    if (newPassword.length < 6) {
        formError.textContent = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
        formError.className = 'input-status error';
        return;
    }

    if (newPassword !== confirmPassword) {
        formError.textContent = 'รหัสผ่านไม่ตรงกัน';
        formError.className = 'input-status error';
        return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>กำลังบันทึก...</span>';

    try {
        const supabase = window.supabaseClient;
        const { error } = await supabase.auth.updateUser({ password: newPassword });

        if (error) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<span>บันทึกรหัสผ่านใหม่</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M5 12h14M12 5l7 7-7 7"></path>
                </svg>`;
            
            let errorMessage = error.message;
            if (error.message.includes('different from the old password')) {
                errorMessage = 'รหัสผ่านใหม่ต้องไม่เหมือนกับรหัสผ่านเดิม';
            }
            formError.textContent = errorMessage;
            formError.className = 'input-status error';
            return;
        }

        await supabase.auth.signOut();

        document.getElementById('resetFormCard').style.display = 'none';
        document.getElementById('successState').style.display = 'block';
    } catch (error) {
        console.error('Password reset error:', error);
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>บันทึกรหัสผ่านใหม่</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"></path>
            </svg>`;
        formError.textContent = 'ไม่สามารถเปลี่ยนรหัสผ่านได้ กรุณาลองใหม่อีกครั้ง';
        formError.className = 'input-status error';
    }
}
