// Consultas do Paciente - Integrado com API
let consultaAtual = null;
let consultas = [];

document.addEventListener('DOMContentLoaded', async function() {
    requireAuth();
    requireUserType('paciente');
    
    await carregarConsultas();
    configurarModalStyle();
});

async function carregarConsultas() {
    try {
        const pacienteId = api.getUserId();
        const response = await api.get(API_CONFIG.ENDPOINTS.PACIENTE_CONSULTAS_LISTAR(pacienteId));
        consultas = response;
        
        renderizarConsultasFuturas();
        renderizarHistorico();
    } catch (error) {
        console.error('Erro ao carregar consultas:', error);
        showMessage('Erro ao carregar consultas. Tente novamente.', 'error');
    }
}

function renderizarConsultasFuturas() {
    const tbody = document.querySelector('.card:first-of-type tbody');
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const consultasFuturas = consultas.filter(c => {
        const dataConsulta = new Date(c.data_hora_inicio);
        return dataConsulta >= hoje && ['agendada', 'confirmada'].includes(c.status);
    });
    
    if (consultasFuturas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Nenhuma consulta futura agendada</td></tr>';
        return;
    }
    
    tbody.innerHTML = consultasFuturas.map(consulta => `
        <tr>
            <td>${formatDateTime(consulta.data_hora_inicio)}</td>
            <td>${consulta.medico?.especialidade?.nome || 'N/A'}</td>
            <td>${consulta.medico?.nome || 'N/A'} - CRM ${consulta.medico?.crm || ''}</td>
            <td>${renderizarStatusBadge(consulta.status)}</td>
            <td>
                <button class="btn btn-secondary" style="padding: 5px 10px; margin-right: 5px;" 
                        onclick="abrirModalReagendar(${consulta.id})">Reagendar</button>
                <button class="btn btn-tertiary" style="padding: 5px 10px;" 
                        onclick="abrirModalCancelar(${consulta.id})">Cancelar</button>
            </td>
        </tr>
    `).join('');
}

