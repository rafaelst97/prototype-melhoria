/**
 * CLÍNICA SAÚDE+ - Mobile Navigation
 * Script para menu mobile responsivo
 */

document.addEventListener('DOMContentLoaded', function() {
    // Criar botão de menu mobile se não existir
    if (!document.querySelector('.mobile-menu-toggle')) {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'mobile-menu-toggle';
            toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
            toggleBtn.setAttribute('aria-label', 'Toggle menu');
            
            // Inserir antes do navbar
            navbar.parentNode.insertBefore(toggleBtn, navbar);
            
            // Criar overlay
            const overlay = document.createElement('div');
            overlay.className = 'mobile-overlay';
            document.body.appendChild(overlay);
            
            // Toggle menu
            toggleBtn.addEventListener('click', function() {
                navbar.classList.toggle('mobile-active');
                overlay.classList.toggle('active');
                document.body.style.overflow = navbar.classList.contains('mobile-active') ? 'hidden' : '';
            });
            
            // Fechar ao clicar no overlay
            overlay.addEventListener('click', function() {
                navbar.classList.remove('mobile-active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            });
            
            // Fechar ao clicar em um link
            const navLinks = navbar.querySelectorAll('a');
            navLinks.forEach(link => {
                link.addEventListener('click', function() {
                    navbar.classList.remove('mobile-active');
                    overlay.classList.remove('active');
                    document.body.style.overflow = '';
                });
            });
        }
    }
    
    // Tornar tabelas responsivas
    makeTablesResponsive();
    
    // Adicionar classes de responsividade em grids
    addResponsiveClasses();
    
    // Ajustar altura de modais em mobile
    adjustModalsForMobile();
});

/**
 * Torna todas as tabelas responsivas adicionando data-labels
 */
function makeTablesResponsive() {
    const tables = document.querySelectorAll('table');
    
    tables.forEach(table => {
        // Pegar headers
        const headers = [];
        table.querySelectorAll('thead th').forEach(th => {
            headers.push(th.textContent);
        });
        
        // Adicionar data-label em cada td
        table.querySelectorAll('tbody tr').forEach(row => {
            const cells = row.querySelectorAll('td');
            cells.forEach((cell, index) => {
                if (headers[index]) {
                    cell.setAttribute('data-label', headers[index]);
                }
            });
        });
        
        // Envolver tabela em container responsivo se ainda não estiver
        if (!table.parentElement.classList.contains('table-responsive')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'table-responsive';
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        }
    });
}

/**
 * Adiciona classes de responsividade automaticamente
 */
function addResponsiveClasses() {
    // Adicionar classe responsiva em grids
    document.querySelectorAll('[style*="grid-template-columns"]').forEach(el => {
        if (!el.classList.contains('responsive-grid')) {
            el.classList.add('responsive-grid');
        }
    });
    
    // Adicionar classe em flex containers
    document.querySelectorAll('[style*="display: flex"]').forEach(el => {
        if (!el.classList.contains('responsive-flex')) {
            el.classList.add('responsive-flex');
        }
    });
}

/**
 * Ajusta modais para funcionar melhor em mobile
 */
function adjustModalsForMobile() {
    const modals = document.querySelectorAll('.modal');
    
    modals.forEach(modal => {
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            // Adicionar scroll interno se conteúdo for muito grande
            modalContent.style.maxHeight = '90vh';
            modalContent.style.overflowY = 'auto';
        }
    });
}

/**
 * Detecta orientação do dispositivo
 */
window.addEventListener('orientationchange', function() {
    // Recarregar configurações ao mudar orientação
    setTimeout(function() {
        makeTablesResponsive();
        addResponsiveClasses();
    }, 100);
});

/**
 * Prevenir zoom ao focar em inputs (iOS)
 */
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        // Garantir font-size mínimo de 16px para prevenir zoom no iOS
        const computedStyle = window.getComputedStyle(input);
        const fontSize = parseFloat(computedStyle.fontSize);
        
        if (fontSize < 16) {
            input.style.fontSize = '16px';
        }
    });
});

/**
 * Smooth scroll para âncoras
 */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href !== '') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

/**
 * Detectar tamanho da tela e adicionar classe ao body
 */
function updateScreenSizeClass() {
    const width = window.innerWidth;
    document.body.classList.remove('mobile', 'tablet', 'desktop');
    
    if (width < 768) {
        document.body.classList.add('mobile');
    } else if (width < 1024) {
        document.body.classList.add('tablet');
    } else {
        document.body.classList.add('desktop');
    }
}

updateScreenSizeClass();
window.addEventListener('resize', updateScreenSizeClass);

/**
 * Adicionar indicador de loading em botões
 */
document.addEventListener('submit', function(e) {
    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn && !submitBtn.classList.contains('loading')) {
        const originalText = submitBtn.innerHTML;
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Carregando...';
        
        // Restaurar após timeout (caso não haja tratamento específico)
        setTimeout(() => {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }, 3000);
    }
});

console.log('📱 Mobile Navigation carregado com sucesso!');
