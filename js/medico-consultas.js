// Consultas do Médico
document.getElementById('observacoesForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const diagnostico = document.getElementById('diagnostico').value;
    const prescricao = document.getElementById('prescricao').value;
    
    if (!diagnostico && !prescricao) {
        alert('Por favor, preencha pelo menos um dos campos!');
        return;
    }
    
    alert('Observações salvas com sucesso!');
    window.location.href = 'agenda.html';
});
