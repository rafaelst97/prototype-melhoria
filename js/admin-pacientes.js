// Pacientes - Admin
document.addEventListener('DOMContentLoaded', function() {
    // Busca de pacientes
    const searchInput = document.querySelector('input[type="text"]');
    searchInput?.addEventListener('input', function() {
        console.log('Buscando por:', this.value);
        // Aqui você implementaria a lógica de busca
    });
});
