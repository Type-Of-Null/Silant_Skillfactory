
from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import text
from database import get_db, engine
from models import (
    CarModel,
    VehicleModel,
    EngineModel,
    TransmissionModel,
    DriveAxleModel,
    SteeringAxleModel,
    TechMaintenanceExtendModel,
    TechMaintenanceModel,
    ServiceCompanyModel,
    User,
)
from schemas import SCarNotAuth, SCar
from typing import Optional, Dict, Any, List
from pydantic import BaseModel

router = APIRouter(prefix="/api", tags=["API"])

class ModelResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True


# Login DTOs
class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    id: int
    username: str
    role: str
    name: Optional[str] = None

    class Config:
        from_attributes = True

# Аутентификация
@router.post("/login", response_model=LoginResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.username == payload.username))
    user = result.scalar_one_or_none()
    if not user or user.password != payload.password:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Неверное имя пользователя или пароль")

    # Try to get user's name if exists in related Client table; fallback None
    name = None
    if hasattr(user, 'client') and user.client:
        # In current models, User may not have relationship; safeguard
        try:
            name = user.client.name
        except Exception:
            name = None

    return LoginResponse(
        id=user.id,
        username=user.username,
        role=str(user.role),
        name=name,
    )

# Эндпоинты для моделей
async def get_model_by_id(db: AsyncSession, model_class: type, model_id: int) -> Optional[Dict[str, Any]]:
    result = await db.execute(select(model_class).where(model_class.id == model_id))
    model = result.scalar_one_or_none()
    if not model:
        return None
    return {
        "id": model.id,
        "name": model.name,
        "description": model.description
    }

@router.get("/models/vehicle/{model_id}", response_model=ModelResponse)
async def get_vehicle_model(model_id: int, db: AsyncSession = Depends(get_db)):
    model = await get_model_by_id(db, VehicleModel, model_id)
    if not model:
        raise HTTPException(status_code=404, detail="Vehicle model not found")
    return model

@router.get("/models/engine/{model_id}", response_model=ModelResponse)
async def get_engine_model(model_id: int, db: AsyncSession = Depends(get_db)):
    model = await get_model_by_id(db, EngineModel, model_id)
    if not model:
        raise HTTPException(status_code=404, detail="Engine model not found")
    return model

@router.get("/models/transmission/{model_id}", response_model=ModelResponse)
async def get_transmission_model(model_id: int, db: AsyncSession = Depends(get_db)):
    model = await get_model_by_id(db, TransmissionModel, model_id)
    if not model:
        raise HTTPException(status_code=404, detail="Transmission model not found")
    return model

@router.get("/models/drive-axle/{model_id}", response_model=ModelResponse)
async def get_drive_axle_model(model_id: int, db: AsyncSession = Depends(get_db)):
    model = await get_model_by_id(db, DriveAxleModel, model_id)
    if not model:
        raise HTTPException(status_code=404, detail="Drive axle model not found")
    return model

@router.get("/models/steering-axle/{model_id}", response_model=ModelResponse)
async def get_steering_axle_model(model_id: int, db: AsyncSession = Depends(get_db)):
    model = await get_model_by_id(db, SteeringAxleModel, model_id)
    if not model:
        raise HTTPException(status_code=404, detail="Steering axle model not found")
    return model

# Эндпоинты для машин
@router.get("/cars/{vin}", response_model=SCarNotAuth)
async def get_car_by_vin(vin: str, db: AsyncSession = Depends(get_db)):
    # Получаем машину по VIN
    stmt = select(CarModel).where(CarModel.vin == vin)
    result = await db.execute(stmt)
    car = result.scalar_one_or_none()

    if not car:
        raise HTTPException(status_code=404, detail="Машина с указанным VIN не найдена")

    # Получаем связанные данные
    vehicle_model = await db.get(VehicleModel, car.vehicle_model_id)
    engine_model = await db.get(EngineModel, car.engine_model_id)
    transmission_model = await db.get(TransmissionModel, car.transmission_model_id)
    drive_axle_model = await db.get(DriveAxleModel, car.drive_axle_model_id)
    steering_axle_model = await db.get(SteeringAxleModel, car.steering_axle_model_id)

    # Формируем ответ согласно схеме SCarNotAuth
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
        "steering_axle_number": car.steering_axle_number or "Не указан"
    }
    
    # Проверяем, что все обязательные поля заполнены
    for field, value in response_data.items():
        if value is None:
            response_data[field] = ""
            
    return response_data

@router.get("/cars", response_model=List[SCar])
async def get_all_cars(db: AsyncSession = Depends(get_db)):
    """
    Получить список всех машин с полной информацией
    """
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
                selectinload(CarModel.service_company_model)
            )
        )
        cars = result.scalars().all()
        
        return [
            {
                "vin": car.vin,
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
                "service_company": car.service_company_model.name if car.service_company_model else ""
            }
            for car in cars
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при получении списка машин: {str(e)}"
        )

# Эндпоинт для получения списка таблиц
@router.get("/tables")
async def get_tables():
    async with engine.connect() as conn:
        result = await conn.execute(
            text("SELECT name FROM sqlite_master WHERE type='table';")
        )
        tables = result.fetchall()
        return {"tables": [table[0] for table in tables]}

class MaintenanceResponse(BaseModel):
    id: int
    vin: str
    maintenance_type: str
    maintenance_date: Optional[str]
    order_number: Optional[str]
    order_date: Optional[str]
    service_company: str

@router.get("/maintenance", response_model=List[MaintenanceResponse])
async def get_maintenance(db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(
            select(TechMaintenanceExtendModel)
            .options(
                selectinload(TechMaintenanceExtendModel.car),
                selectinload(TechMaintenanceExtendModel.maintenance),
                selectinload(TechMaintenanceExtendModel.service_company),
            )
        )
        items = result.scalars().all()

        data: List[dict] = []
        for m in items:
            data.append(
                {
                    "id": m.id,
                    "vin": m.car.vin if m.car else "",
                    "maintenance_type": m.maintenance.name if m.maintenance else "",
                    "maintenance_date": m.maintenance_date.isoformat() if getattr(m, "maintenance_date", None) else None,
                    "order_number": getattr(m, "order_number", None),
                    "order_date": m.order_date.isoformat() if getattr(m, "order_date", None) else None,
                    "service_company": m.service_company.name if m.service_company else "",
                }
            )

        return data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при получении списка ТО: {str(e)}",
        )