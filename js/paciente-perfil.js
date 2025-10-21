// Perfil do Paciente
document.getElementById('perfilForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Informações atualizadas com sucesso!');
});

document.getElementById('senhaForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const novaSenha = document.getElementById('novaSenha').value;
    const confirmarNovaSenha = document.getElementById('confirmarNovaSenha').value;
    
    if (novaSenha.length < 8 || novaSenha.length > 20) {
        alert('A senha deve ter entre 8 e 20 caracteres alfanuméricos!');
        return;
    }
    
    if (novaSenha !== confirmarNovaSenha) {
        alert('As senhas não coincidem!');
        return;
    }
    
    alert('Senha alterada com sucesso!');
    document.getElementById('senhaForm').reset();
});
