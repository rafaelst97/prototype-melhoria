// Relatórios - Admin
document.getElementById('relatorioMedicoForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Gerando relatório de consultas por médico em PDF...');
});

document.getElementById('relatorioEspecialidadeForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Gerando relatório de consultas por especialidade em PDF...');
});

document.getElementById('relatorioCancelamentoForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Gerando relatório de cancelamentos em PDF...');
});

document.getElementById('relatorioPacienteForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Gerando relatório de pacientes mais frequentes em PDF...');
});
