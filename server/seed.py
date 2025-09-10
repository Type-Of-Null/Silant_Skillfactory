import random
from datetime import datetime, timedelta
from models import (
    CarModel, VehicleModel, EngineModel, TransmissionModel, 
    DriveAxleModel, SteeringAxleModel, Client, ServiceCompanyModel
)
from database import engine, AsyncSessionLocal, Base

# Список данных для заполнения
VEHICLE_MODELS = [
    "КАМАЗ-5490", "КАМАЗ-65201", "КАМАЗ-6580", "КАМАЗ-65207", "КАМАЗ-65206"
]

ENGINE_MODELS = [
    "КАМАЗ-740.73-400", "КАМАЗ-740.73-420", "КАМАЗ-740.73-440", 
    "КАМАЗ-740.73-460", "КАМАЗ-740.73-480"
]

TRANSMISSION_MODELS = [
    "ZF16S2220", "ZF16S2221", "ZF16S2222", "ZF16S2223", "ZF16S2224"
]

DRIVE_AXLE_MODELS = [
    "КАМАЗ-6522", "КАМАЗ-65221", "КАМАЗ-65222", "КАМАЗ-65223", "КАМАЗ-65224"
]

STEERING_AXLE_MODELS = [
    "КАМАЗ-6520", "КАМАЗ-65201", "КАМАЗ-65202", "КАМАЗ-65203", "КАМАЗ-65204"
]

CLIENTS = [
    "ООО 'СтройДорМаш'", "АО 'АвтоСтрой'", "ЗАО 'ДорТехСервис'",
    "ИП Петров И.И.", "ООО 'ГрузАвтоТранс'"
]

SERVICE_COMPANIES = [
    "СервисЦентр 'КАМАЗ-Сервис'", "ТехЦентр 'Камский'",
    "АвтоСервис 'Дизель-Мастер'", "ТехноСервис 'КАМАЗ-Техно'"
]

# Функция для генерации VIN
def generate_vin():
    letters = 'ABCDEFGHJKLMNPRSTUVWXYZ'
    digits = '0123456789'
    return ''.join(random.choices(letters + digits, k=17))

# Функция для генерации номера двигателя/трансмиссии
def generate_serial_number(prefix):
    return f"{prefix}-{random.randint(10000, 99999)}"

# Функция для заполнения справочников
async def seed_reference_data(session):
    # Создаем модели техники
    vehicle_models = []
    for name in VEHICLE_MODELS:
        model = VehicleModel(name=name, description=f"Модель техники {name}")
        session.add(model)
        vehicle_models.append(model)
    
    # Создаем модели двигателей
    engine_models = []
    for name in ENGINE_MODELS:
        model = EngineModel(name=name, description=f"Модель двигателя {name}")
        session.add(model)
        engine_models.append(model)
    
    # Аналогично для остальных справочников
    transmission_models = []
    for name in TRANSMISSION_MODELS:
        model = TransmissionModel(name=name, description=f"Модель трансмиссии {name}")
        session.add(model)
        transmission_models.append(model)
    
    drive_axle_models = []
    for name in DRIVE_AXLE_MODELS:
        model = DriveAxleModel(name=name, description=f"Модель ведущего моста {name}")
        session.add(model)
        drive_axle_models.append(model)
    
    steering_axle_models = []
    for name in STEERING_AXLE_MODELS:
        model = SteeringAxleModel(name=name, description=f"Модель управляемого моста {name}")
        session.add(model)
        steering_axle_models.append(model)
    
    # Создаем клиентов
    clients = []
    for i, name in enumerate(CLIENTS, 1):
        # Генерируем уникальное имя пользователя
        base_username = name.split("'")[0].strip().lower().replace(' ', '_')
        username = f"{base_username}_{i}"  # Добавляем число для уникальности
        client = Client(name=name, username=username, password="password123")
        session.add(client)
        clients.append(client)
    
    # Создаем сервисные компании
    service_companies = []
    for name in SERVICE_COMPANIES:
        company = ServiceCompanyModel(name=name, description=f"Сервисная компания {name}")
        session.add(company)
        service_companies.append(company)
    
    await session.commit()
    
    return {
        'vehicle_models': vehicle_models,
        'engine_models': engine_models,
        'transmission_models': transmission_models,
        'drive_axle_models': drive_axle_models,
        'steering_axle_models': steering_axle_models,
        'clients': clients,
        'service_companies': service_companies
    }

# Функция для заполнения машин

async def seed_cars(session, ref_data):
    for i in range(50):  # Создаем 50 машин
        car = CarModel(
            vin=generate_vin(),
            vehicle_model_id=random.choice(ref_data['vehicle_models']).id,
            engine_model_id=random.choice(ref_data['engine_models']).id,
            engine_number=generate_serial_number("ENG"),
            transmission_model_id=random.choice(ref_data['transmission_models']).id,
            transmission_number=generate_serial_number("TR"),
            drive_axle_model_id=random.choice(ref_data['drive_axle_models']).id,
            drive_axle_number=generate_serial_number("DA"),
            steering_axle_model_id=random.choice(ref_data['steering_axle_models']).id,
            steering_axle_number=generate_serial_number("SA"),
            delivery_agreement=f"Договор №{random.randint(1000, 9999)} от {datetime.now().strftime('%d.%m.%Y')}",
            shipment_date=datetime.now() - timedelta(days=random.randint(1, 365)),
            recipient=random.choice(CLIENTS),
            delivery_address=f"г. {['Москва', 'Санкт-Петербург', 'Казань', 'Екатеринбург', 'Новосибирск'][random.randint(0, 4)]}",
            equipment=f"Комплектация {random.choice(['Стандарт', 'Комфорт', 'Люкс'])}",
            client_id=random.choice(ref_data['clients']).id,
            service_company_id=random.choice(ref_data['service_companies']).id
        )
        session.add(car)
    
    await session.commit()

# Основная функция

async def main():
    # Создаем все таблицы
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    
    # Заполняем данные
    async with AsyncSessionLocal() as session:
        print("Заполняем справочные данные...")
        ref_data = await seed_reference_data(session)
        
        print("Заполняем данные по машинам...")
        await seed_cars(session, ref_data)
        
        print("Данные успешно заполнены!")

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
