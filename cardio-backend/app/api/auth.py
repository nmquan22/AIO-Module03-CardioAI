from fastapi import APIRouter
from app.schemas.auth_schema import RegisterRequest, LoginRequest, TokenResponse
from app.services.user_service import UserService

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=TokenResponse)
async def register(data: RegisterRequest):
    return await UserService.register(data)

@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest):
    return await UserService.login(data)
