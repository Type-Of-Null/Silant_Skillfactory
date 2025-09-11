import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routes import router as api_router  # Импортируем роутер

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

# Подключаем роутер
app.include_router(api_router)

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/")
async def root():
    return {"message": "Тест"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)