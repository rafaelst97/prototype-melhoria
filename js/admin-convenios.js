// Gerenciar Convênios - Admin
let convenios = [];
let convenioEditando = null;

document.addEventListener('DOMContentLoaded', async function() {
    requireAuth();
    requireUserType('administrador');
    
    await carregarConvenios();
    configurarFormularioCadastro();
});

// Carregar lista de convênios com estatísticas
async function carregarConvenios() {
    try {
        showLoading();
        convenios = await api.get(API_CONFIG.ENDPOINTS.ADMIN_PLANOS_SAUDE_ESTATISTICAS);
        renderizarConvenios();
        renderizarEstatisticas();
        hideLoading();
    } catch (error) {
        console.error('Erro ao carregar convênios:', error);
        showMessage('Erro ao carregar convênios: ' + error.message, 'error');
        hideLoading();
    }
}

// Renderizar lista de convênios
function renderizarConvenios() {
    const tbody = document.querySelector('tbody');
    
    if (!tbody) return;
    
    if (convenios.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 30px;">Nenhum convênio cadastrado</td></tr>';
        return;
    }
    
    tbody.innerHTML = convenios.map(convenio => {
        const statusHtml = '<span style="color: var(--tertiary-color);"><i class="fas fa-check-circle"></i> Ativo</span>';
        
        // Truncar cobertura_info se for muito longa
        const cobertura = convenio.cobertura_info 
            ? (convenio.cobertura_info.length > 50 
                ? convenio.cobertura_info.substring(0, 50) + '...' 
                : convenio.cobertura_info)
            : 'Sem informações';
        
        return `
            <tr>
                <td><strong>${convenio.nome || 'N/A'}</strong></td>
                <td>${cobertura}</td>
                <td style="text-align: center;">${convenio.qtd_pacientes || 0}</td>
                <td style="text-align: center;">${convenio.consultas_mes || 0}</td>
                <td>${statusHtml}</td>
                <td>
                    <button class="btn btn-secondary" style="padding: 5px 10px; margin-right: 5px;" onclick="editarConvenio(${convenio.id_plano_saude})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-outline" style="padding: 5px 10px;" onclick="verDetalhes(${convenio.id_plano_saude})">
                        <i class="fas fa-eye"></i> Detalhes
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Renderizar estatísticas
function renderizarEstatisticas() {
    const distribuicaoDiv = document.querySelector('.grid-2 > div:first-child');
    const consultasDiv = document.querySelector('.grid-2 > div:last-child');
    
    if (!distribuicaoDiv || !consultasDiv) return;
    
    // Ordenar por quantidade de pacientes
    const conveniosOrdenados = [...convenios].sort((a, b) => b.qtd_pacientes - a.qtd_pacientes);
    
    // Distribuição de pacientes
    let distribuicaoHtml = '<h4 style="color: var(--primary-color);">Distribuição de Pacientes</h4>';
    conveniosOrdenados.forEach(convenio => {
        distribuicaoHtml += `<p>${convenio.nome}: ${convenio.qtd_pacientes} (${convenio.percentual_pacientes}%)</p>`;
    });
    
    distribuicaoDiv.innerHTML = distribuicaoHtml;
    
    // Consultas este mês
    let consultasHtml = '<h4 style="color: var(--primary-color);">Consultas Este Mês</h4>';
    conveniosOrdenados.forEach(convenio => {
        consultasHtml += `<p>${convenio.nome}: ${convenio.consultas_mes} consultas</p>`;
    });
    
    consultasDiv.innerHTML = consultasHtml;
}

// Configurar formulário de cadastro
function configurarFormularioCadastro() {
    const btnNovo = document.querySelector('.btn-primary');
    const formConvenio = document.getElementById('formConvenio');
    const form = document.getElementById('cadastroConvenioForm');
    
    if (btnNovo && formConvenio) {
        btnNovo.addEventListener('click', () => {
            convenioEditando = null;
            formConvenio.style.display = 'block';
            form.reset();
            
            // Atualizar título e botão
            const titulo = formConvenio.querySelector('h3');
            const btnSubmit = form.querySelector('button[type="submit"]');
            if (titulo) titulo.innerHTML = '<i class="fas fa-plus-circle"></i> Novo Convênio';
            if (btnSubmit) btnSubmit.innerHTML = '<i class="fas fa-save"></i> Cadastrar';
        });
    }
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (convenioEditando) {
                await atualizarConvenio();
            } else {
                await cadastrarConvenio();
            }
        });
    }
    
    // Botão cancelar
    const btnCancelar = formConvenio?.querySelector('.btn-outline');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', () => {
            formConvenio.style.display = 'none';
            form.reset();
            convenioEditando = null;
        });
    }
}

// Cadastrar novo convênio
async function cadastrarConvenio() {
    const form = document.getElementById('cadastroConvenioForm');
    const btnSubmit = form.querySelector('button[type="submit"]');
    const originalText = btnSubmit.innerHTML;
    
    try {
        const telefoneInput = document.getElementById('telefoneConvenio');
        const emailInput = document.getElementById('emailConvenio');
        const descricaoInput = document.getElementById('descricaoConvenio');
        
        const dados = {
            nome: document.getElementById('nomeConvenio').value,
            codigo: document.getElementById('codigoConvenio').value,
            telefone: telefoneInput?.value.trim() || null,
            email: emailInput?.value.trim() || null,
            descricao: descricaoInput?.value.trim() || null
        };
        
        // Validações
        if (!dados.nome || !dados.codigo) {
            showMessage('Por favor, preencha todos os campos obrigatórios!', 'error');
            return;
        }
        
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cadastrando...';
        
        await api.post('/admin/convenios', dados);
        
        showMessage('Convênio cadastrado com sucesso!', 'success');
        document.getElementById('formConvenio').style.display = 'none';
        form.reset();
        await carregarConvenios();
        
    } catch (error) {
        console.error('Erro ao cadastrar convênio:', error);
        showMessage('Erro ao cadastrar convênio: ' + error.message, 'error');
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = originalText;
    }
}

// Editar convênio
async function editarConvenio(convenioId) {
    try {
        showLoading();
        convenioEditando = convenios.find(c => c.id === convenioId);
        hideLoading();
        
        if (!convenioEditando) {
            showMessage('Convênio não encontrado!', 'error');
            return;
        }
        
        // Preencher formulário
        document.getElementById('nomeConvenio').value = convenioEditando.nome || '';
        document.getElementById('codigoConvenio').value = convenioEditando.codigo || '';
        
        const telefoneInput = document.getElementById('telefoneConvenio');
        const emailInput = document.getElementById('emailConvenio');
        const descricaoInput = document.getElementById('descricaoConvenio');
        if (telefoneInput) telefoneInput.value = convenioEditando.telefone || '';
        if (emailInput) emailInput.value = convenioEditando.email || '';
        if (descricaoInput) descricaoInput.value = convenioEditando.descricao || '';
        
        // Atualizar título e botão
        const formConvenio = document.getElementById('formConvenio');
        const titulo = formConvenio.querySelector('h3');
        const btnSubmit = formConvenio.querySelector('button[type="submit"]');
        if (titulo) titulo.innerHTML = '<i class="fas fa-edit"></i> Editar Convênio';
        if (btnSubmit) btnSubmit.innerHTML = '<i class="fas fa-save"></i> Atualizar';
        
        // Exibir formulário
        formConvenio.style.display = 'block';
        
    } catch (error) {
        console.error('Erro ao editar convênio:', error);
        showMessage('Erro ao carregar dados do convênio: ' + error.message, 'error');
        hideLoading();
    }
}

// Atualizar convênio
async function atualizarConvenio() {
    const form = document.getElementById('cadastroConvenioForm');
    const btnSubmit = form.querySelector('button[type="submit"]');
    const originalText = btnSubmit.innerHTML;
    
    try {
        const telefoneInput = document.getElementById('telefoneConvenio');
        const emailInput = document.getElementById('emailConvenio');
        const descricaoInput = document.getElementById('descricaoConvenio');
        
        const dados = {
            nome: document.getElementById('nomeConvenio').value,
            codigo: document.getElementById('codigoConvenio').value,
            telefone: telefoneInput?.value.trim() || null,
            email: emailInput?.value.trim() || null,
            descricao: descricaoInput?.value.trim() || null
        };
        
        // Validações
        if (!dados.nome || !dados.codigo) {
            showMessage('Por favor, preencha todos os campos obrigatórios!', 'error');
            return;
        }
        
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Atualizando...';
        
        await api.put(`/admin/convenios/${convenioEditando.id}`, dados);
        
        showMessage('Convênio atualizado com sucesso!', 'success');
        document.getElementById('formConvenio').style.display = 'none';
        form.reset();
        convenioEditando = null;
        await carregarConvenios();
        
    } catch (error) {
        console.error('Erro ao atualizar convênio:', error);
        showMessage('Erro ao atualizar convênio: ' + error.message, 'error');
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = originalText;
    }
}

// Desativar convênio
async function desativarConvenio(convenioId) {
    if (!confirm('Deseja realmente desativar este convênio?')) {
        return;
    }
    
    try {
        showLoading();
        await api.delete(`/admin/convenios/${convenioId}`);
        showMessage('Convênio desativado com sucesso!', 'success');
        await carregarConvenios();
        hideLoading();
    } catch (error) {
        console.error('Erro ao desativar:', error);
        showMessage('Erro ao desativar convênio: ' + error.message, 'error');
        hideLoading();
    }
}

// Ativar convênio
async function ativarConvenio(convenioId) {
    if (!confirm('Deseja realmente reativar este convênio?')) {
        return;
    }
    
    try {
        showLoading();
        await api.put(`/admin/convenios/${convenioId}/ativar`, {});
        showMessage('Convênio reativado com sucesso!', 'success');
        await carregarConvenios();
        hideLoading();
    } catch (error) {
        console.error('Erro ao ativar:', error);
        showMessage('Erro ao reativar convênio: ' + error.message, 'error');
        hideLoading();
    }
}

// Funções auxiliares
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

// Editar convênio (simplificado)
function editarConvenio(id) {
    showMessage('Funcionalidade em desenvolvimento', 'warning');
}

// Ver detalhes do convênio
function verDetalhes(id) {
    const convenio = convenios.find(c => c.id_plano_saude === id);
    if (!convenio) {
        showMessage('Convênio não encontrado', 'error');
        return;
    }
    
    const detalhesHtml = `
        <div style="background: white; padding: 30px; border-radius: 10px; max-width: 600px; margin: 0 auto;">
            <h3 style="margin-bottom: 20px; color: var(--primary-color);">
                <i class="fas fa-building"></i> Detalhes do Convênio
            </h3>
            
            <div style="margin-bottom: 15px;">
                <strong>Nome:</strong> ${convenio.nome}
            </div>
            <div style="margin-bottom: 15px;">
                <strong>Cobertura:</strong> ${convenio.cobertura_info || 'Sem informações'}
            </div>
            <div style="margin-bottom: 15px;">
                <strong>Pacientes Cadastrados:</strong> ${convenio.qtd_pacientes}
            </div>
            <div style="margin-bottom: 15px;">
                <strong>Percentual de Pacientes:</strong> ${convenio.percentual_pacientes}%
            </div>
            <div style="margin-bottom: 15px;">
                <strong>Consultas Este Mês:</strong> ${convenio.consultas_mes}
            </div>
            
            <button onclick="fecharModal()" class="btn btn-secondary" style="margin-top: 20px;">
                <i class="fas fa-times"></i> Fechar
            </button>
        </div>
    `;
    
    mostrarModal(detalhesHtml);
}

// Mostrar modal
function mostrarModal(html) {
    const modal = document.createElement('div');
    modal.id = 'modal-overlay';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 9999; display: flex; align-items: center; justify-content: center;';
    modal.innerHTML = html;
    
    modal.onclick = (e) => {
        if (e.target === modal) fecharModal();
    };
    
    document.body.appendChild(modal);
}

// Fechar modal
function fecharModal() {
    const modal = document.getElementById('modal-overlay');
    if (modal) modal.remove();
}
