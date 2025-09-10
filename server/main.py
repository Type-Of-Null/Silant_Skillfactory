import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, AsyncSessionLocal
from models import (
    Base,
    CarModel,
    VehicleModel,
    EngineModel,
    TransmissionModel,
    DriveAxleModel,
    SteeringAxleModel,
    Client,
    ServiceCompanyModel,
)
from sqlalchemy import text
from sqlalchemy.future import select
from schemas import SCar, SCarNotAuth


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        async with engine.begin() as conn:
            # await conn.run_sync(Base.metadata.drop_all)
            await conn.run_sync(Base.metadata.create_all)

    except Exception as e:
        print(f"Ошибка при создании таблиц: {e}")
        raise
    yield

    await engine.dispose()


app = FastAPI(title="Silant API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/")
async def root():
    return {"message": "Тест"}


@app.get("/tables")
async def get_tables():
    async with engine.connect() as conn:
        result = await conn.execute(
            text("SELECT name FROM sqlite_master WHERE type='table';")
        )
        tables = result.fetchall()
        return {"tables": [table[0] for table in tables]}


@app.get("/api/cars/{vin}", response_model=SCarNotAuth)
async def get_car_by_vin(vin: str):
    async with AsyncSessionLocal() as session:
        # Получаем машину по VIN
        stmt = select(CarModel).where(CarModel.vin == vin)
        result = await session.execute(stmt)
        car = result.scalar_one_or_none()

        if not car:
            raise HTTPException(status_code=404, detail="Машина с указанным VIN не найдена")

        # Получаем связанные данные
        vehicle_model = await session.get(VehicleModel, car.vehicle_model_id)
        engine_model = await session.get(EngineModel, car.engine_model_id)
        transmission_model = await session.get(TransmissionModel, car.transmission_model_id)
        drive_axle_model = await session.get(DriveAxleModel, car.drive_axle_model_id)
        steering_axle_model = await session.get(SteeringAxleModel, car.steering_axle_model_id)

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


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
