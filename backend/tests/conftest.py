"""
Configurações e fixtures para os testes
"""
import pytest
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient
from datetime import date, time, datetime

# Configurar variável de ambiente para testes ANTES de importar o app
os.environ["TESTING"] = "true"

from app.database import Base, get_db
from app.models import (
    Usuario, TipoUsuario, Paciente, Medico, Admin, Especialidade,
    Convenio, HorarioDisponivel, Consulta, StatusConsulta, Observacao, Relatorio
)
from app.utils.auth import get_password_hash

# Criar aplicação FastAPI para testes
from fastapi import FastAPI

def create_test_app():
    """Cria aplicação FastAPI para testes sem conectar ao PostgreSQL"""
    test_app = FastAPI(title="Clínica API - Tests")
    
    # Importar e incluir routers (routers já têm prefix definido)
    from app.routers import auth, pacientes, medicos, admin
    test_app.include_router(auth.router)
    test_app.include_router(pacientes.router)
    test_app.include_router(medicos.router)
    test_app.include_router(admin.router)
    
    return test_app

app = create_test_app()

# Banco de dados em memória para testes
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    """Cria um banco de dados limpo para cada teste"""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db):
    """Cliente de teste do FastAPI"""
    def override_get_db():
        try:
            yield db
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def especialidade(db):
    """Cria uma especialidade de teste"""
    esp = Especialidade(
        nome="Cardiologia",
        descricao="Especialidade em coração"
    )
    db.add(esp)
    db.commit()
    db.refresh(esp)
    return esp


@pytest.fixture
def convenio(db):
    """Cria um convênio de teste"""
    conv = Convenio(
        nome="Unimed",
        codigo="UNIMED-001"
    )
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return conv


@pytest.fixture
def usuario_paciente(db):
    """Cria um usuário paciente de teste"""
    usuario = Usuario(
        email="paciente@test.com",
        senha_hash=get_password_hash("senha123"),
        nome="Paciente Teste",
        tipo=TipoUsuario.PACIENTE
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return usuario


@pytest.fixture
def paciente(db, usuario_paciente, convenio):
    """Cria um paciente de teste"""
    pac = Paciente(
        usuario_id=usuario_paciente.id,
        cpf="123.456.789-00",
        data_nascimento=date(1990, 1, 1),
        telefone="(47) 99999-9999",
        convenio_id=convenio.id
    )
    db.add(pac)
    db.commit()
    db.refresh(pac)
    return pac


@pytest.fixture
def usuario_medico(db):
    """Cria um usuário médico de teste"""
    usuario = Usuario(
        email="medico@test.com",
        senha_hash=get_password_hash("senha123"),
        nome="Dr. Médico Teste",
        tipo=TipoUsuario.MEDICO
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return usuario


@pytest.fixture
def medico(db, usuario_medico, especialidade):
    """Cria um médico de teste"""
    med = Medico(
        usuario_id=usuario_medico.id,
        crm="12345-SC",
        especialidade_id=especialidade.id,
        telefone="(47) 88888-8888",
        tempo_consulta=30
    )
    db.add(med)
    db.commit()
    db.refresh(med)
    return med


@pytest.fixture
def usuario_admin(db):
    """Cria um usuário admin de teste"""
    usuario = Usuario(
        email="admin@test.com",
        senha_hash=get_password_hash("senha123"),
        nome="Admin Teste",
        tipo=TipoUsuario.ADMIN
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return usuario


@pytest.fixture
def admin(db, usuario_admin):
    """Cria um admin de teste"""
    adm = Admin(
        usuario_id=usuario_admin.id,
        cargo="Administrador"
    )
    db.add(adm)
    db.commit()
    db.refresh(adm)
    return adm


@pytest.fixture
def horario_disponivel(db, medico):
    """Cria horários disponíveis para todos os dias da semana"""
    horarios = []
    for dia in range(7):  # 0 (segunda) a 6 (domingo)
        horario = HorarioDisponivel(
            medico_id=medico.id,
            dia_semana=dia,
            hora_inicio=time(8, 0),
            hora_fim=time(18, 0)
        )
        db.add(horario)
        horarios.append(horario)
    db.commit()
    for h in horarios:
        db.refresh(h)
    return horarios[0]  # Retorna o primeiro para compatibilidade


@pytest.fixture
def consulta(db, paciente, medico):
    """Cria uma consulta de teste"""
    cons = Consulta(
        paciente_id=paciente.id,
        medico_id=medico.id,
        data=date(2025, 12, 1),
        hora=time(10, 0),
        status=StatusConsulta.AGENDADA,
        motivo_consulta="Consulta de rotina"
    )
    db.add(cons)
    db.commit()
    db.refresh(cons)
    return cons


@pytest.fixture
def token_paciente(client, usuario_paciente):
    """Gera token de autenticação para paciente"""
    from app.utils.auth import create_access_token
    from datetime import timedelta
    
    access_token = create_access_token(
        data={"sub": usuario_paciente.email, "tipo": usuario_paciente.tipo.value},
        expires_delta=timedelta(minutes=30)
    )
    return access_token


@pytest.fixture
def token_medico(client, usuario_medico):
    """Gera token de autenticação para médico"""
    from app.utils.auth import create_access_token
    from datetime import timedelta
    
    access_token = create_access_token(
        data={"sub": usuario_medico.email, "tipo": usuario_medico.tipo.value},
        expires_delta=timedelta(minutes=30)
    )
    return access_token


@pytest.fixture
def token_admin(client, usuario_admin):
    """Gera token de autenticação para admin"""
    from app.utils.auth import create_access_token
    from datetime import timedelta
    
    access_token = create_access_token(
        data={"sub": usuario_admin.email, "tipo": usuario_admin.tipo.value},
        expires_delta=timedelta(minutes=30)
    )
    return access_token
