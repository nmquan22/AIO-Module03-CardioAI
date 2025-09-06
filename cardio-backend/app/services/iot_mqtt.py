# app/services/iot_mqtt.py
import json, threading
import paho.mqtt.client as mqtt
from datetime import datetime
from typing import Dict, Any, Optional, List
from app.schemas.vital_schema import VitalIn
from app.models.vital_model import Vital

# cache realtime (in-memory)
_latest: Dict[str, Dict[str, Any]] = {}

def get_latest(patient: str) -> Optional[Dict[str, Any]]:
    return _latest.get(patient)

async def persist_vital(v: VitalIn):
    doc = Vital(**v.model_dump())
    await doc.insert()

def _on_message(client, userdata, msg):
    try:
        data = json.loads(msg.payload.decode())
        v = VitalIn(**data)
    except Exception:
        return
    # cập nhật cache realtime
    _latest[v.patient] = data
    # lưu Mongo (không await được trong callback thread) → fire & forget
    import asyncio
    loop = asyncio.get_event_loop()
    if loop.is_running():
        loop.create_task(persist_vital(v))

def start_mqtt(host: str, port: int) -> mqtt.Client:
    client = mqtt.Client(client_id="cardio-backend")
    client.on_message = _on_message
    client.connect(host, port, keepalive=45)
    client.subscribe("cardio/vitals/+", qos=1)
    # chạy nền
    th = threading.Thread(target=client.loop_forever, daemon=True)
    th.start()
    return client
