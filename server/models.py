from sqlalchemy import Column, Integer, String, Date, ForeignKey, MetaData
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


# Создание моделей справочников
class VehicleModel(Base):
    __tablename__ = "vehicle_model"

    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String, nullable=True)


class EngineModel(Base):
    __tablename__ = "engine_model"

    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String, nullable=True)


class TransmissonModel(Base):
    __tablename__ = "transmission_model"

    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String, nullable=True)


class DriveAxleModel(Base):
    __tablename__ = "drive_axle_model"

    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String, nullable=True)


class SteeringAxleModel(Base):
    __tablename__ = "steering_axle_model"

    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String, nullable=True)


class TechMaintenanceTypeModel(Base):
    __tablename__ = "tech_maintenance_type_model"

    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String, nullable=True)


class RecoveryMethodModel(Base):
    __tablename__ = "recovery_method_model"

    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String, nullable=True)


class FailureNodeModel(Base):
    __tablename__ = "failure_node_model"

    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String, nullable=True)


class ServiceCompanyModel(Base):
    __tablename__ = "service_company_model"

    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String, nullable=True)

#Создание модели машины