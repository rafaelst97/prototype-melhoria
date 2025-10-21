// Convênios - Admin
document.getElementById('cadastroConvenioForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const nome = document.getElementById('nomeConvenio').value;
    const codigo = document.getElementById('codigoConvenio').value;
    
    if (!nome || !codigo) {
        alert('Por favor, preencha todos os campos obrigatórios!');
        return;
    }
    
    alert('Convênio cadastrado com sucesso!');
    document.getElementById('formConvenio').style.display = 'none';
    location.reload();
});
