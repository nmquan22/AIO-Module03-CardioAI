import { useState } from "react";
import { predict } from "../api/predict"; // cần tạo file api/predict.ts

export default function PredictForm() {
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [cholesterol, setCholesterol] = useState("");
  const [bp, setBp] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await predict({
        age: Number(age),
        gender,
        cholesterol: Number(cholesterol),
        bp: Number(bp),
      });
      setResult(res?.prediction ?? "No result");
    } catch (err) {
      console.error(err);
      setResult("❌ Prediction failed!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md space-y-4"
      >
        <h2 className="text-2xl font-bold text-center text-gray-700">Heart Disease Prediction</h2>

        <input
          type="number"
          placeholder="Age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-400 outline-none"
          required
        />

        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-400 outline-none"
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>

        <input
          type="number"
          placeholder="Cholesterol"
          value={cholesterol}
          onChange={(e) => setCholesterol(e.target.value)}
          className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-400 outline-none"
          required
        />

        <input
          type="number"
          placeholder="Blood Pressure"
          value={bp}
          onChange={(e) => setBp(e.target.value)}
          className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-400 outline-none"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition"
        >
          {loading ? "Predicting..." : "Predict"}
        </button>

        {result && (
          <div className="mt-4 text-center font-semibold text-gray-700">
            {result}
          </div>
        )}
      </form>
    </div>
  );
}
