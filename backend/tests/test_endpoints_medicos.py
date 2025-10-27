"""
Testes para os endpoints de médicos
"""
import pytest
from datetime import date, time, timedelta
from app.models import StatusConsulta


def test_criar_observacao(client, token_medico, consulta):
    """Testa criação de observação para consulta"""
    dados = {
        "consulta_id": consulta.id,
        "descricao": "Paciente apresentou melhora significativa. Diagnóstico: Gripe comum. Prescrição: Continuar com medicamento atual"
    }
    
    response = client.post(
        "/medicos/observacoes",
        json=dados,
        headers={"Authorization": f"Bearer {token_medico}"}
    )
    assert response.status_code == 201
    assert response.json()["descricao"] == dados["descricao"]


def test_criar_observacao_consulta_outro_medico(client, token_medico, medico, paciente, db):
    """Testa tentativa de criar observação para consulta de outro médico"""
    from app.models import Consulta, Medico, Usuario, TipoUsuario
    from app.utils.auth import get_password_hash
    
    # Criar outro médico
    outro_usuario = Usuario(
        nome="Dr. Outro",
        email="outro@email.com",
        senha_hash=get_password_hash("senha123"),
        tipo=TipoUsuario.MEDICO
    )
    db.add(outro_usuario)
    db.commit()
    db.refresh(outro_usuario)
    
    outro_medico = Medico(
        usuario_id=outro_usuario.id,
        crm="99999",
        especialidade_id=1
    )
    db.add(outro_medico)
    db.commit()
    db.refresh(outro_medico)
    
    # Criar consulta do outro médico
    consulta = Consulta(
        paciente_id=paciente.id,
        medico_id=outro_medico.id,
        data=date.today() + timedelta(days=1),
        hora=time(10, 0),
        status=StatusConsulta.AGENDADA
    )
    db.add(consulta)
    db.commit()
    db.refresh(consulta)
    
    dados = {
        "consulta_id": consulta.id,
        "descricao": "Tentativa inválida"
    }
    
    response = client.post(
        "/medicos/observacoes",
        json=dados,
        headers={"Authorization": f"Bearer {token_medico}"}
    )
    assert response.status_code == 404  # Consulta não encontrada (não pertence ao médico autenticado)


def test_buscar_observacao_por_consulta(client, token_medico, consulta, db):
    """Testa busca de observação por ID da consulta"""
    from app.models import Observacao
    
    # Criar observação
    observacao = Observacao(
        consulta_id=consulta.id,
        descricao="Teste de observação e prescrição"
    )
    db.add(observacao)
    db.commit()
    
    response = client.get(
        f"/medicos/observacoes/{consulta.id}",
        headers={"Authorization": f"Bearer {token_medico}"}
    )
    assert response.status_code == 200
    assert response.json()["descricao"] == "Teste de observação e prescrição"


def test_atualizar_observacao(client, token_medico, consulta, db):
    """Testa atualização de observação existente"""
    from app.models import Observacao
    
    # Criar observação
    observacao = Observacao(
        consulta_id=consulta.id,
        descricao="Observação inicial"
    )
    db.add(observacao)
    db.commit()
    
    dados = {
        "descricao": "Observação atualizada com nova prescrição e diagnóstico"
    }
    
    response = client.put(
        f"/medicos/observacoes/{consulta.id}",
        json=dados,
        headers={"Authorization": f"Bearer {token_medico}"}
    )
    assert response.status_code == 200
    assert response.json()["descricao"] == "Observação atualizada com nova prescrição e diagnóstico"


def test_listar_consultas_medico(client, token_medico, consulta):
    """Testa listagem de consultas do médico"""
    response = client.get(
        "/medicos/consultas",
        headers={"Authorization": f"Bearer {token_medico}"}
    )
    assert response.status_code == 200
    assert len(response.json()) >= 1


def test_marcar_consulta_como_realizada(client, token_medico, consulta, db):
    """Testa marcação de consulta como realizada"""
    response = client.put(
        f"/medicos/consultas/{consulta.id}",
        json={"status": "realizada"},
        headers={"Authorization": f"Bearer {token_medico}"}
    )
    assert response.status_code == 200
    assert response.json()["status"] == "realizada"
    
    # Verificar que faltas foram zeradas
    db.refresh(consulta.paciente)
    assert consulta.paciente.faltas_consecutivas == 0


