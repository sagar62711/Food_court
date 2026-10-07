import os

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from admin_routes import router as admin_router
from auth import create_access_token, verify_password
from database import get_db
from models import User
from order_routes import owner_router as order_owner_router
from order_routes import public_router as order_public_router
from owner_routes import router as owner_router
from public_routes import router as public_router

app = FastAPI()

# Comma-separated list, e.g. "https://my-app.vercel.app,http://localhost:5173"
ALLOWED_ORIGINS = [
    o.strip()
    for o in os.environ.get("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
    if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(admin_router)
app.include_router(owner_router)
app.include_router(public_router)
app.include_router(order_public_router)
app.include_router(order_owner_router)


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


@app.get("/api/health")
def health_check():
    return {"status": "ok"}


@app.post("/api/auth/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == data.username).first()
    if user is None or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Wrong username or password",
        )
    return TokenResponse(access_token=create_access_token(user))
