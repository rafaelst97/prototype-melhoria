// Dashboard do Paciente
document.addEventListener('DOMContentLoaded', function() {
    // Carregar nome do usuário (simulado)
    const userName = localStorage.getItem('userName') || 'Paciente';
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = userName;
    }
});
