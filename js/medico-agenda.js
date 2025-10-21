// Agenda do Médico
document.addEventListener('DOMContentLoaded', function() {
    const filtroData = document.getElementById('filtroData');
    
    if (filtroData) {
        // Definir data de hoje como padrão
        const today = new Date().toISOString().split('T')[0];
        filtroData.value = today;
        
        filtroData.addEventListener('change', function() {
            alert('Filtrando consultas para: ' + this.value);
            // Aqui você faria uma requisição para buscar consultas da data selecionada
        });
    }
});
