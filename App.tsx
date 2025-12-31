
import React, { useState, useRef, useMemo } from 'react';
import { 
  Activity, Building2, Cpu, ShieldCheck, CheckCircle2, 
  Box, AlertTriangle, Radio, Play, RefreshCw, Layers, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Float, PerspectiveCamera, Html, ContactShadows, MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';

// --- 3D 辅助组件：高对比度、低密度城市底座 ---

const Neighborhood: React.FC = () => {
  const buildings = useMemo(() => {
    const temp = [];
    // 显著减少数量，从 140 减到 65，提升性能并让画面更清爽
    for (let i = 0; i < 65; i++) {
      const angle = Math.random() * Math.PI * 2;
      // 增加中心避让半径，从 8 扩大到 15，让主楼“独立”出来
      const radius = 15 + Math.random() * 45;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      const h = 4 + Math.random() * 15;
      const w = 3 + Math.random() * 4;
      const d = 3 + Math.random() * 4;
      const hasLights = Math.random() > 0.5;
      
      temp.push({ position: [x, h / 2 - 0.5, z], args: [w, h, d], id: i, hasLights });
    }
    return temp;
  }, []);

  return (
    <group>
      {buildings.map((b) => (
        <group key={b.id} position={b.position as [number, number, number]}>
          <mesh>
            <boxGeometry args={b.args as [number, number, number]} />
            <meshStandardMaterial 
              color="#273444" 
              roughness={0.4}
              metalness={0.5}
              emissive="#0f172a" 
              emissiveIntensity={0.2}
            />
            <lineSegments>
              <edgesGeometry args={[new THREE.BoxGeometry(...(b.args as [number, number, number]))]} />
              <lineBasicMaterial color="#475569" transparent opacity={0.3} />
            </lineSegments>
          </mesh>
          {b.hasLights && (
            <mesh position={[0, b.args[1] * 0.2, b.args[2] * 0.51]}>
              <planeGeometry args={[0.4, 0.4]} />
              <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} />
            </mesh>
          )}
        </group>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.48, 0]}>
        <planeGeometry args={[300, 300]} />
        <meshStandardMaterial color="#0f172a" roughness={0.1} metalness={0.9} />
      </mesh>
    </group>
  );
};

const MainBuilding: React.FC<{ step: number }> = ({ step }) => {
  return (
    <group position={[0, 2.5, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[4, 6, 2]} />
        <meshStandardMaterial 
          color={step >= 1 ? "#0ea5e9" : "#475569"} 
          transparent 
          opacity={step >= 1 ? 0.7 : 1} 
          roughness={0.01}
          metalness={1}
        />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(4.05, 6.05, 2.05)]} />
        <lineBasicMaterial color={step >= 1 ? "#38bdf8" : "#94a3b8"} opacity={1} />
      </lineSegments>
      
      {Array.from({ length: 5 }).map((_, floor) => (
        Array.from({ length: 3 }).map((_, col) => (
          <mesh key={`${floor}-${col}`} position={[-1.2 + col * 1.2, -2 + floor * 1.2, 1.02]}>
            <planeGeometry args={[0.8, 0.8]} />
            <meshStandardMaterial 
              color={step >= 1 ? "#7dd3fc" : "#334155"} 
              emissive={step >= 1 ? "#38bdf8" : "#000000"}
              emissiveIntensity={step >= 1 ? 5 : 0}
              transparent
              opacity={0.9}
            />
          </mesh>
        ))
      ))}
    </group>
  );
};

