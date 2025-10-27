// Variáveis globais
let todasConsultas = [];
let consultaSelecionada = null;

// Carregar consultas ao iniciar
document.addEventListener('DOMContentLoaded', async function() {
    await carregarConsultas();
});

// Carregar consultas do médico
async function carregarConsultas() {
    try {
        const consultas = await api.get('/medicos/consultas');
        todasConsultas = consultas;
        renderizarConsultas(consultas);
    } catch (error) {
        console.error('Erro ao carregar consultas:', error);
        showMessage('Erro ao carregar consultas: ' + error.message, 'error');
    }
}

// Renderizar lista de consultas
function renderizarConsultas(consultas) {
    const container = document.getElementById('listaConsultas');
    
    if (!container) return;
    
    if (!consultas || consultas.length === 0) {
        container.innerHTML = `
            <div class="alert alert-info">
                <i class="fas fa-info-circle"></i> Nenhuma consulta encontrada.
            </div>
        `;
        return;
    }
    
    const html = consultas.map(consulta => {
        const dataHora = new Date(consulta.data_hora_inicio);
        const statusClass = {
            'AGENDADA': 'info',
            'CONFIRMADA': 'success',
            'REALIZADA': 'secondary',
            'CANCELADA': 'danger'
        }[consulta.status] || 'info';
        
        return `
            <div class="consulta-item" style="border: 2px solid var(--light-bg); padding: 15px; margin-bottom: 15px; border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h4 style="margin: 0 0 10px 0; color: var(--primary-color);">
                            ${consulta.paciente?.nome || 'Paciente'}
                        </h4>
                        <p style="margin: 5px 0;">
                            <i class="far fa-calendar"></i> 
                            ${dataHora.toLocaleDateString('pt-BR')} às ${dataHora.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}
                        </p>
                        <p style="margin: 5px 0;">
                            <span class="badge badge-${statusClass}">${consulta.status}</span>
                        </p>
                    </div>
                    <div>
                        <button onclick="verDetalhesConsulta(${consulta.id})" class="btn btn-primary">
                            <i class="fas fa-eye"></i> Ver Detalhes
                        </button>
                        ${consulta.status === 'AGENDADA' || consulta.status === 'CONFIRMADA' ? `
                            <button onclick="abrirModalObservacao(${consulta.id})" class="btn btn-secondary">
                                <i class="fas fa-notes-medical"></i> Observações
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

// Ver detalhes da consulta
async function verDetalhesConsulta(consultaId) {
    try {
        const consulta = await api.get(`/medicos/consultas/${consultaId}`);
        consultaSelecionada = consulta;
        
        // Exibir detalhes em um modal
        const detalhesHtml = `
            <div class="modal-overlay" onclick="fecharDetalhes()">
                <div class="modal-content" onclick="event.stopPropagation()" style="max-width: 600px;">
                    <div class="modal-header">
                        <h3>Detalhes da Consulta</h3>
                        <button onclick="fecharDetalhes()" class="btn-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="grid-2">
                            <div>
                                <p><strong>Paciente:</strong> ${consulta.paciente?.nome || 'N/A'}</p>
                                <p><strong>CPF:</strong> ${consulta.paciente?.cpf || 'N/A'}</p>
                                <p><strong>Telefone:</strong> ${consulta.paciente?.telefone || 'N/A'}</p>
                            </div>
                            <div>
                                <p><strong>Email:</strong> ${consulta.paciente?.email || 'N/A'}</p>
                                <p><strong>Convênio:</strong> ${consulta.paciente?.convenio?.nome || 'Particular'}</p>
                                <p><strong>Status:</strong> <span class="badge">${consulta.status}</span></p>
                            </div>
                        </div>
                        
                        ${consulta.observacoes && consulta.observacoes.length > 0 ? `
                            <hr>
                            <h4>Observações Anteriores</h4>
                            ${consulta.observacoes.map(obs => `
                                <div style="background: var(--light-bg); padding: 10px; margin: 10px 0; border-radius: 5px;">
                                    <p><strong>Data:</strong> ${new Date(obs.data_criacao).toLocaleString('pt-BR')}</p>
                                    <p>${obs.descricao}</p>
                                </div>
                            `).join('')}
                        ` : ''}
                    </div>
                    <div class="modal-footer">
                        <button onclick="fecharDetalhes()" class="btn btn-outline">Fechar</button>
                        ${consulta.status === 'AGENDADA' || consulta.status === 'CONFIRMADA' ? `
                            <button onclick="abrirModalObservacao(${consulta.id})" class="btn btn-primary">
                                <i class="fas fa-notes-medical"></i> Adicionar Observação
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', detalhesHtml);
    } catch (error) {
        console.error('Erro ao carregar detalhes:', error);
        showMessage('Erro ao carregar detalhes da consulta', 'error');
    }
}

// Abrir modal de observação
function abrirModalObservacao(consultaId) {
    fecharDetalhes();
    
    const modalHtml = `
        <div class="modal-overlay" onclick="fecharModalObservacao()">
            <div class="modal-content" onclick="event.stopPropagation()" style="max-width: 600px;">
                <div class="modal-header">
                    <h3>Adicionar Observação</h3>
                    <button onclick="fecharModalObservacao()" class="btn-close">&times;</button>
                </div>
                <form id="formObservacao" onsubmit="salvarObservacao(event, ${consultaId})">
                    <div class="modal-body">
                        <div class="form-group">
                            <label for="descricaoObservacao">Observações / Diagnóstico</label>
                            <textarea id="descricaoObservacao" required rows="6" 
                                placeholder="Registre suas observações sobre a consulta (visível apenas para você e administração)"
                            ></textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" onclick="fecharModalObservacao()" class="btn btn-outline">Cancelar</button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> Salvar Observação
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// Salvar observação
async function salvarObservacao(event, consultaId) {
    event.preventDefault();
    
    const descricao = document.getElementById('descricaoObservacao').value.trim();
    
    if (!descricao) {
        showMessage('Por favor, preencha a observação', 'error');
        return;
    }
    
    try {
        await api.post(`/medicos/consultas/${consultaId}/observacoes`, {
            descricao: descricao
        });
        
        showMessage('Observação salva com sucesso!', 'success');
        fecharModalObservacao();
        await carregarConsultas();
    } catch (error) {
        console.error('Erro ao salvar observação:', error);
        showMessage('Erro ao salvar observação: ' + error.message, 'error');
    }
}

// Fechar modais
function fecharDetalhes() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) modal.remove();
}

function fecharModalObservacao() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) modal.remove();
}

// Filtrar consultas
function filtrarConsultas() {
    const dataInicio = document.getElementById('dataInicio')?.value;
    const dataFim = document.getElementById('dataFim')?.value;
    
    let consultasFiltradas = [...todasConsultas];
    
    if (dataInicio) {
        consultasFiltradas = consultasFiltradas.filter(c => {
            const dataConsulta = new Date(c.data_hora_inicio).toISOString().split('T')[0];
            return dataConsulta >= dataInicio;
        });
    }
    
    if (dataFim) {
        consultasFiltradas = consultasFiltradas.filter(c => {
            const dataConsulta = new Date(c.data_hora_inicio).toISOString().split('T')[0];
            return dataConsulta <= dataFim;
        });
    }
    
    renderizarConsultas(consultasFiltradas);
}

// Limpar filtro
function limparFiltro() {
    document.getElementById('dataInicio').value = '';
    document.getElementById('dataFim').value = '';
    renderizarConsultas(todasConsultas);
}

// Função para exibir mensagens
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
