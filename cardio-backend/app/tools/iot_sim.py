# tools/iot_sim.py
import argparse, json, time, random
from datetime import datetime, timezone
import paho.mqtt.client as mqtt

def iso():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

ap = argparse.ArgumentParser()
ap.add_argument("--host", default="localhost")
ap.add_argument("--port", type=int, default=1883)
ap.add_argument("--patient", default="P001")
args = ap.parse_args()

c = mqtt.Client(f"sim-{args.patient}")
c.connect(args.host, args.port, 30)
c.loop_start()

topic = f"cardio/vitals/{args.patient}"

while True:
    payload = {
        "patient": args.patient,
        "ts": iso(),
        "hr": random.randint(72, 90),
        "spo2": random.randint(95, 99),
        "sbp": random.randint(115, 130),
        "dbp": random.randint(75, 85),
        "rr":  random.randint(12, 18),
        "mode": "normal", "source": "sim"
    }
    c.publish(topic, json.dumps(payload), qos=1)
    time.sleep(1.0)
