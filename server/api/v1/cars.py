from typing import List

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
)
from schemas import SCarNotAuth, SCar

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
        "drive_axle": drive_axle_model.name if drive_axle_model else "Не указан",
        "drive_axle_number": car.drive_axle_number or "Не указан",
        "steering_axle": steering_axle_model.name if steering_axle_model else "Не указан",
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
                "vin": car.vin,
                "vehicle_model_id": car.vehicle_model.id if car.vehicle_model else None,
                "vehicle_model": car.vehicle_model.name if car.vehicle_model else "Не указано",
                "engine_model": car.engine_model.name if car.engine_model else "Не указано",
                "engine_number": car.engine_number or "Не указан",
                "transmission_model": car.transmission_model.name if car.transmission_model else "Не указана",
                "transmission_number": car.transmission_number or "Не указан",
                "drive_axle": car.drive_axle_model.name if car.drive_axle_model else "Не указан",
                "drive_axle_number": car.drive_axle_number or "Не указан",
                "steering_axle": car.steering_axle_model.name if car.steering_axle_model else "Не указан",
                "steering_axle_number": car.steering_axle_number or "Не указан",
                "delivery_agreement": car.delivery_agreement or "",
                "shipment_date": car.shipment_date,
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
