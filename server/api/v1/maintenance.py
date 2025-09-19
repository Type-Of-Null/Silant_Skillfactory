from typing import List, Optional
from datetime import date as _date

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from database import get_db
from models import (
    TechMaintenanceExtendModel,
    CarModel,
    TechMaintenanceModel,
    ServiceCompanyModel,
)

router = APIRouter(prefix="/maintenance", tags=["maintenance"])


class MaintenanceResponse(BaseModel):
    id: int
    vin: str
    car_id: int
    maintenance_type: str
    maintenance_type_id: int
    maintenance_date: Optional[str]
    order_number: Optional[str]
    order_date: Optional[str]
    service_company: str
    service_company_id: int


@router.get("", response_model=List[MaintenanceResponse])
async def get_maintenance(db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(
            select(TechMaintenanceExtendModel).options(
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
                    "car_id": m.car_id,
                    "vin": m.car.vin if m.car else "",
                    "maintenance_type_id": m.maintenance.id if m.maintenance else None,
                    "maintenance_type": m.maintenance.name if m.maintenance else "",
                    "maintenance_date": m.maintenance_date.isoformat()
                    if getattr(m, "maintenance_date", None)
                    else None,
                    "order_number": getattr(m, "order_number", None),
                    "order_date": m.order_date.isoformat()
                    if getattr(m, "order_date", None)
                    else None,
                    "service_company": m.service_company.name
                    if m.service_company
                    else "",
                    "service_company_id": m.service_company.id if m.service_company else None,
                }
            )

        return data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при получении списка ТО: {str(e)}",
        )


class MaintenanceCreateRequest(BaseModel):
    car_id: int = Field(..., description="ID машины")
    maintenance_type_id: int = Field(..., description="ID типа ТО")
    maintenance_date: str = Field(..., description="Дата проведения ТО (YYYY-MM-DD)")
    order_number: Optional[str] = Field("", description="Номер заказ-наряда")
    order_date: str = Field(..., description="Дата заказ-наряда (YYYY-MM-DD)")
    service_company_id: int = Field(..., description="ID сервисной компании")


@router.post(
    "", response_model=MaintenanceResponse, status_code=status.HTTP_201_CREATED
)
async def create_maintenance(
    payload: MaintenanceCreateRequest, db: AsyncSession = Depends(get_db)
):
    # Проверка существования связанных объектов
    car = await db.get(CarModel, payload.car_id)
    if car is None:
        raise HTTPException(status_code=422, detail="Указан несуществующий car_id")

    maintenance_type = await db.get(TechMaintenanceModel, payload.maintenance_type_id)
    if maintenance_type is None:
        raise HTTPException(
            status_code=422, detail="Указан несуществующий maintenance_type_id"
        )

    service_company = await db.get(ServiceCompanyModel, payload.service_company_id)
    if service_company is None:
        raise HTTPException(
            status_code=422, detail="Указан несуществующий service_company_id"
        )

    # Преобразование дат
    maintenance_dt = None
    if payload.maintenance_date:
        try:
            maintenance_dt = _date.fromisoformat(payload.maintenance_date)
        except Exception:
            raise HTTPException(
                status_code=422, detail="Неверный формат maintenance_date"
            )

    order_dt = None
    if payload.order_date:
        try:
            order_dt = _date.fromisoformat(payload.order_date)
        except Exception:
            raise HTTPException(status_code=422, detail="Неверный формат order_date")

    # Создание записи ТО
    maintenance = TechMaintenanceExtendModel(
        car_id=payload.car_id,
        maintenance_type_id=payload.maintenance_type_id,
        maintenance_date=maintenance_dt,
        order_number=payload.order_number or "",
        order_date=order_dt,
        service_company_id=payload.service_company_id,
    )
    db.add(maintenance)
    await db.commit()
    await db.refresh(maintenance)

    return {
        "id": maintenance.id,
        "vin": car.vin,
        "car_id": car.id,
        "maintenance_type_id": maintenance_type.id,
        "maintenance_type": maintenance_type.name,
        "maintenance_date": maintenance_dt.isoformat() if maintenance_dt else "",
        "order_number": maintenance.order_number or "",
        "order_date": order_dt.isoformat() if order_dt else "",
        "service_company": service_company.name,
        "service_company_id": service_company.id,
    }
