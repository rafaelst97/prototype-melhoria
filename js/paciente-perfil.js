// Perfil do Paciente - Integrado com API
let pacienteId = null;

document.addEventListener('DOMContentLoaded', async function() {
    requireAuth();
    requireUserType('paciente');
    
    pacienteId = api.getUserId();
    await carregarDadosPerfil();
    await verificarStatusBloqueio();
    
    setupFormListeners();
});

async function carregarDadosPerfil() {
    try {
        const perfil = await api.get(API_CONFIG.ENDPOINTS.PACIENTE_PERFIL(pacienteId));
        
        // Preencher campos do formulário
        document.getElementById('nome').value = perfil.nome || '';
        document.getElementById('cpf').value = perfil.cpf || '';
        document.getElementById('data-nascimento').value = perfil.data_nascimento || '';
        document.getElementById('telefone').value = perfil.telefone || '';
        document.getElementById('email').value = perfil.email || '';
        document.getElementById('endereco').value = perfil.endereco || '';
        
        // Carregar plano de saúde
        if (perfil.id_plano_saude_fk) {
            await carregarPlanoSaude(perfil.id_plano_saude_fk);
        }
    } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        showMessage('Erro ao carregar dados do perfil.', 'error');
    }
}

async function carregarPlanoSaude(planoId) {
    try {
        const planos = await api.get(API_CONFIG.ENDPOINTS.PACIENTE_PLANOS_SAUDE);
        const selectPlano = document.getElementById('id-plano-saude');
        
        selectPlano.innerHTML = '<option value="">Selecione um plano</option>';
        planos.forEach(plano => {
            const option = document.createElement('option');
            option.value = plano.id;
            option.textContent = `${plano.nome} - ${plano.tipo}`;
            if (plano.id === planoId) option.selected = true;
            selectPlano.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar planos:', error);
    }
}

async function verificarStatusBloqueio() {
    try {
        const status = await verificarBloqueio(pacienteId);
        
        if (status.bloqueado) {
            // Exibir aviso de bloqueio
            const avisoHTML = `
                <div class="alert alert-warning" style="background: #fff3cd; border: 1px solid #ffc107; padding: 15px; margin-bottom: 20px; border-radius: 5px;">
                    <strong>⚠️ CONTA BLOQUEADA</strong><br>
                    Sua conta está bloqueada devido a ${status.motivo}.<br>
                    Entre em contato com a administração para regularizar sua situação.
                </div>
            `;
            
            const container = document.querySelector('.main-content');
            container.insertAdjacentHTML('afterbegin', avisoHTML);
        }
    } catch (error) {
        console.error('Erro ao verificar bloqueio:', error);
    }
}

function setupFormListeners() {
    // Form de atualização de perfil
    document.getElementById('perfilForm')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const dadosAtualizados = {
            nome: document.getElementById('nome').value,
            telefone: document.getElementById('telefone').value,
            email: document.getElementById('email').value,
            endereco: document.getElementById('endereco').value,
            id_plano_saude_fk: parseInt(document.getElementById('id-plano-saude').value) || null
        };
        
        try {
            await api.put(API_CONFIG.ENDPOINTS.PACIENTE_PERFIL_ATUALIZAR(pacienteId), dadosAtualizados);
            showMessage('Informações atualizadas com sucesso!', 'success');
            await carregarDadosPerfil();
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            showMessage('Erro ao atualizar informações. Tente novamente.', 'error');
        }
    });
    
    // Form de alteração de senha
    document.getElementById('senhaForm')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const senhaAtual = document.getElementById('senhaAtual').value;
        const novaSenha = document.getElementById('novaSenha').value;
        const confirmarNovaSenha = document.getElementById('confirmarNovaSenha').value;
        
        if (novaSenha.length < 8 || novaSenha.length > 20) {
            showMessage('A senha deve ter entre 8 e 20 caracteres alfanuméricos!', 'error');
            return;
        }
        
        if (novaSenha !== confirmarNovaSenha) {
            showMessage('As senhas não coincidem!', 'error');
            return;
        }
        
        try {
            await api.put(API_CONFIG.ENDPOINTS.PACIENTE_PERFIL_ATUALIZAR(pacienteId), {
                senha: novaSenha
            });
            
            showMessage('Senha alterada com sucesso!', 'success');
            document.getElementById('senhaForm').reset();
        } catch (error) {
            console.error('Erro ao alterar senha:', error);
            showMessage('Erro ao alterar senha. Verifique se a senha atual está correta.', 'error');
        }
    });
}

function showMessage(message, type) {
    if (type === 'error') {
        alert('ERRO: ' + message);
    } else {
        alert(message);
    }
}
