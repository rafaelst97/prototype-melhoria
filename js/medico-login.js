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
        
        // Fazer login com CRM via API (agora salva user_type e user_id automaticamente)
        const response = await api.loginCRM(crm, senha);
        
        // Verificar se é realmente um médico
        if (response.user_type !== 'medico') {
            showMessage('Acesso não autorizado. Esta área é exclusiva para médicos.', 'error');
            api.logout();
            return;
        }
        
        // Obter dados completos do usuário
        const user = await api.getCurrentUser();
        
        // Armazenar dados do usuário (compatibilidade com código antigo)
        localStorage.setItem('userRole', 'medico');
        localStorage.setItem('userName', user.nome || 'Médico');
        // user_type e user_id já foram salvos pelo api.loginCRM()
        
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
