from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import List
from datetime import date, datetime, timedelta
from app.database import get_db
from app.models import (
    Usuario, Medico, Paciente, Admin, Consulta, Convenio, Especialidade,
    TipoUsuario, StatusConsulta
)
from app.schemas import (
    MedicoCreate, MedicoUpdate, MedicoResponse,
    PacienteResponse,
    ConvenioCreate, ConvenioUpdate, ConvenioResponse,
    EspecialidadeCreate, EspecialidadeResponse,
    AdminCreate, AdminResponse,
    EstatisticasDashboard,
    ConsultaDetalhada
)
from app.utils.auth import get_password_hash
from app.utils.dependencies import get_current_admin

router = APIRouter(prefix="/admin", tags=["Administração"])

# ============ Estatísticas ============
@router.get("/dashboard", response_model=EstatisticasDashboard)
def get_dashboard(
    current_user: Usuario = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Retorna estatísticas do dashboard"""
    hoje = date.today()
    inicio_semana = hoje - timedelta(days=hoje.weekday())
    inicio_mes = date(hoje.year, hoje.month, 1)
    
    total_pacientes = db.query(Paciente).count()
    total_medicos = db.query(Medico).count()
    total_consultas = db.query(Consulta).count()
    
    consultas_hoje = db.query(Consulta).filter(Consulta.data == hoje).count()
    
    consultas_semana = db.query(Consulta).filter(
        Consulta.data >= inicio_semana,
        Consulta.data <= hoje
    ).count()
    
    consultas_mes = db.query(Consulta).filter(
        Consulta.data >= inicio_mes,
        Consulta.data <= hoje
    ).count()
    
    return {
        "total_pacientes": total_pacientes,
        "total_medicos": total_medicos,
        "total_consultas": total_consultas,
        "consultas_hoje": consultas_hoje,
        "consultas_semana": consultas_semana,
        "consultas_mes": consultas_mes
    }

# ============ Médicos ============
@router.get("/medicos", response_model=List[MedicoResponse])
def listar_medicos(
    skip: int = 0,
    limit: int = 100,
    current_user: Usuario = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Lista todos os médicos"""
    medicos = db.query(Medico).offset(skip).limit(limit).all()
    return medicos

@router.get("/medicos/{medico_id}", response_model=MedicoResponse)
def get_medico(
    medico_id: int,
    current_user: Usuario = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Retorna dados de um médico específico"""
    medico = db.query(Medico).filter(Medico.id == medico_id).first()
    if not medico:
        raise HTTPException(status_code=404, detail="Médico não encontrado")
    return medico

@router.post("/medicos", response_model=MedicoResponse, status_code=status.HTTP_201_CREATED)
def criar_medico(
    medico_data: MedicoCreate,
    current_user: Usuario = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Cadastra novo médico"""
    # Verificar se email já existe
    if db.query(Usuario).filter(Usuario.email == medico_data.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email já cadastrado"
        )
    
    # Verificar se CRM já existe
    if db.query(Medico).filter(Medico.crm == medico_data.crm).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CRM já cadastrado"
        )
    
    # Verificar se especialidade existe
    especialidade = db.query(Especialidade).filter(Especialidade.id == medico_data.especialidade_id).first()
    if not especialidade:
        raise HTTPException(status_code=404, detail="Especialidade não encontrada")
    
    # Criar usuário
    novo_usuario = Usuario(
        email=medico_data.email,
        senha_hash=get_password_hash(medico_data.senha),
        nome=medico_data.nome,
        tipo=TipoUsuario.MEDICO
    )
    db.add(novo_usuario)
    db.flush()
    
    # Criar médico
    novo_medico = Medico(
        usuario_id=novo_usuario.id,
        crm=medico_data.crm,
        especialidade_id=medico_data.especialidade_id,
        telefone=medico_data.telefone,
        valor_consulta=medico_data.valor_consulta,
        tempo_consulta=medico_data.tempo_consulta
    )
    db.add(novo_medico)
    db.commit()
    db.refresh(novo_medico)
    
    return novo_medico

@router.put("/medicos/{medico_id}", response_model=MedicoResponse)
def atualizar_medico(
    medico_id: int,
    medico_data: MedicoUpdate,
    current_user: Usuario = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Atualiza dados do médico"""
    medico = db.query(Medico).filter(Medico.id == medico_id).first()
    if not medico:
        raise HTTPException(status_code=404, detail="Médico não encontrado")
    
    # Atualizar usuário
    if medico_data.nome:
        medico.usuario.nome = medico_data.nome
    
    # Atualizar médico
    for field, value in medico_data.dict(exclude_unset=True).items():
        if field != "nome" and value is not None:
            setattr(medico, field, value)
    
    db.commit()
    db.refresh(medico)
    return medico

@router.delete("/medicos/{medico_id}")
def deletar_medico(
    medico_id: int,
    current_user: Usuario = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Desativa um médico"""
    medico = db.query(Medico).filter(Medico.id == medico_id).first()
    if not medico:
        raise HTTPException(status_code=404, detail="Médico não encontrado")
    
    # Verificar se tem consultas futuras
    consultas_futuras = db.query(Consulta).filter(
        Consulta.medico_id == medico_id,
        Consulta.data >= date.today(),
        Consulta.status.in_([StatusConsulta.AGENDADA, StatusConsulta.CONFIRMADA])
    ).count()
    
    if consultas_futuras > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Médico possui {consultas_futuras} consultas futuras agendadas"
        )
    
    medico.usuario.ativo = False
    db.commit()
    
    return {"message": "Médico desativado com sucesso"}

# ============ Pacientes ============
@router.get("/pacientes", response_model=List[PacienteResponse])
def listar_pacientes(
    skip: int = 0,
    limit: int = 100,
    current_user: Usuario = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Lista todos os pacientes"""
    pacientes = db.query(Paciente).offset(skip).limit(limit).all()
    return pacientes

@router.get("/pacientes/{paciente_id}", response_model=PacienteResponse)
def get_paciente(
    paciente_id: int,
    current_user: Usuario = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Retorna dados de um paciente específico"""
    paciente = db.query(Paciente).filter(Paciente.id == paciente_id).first()
    if not paciente:
        raise HTTPException(status_code=404, detail="Paciente não encontrado")
    return paciente

@router.put("/pacientes/{paciente_id}/bloquear")
def bloquear_paciente(
    paciente_id: int,
    current_user: Usuario = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Bloqueia um paciente"""
    paciente = db.query(Paciente).filter(Paciente.id == paciente_id).first()
    if not paciente:
        raise HTTPException(status_code=404, detail="Paciente não encontrado")
    
    paciente.usuario.bloqueado = True
    db.commit()
    
    return {"message": "Paciente bloqueado com sucesso"}

@router.put("/pacientes/{paciente_id}/desbloquear")
def desbloquear_paciente(
    paciente_id: int,
    current_user: Usuario = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Desbloqueia um paciente"""
    paciente = db.query(Paciente).filter(Paciente.id == paciente_id).first()
    if not paciente:
        raise HTTPException(status_code=404, detail="Paciente não encontrado")
    
    paciente.usuario.bloqueado = False
    db.commit()
    
    return {"message": "Paciente desbloqueado com sucesso"}

# ============ Convênios ============
@router.get("/convenios", response_model=List[ConvenioResponse])
def listar_convenios(
    current_user: Usuario = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Lista todos os convênios"""
    convenios = db.query(Convenio).all()
    return convenios

@router.post("/convenios", response_model=ConvenioResponse, status_code=status.HTTP_201_CREATED)
def criar_convenio(
    convenio_data: ConvenioCreate,
    current_user: Usuario = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Cadastra novo convênio"""
    if db.query(Convenio).filter(Convenio.nome == convenio_data.nome).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Convênio já cadastrado"
        )
    
    novo_convenio = Convenio(**convenio_data.dict())
    db.add(novo_convenio)
    db.commit()
    db.refresh(novo_convenio)
    
    return novo_convenio

@router.put("/convenios/{convenio_id}", response_model=ConvenioResponse)
def atualizar_convenio(
    convenio_id: int,
    convenio_data: ConvenioUpdate,
    current_user: Usuario = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Atualiza convênio"""
    convenio = db.query(Convenio).filter(Convenio.id == convenio_id).first()
    if not convenio:
        raise HTTPException(status_code=404, detail="Convênio não encontrado")
    
    for field, value in convenio_data.dict(exclude_unset=True).items():
        if value is not None:
            setattr(convenio, field, value)
    
    db.commit()
    db.refresh(convenio)
    return convenio

@router.delete("/convenios/{convenio_id}")
def deletar_convenio(
    convenio_id: int,
    current_user: Usuario = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Desativa um convênio"""
    convenio = db.query(Convenio).filter(Convenio.id == convenio_id).first()
    if not convenio:
        raise HTTPException(status_code=404, detail="Convênio não encontrado")
    
    convenio.ativo = False
    db.commit()
    
    return {"message": "Convênio desativado com sucesso"}

# ============ Especialidades ============
@router.get("/especialidades", response_model=List[EspecialidadeResponse])
def listar_especialidades(
    current_user: Usuario = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Lista todas as especialidades"""
    especialidades = db.query(Especialidade).all()
    return especialidades

@router.post("/especialidades", response_model=EspecialidadeResponse, status_code=status.HTTP_201_CREATED)
def criar_especialidade(
    especialidade_data: EspecialidadeCreate,
    current_user: Usuario = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Cadastra nova especialidade"""
    if db.query(Especialidade).filter(Especialidade.nome == especialidade_data.nome).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Especialidade já cadastrada"
        )
    
    nova_especialidade = Especialidade(**especialidade_data.dict())
    db.add(nova_especialidade)
    db.commit()
    db.refresh(nova_especialidade)
    
    return nova_especialidade

# ============ Consultas ============
@router.get("/consultas", response_model=List[ConsultaDetalhada])
def listar_consultas(
    data_inicio: date = None,
    data_fim: date = None,
    status_filtro: StatusConsulta = None,
    current_user: Usuario = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Lista todas as consultas com filtros"""
    query = db.query(Consulta)
    
    if data_inicio:
        query = query.filter(Consulta.data >= data_inicio)
    if data_fim:
        query = query.filter(Consulta.data <= data_fim)
    if status_filtro:
        query = query.filter(Consulta.status == status_filtro)
    
    consultas = query.order_by(Consulta.data.desc(), Consulta.hora.desc()).limit(100).all()
    return consultas

# ============ Administradores ============
@router.post("/admins", response_model=AdminResponse, status_code=status.HTTP_201_CREATED)
def criar_admin(
    admin_data: AdminCreate,
    current_user: Usuario = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Cadastra novo administrador"""
    # Verificar se email já existe
    if db.query(Usuario).filter(Usuario.email == admin_data.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email já cadastrado"
        )
    
    # Criar usuário
    novo_usuario = Usuario(
        email=admin_data.email,
        senha_hash=get_password_hash(admin_data.senha),
        nome=admin_data.nome,
        tipo=TipoUsuario.ADMIN
    )
    db.add(novo_usuario)
    db.flush()
    
    # Criar admin
    novo_admin = Admin(
        usuario_id=novo_usuario.id,
        cargo=admin_data.cargo
    )
    db.add(novo_admin)
    db.commit()
    db.refresh(novo_admin)
    
    return novo_admin
