// Horários do Médico
document.getElementById('horariosForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Horários salvos com sucesso!');
});

document.getElementById('bloquearForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const data = document.getElementById('dataBloquear').value;
    const horario = document.getElementById('horarioBloquear').value;
    const motivo = document.getElementById('motivoBloquear').value;
    
    if (!data || !horario) {
        alert('Por favor, preencha data e horário!');
        return;
    }
    
    alert('Horário bloqueado com sucesso!');
    document.getElementById('bloquearForm').reset();
});
