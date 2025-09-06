import React, { useState, Suspense, useEffect } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  Bounds,
  useBounds,
  Html,
} from "@react-three/drei";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

// ================== ErrorBoundary ==================
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; errorMsg: string }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, errorMsg: "" };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, errorMsg: error.message || "Model load error" };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("3D Viewer Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
          ❌ Không thể load mô hình: {this.state.errorMsg}
        </div>
      );
    }
    return this.props.children;
  }
}

// ================== Loading Component ==================
function Loading() {
  return (
    <Html center>
      <div className="px-4 py-2 bg-white rounded shadow text-gray-600 text-sm">
        Đang tải mô hình...
      </div>
    </Html>
  );
}

// ================== Lights ==================
function Lights() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
    </>
  );
}

// ================== Fallback Cube ==================
function FallbackCube({ wireframe }: { wireframe: boolean }) {
  return (
    <mesh castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color="orange"
        wireframe={wireframe}
        clippingPlanes={[]}
      />
    </mesh>
  );
}

// ================== Model Loader ==================
function Model({
  url,
  ext,
  wireframe,
  clippingPlanes,
}: {
  url: string | null;
  ext: string | null;
  wireframe: boolean;
  clippingPlanes: THREE.Plane[];
}) {
  if (!url || !ext) return <FallbackCube wireframe={wireframe} />;

  if (ext === "gltf" || ext === "glb") {
    const gltf = useLoader(GLTFLoader, url);
    useEffect(() => {
      gltf.scene.traverse((child: any) => {
        if (child.isMesh && child.material) {
          child.material.clippingPlanes = clippingPlanes;
          child.material.clipShadows = true;
          child.material.wireframe = wireframe;
        }
      });
    }, [gltf, clippingPlanes, wireframe]);
    return <primitive object={gltf.scene} />;
  }

  if (ext === "obj") {
    const obj = useLoader(OBJLoader, url);
    obj.traverse((child: any) => {
      if (child.isMesh && child.material) {
        child.material.clippingPlanes = clippingPlanes;
        child.material.clipShadows = true;
        child.material.wireframe = wireframe;
      }
    });
    return <primitive object={obj} />;
  }

  if (ext === "stl") {
    const geom = useLoader(STLLoader, url);
    return (
      <mesh geometry={geom} castShadow receiveShadow>
        <meshStandardMaterial
          wireframe={wireframe}
          clippingPlanes={clippingPlanes}
          clipShadows
        />
      </mesh>
    );
  }

  if (ext === "fbx") {
    const fbx = useLoader(FBXLoader, url);
    useEffect(() => {
      fbx.traverse((child: any) => {
        if (child.isMesh && child.material) {
          child.material.clippingPlanes = clippingPlanes;
          child.material.clipShadows = true;
          child.material.wireframe = wireframe;
        }
      });
    }, [fbx, clippingPlanes, wireframe]);
    return <primitive object={fbx} />;
  }

  return <FallbackCube wireframe={wireframe} />;
}

// ================== CenterAndFit ==================
function CenterAndFit({ children }: { children: React.ReactNode }) {
  const api = useBounds();
  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        api.refresh(e.object).fit();
      }}
      onPointerMissed={(e) => {
        if (e.type === "click") api.refresh().fit();
      }}
    >
      {children}
    </group>
  );
}

