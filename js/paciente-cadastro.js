// Carregar planos de saúde (convênios)
async function carregarPlanosSaude() {
    console.log('🔄 Iniciando carregamento de planos de saúde...');
    try {
        const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PACIENTE_PLANOS_SAUDE}`;
        console.log('📡 URL:', url);
        
        const response = await fetch(url);
        console.log('📥 Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const planosSaude = await response.json();
        console.log('📦 Planos recebidos:', planosSaude);
        
        const selectPlanoSaude = document.getElementById('convenio');
        if (!selectPlanoSaude) {
            console.error('❌ Elemento select#convenio não encontrado!');
            return;
        }
        
        selectPlanoSaude.innerHTML = '<option value="">Particular (sem plano de saúde)</option>';
        
        if (planosSaude && planosSaude.length > 0) {
            planosSaude.forEach(plano => {
                const option = document.createElement('option');
                option.value = plano.id_plano_saude;
                option.textContent = plano.nome;
                selectPlanoSaude.appendChild(option);
            });
            console.log(`✅ ${planosSaude.length} planos de saúde carregados no dropdown`);
        } else {
            console.log('⚠️ Nenhum plano de saúde disponível no array');
        }
    } catch (error) {
        console.error('❌ Erro ao carregar planos de saúde:', error);
        alert('Erro ao carregar convênios. Por favor, recarregue a página.');
    }
}

// Validações em tempo real e inicialização
document.addEventListener('DOMContentLoaded', async function () {
    console.log('✅ DOM carregado, iniciando cadastro...');
    
    // Carregar planos de saúde
    await carregarPlanosSaude();
    const form = document.getElementById('cadastroForm');
    const senhaInput = document.getElementById('senha');
    const confirmarSenhaInput = document.getElementById('confirmarSenha');
    const submitButton = document.getElementById('btnCadastrar');
    const btnText = document.getElementById('btnText');
    const btnLoading = document.getElementById('btnLoading');

    // Objeto para rastrear a validade de cada campo (iniciando tudo como true para permitir envio inicial)
    const validity = {
        nome: true,
        email: true,
        cpf: true,
        dataNascimento: true,
        telefone: true,
        senha: true,
        confirmarSenha: true,
    };

    // Função para mostrar erro
    function mostrarErro(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorDiv = field.nextElementSibling;
        if (errorDiv && errorDiv.classList.contains('error-message')) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
        field.classList.add('is-invalid');
    }

    // Função para limpar erro
    function limparErro(fieldId) {
        const field = document.getElementById(fieldId);
        const errorDiv = field.nextElementSibling;
        if (errorDiv && errorDiv.classList.contains('error-message')) {
            errorDiv.style.display = 'none';
        }
        field.classList.remove('is-invalid');
    }

    // Função para verificar a validade geral e habilitar/desabilitar o botão
    function checkFormValidity() {
        const allValid = Object.values(validity).every(v => v === true);
        submitButton.disabled = !allValid;
    }

    // Adiciona divs de erro dinamicamente
    form.querySelectorAll('input').forEach(input => {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        input.parentNode.insertBefore(errorDiv, input.nextSibling);
    });

    // VALIDAÇÕES EM TEMPO REAL
    document.getElementById('nome').addEventListener('blur', function () {
        if (this.value.trim().length > 0 && this.value.trim().length < 3) {
            mostrarErro('nome', 'Nome deve ter no mínimo 3 caracteres.');
            validity.nome = false;
        } else if (this.value.trim().length >= 3) {
            limparErro('nome');
            validity.nome = true;
        }
        checkFormValidity();
    });

    document.getElementById('email').addEventListener('blur', function () {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (this.value.trim().length > 0 && !emailRegex.test(this.value)) {
            mostrarErro('email', 'Por favor, insira um email válido.');
            validity.email = false;
        } else if (this.value.trim().length > 0) {
            limparErro('email');
            validity.email = true;
        }
        checkFormValidity();
    });

    document.getElementById('cpf').addEventListener('blur', function () {
        const cpfLimpo = this.value.replace(/\D/g, '');
        if (cpfLimpo.length > 0 && cpfLimpo.length !== 11) {
            mostrarErro('cpf', 'CPF deve conter 11 dígitos.');
            validity.cpf = false;
        } else if (cpfLimpo.length === 11) {
            limparErro('cpf');
            validity.cpf = true;
        }
        checkFormValidity();
    });

    document.getElementById('dataNascimento').addEventListener('change', function () {
        if (!this.value) {
            mostrarErro('dataNascimento', 'Data de nascimento é obrigatória.');
            validity.dataNascimento = false;
        } else {
            limparErro('dataNascimento');
            validity.dataNascimento = true;
        }
        checkFormValidity();
    });

    document.getElementById('telefone').addEventListener('blur', function () {
        const telLimpo = this.value.replace(/\D/g, '');
        if (telLimpo.length > 0 && telLimpo.length < 10) {
            mostrarErro('telefone', 'Telefone deve ter no mínimo 10 dígitos.');
            validity.telefone = false;
        } else if (telLimpo.length >= 10) {
            limparErro('telefone');
            validity.telefone = true;
        }
        checkFormValidity();
    });

    senhaInput.addEventListener('blur', function () {
        const senha = this.value;
        let valid = true;
        if (senha.length > 0 && (senha.length < 8 || senha.length > 20)) {
            mostrarErro('senha', 'A senha deve ter entre 8 e 20 caracteres.');
            valid = false;
        } else if (senha.length > 0 && (!/[a-zA-Z]/.test(senha) || !/[0-9]/.test(senha))) {
            mostrarErro('senha', 'A senha deve conter letras e números.');
            valid = false;
        } else if (senha.length >= 8) {
            limparErro('senha');
        }
        validity.senha = valid;
        // Re-validar confirmação de senha
        if (confirmarSenhaInput.value.length > 0) {
            confirmarSenhaInput.dispatchEvent(new Event('blur'));
        }
        checkFormValidity();
    });

    confirmarSenhaInput.addEventListener('blur', function () {
        if (this.value.length > 0 && this.value !== senhaInput.value) {
            mostrarErro('confirmarSenha', 'As senhas não coincidem.');
            validity.confirmarSenha = false;
        } else if (this.value.length > 0 && this.value === senhaInput.value) {
            limparErro('confirmarSenha');
            validity.confirmarSenha = true;
        }
        checkFormValidity();
    });

    // Inicializa o botão como HABILITADO (validação acontece no submit)
    submitButton.disabled = false;

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        console.log('📝 Formulário submetido');
        
        // Validar campos obrigatórios manualmente
        const nome = document.getElementById('nome').value.trim();
        const email = document.getElementById('email').value.trim();
        const cpf = document.getElementById('cpf').value.replace(/\D/g, '');
        const telefone = document.getElementById('telefone').value.replace(/\D/g, '');
        const senha = document.getElementById('senha').value;
        const confirmarSenha = document.getElementById('confirmarSenha').value;
        const dataNascimento = document.getElementById('dataNascimento').value;
        
        // Validações
        let hasError = false;
        
        if (!nome || nome.length < 3) {
            mostrarErro('nome', 'Nome deve ter no mínimo 3 caracteres.');
            hasError = true;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            mostrarErro('email', 'Por favor, insira um email válido.');
            hasError = true;
        }
        
        if (!cpf || cpf.length !== 11) {
            mostrarErro('cpf', 'CPF deve conter 11 dígitos.');
            hasError = true;
        }
        
        if (!telefone || telefone.length < 10) {
            mostrarErro('telefone', 'Telefone deve ter no mínimo 10 dígitos.');
            hasError = true;
        }
        
        if (!senha || senha.length < 8 || senha.length > 20) {
            mostrarErro('senha', 'A senha deve ter entre 8 e 20 caracteres.');
            hasError = true;
        } else if (!/[a-zA-Z]/.test(senha) || !/[0-9]/.test(senha)) {
            mostrarErro('senha', 'A senha deve conter letras e números.');
            hasError = true;
        }
        
        if (!confirmarSenha || confirmarSenha !== senha) {
            mostrarErro('confirmarSenha', 'As senhas não coincidem.');
            hasError = true;
        }
        
        if (!dataNascimento) {
            mostrarErro('dataNascimento', 'Data de nascimento é obrigatória.');
            hasError = true;
        }
        
        if (hasError) {
            console.log('❌ Formulário inválido');
            alert('Por favor, corrija os erros no formulário.');
            return;
        }

        console.log('✅ Formulário válido, iniciando cadastro...');
        submitButton.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline';

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Formatar dados para o backend
        data.cpf = cpf;
        data.telefone = telefone;
        data.data_nascimento = dataNascimento; // type="date" já retorna YYYY-MM-DD
        delete data.dataNascimento;
        delete data.confirmarSenha; // Não enviar confirmação
        
        // Adicionar id_plano_saude_fk
        const convenioValue = document.getElementById('convenio').value;
        data.id_plano_saude_fk = convenioValue ? parseInt(convenioValue) : null;
        
        console.log('📤 Dados a serem enviados:', data);

        // Fazer requisição para o endpoint correto
        const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PACIENTE_CADASTRO}`;
        console.log('📡 Enviando para:', url);
        
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => Promise.reject(err));
            }
            return response.json();
        })
        .then(response => {
            console.log('✅ Cadastro realizado com sucesso:', response);
            alert('Cadastro realizado com sucesso! Você será redirecionado para a página de login.');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 500);
        })
        .catch(error => {
            console.error('❌ Erro no cadastro:', error);
            
            // Tratar erro corretamente (error é o JSON retornado)
            if (error && error.detail) {
                const detail = error.detail;
                if (detail.includes("email")) {
                    mostrarErro('email', 'Este email já está cadastrado. Tente fazer login.');
                    validity.email = false;
                } else if (detail.includes("CPF")) {
                    mostrarErro('cpf', 'Este CPF já está cadastrado.');
                    validity.cpf = false;
                } else {
                    alert(`Erro no cadastro: ${detail}`);
                }
            } else {
                alert('Ocorreu um erro inesperado. Tente novamente.');
            }
        })
        .finally(() => {
            submitButton.disabled = false;
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
            checkFormValidity();
        });
    });
});
