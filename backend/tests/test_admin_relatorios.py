"""
Testes para geração de relatórios e endpoints de administração
"""
import pytest
from datetime import date, time, timedelta
from io import BytesIO
from app.models import StatusConsulta


def test_relatorio_consultas_por_medico(client, token_admin, admin, consulta, db):
    """Testa geração de relatório de consultas por médico"""
    data_inicio = (date.today() - timedelta(days=30)).isoformat()
    data_fim = (date.today() + timedelta(days=30)).isoformat()
    
    response = client.get(
        f"/admin/relatorios/consultas-por-medico?data_inicio={data_inicio}&data_fim={data_fim}&formato=pdf",
        headers={"Authorization": f"Bearer {token_admin}"}
    )
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert len(response.content) > 0


def test_relatorio_consultas_por_especialidade(client, token_admin, admin, consulta):
    """Testa geração de relatório de consultas por especialidade"""
    data_inicio = (date.today() - timedelta(days=30)).isoformat()
    data_fim = (date.today() + timedelta(days=30)).isoformat()
    
    response = client.get(
        f"/admin/relatorios/consultas-por-especialidade?data_inicio={data_inicio}&data_fim={data_fim}&formato=pdf",
        headers={"Authorization": f"Bearer {token_admin}"}
    )
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert len(response.content) > 0


def test_relatorio_cancelamentos(client, token_admin, admin, paciente, medico, db):
    """Testa geração de relatório de cancelamentos"""
    from app.models import Consulta
    
    # Criar consulta cancelada
    consulta = Consulta(
        paciente_id=paciente.id,
        medico_id=medico.id,
        data=date.today() + timedelta(days=5),
        hora=time(10, 0),
        status=StatusConsulta.CANCELADA
    )
    db.add(consulta)
    db.commit()
    
    data_inicio = (date.today() - timedelta(days=30)).isoformat()
    data_fim = (date.today() + timedelta(days=30)).isoformat()
    
    response = client.get(
        f"/admin/relatorios/cancelamentos?data_inicio={data_inicio}&data_fim={data_fim}&formato=pdf",
        headers={"Authorization": f"Bearer {token_admin}"}
    )
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"


def test_relatorio_pacientes_frequentes(client, token_admin, admin, paciente, medico, db):
    """Testa geração de relatório de pacientes frequentes"""
    from app.models import Consulta
    
    # Criar várias consultas realizadas para o paciente
    for i in range(5):
        consulta = Consulta(
            paciente_id=paciente.id,
            medico_id=medico.id,
            data=date.today() - timedelta(days=i*7),
            hora=time(10, 0),
            status=StatusConsulta.REALIZADA
        )
        db.add(consulta)
    db.commit()
    
    data_inicio = (date.today() - timedelta(days=60)).isoformat()
    data_fim = date.today().isoformat()
    
    response = client.get(
        f"/admin/relatorios/pacientes-frequentes?data_inicio={data_inicio}&data_fim={data_fim}&formato=pdf",
        headers={"Authorization": f"Bearer {token_admin}"}
    )
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"


def test_relatorio_sem_autorizacao(client, token_paciente):
    """Testa que paciente não pode acessar relatórios"""
    data_inicio = (date.today() - timedelta(days=30)).isoformat()
    data_fim = date.today().isoformat()
    
    response = client.get(
        f"/admin/relatorios/consultas-por-medico?data_inicio={data_inicio}&data_fim={data_fim}",
        headers={"Authorization": f"Bearer {token_paciente}"}
    )
    assert response.status_code == 403


def test_listar_todos_pacientes(client, token_admin, paciente):
    """Testa listagem de todos os pacientes"""
    response = client.get(
        "/admin/pacientes",
        headers={"Authorization": f"Bearer {token_admin}"}
    )
    assert response.status_code == 200
    assert len(response.json()) >= 1


def test_desbloquear_paciente(client, token_admin, paciente, usuario_paciente, db):
    """Testa desbloqueio de paciente pela administração"""
    # Bloquear paciente
    usuario_paciente.bloqueado = True
    paciente.faltas_consecutivas = 3
    db.commit()
    
    response = client.put(
        f"/admin/pacientes/{paciente.id}/desbloquear",
        headers={"Authorization": f"Bearer {token_admin}"}
    )
    assert response.status_code == 200
    
    # Verificar desbloqueio
    db.refresh(usuario_paciente)
    db.refresh(paciente)
    assert usuario_paciente.bloqueado == False
    assert paciente.faltas_consecutivas == 0


