#!/usr/bin/env python3
"""Script para resetar senha de paciente"""
import sys
sys.path.append('/app')

import bcrypt
from sqlalchemy import create_engine, text

# Configuração
DATABASE_URL = "postgresql://clinica_user:clinica_pass@postgres:5432/clinica_saude"

# Criar engine
engine = create_engine(DATABASE_URL)

# Gerar hash da senha usando bcrypt diretamente
nova_senha = "senha123"
senha_hash = bcrypt.hashpw(nova_senha.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

# Atualizar senha na tabela paciente
with engine.connect() as conn:
    result = conn.execute(
        text("UPDATE paciente SET senha_hash = :hash WHERE email = :email"),
        {"hash": senha_hash, "email": "ana@email.com"}
    )
    conn.commit()
    print(f"✅ Senha atualizada para ana@email.com")
    print(f"   Email: ana@email.com")
    print(f"   Senha: {nova_senha}")
    print(f"   Linhas afetadas: {result.rowcount}")
