"""
Testes para os validadores e regras de negócio
"""
import pytest
from datetime import date, time, datetime, timedelta
from app.models import Consulta, StatusConsulta, Paciente, Usuario
from app.utils.validators import (
    validar_limite_consultas,
    validar_cancelamento_24h,
    verificar_paciente_bloqueado,
    atualizar_faltas_consecutivas,
    verificar_conflito_horario,
    verificar_horario_disponivel
)


def test_validar_limite_consultas_sem_consultas(db, paciente):
    """Testa validação quando paciente não tem consultas"""
    resultado = validar_limite_consultas(db, paciente.id)
    assert resultado == True  # Pode agendar


def test_validar_limite_consultas_com_uma_consulta(db, paciente, medico):
    """Testa validação com uma consulta futura"""
    consulta = Consulta(
        paciente_id=paciente.id,
        medico_id=medico.id,
        data=date.today() + timedelta(days=1),
        hora=time(10, 0),
        status=StatusConsulta.AGENDADA
    )
    db.add(consulta)
    db.commit()
    
    resultado = validar_limite_consultas(db, paciente.id)
    assert resultado == True  # Ainda pode agendar (tem só 1)


def test_validar_limite_consultas_com_duas_consultas(db, paciente, medico):
    """Testa validação com duas consultas futuras (limite máximo)"""
    for i in range(2):
        consulta = Consulta(
            paciente_id=paciente.id,
            medico_id=medico.id,
            data=date.today() + timedelta(days=i+1),
            hora=time(10, 0),
            status=StatusConsulta.AGENDADA
        )
        db.add(consulta)
    db.commit()
    
    resultado = validar_limite_consultas(db, paciente.id)
    assert resultado == False  # Não pode agendar (já tem 2)


def test_validar_limite_consultas_ignora_passadas(db, paciente, medico):
    """Testa que consultas passadas não contam no limite"""
    # Criar consulta passada
    consulta_passada = Consulta(
        paciente_id=paciente.id,
        medico_id=medico.id,
        data=date.today() - timedelta(days=1),
        hora=time(10, 0),
        status=StatusConsulta.REALIZADA
    )
    db.add(consulta_passada)
    db.commit()
    
    resultado = validar_limite_consultas(db, paciente.id)
    assert resultado == True  # Pode agendar (consulta passada não conta)


def test_validar_cancelamento_24h_antecedencia(db, consulta):
    """Testa cancelamento com mais de 24h de antecedência"""
    # Consulta para o futuro distante
    consulta.data = date.today() + timedelta(days=10)
    consulta.hora = time(10, 0)
    db.commit()
    
    resultado = validar_cancelamento_24h(consulta)
    assert resultado == True  # Pode cancelar


def test_validar_cancelamento_menos_24h(db, medico, paciente):
    """Testa cancelamento com menos de 24h de antecedência"""
    # Consulta para amanhã (menos de 24h)
    agora = datetime.now()
    consulta_proxima = Consulta(
        paciente_id=paciente.id,
        medico_id=medico.id,
        data=agora.date(),
        hora=(agora + timedelta(hours=12)).time(),
        status=StatusConsulta.AGENDADA
    )
    db.add(consulta_proxima)
    db.commit()
    
    resultado = validar_cancelamento_24h(consulta_proxima)
    assert resultado == False  # Não pode cancelar


def test_verificar_paciente_nao_bloqueado(db, paciente):
    """Testa verificação de paciente não bloqueado"""
    resultado = verificar_paciente_bloqueado(db, paciente.id)
    assert resultado == False  # Não está bloqueado


def test_verificar_paciente_bloqueado_por_admin(db, paciente, usuario_paciente):
    """Testa verificação de paciente bloqueado pela administração"""
    usuario_paciente.bloqueado = True
    db.commit()
    
    resultado = verificar_paciente_bloqueado(db, paciente.id)
    assert resultado == True  # Está bloqueado


def test_verificar_paciente_bloqueado_por_faltas(db, paciente):
    """Testa bloqueio por 3 faltas consecutivas"""
    paciente.faltas_consecutivas = 3
    db.commit()
    
    resultado = verificar_paciente_bloqueado(db, paciente.id)
    assert resultado == True  # Está bloqueado por faltas


def test_atualizar_faltas_incrementar(db, paciente):
    """Testa incremento de faltas consecutivas"""
    assert paciente.faltas_consecutivas == 0
    
    atualizar_faltas_consecutivas(db, paciente.id, compareceu=False)
    
    db.refresh(paciente)
    assert paciente.faltas_consecutivas == 1


def test_atualizar_faltas_zerar(db, paciente):
    """Testa reset de faltas quando paciente comparece"""
    paciente.faltas_consecutivas = 2
    db.commit()
    
    atualizar_faltas_consecutivas(db, paciente.id, compareceu=True)
    
    db.refresh(paciente)
    assert paciente.faltas_consecutivas == 0


def test_atualizar_faltas_bloqueia_apos_tres(db, paciente, usuario_paciente):
    """Testa bloqueio automático após 3 faltas"""
    assert usuario_paciente.bloqueado == False
    
    # Simular 3 faltas
    for i in range(3):
        atualizar_faltas_consecutivas(db, paciente.id, compareceu=False)
    
    db.refresh(usuario_paciente)
    assert usuario_paciente.bloqueado == True


def test_verificar_conflito_horario_sem_conflito(db, medico):
    """Testa verificação de conflito quando não há consultas"""
    resultado = verificar_conflito_horario(
        db, medico.id, date(2025, 12, 1), time(10, 0)
    )
    assert resultado == False  # Não há conflito


def test_verificar_conflito_horario_com_conflito(db, consulta):
    """Testa verificação de conflito quando horário já está ocupado"""
    resultado = verificar_conflito_horario(
        db, consulta.medico_id, consulta.data, consulta.hora
    )
    assert resultado == True  # Há conflito


def test_verificar_horario_disponivel_segunda(db, horario_disponivel):
    """Testa verificação de horário disponível em dia da semana configurado"""
    # Segunda-feira (dia_semana=0)
    data_segunda = date(2025, 12, 1)  # Exemplo de segunda
    
    resultado = verificar_horario_disponivel(
        db, horario_disponivel.medico_id, data_segunda, time(10, 0)
    )
    assert resultado == True  # Horário disponível


def test_verificar_horario_fora_do_expediente(db, horario_disponivel):
    """Testa verificação de horário fora do expediente"""
    data_segunda = date(2025, 12, 1)
    
    resultado = verificar_horario_disponivel(
        db, horario_disponivel.medico_id, data_segunda, time(20, 0)
    )
    assert resultado == False  # Fora do horário (depois das 18h)
