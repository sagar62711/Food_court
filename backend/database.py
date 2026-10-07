import os

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

# Local dev falls back to SQLite; in production set DATABASE_URL, e.g.
# mysql+pymysql://user:password@host:3306/dbname
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./food_court.db")

if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    connect_args = {}
    if os.environ.get("DB_SSL", "").lower() in ("1", "true", "yes"):
        # Cloud MySQL providers (Aiven, TiDB, ...) require TLS. Any non-empty
        # ssl dict makes PyMySQL enable TLS.
        connect_args["ssl"] = {"ssl_mode": "REQUIRED"}
    engine = create_engine(
        DATABASE_URL,
        connect_args=connect_args,
        pool_pre_ping=True,
        pool_recycle=300,
    )

SessionLocal = sessionmaker(bind=engine, autoflush=False)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
