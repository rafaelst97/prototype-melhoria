// Gerenciamento de Horários do Médico - Integrado com API
let medicoId = null;
let horariosAtuais = [];

document.addEventListener('DOMContentLoaded', async function() {
    requireAuth();
    requireUserType('medico');
    
    medicoId = api.getUserId();
    await carregarHorarios();
    configurarFormularios();
});

// Carregar horários do médico
async function carregarHorarios() {
    try {
        const horarios = await api.get(API_CONFIG.ENDPOINTS.MEDICO_HORARIOS_LISTAR(medicoId));
        horariosAtuais = horarios;
        
        renderizarHorarios(horarios);
    } catch (error) {
        console.error('Erro ao carregar horários:', error);
        showMessage('Erro ao carregar horários.', 'error');
    }
}

function renderizarHorarios(horarios) {
    const tbody = document.querySelector('#horarios-table tbody');
    if (!tbody) return;
    
    if (horarios.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Nenhum horário cadastrado</td></tr>';
        return;
    }
    
    const diasSemana = {
        1: 'Segunda-feira', 2: 'Terça-feira', 3: 'Quarta-feira',
        4: 'Quinta-feira', 5: 'Sexta-feira', 6: 'Sábado', 7: 'Domingo'
    };
    
    tbody.innerHTML = horarios.map(h => `
        <tr>
            <td>${diasSemana[h.dia_semana] || 'N/A'}</td>
            <td>${h.hora_inicio}</td>
            <td>${h.hora_fim}</td>
            <td>${h.duracao_consulta || 30} min</td>
            <td>
                <button class="btn btn-secondary" onclick="editarHorario(${h.id})" style="padding: 5px 10px; margin-right: 5px;">Editar</button>
                <button class="btn btn-tertiary" onclick="excluirHorario(${h.id})" style="padding: 5px 10px;">Excluir</button>
            </td>
        </tr>
    `).join('');
}

// Salvar horários do médico
document.getElementById('horariosForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const btnSubmit = e.submitter || this.querySelector('button[type="submit"]');
    const originalText = btnSubmit ? btnSubmit.innerHTML : '';
    
    try {
        if (btnSubmit) {
            btnSubmit.disabled = true;
            btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
        }
        
        // Coletar horários dos checkboxes marcados
        const diasSemana = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
        const horarios = [];
        
        diasSemana.forEach((dia, index) => {
            const checkbox = document.getElementById(dia);
            if (checkbox && checkbox.checked) {
                // Coletar horários deste dia (simplificado - pegar primeiro horário)
                const diaDiv = checkbox.closest('div').parentElement;
                const inputs = diaDiv.querySelectorAll('input[type="time"]');
                
                if (inputs.length >= 2) {
                    horarios.push({
                        dia_semana: index + 1, // 1=Segunda, 2=Terça, etc
                        hora_inicio: inputs[0].value,
                        hora_fim: inputs[1].value
                    });
                }
                
                // Se tiver período da tarde
                if (inputs.length >= 4 && inputs[2].value && inputs[3].value) {
                    horarios.push({
                        dia_semana: index + 1,
                        hora_inicio: inputs[2].value,
                        hora_fim: inputs[3].value
                    });
                }
            }
        });
        
        if (horarios.length === 0) {
            showMessage('Selecione pelo menos um dia da semana!', 'error');
            if (btnSubmit) {
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = originalText;
            }
            return;
        }
        
        console.log('Enviando horários:', horarios);
        
        // Primeiro, limpar horários antigos
        try {
            await api.delete('/medicos/horarios');
            console.log('Horários antigos removidos');
        } catch (error) {
            console.warn('Erro ao limpar horários antigos:', error);
            // Continuar mesmo se der erro
        }
        
        // Enviar novos horários para API
        await api.post('/medicos/horarios', { horarios });
        
        showMessage('Horários salvos com sucesso!', 'success');
        
        if (btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = originalText;
        }
        
    } catch (error) {
        console.error('Erro ao salvar horários:', error);
        showMessage('Erro ao salvar horários: ' + error.message, 'error');
        
        if (btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = originalText;
        }
    }
});

