import { useEffect, useMemo, useRef, useState } from "react";

type Vital = {
  patient: string;
  ts: string;
  hr?: number;
  spo2?: number;
  sbp?: number;
  dbp?: number;
  rr?: number;
  mode?: string;
  source?: string;
};

function wsUrl(path: string) {
  const proto = location.protocol === "https:" ? "wss" : "ws";
  return `${proto}://${location.host}${path}`;
}

export default function IoTDashboard() {
  // Bạn có thể lấy patient từ auth token / profile;
  // để demo: cho phép gõ/đổi nhanh
  const [patient, setPatient] = useState<string>("P001");
  const [vital, setVital] = useState<Vital | null>(null);
  const [status, setStatus] = useState<"connecting" | "open" | "closed">("connecting");
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    setStatus("connecting");
    const ws = new WebSocket(wsUrl(`/iot/ws/vitals/${patient}`));
    ws.onopen = () => setStatus("open");
    ws.onmessage = (e) => {
      try { setVital(JSON.parse(e.data)); } catch {}
    };
    ws.onclose = () => setStatus("closed");
    ws.onerror = () => setStatus("closed");
    wsRef.current = ws;
    return () => ws.close();
  }, [patient]);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">IoT Realtime Dashboard</h2>
        <div className="flex items-center gap-2">
          <input
            className="border px-3 py-1 rounded"
            value={patient}
            onChange={(e) => setPatient(e.target.value)}
            placeholder="Patient code (vd: P001)"
          />
          <span className={`text-sm ${status !== "open" ? "text-red-600" : "text-green-600"}`}>
            {status === "open" ? "LIVE" : "DISCONNECTED"}
          </span>
        </div>
      </div>

      <p className="text-gray-600 mb-6">
        Dữ liệu realtime từ thiết bị y tế (nhịp tim, SpO₂, huyết áp, nhịp thở).
      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Metric color="red"    label="Heart Rate" value={vital?.hr}  unit="bpm"  icon="❤️" />
        <Metric color="blue"   label="SpO₂"       value={vital?.spo2} unit="%"    icon="💨" />
        <Metric color="green"  label="SBP"        value={vital?.sbp}  unit="mmHg" icon="🩸" />
        <Metric color="emerald"label="DBP"        value={vital?.dbp}  unit="mmHg" icon="🩸" />
      </div>

      <div className="mt-6 text-sm text-gray-500">
        {vital ? <>Cập nhật: <b>{new Date(vital.ts).toLocaleString()}</b> — nguồn: {vital.source}</> : "Đang chờ dữ liệu..."}
      </div>
    </div>
  );
}

function Metric({ color, label, value, unit, icon }:{
  color: string; label: string; value?: number; unit: string; icon: string;
}) {
  return (
    <div className={`bg-${color}-100 p-4 rounded text-center`}>
      <div className="text-lg">{icon} {label}</div>
      <div className="text-2xl font-bold">{value ?? "—"} <span className="text-base">{unit}</span></div>
    </div>
  );
}
