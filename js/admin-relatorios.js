// Carregar dados ao iniciar
document.addEventListener('DOMContentLoaded', async function() {
    await carregarMedicos();
    await carregarEspecialidades();
});

// Carregar lista de médicos
async function carregarMedicos() {
    try {
        const medicos = await api.get('/admin/medicos');
        const select = document.getElementById('medico');
        
        if (select && medicos && medicos.length > 0) {
            select.innerHTML = '<option value="">Todos os médicos</option>';
            medicos.forEach(medico => {
                const option = document.createElement('option');
                option.value = medico.id;
                option.textContent = `${medico.usuario?.nome || 'Médico'} - ${medico.crm}`;
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
        const especialidades = await api.get('/pacientes/especialidades');
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

// Relatório de Consultas por Médico
document.getElementById('relatorioMedicoForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const medico_id = document.getElementById('medico').value;
    const data_inicio = document.getElementById('periodoInicio').value;
    const data_fim = document.getElementById('periodoFim').value;
    
    await gerarPDF('/admin/relatorios/consultas-por-medico', {
        medico_id,
        data_inicio,
        data_fim
    });
});

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

