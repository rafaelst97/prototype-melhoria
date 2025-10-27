// Função para exibir mensagens
function showMessage(message, type = 'info') {
    // Remover mensagens anteriores
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    const form = document.getElementById('loginMedicoForm');
    if (form) {
        form.parentNode.insertBefore(messageDiv, form);
        
        // Remover após 5 segundos
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    } else {
        alert(message);
    }
}

// Login do Médico
document.getElementById('loginMedicoForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const crm = document.getElementById('crm').value.trim();
    const senha = document.getElementById('senha').value;
    
    if (!crm || !senha) {
        showMessage('Por favor, preencha todos os campos!', 'error');
        return;
    }
    
    const btnSubmit = e.submitter || this.querySelector('button[type="submit"]');
    const originalText = btnSubmit ? btnSubmit.innerHTML : '';
    
    try {
        if (btnSubmit) {
            btnSubmit.disabled = true;
            btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
        }
        
        // Fazer login via API
        const response = await api.post(API_CONFIG.ENDPOINTS.MEDICO_LOGIN, {
            crm: crm,
            senha: senha
        }, false);
        
        // Salvar token e tipo de usuário
        localStorage.setItem('token', response.access_token);
        localStorage.setItem('userType', 'medico');
        localStorage.setItem('userName', response.nome || 'Médico');
        
        showMessage('Login realizado com sucesso!', 'success');
        
        // Redirecionar para dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
        
    } catch (error) {
        showMessage(error.message || 'Erro ao fazer login. Verifique suas credenciais.', 'error');
        
        if (btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = originalText;
        }
    }
});
