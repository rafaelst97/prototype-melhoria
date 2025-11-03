// Agendar Consulta - Integrado com API
document.addEventListener('DOMContentLoaded', async function() {
    requireAuth();
    requireUserType('paciente');
    
    const especialidadeSelect = document.getElementById('especialidade');
    const medicoSelect = document.getElementById('medico');
    const dataInput = document.getElementById('data');
    const horarioSelect = document.getElementById('horario');
    
    // Carregar especialidades
    await carregarEspecialidades();
    
    // Quando selecionar especialidade, carregar médicos
    especialidadeSelect?.addEventListener('change', async function() {
        const especialidadeId = this.value;
        medicoSelect.disabled = !especialidadeId;
        medicoSelect.innerHTML = '<option value="">Selecione um médico</option>';
        dataInput.disabled = true;
        horarioSelect.disabled = true;
        
        if (especialidadeId) {
            await carregarMedicos(especialidadeId);
        }
    });
    
    // Quando selecionar médico, habilitar data
    medicoSelect?.addEventListener('change', function() {
        dataInput.disabled = !this.value;
        horarioSelect.disabled = true;
        horarioSelect.innerHTML = '<option value="">Selecione um horário</option>';
        
        if (this.value) {
            // Definir data mínima como amanhã
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            dataInput.min = tomorrow.toISOString().split('T')[0];
        }
    });
    
    // Quando selecionar data, carregar horários disponíveis
    dataInput?.addEventListener('change', async function() {
        const medicoId = medicoSelect.value;
        const data = this.value;
        
        if (medicoId && data) {
            await carregarHorariosDisponiveis(medicoId, data);
        }
    });
    
    // Submissão do formulário
    document.getElementById('agendarForm')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const medicoId = medicoSelect.value;
        const data = dataInput.value;
        const horario = horarioSelect.value;
        
        if (!medicoId || !data || !horario) {
            showMessage('Por favor, preencha todos os campos obrigatórios!', 'error');
            return;
        }
        
        await agendarConsulta(medicoId, data, horario);
    });
});

// Carregar especialidades
async function carregarEspecialidades() {
    try {
        const especialidades = await api.get(API_CONFIG.ENDPOINTS.PACIENTE_ESPECIALIDADES);
        const especialidadeSelect = document.getElementById('especialidade');
        
        if (!especialidadeSelect) return;
        
        especialidadeSelect.innerHTML = '<option value="">Selecione uma especialidade</option>';
        
        especialidades.forEach(esp => {
            const option = document.createElement('option');
            option.value = esp.id_especialidade;
            option.textContent = esp.nome;
            especialidadeSelect.appendChild(option);
        });
        
        console.log(`✅ ${especialidades.length} especialidades carregadas`);
    } catch (error) {
        console.error('Erro ao carregar especialidades:', error);
        showMessage('Erro ao carregar especialidades', 'error');
    }
}

// Carregar médicos por especialidade
async function carregarMedicos(especialidadeId) {
    try {
        const medicos = await api.get(API_CONFIG.ENDPOINTS.PACIENTE_MEDICOS, { especialidade_id: especialidadeId });
        const medicoSelect = document.getElementById('medico');
        
        if (!medicoSelect) return;
        
        medicoSelect.innerHTML = '<option value="">Selecione um médico</option>';
        
        if (medicos && medicos.length > 0) {
            medicos.forEach(medico => {
                const option = document.createElement('option');
                option.value = medico.id_medico;
                option.textContent = `${medico.nome} - CRM ${medico.crm}`;
                medicoSelect.appendChild(option);
            });
            console.log(`✅ ${medicos.length} médicos carregados`);
        } else {
            medicoSelect.innerHTML = '<option value="">Nenhum médico disponível</option>';
            showMessage('Nenhum médico disponível para esta especialidade', 'error');
        }
    } catch (error) {
        console.error('Erro ao carregar médicos:', error);
        showMessage('Erro ao carregar médicos', 'error');
    }
}

// Carregar horários disponíveis
async function carregarHorariosDisponiveis(medicoId, data) {
    try {
        const horarios = await api.get(API_CONFIG.ENDPOINTS.PACIENTE_HORARIOS_DISPONIVEIS(medicoId), { data });
        const horarioSelect = document.getElementById('horario');
        
        if (!horarioSelect) return;
        
        horarioSelect.innerHTML = '<option value="">Selecione um horário</option>';
        horarioSelect.disabled = false;
        
        if (horarios && horarios.length > 0) {
            horarios.forEach(horario => {
                const option = document.createElement('option');
                option.value = horario;
                option.textContent = horario;
                horarioSelect.appendChild(option);
            });
            console.log(`✅ ${horarios.length} horários disponíveis`);
        } else {
            horarioSelect.innerHTML = '<option value="">Nenhum horário disponível</option>';
            showMessage('Nenhum horário disponível para esta data', 'error');
        }
    } catch (error) {
        console.error('Erro ao carregar horários:', error);
        showMessage('Erro ao carregar horários disponíveis', 'error');
    }
}

// Agendar consulta
async function agendarConsulta(medicoId, data, horario) {
    const btnSubmit = document.querySelector('#agendarForm button[type="submit"]');
    const originalText = btnSubmit ? btnSubmit.innerHTML : '';
    
    try {
        if (btnSubmit) {
            btnSubmit.disabled = true;
            btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Agendando...';
        }
        
        const pacienteId = api.getUserId();
        
        // Criar data_hora_inicio e data_hora_fim no formato ISO
        const dataHoraInicio = toISODateTime(data, horario);
        const horaFim = calcularHoraFim(horario, 30); // 30 minutos de duração
        const dataHoraFim = toISODateTime(data, horaFim);
        
        const dadosConsulta = {
            data_hora_inicio: dataHoraInicio,
            data_hora_fim: dataHoraFim,
            id_paciente_fk: parseInt(pacienteId),
            id_medico_fk: parseInt(medicoId)
        };
        
        await api.post(API_CONFIG.ENDPOINTS.PACIENTE_CONSULTAS, dadosConsulta);
        
        showMessage('Consulta agendada com sucesso!', 'success');
        
        setTimeout(() => {
            window.location.href = 'consultas.html';
        }, 2000);
        
    } catch (error) {
        console.error('Erro ao agendar consulta:', error);
        showMessage(error.message || 'Erro ao agendar consulta. Verifique se você não possui o limite de 2 consultas futuras.', 'error');
        
        if (btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = originalText;
        }
    }
}
