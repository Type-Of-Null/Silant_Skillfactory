from sqlalchemy import Column, Integer, String, Date, ForeignKey, MetaData, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


# Модель "Клиент"
class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True)
    username = Column(String(255), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)

    cars = relationship("CarModel", back_populates="client")


# Модели "Справочник"
class VehicleModel(Base):
    __tablename__ = "vehicle_model"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), unique=True, nullable=False)
    description = Column(String, nullable=True)

    cars = relationship("CarModel", back_populates="vehicle")


class EngineModel(Base):
    __tablename__ = "engine_model"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), unique=True, nullable=False)
    description = Column(String, nullable=True)

    cars = relationship("CarModel", back_populates="engine")


class TransmissonModel(Base):
    __tablename__ = "transmission_model"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), unique=True, nullable=False)
    description = Column(String, nullable=True)

    cars = relationship("CarModel", back_populates="transmission")


class DriveAxleModel(Base):
    __tablename__ = "drive_axle_model"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), unique=True, nullable=False)
    description = Column(String, nullable=True)

    cars = relationship("CarModel", back_populates="drive_axle")


class SteeringAxleModel(Base):
    __tablename__ = "steering_axle_model"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), unique=True, nullable=False)
    description = Column(String, nullable=True)

    cars = relationship("CarModel", back_populates="steering_axle")


class TechMaintenanceModel(Base):
    __tablename__ = "tech_maintenance_model"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), unique=True, nullable=False)
    description = Column(String, nullable=True)

    maintenance_extend = relationship("TechMaintenanceExtendModel", back_populates="maintenance")


class RecoveryMethodModel(Base):
    __tablename__ = "recovery_method_model"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), unique=True, nullable=False)
    description = Column(String, nullable=True)

    complaint = relationship("ComplaintModel", back_populates="recovery_method")


class FailureNodeModel(Base):
    __tablename__ = "failure_node_model"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), unique=True, nullable=False)
    description = Column(String, nullable=True)

    complaint = relationship("ComplaintModel", back_populates="node_failure")


class ServiceCompanyModel(Base):
    __tablename__ = "service_company_model"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), unique=True, nullable=False)
    description = Column(String, nullable=True)

    maintenance_extend = relationship("TechMaintenanceExtendModel", back_populates="service_company")
    cars = relationship("CarModel", back_populates="service_company")


# Модель "Машина"
class CarModel(Base):
    __tablename__ = "car_model"

    id = Column(Integer, primary_key=True)
    vin = Column(String(17), unique=True, nullable=False)
    vehicle_model_id = Column(Integer, ForeignKey("vehicle_model.id"), nullable=False)
    engine_model_id = Column(Integer, ForeignKey("engine_model.id"), nullable=False)
    engine_number = Column(String(255), nullable=False)
    transmission_model_id = Column(Integer, ForeignKey("transmission_model.id"), nullable=False)
    transmission_number = Column(String(255), nullable=False)
    drive_axle_model_id = Column(Integer, ForeignKey("drive_axle_model.id"), nullable=False)
    drive_axle_number = Column(String(255), nullable=False)
    steering_axle_model_id = Column(Integer, ForeignKey("steering_axle_model.id"), nullable=False)
    steering_axle_number = Column(String(255), nullable=False)
    delivery_agreement = Column(String(255))
    shipment_date = Column(Date, nullable=False)
    recipient = Column(String(255))
    delivery_address = Column(String(25))
    equipment = Column(String(255))
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    service_company_id = Column(Integer, ForeignKey("service_company_model.id"), nullable=False)

    vehicle = relationship("VehicleModel", back_populates="cars")
    engine = relationship("EngineModel", back_populates="cars")
    transmission = relationship("TransmissionModel", back_populates="cars")
    drive_axle = relationship("DriveAxleModel", back_populates="cars")
    steering_axle = relationship("SteeringAxleModel", back_populates="cars")
    client = relationship("Client", back_populates="cars")
    maintenance_extend = relationship("TechMaintenanceModel",
                                      back_populates="cars")
    complaint = relationship("ComplaintModel", back_populates="cars")
    service_company = relationship("ServiceCompanyModel", back_populates="cars")

    # Проверка длины vin кода на уровне БД
    __table_args__ = (
        CheckConstraint('LENGTH(vin) = 17', name='check_vin_length'),
    )


class TechMaintenanceExtendModel(Base):
    __tablename__ = "tech_maintenance_extend_model"

    id = Column(Integer, ForeignKey("car_model.id"), primary_key=True, nullable=False)
    maintenance_type_id = Column(Integer, ForeignKey("tech_maintenance_model.id"), nullable=False)
    maintenance_date = Column(Date, nullable=False)
    order_number = Column(String(10))
    order_date = Column(Date, nullable=False)
    service_company_id = Column(Integer, ForeignKey("service_company_model.id"), nullable=False)

    cars = relationship("CarModel", back_populates="maintenance_extend")
    maintenance = relationship("TechMaintenanceModel", back_populates="maintenance_extend")
    service_company = relationship("ServiceCompanyModel", back_populates="maintenance_extend")


class ComplaintModel(Base):
    __tablename__ = "complaint_model"

    id = Column(Integer, ForeignKey("car_model.id"), primary_key=True, nullable=False)
    date_of_failure = Column(String(255), nullable=False)
    operating_time = Column(Date, nullable=False)
    node_failure_id = Column(Integer, ForeignKey("failure_node_model.id"), nullable=False)
    description_failure = Column(String(255))
    recovery_method_id = Column(Integer, ForeignKey("recovery_method_model.id"), nullable=False)
    used_spare_parts = Column(String(255))
    date_recovery = Column(String(255))
    equipment_downtime = Column(String(255))
    service_company = Column(String(255))
    vehicle_model = Column(String(255))


    cars = relationship("CarModel", back_populates="complaint")
    node_failure = relationship("FailureNodeModel", back_populates="complaint")
    recovery_method = relationship("RecoveryMethodModel", back_populates="complaint")
