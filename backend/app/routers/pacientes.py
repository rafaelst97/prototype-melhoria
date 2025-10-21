from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, date
from app.database import get_db
from app.models import Usuario, Paciente, Consulta, Medico, TipoUsuario, StatusConsulta
from app.schemas import (
    PacienteCreate, PacienteUpdate, PacienteResponse,
    ConsultaCreate, ConsultaResponse, ConsultaDetalhada, ConsultaCancelar,
    HorarioDisponivel
)
from app.utils.auth import get_password_hash
from app.utils.dependencies import get_current_paciente, get_current_user
from app.utils.validators import (
    validar_limite_consultas,
    validar_cancelamento_24h,
    verificar_conflito_horario,
    verificar_horario_bloqueado,
    verificar_horario_disponivel,
    gerar_horarios_disponiveis
)

router = APIRouter(prefix="/pacientes", tags=["Pacientes"])

@router.post("/cadastro", response_model=PacienteResponse, status_code=status.HTTP_201_CREATED)
def cadastrar_paciente(paciente_data: PacienteCreate, db: Session = Depends(get_db)):
    """Cadastro de novo paciente"""
    # Verificar se email já existe
    if db.query(Usuario).filter(Usuario.email == paciente_data.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email já cadastrado"
        )
    
    # Verificar se CPF já existe
    if db.query(Paciente).filter(Paciente.cpf == paciente_data.cpf).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CPF já cadastrado"
        )
    
    # Criar usuário
    novo_usuario = Usuario(
        email=paciente_data.email,
        senha_hash=get_password_hash(paciente_data.senha),
        nome=paciente_data.nome,
        tipo=TipoUsuario.PACIENTE
    )
    db.add(novo_usuario)
    db.flush()
    
    # Criar paciente
    novo_paciente = Paciente(
        usuario_id=novo_usuario.id,
        cpf=paciente_data.cpf,
        data_nascimento=paciente_data.data_nascimento,
        telefone=paciente_data.telefone,
        endereco=paciente_data.endereco,
        cidade=paciente_data.cidade,
        estado=paciente_data.estado,
        cep=paciente_data.cep,
        convenio_id=paciente_data.convenio_id,
        numero_carteirinha=paciente_data.numero_carteirinha
    )
    db.add(novo_paciente)
    db.commit()
    db.refresh(novo_paciente)
    
    return novo_paciente

@router.get("/perfil", response_model=PacienteResponse)
def get_perfil(
    current_user: Usuario = Depends(get_current_paciente),
    db: Session = Depends(get_db)
):
    """Retorna perfil do paciente logado"""
    paciente = db.query(Paciente).filter(Paciente.usuario_id == current_user.id).first()
    if not paciente:
        raise HTTPException(status_code=404, detail="Paciente não encontrado")
    return paciente

@router.put("/perfil", response_model=PacienteResponse)
def atualizar_perfil(
    paciente_data: PacienteUpdate,
    current_user: Usuario = Depends(get_current_paciente),
    db: Session = Depends(get_db)
):
    """Atualiza perfil do paciente"""
    paciente = db.query(Paciente).filter(Paciente.usuario_id == current_user.id).first()
    if not paciente:
        raise HTTPException(status_code=404, detail="Paciente não encontrado")
    
    # Atualizar dados do usuário
    if paciente_data.nome:
        current_user.nome = paciente_data.nome
    
    # Atualizar dados do paciente
    for field, value in paciente_data.dict(exclude_unset=True).items():
        if field != "nome" and value is not None:
            setattr(paciente, field, value)
    
    db.commit()
    db.refresh(paciente)
    return paciente

