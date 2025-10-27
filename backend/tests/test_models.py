"""
Testes para os modelos de dados
"""
import pytest
from datetime import date, time, datetime
from app.models import (
    Usuario, TipoUsuario, Paciente, Medico, Observacao, Relatorio,
    Consulta, StatusConsulta
)


def test_criar_observacao(db, consulta):
    """Testa criação de observação"""
    observacao = Observacao(
        consulta_id=consulta.id,
        descricao="Paciente apresentou melhora significativa"
    )
    db.add(observacao)
    db.commit()
    db.refresh(observacao)
    
    assert observacao.id is not None
    assert observacao.consulta_id == consulta.id
    assert observacao.descricao == "Paciente apresentou melhora significativa"
    assert observacao.data_criacao is not None


def test_observacao_unica_por_consulta(db, consulta):
    """Testa que uma consulta só pode ter uma observação"""
    obs1 = Observacao(
        consulta_id=consulta.id,
        descricao="Primeira observação"
    )
    db.add(obs1)
    db.commit()
    
    # Tentar criar segunda observação deve falhar
    obs2 = Observacao(
        consulta_id=consulta.id,
        descricao="Segunda observação"
    )
    db.add(obs2)
    
    with pytest.raises(Exception):
        db.commit()


def test_criar_relatorio(db, admin):
    """Testa criação de relatório"""
    relatorio = Relatorio(
        admin_id=admin.id,
        tipo="consultas_por_medico",
        dados_resultado='{"dados": "teste"}',
        parametros='{"periodo": "mensal"}'
    )
    db.add(relatorio)
    db.commit()
    db.refresh(relatorio)
    
    assert relatorio.id is not None
    assert relatorio.admin_id == admin.id
    assert relatorio.tipo == "consultas_por_medico"
    assert relatorio.data_geracao is not None


def test_paciente_faltas_consecutivas(db, paciente):
    """Testa contador de faltas consecutivas"""
    assert paciente.faltas_consecutivas == 0
    
    # Incrementar faltas
    paciente.faltas_consecutivas += 1
    db.commit()
    db.refresh(paciente)
    
    assert paciente.faltas_consecutivas == 1


def test_relacionamento_consulta_observacao(db, consulta):
    """Testa relacionamento entre consulta e observação"""
    observacao = Observacao(
        consulta_id=consulta.id,
        descricao="Teste de relacionamento"
    )
    db.add(observacao)
    db.commit()
    
    # Verificar relacionamento bidirecional
    db.refresh(consulta)
    assert consulta.observacao is not None
    assert consulta.observacao.descricao == "Teste de relacionamento"
    assert observacao.consulta.id == consulta.id


def test_relacionamento_admin_relatorios(db, admin):
    """Testa relacionamento entre admin e relatórios"""
    # Criar múltiplos relatórios
    for i in range(3):
        relatorio = Relatorio(
            admin_id=admin.id,
            tipo=f"tipo_{i}",
            dados_resultado=f'{{"dados": {i}}}'
        )
        db.add(relatorio)
    db.commit()
    
    db.refresh(admin)
    assert len(admin.relatorios) == 3


def test_usuario_bloqueado(db, usuario_paciente):
    """Testa bloqueio de usuário"""
    assert usuario_paciente.bloqueado == False
    
    usuario_paciente.bloqueado = True
    db.commit()
    db.refresh(usuario_paciente)
    
    assert usuario_paciente.bloqueado == True


def test_consulta_status_transicoes(db, consulta):
    """Testa transições de status da consulta"""
    assert consulta.status == StatusConsulta.AGENDADA
    
    # Confirmar consulta
    consulta.status = StatusConsulta.CONFIRMADA
    db.commit()
    db.refresh(consulta)
    assert consulta.status == StatusConsulta.CONFIRMADA
    
    # Realizar consulta
    consulta.status = StatusConsulta.REALIZADA
    db.commit()
    db.refresh(consulta)
    assert consulta.status == StatusConsulta.REALIZADA
