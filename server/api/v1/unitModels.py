from typing import Optional, Dict, Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from database import get_db
from models import VehicleModel, EngineModel, TransmissionModel, DriveAxleModel, SteeringAxleModel

router = APIRouter(prefix="/models", tags=["models"])


class ModelResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True


class ModelUpdateRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


async def _get_model_by_id(db: AsyncSession, model_class: type, model_id: int) -> Optional[Dict[str, Any]]:
    result = await db.execute(select(model_class).where(model_class.id == model_id))
    model = result.scalar_one_or_none()
    if not model:
        return None
    return {"id": model.id, "name": model.name, "description": model.description}


@router.get("/vehicle/{model_id}", response_model=ModelResponse)
async def get_vehicle_model(model_id: int, db: AsyncSession = Depends(get_db)):
    model = await _get_model_by_id(db, VehicleModel, model_id)
    if not model:
        raise HTTPException(status_code=404, detail="Vehicle model not found")
    return model


@router.put("/vehicle/{model_id}", response_model=ModelResponse)
async def update_vehicle_model(model_id: int, payload: ModelUpdateRequest, db: AsyncSession = Depends(get_db)):
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
    result = await db.execute(select(VehicleModel).where(VehicleModel.id == model_id))
    model = result.scalar_one_or_none()
    if not model:
        raise HTTPException(status_code=404, detail="Vehicle model not found")
    await db.delete(model)
    await db.commit()
    return {"ok": True}


@router.get("/engine/{model_id}", response_model=ModelResponse)
async def get_engine_model(model_id: int, db: AsyncSession = Depends(get_db)):
    model = await _get_model_by_id(db, EngineModel, model_id)
    if not model:
        raise HTTPException(status_code=404, detail="Engine model not found")
    return model


@router.get("/transmission/{model_id}", response_model=ModelResponse)
async def get_transmission_model(model_id: int, db: AsyncSession = Depends(get_db)):
    model = await _get_model_by_id(db, TransmissionModel, model_id)
    if not model:
        raise HTTPException(status_code=404, detail="Transmission model not found")
    return model


@router.get("/drive-axle/{model_id}", response_model=ModelResponse)
async def get_drive_axle_model(model_id: int, db: AsyncSession = Depends(get_db)):
    model = await _get_model_by_id(db, DriveAxleModel, model_id)
    if not model:
        raise HTTPException(status_code=404, detail="Drive axle model not found")
    return model


@router.get("/steering-axle/{model_id}", response_model=ModelResponse)
async def get_steering_axle_model(model_id: int, db: AsyncSession = Depends(get_db)):
    model = await _get_model_by_id(db, SteeringAxleModel, model_id)
    if not model:
        raise HTTPException(status_code=404, detail="Steering axle model not found")
    return model
