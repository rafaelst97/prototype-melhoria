#  Sistema Clínica Saúde+

Sistema completo de gerenciamento de clínicas médicas com funcionalidades para pacientes, médicos e administradores.

[![Backend Tests](https://github.com/rafaelst97/prototype-melhoria/actions/workflows/backend-tests.yml/badge.svg)](https://github.com/rafaelst97/prototype-melhoria/actions/workflows/backend-tests.yml)
[![Deploy to GitHub Pages](https://github.com/rafaelst97/prototype-melhoria/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/rafaelst97/prototype-melhoria/actions/workflows/deploy-pages.yml)
[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/rafaelst97/prototype-melhoria/releases/tag/v2.0.0)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

##  Sobre o Projeto

O **Clínica Saúde+** é um sistema web fullstack desenvolvido para otimizar a gestão de clínicas médicas, oferecendo:

-  **Portal do Paciente**: Agendamento de consultas, visualização de histórico e gerenciamento de perfil
-  **Portal do Médico**: Gestão de agenda, horários de atendimento, observações médicas e bloqueios de horários
-  **Portal Administrativo**: Gerenciamento completo de pacientes, médicos, convênios e relatórios

Projeto desenvolvido como parte da disciplina de **Melhoria de Processos de Software** da **UNIVALI**.

---

##  Tecnologias

### Backend
- **Python 3.11** com **FastAPI**
- **PostgreSQL 15** como banco de dados
- **SQLAlchemy** ORM
- **Alembic** para migrações
- **Pytest** para testes automatizados (82 testes unitários)
- **JWT** para autenticação
- **Docker** e **Docker Compose** para containerização

### Frontend
- **HTML5**, **CSS3**, **JavaScript ES6+**
- **Font Awesome** para ícones
- **Responsive Design** para mobile/tablet/desktop
- **Nginx** como servidor web

---

##  Instalação e Execução

### Pré-requisitos

- Docker Desktop instalado
- Git
- Navegador web moderno

### Passo a passo

1. **Clone o repositório**
```bash
git clone https://github.com/rafaelst97/prototype-melhoria.git
cd prototype-melhoria
```

2. **Inicie os containers**
```bash
docker-compose up -d
```

3. **Aguarde a inicialização** (aproximadamente 30 segundos)

4. **Acesse o sistema**
- Frontend: http://localhost
- Backend API: http://localhost:8000
- Documentação da API: http://localhost:8000/docs
- PgAdmin: http://localhost:5050

### 🌐 Aplicação em Produção

Acesse a aplicação já implantada: **[Clínica Saúde+ - Deploy](https://clinica-saude-frontend.onrender.com)**

> **Nota**: O primeiro acesso pode demorar ~30 segundos devido ao cold start do Render.

### Credenciais de acesso

#### 🔑 Administrador
- **Email**: admin@clinica.com
- **Senha**: admin123

#### 👨‍⚕️ Médico de Teste
- **Email**: joao.silva@clinica.com
- **Senha**: medico123

#### 📋 Paciente de Teste
- **Email**: maria.oliveira@email.com
- **Senha**: paciente123

---

##  Estrutura do Projeto

```
prototype-melhoria/
 backend/               # API FastAPI
    app/
       models/       # Modelos SQLAlchemy
       routers/      # Endpoints da API
       schemas/      # Validação Pydantic
       auth.py       # Sistema de autenticação
       database.py   # Configuração do banco
    tests/            # 82 testes unitários
    scripts/          # Scripts utilitários
    requirements.txt  # Dependências Python
 admin/                # Portal administrativo
 medico/               # Portal do médico
 paciente/             # Portal do paciente
 css/                  # Estilos globais
 js/                   # Scripts JavaScript
 config/               # Arquivos de configuração
    Dockerfile.frontend
    nginx.conf
 database/             # Scripts SQL
    init.sql
 docs/                 # Documentação completa
    deploy/
    historico/
    troubleshooting/
 docker-compose.yml    # Orquestração de containers
```

---

##  Funcionalidades

### Portal do Paciente
-  Cadastro e login com CPF
-  Agendamento de consultas por especialidade
-  Visualização de histórico de consultas
-  Gerenciamento de perfil
-  Integração com convênios médicos

### Portal do Médico
-  Login com CPF
-  Visualização de agenda de atendimentos
-  Gerenciamento de horários disponíveis
-  Bloqueio de horários específicos
-  Adição de observações médicas
-  Confirmação de consultas

### Portal Administrativo
-  Dashboard com estatísticas em tempo real
-  CRUD completo de pacientes, médicos e convênios
-  Relatórios de consultas e estatísticas
-  Busca e filtragem avançada
-  Gestão de especialidades médicas

---

##  Testes

### Testes Unitários (Backend)
```bash
cd backend
pytest tests/ -v --cov=app --cov-report=html
```

**Cobertura atual**: 82 testes com 85% de cobertura

### Testes E2E (Frontend)
```bash
pytest tests/test_e2e_playwright.py -v
```

**Cenários testados**: 13 testes end-to-end com Playwright

---

##  Documentação

Documentação completa disponível em:
- [Guia de Deploy](docs/deploy/)
- [Troubleshooting](docs/troubleshooting/)
- [Histórico de Mudanças](docs/historico/)
- [Documentação da API](http://localhost:8000/docs) (após iniciar o backend)

---

##  Deploy

O sistema está configurado para deploy em múltiplas plataformas:
- **Render** (recomendado)
- **Railway**
- **Fly.io**
- **Docker** (qualquer provedor)

Consulte [docs/deploy/](docs/deploy/) para instruções detalhadas.

---

##  Equipe

Desenvolvido por **Caio Cesar Sabino Soares, Júlia Cansian Rocha e Rafael dos Santos** como projeto da disciplina de Melhoria de Processos de Software - UNIVALI.

---

##  Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

##  Links Úteis

- [Repositório GitHub](https://github.com/rafaelst97/prototype-melhoria)
- [Issues e Bug Reports](https://github.com/rafaelst97/prototype-melhoria/issues)
- [Changelog Completo](docs/CHANGELOG_ORGANIZACAO.md)

---

**Versão**: 2.2.0 | **Última atualização**: Dezembro 2025
