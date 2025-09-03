import { useState } from "react";
import { login } from "../api/auth";

export default function LoginForm({
  onLoginSuccess,
  onGoRegister,
}: {
  onLoginSuccess: () => void;
  onGoRegister: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      alert("Vui lòng nhập email và mật khẩu");
      return;
    }
    try {
      setLoading(true);
      const res = await login(email, password);
      if (res?.access_token) {
        localStorage.setItem("token", res.access_token);
        alert("Login success!");
        onLoginSuccess();
      } else {
        alert("Login failed!");
      }
    } catch (err: any) {
      alert(err?.message || "Login error");
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
        <h2 className="text-2xl font-bold text-center text-gray-700">Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

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
