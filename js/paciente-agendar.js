// Agendar Consulta
document.addEventListener('DOMContentLoaded', function() {
    const especialidadeSelect = document.getElementById('especialidade');
    const medicoSelect = document.getElementById('medico');
    const dataInput = document.getElementById('data');
    const horarioSelect = document.getElementById('horario');
    
    // Médicos por especialidade (simulado)
    const medicosPorEspecialidade = {
        'cardiologia': ['Dr. João Silva - CRM 12345', 'Dra. Paula Cardoso - CRM 54322'],
        'dermatologia': ['Dr. Carlos Mendes - CRM 78901'],
        'ortopedia': ['Dra. Maria Santos - CRM 54321'],
        'pediatria': ['Dr. Roberto Lima - CRM 11223'],
        'clinico-geral': ['Dr. Pedro Oliveira - CRM 98765'],
        'ginecologia': ['Dra. Julia Ferreira - CRM 33445'],
        'oftalmologia': ['Dra. Ana Costa - CRM 45678']
    };
    
    // Horários disponíveis (simulado)
    const horariosDisponiveis = [
        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
        '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
        '16:00', '16:30', '17:00', '17:30'
    ];
    
    // Quando selecionar especialidade, carregar médicos
    especialidadeSelect?.addEventListener('change', function() {
        const especialidade = this.value;
        medicoSelect.disabled = !especialidade;
        medicoSelect.innerHTML = '<option value="">Selecione um médico</option>';
        
        if (especialidade && medicosPorEspecialidade[especialidade]) {
            medicosPorEspecialidade[especialidade].forEach(medico => {
                const option = document.createElement('option');
                option.value = medico;
                option.textContent = medico;
                medicoSelect.appendChild(option);
            });
        }
        
        dataInput.disabled = true;
        horarioSelect.disabled = true;
    });
    
    // Quando selecionar médico, habilitar data
    medicoSelect?.addEventListener('change', function() {
        dataInput.disabled = !this.value;
        if (this.value) {
            // Definir data mínima como amanhã
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            dataInput.min = tomorrow.toISOString().split('T')[0];
        }
    });
    
    // Quando selecionar data, carregar horários
    dataInput?.addEventListener('change', function() {
        horarioSelect.disabled = !this.value;
        horarioSelect.innerHTML = '<option value="">Selecione um horário</option>';
        
        if (this.value) {
            horariosDisponiveis.forEach(horario => {
                const option = document.createElement('option');
                option.value = horario;
                option.textContent = horario;
                horarioSelect.appendChild(option);
            });
        }
    });
    
    // Submissão do formulário
    document.getElementById('agendarForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const especialidade = especialidadeSelect.value;
        const medico = medicoSelect.value;
        const data = dataInput.value;
        const horario = horarioSelect.value;
        
        if (!especialidade || !medico || !data || !horario) {
            alert('Por favor, preencha todos os campos obrigatórios!');
            return;
        }
        
        // Simular agendamento bem-sucedido
        alert('Consulta agendada com sucesso!');
        window.location.href = 'consultas.html';
    });
});
