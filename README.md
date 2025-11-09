# Sistema de Agendamento de Consultas - Clínica Saúde+

[![Backend Tests](https://img.shields.io/badge/backend%20tests-82%2F82%20passing-success)](backend/tests)
[![E2E Tests](https://img.shields.io/badge/e2e%20tests-10%2F11%20passing-yellow)](tests)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/fastapi-0.104+-green.svg)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/postgresql-15-blue.svg)](https://www.postgresql.org/)

## 📋 Descrição do Projeto

Sistema completo de agendamento de consultas médicas desenvolvido para a Clínica Saúde+. Projeto full-stack com backend FastAPI, banco de dados PostgreSQL e frontend responsivo, desenvolvido como parte da disciplina de Melhoria de Processos de Software da UNIVALI.

## 🎯 Objetivo

Fornecer um sistema web completo e responsivo que permita:
- **Pacientes**: Agendarem consultas de forma simples e intuitiva
- **Médicos**: Gerenciarem agenda, horários e registrarem observações
- **Administração**: Controle total sobre médicos, pacientes e relatórios gerenciais

## ✨ Destaques do Projeto

- ✅ **100% Funcional**: Sistema completo com backend e banco de dados integrados
- ✅ **82 Testes Unitários**: Cobertura completa de endpoints e regras de negócio
- ✅ **10 Testes E2E**: Validação de fluxos completos de usuário
- ✅ **Docker Ready**: Deploy simplificado com Docker Compose
- ✅ **API RESTful**: Documentação automática com Swagger/OpenAPI
- ✅ **Relatórios PDF**: Geração automática de relatórios gerenciais
- ✅ **Responsivo**: Funciona em desktop, tablet e mobile

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
- ✅ Dashboard com estatísticas em tempo real
- ✅ Visualização de agenda diária com detalhes de pacientes
- ✅ Consultas históricas com filtros por período
- ✅ Cadastro e edição de observações médicas (CRUD completo)
- ✅ Gerenciamento de horários de atendimento semanais
- ✅ Bloqueio de horários específicos (férias, compromissos)
- ✅ Máscaras de CPF e telefone para melhor UX

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
3. **Agenda médica**: Médicos definem horários semanalmente, sistema evita conflitos automaticamente
4. **Bloqueio por faltas**: 3 faltas consecutivas bloqueiam novos agendamentos (requer liberação administrativa)
5. **Horários de trabalho**: Sistema permite dois períodos por dia (manhã/tarde)
6. **Bloqueios específicos**: Médicos podem bloquear horários específicos para compromissos
7. **Validação de CPF**: Sistema valida formato e unicidade de CPF
8. **Observações médicas**: Uma observação por consulta, editável pelo médico

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

### Credenciais de Teste

**Banco de Dados Populado com Dados de Teste**

**Pacientes:**
- E-mail: `maria.silva@email.com` / Senha: `paciente123`
- E-mail: `joao.santos@email.com` / Senha: `paciente123`
- E-mail: `ana.costa@email.com` / Senha: `paciente123`

**Médicos:**
- E-mail: `joao1@clinica.com` / Senha: `medico123` (Dr. João Silva - Cardiologia)
- E-mail: `maria@clinica.com` / Senha: `medico123` (Dra. Maria Santos - Pediatria)

**Administrador:**
- E-mail: `admin@clinica.com` / Senha: `admin123`

> **Nota**: O banco de dados PostgreSQL já vem populado com dados de teste, incluindo especialidades, convênios, pacientes, médicos e consultas de exemplo.

## 📊 Status do Projeto

### ✅ Implementado
- [x] Backend FastAPI completo com 82 testes unitários
- [x] Banco de dados PostgreSQL com migrations
- [x] Autenticação JWT para todos os módulos
- [x] Módulo Paciente 100% funcional
- [x] Módulo Médico 100% funcional (incluindo observações e bloqueios)
- [x] Módulo Administrativo 100% funcional
- [x] Geração de relatórios PDF
- [x] Testes E2E com Playwright (10/11 passando)
- [x] Docker Compose para deploy simplificado
- [x] Documentação API automática (Swagger)
- [x] Máscaras e validações de formulário
- [x] Design responsivo mobile-first

### 🚀 Melhorias Futuras
- [ ] Notificações por e-mail/SMS
- [ ] Sistema de lembretes automáticos
- [ ] Dashboard com gráficos e analytics
- [ ] Integração com prontuário eletrônico
- [ ] App mobile nativo (React Native/Flutter)
- [ ] Telemedicina/consultas online

## 👥 Equipe de Desenvolvimento

**Desenvolvedores:**
- **CAIO CÉSAR SABINO SOARES**
- **JÚLIA CANSIAN ROCHA**
- **RAFAEL DOS SANTOS**

**Instituição:** UNIVALI - Escola Politécnica  
**Disciplina:** Melhoria de Processos de Software  
**Professora:** Daniela S. Moreira da Silva  
**Período:** Outubro - Novembro 2025

## 📝 Documentação Adicional

- **[RESUMO_EXECUTIVO_FINAL.md](RESUMO_EXECUTIVO_FINAL.md)**: Visão geral completa do projeto
- **[PROJETO_100_COMPLETO.md](PROJETO_100_COMPLETO.md)**: Detalhes técnicos de implementação
- **[docs/](docs/)**: Documentação detalhada de cada módulo
- **[Prompts/](Prompts/)**: Prompts de IA utilizados no desenvolvimento
- **[tests/README.md](tests/README.md)**: Guia completo de testes
- **[DEPLOY.md](DEPLOY.md)**: Guia de deploy e configuração

## 🔗 Links Úteis

- **[API Documentation (Swagger)](http://localhost:8000/docs)**: Documentação interativa da API
- **[ReDoc](http://localhost:8000/redoc)**: Documentação alternativa da API
- **[pgAdmin](http://localhost:5050)**: Interface web para PostgreSQL
- **[GitHub Repository](https://github.com/rafaelst97/prototype-melhoria)**: Código fonte

## 🤝 Contribuindo

Este é um projeto acadêmico, mas contribuições são bem-vindas:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é desenvolvido para fins acadêmicos na disciplina de Melhoria de Processos de Software da UNIVALI.

---

**Clínica Saúde+** - Sistema de Agendamento de Consultas Médicas  
*Desenvolvido com ❤️ por Caio César, Júlia Cansian e Rafael dos Santos*