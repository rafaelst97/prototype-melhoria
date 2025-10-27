// Login do Admin
document.getElementById('loginAdminForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const usuario = document.getElementById('usuario').value;
    const senha = document.getElementById('senha').value;
    
    if (!usuario || !senha) {
        alert('Por favor, preencha todos os campos!');
        return;
    }
    
    try {
        // Converter "admin" para "admin@clinica.com" se necessário
        let email = usuario;
        if (usuario === 'admin' || usuario === 'administrador') {
            email = 'admin@clinica.com';
        } else if (!usuario.includes('@')) {
            // Se não for um email, adicionar @clinica.com
            email = `${usuario}@clinica.com`;
        }
        
        // Fazer login via API
        const response = await fetch('http://localhost:8000/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email, senha: senha })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Erro ao fazer login');
        }
        
        const data = await response.json();
        
        // Salvar token no localStorage
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user_type', data.user_type || 'admin');
        localStorage.setItem('user_id', data.user_id);
        
        console.log('Login realizado com sucesso!');
        
        // Redirecionar para dashboard
        window.location.href = 'dashboard.html';
        
    } catch (error) {
        console.error('Erro no login:', error);
        alert('Erro ao fazer login: ' + error.message);
    }
});
