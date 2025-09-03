import axios from "axios";

const API_URL = "http://localhost:8000";

export async function predict(data: {
  age: number;
  gender: string;
  cholesterol: number;
  bp: number;
}) {
  const res = await axios.post(`${API_URL}/predict`, data);
  return res.data;
}
