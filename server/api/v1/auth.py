from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from database import get_db
from models import User
from schemas import LoginRequest, LoginResponse

router = APIRouter(tags=["auth"])





@router.post("/login", response_model=LoginResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.username == payload.username))
    user = result.scalar_one_or_none()
    if not user or user.password != payload.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверное имя пользователя или пароль",
        )

    name = None
    if hasattr(user, "client") and user.client:
        try:
            name = user.client.name
        except Exception:
            name = None

    return LoginResponse(id=user.id, username=user.username, role=str(user.role), name=name)
