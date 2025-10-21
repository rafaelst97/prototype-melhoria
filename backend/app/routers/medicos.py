from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List
from datetime import date, datetime, time
from app.database import get_db
from app.models import (
    Usuario, Medico, Consulta, HorarioDisponivel as HorarioDisponivelModel,
    BloqueioHorario as BloqueioHorarioModel, StatusConsulta, Especialidade
)
from app.schemas import (
    MedicoResponse,
    ConsultaDetalhada, ConsultaUpdate,
    HorarioDisponivelCreate, HorarioDisponivelResponse,
    BloqueioHorarioCreate, BloqueioHorarioResponse,
    EspecialidadeResponse
)
from app.utils.dependencies import get_current_medico

router = APIRouter(prefix="/medicos", tags=["Médicos"])

@router.get("/perfil", response_model=MedicoResponse)
def get_perfil(
    current_user: Usuario = Depends(get_current_medico),
    db: Session = Depends(get_db)
):
    """Retorna perfil do médico logado"""
    medico = db.query(Medico).filter(Medico.usuario_id == current_user.id).first()
    if not medico:
        raise HTTPException(status_code=404, detail="Médico não encontrado")
    return medico

@router.get("/consultas", response_model=List[ConsultaDetalhada])
def listar_consultas(
    data_inicio: date = None,
    data_fim: date = None,
    current_user: Usuario = Depends(get_current_medico),
    db: Session = Depends(get_db)
):
    """Lista consultas do médico"""
    medico = db.query(Medico).filter(Medico.usuario_id == current_user.id).first()
    
    query = db.query(Consulta).filter(Consulta.medico_id == medico.id)
    
    if data_inicio:
        query = query.filter(Consulta.data >= data_inicio)
    if data_fim:
        query = query.filter(Consulta.data <= data_fim)
    
    consultas = query.order_by(Consulta.data, Consulta.hora).all()
    return consultas

@router.get("/consultas/hoje", response_model=List[ConsultaDetalhada])
def consultas_hoje(
    current_user: Usuario = Depends(get_current_medico),
    db: Session = Depends(get_db)
):
    """Lista consultas do dia atual"""
    medico = db.query(Medico).filter(Medico.usuario_id == current_user.id).first()
    hoje = date.today()
    
    consultas = db.query(Consulta).filter(
        Consulta.medico_id == medico.id,
        Consulta.data == hoje,
        Consulta.status.in_([StatusConsulta.AGENDADA, StatusConsulta.CONFIRMADA])
    ).order_by(Consulta.hora).all()
    
    return consultas

@router.get("/consultas/{consulta_id}", response_model=ConsultaDetalhada)
def get_consulta(
    consulta_id: int,
    current_user: Usuario = Depends(get_current_medico),
    db: Session = Depends(get_db)
):
    """Retorna detalhes de uma consulta específica"""
    medico = db.query(Medico).filter(Medico.usuario_id == current_user.id).first()
    
    consulta = db.query(Consulta).filter(
        Consulta.id == consulta_id,
        Consulta.medico_id == medico.id
    ).first()
    
    if not consulta:
        raise HTTPException(status_code=404, detail="Consulta não encontrada")
    
    return consulta

@router.put("/consultas/{consulta_id}", response_model=ConsultaDetalhada)
def atualizar_consulta(
    consulta_id: int,
    consulta_data: ConsultaUpdate,
    current_user: Usuario = Depends(get_current_medico),
    db: Session = Depends(get_db)
):
    """Atualiza observações ou status da consulta"""
    medico = db.query(Medico).filter(Medico.usuario_id == current_user.id).first()
    
    consulta = db.query(Consulta).filter(
        Consulta.id == consulta_id,
        Consulta.medico_id == medico.id
    ).first()
    
    if not consulta:
        raise HTTPException(status_code=404, detail="Consulta não encontrada")
    
    if consulta_data.observacoes_medico is not None:
        consulta.observacoes_medico = consulta_data.observacoes_medico
    
    if consulta_data.status is not None:
        consulta.status = consulta_data.status
    
    db.commit()
    db.refresh(consulta)
    
    return consulta

@router.get("/horarios", response_model=List[HorarioDisponivelResponse])
def listar_horarios(
    current_user: Usuario = Depends(get_current_medico),
    db: Session = Depends(get_db)
):
    """Lista grade de horários do médico"""
    medico = db.query(Medico).filter(Medico.usuario_id == current_user.id).first()
    
    horarios = db.query(HorarioDisponivelModel).filter(
        HorarioDisponivelModel.medico_id == medico.id,
        HorarioDisponivelModel.ativo == True
    ).order_by(HorarioDisponivelModel.dia_semana, HorarioDisponivelModel.hora_inicio).all()
    
    return horarios

