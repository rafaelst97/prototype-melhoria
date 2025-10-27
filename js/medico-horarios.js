// Instanciar API
// API j� instanciado em api.js

// Carregar horários existentes ao iniciar
document.addEventListener('DOMContentLoaded', async function() {
    await carregarHorarios();
});

// Carregar horários do médico
async function carregarHorarios() {
    try {
        const horarios = await api.get('/medicos/horarios');
        console.log('Horários carregados:', horarios);
        
        if (horarios && horarios.length > 0) {
            console.log(`${horarios.length} horários encontrados`);
            
            // Preencher formulário com horários existentes
            // Primeiro, desmarcar todos os dias
            const diasSemana = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
            diasSemana.forEach(dia => {
                const checkbox = document.getElementById(dia);
                if (checkbox) checkbox.checked = false;
            });
            
            // Agrupar horários por dia da semana
            const horariosPorDia = {};
            horarios.forEach(h => {
                if (!horariosPorDia[h.dia_semana]) {
                    horariosPorDia[h.dia_semana] = [];
                }
                horariosPorDia[h.dia_semana].push(h);
            });
            
            // Preencher cada dia
            Object.keys(horariosPorDia).forEach(dia_semana => {
                const diaIndex = parseInt(dia_semana) - 1; // Converter de 1-based para 0-based
                if (diaIndex >= 0 && diaIndex < diasSemana.length) {
                    const diaNome = diasSemana[diaIndex];
                    const checkbox = document.getElementById(diaNome);
                    
                    if (checkbox) {
                        checkbox.checked = true;
                        
                        // Pegar os inputs de horário deste dia
                        const diaDiv = checkbox.closest('div').parentElement;
                        const inputs = diaDiv.querySelectorAll('input[type="time"]');
                        
                        const horariosdia = horariosPorDia[dia_semana];
                        
                        // Preencher primeiro período (manhã)
                        if (horariosdia[0] && inputs.length >= 2) {
                            inputs[0].value = horariosdia[0].hora_inicio;
                            inputs[1].value = horariosdia[0].hora_fim;
                        }
                        
                        // Preencher segundo período (tarde)
                        if (horariosdia[1] && inputs.length >= 4) {
                            inputs[2].value = horariosdia[1].hora_inicio;
                            inputs[3].value = horariosdia[1].hora_fim;
                        }
                    }
                }
            });
        }
    } catch (error) {
        console.error('Erro ao carregar horários:', error);
    }
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

// Bloquear horário específico
document.getElementById('bloquearForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const data = document.getElementById('dataBloquear')?.value;
    const horario = document.getElementById('horarioBloquear')?.value;
    const motivo = document.getElementById('motivoBloquear')?.value;
    
    if (!data || !horario) {
        showMessage('Por favor, preencha data e horário!', 'error');
        return;
    }
    
    const btnSubmit = e.submitter || this.querySelector('button[type="submit"]');
    const originalText = btnSubmit ? btnSubmit.innerHTML : '';
    
    try {
        if (btnSubmit) {
            btnSubmit.disabled = true;
            btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Bloqueando...';
        }
        
        // Enviar bloqueio para API
        await api.post('/medicos/bloqueios', {
            data: data,
            hora_inicio: horario,
            hora_fim: horario, // Pode ser ajustado para permitir período
            motivo: motivo || 'Indisponível'
        });
        
        showMessage('Horário bloqueado com sucesso!', 'success');
        this.reset();
        
        if (btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = originalText;
        }
        
    } catch (error) {
        console.error('Erro ao bloquear horário:', error);
        showMessage('Erro ao bloquear horário: ' + error.message, 'error');
        
        if (btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = originalText;
        }
    }
});

