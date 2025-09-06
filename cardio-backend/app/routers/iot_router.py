from fastapi import APIRouter, WebSocket, Depends, Query
from typing import List, Optional
from datetime import datetime
from app.schemas.vital_schema import VitalIn
from app.services.iot_mqtt import get_latest
from app.models.vital_model import Vital

router = APIRouter(prefix="/iot", tags=["iot"])

# Fallback demo: nếu không dùng MQTT, có thể POST trực tiếp payload vào đây để hiển thị realtime & lưu DB
@router.post("/push")
async def push_vital(v: VitalIn):
    # cập nhật "latest" thông qua MQTT service không gọi được → gán tay:
    from app.services.iot_mqtt import _latest   # type: ignore
    _latest[v.patient] = v.model_dump()
    await Vital(**v.model_dump()).insert()
    return {"ok": True}

@router.get("/history")
async def history(
    patient: str,
    start: Optional[datetime] = Query(None),
    end: Optional[datetime] = Query(None),
    limit: int = 500
):
    q = Vital.find(Vital.patient == patient)
    if start: q = q.find(Vital.ts >= start)
    if end:   q = q.find(Vital.ts <= end)
    q = q.sort(-Vital.ts).limit(limit)
    items = await q.to_list()
    # trả về mới nhất trước (frontend có thể đảo nếu muốn)
    return [i.model_dump() | {"id": str(i.id)} for i in items]

# WebSocket realtime cho 1 bệnh nhân
from fastapi import WebSocketDisconnect
import asyncio, json

@router.websocket("/ws/vitals/{patient}")
async def ws_vitals(ws: WebSocket, patient: str):
    await ws.accept()
    try:
        while True:
            data = get_latest(patient)
            if data:
                await ws.send_text(json.dumps(data))
            await asyncio.sleep(1.0)
    except WebSocketDisconnect:
        await ws.close()
