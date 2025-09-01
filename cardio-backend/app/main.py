from fastapi import FastAPI
from app.core.database import init_db
from app.api import auth, users

app = FastAPI(title="CardioAI Backend", version="1.0")

@app.on_event("startup")
async def on_startup():
    await init_db()

# Routers
app.include_router(auth.router)
app.include_router(users.router)
