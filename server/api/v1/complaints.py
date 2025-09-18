from typing import List, Optional
# Removed unused import

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from database import get_db
from models import (
    ComplaintModel,
    CarModel,
    FailureNodeModel,
    RecoveryMethodModel,
    ServiceCompanyModel,
)

router = APIRouter(prefix="/complaints", tags=["complaints"])


class ComplaintResponse(BaseModel):
    id: int
    car_id: int
    vin: str
    date_of_failure: str
    operating_time: str
    node_failure: str
    node_failure_id: int
    description_failure: Optional[str]
    recovery_method: str
    recovery_method_id: int
    used_spare_parts: Optional[str]
    date_recovery: Optional[str]
    equipment_downtime: Optional[str]
    service_company: str
    service_company_id: int
    vehicle_model: str

    class Config:
        from_attributes = True


@router.get("", response_model=List[ComplaintResponse])
async def get_complaints(db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(
            select(ComplaintModel).options(
                selectinload(ComplaintModel.car).selectinload(CarModel.vehicle_model),
                selectinload(ComplaintModel.node_failure),
                selectinload(ComplaintModel.recovery_method),
                selectinload(ComplaintModel.service_company),
            )
        )
        complaints = result.scalars().all()

        response_data = []
        for complaint in complaints:
            response_data.append(
                {
                    "id": complaint.id,
                    "car_id": complaint.car_id,
                    "vin": complaint.car.vin if complaint.car else "",
                    "date_of_failure": complaint.date_of_failure,
                    "operating_time": complaint.operating_time.isoformat()
                    if hasattr(complaint.operating_time, "isoformat")
                    else str(complaint.operating_time or ""),
                    "node_failure_id": complaint.node_failure_id,
                    "node_failure": complaint.node_failure.name
                    if complaint.node_failure
                    else "",
                    "description_failure": complaint.description_failure,
                    "recovery_method_id": complaint.recovery_method_id,
                    "recovery_method": complaint.recovery_method.name
                    if complaint.recovery_method
                    else "",
                    "used_spare_parts": complaint.used_spare_parts,
                    "date_recovery": complaint.date_recovery,
                    "equipment_downtime": complaint.equipment_downtime,
                    "service_company_id": complaint.service_company_id,
                    "service_company": complaint.service_company.name
                    if complaint.service_company
                    else "",
                    "vehicle_model": complaint.car.vehicle_model.name
                    if complaint.car and complaint.car.vehicle_model
                    else "",
                }
            )

        return response_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при получении списка рекламаций: {str(e)}",
        )


class ComplaintCreateRequest(BaseModel):
    car_id: int = Field(..., description="ID машины")
    date_of_failure: str = Field(..., description="Дата отказа (YYYY-MM-DD)")
    operating_time: str = Field(..., description="Наработка, м/час")
    node_failure_id: int = Field(..., description="ID узла отказа")
    description_failure: Optional[str] = Field("", description="Описание отказа")
    recovery_method_id: int = Field(..., description="ID способа восстановления")
    used_spare_parts: Optional[str] = Field(
        "", description="Используемые запасные части"
    )
    date_recovery: Optional[str] = Field(
        None, description="Дата восстановления (YYYY-MM-DD)"
    )
    equipment_downtime: Optional[str] = Field("", description="Время простоя техники")
    service_company_id: int = Field(..., description="ID сервисной компании")


@router.post("", response_model=ComplaintResponse, status_code=status.HTTP_201_CREATED)
async def create_complaint(
    payload: ComplaintCreateRequest, db: AsyncSession = Depends(get_db)
):
    # Проверка существования связанных объектов
    car = await db.get(CarModel, payload.car_id)
    if car is None:
        raise HTTPException(status_code=422, detail="Указан несуществующий car_id")

    node_failure = await db.get(FailureNodeModel, payload.node_failure_id)
    if node_failure is None:
        raise HTTPException(
            status_code=422, detail="Указан несуществующий node_failure_id"
        )

    recovery_method = await db.get(RecoveryMethodModel, payload.recovery_method_id)
    if recovery_method is None:
        raise HTTPException(
            status_code=422, detail="Указан несуществующий recovery_method_id"
        )

    service_company = await db.get(ServiceCompanyModel, payload.service_company_id)
    if service_company is None:
        raise HTTPException(
            status_code=422, detail="Указана несуществующая сервисная компания"
        )

    try:
        car_result = await db.execute(
            select(CarModel)
            .options(selectinload(CarModel.vehicle_model))
            .where(CarModel.id == payload.car_id)
        )
        car = car_result.scalar_one_or_none()

        if not car:
            raise HTTPException(status_code=404, detail="Car not found")

        new_complaint = ComplaintModel(
            car_id=payload.car_id,
            date_of_failure=payload.date_of_failure,
            operating_time=payload.operating_time,
            node_failure_id=payload.node_failure_id,
            description_failure=payload.description_failure or "",
            recovery_method_id=payload.recovery_method_id,
            used_spare_parts=payload.used_spare_parts or "",
            date_recovery=payload.date_recovery or None,
            equipment_downtime=payload.equipment_downtime or "",
            service_company_id=payload.service_company_id,
            vehicle_model=car.vehicle_model.name if car.vehicle_model else "",
        )

        db.add(new_complaint)
        await db.flush()

        result = await db.execute(
            select(ComplaintModel)
            .options(
                selectinload(ComplaintModel.car).selectinload(CarModel.vehicle_model),
                selectinload(ComplaintModel.node_failure),
                selectinload(ComplaintModel.recovery_method),
                selectinload(ComplaintModel.service_company),
            )
            .where(ComplaintModel.id == new_complaint.id)
        )
        complaint = result.scalar_one()

        await db.commit()

        return {
            "id": complaint.id,
            "car_id": complaint.car_id,
            "vin": car.vin,
            "date_of_failure": complaint.date_of_failure,
            "operating_time": complaint.operating_time,
            "node_failure_id": complaint.node_failure_id,
            "node_failure": node_failure.name,
            "description_failure": complaint.description_failure,
            "recovery_method_id": complaint.recovery_method_id,
            "recovery_method": recovery_method.name,
            "used_spare_parts": complaint.used_spare_parts,
            "date_recovery": complaint.date_recovery,
            "equipment_downtime": complaint.equipment_downtime,
            "service_company": service_company.name,
            "service_company_id": complaint.service_company_id,
            "vehicle_model": complaint.vehicle_model,
        }

    except Exception as e:
        await db.rollback()
        import traceback

        error_trace = traceback.format_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при создании рекламации: {str(e)}\n{error_trace}",
        )
