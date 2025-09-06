import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

function ThreeDViewer() {
  return (
    <div className="bg-white p-6 rounded-lg shadow h-full flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-4">3D Reconstruction</h2>
      <p className="text-gray-600 mb-6">
        Ở đây sẽ render mô hình 3D (siêu âm/CT/MRI) bằng Three.js hoặc WebGL.
      </p>

      <div className="w-96 h-96 bg-gray-200 flex items-center justify-center rounded-lg overflow-hidden">
        <Canvas camera={{ position: [3, 3, 3], fov: 60 }}>
          {/* ánh sáng */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} />

          {/* mô hình thử — một cube */}
          <mesh rotation={[0.4, 0.2, 0]}>
            <boxGeometry args={[2, 2, 2]} />
            <meshStandardMaterial color="#4f46e5" />
          </mesh>

          {/* điều khiển xoay/zoom */}
          <OrbitControls />
        </Canvas>
      </div>
    </div>
  );
}

export default ThreeDViewer;