// ================== Main Viewer ==================
export default function ThreeDViewer() {
  const [url, setUrl] = useState<string | null>(null);
  const [ext, setExt] = useState<string | null>(null);
  const [wireframe, setWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);

  // clipping planes state
  const [clipX, setClipX] = useState(0);
  const [clipY, setClipY] = useState(0);
  const [clipZ, setClipZ] = useState(0);

  // Generate clipping planes
  const clippingPlanes = [
    new THREE.Plane(new THREE.Vector3(1, 0, 0), clipX),
    new THREE.Plane(new THREE.Vector3(0, 1, 0), clipY),
    new THREE.Plane(new THREE.Vector3(0, 0, 1), clipZ),
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    if (!fileExt) return;
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    setExt(fileExt);
  };

  const resetClipping = () => {
    setClipX(0);
    setClipY(0);
    setClipZ(0);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-6xl mx-auto flex flex-col space-y-6">
      <h2 className="text-2xl font-bold">3D Reconstruction Viewer</h2>

      {/* Hướng dẫn sử dụng */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700 leading-relaxed">
        <h3 className="font-semibold mb-2">📘 Hướng dẫn chuẩn bị dữ liệu (3D Slicer)</h3>
        <ol className="list-decimal list-inside space-y-1">
          <li>Cài đặt phần mềm <b>3D Slicer</b> (miễn phí, open-source).</li>
          <li>Mở Slicer → Import dữ liệu CT/MRI (file DICOM).</li>
          <li>Dùng <b>Segment Editor</b> để chọn vùng tim/mạch máu.</li>
          <li>Làm mịn (Smooth) và loại bỏ nhiễu.</li>
          <li><b>Export</b> ra <code>.stl</code>, <code>.obj</code>, <code>.glb</code>, hoặc <code>.fbx</code>.</li>
          <li>Tải file lên đây để xem mô hình 3D.</li>
        </ol>
      </div>

      {/* Control panel */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="px-3 py-2 border rounded cursor-pointer text-sm text-gray-700 bg-gray-50 hover:bg-gray-100">
          Chọn tệp 3D
          <input
            type="file"
            accept=".glb,.gltf,.obj,.stl,.fbx"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
        <button
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
          onClick={() => setWireframe((w) => !w)}
        >
          {wireframe ? "Tắt Wireframe" : "Bật Wireframe"}
        </button>
        <button
          className="px-3 py-1 bg-green-500 text-white rounded text-sm"
          onClick={() => setAutoRotate((r) => !r)}
        >
          {autoRotate ? "Tắt Auto-Rotate" : "Bật Auto-Rotate"}
        </button>
        <button
          className="px-3 py-1 bg-red-500 text-white rounded text-sm"
          onClick={resetClipping}
        >
          Reset Clipping
        </button>
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-3 gap-4 text-sm">
        <label className="flex flex-col items-center">
          X: {clipX.toFixed(1)}
          <input
            type="range"
            min={-5}
            max={5}
            step={0.1}
            value={clipX}
            onChange={(e) => setClipX(parseFloat(e.target.value))}
            className="w-24"
          />
        </label>
        <label className="flex flex-col items-center">
          Y: {clipY.toFixed(1)}
          <input
            type="range"
            min={-5}
            max={5}
            step={0.1}
            value={clipY}
            onChange={(e) => setClipY(parseFloat(e.target.value))}
            className="w-24"
          />
        </label>
        <label className="flex flex-col items-center">
          Z: {clipZ.toFixed(1)}
          <input
            type="range"
            min={-5}
            max={5}
            step={0.1}
            value={clipZ}
            onChange={(e) => setClipZ(parseFloat(e.target.value))}
            className="w-24"
          />
        </label>
      </div>

      {/* Viewer box */}
      <div className="w-full h-[500px] border rounded-lg overflow-hidden bg-gray-100">
        <ErrorBoundary>
          <Canvas
            shadows
            camera={{ position: [4, 4, 6], fov: 45 }}
            gl={{ localClippingEnabled: true }}
          >
            <Suspense fallback={<Loading />}>
              <Environment preset="city" />
              <Lights />
              <Bounds clip fit observe margin={1.2}>
                <CenterAndFit>
                  <Model
                    url={url}
                    ext={ext}
                    wireframe={wireframe}
                    clippingPlanes={clippingPlanes}
                  />
                </CenterAndFit>
              </Bounds>
            </Suspense>
            <gridHelper args={[20, 20]} />
            <OrbitControls makeDefault autoRotate={autoRotate} />
          </Canvas>
        </ErrorBoundary>
      </div>
    </div>
  );
}

