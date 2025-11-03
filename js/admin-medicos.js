// Gerenciar Médicos - Admin - Integrado com API
let medicos = [];
let especialidades = [];

document.addEventListener('DOMContentLoaded', async function() {
    requireAuth();
    requireUserType('administrador');
    
    await carregarEspecialidades();
    await carregarMedicos();
    configurarFormularioCadastro();
});

// Carregar especialidades
async function carregarEspecialidades() {
    try {
        especialidades = await api.get(API_CONFIG.ENDPOINTS.ESPECIALIDADES);
        
        const select = document.getElementById('especialidade');
        if (select && especialidades.length > 0) {
            select.innerHTML = '<option value="">Selecione...</option>';
            especialidades.forEach(esp => {
                const option = document.createElement('option');
                option.value = esp.id;
                option.textContent = esp.nome;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Erro ao carregar especialidades:', error);
    }
}

// Carregar lista de médicos
async function carregarMedicos() {
    try {
        showLoading();
        medicos = await api.get(API_CONFIG.ENDPOINTS.ADMIN_MEDICOS_LISTAR);
        renderizarMedicos();
        hideLoading();
    } catch (error) {
        console.error('Erro ao carregar médicos:', error);
        showMessage('Erro ao carregar médicos: ' + error.message, 'error');
        hideLoading();
    }
}

// Renderizar lista de médicos
function renderizarMedicos() {
    const tbody = document.querySelector('tbody');
    
    if (!tbody) return;
    
    if (medicos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 30px;">Nenhum médico cadastrado</td></tr>';
        return;
    }
    
    tbody.innerHTML = medicos.map(medico => {
        const usuario = medico.usuario || {};
        const especialidade = medico.especialidade || {};
        const ativo = usuario.ativo !== false;
        
        const statusHtml = ativo ? 
            '<span style="color: var(--tertiary-color);"><i class="fas fa-check-circle"></i> Ativo</span>' :
            '<span style="color: var(--accent-color);"><i class="fas fa-times-circle"></i> Inativo</span>';
        
        return `
            <tr style="${!ativo ? 'opacity: 0.6; background: #f5f5f5;' : ''}">
                <td>${usuario.nome || 'N/A'}</td>
                <td>${medico.crm || 'N/A'}</td>
                <td>${especialidade.nome || 'N/A'}</td>
                <td>${usuario.email || 'N/A'}</td>
                <td>${statusHtml}</td>
                <td>
                    <button class="btn btn-secondary" style="padding: 5px 10px; margin-right: 5px;" onclick="verDetalhesMedico(${medico.id})">
                        <i class="fas fa-eye"></i> Ver
                    </button>
                    ${ativo ? `
                        <button class="btn btn-outline" style="padding: 5px 10px;" onclick="desativarMedico(${medico.id})">
                            <i class="fas fa-ban"></i> Desativar
                        </button>
                    ` : `
                        <button class="btn btn-tertiary" style="padding: 5px 10px;" onclick="ativarMedico(${medico.id})">
                            <i class="fas fa-check"></i> Ativar
                        </button>
                    `}
                </td>
            </tr>
        `;
    }).join('');
}

// Configurar formulário de cadastro
function configurarFormularioCadastro() {
    const btnNovo = document.querySelector('.btn-primary');
    const formCadastro = document.getElementById('formCadastro');
    const form = document.getElementById('cadastroMedicoForm');
    
    if (btnNovo && formCadastro) {
        btnNovo.addEventListener('click', () => {
            formCadastro.style.display = 'block';
            form.reset();
        });
    }
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await cadastrarMedico();
        });
    }
    
    // Botão cancelar
    const btnCancelar = formCadastro?.querySelector('.btn-outline');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', () => {
            formCadastro.style.display = 'none';
            form.reset();
        });
    }
}

// Cadastrar novo médico
async function cadastrarMedico() {
    const form = document.getElementById('cadastroMedicoForm');
    const btnSubmit = form.querySelector('button[type="submit"]');
    const originalText = btnSubmit.innerHTML;
    
    try {
        const dados = {
            nome: document.getElementById('nome').value,
            email: document.getElementById('email').value,
            senha: document.getElementById('senha').value,
            crm: document.getElementById('crm').value,
            especialidade_id: parseInt(document.getElementById('especialidade').value)
        };
        
        // Validações
        if (!dados.nome || !dados.email || !dados.senha || !dados.crm || !dados.especialidade_id) {
            showMessage('Por favor, preencha todos os campos obrigatórios!', 'error');
            return;
        }
        
        if (dados.senha.length < 8) {
            showMessage('A senha deve ter no mínimo 8 caracteres!', 'error');
            return;
        }
        
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cadastrando...';
        
        await api.post('/admin/medicos', dados);
        
        showMessage('Médico cadastrado com sucesso!', 'success');
        document.getElementById('formCadastro').style.display = 'none';
        form.reset();
        await carregarMedicos();
        
    } catch (error) {
        console.error('Erro ao cadastrar médico:', error);
        showMessage('Erro ao cadastrar médico: ' + error.message, 'error');
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = originalText;
    }
}

