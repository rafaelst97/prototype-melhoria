// Gerenciar Convênios - Admin
let convenios = [];
let convenioEditando = null;

document.addEventListener('DOMContentLoaded', async function() {
    await carregarConvenios();
    configurarFormularioCadastro();
});

// Carregar lista de convênios
async function carregarConvenios() {
    try {
        showLoading();
        convenios = await api.get('/admin/convenios');
        renderizarConvenios();
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
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 30px;">Nenhum convênio cadastrado</td></tr>';
        return;
    }
    
    tbody.innerHTML = convenios.map(convenio => {
        const ativo = convenio.ativo !== false;
        
        const statusHtml = ativo ? 
            '<span style="color: var(--tertiary-color);"><i class="fas fa-check-circle"></i> Ativo</span>' :
            '<span style="color: var(--accent-color);"><i class="fas fa-times-circle"></i> Inativo</span>';
        
        return `
            <tr style="${!ativo ? 'opacity: 0.6; background: #f5f5f5;' : ''}">
                <td>${convenio.nome || 'N/A'}</td>
                <td>${convenio.codigo || 'N/A'}</td>
                <td>${convenio.telefone || 'N/A'}</td>
                <td>${statusHtml}</td>
                <td>
                    ${ativo ? `
                        <button class="btn btn-secondary" style="padding: 5px 10px; margin-right: 5px;" onclick="editarConvenio(${convenio.id})">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn btn-outline" style="padding: 5px 10px;" onclick="desativarConvenio(${convenio.id})">
                            <i class="fas fa-ban"></i> Desativar
                        </button>
                    ` : `
                        <button class="btn btn-tertiary" style="padding: 5px 10px;" onclick="ativarConvenio(${convenio.id})">
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
