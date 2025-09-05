from __future__ import annotations

import os
from pathlib import Path
from typing import Iterator

from sqlalchemy import create_engine, MetaData
from sqlalchemy.engine import Engine
from sqlalchemy.orm import sessionmaker, Session


def _build_sqlite_url() -> str:
    project_root = Path(__file__).resolve().parents[2]
    db_path = project_root / "db.sqlite3"
    return f"sqlite:///{db_path.as_posix()}"


SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", _build_sqlite_url())

engine: Engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args=(
        {"check_same_thread": False}
        if SQLALCHEMY_DATABASE_URL.startswith("sqlite")
        else {}
    ),
    future=True,
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)

metadata = MetaData()
metadata.reflect(bind=engine)


def get_db() -> Iterator[Session]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
