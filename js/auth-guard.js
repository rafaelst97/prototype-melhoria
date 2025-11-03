/**
 * Auth Guard - Proteção de Rotas
 * Este script verifica se o usuário está autenticado antes de permitir acesso às páginas protegidas
 */

(function() {
    'use strict';

    // Configuração dos perfis e suas páginas permitidas
    const ROUTES = {
        paciente: {
            loginPage: '/paciente/login.html',
            allowedPages: [
                '/paciente/dashboard.html',
                '/paciente/consultas.html',
                '/paciente/agendar.html',
                '/paciente/perfil.html'
            ]
        },
        medico: {
            loginPage: '/medico/login.html',
            allowedPages: [
                '/medico/dashboard.html',
                '/medico/consultas.html',
                '/medico/agenda.html',
                '/medico/horarios.html'
            ]
        },
        admin: {
            loginPage: '/admin/login.html',
            allowedPages: [
                '/admin/dashboard.html',
                '/admin/pacientes.html',
                '/admin/medicos.html',
                '/admin/convenios.html',
                '/admin/relatorios.html'
            ]
        }
    };

    /**
     * Verifica se a página atual requer autenticação
     */
    function requiresAuth() {
        const currentPath = window.location.pathname;
        
        // Verifica se a página está na lista de páginas protegidas
        for (const role in ROUTES) {
            if (ROUTES[role].allowedPages.some(page => currentPath.endsWith(page))) {
                return role;
            }
        }
        
        return null;
    }

    /**
     * Verifica se o usuário está autenticado e tem permissão
     */
    function checkAuth() {
        const requiredRole = requiresAuth();
        
        // Se a página não requer autenticação, permitir acesso
        if (!requiredRole) {
            return;
        }

        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('userRole');

        // Se não tem token, redirecionar para login
        if (!token) {
            console.warn('⚠️ Acesso negado: Token não encontrado');
            redirectToLogin(requiredRole);
            return;
        }

        // Se o perfil não corresponde, redirecionar para login correto
        if (userRole !== requiredRole) {
            console.warn(`⚠️ Acesso negado: Perfil esperado '${requiredRole}', encontrado '${userRole}'`);
            redirectToLogin(requiredRole);
            return;
        }

        // Verificar se o token ainda é válido
        try {
            const tokenData = parseJWT(token);
            const now = Math.floor(Date.now() / 1000);
            
            if (tokenData.exp && tokenData.exp < now) {
                console.warn('⚠️ Token expirado');
                localStorage.removeItem('token');
                localStorage.removeItem('userRole');
                redirectToLogin(requiredRole);
                return;
            }
        } catch (error) {
            console.error('Erro ao validar token:', error);
            redirectToLogin(requiredRole);
            return;
        }

        console.log(`✅ Acesso autorizado para ${requiredRole}`);
    }

    /**
     * Redireciona para a página de login apropriada
     */
    function redirectToLogin(role) {
        const loginPage = ROUTES[role]?.loginPage || '/index.html';
        
        // Salvar a página que tentou acessar para redirecionar após login
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
        
        window.location.href = loginPage;
    }

    /**
     * Faz parsing do JWT token (sem validação de assinatura)
     */
    function parseJWT(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            return JSON.parse(jsonPayload);
        } catch (error) {
            throw new Error('Token inválido');
        }
    }

    /**
     * Função para logout (disponível globalmente)
     */
    window.logout = function() {
        const userRole = localStorage.getItem('userRole');
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        sessionStorage.removeItem('redirectAfterLogin');
        
        const loginPage = ROUTES[userRole]?.loginPage || '/index.html';
        window.location.href = loginPage;
    };

    // Executar verificação imediatamente
    checkAuth();

    // Monitorar mudanças no localStorage (para logout em múltiplas abas)
    window.addEventListener('storage', function(e) {
        if (e.key === 'token' && !e.newValue) {
            const requiredRole = requiresAuth();
            if (requiredRole) {
                redirectToLogin(requiredRole);
            }
        }
    });

})();