// Ver detalhes do médico
async function verDetalhesMedico(medicoId) {
    try {
        showLoading();
        const medico = await api.get(`/admin/medicos/${medicoId}`);
        hideLoading();
        
        const usuario = medico.usuario || {};
        const especialidade = medico.especialidade || {};
        
        const detalhesHtml = `
            <div style="background: white; padding: 30px; border-radius: 10px; max-width: 600px; margin: 0 auto;">
                <h3 style="margin-bottom: 20px; color: var(--primary-color);">
                    <i class="fas fa-user-md"></i> Detalhes do Médico
                </h3>
                
                <div style="margin-bottom: 15px;">
                    <strong>Nome:</strong> ${usuario.nome || 'N/A'}
                </div>
                <div style="margin-bottom: 15px;">
                    <strong>Email:</strong> ${usuario.email || 'N/A'}
                </div>
                <div style="margin-bottom: 15px;">
                    <strong>CRM:</strong> ${medico.crm || 'N/A'}
                </div>
                <div style="margin-bottom: 15px;">
                    <strong>Especialidade:</strong> ${especialidade.nome || 'N/A'}
                </div>
                <div style="margin-bottom: 15px;">
                    <strong>Status:</strong> 
                    ${usuario.ativo ? 
                        '<span style="color: var(--tertiary-color);"><i class="fas fa-check-circle"></i> Ativo</span>' : 
                        '<span style="color: var(--accent-color);"><i class="fas fa-times-circle"></i> Inativo</span>'
                    }
                </div>
                <div style="margin-bottom: 15px;">
                    <strong>Cadastrado em:</strong> ${formatarDataHora(usuario.criado_em)}
                </div>
                
                <button onclick="fecharModal()" class="btn btn-secondary" style="margin-top: 20px;">
                    <i class="fas fa-times"></i> Fechar
                </button>
            </div>
        `;
        
        mostrarModal(detalhesHtml);
        
    } catch (error) {
        console.error('Erro ao carregar detalhes:', error);
        showMessage('Erro ao carregar detalhes do médico: ' + error.message, 'error');
        hideLoading();
    }
}

// Desativar médico
async function desativarMedico(medicoId) {
    if (!confirm('Deseja realmente desativar este médico? Consultas futuras serão mantidas.')) {
        return;
    }
    
    try {
        showLoading();
        await api.delete(`/admin/medicos/${medicoId}`);
        showMessage('Médico desativado com sucesso!', 'success');
        await carregarMedicos();
        hideLoading();
    } catch (error) {
        console.error('Erro ao desativar:', error);
        showMessage('Erro ao desativar médico: ' + error.message, 'error');
        hideLoading();
    }
}

// Ativar médico
async function ativarMedico(medicoId) {
    if (!confirm('Deseja realmente reativar este médico?')) {
        return;
    }
    
    try {
        showLoading();
        await api.put(`/admin/medicos/${medicoId}/ativar`, {});
        showMessage('Médico reativado com sucesso!', 'success');
        await carregarMedicos();
        hideLoading();
    } catch (error) {
        console.error('Erro ao ativar:', error);
        showMessage('Erro ao reativar médico: ' + error.message, 'error');
        hideLoading();
    }
}

// Funções auxiliares
function formatarDataHora(dataHora) {
    if (!dataHora) return 'N/A';
    const d = new Date(dataHora);
    return d.toLocaleDateString('pt-BR') + ' às ' + d.toLocaleTimeString('pt-BR');
}

function mostrarModal(html) {
    const modal = document.createElement('div');
    modal.id = 'modalDetalhes';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        overflow-y: auto;
        padding: 20px;
    `;
    modal.innerHTML = html;
    modal.onclick = (e) => {
        if (e.target === modal) fecharModal();
    };
    document.body.appendChild(modal);
}

function fecharModal() {
    const modal = document.getElementById('modalDetalhes');
    if (modal) modal.remove();
}

function showLoading() {
    const loading = document.createElement('div');
    loading.id = 'loading';
    loading.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255,255,255,0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    loading.innerHTML = '<i class="fas fa-spinner fa-spin" style="font-size: 48px; color: var(--primary-color);"></i>';
    document.body.appendChild(loading);
}

function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) loading.remove();
}

function showMessage(message, type) {
    const alertClass = type === 'success' ? 'alert-success' : type === 'error' ? 'alert-danger' : 'alert-warning';
    const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-exclamation-triangle';
    
    const alert = document.createElement('div');
    alert.className = `alert ${alertClass}`;
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10001;
        min-width: 300px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;
    alert.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
    document.body.appendChild(alert);
    
    setTimeout(() => alert.remove(), 5000);
}
