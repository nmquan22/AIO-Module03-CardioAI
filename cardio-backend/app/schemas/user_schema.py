from pydantic import BaseModel, EmailStr
from typing import List

class UserOut(BaseModel):
    id: str
    email: EmailStr
    roles: List[str]
