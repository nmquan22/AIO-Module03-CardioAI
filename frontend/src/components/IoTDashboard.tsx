function IoTDashboard() {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">IoT Realtime Dashboard</h2>
      <p className="text-gray-600 mb-6">
        Hiển thị dữ liệu realtime từ thiết bị y tế (nhịp tim, huyết áp, SpO₂...).
      </p>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-red-100 p-4 rounded text-center">
          ❤️ Heart Rate <br /> <span className="text-2xl font-bold">78 bpm</span>
        </div>
        <div className="bg-blue-100 p-4 rounded text-center">
          💨 SpO₂ <br /> <span className="text-2xl font-bold">97%</span>
        </div>
        <div className="bg-green-100 p-4 rounded text-center">
          🩸 Blood Pressure <br /> <span className="text-2xl font-bold">120/80</span>
        </div>
      </div>
    </div>
  );
}

export default IoTDashboard;
