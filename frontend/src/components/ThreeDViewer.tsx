import React, { useEffect, useMemo, useState, Suspense } from "react";
import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import { OrbitControls, Environment, Html, Bounds, useBounds } from "@react-three/drei";
import { GLTFLoader } from "three-stdlib";
import { OBJLoader } from "three-stdlib";
import { STLLoader } from "three-stdlib";
import * as THREE from "three";

// ----------------------
// Helpers
// ----------------------
function useObjectURL(file: File | null) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!file) return;
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  return url;
}

function CenterAndFit({ children }: { children: React.ReactNode }) {
  const api = useBounds();
  useEffect(() => {
    setTimeout(() => api.fit(), 0);
  }, [api]);
  return <group>{children}</group>;
}

function Loading() {
  return (
    <Html center>
      <div className="px-3 py-1 text-sm bg-white/90 rounded-lg shadow">Đang tải mô hình…</div>
    </Html>
  );
}

function FallbackCube({ wireframe }: { wireframe: boolean }) {
  return (
    <mesh castShadow receiveShadow>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial wireframe={wireframe} />
    </mesh>
  );
}

function Model({ url, ext, wireframe }: { url: string | null; ext: string | null; wireframe: boolean }) {
  if (!url || !ext) return <FallbackCube wireframe={wireframe} />;

  if (ext === "gltf" || ext === "glb") {
    const gltf = useLoader(GLTFLoader, url);
    return <primitive object={gltf.scene} />;
  }

  if (ext === "obj") {
    const obj = useLoader(OBJLoader, url);
    return <primitive object={obj} />;
  }

  if (ext === "stl") {
    const geom = useLoader(STLLoader, url);
    return (
      <mesh geometry={geom} castShadow receiveShadow>
        <meshStandardMaterial wireframe={wireframe} />
      </mesh>
    );
  }

  return <FallbackCube wireframe={wireframe} />;
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={1.0} castShadow />
      <directionalLight position={[-5, -5, -5]} intensity={0.4} />
    </>
  );
}

function AutoRotate({ enabled }: { enabled: boolean }) {
  const { camera } = useThree();
  useFrame((_, delta) => {
    if (enabled) {
      camera.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), delta * 0.2);
    }
  });
  return null;
}

// ----------------------
// Main Component
// ----------------------
export default function ThreeDViewer() {
  const [file, setFile] = useState<File | null>(null);
  const [wireframe, setWireframe] = useState<boolean>(false);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [bg, setBg] = useState<string>("#f8fafc");

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    if (f) setFile(f);
  };

  const url = useObjectURL(file);
  const ext = useMemo(() => (file ? file.name.split(".").pop()?.toLowerCase() || null : null), [file]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow h-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">3D Reconstruction</h2>
        <div className="flex items-center gap-2">
          <label className="px-3 py-2 rounded-xl border cursor-pointer hover:shadow transition">
            <input type="file" accept=".glb,.gltf,.obj,.stl" className="hidden" onChange={onFileChange} />
            Tải mô hình (.glb/.gltf/.obj/.stl)
          </label>
          <button
            onClick={() => setWireframe((v) => !v)}
            className="px-3 py-2 rounded-xl border hover:shadow"
          >
            {wireframe ? "Tắt wireframe" : "Bật wireframe"}
          </button>
          <button
            onClick={() => setAutoRotate((v) => !v)}
            className="px-3 py-2 rounded-xl border hover:shadow"
          >
            {autoRotate ? "Dừng xoay" : "Tự xoay"}
          </button>
          <select
            className="px-3 py-2 rounded-xl border"
            value={bg}
            onChange={(e) => setBg(e.target.value)}
            title="Nền"
          >
            <option value="#ffffff">Trắng</option>
            <option value="#f8fafc">Rất nhạt</option>
            <option value="#e2e8f0">Nhạt</option>
            <option value="#0b1020">Tối</option>
          </select>
        </div>
      </div>

      <p className="text-gray-600 -mt-2">
        Tải mô hình siêu âm/CT/MRI đã được chuyển sang lưới 3D (STL/OBJ/GLTF). Với dữ liệu thể tích (DICOM), cần một bước dựng thể tích riêng.
      </p>

      <div className="relative w-full aspect-square rounded-2xl overflow-hidden border" style={{ background: bg }}>
        <Canvas shadows camera={{ position: [4, 4, 6], fov: 45 }}>
          <Suspense fallback={<Loading />}> 
            <Environment preset="city" />
            <Lights />
            <Bounds clip fit observe margin={1.2}>
              <CenterAndFit>
                <Model url={url} ext={ext} wireframe={wireframe} />
              </CenterAndFit>
            </Bounds>
          </Suspense>
          <gridHelper args={[20, 20]} />
          <OrbitControls makeDefault />
          <AutoRotate enabled={autoRotate} />
        </Canvas>
      </div>

      <div className="text-xs text-gray-500">
        Gợi ý: Dùng <span className="font-mono">3D Slicer</span> hoặc <span className="font-mono">ITK-Snap</span> để trích lưới STL/OBJ từ DICOM trước khi tải lên.
      </div>
    </div>
  );
}


