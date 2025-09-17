from pydantic import BaseModel, Field
from datetime import date


# Схемы логирования
class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    id: int
    username: str
    role: str
    name: str | None = None

    class Config:
        from_attributes = True


class SCar(BaseModel):
    id: int = Field(..., description="ID машины")
    vin: str = Field(..., description="Заводской номер машины (VIN)")
    vehicle_model_id: int | None = Field(None, description="ID модели техники")
    vehicle_model: str = Field(..., description="Модель техники (наименование)")
    engine_model_id: int | None = Field(None, description="ID модели двигателя")
    engine_model: str = Field(..., description="Модель двигателя (наименование)")
    engine_number: str = Field(..., description="Заводской номер двигателя")
    transmission_model_id: int | None = Field(None, description="ID модели трансмиссии")
    transmission_model: str = Field(
        ..., description="Модель трансмиссии (наименование)"
    )
    transmission_number: str = Field(..., description="Заводской номер трансмиссии")
    drive_axle_model_id: int | None = Field(
        None, description="ID модели ведущего моста"
    )
    drive_axle_model: str = Field(
        ..., description="Модель ведущего моста (наименование)"
    )
    drive_axle_number: str = Field(..., description="Заводской номер ведущего моста")
    steering_axle_model_id: int | None = Field(
        None, description="ID модели управляемого моста"
    )
    steering_axle_model: str = Field(
        ..., description="Модель управляемого моста (наименование)"
    )
    steering_axle_number: str = Field(
        ..., description="Заводской номер управляемого моста"
    )
    delivery_agreement: str = Field(..., description="Договор поставки, № и дата")
    shipment_date: date | None = Field(None, description="Дата отгрузки с завода")
    recipient: str = Field(..., description="Грузополучатель, конечный потребитель")
    delivery_address: str = Field(..., description="Адрес поставки (эксплуатации)")
    equipment: str = Field(..., description="Комплектация доп.опция")
    client: str = Field(..., description="Клиент")
    service_company: str = Field(..., description="Сервисная компания (наименование)")

    class Config:
        from_attributes = True


class SCarNotAuth(BaseModel):
    vin: str = Field(..., description="Заводской номер машины (VIN)")
    vehicle_model: str = Field(..., description="Модель техники (наименование)")
    engine_model: str = Field(..., description="Модель двигателя (наименование)")
    engine_number: str = Field(..., description="Заводской номер двигателя")
    transmission_model: str = Field(
        ..., description="Модель трансмиссии (наименование)"
    )
    transmission_number: str = Field(..., description="Заводской номер трансмиссии")
    drive_axle_model: str = Field(
        ..., description="Модель ведущего моста (наименование)"
    )
    drive_axle_number: str = Field(..., description="Заводской номер ведущего моста")
    steering_axle_model: str = Field(
        ..., description="Модель управляемого моста (наименование)"
    )
    steering_axle_number: str = Field(
        ..., description="Заводской номер управляемого моста"
    )


class STechMaintenance(BaseModel):
    id: int = Field(..., description="ID машины")
    service_company: int = Field(..., description="ID сервисной компании")
    maintenance_type: int = Field(..., description="ID вида ТО")
    maintenance_date: date = Field(..., description="Дата проведения ТО")
    operating_time: int = Field(..., description="Наработка мото/часов")
    order: str = Field(..., description="Номер заказа-наряда")
    order_date: date = Field(..., description="Дата заказа-наряда")


