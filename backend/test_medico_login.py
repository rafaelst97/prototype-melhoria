import bcrypt
from app.database import SessionLocal
from app.models.models import Medico

db = SessionLocal()

# Buscar médico
medico = db.query(Medico).filter(Medico.email == 'joao1@clinica.com').first()

if medico:
    print(f"✓ Médico encontrado:")
    print(f"  Email: {medico.email}")
    print(f"  Nome: {medico.nome}")
    print(f"  CRM: {medico.crm}")
    
    # Testar senha
    senha_test = 'medico123'
    senha_bytes = medico.senha_hash.encode('utf-8') if isinstance(medico.senha_hash, str) else medico.senha_hash
    
    try:
        resultado = bcrypt.checkpw(senha_test.encode('utf-8'), senha_bytes)
        print(f"\n  Teste de senha '{senha_test}': {'✓ VÁLIDA' if resultado else '✗ INVÁLIDA'}")
    except Exception as e:
        print(f"\n  ✗ Erro ao verificar senha: {e}")
else:
    print("✗ Médico não encontrado com email joao1@clinica.com")

db.close()
