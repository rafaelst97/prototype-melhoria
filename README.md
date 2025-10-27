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
├── docker-compose.yml         # Configuração Docker
├── nginx.conf                 # Configuração Nginx
│
├── css/
│   └── style.css             # Estilos globais do sistema
│
├── js/                        # Scripts JavaScript
│   ├── api.js                # Cliente API REST
│   ├── masks.js              # Máscaras de input (CPF, telefone, etc)
│   ├── paciente-*.js         # Scripts do módulo paciente
│   ├── medico-*.js           # Scripts do módulo médico
│   └── admin-*.js            # Scripts do módulo admin
│
├── paciente/                  # Módulo do Paciente
│   ├── login.html            # Login de paciente
│   ├── cadastro.html         # Cadastro de novo paciente
│   ├── dashboard.html        # Painel principal do paciente
│   ├── agendar.html          # Agendamento de consultas
│   ├── consultas.html        # Visualização de consultas
│   └── perfil.html           # Edição de perfil
│
├── medico/                    # Módulo do Médico
│   ├── login.html            # Login de médico (via CRM)
│   ├── dashboard.html        # Painel principal do médico
│   ├── agenda.html           # Visualização da agenda
│   ├── consultas.html        # Detalhes e observações
│   └── horarios.html         # Gerenciamento de horários
│
├── admin/                     # Módulo Administrativo
│   ├── login.html            # Login do administrador
│   ├── dashboard.html        # Painel administrativo
│   ├── medicos.html          # Gerenciamento de médicos
│   ├── pacientes.html        # Gerenciamento de pacientes
│   ├── relatorios.html       # Geração de relatórios PDF
│   └── convenios.html        # Gerenciamento de convênios
│
├── backend/                   # Backend FastAPI
│   ├── app/                  # Código da aplicação
│   │   ├── routers/         # Endpoints REST
│   │   ├── models/          # Models SQLAlchemy
│   │   ├── schemas/         # Schemas Pydantic
│   │   └── utils/           # Utilidades (auth, validators, relatórios)
│   ├── tests/               # Testes unitários (82 testes - 100%)
│   ├── alembic/             # Migrações de banco de dados
│   └── requirements.txt     # Dependências Python
│
├── tests/                     # Testes E2E
│   ├── e2e/                 # Scripts Playwright (13 testes)
│   ├── screenshots/         # Screenshots dos testes
│   └── README.md            # Documentação dos testes
│
├── scripts/                   # Scripts utilitários
│   ├── start.ps1            # Iniciar projeto (Windows)
│   ├── start.sh             # Iniciar projeto (Linux/Mac)
│   ├── abrir-site.bat       # Abrir no navegador
│   └── README.md            # Documentação dos scripts
│
├── docs/                      # Documentação do projeto
│   ├── RESUMO_EXECUTIVO.md
│   ├── STATUS_PROJETO_COMPLETO.md
│   ├── TESTES_AUTOMATIZADOS.md
│   └── ...                  # Outros documentos
│
└── Prompts/                   # Prompts de IA usados no projeto
    ├── ArquiteturaSistema.txt
    ├── CasosDeUso.txt
    ├── MER_Estrutura.txt
    └── ...
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

### Frontend
- **HTML5**: Estrutura das páginas
- **CSS3**: Estilização e responsividade
- **JavaScript (Vanilla)**: Interatividade e validações
- **Font Awesome**: Ícones

### Backend
- **Python 3.11+**: Linguagem principal
- **FastAPI**: Framework web RESTful
- **SQLAlchemy**: ORM para banco de dados
- **Pydantic**: Validação de dados
- **PostgreSQL 15**: Banco de dados relacional
- **JWT**: Autenticação e autorização
- **ReportLab**: Geração de relatórios PDF
- **Alembic**: Migrações de banco de dados

### DevOps & Testes
- **Docker + Docker Compose**: Containerização
- **Nginx**: Servidor web
- **Playwright**: Testes E2E
- **Pytest**: Testes unitários (82 testes - 100% conformidade)

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Docker Desktop instalado e rodando
- Git (opcional, para clonar o repositório)
- Node.js 18+ (opcional, para rodar testes E2E)

### Opção 1: Usando Scripts (Recomendado)

**Windows:**
```powershell
.\scripts\start.ps1
```

**Linux/Mac:**
```bash
chmod +x scripts/start.sh
./scripts/start.sh
```

### Opção 2: Docker Compose Manual

```bash
# Iniciar todos os serviços
docker-compose up -d

# Verificar status
docker-compose ps

# Ver logs
docker-compose logs -f

# Parar serviços
docker-compose down
```

### Opção 3: Abrir no Navegador

**Windows:**
```cmd
.\scripts\abrir-site.bat
```

Ou acesse manualmente: **http://localhost:8081**

### URLs de Acesso

- **Frontend**: http://localhost:8081
- **Backend API**: http://localhost:8000
- **API Docs (Swagger)**: http://localhost:8000/docs
- **pgAdmin**: http://localhost:5050 (admin@admin.com / admin)

## 🧪 Executando Testes

### Testes Backend (Pytest)

```bash
cd backend
python -m pytest tests/ -v
```

**Resultado esperado:** 82/82 testes passando ✅

### Testes Frontend (Playwright)

```bash
# Instalar Playwright (primeira vez)
npx playwright install chromium

# Executar todos os testes
npm test

# Testes específicos
npm run test:medico        # Suite médico completa
npm run test:conformidade  # Validação contra requisitos
npm run test:e2e          # Suite E2E completa
```

**Resultado esperado:** 10/11 testes passando (90.9%) ✅

Veja mais detalhes em [tests/README.md](tests/README.md)

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
