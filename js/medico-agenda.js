// Agenda do Médico - Integrado com API
let medicoId = null;
let consultasAgenda = [];

document.addEventListener('DOMContentLoaded', async function() {
    requireAuth();
    requireUserType('medico');
    
    medicoId = api.getUserId();
    
    const filtroData = document.getElementById('filtroData');
    if (filtroData) {
        const today = new Date().toISOString().split('T')[0];
        filtroData.value = today;
        
        filtroData.addEventListener('change', async function() {
            await carregarAgenda(this.value);
        });
        
        // Carregar agenda do dia atual
        await carregarAgenda(today);
    }
});

async function carregarAgenda(data) {
    try {
        const response = await api.get(API_CONFIG.ENDPOINTS.MEDICO_AGENDA(medicoId), {
            params: { data: data }
        });
        
        consultasAgenda = response;
        renderizarAgenda(data);
    } catch (error) {
        console.error('Erro ao carregar agenda:', error);
        showMessage('Erro ao carregar agenda.', 'error');
    }
}

function renderizarAgenda(data) {
    const tbody = document.querySelector('#agenda-table tbody');
    if (!tbody) return;
    
    if (consultasAgenda.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Nenhuma consulta agendada para esta data</td></tr>';
        return;
    }
    
    // Ordenar por data_hora_inicio
    consultasAgenda.sort((a, b) => new Date(a.data_hora_inicio) - new Date(b.data_hora_inicio));
    
    tbody.innerHTML = consultasAgenda.map(consulta => `
        <tr>
            <td>${extractTime(consulta.data_hora_inicio)} - ${extractTime(consulta.data_hora_fim)}</td>
            <td>${consulta.paciente?.nome || 'N/A'}</td>
            <td>${consulta.paciente?.telefone || 'N/A'}</td>
            <td>${renderizarStatusBadge(consulta.status)}</td>
            <td>
                ${consulta.status === 'agendada' || consulta.status === 'confirmada' ? `
                    <button class="btn btn-primary" onclick="marcarRealizada(${consulta.id})" style="padding: 5px 10px; margin-right: 5px;">
                        <i class="fas fa-check"></i> Realizada
                    </button>
                    <button class="btn btn-tertiary" onclick="marcarFaltou(${consulta.id})" style="padding: 5px 10px;">
                        <i class="fas fa-times"></i> Faltou
                    </button>
                ` : ''}
                <button class="btn btn-secondary" onclick="verDetalhes(${consulta.id})" style="padding: 5px 10px; margin-left: 5px;">
                    <i class="fas fa-eye"></i> Detalhes
                </button>
            </td>
        </tr>
    `).join('');
}

function renderizarStatusBadge(status) {
    const statusConfig = {
        'agendada': { icon: 'clock', color: '#3498db', text: 'Agendada' },
        'confirmada': { icon: 'check-circle', color: '#27ae60', text: 'Confirmada' },
        'cancelada': { icon: 'times-circle', color: '#e74c3c', text: 'Cancelada' },
        'realizada': { icon: 'check-circle', color: '#27ae60', text: 'Realizada' },
        'faltou': { icon: 'exclamation-circle', color: '#e67e22', text: 'Faltou' }
    };
    
    const config = statusConfig[status] || statusConfig['agendada'];
    return `<span style="color: ${config.color};"><i class="fas fa-${config.icon}"></i> ${config.text}</span>`;
}

function extractTime(isoString) {
    const date = new Date(isoString);
    const hora = String(date.getHours()).padStart(2, '0');
    const minuto = String(date.getMinutes()).padStart(2, '0');
    return `${hora}:${minuto}`;
}

async function marcarRealizada(consultaId) {
    if (!confirm('Confirmar que esta consulta foi realizada?')) return;
    
    try {
        await api.put(API_CONFIG.ENDPOINTS.MEDICO_CONSULTA_ATUALIZAR_STATUS(medicoId, consultaId), {
            status: 'realizada'
        });
        
        showMessage('Consulta marcada como realizada!', 'success');
        await carregarAgenda(document.getElementById('filtroData').value);
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        showMessage(error.message || 'Erro ao atualizar status.', 'error');
    }
}

async function marcarFaltou(consultaId) {
    if (!confirm('Confirmar que o paciente faltou à consulta?')) return;
    
    try {
        await api.put(API_CONFIG.ENDPOINTS.MEDICO_CONSULTA_ATUALIZAR_STATUS(medicoId, consultaId), {
            status: 'faltou'
        });
        
        showMessage('Consulta marcada como faltou. O sistema irá verificar se o paciente deve ser bloqueado (RN3).', 'success');
        await carregarAgenda(document.getElementById('filtroData').value);
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        showMessage(error.message || 'Erro ao atualizar status.', 'error');
    }
}

function verDetalhes(consultaId) {
    const consulta = consultasAgenda.find(c => c.id === consultaId);
    if (!consulta) return;
    
    const detalhes = `
DETALHES DA CONSULTA

Data/Hora: ${formatDateTime(consulta.data_hora_inicio)} - ${extractTime(consulta.data_hora_fim)}
Paciente: ${consulta.paciente?.nome || 'N/A'}
CPF: ${consulta.paciente?.cpf || 'N/A'}
Telefone: ${consulta.paciente?.telefone || 'N/A'}
Email: ${consulta.paciente?.email || 'N/A'}
Plano: ${consulta.paciente?.plano_saude?.nome || 'Particular'}
Status: ${consulta.status}
${consulta.observacoes ? '\nObservações:\n' + consulta.observacoes : ''}
    `;
    
    alert(detalhes);
}

function formatDateTime(isoString) {
    const date = new Date(isoString);
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const ano = date.getFullYear();
    const hora = String(date.getHours()).padStart(2, '0');
    const minuto = String(date.getMinutes()).padStart(2, '0');
    return `${dia}/${mes}/${ano} ${hora}:${minuto}`;
}

function showMessage(message, type) {
    if (type === 'error') {
        alert('ERRO: ' + message);
    } else {
        alert(message);
    }
}
