# 📂 Estrutura Organizada do Projeto

**Data da organização:** 02/12/2025

## ✨ O que mudou?

O projeto foi reorganizado para melhorar a manutenibilidade, facilitar a navegação e seguir as melhores práticas de estruturação de projetos.

## 📁 Nova Estrutura

```
Projeto/
├── 📱 MÓDULOS FRONTEND
│   ├── admin/              # Portal administrativo
│   ├── medico/             # Portal do médico
│   ├── paciente/           # Portal do paciente
│   ├── css/                # Estilos globais compartilhados
│   └── js/                 # Scripts JavaScript compartilhados
│
├── 🔧 BACKEND
│   └── backend/            # API FastAPI + PostgreSQL
│       ├── app/           # Código da aplicação
│       ├── tests/         # Testes unitários (82 testes)
│       └── alembic/       # Migrações do banco
│
├── ⚙️ CONFIGURAÇÃO
│   └── config/             # Todos os arquivos de configuração
│       ├── nginx.conf              # Configuração Nginx
│       ├── Dockerfile.frontend     # Docker frontend
│       ├── fly.toml               # Deploy Fly.io
│       ├── railway.json           # Deploy Railway
│       ├── render.yaml            # Deploy Render
│       └── vercel.json            # Deploy Vercel
│
├── 🗄️ BANCO DE DADOS
│   └── database/           # Scripts SQL
│       └── init.sql       # Script de inicialização
│
├── 📚 DOCUMENTAÇÃO
│   └── docs/               # Toda a documentação organizada
│       ├── INDEX.md       # 📖 Índice principal
│       ├── deploy/        # Guias de deploy
│       │   ├── DEPLOY_GUIDE.md
│       │   ├── DEPLOY_QUICKSTART.md
│       │   ├── DEPLOY_NOW.md
│       │   ├── RENDER_DEPLOY_COMPLETO.md
│       │   ├── PROJETO_ONLINE.md
│       │   └── RENDER_DEPLOY_INFO.txt
│       ├── troubleshooting/ # Soluções de problemas
│       │   ├── CORRECAO_CADASTRO_PACIENTE.md
│       │   ├── CORRECAO_CADASTRO_PACIENTE_FINAL.md
│       │   ├── CORRECOES_CADASTRO_COMPLETO.md
│       │   └── CORRECOES_FRONTEND_LOGIN_CADASTRO.md
│       ├── GUIA_POSTGRES.md
│       ├── GUIA_RAPIDO.md
│       ├── GUIA_TESTES_E2E.md
│       ├── NAVEGACAO.md
│       ├── RESPONSIVE_DESIGN.md
│       ├── ACESSO_RAPIDO.md
│       ├── CODESPACES_GUIDE.md
│       ├── COMO_CONECTAR_PGADMIN.md
│       ├── CONTRIBUTING.md
│       ├── IMPLEMENTACAO_COMPLETA.md
│       ├── PROJETO_100_COMPLETO.md
│       ├── PROXIMOS_PASSOS.md
│       ├── README_FULLSTACK.md
│       ├── RELEASE_NOTES.md
│       ├── RESUMO_EXECUTIVO_FINAL.md
│       └── TOKEN_SECRETO.md
│
├── 🧪 TESTES
│   └── tests/              # Testes automatizados
│       ├── e2e/           # Testes end-to-end (Playwright)
│       └── temp/          # Arquivos temporários de teste
│
├── 🛠️ SCRIPTS
│   └── scripts/            # Scripts utilitários
│
├── 📸 ASSETS
│   └── screenshots/        # Capturas de tela do sistema
│
├── 💾 MEMÓRIA
│   └── memoria/            # Histórico e backups
│
├── 🤖 PROMPTS
│   └── Prompts/            # Prompts de IA usados no projeto
│
└── 📄 ARQUIVOS PRINCIPAIS
    ├── docker-compose.yml  # Orquestração de containers
    ├── index.html          # Página inicial do sistema
    ├── package.json        # Dependências Node.js
    ├── README.md           # Documentação principal
    ├── LICENSE             # Licença do projeto
    └── favicon.ico         # Ícone do site
```

## 🗑️ Arquivos Removidos

Para manter o projeto limpo, os seguintes arquivos foram removidos:

### Relatórios de Teste Antigos
- ❌ `relatorio_testes_20251103_*.txt` (8 arquivos)

### Screenshots Antigas
- ❌ `erro_*.png` (4 arquivos de erro)
- ❌ `cadastro-*.png` (2 screenshots de cadastro)

### Arquivos Temporários
- ❌ `test_response.json`
- ❌ `test_utf8.json`

### Arquivos de Teste Movidos
Os seguintes arquivos foram movidos para `tests/temp/`:
- 📦 `teste_cadastro.html`
- 📦 `teste-api.html`
- 📦 `teste-dropdown.html`
- 📦 `teste-api.js`
- 📦 `teste_selenium.py`
- 📦 `teste-selenium.ps1`
- 📦 `diagnostico-simples.html`

### Documentação Duplicada
- ❌ `DEPLOY.md` (informações já presentes em `docs/deploy/`)

## 🔄 Referências Atualizadas

Os seguintes arquivos tiveram suas referências atualizadas:

### `docker-compose.yml`
- ✅ `./init.sql` → `./database/init.sql`
- ✅ `./nginx.conf` → `./config/nginx.conf`

### `config/Dockerfile.frontend`
- ✅ `COPY nginx.conf` → `COPY config/nginx.conf`
- ✅ Removidas referências a arquivos de teste

## 📖 Como Navegar na Documentação

1. **Início:** Leia o [README.md](../README.md) principal
2. **Índice Completo:** Veja [docs/INDEX.md](INDEX.md) para toda a documentação
3. **Deploy:** Acesse [docs/deploy/](deploy/) para guias de publicação
4. **Problemas:** Consulte [docs/troubleshooting/](troubleshooting/) para soluções

## ✅ Benefícios da Nova Organização

1. **📚 Documentação centralizada** - Todos os `.md` estão em `docs/`
2. **⚙️ Configurações agrupadas** - Fácil encontrar arquivos de deploy
3. **🗄️ Banco separado** - Scripts SQL em pasta dedicada
4. **🧹 Raiz limpa** - Apenas arquivos essenciais na raiz
5. **🔍 Fácil navegação** - Estrutura lógica e intuitiva
6. **🧪 Testes organizados** - Arquivos temporários separados

## 🚀 Próximos Passos

Após a organização, o projeto está pronto para:

1. ✅ Desenvolvimento contínuo com estrutura clara
2. ✅ Onboarding mais fácil de novos desenvolvedores
3. ✅ Manutenção simplificada
4. ✅ Deploy sem complicações

---

**💡 Dica:** Use o [Índice de Documentação](INDEX.md) como ponto de partida para encontrar qualquer informação sobre o projeto.
