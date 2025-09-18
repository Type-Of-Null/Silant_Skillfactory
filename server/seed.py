import random
from datetime import datetime, timedelta
from models import (
    CarModel, VehicleModel, EngineModel, TransmissionModel, 
    DriveAxleModel, SteeringAxleModel, Client, ServiceCompanyModel,
    TechMaintenanceModel, RecoveryMethodModel, FailureNodeModel,
    TechMaintenanceExtendModel, ComplaintModel, User, UserRole
)
from database import engine, AsyncSessionLocal, Base

# Список данных для заполнения
VEHICLE_MODELS = [
    "ПД1500",
    "ПГ2500",
    "ПЭ2000",
    "Т4000У",
    "В4410",
    "ПД3500",
    "ПЭ1500",
    "ПГ3000",
    "ТШСМГ",
    "ПД5000"
]

ENGINE_MODELS = [
    "Д150",
    "Г200",
    "Э180",
    "ДТ240",
    "ГТ220",
    "Д300",
    "ЭП200",
    "Д220",
    "ГМ160",
    "ДТ320"
]

TRANSMISSION_MODELS = [
    "МКПП6",
    "АКПП8",
    "ВАРИАТОР",
    "РОБОТ7",
    "МКПП5",
    "ДТКП",
    "СПРИНТ",
    "ПОЛНОПРИВ",
    "МКПП4",
    "ГИДРОСТ"
]

DRIVE_AXLE_MODELS = [
    "ДА-6х2",
    "ДА-8х4",
    "ДА-4х2",
    "ДА-Т12",
    "ДА-СП",
    "ДА-М16",
    "ДА-Н18",
    "ДА-П20",
    "ДА-Г22",
    "ДА-С24"
]

STEERING_AXLE_MODELS = [
    "СА-Ф1",
    "СА-Р2",
    "СА-Т3",
    "СА-М4",
    "СА-Н5",
    "СА-П6",
    "СА-Г7",
    "СА-С8",
    "СА-В9",
    "СА-У10"
]

CLIENTS = [
    "ООО 'СтройДорМаш'", "АО 'АвтоСтрой'", "ЗАО 'ДорТехСервис'",
    "ИП Петров И.И.", "ООО 'ГрузАвтоТранс'"
]

SERVICE_COMPANIES = [
    "Сервис 1",
    "Сервис 2",
    "Сервис 3"
]

# Data for maintenance types
MAINTENANCE_TYPES = [
    "ТО-1",
    "ТО-2",
    "Сезонное обслуживание",
    "Технический осмотр"
]

# Data for failure nodes
FAILURE_NODES = [
    "Двигатель",
    "Трансмиссия",
    "Ходовая часть",
    "Электрооборудование",
    "Тормозная система"
]

# Data for recovery methods
RECOVERY_METHODS = [
    "Ремонт",
    "Замена",
    "Восстановление",
    "Настройка"
]

