// Cadastro do Paciente
document.getElementById('cadastroForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const senha = document.getElementById('senha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;
    
    // Validação de senha
    if (senha.length < 8 || senha.length > 20) {
        showMessage('A senha deve ter entre 8 e 20 caracteres alfanuméricos!', 'error');
        return;
    }
    
    if (senha !== confirmarSenha) {
        showMessage('As senhas não coincidem!', 'error');
        return;
    }
    
    // Coletar dados do formulário
    const dadosCadastro = {
        // Dados do usuário
        nome: document.getElementById('nome').value,
        email: document.getElementById('email').value,
        senha: senha,
        
        // Dados do paciente
        cpf: document.getElementById('cpf').value,
        data_nascimento: document.getElementById('dataNascimento').value,
        telefone: document.getElementById('telefone').value,
        endereco: document.getElementById('endereco').value || null,
        cidade: document.getElementById('cidade').value || null,
        estado: document.getElementById('estado').value || null,
        cep: document.getElementById('cep').value || null,
        convenio_id: document.getElementById('convenio').value ? parseInt(document.getElementById('convenio').value) : null,
        numero_carteirinha: document.getElementById('numeroCarteirinha').value || null
    };
    
    try {
        // Cadastrar via API
        await api.post(API_CONFIG.ENDPOINTS.PACIENTE_CADASTRO, dadosCadastro, false);
        
        showMessage('Cadastro realizado com sucesso! Faça login para continuar.', 'success');
        
        // Redirecionar para login após 2 segundos
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        
    } catch (error) {
        showMessage(error.message || 'Erro ao realizar cadastro', 'error');
    }
});
