// Cadastro do Paciente
document.getElementById('cadastroForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const senha = document.getElementById('senha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;
    
    // Validação de senha
    if (senha.length < 8 || senha.length > 20) {
        alert('A senha deve ter entre 8 e 20 caracteres alfanuméricos!');
        return;
    }
    
    if (senha !== confirmarSenha) {
        alert('As senhas não coincidem!');
        return;
    }
    
    // Simular cadastro bem-sucedido
    alert('Cadastro realizado com sucesso! Faça login para continuar.');
    window.location.href = 'login.html';
});
