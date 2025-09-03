function ThreeDViewer() {
  return (
    <div className="bg-white p-6 rounded-lg shadow h-full flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-4">3D Reconstruction</h2>
      <p className="text-gray-600 mb-6">
        Ở đây sẽ render mô hình 3D (siêu âm/CT/MRI) bằng Three.js hoặc WebGL.
      </p>
      <div className="w-96 h-96 bg-gray-200 flex items-center justify-center rounded-lg">
        🧊 3D Model Placeholder
      </div>
    </div>
  );
}

export default ThreeDViewer;
