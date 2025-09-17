from typing import List, Optional
from datetime import date as _date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from database import get_db
from models import (
    CarModel,
    VehicleModel,
    EngineModel,
    TransmissionModel,
    DriveAxleModel,
    SteeringAxleModel,
    Client,
    ServiceCompanyModel,
)
from schemas import SCarNotAuth, SCar
from pydantic import BaseModel, Field

router = APIRouter(prefix="/cars", tags=["cars"])

# Получение экземпляра машины для незарегистрированных пользователей
@router.get("/{vin}", response_model=SCarNotAuth)
async def get_car_by_vin(vin: str, db: AsyncSession = Depends(get_db)):
    stmt = select(CarModel).where(CarModel.vin == vin)
    result = await db.execute(stmt)
    car = result.scalar_one_or_none()

    if not car:
        raise HTTPException(status_code=404, detail="Машина с указанным VIN не найдена")

    vehicle_model = await db.get(VehicleModel, car.vehicle_model_id)
    engine_model = await db.get(EngineModel, car.engine_model_id)
    transmission_model = await db.get(TransmissionModel, car.transmission_model_id)
    drive_axle_model = await db.get(DriveAxleModel, car.drive_axle_model_id)
    steering_axle_model = await db.get(SteeringAxleModel, car.steering_axle_model_id)

    response_data = {
        "vin": car.vin or "",
        "vehicle_model": vehicle_model.name if vehicle_model else "Не указано",
        "engine_model": engine_model.name if engine_model else "Не указано",
        "engine_number": car.engine_number or "Не указан",
        "transmission_model": transmission_model.name if transmission_model else "Не указана",
        "transmission_number": car.transmission_number or "Не указан",
        "drive_axle_model": drive_axle_model.name if drive_axle_model else "Не указан",
        "drive_axle_number": car.drive_axle_number or "Не указан",
        "steering_axle_model": steering_axle_model.name if steering_axle_model else "Не указан",
        "steering_axle_number": car.steering_axle_number or "Не указан",
    }

    for field, value in response_data.items():
        if value is None:
            response_data[field] = ""

    return response_data