function renderizarHistorico() {
    const tbody = document.querySelector('.card:nth-of-type(2) tbody');
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const consultasPassadas = consultas.filter(c => {
        const dataConsulta = new Date(c.data_hora_inicio);
        return dataConsulta < hoje || ['cancelada', 'realizada', 'faltou'].includes(c.status);
    }).sort((a, b) => new Date(b.data_hora_inicio) - new Date(a.data_hora_inicio));
    
    if (consultasPassadas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">Nenhuma consulta no histórico</td></tr>';
        return;
    }
    
    tbody.innerHTML = consultasPassadas.map(consulta => `
        <tr>
            <td>${formatDateTime(consulta.data_hora_inicio)}</td>
            <td>${consulta.medico?.especialidade?.nome || 'N/A'}</td>
            <td>${consulta.medico?.nome || 'N/A'} - CRM ${consulta.medico?.crm || ''}</td>
            <td>${renderizarStatusBadge(consulta.status)}</td>
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

function formatDateTime(isoString) {
    const date = new Date(isoString);
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const ano = date.getFullYear();
    const hora = String(date.getHours()).padStart(2, '0');
    const minuto = String(date.getMinutes()).padStart(2, '0');
    return `${dia}/${mes}/${ano} ${hora}:${minuto}`;
}

// ==================== REAGENDAMENTO ====================
async function abrirModalReagendar(consultaId) {
    consultaAtual = consultas.find(c => c.id === consultaId);
    if (!consultaAtual) return;
    
    // Verificar se pode reagendar (RN1 - 24h)
    const dataConsulta = new Date(consultaAtual.data_hora_inicio);
    const agora = new Date();
    const diferencaHoras = (dataConsulta - agora) / (1000 * 60 * 60);
    
    if (diferencaHoras < 24) {
        showMessage('Não é possível reagendar consultas com menos de 24 horas de antecedência (RN1).', 'error');
        return;
    }
    
    // Preencher informações da consulta atual
    document.getElementById('detalhes-consulta-atual').innerHTML = `
        ${formatDateTime(consultaAtual.data_hora_inicio)}<br>
        ${consultaAtual.medico?.nome} - ${consultaAtual.medico?.especialidade?.nome}
    `;
    
    // Configurar data mínima (amanhã)
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    document.getElementById('nova-data').min = amanha.toISOString().split('T')[0];
    
    // PREENCHER formulário com dados atuais da consulta
    const dataAtualConsulta = new Date(consultaAtual.data_hora_inicio);
    const dataFormatada = dataAtualConsulta.toISOString().split('T')[0]; // YYYY-MM-DD
    const horaFormatada = String(dataAtualConsulta.getHours()).padStart(2, '0') + ':' + 
                          String(dataAtualConsulta.getMinutes()).padStart(2, '0'); // HH:MM
    
    // Preencher campo de data com a data atual da consulta
    document.getElementById('nova-data').value = dataFormatada;
    
    // Carregar horários disponíveis para a data atual e preencher o horário
    await carregarHorariosDisponiveisInicial(horaFormatada);
    
    // Limpar mensagem de erro
    document.getElementById('reagendar-error-message').style.display = 'none';
    
    // Mostrar modal
    document.getElementById('modal-reagendar').style.display = 'flex';
    
    // Configurar listener de mudança de data
    document.getElementById('nova-data').addEventListener('change', carregarHorariosDisponiveis);
}

// Função auxiliar para carregar horários e preencher com o horário atual
async function carregarHorariosDisponiveisInicial(horarioAtual) {
    const data = document.getElementById('nova-data').value;
    const selectHora = document.getElementById('nova-hora');
    
    if (!data || !consultaAtual) return;
    
    try {
        const response = await api.get(API_CONFIG.ENDPOINTS.PACIENTE_HORARIOS_DISPONIVEIS(
            consultaAtual.id_medico_fk
        ) + `?data=${data}`);
        
        selectHora.innerHTML = '<option value="">Selecione um horário</option>';
        
        // Sempre adicionar o horário atual da consulta como primeira opção
        const optionAtual = document.createElement('option');
        optionAtual.value = horarioAtual;
        optionAtual.textContent = horarioAtual + ' (horário atual)';
        optionAtual.selected = true;
        selectHora.appendChild(optionAtual);
        
        if (response.length === 0) {
            return; // Pelo menos tem o horário atual
        }
        
        // Adicionar outros horários disponíveis
        response.forEach(horario => {
            // Evitar duplicar o horário atual
            if (horario.hora_inicio !== horarioAtual) {
                const option = document.createElement('option');
                option.value = horario.hora_inicio;
                option.textContent = horario.hora_inicio;
                selectHora.appendChild(option);
            }
        });
    } catch (error) {
        console.error('Erro ao carregar horários:', error);
        // Mesmo com erro, manter o horário atual selecionado
        selectHora.innerHTML = `<option value="${horarioAtual}" selected>${horarioAtual} (horário atual)</option>`;
    }
}

async function carregarHorariosDisponiveis() {
    const data = document.getElementById('nova-data').value;
    const selectHora = document.getElementById('nova-hora');
    
    if (!data || !consultaAtual) return;
    
    try {
        const response = await api.get(API_CONFIG.ENDPOINTS.PACIENTE_HORARIOS_DISPONIVEIS(
            consultaAtual.id_medico_fk
        ) + `?data=${data}`);
        
        selectHora.innerHTML = '<option value="">Selecione um horário</option>';
        
        if (response.length === 0) {
            selectHora.innerHTML = '<option value="">Nenhum horário disponível</option>';
            return;
        }
        
        response.forEach(horario => {
            const option = document.createElement('option');
            option.value = horario.hora_inicio;
            option.textContent = horario.hora_inicio;
            selectHora.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar horários:', error);
        selectHora.innerHTML = '<option value="">Erro ao carregar horários</option>';
    }
}

function fecharModalReagendar() {
    document.getElementById('modal-reagendar').style.display = 'none';
    consultaAtual = null;
}

document.getElementById('form-reagendar').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const novaData = document.getElementById('nova-data').value;
    const novaHora = document.getElementById('nova-hora').value;
    const motivo = document.getElementById('motivo-reagendamento').value;
    
    if (!novaData || !novaHora) {
        mostrarErroReagendar('Por favor, preencha data e horário');
        return;
    }
    
    try {
        // Criar data_hora_inicio no formato ISO
        const novaDataHoraInicio = `${novaData}T${novaHora}:00`;
        const novaDataHoraFim = calcularHoraFim(novaDataHoraInicio);
        
        await api.put(API_CONFIG.ENDPOINTS.PACIENTE_CONSULTA_REAGENDAR(consultaAtual.id), {
            data_hora_inicio: novaDataHoraInicio,
            data_hora_fim: novaDataHoraFim,
            motivo_reagendamento: motivo
        });
        
        fecharModalReagendar();
        showMessage('Consulta reagendada com sucesso!', 'success');
        await carregarConsultas();
    } catch (error) {
        console.error('Erro ao reagendar:', error);
        mostrarErroReagendar(error.message || 'Erro ao reagendar consulta');
    }
});

function mostrarErroReagendar(mensagem) {
    const errorDiv = document.getElementById('reagendar-error-message');
    errorDiv.textContent = mensagem;
    errorDiv.style.display = 'block';
}

// ==================== CANCELAMENTO ====================
function abrirModalCancelar(consultaId) {
    consultaAtual = consultas.find(c => c.id === consultaId);
    if (!consultaAtual) return;
    
    // Verificar se pode cancelar (RN1 - 24h)
    const dataConsulta = new Date(consultaAtual.data_hora_inicio);
    const agora = new Date();
    const diferencaHoras = (dataConsulta - agora) / (1000 * 60 * 60);
    
    if (diferencaHoras < 24) {
        showMessage('Não é possível cancelar consultas com menos de 24 horas de antecedência (RN1).', 'error');
        return;
    }
    
    // Preencher informações da consulta
    document.getElementById('detalhes-consulta-cancelar').innerHTML = `
        ${formatDateTime(consultaAtual.data_hora_inicio)}<br>
        ${consultaAtual.medico?.nome} - ${consultaAtual.medico?.especialidade?.nome}
    `;
    
    // Limpar formulário
    document.getElementById('form-cancelar').reset();
    document.getElementById('cancelar-error-message').style.display = 'none';
    
    // Mostrar modal
    document.getElementById('modal-cancelar').style.display = 'flex';
}

function fecharModalCancelar() {
    document.getElementById('modal-cancelar').style.display = 'none';
    consultaAtual = null;
}

document.getElementById('form-cancelar').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const motivo = document.getElementById('motivo-cancelamento').value;
    
    try {
        await api.delete(API_CONFIG.ENDPOINTS.PACIENTE_CONSULTA_CANCELAR(consultaAtual.id), {
            data: { motivo_cancelamento: motivo }
        });
        
        fecharModalCancelar();
        showMessage('Consulta cancelada com sucesso!', 'success');
        await carregarConsultas();
    } catch (error) {
        console.error('Erro ao cancelar:', error);
        mostrarErroCancelar(error.message || 'Erro ao cancelar consulta');
    }
});

function mostrarErroCancelar(mensagem) {
    const errorDiv = document.getElementById('cancelar-error-message');
    errorDiv.textContent = mensagem;
    errorDiv.style.display = 'block';
}

// Configurar estilo dos modais
function configurarModalStyle() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.background = 'rgba(0, 0, 0, 0.7)';
        modal.style.display = 'none';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.zIndex = '9999';
    });
    
    const modalContents = document.querySelectorAll('.modal-content');
    modalContents.forEach(content => {
        content.style.position = 'relative';
        content.style.background = 'white';
        content.style.borderRadius = '10px';
        content.style.padding = '30px';
        content.style.maxWidth = '600px';
        content.style.width = '90%';
        content.style.maxHeight = '90vh';
        content.style.overflowY = 'auto';
    });
    
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(btn => {
        btn.style.position = 'absolute';
        btn.style.top = '15px';
        btn.style.right = '20px';
        btn.style.fontSize = '28px';
        btn.style.fontWeight = 'bold';
        btn.style.color = '#999';
        btn.style.cursor = 'pointer';
        btn.style.lineHeight = '1';
    });
}

// Helper para exibir mensagens
function showMessage(message, type = 'success') {
    // Remove mensagens anteriores
    const existingAlert = document.querySelector('.alert-message');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    const alertClass = type === 'success' ? 'alert-success' : 'alert-error';
    const alertHTML = `
        <div class="alert-message ${alertClass}" style="
            position: fixed; 
            top: 20px; 
            right: 20px; 
            z-index: 99999; 
            min-width: 300px;
            max-width: 500px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#4CAF50' : '#f44336'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease-out;
        ">
            <strong>${type === 'success' ? '✅' : '❌'}</strong> ${message}
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', alertHTML);
    
    setTimeout(() => {
        const alert = document.querySelector('.alert-message');
        if (alert) {
            alert.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => alert.remove(), 300);
        }
    }, 4000);
}

function calcularHoraFim(dataHoraInicio) {
    const inicio = new Date(dataHoraInicio);
    inicio.setMinutes(inicio.getMinutes() + 30); // Consulta padrão de 30 minutos
    return inicio.toISOString().slice(0, 19);
}
