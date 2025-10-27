"""
Testes para os endpoints de pacientes
"""
import pytest
from datetime import date, time, datetime, timedelta
from app.models import StatusConsulta


def test_criar_paciente(client, convenio):
    """Testa criação de novo paciente"""
    dados = {
        "nome": "João Silva",
        "cpf": "12345678900",
        "email": "joao@email.com",
        "telefone": "47999999999",
        "data_nascimento": "1990-01-01",
        "senha": "senha123",
        "convenio_id": convenio.id,
        "numero_carteirinha": "123456"
    }
    
    response = client.post("/pacientes/cadastro", json=dados)
    assert response.status_code == 201
    assert response.json()["usuario"]["nome"] == "João Silva"
    assert response.json()["cpf"] == "12345678900"


def test_criar_paciente_cpf_duplicado(client, paciente, convenio):
    """Testa criação de paciente com CPF duplicado"""
    dados = {
        "nome": "Maria Silva",
        "cpf": paciente.cpf,  # CPF já existe
        "email": "maria@email.com",
        "telefone": "47999999999",
        "data_nascimento": "1990-01-01",
        "senha": "senha123",
        "convenio_id": convenio.id,
        "numero_carteirinha": "789012"
    }
    
    response = client.post("/pacientes/cadastro", json=dados)
    assert response.status_code == 409  # Conflict - CPF duplicado


def test_agendar_consulta(client, token_paciente, paciente, medico, horario_disponivel):
    """Testa agendamento de consulta válido"""
    data_futura = (date.today() + timedelta(days=5)).isoformat()
    
    dados = {
        "medico_id": medico.id,
        "data": data_futura,
        "hora": "10:00"
    }
    
    response = client.post(
        "/pacientes/consultas",
        json=dados,
        headers={"Authorization": f"Bearer {token_paciente}"}
    )
    assert response.status_code == 201
    assert response.json()["status"] == "agendada"


def test_agendar_consulta_paciente_bloqueado(client, token_paciente, paciente, medico, usuario_paciente):
    """Testa agendamento quando paciente está bloqueado"""
    usuario_paciente.bloqueado = True
    
    data_futura = (date.today() + timedelta(days=5)).isoformat()
    dados = {
        "medico_id": medico.id,
        "data": data_futura,
        "hora": "10:00"
    }
    
    response = client.post(
        "/pacientes/consultas",
        json=dados,
        headers={"Authorization": f"Bearer {token_paciente}"}
    )
    assert response.status_code == 403
    assert "bloqueado" in response.json()["detail"].lower()


def test_agendar_consulta_limite_excedido(client, token_paciente, paciente, medico, db):
    """Testa agendamento quando limite de 2 consultas foi atingido"""
    from app.models import Consulta
    
    # Criar 2 consultas futuras
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
    
    # Tentar agendar a terceira
    data_futura = (date.today() + timedelta(days=10)).isoformat()
    dados = {
        "medico_id": medico.id,
        "data": data_futura,
        "hora": "14:00"
    }
    
    response = client.post(
        "/pacientes/consultas",
        json=dados,
        headers={"Authorization": f"Bearer {token_paciente}"}
    )
    assert response.status_code == 400
    assert "2 consultas" in response.json()["detail"].lower()


def test_listar_consultas_paciente(client, token_paciente, consulta):
    """Testa listagem de consultas do paciente"""
    response = client.get(
        "/pacientes/consultas",
        headers={"Authorization": f"Bearer {token_paciente}"}
    )
    assert response.status_code == 200
    assert len(response.json()) >= 1


def test_cancelar_consulta_com_antecedencia(client, token_paciente, paciente, medico, db):
    """Testa cancelamento com mais de 24h de antecedência"""
    from app.models import Consulta
    
    # Criar consulta para daqui a 10 dias
    consulta = Consulta(
        paciente_id=paciente.id,
        medico_id=medico.id,
        data=date.today() + timedelta(days=10),
        hora=time(10, 0),
        status=StatusConsulta.AGENDADA
    )
    db.add(consulta)
    db.commit()
    db.refresh(consulta)
    
    response = client.delete(
        f"/pacientes/consultas/{consulta.id}",
        headers={"Authorization": f"Bearer {token_paciente}"}
    )
    assert response.status_code == 200
    assert "cancelada" in response.json()["message"].lower()


def test_cancelar_consulta_sem_antecedencia(client, token_paciente, paciente, medico, db):
    """Testa cancelamento com menos de 24h de antecedência"""
    from app.models import Consulta
    
    # Criar consulta para hoje (menos de 24h)
    agora = datetime.now()
    consulta = Consulta(
        paciente_id=paciente.id,
        medico_id=medico.id,
        data=agora.date(),
        hora=(agora + timedelta(hours=12)).time(),
        status=StatusConsulta.AGENDADA
    )
    db.add(consulta)
    db.commit()
    db.refresh(consulta)
    
    response = client.delete(
        f"/pacientes/consultas/{consulta.id}",
        headers={"Authorization": f"Bearer {token_paciente}"}
    )
    assert response.status_code == 400
    assert "24" in response.json()["detail"]


def test_cancelar_consulta_outro_paciente(client, token_paciente, medico, db):
    """Testa tentativa de cancelar consulta de outro paciente"""
    from app.models import Consulta, Paciente, Usuario, TipoUsuario
    from app.utils.auth import get_password_hash
    
    # Criar outro paciente
    outro_usuario = Usuario(
        nome="Outro Paciente",
        email="outro@email.com",
        senha_hash=get_password_hash("senha123"),
        tipo=TipoUsuario.PACIENTE
    )
    db.add(outro_usuario)
    db.commit()
    db.refresh(outro_usuario)
    
    outro_paciente = Paciente(
        usuario_id=outro_usuario.id,
        cpf="99999999999",
        data_nascimento=date(1990, 1, 1)
    )
    db.add(outro_paciente)
    db.commit()
    db.refresh(outro_paciente)
    
    # Criar consulta do outro paciente
    consulta = Consulta(
        paciente_id=outro_paciente.id,
        medico_id=medico.id,
        data=date.today() + timedelta(days=10),
        hora=time(10, 0),
        status=StatusConsulta.AGENDADA
    )
    db.add(consulta)
    db.commit()
    db.refresh(consulta)
    
    # Tentar cancelar com token do primeiro paciente
    response = client.delete(
        f"/pacientes/consultas/{consulta.id}",
        headers={"Authorization": f"Bearer {token_paciente}"}
    )
    assert response.status_code == 404  # Não encontrada porque pertence a outro paciente


def test_atualizar_perfil_paciente(client, token_paciente, paciente):
    """Testa atualização de perfil do paciente"""
    dados = {
        "telefone": "47988888888"
    }
    
    response = client.put(
        "/pacientes/perfil",
        json=dados,
        headers={"Authorization": f"Bearer {token_paciente}"}
    )
    assert response.status_code == 200
    assert response.json()["telefone"] == "47988888888"


def test_buscar_medicos_por_especialidade(client, medico, especialidade):
    """Testa busca de médicos por especialidade"""
    response = client.get(f"/pacientes/medicos?especialidade_id={especialidade.id}")
    assert response.status_code == 200
    assert len(response.json()) >= 1
    assert response.json()[0]["especialidade_id"] == especialidade.id


def test_visualizar_horarios_disponiveis(client, horario_disponivel, medico):
    """Testa visualização de horários disponíveis do médico"""
    response = client.get(f"/pacientes/medicos/{medico.id}/horarios")
    assert response.status_code == 200
    assert "horarios" in response.json()
    assert len(response.json()["horarios"]) >= 1
