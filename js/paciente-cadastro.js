// Carregar convênios ao iniciar
document.addEventListener('DOMContentLoaded', async function() {
    await carregarConvenios();
});

// Carregar convênios
async function carregarConvenios() {
    try {
        const convenios = await api.get(API_CONFIG.ENDPOINTS.PACIENTE_CONVENIOS);
        const selectConvenio = document.getElementById('convenio');
        
        if (!selectConvenio) return;
        
        selectConvenio.innerHTML = '<option value="">Particular (sem convênio)</option>';
        
        if (convenios && convenios.length > 0) {
            convenios.forEach(convenio => {
                const option = document.createElement('option');
                option.value = convenio.id;
                option.textContent = convenio.nome;
                selectConvenio.appendChild(option);
            });
            console.log(`✅ ${convenios.length} convênios carregados`);
        } else {
            console.log('⚠️ Nenhum convênio disponível');
        }
    } catch (error) {
        console.error('Erro ao carregar convênios:', error);
        // Erro não é crítico - usuário pode cadastrar como particular
    }
}

// Mostrar/ocultar campo de carteirinha
const convenioSelect = document.getElementById('convenio');
if (convenioSelect) {
    convenioSelect.addEventListener('change', function() {
        const carteirinhaGroup = document.getElementById('carteirinhaGroup');
        const numeroCarteirinha = document.getElementById('numeroCarteirinha');
        
        if (carteirinhaGroup && numeroCarteirinha) {
            if (this.value) {
                carteirinhaGroup.style.display = 'block';
                numeroCarteirinha.required = true;
            } else {
                carteirinhaGroup.style.display = 'none';
                numeroCarteirinha.required = false;
                numeroCarteirinha.value = '';
            }
        }
    });
}

// Cadastro do Paciente
const cadastroForm = document.getElementById('cadastroForm');
if (cadastroForm) {
    cadastroForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const btnSubmit = e.submitter || cadastroForm.querySelector('button[type="submit"]');
        const originalText = btnSubmit ? btnSubmit.innerHTML : '';
        
        const senha = document.getElementById('senha').value;
        const confirmarSenha = document.getElementById('confirmarSenha').value;
        
        if (senha.length < 8 || senha.length > 20) {
            showMessage('A senha deve ter entre 8 e 20 caracteres alfanum�ricos!', 'error');
            return;
        }
        
        if (senha !== confirmarSenha) {
            showMessage('As senhas n�o coincidem!', 'error');
            return;
        }
        
        const cpfValue = document.getElementById('cpf').value.replace(/\D/g, '');
        const telefoneValue = document.getElementById('telefone').value.replace(/\D/g, '');
        const cepInput = document.getElementById('cep');
        const cepValue = cepInput ? cepInput.value.replace(/\D/g, '') : '';
        
        if (cpfValue.length !== 11) {
            showMessage('CPF inv�lido! Deve conter 11 d�gitos.', 'error');
            return;
        }
        
        if (telefoneValue.length < 10 || telefoneValue.length > 11) {
            showMessage('Telefone inv�lido!', 'error');
            return;
        }
        
        const dadosCadastro = {
            nome: document.getElementById('nome').value,
            email: document.getElementById('email').value,
            senha: senha,
            cpf: cpfValue,
            data_nascimento: document.getElementById('dataNascimento').value,
            telefone: telefoneValue,
            endereco: document.getElementById('endereco').value || null,
            cidade: document.getElementById('cidade').value || null,
            estado: document.getElementById('estado').value || null,
            cep: cepValue || null,
            convenio_id: document.getElementById('convenio').value ? parseInt(document.getElementById('convenio').value) : null,
            numero_carteirinha: document.getElementById('numeroCarteirinha')?.value || null
        };
        
        try {
            if (btnSubmit) {
                btnSubmit.disabled = true;
                btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cadastrando...';
            }
            
            await api.post(API_CONFIG.ENDPOINTS.PACIENTE_CADASTRO, dadosCadastro, false);
            
            showMessage('Cadastro realizado com sucesso! Redirecionando...', 'success');
            
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            
        } catch (error) {
            showMessage(error.message || 'Erro ao realizar cadastro.', 'error');
            
            if (btnSubmit) {
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = originalText;
            }
        }
    });
}
