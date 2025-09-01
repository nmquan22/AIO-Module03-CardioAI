import { useState } from "react";
import { login } from "../api/auth";

export default function LoginForm({
  onLoginSuccess,
  onGoRegister,
}: {
  onLoginSuccess: () => void;
  onGoRegister: () => void;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await login(username, password);
    if (res?.access_token) {
      localStorage.setItem("token", res.access_token);
      alert("✅ Login success!");
      onLoginSuccess(); // 👉 báo cho App biết login thành công
    } else {
      alert("❌ Login failed!");
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md space-y-4"
      >
        <h2 className="text-2xl font-bold text-center text-gray-700">Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
        />
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition"
        >
          Login
        </button>

        {/* Nút chuyển sang Register */}
        <p className="text-center text-sm text-gray-600">
          Chưa có tài khoản?{" "}
          <button
            type="button"
            onClick={onGoRegister}
            className="text-blue-500 hover:underline"
          >
            Đăng ký
          </button>
        </p>
      </form>
    </div>
  );
}
