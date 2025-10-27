// Configuração da API
const API_CONFIG = {
    BASE_URL: 'http://localhost:8000',
    ENDPOINTS: {
        // Auth
        LOGIN: '/auth/login',
        MEDICO_LOGIN: '/auth/login/medico',
        ME: '/auth/me',
        
        // Pacientes
        PACIENTE_CADASTRO: '/pacientes/cadastro',
        PACIENTE_PERFIL: '/pacientes/perfil',
        PACIENTE_CONSULTAS: '/pacientes/consultas',
        PACIENTE_HORARIOS: (medicoId) => `/pacientes/medicos/${medicoId}/horarios-disponiveis`,
        
        // Médicos
        MEDICO_PERFIL: '/medicos/perfil',
        MEDICO_CONSULTAS: '/medicos/consultas',
        MEDICO_CONSULTAS_HOJE: '/medicos/consultas/hoje',
        MEDICO_HORARIOS: '/medicos/horarios',
        MEDICO_BLOQUEIOS: '/medicos/bloqueios',
        MEDICO_ESPECIALIDADES: '/medicos/especialidades',
        
        // Admin
        ADMIN_DASHBOARD: '/admin/dashboard',
        ADMIN_MEDICOS: '/admin/medicos',
        ADMIN_PACIENTES: '/admin/pacientes',
        ADMIN_CONVENIOS: '/admin/convenios',
        ADMIN_ESPECIALIDADES: '/admin/especialidades',
        ADMIN_CONSULTAS: '/admin/consultas'
    }
};

// Classe para gerenciar requisições HTTP
class APIClient {
    constructor() {
        this.baseURL = API_CONFIG.BASE_URL;
        this.token = localStorage.getItem('token');
    }

    // Armazena o token
    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    }

    // Remove o token
    clearToken() {
        this.token = null;
        localStorage.removeItem('token');
    }

    // Headers padrão
    getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (includeAuth && this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    // GET request
    async get(endpoint, params = {}) {
        try {
            let url = `${this.baseURL}${endpoint}`;
            
            // Adicionar query parameters se existirem
            if (Object.keys(params).length > 0) {
                const queryString = new URLSearchParams(params).toString();
                url += `?${queryString}`;
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: this.getHeaders()
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('GET Error:', error);
            throw error;
        }
    }

    // POST request
    async post(endpoint, data = {}, includeAuth = true) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'POST',
                headers: this.getHeaders(includeAuth),
                body: JSON.stringify(data)
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('POST Error:', error);
            throw error;
        }
    }

    // PUT request
    async put(endpoint, data = {}) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('PUT Error:', error);
            throw error;
        }
    }

    // DELETE request
    async delete(endpoint) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('DELETE Error:', error);
            throw error;
        }
    }

    // Processa a resposta
    async handleResponse(response) {
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            // Tratar erro de autenticação
            if (response.status === 401) {
                this.clearToken();
                window.location.href = '/index.html';
                throw new Error('Sessão expirada. Faça login novamente.');
            }

            throw new Error(data.detail || 'Erro na requisição');
        }

        return data;
    }

    // Login
    async login(email, senha) {
        const response = await this.post(API_CONFIG.ENDPOINTS.LOGIN, { email, senha }, false);
        if (response.access_token) {
            this.setToken(response.access_token);
        }
        return response;
    }

    // Logout
    logout() {
        this.clearToken();
        window.location.href = '/index.html';
    }

    // Verificar se está autenticado
    isAuthenticated() {
        return !!this.token;
    }

    // Obter dados do usuário atual
    async getCurrentUser() {
        return await this.get(API_CONFIG.ENDPOINTS.ME);
    }
}

// Instância global da API
const api = new APIClient();

// Função auxiliar para exibir mensagens
function showMessage(message, type = 'success') {
    const alertClass = type === 'success' ? 'alert-success' : 'alert-error';
    const alertHTML = `
        <div class="alert ${alertClass}" style="position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 300px;">
            ${message}
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', alertHTML);
    
    setTimeout(() => {
        const alert = document.querySelector('.alert');
        if (alert) alert.remove();
    }, 3000);
}

// Função para formatar data
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

// Função para formatar hora
function formatTime(timeString) {
    if (!timeString) return '';
    return timeString.substring(0, 5); // HH:MM
}

// Verificar autenticação ao carregar páginas protegidas
function requireAuth() {
    if (!api.isAuthenticated()) {
        window.location.href = '/index.html';
    }
}
