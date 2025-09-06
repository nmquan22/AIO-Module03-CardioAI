// src/api/predict.ts
import axios from "axios";

export type PredictSimpleInput = {
  age?: number;               // years
  gender?: "male" | "female";
  cholesterol?: number;       // 1..3
  bp?: number;                // systolic ap_hi
};

export type PredictFullInput = {
  age?: number | null;        // days
  height?: number | null;
  weight?: number | null;
  ap_hi?: number | null;
  ap_lo?: number | null;
  cholesterol?: number | null; // 1..3
  gluc?: number | null;        // 1..3
  smoke?: number | null;       // 0/1
  alco?: number | null;        // 0/1
  active?: number | null;      // 0/1
  gender?: number | null;      // 1=female, 2=male
};

export type PredictResponse = {
  prediction: 0 | 1;
  prob?: number | null;
  note?: string;
};

const API_BASE = "http://localhost:8000";

export async function predictSimple(data: PredictSimpleInput): Promise<PredictResponse> {
  const base = String(API_BASE).replace(/\/+$/, "");
  const res = await axios.post(`${base}/ml/predict_simple`, data, { timeout: 15000 });
  return res.data as PredictResponse;
}

export async function predictFull(data: PredictFullInput): Promise<PredictResponse> {
  const base = String(API_BASE).replace(/\/+$/, "");
  const res = await axios.post(`${base}/ml/predict_full`, data, { timeout: 15000 });
  return res.data as PredictResponse;
}