// ==================== BLOQUEIOS ====================
async function carregarBloqueios() {
    try {
        const bloqueios = await api.get('/medicos/bloqueios');
        bloqueiosAtivos = bloqueios || [];
        renderizarBloqueios();
    } catch (error) {
        console.error('Erro ao carregar bloqueios:', error);
        const tbody = document.getElementById('lista-bloqueios');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center" style="color: var(--accent-color);">Erro ao carregar bloqueios</td></tr>';
        }
    }
}

function renderizarBloqueios() {
    const tbody = document.getElementById('lista-bloqueios');
    if (!tbody) return;
    
    if (bloqueiosAtivos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">Nenhum bloqueio ativo</td></tr>';
        return;
    }
    
    tbody.innerHTML = bloqueiosAtivos.map(bloqueio => `
        <tr>
            <td>${formatarData(bloqueio.data)}</td>
            <td>${bloqueio.hora_inicio} - ${bloqueio.hora_fim}</td>
            <td>${bloqueio.motivo || 'Não informado'}</td>
            <td>
                <button class="btn btn-secondary" style="padding: 5px 10px;" 
                        onclick="removerBloqueio(${bloqueio.id})">
                    <i class="fas fa-trash"></i> Remover
                </button>
            </td>
        </tr>
    `).join('');
}

function formatarData(dataStr) {
    const [ano, mes, dia] = dataStr.split('-');
    return `${dia}/${mes}/${ano}`;
}

async function criarBloqueio(event) {
    event.preventDefault();
    
    const data = document.getElementById('data-bloqueio').value;
    const horaInicio = document.getElementById('hora-inicio-bloqueio').value;
    const horaFim = document.getElementById('hora-fim-bloqueio').value;
    const motivo = document.getElementById('motivo-bloqueio').value;
    
    // Validações
    if (!data || !horaInicio || !horaFim) {
        mostrarErroBloqueio('Por favor, preencha todos os campos obrigatórios');
        return;
    }
    
    // Validar data futura
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataSelecionada = new Date(data + 'T00:00:00');
    
    if (dataSelecionada < hoje) {
        mostrarErroBloqueio('Não é possível bloquear datas passadas');
        return;
    }
    
    // Validar hora fim > hora início
    if (horaFim <= horaInicio) {
        mostrarErroBloqueio('Hora fim deve ser maior que hora início');
        return;
    }
    
    try {
        await api.post('/medicos/bloqueios', {
            data: data,
            hora_inicio: horaInicio,
            hora_fim: horaFim,
            motivo: motivo || null
        });
        
        // Limpar formulário
        document.getElementById('form-bloquear').reset();
        document.getElementById('bloqueio-error-message').style.display = 'none';
        
        // Recarregar lista
        await carregarBloqueios();
        
        alert('Horário bloqueado com sucesso!');
    } catch (error) {
        console.error('Erro ao criar bloqueio:', error);
        mostrarErroBloqueio(error.message || 'Erro ao bloquear horário');
    }
}

async function removerBloqueio(bloqueioId) {
    if (!confirm('Tem certeza que deseja remover este bloqueio?')) {
        return;
    }
    
    try {
        await api.delete(`/medicos/bloqueios/${bloqueioId}`);
        await carregarBloqueios();
        alert('Bloqueio removido com sucesso!');
    } catch (error) {
        console.error('Erro ao remover bloqueio:', error);
        alert('Erro ao remover bloqueio: ' + (error.message || 'Erro desconhecido'));
    }
}

