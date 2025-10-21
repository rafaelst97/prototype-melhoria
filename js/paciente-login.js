// Login do Paciente
document.getElementById('loginForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    
    // Validação básica
    if (senha.length < 8 || senha.length > 20) {
        showMessage('A senha deve ter entre 8 e 20 caracteres!', 'error');
        return;
    }
    
    try {
        // Fazer login via API
        await api.login(email, senha);
        
        // Verificar se é realmente um paciente
        const user = await api.getCurrentUser();
        
        if (user.tipo !== 'paciente') {
            showMessage('Acesso não autorizado. Esta área é exclusiva para pacientes.', 'error');
            api.logout();
            return;
        }
        
        // Armazenar dados do usuário
        localStorage.setItem('userType', 'paciente');
        localStorage.setItem('userName', user.nome);
        localStorage.setItem('userId', user.id);
        
        showMessage('Login realizado com sucesso!', 'success');
        
        // Redirecionar para dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
        
    } catch (error) {
        showMessage(error.message || 'Email ou senha incorretos', 'error');
    }
});