# Получение экземпляра машины для зарегистрированных пользователей
@router.get("", response_model=List[SCar])
async def get_all_cars(db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(
            select(CarModel)
            .options(
                selectinload(CarModel.vehicle_model),
                selectinload(CarModel.engine_model),
                selectinload(CarModel.transmission_model),
                selectinload(CarModel.drive_axle_model),
                selectinload(CarModel.steering_axle_model),
                selectinload(CarModel.client),
                selectinload(CarModel.service_company_model),
            )
        )
        cars = result.scalars().all()

        return [
            {
                "id": car.id,
                "vin": car.vin,
                "vehicle_model_id": car.vehicle_model.id if car.vehicle_model else None,
                "vehicle_model": car.vehicle_model.name if car.vehicle_model else "Не указано",
                "engine_model_id": car.engine_model.id if car.engine_model else None,
                "engine_model": car.engine_model.name if car.engine_model else "Не указано",
                "engine_number": car.engine_number or "Не указан",
                "transmission_model_id": car.transmission_model.id if car.transmission_model else None,
                "transmission_model": car.transmission_model.name if car.transmission_model else "Не указана",
                "transmission_number": car.transmission_number or "Не указан",
                "drive_axle_model_id": car.drive_axle_model.id if car.drive_axle_model else None,
                "drive_axle_model": car.drive_axle_model.name if car.drive_axle_model else "Не указан",
                "drive_axle_number": car.drive_axle_number or "Не указан",
                "steering_axle_model_id": car.steering_axle_model.id if car.steering_axle_model else None,
                "steering_axle_model": car.steering_axle_model.name if car.steering_axle_model else "Не указан",
                "steering_axle_number": car.steering_axle_number or "Не указан",
                "delivery_agreement": car.delivery_agreement or "",
                "shipment_date": car.shipment_date.isoformat() if car.shipment_date else "",
                "recipient": car.recipient or "",
                "delivery_address": car.delivery_address or "",
                "equipment": car.equipment or "",
                "client": car.client.name if car.client else "",
                "service_company": car.service_company_model.name if car.service_company_model else "",
            }
            for car in cars
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при получении списка машин: {str(e)}",
        )


# Создание новой машины
class CarCreateRequest(BaseModel):
    vin: str = Field(..., description="Заводской номер машины (VIN)")
    vehicle_model_id: Optional[int] = Field(None, description="ID модели техники")
    engine_model_id: Optional[int] = Field(None, description="ID модели двигателя")
    engine_number: Optional[str] = Field("", description="Заводской номер двигателя")
    transmission_model_id: Optional[int] = Field(None, description="ID модели трансмиссии")
    transmission_number: Optional[str] = Field("", description="Заводской номер трансмиссии")
    drive_axle_model_id: Optional[int] = Field(None, description="ID модели ведущего моста")
    drive_axle_number: Optional[str] = Field("", description="Заводской номер ведущего моста")
    steering_axle_model_id: Optional[int] = Field(None, description="ID модели управляемого моста")
    steering_axle_number: Optional[str] = Field("", description="Заводской номер управляемого моста")
    delivery_agreement: Optional[str] = Field("", description="Договор поставки, № и дата")
    shipment_date: Optional[str] = Field(None, description="Дата отгрузки с завода (ISO YYYY-MM-DD)")
    recipient: Optional[str] = Field("", description="Грузополучатель, конечный потребитель")
    delivery_address: Optional[str] = Field("", description="Адрес поставки (эксплуатации)")
    equipment: Optional[str] = Field("", description="Комплектация доп.опция")
    client_id: int = Field(..., description="ID клиента")
    service_company_id: int = Field(..., description="ID сервисной компании")


@router.post("", response_model=SCar, status_code=status.HTTP_201_CREATED)
async def create_car(payload: CarCreateRequest, db: AsyncSession = Depends(get_db)):
    # Проверка на дубликат VIN
    exists = await db.execute(select(CarModel).where(CarModel.vin == payload.vin))
    if exists.scalar_one_or_none() is not None:
        raise HTTPException(status_code=409, detail="Автомобиль с таким VIN уже существует")

    # Бизнес-валидация обязательных полей
    if payload.drive_axle_model_id is None:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Поле 'drive_axle_model_id' обязательно")
    # Проверка существования связей (минимум для обязательного поля)
    if payload.drive_axle_model_id is not None:
        drv = await db.get(DriveAxleModel, payload.drive_axle_model_id)
        if drv is None:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Указан несуществующий drive_axle_model_id")
    # client_id и service_company_id обязательны согласно модели
    client = await db.get(Client, payload.client_id)
    if client is None:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Указан несуществующий client_id")
    service_company = await db.get(ServiceCompanyModel, payload.service_company_id)
    if service_company is None:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Указан несуществующий service_company_id")

    # Преобразуем дату
    shipment_dt = None
    if payload.shipment_date:
        try:
            shipment_dt = _date.fromisoformat(payload.shipment_date)
        except Exception:
            shipment_dt = None

    car = CarModel(
        vin=payload.vin,
        vehicle_model_id=payload.vehicle_model_id,
        engine_model_id=payload.engine_model_id,
        engine_number=payload.engine_number or "",
        transmission_model_id=payload.transmission_model_id,
        transmission_number=payload.transmission_number or "",
        drive_axle_model_id=payload.drive_axle_model_id,
        drive_axle_number=payload.drive_axle_number or "",
        steering_axle_model_id=payload.steering_axle_model_id,
        steering_axle_number=payload.steering_axle_number or "",
        delivery_agreement=payload.delivery_agreement or "",
        shipment_date=shipment_dt,
        recipient=payload.recipient or "",
        delivery_address=payload.delivery_address or "",
        equipment=payload.equipment or "",
        client_id=payload.client_id,
        service_company_id=payload.service_company_id,
    )
    db.add(car)
    await db.commit()
    await db.refresh(car)

    vehicle_model = await db.get(VehicleModel, car.vehicle_model_id) if car.vehicle_model_id else None
    engine_model = await db.get(EngineModel, car.engine_model_id) if car.engine_model_id else None
    transmission_model = await db.get(TransmissionModel, car.transmission_model_id) if car.transmission_model_id else None
    drive_axle_model = await db.get(DriveAxleModel, car.drive_axle_model_id) if car.drive_axle_model_id else None
    steering_axle_model = await db.get(SteeringAxleModel, car.steering_axle_model_id) if car.steering_axle_model_id else None

    return {
        "vin": car.vin,
        "vehicle_model_id": car.vehicle_model_id,
        "vehicle_model": vehicle_model.name if vehicle_model else "Не указано",
        "engine_model_id": car.engine_model_id,
        "engine_model": engine_model.name if engine_model else "Не указано",
        "engine_number": car.engine_number or "Не указан",
        "transmission_model_id": car.transmission_model_id,
        "transmission_model": transmission_model.name if transmission_model else "Не указана",
        "transmission_number": car.transmission_number or "Не указан",
        "drive_axle_model_id": car.drive_axle_model_id,
        "drive_axle_model": drive_axle_model.name if drive_axle_model else "Не указан",
        "drive_axle_number": car.drive_axle_number or "Не указан",
        "steering_axle_model_id": car.steering_axle_model_id,
        "steering_axle_model": steering_axle_model.name if steering_axle_model else "Не указан",
        "steering_axle_number": car.steering_axle_number or "Не указан",
        "delivery_agreement": car.delivery_agreement or "",
        "shipment_date": car.shipment_date.isoformat() if car.shipment_date else "",
        "recipient": car.recipient or "",
        "delivery_address": car.delivery_address or "",
        "equipment": car.equipment or "",
        "client": client.name if client else "",
        "service_company": service_company.name if service_company else "",
    }
