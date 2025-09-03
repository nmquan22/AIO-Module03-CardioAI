function Dashboard() {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Patient Dashboard</h2>
      <p className="text-gray-600 mb-4">
        Tổng quan sức khỏe bệnh nhân. Tại đây sẽ hiển thị biểu đồ huyết áp, nhịp tim, và
        diễn biến bệnh theo thời gian.
      </p>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-100 p-4 rounded">📈 Chart Placeholder</div>
        <div className="bg-green-100 p-4 rounded">🫀 Health Stats</div>
        <div className="bg-yellow-100 p-4 rounded">🩸 Lab Tests</div>
        <div className="bg-red-100 p-4 rounded">⚠️ Alerts</div>
      </div>
    </div>
  );
}

export default Dashboard;
