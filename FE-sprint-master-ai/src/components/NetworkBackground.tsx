import { Suspense, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { AdaptiveDpr, Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

function HyperBlueField({ count = 2200 }) {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const base = new THREE.Color("#1E90FF");
    const glow = new THREE.Color("#4CCBFF");
    const blended = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const radius = 11 * Math.cbrt(Math.random());
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      const blendFactor = Math.max(0, Math.min(1, (z + 11) / 22));
      blended.lerpColors(base, glow, blendFactor);
      col[i * 3] = blended.r;
      col[i * 3 + 1] = blended.g;
      col[i * 3 + 2] = blended.b;
    }

    return [pos, col];
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.getElapsedTime();
    pointsRef.current.rotation.y = t * 0.045;
    pointsRef.current.rotation.x = Math.sin(t * 0.2) * 0.07;
  });

  return (
    <Points ref={pointsRef} positions={positions} colors={colors} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        vertexColors
        size={0.026}
        sizeAttenuation
        depthWrite={false}
        opacity={0.7}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

export function NetworkBackground() {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none bg-[#050505]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_20%,rgba(30,144,255,0.18)_0%,rgba(5,5,5,0.95)_55%,rgba(5,5,5,1)_100%)]" />

      <div className="absolute inset-0">
        <Canvas
          dpr={[1, 1.5]}
          gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
          camera={{ position: [0, 0, 9], fov: 58 }}
        >
          <Suspense fallback={null}>
            <AdaptiveDpr pixelated />
            <fog attach="fog" args={["#050505", 6, 16]} />
            <HyperBlueField />
          </Suspense>
        </Canvas>
      </div>

      <motion.div
        initial={{ opacity: 0.35, y: 0 }}
        animate={{ opacity: [0.2, 0.45, 0.2], y: [0, -6, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-6 right-6 text-[11px] tracking-[0.22em] uppercase text-[#59BCFF]/65"
      >
        Creativity never ends
      </motion.div>
    </div>
  );
}