def test_bloquear_paciente(client, token_admin, paciente, usuario_paciente, db):
    """Testa bloqueio manual de paciente pela administração"""
    response = client.put(
        f"/admin/pacientes/{paciente.id}/bloquear",
        headers={"Authorization": f"Bearer {token_admin}"}
    )
    assert response.status_code == 200
    
    db.refresh(usuario_paciente)
    assert usuario_paciente.bloqueado == True


def test_listar_todos_medicos(client, token_admin, medico):
    """Testa listagem de todos os médicos"""
    response = client.get(
        "/admin/medicos",
        headers={"Authorization": f"Bearer {token_admin}"}
    )
    assert response.status_code == 200
    assert len(response.json()) >= 1


def test_criar_convenio(client, token_admin):
    """Testa criação de convênio"""
    dados = {
        "nome": "Unimed Premium",
        "codigo": "UNIMED-PREM-001",
        "telefone": "4733334444"
    }
    
    response = client.post(
        "/admin/convenios",
        json=dados,
        headers={"Authorization": f"Bearer {token_admin}"}
    )
    assert response.status_code == 201
    assert response.json()["nome"] == "Unimed Premium"


def test_listar_convenios(client, token_admin, convenio):
    """Testa listagem de convênios"""
    response = client.get(
        "/admin/convenios",
        headers={"Authorization": f"Bearer {token_admin}"}
    )
    assert response.status_code == 200
    assert len(response.json()) >= 1


def test_atualizar_convenio(client, token_admin, convenio):
    """Testa atualização de convênio"""
    dados = {
        "telefone": "4799999999"
    }
    
    response = client.put(
        f"/admin/convenios/{convenio.id}",
        json=dados,
        headers={"Authorization": f"Bearer {token_admin}"}
    )
    assert response.status_code == 200
    assert response.json()["telefone"] == "4799999999"


def test_excluir_convenio(client, token_admin, db):
    """Testa exclusão de convênio"""
    from app.models import Convenio
    
    # Criar convênio para excluir
    convenio = Convenio(
        nome="Convenio Teste",
        codigo="CONV-TEST-001"
    )
    db.add(convenio)
    db.commit()
    db.refresh(convenio)
    
    response = client.delete(
        f"/admin/convenios/{convenio.id}",
        headers={"Authorization": f"Bearer {token_admin}"}
    )
    assert response.status_code == 200


def test_criar_especialidade(client, token_admin):
    """Testa criação de especialidade"""
    dados = {
        "nome": "Neurologia",
        "descricao": "Especialidade em sistema nervoso"
    }
    
    response = client.post(
        "/admin/especialidades",
        json=dados,
        headers={"Authorization": f"Bearer {token_admin}"}
    )
    assert response.status_code == 201
    assert response.json()["nome"] == "Neurologia"


def test_listar_especialidades(client, token_admin, especialidade):
    """Testa listagem de especialidades"""
    response = client.get(
        "/admin/especialidades",
        headers={"Authorization": f"Bearer {token_admin}"}
    )
    assert response.status_code == 200
    assert len(response.json()) >= 1


def test_dashboard_admin(client, token_admin, consulta):
    """Testa endpoint de dashboard administrativo"""
    response = client.get(
        "/admin/dashboard",
        headers={"Authorization": f"Bearer {token_admin}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "total_consultas" in data
    assert "consultas_agendadas" in data
    assert "consultas_realizadas" in data


def test_visualizar_observacao_como_admin(client, token_admin, consulta, db):
    """Testa que admin pode visualizar observações"""
    from app.models import Observacao
    
    observacao = Observacao(
        consulta_id=consulta.id,
        descricao="Observação de teste"
    )
    db.add(observacao)
    db.commit()
    
    response = client.get(
        f"/admin/observacoes/{consulta.id}",
        headers={"Authorization": f"Bearer {token_admin}"}
    )
    assert response.status_code == 200
    assert response.json()["descricao"] == "Observação de teste"
