from app.models.user_model import User
from app.core.security import hash_password, verify_password, create_access_token
from app.schemas.auth_schema import RegisterRequest, LoginRequest, TokenResponse
from fastapi import HTTPException, status

class UserService:
    @staticmethod
    async def register(data: RegisterRequest) -> TokenResponse:
        existing = await User.find_one(User.email == data.email)
        if existing:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Email already registered")

        user = User(email=data.email, hashed_password=hash_password(data.password))
        await user.insert()

        token = create_access_token({"sub": str(user.id), "email": user.email})
        return TokenResponse(access_token=token)

    @staticmethod
    async def login(data: LoginRequest) -> TokenResponse:
        user = await User.find_one(User.email == data.email)
        if not user or not verify_password(data.password, user.hashed_password):
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

        token = create_access_token({"sub": str(user.id), "email": user.email})
        return TokenResponse(access_token=token)
