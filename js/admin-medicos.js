// Médicos - Admin
document.getElementById('cadastroMedicoForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const nome = document.getElementById('nome').value;
    const crm = document.getElementById('crm').value;
    const especialidade = document.getElementById('especialidade').value;
    
    if (!nome || !crm || !especialidade) {
        alert('Por favor, preencha todos os campos obrigatórios!');
        return;
    }
    
    alert('Médico cadastrado com sucesso!');
    document.getElementById('formCadastro').style.display = 'none';
    location.reload();
});
