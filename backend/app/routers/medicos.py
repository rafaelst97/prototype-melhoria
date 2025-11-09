"""
Router de Médicos - Sistema Clínica Saúde+
Implementa todos os casos de uso do módulo Médico conforme CasosDeUso.txt
Atualizado para modelo conforme MER
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, func
from typing import List
from datetime import date, datetime, time
from app.database import get_db
from app.models.models import (
    Medico, Consulta, HorarioTrabalho, Observacao,
    Paciente, Especialidade
)
from app.schemas.schemas import (
    MedicoResponse, MedicoUpdate,
    ConsultaResponse, ConsultaUpdate,
    HorarioTrabalhoCreate, HorarioTrabalhoResponse, HorarioTrabalhoMultiplosCreate,
    ObservacaoCreate, ObservacaoUpdate, ObservacaoResponse
)

router = APIRouter(prefix="/medicos", tags=["Médicos"])


@router.get("/perfil/{medico_id}", response_model=MedicoResponse)
def get_perfil(medico_id: int, db: Session = Depends(get_db)):
    """
    Retorna perfil do médico
    Deve ser chamado com o ID do médico obtido do token JWT
    """
    medico = db.query(Medico).options(
        joinedload(Medico.especialidade)
    ).filter(Medico.id_medico == medico_id).first()
    
    if not medico:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Médico não encontrado"
        )
    
    return medico


@router.put("/perfil/{medico_id}", response_model=MedicoResponse)
def atualizar_perfil(
    medico_id: int,
    medico_update: MedicoUpdate,
    db: Session = Depends(get_db)
):
    """
    Atualiza perfil do médico
    Permite atualizar: nome, especialidade
    """
    medico = db.query(Medico).filter(Medico.id_medico == medico_id).first()
    
    if not medico:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Médico não encontrado"
        )
    
    # Atualizar campos fornecidos
    if medico_update.nome is not None:
        medico.nome = medico_update.nome
    if medico_update.id_especialidade_fk is not None:
        # Verificar se especialidade existe
        especialidade = db.query(Especialidade).filter(
            Especialidade.id_especialidade == medico_update.id_especialidade_fk
        ).first()
        if not especialidade:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Especialidade não encontrada"
            )
        medico.id_especialidade_fk = medico_update.id_especialidade_fk
    
    db.commit()
    db.refresh(medico)
    return medico


@router.post("/horarios", response_model=List[HorarioTrabalhoResponse], status_code=status.HTTP_201_CREATED)
def cadastrar_horarios(
    medico_id: int,
    horarios_data: HorarioTrabalhoMultiplosCreate,
    db: Session = Depends(get_db)
):
    """
    Caso de Uso: Gerenciar Horários de Trabalho
    Cadastra múltiplos horários de atendimento do médico
    Define horários disponíveis semanalmente
    """
    # Verificar se médico existe
    medico = db.query(Medico).filter(Medico.id_medico == medico_id).first()
    if not medico:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Médico não encontrado"
        )
    
    horarios_criados = []
    
    for horario_data in horarios_data.horarios:
        # Validar que hora_fim > hora_inicio
        if horario_data.hora_fim <= horario_data.hora_inicio:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Hora de fim deve ser posterior à hora de início"
            )
        
        # Verificar conflito com horários existentes
        conflito = db.query(HorarioTrabalho).filter(
            and_(
                HorarioTrabalho.id_medico_fk == medico_id,
                HorarioTrabalho.dia_semana == horario_data.dia_semana,
                or_(
                    and_(
                        HorarioTrabalho.hora_inicio <= horario_data.hora_inicio,
                        HorarioTrabalho.hora_fim > horario_data.hora_inicio
                    ),
                    and_(
                        HorarioTrabalho.hora_inicio < horario_data.hora_fim,
                        HorarioTrabalho.hora_fim >= horario_data.hora_fim
                    )
                )
            )
        ).first()
        
        if conflito:
            dias = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Conflito de horário na {dias[horario_data.dia_semana]}: já existe horário cadastrado que sobrepõe este período"
            )
        
        # Criar horário
        novo_horario = HorarioTrabalho(
            dia_semana=horario_data.dia_semana,
            hora_inicio=horario_data.hora_inicio,
            hora_fim=horario_data.hora_fim,
            id_medico_fk=medico_id
        )
        db.add(novo_horario)
        horarios_criados.append(novo_horario)
    
    db.commit()
    for horario in horarios_criados:
        db.refresh(horario)
    
    return horarios_criados


@router.get("/horarios/{medico_id}", response_model=List[HorarioTrabalhoResponse])
def listar_horarios(medico_id: int, db: Session = Depends(get_db)):
    """
    Lista todos os horários de trabalho configurados pelo médico
    """
    # Verificar se médico existe
    medico = db.query(Medico).filter(Medico.id_medico == medico_id).first()
    if not medico:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Médico não encontrado"
        )
    
    horarios = db.query(HorarioTrabalho).filter(
        HorarioTrabalho.id_medico_fk == medico_id
    ).order_by(HorarioTrabalho.dia_semana, HorarioTrabalho.hora_inicio).all()
    
    return horarios


@router.delete("/horarios/{horario_id}", status_code=status.HTTP_200_OK)
def excluir_horario(
    horario_id: int,
    medico_id: int,
    db: Session = Depends(get_db)
):
    """
    Exclui um horário de trabalho
    Caso de Uso: Gerenciar Horários de Trabalho (edição)
    """
    horario = db.query(HorarioTrabalho).filter(
        and_(
            HorarioTrabalho.id_horario == horario_id,
            HorarioTrabalho.id_medico_fk == medico_id
        )
    ).first()
    
    if not horario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Horário não encontrado"
        )
    
    db.delete(horario)
    db.commit()
    
    return {
        "sucesso": True,
        "mensagem": "Horário excluído com sucesso"
    }


@router.get("/consultas/{medico_id}", response_model=List[ConsultaResponse])
def listar_consultas(
    medico_id: int,
    data_inicio: date = None,
    data_fim: date = None,
    db: Session = Depends(get_db)
):
    """
    Caso de Uso: Visualizar Consultas Agendadas
    Lista consultas do médico, opcionalmente filtradas por período
    """
    # Verificar se médico existe
    medico = db.query(Medico).filter(Medico.id_medico == medico_id).first()
    if not medico:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Médico não encontrado"
        )
    
    query = db.query(Consulta).options(
        joinedload(Consulta.paciente),
        joinedload(Consulta.medico)
    ).filter(Consulta.id_medico_fk == medico_id)
    
    if data_inicio:
        data_inicio_dt = datetime.combine(data_inicio, time.min)
        query = query.filter(Consulta.data_hora_inicio >= data_inicio_dt)
    
    if data_fim:
        data_fim_dt = datetime.combine(data_fim, time.max)
        query = query.filter(Consulta.data_hora_inicio <= data_fim_dt)
    
    consultas = query.order_by(Consulta.data_hora_inicio).all()
    
    return consultas


@router.get("/consultas/hoje/{medico_id}", response_model=List[ConsultaResponse])
def consultas_hoje(medico_id: int, db: Session = Depends(get_db)):
    """
    Lista consultas do dia atual do médico
    Caso de Uso: Visualizar Consultas Agendadas (por data)
    """
    hoje = date.today()
    return listar_consultas(medico_id, data_inicio=hoje, data_fim=hoje, db=db)


@router.put("/consultas/{consulta_id}/status", response_model=ConsultaResponse)
def atualizar_status_consulta(
    consulta_id: int,
    medico_id: int,
    novo_status: str,
    db: Session = Depends(get_db)
):
    """
    Atualiza status da consulta (agendada, confirmada, realizada, faltou)
    Caso de Uso: Visualizar Consultas Agendadas (marcar como realizada)
    
    RN3: Se marcar como 'faltou', incrementa contador de faltas do paciente
    """
    # Buscar consulta
    consulta = db.query(Consulta).filter(
        and_(
            Consulta.id_consulta == consulta_id,
            Consulta.id_medico_fk == medico_id
        )
    ).first()
    
    if not consulta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consulta não encontrada"
        )
    
    # Validar novo status
    status_validos = ['agendada', 'confirmada', 'realizada', 'faltou', 'cancelada']
    if novo_status not in status_validos:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Status inválido. Valores permitidos: {', '.join(status_validos)}"
        )
    
    status_antigo = consulta.status
    consulta.status = novo_status
    
    # RN3: Aplicar regra de faltas consecutivas
    if novo_status == 'faltou' and status_antigo != 'faltou':
        # Não precisa fazer nada aqui, a verificação é feita ao tentar agendar
        pass
    elif novo_status == 'realizada' and status_antigo != 'realizada':
        # Quando consulta é realizada, não há falta (útil para histórico)
        pass
    
    db.commit()
    db.refresh(consulta)
    
    return consulta


@router.post("/observacoes", response_model=ObservacaoResponse, status_code=status.HTTP_201_CREATED)
def registrar_observacao(
    medico_id: int,
    observacao_data: ObservacaoCreate,
    db: Session = Depends(get_db)
):
    """
    Caso de Uso: Registrar Observações da Consulta
    Médico registra observações após a consulta
    Observação visível apenas para médico e administração
    """
    # Verificar se consulta existe e pertence ao médico
    consulta = db.query(Consulta).filter(
        and_(
            Consulta.id_consulta == observacao_data.id_consulta_fk,
            Consulta.id_medico_fk == medico_id
        )
    ).first()
    
    if not consulta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consulta não encontrada"
        )
    
    # Verificar se já existe observação para esta consulta
    observacao_existente = db.query(Observacao).filter(
        Observacao.id_consulta_fk == observacao_data.id_consulta_fk
    ).first()
    
    if observacao_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Já existe uma observação para esta consulta. Use PUT para atualizar."
        )
    
    # Criar observação
    nova_observacao = Observacao(
        descricao=observacao_data.descricao,
        id_consulta_fk=observacao_data.id_consulta_fk
    )
    
    db.add(nova_observacao)
    db.commit()
    db.refresh(nova_observacao)
    
    return nova_observacao


@router.put("/observacoes/{observacao_id}", response_model=ObservacaoResponse)
def atualizar_observacao(
    observacao_id: int,
    medico_id: int,
    observacao_data: ObservacaoUpdate,
    db: Session = Depends(get_db)
):
    """
    Atualiza observação existente
    Caso de Uso: Registrar Observações da Consulta (edição)
    """
    # Buscar observação e verificar se a consulta pertence ao médico
    observacao = db.query(Observacao).join(Consulta).filter(
        and_(
            Observacao.id_observacao == observacao_id,
            Consulta.id_medico_fk == medico_id
        )
    ).first()
    
    if not observacao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Observação não encontrada"
        )
    
    observacao.descricao = observacao_data.descricao
    
    db.commit()
    db.refresh(observacao)
    
    return observacao


@router.get("/observacoes/{consulta_id}", response_model=ObservacaoResponse)
def visualizar_observacao(
    consulta_id: int,
    medico_id: int,
    db: Session = Depends(get_db)
):
    """
    Caso de Uso: Visualizar Observações da Consulta
    Médico pode visualizar observações que ele registrou
    """
    # Verificar se consulta pertence ao médico
    consulta = db.query(Consulta).filter(
        and_(
            Consulta.id_consulta == consulta_id,
            Consulta.id_medico_fk == medico_id
        )
    ).first()
    
    if not consulta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consulta não encontrada"
        )
    
    # Buscar observação
    observacao = db.query(Observacao).filter(
        Observacao.id_consulta_fk == consulta_id
    ).first()
    
    if not observacao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nenhuma observação encontrada para esta consulta"
        )
    
    return observacao


@router.get("/estatisticas/{medico_id}")
def obter_estatisticas(medico_id: int, db: Session = Depends(get_db)):
    """
    Retorna estatísticas do médico:
    - Consultas hoje
    - Consultas esta semana
    - Horários bloqueados
    """
    from datetime import timedelta
    
    # Verificar se médico existe
    medico = db.query(Medico).filter(Medico.id_medico == medico_id).first()
    if not medico:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Médico não encontrado"
        )
    
    hoje = date.today()
    inicio_semana = hoje - timedelta(days=hoje.weekday())
    fim_semana = inicio_semana + timedelta(days=6)
    
    # Consultas hoje
    consultas_hoje = db.query(Consulta).filter(
        Consulta.id_medico_fk == medico_id,
        func.date(Consulta.data_hora_inicio) == hoje,
        Consulta.status.in_(['agendada', 'realizada'])
    ).count()
    
    # Consultas esta semana
    consultas_semana = db.query(Consulta).filter(
        Consulta.id_medico_fk == medico_id,
        func.date(Consulta.data_hora_inicio) >= inicio_semana,
        func.date(Consulta.data_hora_inicio) <= fim_semana,
        Consulta.status.in_(['agendada', 'realizada'])
    ).count()
    
    # Horários bloqueados (considerando horários de trabalho ativos)
    # Por simplicidade, vamos retornar 0 por enquanto
    # TODO: Implementar lógica de horários bloqueados quando a funcionalidade for criada
    horarios_bloqueados = 0
    
    return {
        "consultas_hoje": consultas_hoje,
        "consultas_semana": consultas_semana,
        "horarios_bloqueados": horarios_bloqueados
    }
