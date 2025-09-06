from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import init_db
from app.api import auth, users
from app.routers import iot_router
from app.core.config import settings

app = FastAPI(title="CardioAI Backend", version="1.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # hoặc ["http://localhost:3000"] nếu frontend chạy ở port 3000
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def on_startup():
    await init_db()

    if getattr(settings, "MQTT_ENABLED", False):
        from app.services.iot_mqtt import start_mqtt
        start_mqtt(settings.MQTT_HOST, settings.MQTT_PORT)

# Routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(iot_router.router)
