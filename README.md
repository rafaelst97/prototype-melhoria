# Sistema de Agendamento de Consultas - Clínica Saúde+

## 📋 Descrição do Projeto

Protótipo de navegação para o Sistema de Agendamento de Consultas Médicas da Clínica Saúde+. Este projeto foi desenvolvido como parte da disciplina de Melhoria de Processos de Software da UNIVALI.

## 🎯 Objetivo

Fornecer um sistema web responsivo que permita aos pacientes agendarem consultas de forma simples e rápida, e que dê aos médicos e à administração da clínica maior controle sobre horários, disponibilidade e relatórios.

## 🏗️ Estrutura do Projeto

```
Projeto/
│
├── index.html                 # Página inicial com seleção de módulos
├── css/
│   └── style.css             # Estilos globais do sistema
│
├── paciente/                 # Módulo do Paciente
│   ├── login.html           # Login de paciente
│   ├── cadastro.html        # Cadastro de novo paciente
│   ├── dashboard.html       # Painel principal do paciente
│   ├── agendar.html         # Agendamento de consultas
│   ├── consultas.html       # Visualização de consultas
│   └── perfil.html          # Edição de perfil
│
├── medico/                   # Módulo do Médico
│   ├── login.html           # Login de médico
│   ├── dashboard.html       # Painel principal do médico
│   ├── agenda.html          # Visualização da agenda
│   ├── consultas.html       # Detalhes de consultas
│   └── horarios.html        # Gerenciamento de horários
│
├── admin/                    # Módulo Administrativo
│   ├── login.html           # Login do administrador
│   ├── dashboard.html       # Painel administrativo
│   ├── medicos.html         # Gerenciamento de médicos
│   ├── pacientes.html       # Gerenciamento de pacientes
│   ├── relatorios.html      # Geração de relatórios
│   └── convenios.html       # Gerenciamento de convênios
│
└── js/                       # Scripts JavaScript
    ├── paciente-*.js        # Scripts do módulo paciente
    ├── medico-*.js          # Scripts do módulo médico
    └── admin-*.js           # Scripts do módulo admin
```

## 🚀 Funcionalidades Principais

### 1. Módulo Paciente
- ✅ Cadastro com CPF, nome, telefone, e-mail e convênio
- ✅ Login com e-mail e senha (8-20 caracteres)
- ✅ Agendamento de consultas por especialidade, médico e horário
- ✅ Visualização de consultas futuras e passadas
- ✅ Cancelamento/remarcação de consultas (até 24h antes)
- ✅ Edição de perfil

### 2. Módulo Médico
- ✅ Login com CRM e senha
- ✅ Visualização de consultas por data
- ✅ Cadastro e edição de horários de atendimento
- ✅ Registro de observações pós-consulta
- ✅ Bloqueio de horários em caso de imprevistos

### 3. Módulo Administrativo
- ✅ Cadastro e edição de médicos (nome, CRM, especialidade, convênios)
- ✅ Visualização e gerenciamento de pacientes
- ✅ Geração de relatórios em PDF:
  - Consultas por médico ou especialidade
  - Taxa de cancelamentos e remarcações
  - Pacientes mais frequentes
- ✅ Controle de convênios aceitos

## 📏 Regras de Negócio Implementadas

1. **Cancelamentos**: Consultas só podem ser canceladas/remarcadas até 24h antes
2. **Limite de agendamentos**: Cada paciente pode ter no máximo 2 consultas futuras
3. **Agenda médica**: Médicos definem horários semanalmente, sistema evita conflitos
4. **Bloqueio por faltas**: 3 faltas consecutivas bloqueiam novos agendamentos (requer liberação administrativa)

## 🎨 Design e Responsividade

- ✅ Design moderno e responsivo
- ✅ Cores e identidade visual consistente
- ✅ Navegação intuitiva entre módulos
- ✅ Feedback visual para ações do usuário
- ✅ Adaptável para desktop, tablet e mobile

## 🔧 Tecnologias Utilizadas

- **HTML5**: Estrutura das páginas
- **CSS3**: Estilização e responsividade
- **JavaScript**: Interatividade e validações do lado do cliente

## 📖 Como Usar

1. **Abra o arquivo `index.html`** no seu navegador
2. **Selecione o módulo desejado**:
   - **Paciente**: Para agendar e gerenciar consultas
   - **Médico**: Para gerenciar agenda e atendimentos
   - **Administração**: Para gerenciar a clínica

### Credenciais de Teste (Simuladas)

**Paciente:**
- E-mail: qualquer@email.com
- Senha: qualquer senha (8-20 caracteres)

**Médico:**
- CRM: qualquer CRM
- Senha: qualquer senha

**Administrador:**
- Usuário: admin
- Senha: qualquer senha

> **Nota**: Este é um protótipo de navegação. As credenciais são simuladas e não há validação real de banco de dados.

## 📊 Próximos Passos para Implementação

1. **Backend**: Desenvolver API REST com Node.js ou Python
2. **Banco de Dados**: Implementar MySQL ou PostgreSQL
3. **Autenticação**: Sistema de autenticação JWT
4. **Notificações**: E-mail/SMS para lembretes de consulta
5. **Relatórios PDF**: Implementar geração real de PDFs
6. **Testes**: Testes unitários e de integração
7. **Deploy**: Hospedagem em servidor cloud

## 👥 Equipe de Desenvolvimento

- **Disciplina**: Melhoria de Processos de Software
- **Instituição**: UNIVALI - Escola Politécnica
- **Professora**: Daniela S. Moreira da Silva
- **Data**: Outubro de 2025

## 📝 Documentação de Processos

Este projeto segue as práticas de Melhoria de Processos de Software, incluindo:

- ✅ Planejamento de escopo e requisitos
- ✅ Cronograma de entregas
- ✅ Métricas de qualidade
- ✅ Documentação e acompanhamento

## 📄 Licença

Este projeto é desenvolvido para fins acadêmicos.

---

**Clínica Saúde+** - Sistema de Agendamento de Consultas Médicas
