// Relatórios Admin - Integrado com API (4 novos relatórios)
document.addEventListener('DOMContentLoaded', async function() {
    requireAuth();
    requireUserType('administrador');
    
    await carregarMedicos();
    await carregarEspecialidades();
    configurarFormularios();
});

// Carregar lista de médicos
async function carregarMedicos() {
    try {
        const medicos = await api.get(API_CONFIG.ENDPOINTS.ADMIN_MEDICOS_LISTAR);
        const select = document.getElementById('medico');
        
        if (select && medicos && medicos.length > 0) {
            select.innerHTML = '<option value="">Todos os médicos</option>';
            medicos.forEach(medico => {
                const option = document.createElement('option');
                option.value = medico.id;
                option.textContent = `${medico.nome || 'Médico'} - CRM ${medico.crm}`;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Erro ao carregar médicos:', error);
    }
}

// Carregar lista de especialidades
async function carregarEspecialidades() {
    try {
        const especialidades = await api.get(API_CONFIG.ENDPOINTS.ESPECIALIDADES);
        const select = document.getElementById('especialidade');
        
        if (select && especialidades && especialidades.length > 0) {
            select.innerHTML = '<option value="">Todas as especialidades</option>';
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

// Configurar formulários de relatórios
function configurarFormularios() {
    // Relatório 1: Consultas por Período
    const formConsultasPeriodo = document.getElementById('form-relatorio-consultas');
    if (formConsultasPeriodo) {
        formConsultasPeriodo.addEventListener('submit', async (e) => {
            e.preventDefault();
            await gerarRelatorioConsultasPeriodo();
        });
    }
    
    // Relatório 2: Consultas por Médico
    const formConsultasMedico = document.getElementById('form-relatorio-medico');
    if (formConsultasMedico) {
        formConsultasMedico.addEventListener('submit', async (e) => {
            e.preventDefault();
            await gerarRelatorioConsultasMedico();
        });
    }
    
    // Relatório 3: Pacientes com Mais Consultas
    const formPacientesAtivos = document.getElementById('form-relatorio-pacientes-ativos');
    if (formPacientesAtivos) {
        formPacientesAtivos.addEventListener('submit', async (e) => {
            e.preventDefault();
            await gerarRelatorioPacientesAtivos();
        });
    }
    
    // Relatório 4: Taxa de Faltas
    const formTaxaFaltas = document.getElementById('form-relatorio-faltas');
    if (formTaxaFaltas) {
        formTaxaFaltas.addEventListener('submit', async (e) => {
            e.preventDefault();
            await gerarRelatorioTaxaFaltas();
        });
    }
}

// Função para gerar PDF e abrir em nova aba
async function gerarPDF(endpoint, params = {}) {
    console.log('=== INICIANDO GERAÇÃO DE PDF ===');
    console.log('Endpoint:', endpoint);
    console.log('Parâmetros:', params);
    
    try {
        const btnSubmit = event?.submitter || document.activeElement;
        const originalText = btnSubmit?.innerHTML || '';
        
        if (btnSubmit) {
            btnSubmit.disabled = true;
            btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gerando PDF...';
        }
        
        // Construir query string
        const queryParams = new URLSearchParams();
        queryParams.append('formato', 'pdf');
        
        for (const [key, value] of Object.entries(params)) {
            if (value) {
                queryParams.append(key, value);
            }
        }
        
        const url = `${API_CONFIG.BASE_URL}${endpoint}?${queryParams.toString()}`;
        
        console.log('URL completa:', url);
        console.log('Query params:', queryParams.toString());
        
        // Fazer requisição com autenticação
        const token = localStorage.getItem('token');
        console.log('Token presente:', !!token);
        
        if (!token) {
            throw new Error('Usuário não autenticado');
        }
        
        console.log('Fazendo requisição fetch...');
        
        // Fazer download do PDF via fetch
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/pdf'
            }
        });
        
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        console.log('Response headers:', [...response.headers.entries()]);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Erro na resposta (texto):', errorText);
            const errorData = await response.json().catch(() => ({ detail: errorText }));
            throw new Error(errorData.detail || 'Erro ao gerar PDF');
        }
        
        console.log('Criando blob...');
        // Criar blob e abrir em nova aba
        const blob = await response.blob();
        console.log('Blob criado - Size:', blob.size, 'Type:', blob.type);
        
        if (blob.size === 0) {
            throw new Error('PDF vazio retornado pelo servidor');
        }
        
        console.log('Criando URL do blob...');
        const blobUrl = window.URL.createObjectURL(blob);
        console.log('Blob URL:', blobUrl);
        
        console.log('Abrindo nova aba...');
        const newWindow = window.open(blobUrl, '_blank');
        console.log('Nova janela aberta:', !!newWindow);
        
        if (!newWindow) {
            console.warn('Popup pode estar bloqueado!');
            // Tentar fazer download como alternativa
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = `relatorio_${Date.now()}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            showMessage('PDF baixado! (popups bloqueados)', 'warning');
        } else {
            showMessage('Relatório PDF gerado com sucesso!', 'success');
        }
        
        // Limpar URL do blob após 1 minuto
        setTimeout(() => {
            console.log('Revogando blob URL');
            window.URL.revokeObjectURL(blobUrl);
        }, 60000);
        
        if (btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = originalText;
        }
        
        console.log('✅ PDF gerado com sucesso!');
        
    } catch (error) {
        console.error('❌ ERRO ao gerar PDF:', error);
        console.error('Stack:', error.stack);
        showMessage('Erro ao gerar relatório PDF: ' + error.message, 'error');
        
        const btnSubmit = event?.submitter || document.activeElement;
        if (btnSubmit && btnSubmit.tagName === 'BUTTON') {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = btnSubmit.getAttribute('data-original-text') || '<i class="fas fa-file-pdf"></i> Gerar PDF';
        }
    }
    
    console.log('=== FIM GERAÇÃO DE PDF ===');
}

// ==================== 4 RELATÓRIOS PRINCIPAIS ====================

// Relatório 1: Consultas por Período
async function gerarRelatorioConsultasPeriodo() {
    const dataInicio = document.getElementById('data-inicio-consultas').value;
    const dataFim = document.getElementById('data-fim-consultas').value;
    
    if (!dataInicio || !dataFim) {
        showMessage('Por favor, preencha as datas de início e fim', 'error');
        return;
    }
    
    try {
        showLoading();
        const resultado = await api.get(API_CONFIG.ENDPOINTS.ADMIN_RELATORIO_CONSULTAS_PERIODO, {
            params: { data_inicio: dataInicio, data_fim: dataFim }
        });
        
        exibirResultadoRelatorio('Consultas por Período', resultado, 'consultas-periodo');
        hideLoading();
    } catch (error) {
        console.error('Erro ao gerar relatório:', error);
        showMessage('Erro ao gerar relatório: ' + error.message, 'error');
        hideLoading();
    }
}

// Relatório 2: Consultas por Médico
async function gerarRelatorioConsultasMedico() {
    const medicoId = document.getElementById('medico-relatorio').value;
    const dataInicio = document.getElementById('data-inicio-medico').value;
    const dataFim = document.getElementById('data-fim-medico').value;
    
    if (!medicoId) {
        showMessage('Por favor, selecione um médico', 'error');
        return;
    }
    
    try {
        showLoading();
        const resultado = await api.get(API_CONFIG.ENDPOINTS.ADMIN_RELATORIO_CONSULTAS_MEDICO(medicoId), {
            params: { data_inicio: dataInicio, data_fim: dataFim }
        });
        
        exibirResultadoRelatorio('Consultas por Médico', resultado, 'consultas-medico');
        hideLoading();
    } catch (error) {
        console.error('Erro ao gerar relatório:', error);
        showMessage('Erro ao gerar relatório: ' + error.message, 'error');
        hideLoading();
    }
}

// Relatório 3: Pacientes com Mais Consultas (Top 10)
async function gerarRelatorioPacientesAtivos() {
    const dataInicio = document.getElementById('data-inicio-pacientes').value;
    const dataFim = document.getElementById('data-fim-pacientes').value;
    const limite = parseInt(document.getElementById('limite-pacientes').value) || 10;
    
    try {
        showLoading();
        const resultado = await api.get(API_CONFIG.ENDPOINTS.ADMIN_RELATORIO_PACIENTES_ATIVOS, {
            params: { data_inicio: dataInicio, data_fim: dataFim, limite: limite }
        });
        
        exibirResultadoRelatorio('Pacientes Mais Ativos', resultado, 'pacientes-ativos');
        hideLoading();
    } catch (error) {
        console.error('Erro ao gerar relatório:', error);
        showMessage('Erro ao gerar relatório: ' + error.message, 'error');
        hideLoading();
    }
}

// Relatório 4: Taxa de Faltas
async function gerarRelatorioTaxaFaltas() {
    const dataInicio = document.getElementById('data-inicio-faltas').value;
    const dataFim = document.getElementById('data-fim-faltas').value;
    
    if (!dataInicio || !dataFim) {
        showMessage('Por favor, preencha as datas de início e fim', 'error');
        return;
    }
    
    try {
        showLoading();
        const resultado = await api.get(API_CONFIG.ENDPOINTS.ADMIN_RELATORIO_TAXA_FALTAS, {
            params: { data_inicio: dataInicio, data_fim: dataFim }
        });
        
        exibirResultadoRelatorio('Taxa de Faltas', resultado, 'taxa-faltas');
        hideLoading();
    } catch (error) {
        console.error('Erro ao gerar relatório:', error);
        showMessage('Erro ao gerar relatório: ' + error.message, 'error');
        hideLoading();
    }
}

// Exibir resultado do relatório
function exibirResultadoRelatorio(titulo, dados, tipo) {
    const container = document.getElementById('resultado-relatorio');
    if (!container) return;
    
    let html = `<h3>${titulo}</h3><div class="relatorio-dados">`;
    
    switch (tipo) {
        case 'consultas-periodo':
            html += `
                <p><strong>Total de Consultas:</strong> ${dados.total || 0}</p>
                <p><strong>Agendadas:</strong> ${dados.agendadas || 0}</p>
                <p><strong>Realizadas:</strong> ${dados.realizadas || 0}</p>
                <p><strong>Canceladas:</strong> ${dados.canceladas || 0}</p>
                <p><strong>Faltas:</strong> ${dados.faltas || 0}</p>
            `;
            break;
            
        case 'consultas-medico':
            html += `
                <p><strong>Médico:</strong> ${dados.medico?.nome || 'N/A'}</p>
                <p><strong>CRM:</strong> ${dados.medico?.crm || 'N/A'}</p>
                <p><strong>Total de Consultas:</strong> ${dados.total || 0}</p>
                <p><strong>Taxa de Realização:</strong> ${dados.taxa_realizacao || 0}%</p>
            `;
            break;
            
        case 'pacientes-ativos':
            html += '<table><thead><tr><th>Paciente</th><th>Total Consultas</th></tr></thead><tbody>';
            dados.forEach(item => {
                html += `<tr><td>${item.nome}</td><td>${item.total_consultas}</td></tr>`;
            });
            html += '</tbody></table>';
            break;
            
        case 'taxa-faltas':
            html += `
                <p><strong>Total de Consultas:</strong> ${dados.total_consultas || 0}</p>
                <p><strong>Total de Faltas:</strong> ${dados.total_faltas || 0}</p>
                <p><strong>Taxa de Faltas:</strong> ${dados.taxa_faltas || 0}%</p>
                <p><strong>Pacientes Bloqueados:</strong> ${dados.pacientes_bloqueados || 0}</p>
            `;
            break;
    }
    
    html += '</div>';
    container.innerHTML = html;
    container.style.display = 'block';
}

function showLoading() {
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'block';
}

function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'none';
}

function showMessage(message, type = 'info') {
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        border-radius: 5px;
        z-index: 10000;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Relatório de Consultas por Especialidade
document.getElementById('relatorioEspecialidadeForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const especialidade_id = document.getElementById('especialidade').value;
    const data_inicio = document.getElementById('periodoInicio2').value;
    const data_fim = document.getElementById('periodoFim2').value;
    
    await gerarPDF('/admin/relatorios/consultas-por-especialidade', {
        especialidade_id,
        data_inicio,
        data_fim
    });
});

// Relatório de Taxa de Cancelamento
document.getElementById('relatorioCancelamentoForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const data_inicio = document.getElementById('periodoInicio3').value;
    const data_fim = document.getElementById('periodoFim3').value;
    
    await gerarPDF('/admin/relatorios/cancelamentos', {
        data_inicio,
        data_fim
    });
});

// Relatório de Pacientes Frequentes
document.getElementById('relatorioPacienteForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const data_inicio = document.getElementById('periodoInicio4').value;
    const data_fim = document.getElementById('periodoFim4').value;
    
    await gerarPDF('/admin/relatorios/pacientes-frequentes', {
        data_inicio,
        data_fim
    });
});