@router.post("/consultas", response_model=ConsultaResponse, status_code=status.HTTP_201_CREATED)
def agendar_consulta(
    consulta_data: ConsultaCreate,
    current_user: Usuario = Depends(get_current_paciente),
    db: Session = Depends(get_db)
):
    """Agendar nova consulta"""
    paciente = db.query(Paciente).filter(Paciente.usuario_id == current_user.id).first()
    
    # Validar limite de 2 consultas
    if not validar_limite_consultas(db, paciente.id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Você já possui 2 consultas agendadas. Cancele uma para agendar outra."
        )
    
    # Verificar se médico existe
    medico = db.query(Medico).filter(Medico.id == consulta_data.medico_id).first()
    if not medico:
        raise HTTPException(status_code=404, detail="Médico não encontrado")
    
    # Validar se é data futura
    if consulta_data.data < date.today():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não é possível agendar consultas em datas passadas"
        )
    
    # Validar horário disponível
    if not verificar_horario_disponivel(db, consulta_data.medico_id, consulta_data.data, consulta_data.hora):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Horário não está disponível na agenda do médico"
        )
    
    # Verificar bloqueio
    if verificar_horario_bloqueado(db, consulta_data.medico_id, consulta_data.data, consulta_data.hora):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Horário bloqueado pelo médico"
        )
    
    # Verificar conflito
    if verificar_conflito_horario(db, consulta_data.medico_id, consulta_data.data, consulta_data.hora):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Horário já possui uma consulta agendada"
        )
    
    # Criar consulta
    nova_consulta = Consulta(
        paciente_id=paciente.id,
        medico_id=consulta_data.medico_id,
        data=consulta_data.data,
        hora=consulta_data.hora,
        motivo_consulta=consulta_data.motivo_consulta,
        status=StatusConsulta.AGENDADA
    )
    db.add(nova_consulta)
    db.commit()
    db.refresh(nova_consulta)
    
    return nova_consulta

@router.get("/consultas", response_model=List[ConsultaDetalhada])
def listar_consultas(
    current_user: Usuario = Depends(get_current_paciente),
    db: Session = Depends(get_db)
):
    """Lista todas as consultas do paciente"""
    paciente = db.query(Paciente).filter(Paciente.usuario_id == current_user.id).first()
    
    consultas = db.query(Consulta).filter(
        Consulta.paciente_id == paciente.id
    ).order_by(Consulta.data.desc(), Consulta.hora.desc()).all()
    
    return consultas

@router.delete("/consultas/{consulta_id}")
def cancelar_consulta(
    consulta_id: int,
    cancelamento: ConsultaCancelar,
    current_user: Usuario = Depends(get_current_paciente),
    db: Session = Depends(get_db)
):
    """Cancelar consulta"""
    paciente = db.query(Paciente).filter(Paciente.usuario_id == current_user.id).first()
    
    consulta = db.query(Consulta).filter(
        Consulta.id == consulta_id,
        Consulta.paciente_id == paciente.id
    ).first()
    
    if not consulta:
        raise HTTPException(status_code=404, detail="Consulta não encontrada")
    
    if consulta.status == StatusConsulta.CANCELADA:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Consulta já está cancelada"
        )
    
    if consulta.status == StatusConsulta.REALIZADA:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não é possível cancelar uma consulta já realizada"
        )
    
    # Validar regra de 24h
    if not validar_cancelamento_24h(consulta):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cancelamento deve ser feito com pelo menos 24h de antecedência"
        )
    
    consulta.status = StatusConsulta.CANCELADA
    consulta.cancelado_em = datetime.now()
    consulta.motivo_cancelamento = cancelamento.motivo_cancelamento
    
    db.commit()
    
    return {"message": "Consulta cancelada com sucesso"}

@router.get("/medicos/{medico_id}/horarios-disponiveis", response_model=HorarioDisponivel)
def get_horarios_disponiveis(
    medico_id: int,
    data: date,
    db: Session = Depends(get_db)
):
    """Retorna horários disponíveis de um médico para uma data específica"""
    medico = db.query(Medico).filter(Medico.id == medico_id).first()
    if not medico:
        raise HTTPException(status_code=404, detail="Médico não encontrado")
    
    horarios = gerar_horarios_disponiveis(db, medico_id, data, medico.tempo_consulta)
    
    return {"data": data, "horarios": horarios}