function mostrarErroBloqueio(mensagem) {
    const errorDiv = document.getElementById('bloqueio-error-message');
    if (errorDiv) {
        errorDiv.textContent = mensagem;
        errorDiv.style.display = 'block';
        
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
}

function configurarFormularios() {
    const formBloqueio = document.getElementById('form-bloquear');
    if (formBloqueio) {
        formBloqueio.addEventListener('submit', criarBloqueio);
    }
    
    // Form de adicionar horário
    const formAdicionar = document.getElementById('form-adicionar-horario');
    if (formAdicionar) {
        formAdicionar.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const diaSemana = parseInt(document.getElementById('dia-semana').value);
            const horaInicio = document.getElementById('hora-inicio').value;
            const horaFim = document.getElementById('hora-fim').value;
            const duracaoConsulta = parseInt(document.getElementById('duracao-consulta').value) || 30;
            
            if (!diaSemana || !horaInicio || !horaFim) {
                showMessage('Preencha todos os campos obrigatórios!', 'error');
                return;
            }
            
            if (horaInicio >= horaFim) {
                showMessage('A hora de início deve ser anterior à hora de fim!', 'error');
                return;
            }
            
            try {
                await api.post(API_CONFIG.ENDPOINTS.MEDICO_HORARIOS_CRIAR(medicoId), {
                    dia_semana: diaSemana,
                    hora_inicio: horaInicio,
                    hora_fim: horaFim,
                    duracao_consulta: duracaoConsulta
                });
                
                showMessage('Horário adicionado com sucesso!', 'success');
                formAdicionar.reset();
                await carregarHorarios();
            } catch (error) {
                console.error('Erro ao adicionar horário:', error);
                showMessage(error.message || 'Erro ao adicionar horário.', 'error');
            }
        });
    }
    
    configurarDataMinima();
}

function configurarDataMinima() {
    const inputData = document.getElementById('data-bloqueio');
    if (inputData) {
        const amanha = new Date();
        amanha.setDate(amanha.getDate() + 1);
        inputData.min = amanha.toISOString().split('T')[0];
    }
}

// ==================== EDITAR/EXCLUIR HORÁRIOS ====================
async function editarHorario(id) {
    const horario = horariosAtuais.find(h => h.id === id);
    if (!horario) return;
    
    const diasSemana = {
        1: 'Segunda-feira', 2: 'Terça-feira', 3: 'Quarta-feira',
        4: 'Quinta-feira', 5: 'Sexta-feira', 6: 'Sábado', 7: 'Domingo'
    };
    
    const novaHoraInicio = prompt(`Editar ${diasSemana[horario.dia_semana]}\nNova hora de início (HH:MM):`, horario.hora_inicio);
    if (!novaHoraInicio) return;
    
    const novaHoraFim = prompt(`Nova hora de fim (HH:MM):`, horario.hora_fim);
    if (!novaHoraFim) return;
    
    const novaDuracao = prompt(`Nova duração de consulta (minutos):`, horario.duracao_consulta || 30);
    if (!novaDuracao) return;
    
    try {
        await api.put(API_CONFIG.ENDPOINTS.MEDICO_HORARIOS_ATUALIZAR(medicoId, id), {
            hora_inicio: novaHoraInicio,
            hora_fim: novaHoraFim,
            duracao_consulta: parseInt(novaDuracao)
        });
        
        showMessage('Horário atualizado com sucesso!', 'success');
        await carregarHorarios();
    } catch (error) {
        console.error('Erro ao atualizar horário:', error);
        showMessage(error.message || 'Erro ao atualizar horário.', 'error');
    }
}

async function excluirHorario(id) {
    if (!confirm('Deseja realmente excluir este horário?')) return;
    
    try {
        await api.delete(API_CONFIG.ENDPOINTS.MEDICO_HORARIOS_DELETAR(medicoId, id));
        showMessage('Horário excluído com sucesso!', 'success');
        await carregarHorarios();
    } catch (error) {
        console.error('Erro ao excluir horário:', error);
        showMessage(error.message || 'Erro ao excluir horário.', 'error');
    }
}

function showMessage(message, type) {
    if (type === 'error') {
        alert('ERRO: ' + message);
    } else {
        alert(message);
    }
}

