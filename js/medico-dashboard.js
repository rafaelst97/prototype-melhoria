// Dashboard do Médico - Integrado com API
let medicoId = null;

document.addEventListener('DOMContentLoaded', async function() {
    requireAuth();
    requireUserType('medico');
    
    medicoId = api.getUserId();
    await carregarDadosMedico();
    await carregarEstatisticas();
});

async function carregarDadosMedico() {
    try {
        const medico = await api.get(API_CONFIG.ENDPOINTS.MEDICO_PERFIL(medicoId));
        
        const doctorNameElement = document.getElementById('doctorName');
        if (doctorNameElement) {
            doctorNameElement.textContent = medico.nome || 'Médico';
        }
        
        // Exibir especialidade se houver elemento
        const especialidadeElement = document.getElementById('especialidade');
        if (especialidadeElement && medico.especialidade) {
            especialidadeElement.textContent = medico.especialidade.nome;
        }
    } catch (error) {
        console.error('Erro ao carregar dados do médico:', error);
    }
}

async function carregarEstatisticas() {
    try {
        const hoje = new Date().toISOString().split('T')[0];
        
        // Carregar consultas do dia
        const consultasHoje = await api.get(API_CONFIG.ENDPOINTS.MEDICO_CONSULTAS(medicoId), {
            params: { data: hoje }
        });
        
        // Atualizar estatísticas na tela
        const totalConsultasElement = document.getElementById('totalConsultas');
        if (totalConsultasElement) {
            totalConsultasElement.textContent = consultasHoje.length;
        }
        
        const consultasRealizadasElement = document.getElementById('consultasRealizadas');
        if (consultasRealizadasElement) {
            const realizadas = consultasHoje.filter(c => c.status === 'realizada').length;
            consultasRealizadasElement.textContent = realizadas;
        }
        
        const consultasPendentesElement = document.getElementById('consultasPendentes');
        if (consultasPendentesElement) {
            const pendentes = consultasHoje.filter(c => ['agendada', 'confirmada'].includes(c.status)).length;
            consultasPendentesElement.textContent = pendentes;
        }
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
    }
}