@router.post("/horarios", response_model=HorarioDisponivelResponse, status_code=status.HTTP_201_CREATED)
def criar_horario(
    horario_data: HorarioDisponivelCreate,
    current_user: Usuario = Depends(get_current_medico),
    db: Session = Depends(get_db)
):
    """Adiciona horário disponível na agenda"""
    medico = db.query(Medico).filter(Medico.usuario_id == current_user.id).first()
    
    # Validar se hora_fim > hora_inicio
    if horario_data.hora_fim <= horario_data.hora_inicio:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Hora fim deve ser maior que hora início"
        )
    
    novo_horario = HorarioDisponivelModel(
        medico_id=medico.id,
        dia_semana=horario_data.dia_semana,
        hora_inicio=horario_data.hora_inicio,
        hora_fim=horario_data.hora_fim
    )
    
    db.add(novo_horario)
    db.commit()
    db.refresh(novo_horario)
    
    return novo_horario

@router.delete("/horarios/{horario_id}")
def remover_horario(
    horario_id: int,
    current_user: Usuario = Depends(get_current_medico),
    db: Session = Depends(get_db)
):
    """Remove horário disponível"""
    medico = db.query(Medico).filter(Medico.usuario_id == current_user.id).first()
    
    horario = db.query(HorarioDisponivelModel).filter(
        HorarioDisponivelModel.id == horario_id,
        HorarioDisponivelModel.medico_id == medico.id
    ).first()
    
    if not horario:
        raise HTTPException(status_code=404, detail="Horário não encontrado")
    
    horario.ativo = False
    db.commit()
    
    return {"message": "Horário removido com sucesso"}

@router.get("/bloqueios", response_model=List[BloqueioHorarioResponse])
def listar_bloqueios(
    current_user: Usuario = Depends(get_current_medico),
    db: Session = Depends(get_db)
):
    """Lista bloqueios de horários"""
    medico = db.query(Medico).filter(Medico.usuario_id == current_user.id).first()
    
    bloqueios = db.query(BloqueioHorarioModel).filter(
        BloqueioHorarioModel.medico_id == medico.id,
        BloqueioHorarioModel.data >= date.today()
    ).order_by(BloqueioHorarioModel.data, BloqueioHorarioModel.hora_inicio).all()
    
    return bloqueios

@router.post("/bloqueios", response_model=BloqueioHorarioResponse, status_code=status.HTTP_201_CREATED)
def criar_bloqueio(
    bloqueio_data: BloqueioHorarioCreate,
    current_user: Usuario = Depends(get_current_medico),
    db: Session = Depends(get_db)
):
    """Bloqueia horário específico"""
    medico = db.query(Medico).filter(Medico.usuario_id == current_user.id).first()
    
    # Validar data futura
    if bloqueio_data.data < date.today():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não é possível bloquear datas passadas"
        )
    
    # Validar hora_fim > hora_inicio
    if bloqueio_data.hora_fim <= bloqueio_data.hora_inicio:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Hora fim deve ser maior que hora início"
        )
    
    novo_bloqueio = BloqueioHorarioModel(
        medico_id=medico.id,
        data=bloqueio_data.data,
        hora_inicio=bloqueio_data.hora_inicio,
        hora_fim=bloqueio_data.hora_fim,
        motivo=bloqueio_data.motivo
    )
    
    db.add(novo_bloqueio)
    db.commit()
    db.refresh(novo_bloqueio)
    
    return novo_bloqueio

@router.delete("/bloqueios/{bloqueio_id}")
def remover_bloqueio(
    bloqueio_id: int,
    current_user: Usuario = Depends(get_current_medico),
    db: Session = Depends(get_db)
):
    """Remove bloqueio de horário"""
    medico = db.query(Medico).filter(Medico.usuario_id == current_user.id).first()
    
    bloqueio = db.query(BloqueioHorarioModel).filter(
        BloqueioHorarioModel.id == bloqueio_id,
        BloqueioHorarioModel.medico_id == medico.id
    ).first()
    
    if not bloqueio:
        raise HTTPException(status_code=404, detail="Bloqueio não encontrado")
    
    db.delete(bloqueio)
    db.commit()
    
    return {"message": "Bloqueio removido com sucesso"}

@router.get("/especialidades", response_model=List[EspecialidadeResponse])
def listar_especialidades(db: Session = Depends(get_db)):
    """Lista todas as especialidades médicas"""
    especialidades = db.query(Especialidade).filter(Especialidade.ativo == True).all()
    return especialidades
