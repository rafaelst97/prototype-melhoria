// Login do Paciente
document.getElementById('loginForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    
    // Validação básica
    if (senha.length < 8 || senha.length > 20) {
        alert('A senha deve ter entre 8 e 20 caracteres!');
        return;
    }
    
    // Simular login bem-sucedido
    alert('Login realizado com sucesso!');
    window.location.href = 'dashboard.html';
});
