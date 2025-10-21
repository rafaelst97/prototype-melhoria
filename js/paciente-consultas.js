// Consultas do Paciente
document.addEventListener('DOMContentLoaded', function() {
    // Cancelar consulta
    const cancelButtons = document.querySelectorAll('.btn-tertiary');
    cancelButtons.forEach(button => {
        if (button.textContent === 'Cancelar') {
            button.addEventListener('click', function() {
                if (confirm('Tem certeza que deseja cancelar esta consulta? Esta ação não pode ser desfeita.')) {
                    alert('Consulta cancelada com sucesso!');
                    // Aqui você recarregaria a página ou atualizaria a tabela
                    location.reload();
                }
            });
        }
    });
    
    // Remarcar consulta
    const remarcarButtons = document.querySelectorAll('.btn-secondary');
    remarcarButtons.forEach(button => {
        if (button.textContent === 'Remarcar') {
            button.addEventListener('click', function() {
                alert('Você será redirecionado para reagendar a consulta.');
                window.location.href = 'agendar.html';
            });
        }
    });
});
