import { useMemo, useState } from "react";
import { predictFull, explainFull, type PredictResponse } from "../api/predict";
import ExplainPanel from "./ExplainPanel";

function toNumOrNull(v: string): number | null {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export default function PredictForm() {
  const [ageYears, setAgeYears] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [apHi, setApHi] = useState("");
  const [apLo, setApLo] = useState("");
  const [chol, setChol] = useState("");
  const [gluc, setGluc] = useState("");
  const [smoke, setSmoke] = useState("");
  const [alco, setAlco] = useState("");
  const [active, setActive] = useState("");
  const [gender, setGender] = useState(""); // 1 or 2

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [explain, setExplain] = useState<any | null>(null);


  const payload = useMemo(() => {
    const years = toNumOrNull(ageYears);
    return {
      age: years === null ? null : Math.round(years * 365), // years -> days
      height: toNumOrNull(height),
      weight: toNumOrNull(weight),
      ap_hi: toNumOrNull(apHi),
      ap_lo: toNumOrNull(apLo),
      cholesterol: toNumOrNull(chol),
      gluc: toNumOrNull(gluc),
      smoke: toNumOrNull(smoke),
      alco: toNumOrNull(alco),
      active: toNumOrNull(active),
      gender: toNumOrNull(gender),
    };
  }, [ageYears, height, weight, apHi, apLo, chol, gluc, smoke, alco, active, gender]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setResult(null); setExplain(null);
    try {
      const res = await predictFull(payload);
      const label = res.prediction === 1 ? "High risk (1)" : "Low risk (0)";
      const probText = typeof res.prob === "number" ? ` — probability: ${(res.prob*100).toFixed(1)}%` : "";
      setResult(`${label}${probText}`);

      // gọi explain
      const ex = await explainFull(payload);
      setExplain(ex);
    } catch (err: any) {
      const msg = err?.response?.data?.detail ?? err?.message ?? "Prediction failed";
      setResult("❌ " + String(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg space-y-3">
        <h2 className="text-2xl font-bold text-center text-gray-700">
          Heart Disease Prediction — Full Form
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <input type="number" placeholder="Age (years)" value={ageYears} onChange={e=>setAgeYears(e.target.value)} className="border rounded-lg p-2" />

          <select value={gender} onChange={e=>setGender(e.target.value)} className="border rounded-lg p-2">
            <option value="">Gender (1=female,2=male)</option>
            <option value="1">Female (1)</option>
            <option value="2">Male (2)</option>
          </select>

          <input type="number" placeholder="Height (cm)" value={height} onChange={e=>setHeight(e.target.value)} className="border rounded-lg p-2" />
          <input type="number" placeholder="Weight (kg)" value={weight} onChange={e=>setWeight(e.target.value)} className="border rounded-lg p-2" />

          <input type="number" placeholder="Systolic (ap_hi)" value={apHi} onChange={e=>setApHi(e.target.value)} className="border rounded-lg p-2" />
          <input type="number" placeholder="Diastolic (ap_lo)" value={apLo} onChange={e=>setApLo(e.target.value)} className="border rounded-lg p-2" />

          <input type="number" min={1} max={3} placeholder="Cholesterol (1..3)" value={chol} onChange={e=>setChol(e.target.value)} className="border rounded-lg p-2" />
          <input type="number" min={1} max={3} placeholder="Glucose (1..3)" value={gluc} onChange={e=>setGluc(e.target.value)} className="border rounded-lg p-2" />

          <input type="number" min={0} max={1} placeholder="Smoke (0/1)" value={smoke} onChange={e=>setSmoke(e.target.value)} className="border rounded-lg p-2" />
          <input type="number" min={0} max={1} placeholder="Alcohol (0/1)" value={alco} onChange={e=>setAlco(e.target.value)} className="border rounded-lg p-2" />
          <input type="number" min={0} max={1} placeholder="Active (0/1)" value={active} onChange={e=>setActive(e.target.value)} className="border rounded-lg p-2" />
        </div>

        <button type="submit" disabled={loading} className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition disabled:opacity-60">
          {loading ? "Predicting..." : "Predict"}
        </button>

        {result && <div className="mt-2 text-center font-semibold text-gray-700">{result}</div>}
        {explain && <ExplainPanel data={explain} />}


        <p className="text-xs text-gray-500">
          Trường trống sẽ được gửi là <code>null</code> → server chuyển thành <code>NaN</code> cho XGBoost xử lý.
        </p>
      </form>
    </div>
  );
}
