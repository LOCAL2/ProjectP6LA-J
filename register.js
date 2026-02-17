document.addEventListener('DOMContentLoaded', function() {
    const birthdateInput = document.getElementById('birthdate');
    
    birthdateInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, ''); 
        
        if (value.length >= 2) {
            value = value.slice(0, 2) + '/' + value.slice(2);
        }
        if (value.length >= 5) {
            value = value.slice(0, 5) + '/' + value.slice(5, 9);
        }
        
        e.target.value = value;
    });
    const sizeButtons = document.querySelectorAll('.size-btn');
    const savedSize = localStorage.getItem('fontSize') || 'large';
    
    document.body.classList.add('font-' + savedSize);
    
    sizeButtons.forEach(btn => {
        if (btn.dataset.size === savedSize) {
            btn.classList.add('active');
        }
        
        btn.addEventListener('click', function() {
            const size = this.dataset.size;
            
            sizeButtons.forEach(b => b.classList.remove('active'));
            
            this.classList.add('active');
            
            document.body.classList.remove('font-normal', 'font-large');
            
            document.body.classList.add('font-' + size);
            
            localStorage.setItem('fontSize', size);
        });
    });
});

function goToQuestions() {
    const nickname = document.getElementById('nickname').value;
    const genderInput = document.querySelector('input[name="gender"]:checked');
    const age = document.getElementById('age').value;
    const birthdateInput = document.getElementById('birthdate').value;
    const weight = document.getElementById('weight').value;
    const height = document.getElementById('height').value;

    if (!nickname || !genderInput || !age || !birthdateInput || !weight || !height) {
        Swal.fire({ icon: 'warning', title: 'กรุณากรอกข้อมูล', text: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
        return;
    }

    const gender = genderInput.value;

    const dateParts = birthdateInput.split('/');
    if (dateParts.length !== 3) {
        Swal.fire({ icon: 'error', title: 'รูปแบบวันเกิดไม่ถูกต้อง', text: 'กรุณากรอกวันเกิดในรูปแบบ วว/ดด/ปปปป' });
        return;
    }

    const day = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]);
    const year = parseInt(dateParts[2]);

    if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > new Date().getFullYear()) {
        Swal.fire({ icon: 'error', title: 'วันเกิดไม่ถูกต้อง', text: 'กรุณาตรวจสอบวันเกิดอีกครั้ง' });
        return;
    }

    const birthdate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const birthDate = new Date(birthdate);
    const today = new Date();
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
    }

    if (parseInt(age) !== calculatedAge) {
        Swal.fire({ 
            icon: 'error', 
            title: 'อายุไม่ตรงกับวันเกิด', 
            text: `จากวันเกิดที่กรอก อายุควรเป็น ${calculatedAge} ปี` 
        });
        return;
    }

    localStorage.setItem('registerData', JSON.stringify({
        nickname,
        gender,
        age: parseInt(age),
        birthdate,
        weight: parseFloat(weight),
        height: parseInt(height)
    }));

    window.location.href = 'notice.html';
}
