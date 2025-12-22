function goToQuestions() {
    const nickname = document.getElementById('nickname').value;
    const gender = document.querySelector('input[name="gender"]:checked').value;
    const age = document.getElementById('age').value;
    const birthdate = document.getElementById('birthdate').value;
    const weight = document.getElementById('weight').value;
    const height = document.getElementById('height').value;

    if (!nickname || !age || !birthdate || !weight || !height) {
        Swal.fire({ icon: 'warning', title: 'กรุณากรอกข้อมูล', text: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
        return;
    }

    // ตรวจสอบอายุกับวันเกิด
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
