"""
Script para popular o banco de dados com dados iniciais
Execute: docker exec -it clinica_backend python seed_data.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal
from app.models import (
    Usuario, Admin, Especialidade, Convenio, Medico, TipoUsuario
)
from app.utils.auth import get_password_hash
from datetime import time

def seed_database():
    db = SessionLocal()
    
    try:
        print("🌱 Iniciando seed do banco de dados...")
        
        # 1. Criar Especialidades
        print("\n📋 Criando Especialidades...")
        especialidades_data = [
            {"nome": "Cardiologia", "descricao": "Especialidade médica que se dedica ao diagnóstico e tratamento das doenças do coração"},
            {"nome": "Dermatologia", "descricao": "Especialidade médica dedicada ao estudo e tratamento da pele"},
            {"nome": "Ortopedia", "descricao": "Especialidade médica que cuida do sistema locomotor"},
            {"nome": "Pediatria", "descricao": "Especialidade médica dedicada à assistência à criança e ao adolescente"},
            {"nome": "Ginecologia", "descricao": "Especialidade médica que trata do sistema reprodutor feminino"},
            {"nome": "Oftalmologia", "descricao": "Especialidade médica que estuda e trata as doenças dos olhos"},
            {"nome": "Psiquiatria", "descricao": "Especialidade médica que lida com a prevenção, diagnóstico e tratamento de transtornos mentais"},
            {"nome": "Neurologia", "descricao": "Especialidade médica que trata do sistema nervoso"},
        ]
        
        for esp_data in especialidades_data:
            existe = db.query(Especialidade).filter(Especialidade.nome == esp_data["nome"]).first()
            if not existe:
                especialidade = Especialidade(**esp_data)
                db.add(especialidade)
                print(f"  ✓ {esp_data['nome']}")
        
        db.commit()
        
        # 2. Criar Convênios
        print("\n🏥 Criando Convênios...")
        convenios_data = [
            {"nome": "Unimed", "cnpj": "12.345.678/0001-90", "telefone": "(47) 3333-4444", "email": "contato@unimed.com.br"},
            {"nome": "Bradesco Saúde", "cnpj": "98.765.432/0001-10", "telefone": "(47) 3333-5555", "email": "contato@bradescosaude.com.br"},
            {"nome": "SulAmérica", "cnpj": "11.222.333/0001-44", "telefone": "(47) 3333-6666", "email": "contato@sulamerica.com.br"},
            {"nome": "Particular", "cnpj": None, "telefone": None, "email": None},
        ]
        
        for conv_data in convenios_data:
            existe = db.query(Convenio).filter(Convenio.nome == conv_data["nome"]).first()
            if not existe:
                convenio = Convenio(**conv_data)
                db.add(convenio)
                print(f"  ✓ {conv_data['nome']}")
        
        db.commit()
        
        # 3. Criar usuário Admin
        print("\n👤 Criando Administrador...")
        admin_email = "admin@clinica.com"
        admin_existe = db.query(Usuario).filter(Usuario.email == admin_email).first()
        
        if not admin_existe:
            usuario_admin = Usuario(
                email=admin_email,
                senha_hash=get_password_hash("admin123"),
                nome="Administrador Sistema",
                tipo=TipoUsuario.ADMIN
            )
            db.add(usuario_admin)
            db.flush()
            
            admin = Admin(
                usuario_id=usuario_admin.id,
                cargo="Administrador Geral"
            )
            db.add(admin)
            db.commit()
            print(f"  ✓ Admin criado: {admin_email} / admin123")
        else:
            print(f"  ℹ Admin já existe: {admin_email}")
        
        # 4. Criar médicos de exemplo
        print("\n👨‍⚕️ Criando Médicos de exemplo...")
        
        # Buscar especialidades
        cardiologia = db.query(Especialidade).filter(Especialidade.nome == "Cardiologia").first()
        dermatologia = db.query(Especialidade).filter(Especialidade.nome == "Dermatologia").first()
        pediatria = db.query(Especialidade).filter(Especialidade.nome == "Pediatria").first()
        
        medicos_data = [
            {
                "email": "dr.silva@clinica.com",
                "senha": "medico123",
                "nome": "Dr. João Silva",
                "crm": "12345-SC",
                "especialidade_id": cardiologia.id if cardiologia else 1,
                "telefone": "(47) 99999-1111",
                "valor_consulta": 250.00
            },
            {
                "email": "dra.santos@clinica.com",
                "senha": "medico123",
                "nome": "Dra. Maria Santos",
                "crm": "23456-SC",
                "especialidade_id": dermatologia.id if dermatologia else 2,
                "telefone": "(47) 99999-2222",
                "valor_consulta": 200.00
            },
            {
                "email": "dr.oliveira@clinica.com",
                "senha": "medico123",
                "nome": "Dr. Pedro Oliveira",
                "crm": "34567-SC",
                "especialidade_id": pediatria.id if pediatria else 4,
                "telefone": "(47) 99999-3333",
                "valor_consulta": 180.00
            }
        ]
        
        for med_data in medicos_data:
            existe = db.query(Usuario).filter(Usuario.email == med_data["email"]).first()
            if not existe:
                usuario_medico = Usuario(
                    email=med_data["email"],
                    senha_hash=get_password_hash(med_data["senha"]),
                    nome=med_data["nome"],
                    tipo=TipoUsuario.MEDICO
                )
                db.add(usuario_medico)
                db.flush()
                
                medico = Medico(
                    usuario_id=usuario_medico.id,
                    crm=med_data["crm"],
                    especialidade_id=med_data["especialidade_id"],
                    telefone=med_data["telefone"],
                    valor_consulta=med_data["valor_consulta"],
                    tempo_consulta=30
                )
                db.add(medico)
                print(f"  ✓ {med_data['nome']} - {med_data['email']} / {med_data['senha']}")
        
        db.commit()
        
        print("\n✅ Seed concluído com sucesso!")
        print("\n📝 Credenciais de acesso:")
        print("   Admin: admin@clinica.com / admin123")
        print("   Médicos: dr.silva@clinica.com / medico123")
        print("            dra.santos@clinica.com / medico123")
        print("            dr.oliveira@clinica.com / medico123")
        
    except Exception as e:
        print(f"\n❌ Erro: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
