// Dashboard do Médico
document.addEventListener('DOMContentLoaded', function() {
    const doctorName = localStorage.getItem('doctorName') || 'João Silva';
    const doctorNameElement = document.getElementById('doctorName');
    if (doctorNameElement) {
        doctorNameElement.textContent = doctorName;
    }
});
