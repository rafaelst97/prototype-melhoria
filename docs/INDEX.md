# 📚 Índice de Documentação - Clínica Saúde+

> **🎉 Projeto Organizado e Limpo em 02/12/2025!**  
> O projeto foi reorganizado e documentação obsoleta foi arquivada.  
> 📋 [Ver reorganização da raiz →](ORGANIZACAO_RESUMO.md) | 📂 [Ver reorganização das subpastas →](REORGANIZACAO_SUBPASTAS.md)

Este índice organiza toda a documentação útil e atual do projeto.

> **📦 Nota:** Documentação histórica foi movida para `docs/historico/` para consulta futura.

## 📖 Documentação Principal

- [README Principal](../README.md) - Visão geral do projeto
- [README Fullstack](README_FULLSTACK.md) - Documentação técnica completa do sistema fullstack
- [Guia Rápido](GUIA_RAPIDO.md) - Início rápido para desenvolvedores
- [Acesso Rápido](ACESSO_RAPIDO.md) - Links e atalhos importantes

## 🚀 Deploy e Publicação

Todos os guias de deploy estão em [`deploy/`](deploy/):

- [Deploy Guide](deploy/DEPLOY_GUIDE.md) - Guia completo de deploy em múltiplas plataformas
- [Deploy Quickstart](deploy/DEPLOY_QUICKSTART.md) - Deploy rápido passo a passo
- [Deploy Now](deploy/DEPLOY_NOW.md) - Projeto 100% online
- [Render Deploy Completo](deploy/RENDER_DEPLOY_COMPLETO.md) - Guia específico para Render.com
- [Projeto Online](deploy/PROJETO_ONLINE.md) - Informações sobre o projeto em produção
- [Deploy Info](deploy/RENDER_DEPLOY_INFO.txt) - Informações técnicas do deploy no Render

## 🛠️ Guias Técnicos

### Banco de Dados
- [Guia PostgreSQL](GUIA_POSTGRES.md) - Configuração e uso do PostgreSQL
- [Como Conectar PgAdmin](COMO_CONECTAR_PGADMIN.md) - Configuração do PgAdmin

### Testes
- [Guia de Testes E2E](GUIA_TESTES_E2E.md) - Testes end-to-end com Playwright

### Frontend
- [Navegação](NAVEGACAO.md) - Estrutura de navegação do sistema
- [Responsive Design](RESPONSIVE_DESIGN.md) - Design responsivo e mobile-first

## 🐛 Troubleshooting e Correções

Documentação de problemas resolvidos em [`troubleshooting/`](troubleshooting/):

- [Correção Cadastro Paciente](troubleshooting/CORRECAO_CADASTRO_PACIENTE.md)
- [Correção Cadastro Paciente Final](troubleshooting/CORRECAO_CADASTRO_PACIENTE_FINAL.md)
- [Correções Cadastro Completo](troubleshooting/CORRECOES_CADASTRO_COMPLETO.md)
- [Correções Frontend Login/Cadastro](troubleshooting/CORRECOES_FRONTEND_LOGIN_CADASTRO.md)

## 📝 Desenvolvimento

- [Contributing](CONTRIBUTING.md) - Guia para contribuidores
- [Codespaces Guide](CODESPACES_GUIDE.md) - Usando GitHub Codespaces
- [Implementação Completa](IMPLEMENTACAO_COMPLETA.md) - Detalhes da implementação

## 📋 Planejamento e Histórico

- [Próximos Passos](PROXIMOS_PASSOS.md) - Roadmap e próximas funcionalidades
- [Release Notes](RELEASE_NOTES.md) - Notas de versão
- [Resumo Executivo Final](RESUMO_EXECUTIVO_FINAL.md) - Resumo executivo do projeto
- [Projeto 100% Completo](PROJETO_100_COMPLETO.md) - Marco de conclusão

## 🔐 Segurança

- [Token Secreto](TOKEN_SECRETO.md) - Configuração de tokens e segurança

## 📂 Estrutura do Projeto

```
Projeto/
├── admin/              # Portal administrativo
├── backend/            # API FastAPI + Python
├── config/             # Arquivos de configuração
│   ├── nginx.conf
│   ├── Dockerfile.frontend
│   ├── fly.toml
│   ├── railway.json
│   ├── render.yaml
│   └── vercel.json
├── css/                # Estilos globais
├── database/           # Scripts SQL
│   └── init.sql
├── docs/               # Documentação (esta pasta)
│   ├── deploy/        # Guias de deploy
│   └── troubleshooting/ # Soluções de problemas
├── js/                 # Scripts JavaScript
├── medico/             # Portal do médico
├── paciente/           # Portal do paciente
├── scripts/            # Scripts utilitários
├── screenshots/        # Capturas de tela
├── tests/              # Testes automatizados
│   ├── e2e/           # Testes end-to-end
│   └── temp/          # Arquivos temporários de teste
├── docker-compose.yml  # Orquestração Docker
├── index.html          # Página inicial
├── package.json        # Dependências Node.js
└── README.md           # Documentação principal
```

## 🆘 Precisa de Ajuda?

1. **Problemas de deploy?** → Veja [`deploy/`](deploy/)
2. **Erros no sistema?** → Veja [`troubleshooting/`](troubleshooting/)
3. **Configuração inicial?** → Veja [GUIA_RAPIDO.md](GUIA_RAPIDO.md)
4. **Dúvidas sobre PostgreSQL?** → Veja [GUIA_POSTGRES.md](GUIA_POSTGRES.md)

---

**Última atualização:** 02/12/2025
