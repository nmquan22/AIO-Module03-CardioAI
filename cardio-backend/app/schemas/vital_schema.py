from pydantic import BaseModel, Field, conint
from typing import Optional
from datetime import datetime

class VitalIn(BaseModel):
    patient: str = Field(min_length=1, max_length=64)
    ts: datetime
    hr: Optional[conint(ge=20, le=240)] = None
    spo2: Optional[conint(ge=50, le=100)] = None
    sbp: Optional[conint(ge=60, le=260)] = None
    dbp: Optional[conint(ge=30, le=200)] = None
    rr:  Optional[conint(ge=5,  le=60)]  = None
    mode: Optional[str] = None
    source: Optional[str] = "sim"

class VitalOut(VitalIn):
    id: str
