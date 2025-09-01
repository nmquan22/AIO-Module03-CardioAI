import { useState } from "react";
import { register } from "../api/auth";

export default function RegisterForm({
  onRegisterSuccess,
  onGoLogin,
}: {
  onRegisterSuccess: () => void;
  onGoLogin: () => void;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await register({ username, email, password });
    if (res?.access_token) {
      localStorage.setItem("token", res.access_token);
      alert("✅ Register success!");
      onRegisterSuccess(); 
    } else {
      alert("❌ Register failed!");
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md space-y-4"
      >
        <h2 className="text-2xl font-bold text-center text-gray-700">
          Register
        </h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-400 outline-none"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-400 outline-none"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-400 outline-none"
        />
        <button
          type="submit"
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition"
        >
          Register
        </button>

        {/* Nút quay lại Login */}
        <p className="text-center text-sm text-gray-600">
          Đã có tài khoản?{" "}
          <button
            type="button"
            onClick={onGoLogin}
            className="text-green-500 hover:underline"
          >
            Đăng nhập
          </button>
        </p>
      </form>
    </div>
  );
}
