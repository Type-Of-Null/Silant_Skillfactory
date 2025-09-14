from fastapi import APIRouter
from sqlalchemy import text

from database import engine

router = APIRouter(tags=["meta"])


@router.get("/tables")
async def get_tables():
    async with engine.connect() as conn:
        result = await conn.execute(
            text("SELECT name FROM sqlite_master WHERE type='table';")
        )
        tables = result.fetchall()
        return {"tables": [table[0] for table in tables]}
