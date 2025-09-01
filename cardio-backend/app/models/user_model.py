from beanie import Document
from pydantic import EmailStr
from typing import List

class User(Document):
    email: EmailStr
    hashed_password: str
    roles: List[str] = ["user"]

    class Settings:
        name = "users"
