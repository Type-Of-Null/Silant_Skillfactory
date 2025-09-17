# moved list endpoints below after router declaration
from typing import Optional, Dict, Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from database import get_db
from models import (
    VehicleModel,
    EngineModel,
    TransmissionModel,
    DriveAxleModel,
    SteeringAxleModel,
    Client,
    ServiceCompanyModel,
    CarModel,
)

router = APIRouter(prefix="/models", tags=["models"])


class ModelResponse(BaseModel):
    id: int = Field(..., description="Идентификатор записи")
    name: str = Field(..., description="Название")
    description: str | None = Field(None, description="Описание")

    class Config:
        from_attributes = True

# Списки моделей для селектов
@router.get("/vehicle")
async def list_vehicle_models(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(VehicleModel))
    items = result.scalars().all()
    return [{"id": m.id, "name": m.name} for m in items]


@router.get("/engine")
async def list_engine_models(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(EngineModel))
    items = result.scalars().all()
    return [{"id": m.id, "name": m.name} for m in items]


@router.get("/transmission")
async def list_transmission_models(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TransmissionModel))
    items = result.scalars().all()
    return [{"id": m.id, "name": m.name} for m in items]


@router.get("/drive-axle")
async def list_drive_axle_models(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DriveAxleModel))
    items = result.scalars().all()
    return [{"id": m.id, "name": m.name} for m in items]


@router.get("/steering-axle")
async def list_steering_axle_models(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SteeringAxleModel))
    items = result.scalars().all()
    return [{"id": m.id, "name": m.name} for m in items]

# Клиенты и сервисные компании
@router.get("/clients")
async def list_clients(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Client))
    items = result.scalars().all()
    return [{"id": c.id, "name": c.name} for c in items]


@router.get("/service-company")
async def list_service_companies(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ServiceCompanyModel))
    items = result.scalars().all()
    return [{"id": s.id, "name": s.name} for s in items]


class ModelUpdateRequest(BaseModel):
    name: Optional[str] = Field(..., description="Название")
    description: Optional[str] = Field(None, description="Описание")


async def _get_model_by_id(
    db: AsyncSession, model_class: type, model_id: int
) -> Optional[Dict[str, Any]]:
    result = await db.execute(select(model_class).where(model_class.id == model_id))
    model = result.scalar_one_or_none()
    if not model:
        return None
    return {"id": model.id, "name": model.name, "description": model.description}


# Модель техники
@router.get("/vehicle/{model_id}", response_model=ModelResponse)
async def get_vehicle_model(model_id: int, db: AsyncSession = Depends(get_db)):
    model = await _get_model_by_id(db, VehicleModel, model_id)
    if not model:
        raise HTTPException(status_code=404, detail="Vehicle model not found")
    return model


@router.put("/vehicle/{model_id}", response_model=ModelResponse)
async def update_vehicle_model(
    model_id: int, payload: ModelUpdateRequest, db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(VehicleModel).where(VehicleModel.id == model_id))
    model = result.scalar_one_or_none()
    if not model:
        raise HTTPException(status_code=404, detail="Vehicle model not found")
    if payload.name is not None:
        model.name = payload.name
    if payload.description is not None:
        model.description = payload.description
    await db.commit()
    await db.refresh(model)
    return {"id": model.id, "name": model.name, "description": model.description}


@router.delete("/vehicle/{model_id}")
async def delete_vehicle_model(model_id: int, db: AsyncSession = Depends(get_db)):
    # Do not allow deletion if there are cars referencing this model to avoid FK violations
    refs = await db.execute(
        select(CarModel.id).where(CarModel.vehicle_model_id == model_id).limit(1)
    )
    if refs.first() is not None:
        raise HTTPException(
            status_code=409,
            detail="Невозможно удалить модель: к ней привязаны автомобили. Сначала отвяжите автомобили от этой модели.",
        )

    result = await db.execute(select(VehicleModel).where(VehicleModel.id == model_id))
    model = result.scalar_one_or_none()
    if not model:
        raise HTTPException(status_code=404, detail="Vehicle model not found")
    await db.delete(model)
    await db.commit()
    return {"ok": True}


# Модель двигателя
@router.get("/engine/{model_id}", response_model=ModelResponse)
async def get_engine_model(model_id: int, db: AsyncSession = Depends(get_db)):
    model = await _get_model_by_id(db, EngineModel, model_id)
    if not model:
        raise HTTPException(status_code=404, detail="Engine model not found")
    return model


@router.put("/engine/{model_id}", response_model=ModelResponse)
async def update_engine_model(
    model_id: int, payload: ModelUpdateRequest, db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(EngineModel).where(EngineModel.id == model_id))
    model = result.scalar_one_or_none()
    if not model:
        raise HTTPException(status_code=404, detail="Engine model not found")
    if payload.name is not None:
        model.name = payload.name
    if payload.description is not None:
        model.description = payload.description
    await db.commit()
    await db.refresh(model)
    return {"id": model.id, "name": model.name, "description": model.description}


