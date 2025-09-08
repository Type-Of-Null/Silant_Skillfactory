import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, AsyncSessionLocal
from models import Base, CarModel, VehicleModel, EngineModel, TransmissionModel, DriveAxleModel, SteeringAxleModel, \
    Client, ServiceCompanyModel
from sqlalchemy import text
from sqlalchemy.future import select
from schemas import SCar


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


app = FastAPI(
    title="Silant API",
    version="1.0.0",
    lifespan=lifespan
)

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


@app.get("/cars/public/{vin}", response_model=SCar)
async def get_car_public(vin: str):
    async with AsyncSessionLocal() as session:
        # Запрос к базе данных для получения машины по VIN
        stmt = select(CarModel).where(CarModel.vin == vin)
        result = await session.execute(stmt)
        car = result.scalar_one_or_none()

        if car is None:
            raise HTTPException(status_code=404, detail="Машина не найдена")

        # Получаем связанные данные
        vehicle_model = await session.get(VehicleModel, car.vehicle_model_id)
        engine_model = await session.get(EngineModel, car.engine_model_id)
        transmission_model = await session.get(TransmissionModel, car.transmission_model_id)
        drive_axle_model = await session.get(DriveAxleModel, car.drive_axle_model_id)
        steering_axle_model = await session.get(SteeringAxleModel, car.steering_axle_model_id)
        client = await session.get(Client, car.client_id)
        service_company = await session.get(ServiceCompanyModel, car.service_company_id)

        # Формируем ответ
        car_data = SCar(
            vin=car.vin,
            vehicle_model=vehicle_model.name if vehicle_model else "",
            engine_model=engine_model.name if engine_model else "",
            engine_number=car.engine_number,
            transmission_model=transmission_model.name if transmission_model else "",
            transmission_number=car.transmission_number,
            drive_axle=drive_axle_model.name if drive_axle_model else "",
            drive_axle_number=car.drive_axle_number,
            steering_axle=steering_axle_model.name if steering_axle_model else "",
            steering_axle_number=car.steering_axle_number,
            delivery_agreement=car.delivery_agreement,
            shipment_date=car.shipment_date,
            recipient=car.recipient,
            delivery_address=car.delivery_address,
            equipment=car.equipment,
            client=client.name if client else "",
            service_company=service_company.name if service_company else ""
        )

        return car_data


@app.get("/tables")
async def get_tables():
    async with engine.connect() as conn:
        result = await conn.execute(text("SELECT name FROM sqlite_master WHERE type='table';"))
        tables = result.fetchall()
        return {"tables": [table[0] for table in tables]}


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
