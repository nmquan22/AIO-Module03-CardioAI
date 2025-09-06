import React, { useState, Suspense, useEffect, useRef } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  Bounds,
  useBounds,
  Html,
  Stats,
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
  Sun, 
  Moon,
  Camera,
  Download,
  Settings,
  Info,
  Maximize,
  Minimize,
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
          });
        } else {
          child.material.clippingPlanes = clippingPlanes;
          child.material.clipShadows = true;
          child.material.wireframe = wireframe;
          child.material.color = new THREE.Color(modelColor);
          child.material.transparent = true;
          child.material.opacity = modelOpacity;
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
  
  // Visual settings
  const [wireframe, setWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showStats, setShowStats] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Model settings
  const [lightIntensity, setLightIntensity] = useState(1);
  const [modelColor, setModelColor] = useState("#ff4444");
  const [modelOpacity, setModelOpacity] = useState(0.9);
  const [rotationSpeed, setRotationSpeed] = useState(1);
  
  // Clipping planes state
  const [clipX, setClipX] = useState(0);
  const [clipY, setClipY] = useState(0);
  const [clipZ, setClipZ] = useState(0);
  
  // UI state
  const [showControlPanel, setShowControlPanel] = useState(true);

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

  const takeScreenshot = () => {
    // This would need to be implemented with canvas export
    alert("Tính năng chụp ảnh sẽ được thêm trong phiên bản tiếp theo!");
  };

  return (
    <div className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} transition-colors duration-300 ${isFullscreen ? 'fixed inset-0 z-50' : 'p-6'}`}>
      <div className={`${isFullscreen ? 'h-full' : 'max-w-7xl mx-auto'} flex flex-col space-y-6`}>
        
        {/* Header */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
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
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              
              <button
                onClick={() => setShowControlPanel(!showControlPanel)}
                className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                <Settings className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-6 flex-1">
          {/* Control Panel */}
          {showControlPanel && (
            <div className={`w-80 space-y-4 ${isFullscreen ? 'h-full overflow-y-auto' : ''}`}>
              
              {/* File Upload */}
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4`}>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Tải file 3D
                </h3>
                <label className={`block w-full p-3 border-2 border-dashed rounded-lg cursor-pointer text-center hover:border-blue-500 transition-colors ${darkMode ? 'border-gray-600 hover:border-blue-400' : 'border-gray-300'}`}>
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
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4`}>
                <h3 className="font-semibold mb-3">Điều khiển nhanh</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setWireframe(!wireframe)}
                    className={`p-2 rounded text-sm ${wireframe ? 'bg-blue-500 text-white' : (darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200')}`}
                  >
                    {wireframe ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  
                  <button
                    onClick={() => setAutoRotate(!autoRotate)}
                    className={`p-2 rounded text-sm ${autoRotate ? 'bg-green-500 text-white' : (darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200')}`}
                  >
                    {autoRotate ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  
                  <button
                    onClick={() => setShowGrid(!showGrid)}
                    className={`p-2 rounded text-sm ${showGrid ? 'bg-purple-500 text-white' : (darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200')}`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={resetAll}
                    className={`p-2 rounded text-sm ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Model Appearance */}
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4`}>
                <h3 className="font-semibold mb-3">Giao diện mô hình</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm mb-1">Màu sắc</label>
                    <input
                      type="color"
                      value={modelColor}
                      onChange={(e) => setModelColor(e.target.value)}
                      className="w-full h-8 rounded"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm mb-1">Độ trong suốt: {modelOpacity.toFixed(1)}</label>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.1"
                      value={modelOpacity}
                      onChange={(e) => setModelOpacity(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm mb-1">Cường độ ánh sáng: {lightIntensity.toFixed(1)}</label>
                    <input
                      type="range"
                      min="0.1"
                      max="3"
                      step="0.1"
                      value={lightIntensity}
                      onChange={(e) => setLightIntensity(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Clipping Controls */}
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4`}>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Sliders className="w-4 h-4" />
                  Cắt lát mô hình
                </h3>
                <div className="space-y-3">
                  {[
                    { axis: 'X', value: clipX, setter: setClipX, color: 'text-red-500' },
                    { axis: 'Y', value: clipY, setter: setClipY, color: 'text-green-500' },
                    { axis: 'Z', value: clipZ, setter: setClipZ, color: 'text-blue-500' }
                  ].map(({ axis, value, setter, color }) => (
                    <div key={axis}>
                      <label className={`block text-sm mb-1 ${color} font-medium`}>
                        {axis}: {value.toFixed(1)}
                      </label>
                      <input
                        type="range"
                        min={-20}
                        max={20}
                        step={0.1}
                        value={value}
                        onChange={(e) => setter(parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-200'} border rounded-lg p-4`}>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Hướng dẫn sử dụng
                </h3>
                <div className="text-sm space-y-1 opacity-80">
                  <p>• Kéo chuột: Xoay mô hình</p>
                  <p>• Cuộn chuột: Zoom in/out</p>
                  <p>• Chuột phải: Pan (di chuyển)</p>
                  <p>• Click mô hình: Fit to screen</p>
                </div>
              </div>

            </div>
          )}

          {/* 3D Viewer */}
          <div className="flex-1">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-4 h-full ${isFullscreen ? 'h-screen' : 'h-[600px]'}`}>
              <div className="h-full w-full rounded-lg overflow-hidden">
                <ErrorBoundary>
                  <Canvas
                    shadows
                    camera={{ position: [4, 4, 6], fov: 45 }}
                    gl={{ 
                      localClippingEnabled: true,
                      antialias: true,
                      alpha: true 
                    }}
                  >
                    <color attach="background" args={[darkMode ? '#1f2937' : '#f9fafb']} />
                    
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
                      
                      {showGrid && <Grid infiniteGrid />}
                      <ContactShadows opacity={0.5} scale={50} blur={1} far={50} resolution={256} color={darkMode ? "#ffffff" : "#000000"} />
                    </Suspense>
                    
                    <OrbitControls 
                      makeDefault 
                      autoRotate={autoRotate}
                      autoRotateSpeed={rotationSpeed}
                      enableDamping={true}
                      dampingFactor={0.05}
                    />
                    
                    {showStats && <Stats />}
                  </Canvas>
                </ErrorBoundary>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}