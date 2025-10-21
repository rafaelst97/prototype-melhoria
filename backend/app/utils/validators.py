from datetime import datetime, date, timedelta, time
from typing import List
from sqlalchemy.orm import Session
from app.models import Consulta, HorarioDisponivel, BloqueioHorario, StatusConsulta

def validar_limite_consultas(db: Session, paciente_id: int) -> bool:
    """Verifica se o paciente tem menos de 2 consultas agendadas"""
    consultas_ativas = db.query(Consulta).filter(
        Consulta.paciente_id == paciente_id,
        Consulta.status.in_([StatusConsulta.AGENDADA, StatusConsulta.CONFIRMADA]),
        Consulta.data >= date.today()
    ).count()
    
    return consultas_ativas < 2

def validar_cancelamento_24h(consulta: Consulta) -> bool:
    """Verifica se a consulta pode ser cancelada (mais de 24h de antecedência)"""
    data_consulta = datetime.combine(consulta.data, consulta.hora)
    agora = datetime.now()
    diferenca = data_consulta - agora
    
    return diferenca.total_seconds() > 24 * 3600

def verificar_conflito_horario(
    db: Session,
    medico_id: int,
    data: date,
    hora: time
) -> bool:
    """Verifica se já existe uma consulta no mesmo horário"""
    conflito = db.query(Consulta).filter(
        Consulta.medico_id == medico_id,
        Consulta.data == data,
        Consulta.hora == hora,
        Consulta.status.in_([StatusConsulta.AGENDADA, StatusConsulta.CONFIRMADA])
    ).first()
    
    return conflito is not None

def verificar_horario_bloqueado(
    db: Session,
    medico_id: int,
    data: date,
    hora: time
) -> bool:
    """Verifica se o horário está bloqueado pelo médico"""
    bloqueio = db.query(BloqueioHorario).filter(
        BloqueioHorario.medico_id == medico_id,
        BloqueioHorario.data == data,
        BloqueioHorario.hora_inicio <= hora,
        BloqueioHorario.hora_fim > hora
    ).first()
    
    return bloqueio is not None

def verificar_horario_disponivel(
    db: Session,
    medico_id: int,
    data: date,
    hora: time
) -> bool:
    """Verifica se o horário está na grade de disponibilidade do médico"""
    dia_semana = data.weekday()  # 0=Monday, 6=Sunday
    
    horario = db.query(HorarioDisponivel).filter(
        HorarioDisponivel.medico_id == medico_id,
        HorarioDisponivel.dia_semana == dia_semana,
        HorarioDisponivel.hora_inicio <= hora,
        HorarioDisponivel.hora_fim > hora,
        HorarioDisponivel.ativo == True
    ).first()
    
    return horario is not None

def gerar_horarios_disponiveis(
    db: Session,
    medico_id: int,
    data: date,
    tempo_consulta: int = 30
) -> List[str]:
    """Gera lista de horários disponíveis para uma data específica"""
    dia_semana = data.weekday()
    
    # Buscar grade de horários do médico para esse dia
    horarios_config = db.query(HorarioDisponivel).filter(
        HorarioDisponivel.medico_id == medico_id,
        HorarioDisponivel.dia_semana == dia_semana,
        HorarioDisponivel.ativo == True
    ).all()
    
    if not horarios_config:
        return []
    
    horarios_disponiveis = []
    
    for config in horarios_config:
        hora_atual = datetime.combine(date.today(), config.hora_inicio)
        hora_fim = datetime.combine(date.today(), config.hora_fim)
        
        while hora_atual < hora_fim:
            hora_time = hora_atual.time()
            
            # Verificar se não está bloqueado
            if not verificar_horario_bloqueado(db, medico_id, data, hora_time):
                # Verificar se não tem conflito
                if not verificar_conflito_horario(db, medico_id, data, hora_time):
                    horarios_disponiveis.append(hora_time.strftime("%H:%M"))
            
            hora_atual += timedelta(minutes=tempo_consulta)
    
    return sorted(horarios_disponiveis)
