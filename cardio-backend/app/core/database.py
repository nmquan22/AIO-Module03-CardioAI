import motor.motor_asyncio
from beanie import init_beanie
from app.models.user_model import User
from app.core.config import settings

client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGO_URI)
db = client.get_default_database()

async def init_db():
    await init_beanie(database=db, document_models=[User])