def test_marcar_consulta_como_faltou(client, token_medico, paciente, medico, db):
    """Testa marcação de falta e incremento de contador"""
    from app.models import Consulta
    
    # Garantir que paciente começa com 0 faltas
    paciente.faltas_consecutivas = 0
    db.commit()
    
    consulta = Consulta(
        paciente_id=paciente.id,
        medico_id=medico.id,
        data=date.today(),
        hora=time(10, 0),
        status=StatusConsulta.AGENDADA
    )
    db.add(consulta)
    db.commit()
    db.refresh(consulta)
    
    response = client.put(
        f"/medicos/consultas/{consulta.id}",
        json={"status": "faltou"},
        headers={"Authorization": f"Bearer {token_medico}"}
    )
    assert response.status_code == 200
    assert response.json()["status"] == "faltou"
    
    # Verificar incremento de faltas
    db.refresh(paciente)
    assert paciente.faltas_consecutivas == 1


def test_tres_faltas_bloqueia_paciente(client, token_medico, paciente, medico, usuario_paciente, db):
    """Testa bloqueio automático após 3 faltas consecutivas"""
    from app.models import Consulta
    
    # Resetar contadores
    paciente.faltas_consecutivas = 0
    usuario_paciente.bloqueado = False
    db.commit()
    
    # Criar 3 consultas e marcar como falta
    for i in range(3):
        consulta = Consulta(
            paciente_id=paciente.id,
            medico_id=medico.id,
            data=date.today() - timedelta(days=i+1),
            hora=time(10, 0),
            status=StatusConsulta.AGENDADA
        )
        db.add(consulta)
        db.commit()
        db.refresh(consulta)
        
        response = client.put(
            f"/medicos/consultas/{consulta.id}",
            json={"status": "faltou"},
            headers={"Authorization": f"Bearer {token_medico}"}
        )
        assert response.status_code == 200
    
    # Verificar bloqueio
    db.refresh(usuario_paciente)
    db.refresh(paciente)
    assert paciente.faltas_consecutivas == 3
    assert usuario_paciente.bloqueado == True


def test_criar_horario_disponivel(client, token_medico, medico):
    """Testa criação de horário disponível"""
    dados = {
        "dia_semana": 1,  # Terça-feira
        "hora_inicio": "08:00",
        "hora_fim": "12:00"
    }
    
    response = client.post(
        "/medicos/horarios",
        json=dados,
        headers={"Authorization": f"Bearer {token_medico}"}
    )
    assert response.status_code == 201
    assert response.json()["dia_semana"] == 1


def test_listar_horarios_disponiveis_medico(client, token_medico, horario_disponivel):
    """Testa listagem de horários disponíveis do médico"""
    response = client.get(
        "/medicos/horarios",
        headers={"Authorization": f"Bearer {token_medico}"}
    )
    assert response.status_code == 200
    assert len(response.json()) >= 1


def test_excluir_horario_disponivel(client, token_medico, horario_disponivel):
    """Testa exclusão de horário disponível"""
    response = client.delete(
        f"/medicos/horarios/{horario_disponivel.id}",
        headers={"Authorization": f"Bearer {token_medico}"}
    )
    assert response.status_code == 200


def test_visualizar_perfil_medico(client, token_medico, medico):
    """Testa visualização do próprio perfil"""
    response = client.get(
        f"/medicos/perfil",
        headers={"Authorization": f"Bearer {token_medico}"}
    )
    assert response.status_code == 200
    assert response.json()["crm"] == medico.crm


def test_atualizar_perfil_medico(client, token_medico, medico):
    """Testa atualização de perfil do médico"""
    dados = {
        "telefone": "47988888888"
    }
    
    response = client.put(
        "/medicos/perfil",
        json=dados,
        headers={"Authorization": f"Bearer {token_medico}"}
    )
    assert response.status_code == 200
    assert response.json()["telefone"] == "47988888888"
