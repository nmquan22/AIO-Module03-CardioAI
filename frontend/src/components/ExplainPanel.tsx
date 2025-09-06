import { useEffect, useMemo, useState } from "react";
import type { ExplainResponse, ShapItem } from "../api/predict";
import { fetchFeatureLabels } from "../api/predict";

function pretty(v?: number | null) {
  return typeof v === "number" ? (v*100).toFixed(1) + "%" : "—";
}

export default function ExplainPanel({ data }: { data: ExplainResponse }) {
  const [labels, setLabels] = useState<Record<string,string>>({});

  useEffect(() => {
    fetchFeatureLabels().then(setLabels).catch(()=>{});
  }, []);

  function renderList(title: string, items: ShapItem[], positive: boolean) {
    return (
      <div className={`border rounded-xl p-3 ${positive ? "border-red-300 bg-red-50" : "border-green-300 bg-green-50"}`}>
        <h4 className="font-semibold mb-2">{title}</h4>
        <ul className="space-y-1">
          {items.map((it) => (
            <li key={it.feature} className="flex justify-between text-sm">
              <span className="truncate mr-2" title={it.feature}>
                {labels[it.feature] ?? it.feature}
              </span>
              <span className="font-mono">{it.value.toFixed(3)}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="text-sm text-gray-700">
        <div>Prediction: <b>{data.prediction}</b></div>
        <div>Probability: <b>{pretty(data.prob)}</b></div>
        <div>Base prob: <b>{pretty(data.base_prob)}</b> <span className="text-xs text-gray-500">(mức nền của mô hình)</span></div>
      </div>
      {renderList("Factors ↑ risk", data.top_up, true)}
      {renderList("Factors ↓ risk", data.top_down, false)}
      {data.note && <p className="text-xs text-gray-500">{data.note}</p>}
    </div>
  );
}
