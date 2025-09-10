from pydantic import BaseModel, Field
from datetime import date


class SNameDescription(BaseModel):
    id: int = Field(..., description="Идентификатор записи")
    name: str = Field(..., description="Название")
    description: str | None = Field(None, description="Описание")

    class Config:
        from_attributes = True


class SCar(BaseModel):
    vin: str = Field(..., description="Заводской номер машины (VIN)")
    vehicle_model: str = Field(..., description="Модель техники (наименование)")
    engine_model: str = Field(..., description="Модель двигателя (наименование)")
    engine_number: str = Field(..., description="Заводской номер двигателя")
    transmission_model: str = Field(..., description="Модель трансмиссии (наименование)")
    transmission_number: str = Field(..., description="Заводской номер трансмиссии")
    drive_axle: str = Field(..., description="Модель ведущего моста (наименование)")
    drive_axle_number: str = Field(..., description="Заводской номер ведущего моста")
    steering_axle: str = Field(..., description="Модель управляемого моста (наименование)")
    steering_axle_number: str = Field(..., description="Заводской номер управляемого моста")
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
    transmission_model: str = Field(..., description="Модель трансмиссии (наименование)")
    transmission_number: str = Field(..., description="Заводской номер трансмиссии")
    drive_axle: str = Field(..., description="Модель ведущего моста (наименование)")
    drive_axle_number: str = Field(..., description="Заводской номер ведущего моста")
    steering_axle: str = Field(..., description="Модель управляемого моста (наименование)")
    steering_axle_number: str = Field(..., description="Заводской номер управляемого моста")


class STechMaintenance(BaseModel):
    car_id: int = Field(..., description="ID машины")
    service_company_id: int = Field(..., description="ID сервисной компании")
    maintenance_type_id: int = Field(..., description="ID вида ТО")
    maintenance_date: date = Field(..., description="Дата проведения ТО")
    operating_time: int = Field(..., description="Наработка мото/часов")
    order: str = Field(..., description="Номер заказа-наряда")
    order_date: date = Field(..., description="Дата заказа-наряда")
