import React, { useState, Suspense, useEffect, useRef } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  Bounds,
  useBounds,
  Html,
  Grid,
  ContactShadows,
} from "@react-three/drei";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { 
  Upload, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  Grid3X3,
  Info,
  Play,
  Pause,
  Sliders
} from "lucide-react";

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
    return { hasError: true, errorMsg: error.message || "Lỗi tải mô hình" };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("3D Viewer Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full bg-red-50 text-red-600 rounded-lg">
          <div className="text-center p-6">
            <div className="text-4xl mb-2">❌</div>
            <div className="font-semibold">Không thể tải mô hình</div>
            <div className="text-sm mt-1 opacity-75">{this.state.errorMsg}</div>
            <div className="text-xs mt-3 text-red-500">
              Vui lòng kiểm tra định dạng file (.stl, .obj, .glb, .gltf, .fbx)
            </div>
          </div>
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
      <div className="flex items-center space-x-2 px-4 py-3 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg text-gray-700">
        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm font-medium">Đang tải mô hình...</span>
      </div>
    </Html>
  );
}

// ================== Enhanced Lights ==================
function Lights({ lightIntensity }: { lightIntensity: number }) {
  return (
    <>
      <ambientLight intensity={lightIntensity * 0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={lightIntensity}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <pointLight position={[-10, -10, -10]} intensity={lightIntensity * 0.3} />
      <spotLight
        position={[0, 20, 0]}
        intensity={lightIntensity * 0.5}
        angle={0.6}
        penumbra={1}
        castShadow
      />
    </>
  );
}

// ================== Demo Heart Model ==================
function DemoHeart({ wireframe, clippingPlanes }: { wireframe: boolean; clippingPlanes: THREE.Plane[] }) {
  const heartRef = useRef<THREE.Group>(null);
  
  useEffect(() => {
    if (heartRef.current) {
      heartRef.current.traverse((child: any) => {
        if (child.isMesh && child.material) {
          child.material.clippingPlanes = clippingPlanes;
          child.material.clipShadows = true;
          child.material.wireframe = wireframe;
        }
      });
    }
  }, [wireframe, clippingPlanes]);

  return (
    <group ref={heartRef}>
      {/* Main heart shape */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshStandardMaterial 
          color="#ff4444" 
          wireframe={wireframe}
          clippingPlanes={clippingPlanes}
          clipShadows
          transparent
          opacity={0.9}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      
      {/* Arteries */}
      {[0, 1, 2, 3].map(i => (
        <mesh key={i} castShadow position={[
          Math.cos(i * Math.PI / 2) * 1.5,
          Math.sin(i * Math.PI / 2) * 0.3,
          0
        ]}>
          <cylinderGeometry args={[0.1, 0.15, 1.5, 8]} />
          <meshStandardMaterial 
            color="#ff6666" 
            wireframe={wireframe}
            clippingPlanes={clippingPlanes}
            clipShadows
            roughness={0.4}
            metalness={0.05}
          />
        </mesh>
      ))}

      {/* Ventricles */}
      <mesh castShadow receiveShadow position={[0, -0.5, 0]}>
        <boxGeometry args={[0.8, 1, 0.8]} />
        <meshStandardMaterial 
          color="#cc3333" 
          wireframe={wireframe}
          clippingPlanes={clippingPlanes}
          clipShadows
          transparent
          opacity={0.7}
          roughness={0.2}
          metalness={0.15}
        />
      </mesh>
    </group>
  );
}

// ================== Enhanced Model Loader ==================
function Model({
  url,
  ext,
  wireframe,
  clippingPlanes,
  modelColor,
  modelOpacity,
}: {
  url: string | null;
  ext: string | null;
  wireframe: boolean;
  clippingPlanes: THREE.Plane[];
  modelColor: string;
  modelOpacity: number;
}) {
  if (!url || !ext) {
    return <DemoHeart wireframe={wireframe} clippingPlanes={clippingPlanes} />;
  }

  const applyMaterialSettings = (object: any) => {
    object.traverse((child: any) => {
      if (child.isMesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((mat: any) => {
            mat.clippingPlanes = clippingPlanes;
            mat.clipShadows = true;
            mat.wireframe = wireframe;
            mat.color = new THREE.Color(modelColor);
            mat.transparent = true;
            mat.opacity = modelOpacity;
            mat.roughness = 0.3;
            mat.metalness = 0.1;
          });
        } else {
          child.material.clippingPlanes = clippingPlanes;
          child.material.clipShadows = true;
          child.material.wireframe = wireframe;
          child.material.color = new THREE.Color(modelColor);
          child.material.transparent = true;
          child.material.opacity = modelOpacity;
          child.material.roughness = 0.3;
          child.material.metalness = 0.1;
        }
      }
    });
  };

  if (ext === "gltf" || ext === "glb") {
    const gltf = useLoader(GLTFLoader, url);
    useEffect(() => {
      applyMaterialSettings(gltf.scene);
    }, [gltf, clippingPlanes, wireframe, modelColor, modelOpacity]);
    return <primitive object={gltf.scene} />;
  }

  if (ext === "obj") {
    const obj = useLoader(OBJLoader, url);
    useEffect(() => {
      applyMaterialSettings(obj);
    }, [obj, clippingPlanes, wireframe, modelColor, modelOpacity]);
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
          color={modelColor}
          transparent
          opacity={modelOpacity}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
    );
  }

  if (ext === "fbx") {
    const fbx = useLoader(FBXLoader, url);
    useEffect(() => {
      applyMaterialSettings(fbx);
    }, [fbx, clippingPlanes, wireframe, modelColor, modelOpacity]);
    return <primitive object={fbx} />;
  }

  return <DemoHeart wireframe={wireframe} clippingPlanes={clippingPlanes} />;
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
  const [fileName, setFileName] = useState<string>("");
  
  // Visual settings - fixed, no toggle
  const [wireframe, setWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  
  // Model settings
  const [lightIntensity, setLightIntensity] = useState(1);
  const [modelColor, setModelColor] = useState("#ff4444");
  const [modelOpacity, setModelOpacity] = useState(0.9);
  const [rotationSpeed, setRotationSpeed] = useState(1);
  
  // Clipping planes state
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
    setFileName(file.name);
  };

  const resetAll = () => {
    setClipX(0);
    setClipY(0);
    setClipZ(0);
    setLightIntensity(1);
    setModelColor("#ff4444");
    setModelOpacity(0.9);
    setRotationSpeed(1);
    setWireframe(false);
    setAutoRotate(false);
  };

  return (
    <div className="bg-gray-50 text-gray-900 min-h-screen p-6">
      <div className="max-w-7xl mx-auto flex flex-col space-y-6">
        
        {/* Simple Header - No buttons */}
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Eye className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">3D Medical Viewer</h1>
              <p className="text-sm opacity-60">
                {fileName || "Mô hình tim demo - Tải file lên để xem mô hình của bạn"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-6 flex-1">
          {/* Control Panel - Always visible */}
          <div className="w-80 space-y-4">
            
            {/* File Upload */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Tải file 3D
              </h3>
              <label className="block w-full p-3 border-2 border-dashed rounded-lg cursor-pointer text-center hover:border-blue-500 transition-colors border-gray-300">
                <input
                  type="file"
                  accept=".glb,.gltf,.obj,.stl,.fbx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="space-y-1">
                  <Upload className="w-6 h-6 mx-auto opacity-50" />
                  <div className="text-sm">Chọn file 3D</div>
                  <div className="text-xs opacity-50">STL, OBJ, GLB, GLTF, FBX</div>
                </div>
              </label>
            </div>

            {/* Quick Controls */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="font-semibold mb-3">Điều khiển nhanh</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setWireframe(!wireframe)}
                  className={`p-3 rounded-lg text-sm transition-all flex items-center justify-center gap-1 ${wireframe ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 hover:bg-gray-200'}`}
                  title="Chế độ wireframe"
                >
                  {wireframe ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span>{wireframe ? 'Wire' : 'Solid'}</span>
                </button>
                
                <button
                  onClick={() => setAutoRotate(!autoRotate)}
                  className={`p-3 rounded-lg text-sm transition-all flex items-center justify-center gap-1 ${autoRotate ? 'bg-green-500 text-white shadow-md' : 'bg-gray-100 hover:bg-gray-200'}`}
                  title="Tự động xoay"
                >
                  {autoRotate ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{autoRotate ? 'Stop' : 'Rotate'}</span>
                </button>
                
                <button
                  onClick={() => setShowGrid(!showGrid)}
                  className={`p-3 rounded-lg text-sm transition-all flex items-center justify-center gap-1 ${showGrid ? 'bg-purple-500 text-white shadow-md' : 'bg-gray-100 hover:bg-gray-200'}`}
                  title="Hiển thị lưới"
                >
                  <Grid3X3 className="w-4 h-4" />
                  <span>Grid</span>
                </button>
                
                <button
                  onClick={resetAll}
                  className="p-3 rounded-lg text-sm transition-all flex items-center justify-center gap-1 bg-gray-100 hover:bg-gray-200"
                  title="Đặt lại tất cả"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Model Appearance */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="font-semibold mb-3">Giao diện mô hình</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2 font-medium">Màu sắc</label>
                  <input
                    type="color"
                    value={modelColor}
                    onChange={(e) => setModelColor(e.target.value)}
                    className="w-full h-10 rounded-lg cursor-pointer"
                  />
                </div>
                
                <div>
                  <label className="block text-sm mb-2 font-medium">
                    Độ trong suốt: <span className="text-blue-500">{modelOpacity.toFixed(1)}</span>
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={modelOpacity}
                    onChange={(e) => setModelOpacity(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                <div>
                  <label className="block text-sm mb-2 font-medium">
                    Cường độ ánh sáng: <span className="text-yellow-500">{lightIntensity.toFixed(1)}</span>
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="3"
                    step="0.1"
                    value={lightIntensity}
                    onChange={(e) => setLightIntensity(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2 font-medium">
                    Tốc độ xoay: <span className="text-green-500">{rotationSpeed.toFixed(1)}</span>
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="5"
                    step="0.1"
                    value={rotationSpeed}
                    onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Clipping Controls */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                Cắt lát mô hình
              </h3>
              <div className="space-y-4">
                {[
                  { axis: 'X', value: clipX, setter: setClipX, color: 'text-red-500' },
                  { axis: 'Y', value: clipY, setter: setClipY, color: 'text-green-500' },
                  { axis: 'Z', value: clipZ, setter: setClipZ, color: 'text-blue-500' }
                ].map(({ axis, value, setter, color }) => (
                  <div key={axis} className="p-3 rounded-lg bg-gray-50">
                    <label className={`block text-sm mb-2 ${color} font-semibold`}>
                      Trục {axis}: <span className="font-mono">{value.toFixed(1)}</span>
                    </label>
                    <input
                      type="range"
                      min={-10}
                      max={10}
                      step={0.1}
                      value={value}
                      onChange={(e) => setter(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                ))}
                
                {(clipX !== 0 || clipY !== 0 || clipZ !== 0) && (
                  <button
                    onClick={() => {
                      setClipX(0);
                      setClipY(0);
                      setClipZ(0);
                    }}
                    className="w-full py-2 px-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
                  >
                    Xóa tất cả cắt lát
                  </button>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Hướng dẫn sử dụng
              </h3>
              <div className="text-sm space-y-1 opacity-80">
                <p>• <strong>Kéo chuột:</strong> Xoay mô hình</p>
                <p>• <strong>Cuộn chuột:</strong> Zoom in/out</p>
                <p>• <strong>Chuột phải:</strong> Pan (di chuyển)</p>
                <p>• <strong>Click mô hình:</strong> Fit to screen</p>
                <p>• <strong>Cắt lát:</strong> Xem bên trong mô hình</p>
              </div>
            </div>

          </div>

          {/* 3D Viewer */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-lg p-4 h-[700px]">
              <div className="h-full w-full rounded-lg overflow-hidden relative">
                <ErrorBoundary>
                  <Canvas
                    shadows
                    camera={{ position: [4, 4, 6], fov: 45 }}
                    gl={{ 
                      localClippingEnabled: true,
                      antialias: true,
                      alpha: true,
                      powerPreference: "high-performance"
                    }}
                    dpr={[1, 2]}
                  >
                    <color attach="background" args={['#f9fafb']} />
                    
                    <Suspense fallback={<Loading />}>
                      <Environment preset="city" />
                      <Lights lightIntensity={lightIntensity} />
                      
                      <Bounds clip fit observe margin={1.2}>
                        <CenterAndFit>
                          <Model
                            url={url}
                            ext={ext}
                            wireframe={wireframe}
                            clippingPlanes={clippingPlanes}
                            modelColor={modelColor}
                            modelOpacity={modelOpacity}
                          />
                        </CenterAndFit>
                      </Bounds>
                      
                      {showGrid && (
                        <Grid 
                          infiniteGrid 
                          fadeDistance={30}
                          fadeStrength={1}
                        />
                      )}
                      
                      <ContactShadows 
                        opacity={0.4} 
                        scale={50} 
                        blur={1} 
                        far={50} 
                        resolution={256} 
                        color="#000000"
                      />
                    </Suspense>
                    
                    <OrbitControls 
                      makeDefault 
                      autoRotate={autoRotate}
                      autoRotateSpeed={rotationSpeed}
                      enableDamping={true}
                      dampingFactor={0.05}
                      minDistance={1}
                      maxDistance={50}
                      maxPolarAngle={Math.PI}
                    />
                  </Canvas>
                </ErrorBoundary>
                
                {/* Performance indicator */}
                <div className="absolute top-2 right-2">
                  <div className="px-2 py-1 rounded text-xs bg-white/80 text-gray-600">
                    {fileName ? `Loaded: ${fileName}` : "Demo Model"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}