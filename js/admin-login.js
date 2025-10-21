// Login do Admin
document.getElementById('loginAdminForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const usuario = document.getElementById('usuario').value;
    const senha = document.getElementById('senha').value;
    
    if (!usuario || !senha) {
        alert('Por favor, preencha todos os campos!');
        return;
    }
    
    // Simular login bem-sucedido
    alert('Login realizado com sucesso!');
    window.location.href = 'dashboard.html';
});
