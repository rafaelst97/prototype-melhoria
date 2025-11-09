"""
Router para popular dados de teste no banco
Útil para ambientes de produção sem acesso direto ao banco
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, time
import bcrypt

from app.database import get_db
from app.models.models import (
    Usuario, Paciente, Medico, Convenio, Especialidade,
    HorarioAtendimento, Consulta
)

router = APIRouter()

@router.post("/popular-dados")
def popular_dados_teste(db: Session = Depends(get_db)):
    """
    Popula o banco de dados com dados de teste
    
    ⚠️ ATENÇÃO: Use apenas em ambientes de desenvolvimento/teste!
    """
    
    try:
        # Verificar se já existem dados
        if db.query(Usuario).count() > 0:
            return {
                "message": "Banco de dados já contém dados",
                "warning": "Use /limpar-dados primeiro se quiser repopular"
            }
        
        # 1. Criar Convênios
        convenios_data = [
            {"nome": "Unimed", "ativo": True},
            {"nome": "Amil", "ativo": True},
            {"nome": "Bradesco Saúde", "ativo": True}
        ]
        
        convenios = []
        for conv_data in convenios_data:
            conv = Convenio(**conv_data)
            db.add(conv)
            convenios.append(conv)
        
        db.flush()
        
        # 2. Criar Especialidades
        especialidades_data = [
            {"nome": "Cardiologia", "ativo": True},
            {"nome": "Dermatologia", "ativo": True},
            {"nome": "Pediatria", "ativo": True},
            {"nome": "Ortopedia", "ativo": True},
            {"nome": "Ginecologia", "ativo": True}
        ]
        
        especialidades = []
        for esp_data in especialidades_data:
            esp = Especialidade(**esp_data)
            db.add(esp)
            especialidades.append(esp)
        
        db.flush()
        
        # 3. Criar Usuário Admin
        senha_hash_admin = bcrypt.hashpw("admin123".encode('utf-8'), bcrypt.gensalt())
        admin = Usuario(
            email="admin@clinica.com",
            senha_hash=senha_hash_admin.decode('utf-8'),
            tipo_usuario="admin",
            ativo=True
        )
        db.add(admin)
        
        # 4. Criar Médicos
        medicos_data = [
            {
                "nome": "Dr. João Silva",
                "crm": "12345-SP",
                "email": "joao1@clinica.com",
                "telefone": "(11) 98765-4321",
                "especialidade_id": 1  # Cardiologia
            },
            {
                "nome": "Dra. Maria Santos",
                "crm": "67890-SP",
                "email": "maria@clinica.com",
                "telefone": "(11) 98765-4322",
                "especialidade_id": 2  # Dermatologia
            },
            {
                "nome": "Dr. Pedro Costa",
                "crm": "11111-SP",
                "email": "pedro@clinica.com",
                "telefone": "(11) 98765-4323",
                "especialidade_id": 3  # Pediatria
            }
        ]
        
        senha_hash_medico = bcrypt.hashpw("medico123".encode('utf-8'), bcrypt.gensalt())
        
        medicos = []
        for med_data in medicos_data:
            # Criar usuário do médico
            usuario = Usuario(
                email=med_data["email"],
                senha_hash=senha_hash_medico.decode('utf-8'),
                tipo_usuario="medico",
                ativo=True
            )
            db.add(usuario)
            db.flush()
            
            # Criar médico
            medico = Medico(
                nome=med_data["nome"],
                crm=med_data["crm"],
                telefone=med_data["telefone"],
                id_especialidade_fk=med_data["especialidade_id"],
                id_usuario_fk=usuario.id_usuario,
                ativo=True
            )
            db.add(medico)
            medicos.append(medico)
        
        db.flush()
        
        # 5. Criar horários de atendimento para médicos
        for medico in medicos:
            for dia_semana in range(1, 6):  # Segunda a Sexta
                horario = HorarioAtendimento(
                    id_medico_fk=medico.id_medico,
                    dia_semana=dia_semana,
                    hora_inicio=time(8, 0),
                    hora_fim=time(12, 0),
                    ativo=True
                )
                db.add(horario)
                
                horario2 = HorarioAtendimento(
                    id_medico_fk=medico.id_medico,
                    dia_semana=dia_semana,
                    hora_inicio=time(14, 0),
                    hora_fim=time(18, 0),
                    ativo=True
                )
                db.add(horario2)
        
        # 6. Criar Pacientes
        pacientes_data = [
            {
                "nome": "Maria Oliveira",
                "cpf": "123.456.789-00",
                "email": "maria@email.com",
                "telefone": "(11) 91234-5678",
                "data_nascimento": "1990-05-15"
            },
            {
                "nome": "José Santos",
                "cpf": "987.654.321-00",
                "email": "jose@email.com",
                "telefone": "(11) 91234-5679",
                "data_nascimento": "1985-08-20"
            },
            {
                "nome": "Ana Costa",
                "cpf": "111.222.333-44",
                "email": "ana@email.com",
                "telefone": "(11) 91234-5680",
                "data_nascimento": "1995-03-10"
            },
            {
                "nome": "Carlos Silva",
                "cpf": "555.666.777-88",
                "email": "carlos@email.com",
                "telefone": "(11) 91234-5681",
                "data_nascimento": "1988-12-25"
            },
            {
                "nome": "Paula Lima",
                "cpf": "999.888.777-66",
                "email": "paula@email.com",
                "telefone": "(11) 91234-5682",
                "data_nascimento": "1992-07-30"
            }
        ]
        
        senha_hash_paciente = bcrypt.hashpw("paciente123".encode('utf-8'), bcrypt.gensalt())
        
        for pac_data in pacientes_data:
            # Criar usuário do paciente
            usuario = Usuario(
                email=pac_data["email"],
                senha_hash=senha_hash_paciente.decode('utf-8'),
                tipo_usuario="paciente",
                ativo=True
            )
            db.add(usuario)
            db.flush()
            
            # Criar paciente
            paciente = Paciente(
                nome=pac_data["nome"],
                cpf=pac_data["cpf"],
                telefone=pac_data["telefone"],
                data_nascimento=datetime.strptime(pac_data["data_nascimento"], "%Y-%m-%d").date(),
                id_usuario_fk=usuario.id_usuario,
                id_convenio_fk=convenios[0].id_convenio,  # Unimed
                ativo=True
            )
            db.add(paciente)
        
        db.commit()
        
        # Contar registros criados
        total_usuarios = db.query(Usuario).count()
        total_medicos = db.query(Medico).count()
        total_pacientes = db.query(Paciente).count()
        total_convenios = db.query(Convenio).count()
        total_especialidades = db.query(Especialidade).count()
        
        return {
            "success": True,
            "message": "✅ Banco de dados populado com sucesso!",
            "dados_criados": {
                "usuarios": total_usuarios,
                "medicos": total_medicos,
                "pacientes": total_pacientes,
                "convenios": total_convenios,
                "especialidades": total_especialidades
            },
            "credenciais_teste": {
                "admin": {"email": "admin@clinica.com", "senha": "admin123"},
                "medico": {"email": "joao1@clinica.com", "senha": "medico123"},
                "paciente": {"email": "maria@email.com", "senha": "paciente123"}
            }
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao popular dados: {str(e)}")


@router.delete("/limpar-dados")
def limpar_dados(db: Session = Depends(get_db)):
    """
    CUIDADO: Remove TODOS os dados do banco!
    Use apenas para resetar o ambiente de teste.
    """
    
    try:
        # Deletar em ordem para respeitar foreign keys
        db.query(Consulta).delete()
        db.query(HorarioAtendimento).delete()
        db.query(Paciente).delete()
        db.query(Medico).delete()
        db.query(Usuario).delete()
        db.query(Especialidade).delete()
        db.query(Convenio).delete()
        
        db.commit()
        
        return {
            "success": True,
            "message": "✅ Todos os dados foram removidos"
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao limpar dados: {str(e)}")