const SimulationScene: React.FC<{ step: number }> = ({ step }) => {
  const elevatorRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (elevatorRef.current) {
      const targetScale = step >= 2 ? 1 : 0;
      elevatorRef.current.scale.y = THREE.MathUtils.lerp(elevatorRef.current.scale.y, targetScale, 0.08);
    }
  });

  return (
    <group>
      <gridHelper args={[120, 40, 0x334155, 0x1e293b]} position={[0, -0.47, 0]} />
      <Neighborhood />
      <MainBuilding step={step} />

      {step === 1 && (
        <Float speed={4} rotationIntensity={1} floatIntensity={1}>
          <mesh position={[0, 4, 3]}>
            <sphereGeometry args={[0.7, 32, 32]} />
            <MeshWobbleMaterial color="#f43f5e" factor={0.6} speed={2} emissive="#f43f5e" emissiveIntensity={3} />
          </mesh>
        </Float>
      )}

      {step >= 2 && (
        <group ref={elevatorRef} position={[0, 2.5, 1.35]} scale={[1, 0, 1]}>
          <mesh castShadow>
            <boxGeometry args={[1.6, 6, 0.9]} />
            <meshStandardMaterial color="#0ea5e9" transparent opacity={0.8} emissive="#38bdf8" emissiveIntensity={3} />
          </mesh>
          <Html position={[1.4, 2.5, 0]} distanceFactor={12}>
            <div className="bg-cyan-500 text-white px-2 py-1 rounded text-[10px] font-bold border-2 border-cyan-300 shadow-[0_0_20px_#0ea5e9]">
              AGENT_BIM: MODULE_GEN
            </div>
          </Html>
        </group>
      )}

      {step === 3 && (
        <group position={[0, -1.8, 3]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.4, 0.4, 40]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={4} />
          </mesh>
          <Html position={[0, 2, 0]} center>
            <div className="bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-2xl flex items-center gap-2 border-2 border-red-400 whitespace-nowrap">
              <AlertTriangle size={16} className="animate-pulse" /> 关键冲突：地下管网侵占 (-1.2m)
            </div>
          </Html>
        </group>
      )}

      {step === 4 && (
        <group position={[0, 2.5, 1.35]}>
           <mesh>
              <boxGeometry args={[1.7, 6.2, 1.0]} />
              <meshStandardMaterial color="#ffffff" metalness={1} roughness={0} emissive="#ffffff" emissiveIntensity={0.5} />
           </mesh>
        </group>
      )}
      <ContactShadows position={[0, -0.46, 0]} opacity={0.8} scale={100} blur={2.5} far={15} />
    </group>
  );
};

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState<string[]>(["[系统] 初始化 CIM+BIM 联合引擎...", "[系统] 场景加载完成，等待指令。"]);
  const [isProcessing, setIsProcessing] = useState(false);

  const steps = [
    { title: "全域感知", desc: "居民诉求与 CIM 底座自动映射", icon: <Radio size={18}/> },
    { title: "智能建模", desc: "语义转换 BIM 参数化模型生成", icon: <Cpu size={18}/> },
    { title: "冲突仿真", desc: "CIM+BIM 空间博弈与管路冲突自纠", icon: <Layers size={18}/> },
    { title: "价值兑现", desc: "生成 ROI 财务算账及数字台账", icon: <CheckCircle2 size={18}/> },
  ];

  const addLog = (msg: string) => {
    setLogs(prev => [...prev.slice(-15), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleNext = async () => {
    if (currentStep >= 4) return;
    setIsProcessing(true);
    const nextStep = currentStep + 1;
    
    if (nextStep === 1) {
      addLog("扫描北京市丰台区 CIM 实时诉求...");
      await new Promise(r => setTimeout(r, 600));
      addLog("定位目标单元：晨光里小区。");
    } else if (nextStep === 2) {
      addLog("启动 Agent-BIM 构件解析器...");
      await new Promise(r => setTimeout(r, 800));
      addLog("成功生成 LOD 400 级构件实体。");
    } else if (nextStep === 3) {
      addLog("执行全场景空间冲突校核...");
      await new Promise(r => setTimeout(r, 1000));
      addLog("检测到重大硬冲突：燃气管线。");
      addLog("智能体自主修正：坐标偏移补偿。");
    } else if (nextStep === 4) {
      addLog("生成数字化交付报告...");
      await new Promise(r => setTimeout(r, 600));
      addLog("完成资产入库。");
    }

    setCurrentStep(nextStep);
    setIsProcessing(false);
  };

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-[#020617] text-slate-100 font-sans">
      
      {/* Header: 调整内边距，使内容下移，增加整体高度以适应偏移 */}
      <header className="flex-none z-50 h-28 glass-panel border-b border-white/10 px-8 flex flex-col pt-8 pb-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-cyan-600 rounded-lg shadow-lg">
              <Building2 size={20} className="text-white" />
            </div>
            <div className="overflow-hidden">
              <h1 className="text-xl font-bold tracking-tight truncate">CIM+BIM 城市更新：智能体仿真系统</h1>
              <p className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase font-bold truncate opacity-80">Kernel 6.0 Stable / High-Res Simulation</p>
            </div>
          </div>
          <button 
            onClick={() => setCurrentStep(0)}
            className="flex-none px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold rounded border border-white/10 transition-colors"
          >
            重置环境
          </button>
        </div>

        {/* 进度条：位置跟随第一行下移 */}
        <div className="flex justify-between relative max-w-xl mx-auto w-full px-2">
          <div className="absolute top-3 left-0 w-full h-1 bg-slate-800 -z-10 rounded-full" />
          <motion.div 
            className="absolute top-3 left-0 h-1 bg-cyan-400 -z-10 shadow-[0_0_15px_#22d3ee] rounded-full" 
            initial={{ width: "0%" }}
            animate={{ width: `${(currentStep / 4) * 100}%` }}
          />
          {steps.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all duration-500 ${
                currentStep > i ? 'bg-cyan-500 border-cyan-300 shadow-lg' : 
                currentStep === i + 1 ? 'bg-cyan-500/20 border-cyan-400 scale-110' : 
                'bg-slate-900 border-slate-700 text-slate-500'
              }`}>
                {currentStep > i ? <CheckCircle2 size={14} /> : s.icon}
              </div>
              <span className={`text-[8px] font-bold uppercase ${currentStep > i ? 'text-cyan-400' : 'text-slate-600'}`}>{s.title}</span>
            </div>
          ))}
        </div>
      </header>

      {/* Main Body: 弹性布局 */}
      <main className="flex-1 min-h-0 flex relative bg-[#030816]">
        
        {/* 3D View: 强制充满 */}
        <div className="flex-1 min-w-0 relative h-full">
          <Canvas shadows dpr={[1, 2]}>
            <fog attach="fog" args={['#030816', 30, 150]} />
            <PerspectiveCamera makeDefault position={[35, 25, 35]} fov={28} />
            <OrbitControls enableZoom={true} autoRotate={currentStep === 0} maxPolarAngle={Math.PI / 2.1} minDistance={20} maxDistance={100} />
            
            {/* 使用纯灯光模拟环境，不依赖外部文件 */}
            <ambientLight intensity={1.2} />
            <hemisphereLight intensity={1.5} color="#38bdf8" groundColor="#0f172a" />
            <directionalLight position={[40, 60, 40]} intensity={3} castShadow shadow-mapSize={[2048, 2048]} />
            <pointLight position={[-30, 30, -30]} intensity={2} color="#0ea5e9" />
            
            <SimulationScene step={currentStep} />
            <Stars radius={150} depth={50} count={3000} factor={4} saturation={0} fade />
          </Canvas>

          {/* 信息标签：位置优化，防止遮挡 */}
          <div className="absolute bottom-6 left-6 pointer-events-none">
             <div className="glass-panel p-4 rounded-xl border-l-4 border-cyan-500 shadow-2xl max-w-xs">
                <div className="flex items-center gap-3">
                  <Box size={20} className="text-cyan-400" />
                  <div>
                    <div className="text-[10px] text-cyan-400/70 font-bold uppercase tracking-widest">Active Base</div>
                    <div className="text-sm font-bold text-white truncate">北京 · 晨光里小区更新单元</div>
                  </div>
                </div>
             </div>
          </div>
          
          <div className="absolute top-6 right-6 flex flex-col items-end gap-1.5 font-mono text-[9px] text-slate-400 bg-black/60 p-3 rounded-lg border border-white/10">
            <div>COORD: <span className="text-cyan-400">39.8519 / 116.3762</span></div>
            <div>STATUS: <span className="text-cyan-400">SYNCED</span></div>
            <div>LOD: <span className="text-cyan-400">400_ULTRA</span></div>
          </div>
        </div>

        {/* Right Panel: 使用百分比宽度，更具响应式 */}
        <aside className="w-[360px] lg:w-[24vw] flex-none flex flex-col glass-panel border-l border-white/10 min-h-0">
          <div className="flex-1 overflow-y-auto custom-scroll p-6 lg:p-8 space-y-8">
            <AnimatePresence mode="wait">
              {currentStep === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center text-center space-y-6"
                >
                  <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center border border-cyan-500/20 shadow-inner">
                    <Play size={32} className="text-cyan-400 ml-1" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold text-white">仿真引擎就绪</h2>
                    <p className="text-xs text-slate-400 leading-relaxed">请通过下方控制面板启动 CIM+BIM 联合仿真实验。</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                  className="space-y-8"
                >
                  <div className="space-y-3">
                    <span className="inline-block px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded text-[10px] font-bold uppercase border border-cyan-500/30">Phase 0{currentStep}</span>
                    <h2 className="text-3xl font-bold text-white tracking-tight">{steps[currentStep-1].title}</h2>
                    <p className="text-slate-400 text-sm leading-relaxed">{steps[currentStep-1].desc}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5">
                        <div className="text-[9px] text-slate-500 uppercase font-bold mb-1">构件精度</div>
                        <div className="text-xl font-bold text-cyan-400 font-mono">LOD 400</div>
                     </div>
                     <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5">
                        <div className="text-[9px] text-slate-500 uppercase font-bold mb-1">响应延时</div>
                        <div className="text-xl font-bold text-cyan-400 font-mono">1.2ms</div>
                     </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-white/5">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                       <Zap size={12} className="text-yellow-400" /> Stack Processing
                    </h3>
                    <div className="space-y-3">
                      {steps.map((s, idx) => (
                        <div key={idx} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${currentStep > idx ? 'bg-green-500/10 border-green-500/30' : currentStep === idx + 1 ? 'bg-cyan-500/10 border-cyan-500/40' : 'bg-slate-900/20 border-white/5 opacity-30'}`}>
                           <div className={`shrink-0 w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${currentStep > idx ? 'bg-green-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                             {currentStep > idx ? <CheckCircle2 size={14} /> : idx + 1}
                           </div>
                           <span className={`text-xs font-bold ${currentStep > idx ? 'text-slate-200' : currentStep === idx + 1 ? 'text-cyan-400' : 'text-slate-600'}`}>{s.title}单元</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex-none h-48 bg-black/80 border-t border-white/10 p-5 font-mono text-[10px] flex flex-col gap-3">
             <div className="flex justify-between items-center text-cyan-400 font-bold border-b border-white/10 pb-2">
                <span className="flex items-center gap-2 uppercase tracking-widest"><Activity size={12} /> Console Log</span>
                <span className="text-[8px] bg-cyan-500 text-black px-1 rounded">LIVE</span>
             </div>
             <div className="flex-1 overflow-y-auto custom-scroll space-y-2 pr-2">
               {logs.map((log, i) => (
                 <div key={i} className={`flex gap-3 leading-relaxed ${log.includes("警告") || log.includes("冲突") ? "text-red-400" : "text-cyan-400/70"}`}>
                   <span className="opacity-30 shrink-0 select-none">[{i.toString().padStart(2, '0')}]</span>
                   <span className="break-words">{log}</span>
                 </div>
               ))}
               <div className="animate-pulse inline-block w-2 h-3.5 bg-cyan-500 align-middle ml-1" />
             </div>
          </div>

          <div className="flex-none p-6 lg:p-8">
            <button 
              disabled={isProcessing || currentStep === 4}
              onClick={handleNext}
              className={`w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-4 transition-all active:scale-[0.96] shadow-2xl ${
                currentStep === 4 ? 'bg-green-600 text-white' : 
                isProcessing ? 'bg-cyan-800 cursor-wait' : 'bg-cyan-500 hover:bg-cyan-400 text-white'
              }`}
            >
              {isProcessing ? (
                <><RefreshCw size={24} className="animate-spin" /> 计算中...</>
              ) : currentStep === 4 ? (
                <><ShieldCheck size={24} /> 流程闭环</>
              ) : (
                <><Play size={24} fill="currentColor" /> {currentStep === 0 ? '启动仿真' : '执行下一步'}</>
              )}
            </button>
          </div>
        </aside>
      </main>

      <footer className="flex-none h-12 glass-panel border-t border-white/10 px-8 flex items-center justify-between text-[10px] text-slate-500 font-mono tracking-widest uppercase">
        <div className="flex gap-8 overflow-hidden">
          <span className="flex items-center gap-2 whitespace-nowrap"><div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" /> SYSTEM_OK</span>
          <span className="hidden sm:flex items-center gap-2 whitespace-nowrap"><div className="w-2 h-2 rounded-full bg-cyan-400" /> GPU_ACCEL</span>
        </div>
        <div className="flex items-center gap-6">
           <span className="hidden lg:inline text-cyan-600 font-bold">CORE v6.0_STABLE</span>
           <span className="opacity-40 whitespace-nowrap">© DIGITAL TWIN INTERFACE</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
