from typing import Tuple, List

from sqlalchemy import inspect
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    create_async_engine,
    async_sessionmaker,
)

from Backend.core import settings

engine = create_async_engine(
    settings.database_url,
    echo=True,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