@router.delete("/engine/{model_id}")
async def delete_engine_model(model_id: int, db: AsyncSession = Depends(get_db)):
    refs = await db.execute(
        select(CarModel.id).where(CarModel.engine_model_id == model_id).limit(1)
    )
    if refs.first() is not None:
        raise HTTPException(
            status_code=409,
            detail="Невозможно удалить модель: к ней привязаны автомобили. Сначала отвяжите автомобили от этой модели.",
        )

    result = await db.execute(select(EngineModel).where(EngineModel.id == model_id))
    model = result.scalar_one_or_none()
    if not model:
        raise HTTPException(status_code=404, detail="Engine model not found")
    await db.delete(model)
    await db.commit()
    return {"ok": True}


# Модель трансмиссии
@router.get("/transmission/{model_id}", response_model=ModelResponse)
async def get_transmission_model(model_id: int, db: AsyncSession = Depends(get_db)):
    model = await _get_model_by_id(db, TransmissionModel, model_id)
    if not model:
        raise HTTPException(status_code=404, detail="Transmission model not found")
    return model


@router.put("/transmission/{model_id}", response_model=ModelResponse)
async def update_transmission_model(
    model_id: int, payload: ModelUpdateRequest, db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(TransmissionModel).where(TransmissionModel.id == model_id)
    )
    model = result.scalar_one_or_none()
    if not model:
        raise HTTPException(status_code=404, detail="Transmission model not found")
    if payload.name is not None:
        model.name = payload.name
    if payload.description is not None:
        model.description = payload.description
    await db.commit()
    await db.refresh(model)
    return {"id": model.id, "name": model.name, "description": model.description}


@router.delete("/transmission/{model_id}")
async def delete_transmission_model(model_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(TransmissionModel).where(TransmissionModel.id == model_id)
    )
    model = result.scalar_one_or_none()
    if not model:
        raise HTTPException(status_code=404, detail="Transmission model not found")
    await db.delete(model)
    await db.commit()
    return {"ok": True}


# Модель ведущего моста
@router.get("/drive-axle/{model_id}", response_model=ModelResponse)
async def get_drive_axle_model(model_id: int, db: AsyncSession = Depends(get_db)):
    model = await _get_model_by_id(db, DriveAxleModel, model_id)
    if not model:
        raise HTTPException(status_code=404, detail="Drive axle model not found")
    return model


@router.put("/drive-axle/{model_id}", response_model=ModelResponse)
async def update_drive_axle_model(
    model_id: int, payload: ModelUpdateRequest, db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(DriveAxleModel).where(DriveAxleModel.id == model_id)
    )
    model = result.scalar_one_or_none()
    if not model:
        raise HTTPException(status_code=404, detail="Drive axle model not found")
    if payload.name is not None:
        model.name = payload.name
    if payload.description is not None:
        model.description = payload.description
    await db.commit()
    await db.refresh(model)
    return {"id": model.id, "name": model.name, "description": model.description}


@router.delete("/drive-axle/{model_id}")
async def delete_drive_axle_model(model_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(DriveAxleModel).where(DriveAxleModel.id == model_id)
    )
    model = result.scalar_one_or_none()
    if not model:
        raise HTTPException(status_code=404, detail="Drive axle model not found")
    await db.delete(model)
    await db.commit()
    return {"ok": True}


# Модель управляемого моста
@router.get("/steering-axle/{model_id}", response_model=ModelResponse)
async def get_steering_axle_model(model_id: int, db: AsyncSession = Depends(get_db)):
    model = await _get_model_by_id(db, SteeringAxleModel, model_id)
    if not model:
        raise HTTPException(status_code=404, detail="Steering axle model not found")
    return model


@router.put("/steering-axle/{model_id}", response_model=ModelResponse)
async def update_steering_axle_model(
    model_id: int, payload: ModelUpdateRequest, db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(SteeringAxleModel).where(SteeringAxleModel.id == model_id)
    )
    model = result.scalar_one_or_none()
    if not model:
        raise HTTPException(status_code=404, detail="Steering axle model not found")
    if payload.name is not None:
        model.name = payload.name
    if payload.description is not None:
        model.description = payload.description
    await db.commit()
    await db.refresh(model)
    return {"id": model.id, "name": model.name, "description": model.description}


@router.delete("/steering-axle/{model_id}")
async def delete_steering_axle_model(model_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(SteeringAxleModel).where(SteeringAxleModel.id == model_id)
    )
    model = result.scalar_one_or_none()
    if not model:
        raise HTTPException(status_code=404, detail="Steering axle model not found")
    await db.delete(model)
    await db.commit()
    return {"ok": True}
