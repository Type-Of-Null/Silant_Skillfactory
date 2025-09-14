from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from database import get_db
from models import TechMaintenanceExtendModel

router = APIRouter(prefix="/maintenance", tags=["maintenance"])


class MaintenanceResponse(BaseModel):
    id: int
    vin: str
    maintenance_type: str
    maintenance_date: Optional[str]
    order_number: Optional[str]
    order_date: Optional[str]
    service_company: str


@router.get("", response_model=List[MaintenanceResponse])
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