# User credentials
USERS = [
    {"username": "admin", "password": "admin123", "role": UserRole.manager},
    {"username": "service1", "password": "service123", "role": UserRole.service, "service_company": "Сервис 1"},
    {"username": "client1", "password": "client123", "role": UserRole.client, "client": "ООО 'Ромашка'"}
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

async def seed_users(session, ref_data):
    users = []
    for user_data in USERS:
        user = User(
            username=user_data['username'],
            password=user_data['password'],
            role=user_data['role']
        )
        
        if user_data.get('client'):
            client = next((c for c in ref_data['clients'] if c.name == user_data['client']), None)
            if client:
                user.client_id = client.id
        
        if user_data.get('service_company'):
            company = next((c for c in ref_data['service_companies'] if c.name == user_data['service_company']), None)
            if company:
                user.service_company_id = company.id
        
        session.add(user)
        users.append(user)
    
    await session.commit()
    return users

async def seed_maintenance_data(session, ref_data):
    # Create maintenance types
    maintenance_types = []
    for name in MAINTENANCE_TYPES:
        mt = TechMaintenanceModel(name=name, description=f"Тип ТО: {name}")
        session.add(mt)
        maintenance_types.append(mt)
    
    # Create failure nodes
    failure_nodes = []
    for name in FAILURE_NODES:
        fn = FailureNodeModel(name=name, description=f"Узел отказа: {name}")
        session.add(fn)
        failure_nodes.append(fn)
    
    # Create recovery methods
    recovery_methods = []
    for name in RECOVERY_METHODS:
        rm = RecoveryMethodModel(name=name, description=f"Способ восстановления: {name}")
        session.add(rm)
        recovery_methods.append(rm)
    
    await session.commit()
    
    return {
        'maintenance_types': maintenance_types,
        'failure_nodes': failure_nodes,
        'recovery_methods': recovery_methods
    }

async def seed_cars(session, ref_data):
    cars = []
    for i in range(50):  # Create 50 cars
        client = random.choice(ref_data['clients'])
        service_company = random.choice(ref_data['service_companies'])
        
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
            recipient=client.name,
            delivery_address=f"г. {random.choice(['Москва', 'Санкт-Петербург', 'Казань', 'Екатеринбург', 'Новосибирск'])}",
            equipment=f"Комплектация {random.choice(['Стандарт', 'Комфорт', 'Люкс'])}",
            client_id=client.id,
            service_company_id=service_company.id
        )
        session.add(car)
        cars.append(car)
    
    await session.commit()
    return cars

async def seed_maintenance_records(session, ref_data, cars):
    maintenance_records = []
    
    for car in cars:
        # Create 1-3 maintenance records per car
        for _ in range(random.randint(1, 3)):
            maintenance_date = datetime.now() - timedelta(days=random.randint(1, 180))
            order_date = maintenance_date - timedelta(days=random.randint(1, 30))
            
            record = TechMaintenanceExtendModel(
                car_id=car.id,
                maintenance_type_id=random.choice(ref_data['maintenance_types']).id,
                maintenance_date=maintenance_date,
                order_number=f"ORD-{random.randint(1000, 9999)}",
                order_date=order_date,
                service_company_id=car.service_company_id
            )
            session.add(record)
            maintenance_records.append(record)
    
    await session.commit()
    return maintenance_records

async def seed_complaints(session, ref_data, cars):
    complaints = []
    
    for car in cars:
        # Create 0-2 complaints per car
        for _ in range(random.randint(0, 2)):
            failure_date = datetime.now() - timedelta(days=random.randint(1, 365))
            recovery_date = failure_date + timedelta(days=random.randint(1, 14))
            
            complaint = ComplaintModel(
                car_id=car.id,
                date_of_failure=failure_date.strftime("%Y-%m-%d"),
                operating_time=datetime.now() - timedelta(days=random.randint(30, 365)),
                node_failure_id=random.choice(ref_data['failure_nodes']).id,
                description_failure=f"Неисправность в узле {random.choice(FAILURE_NODES)}",
                recovery_method_id=random.choice(ref_data['recovery_methods']).id,
                used_spare_parts=random.choice(["Да", "Нет"]),
                date_recovery=recovery_date.strftime("%Y-%m-%d"),
                equipment_downtime=str((recovery_date - failure_date).days) + " дней",
                vehicle_model=car.vehicle_model.name,
                service_company_id=car.service_company_id
            )
            session.add(complaint)
            complaints.append(complaint)
    
    await session.commit()
    return complaints
    
    await session.commit()

# Основная функция

async def main():
    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    
    # Fill with data
    async with AsyncSessionLocal() as session:
        print("Filling reference data...")
        ref_data = await seed_reference_data(session)
        
        print("Creating maintenance data...")
        maintenance_data = await seed_maintenance_data(session, ref_data)
        ref_data.update(maintenance_data)
        
        print("Creating users...")
        await seed_users(session, ref_data)
        
        print("Creating cars...")
        cars = await seed_cars(session, ref_data)
        
        print("Creating maintenance records...")
        await seed_maintenance_records(session, ref_data, cars)
        
        print("Creating complaints...")
        await seed_complaints(session, ref_data, cars)
        
        print("Data has been successfully populated!")

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
