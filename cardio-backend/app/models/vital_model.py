from beanie import Document, Indexed
from typing import Optional
from datetime import datetime

class Vital(Document):
    patient: Indexed(str)          # khóa tìm theo bệnh nhân
    ts:      Indexed(datetime)     # thời điểm đo
    hr: Optional[int] = None
    spo2: Optional[int] = None
    sbp: Optional[int] = None
    dbp: Optional[int] = None
    rr:  Optional[int] = None
    mode: Optional[str] = None
    source: Optional[str] = None

    class Settings:
        name = "vitals"
