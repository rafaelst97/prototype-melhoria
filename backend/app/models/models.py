from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum, Text, Date, Time, Numeric
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base

class TipoUsuario(str, enum.Enum):
    PACIENTE = "paciente"
    MEDICO = "medico"
    ADMIN = "admin"

class StatusConsulta(str, enum.Enum):
    AGENDADA = "agendada"
    CONFIRMADA = "confirmada"
    CANCELADA = "cancelada"
    REALIZADA = "realizada"

class Usuario(Base):
    __tablename__ = "usuarios"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    senha_hash = Column(String(255), nullable=False)
    nome = Column(String(255), nullable=False)
    tipo = Column(Enum(TipoUsuario), nullable=False)
    ativo = Column(Boolean, default=True)
    bloqueado = Column(Boolean, default=False)
    criado_em = Column(DateTime, default=datetime.utcnow)
    atualizado_em = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    paciente = relationship("Paciente", back_populates="usuario", uselist=False)
    medico = relationship("Medico", back_populates="usuario", uselist=False)
    admin = relationship("Admin", back_populates="usuario", uselist=False)

class Especialidade(Base):
    __tablename__ = "especialidades"
    
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), unique=True, nullable=False)
    descricao = Column(Text)
    ativo = Column(Boolean, default=True)
    
    # Relacionamentos
    medicos = relationship("Medico", back_populates="especialidade")

class Convenio(Base):
    __tablename__ = "convenios"
    
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), unique=True, nullable=False)
    cnpj = Column(String(18), unique=True)
    telefone = Column(String(20))
    email = Column(String(255))
    ativo = Column(Boolean, default=True)
    criado_em = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    pacientes = relationship("Paciente", back_populates="convenio")

class Paciente(Base):
    __tablename__ = "pacientes"
    
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), unique=True)
    cpf = Column(String(14), unique=True, nullable=False)
    data_nascimento = Column(Date, nullable=False)
    telefone = Column(String(20))
    endereco = Column(String(255))
    cidade = Column(String(100))
    estado = Column(String(2))
    cep = Column(String(10))
    convenio_id = Column(Integer, ForeignKey("convenios.id"), nullable=True)
    numero_carteirinha = Column(String(50))
    
    # Relacionamentos
    usuario = relationship("Usuario", back_populates="paciente")
    convenio = relationship("Convenio", back_populates="pacientes")
    consultas = relationship("Consulta", back_populates="paciente")

class Medico(Base):
    __tablename__ = "medicos"
    
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), unique=True)
    crm = Column(String(20), unique=True, nullable=False)
    especialidade_id = Column(Integer, ForeignKey("especialidades.id"))
    telefone = Column(String(20))
    valor_consulta = Column(Numeric(10, 2))
    tempo_consulta = Column(Integer, default=30)  # em minutos
    
    # Relacionamentos
    usuario = relationship("Usuario", back_populates="medico")
    especialidade = relationship("Especialidade", back_populates="medicos")
    horarios_disponiveis = relationship("HorarioDisponivel", back_populates="medico")
    bloqueios = relationship("BloqueioHorario", back_populates="medico")
    consultas = relationship("Consulta", back_populates="medico")

class Admin(Base):
    __tablename__ = "admins"
    
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), unique=True)
    cargo = Column(String(100))
    
    # Relacionamentos
    usuario = relationship("Usuario", back_populates="admin")

class HorarioDisponivel(Base):
    __tablename__ = "horarios_disponiveis"
    
    id = Column(Integer, primary_key=True, index=True)
    medico_id = Column(Integer, ForeignKey("medicos.id"))
    dia_semana = Column(Integer, nullable=False)  # 0=Segunda, 6=Domingo
    hora_inicio = Column(Time, nullable=False)
    hora_fim = Column(Time, nullable=False)
    ativo = Column(Boolean, default=True)
    
    # Relacionamentos
    medico = relationship("Medico", back_populates="horarios_disponiveis")

class BloqueioHorario(Base):
    __tablename__ = "bloqueios_horarios"
    
    id = Column(Integer, primary_key=True, index=True)
    medico_id = Column(Integer, ForeignKey("medicos.id"))
    data = Column(Date, nullable=False)
    hora_inicio = Column(Time, nullable=False)
    hora_fim = Column(Time, nullable=False)
    motivo = Column(Text)
    
    # Relacionamentos
    medico = relationship("Medico", back_populates="bloqueios")

class Consulta(Base):
    __tablename__ = "consultas"
    
    id = Column(Integer, primary_key=True, index=True)
    paciente_id = Column(Integer, ForeignKey("pacientes.id"))
    medico_id = Column(Integer, ForeignKey("medicos.id"))
    data = Column(Date, nullable=False)
    hora = Column(Time, nullable=False)
    status = Column(Enum(StatusConsulta), default=StatusConsulta.AGENDADA)
    observacoes = Column(Text)
    motivo_consulta = Column(Text)
    observacoes_medico = Column(Text)
    criado_em = Column(DateTime, default=datetime.utcnow)
    cancelado_em = Column(DateTime)
    motivo_cancelamento = Column(Text)
    
    # Relacionamentos
    paciente = relationship("Paciente", back_populates="consultas")
    medico = relationship("Medico", back_populates="consultas")
