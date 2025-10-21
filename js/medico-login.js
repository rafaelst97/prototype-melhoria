// Login do Médico
document.getElementById('loginMedicoForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const crm = document.getElementById('crm').value;
    const senha = document.getElementById('senha').value;
    
    if (!crm || !senha) {
        alert('Por favor, preencha todos os campos!');
        return;
    }
    
    // Simular login bem-sucedido
    alert('Login realizado com sucesso!');
    window.location.href = 'dashboard.html';
});
