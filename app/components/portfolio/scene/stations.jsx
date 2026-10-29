"use client";
import { createContext, useContext, useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CatmullRomCurve3, MathUtils, TubeGeometry, Vector3 } from "three";
import { STATIONS, stationWeight } from "../motion/journey.mjs";

// ── Context ──
export const SceneContext = createContext(null);
const useScene = () => useContext(SceneContext);


function fibonacciSphere(count) {
  const points = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const theta = golden * i;
    points.push([Math.cos(theta) * radius, y, Math.sin(theta) * radius]);
  }
  return points;
}

// ── Building blocks ──
function Station({ index, center = 0, arrive = 0.8, leave = 0.8, children }) {
  const { stateRef, compact } = useScene();
  const ref = useRef(null);
  const [x, y, z] = STATIONS[index].anchor;
  const base = compact ? 0.72 : 1;
  useFrame(() => {
    const journey = stateRef.current.journey;
    const weight = stationWeight(journey, index, journey > index ? leave : arrive);
    ref.current.visible = weight > 0.02;
    ref.current.scale.setScalar(base * (0.86 + 0.14 * weight));
  });
  return (
    <group ref={ref} position={[x - (compact ? center * base : 0), y + (compact ? 1.1 : 0), z]}>
      {children}
    </group>
  );
}

export function Globe({ settle = 0, radius = 1.6, ringFactors = [1.45, 1.85, 2.3], nodeCount = 18 }) {
  const { resources, timeRef, pointerRef, enabled } = useScene();
  const { geometry, material } = resources;
  const spin = useRef(null);
  const rings = useRef([]);
  const nodes = useMemo(() => fibonacciSphere(nodeCount), [nodeCount]);
  useFrame(() => {
    const t = timeRef.current;
    spin.current.rotation.y = t * 0.12 + (enabled ? pointerRef.current.x * 0.25 : 0);
    spin.current.rotation.x = enabled ? -pointerRef.current.y * 0.12 : 0;
    rings.current.forEach((ring, i) => {
      if (!ring) return;
      ring.rotation.z = t * (0.1 + i * 0.05) * (i % 2 ? -1 : 1);
    });
  });
  return (
    <group>
      <group ref={spin}>
        <mesh geometry={geometry.sphere} material={material.earth} scale={radius} />
        <mesh geometry={geometry.sphere} material={material.wire} scale={radius * 1.005} />
        <points geometry={geometry.land} material={material.land} scale={radius * 1.01} />
        {nodes.map((point, i) => (
          <mesh
            key={i}
            geometry={geometry.node}
            material={i % 3 ? material.glow : material.glowCyan}
            position={point.map((v) => v * radius * 1.015)}
            scale={0.022}
          />
        ))}
      </group>
      <mesh geometry={geometry.sphere} material={material.rim} scale={radius * 1.05} />
      <mesh geometry={geometry.sphere} material={material.halo} scale={radius * 1.3} />
      {ringFactors.map((factor, i) => (
        <group
          key={factor}
          ref={(node) => {
            rings.current[i] = node;
          }}
          rotation={[1.25 - i * 0.14, 0.3 + i * 0.35, 0.1 * i]}
          scale={radius * factor * (1 + settle * (1 + i * 0.25))}
        >
          <mesh geometry={geometry.ring} material={i === 1 ? material.ringDim : material.ring} />
        </group>
      ))}
    </group>
  );
}

function Floater({ speed = 1, amount = 0.15, phase = 0, children, ...props }) {
  const { timeRef } = useScene();
  const ref = useRef(null);
  useFrame(() => {
    ref.current.position.y = (props.position?.[1] ?? 0) + Math.sin(timeRef.current * speed + phase) * amount;
  });
  return (
    <group ref={ref} {...props}>
      {children}
    </group>
  );
}

// ── Hero ──
function Platform(props) {
  const { resources, timeRef } = useScene();
  const { geometry, material } = resources;
  const glow = useRef(null);
  useFrame(() => {
    glow.current.scale.setScalar(3.5 + Math.sin(timeRef.current * 1.2) * 0.06);
  });
  return (
    <group {...props}>
      <mesh geometry={geometry.disc} material={material.metal} scale={[3.1, 0.22, 3.1]} position={[0, -0.18, 0]} />
      <mesh geometry={geometry.disc} material={material.glass} scale={[2.75, 0.06, 2.75]} position={[0, 0.02, 0]} />
      <group rotation={[Math.PI / 2, 0, 0]} position={[0, 0.08, 0]}>
        <mesh geometry={geometry.ringThick} material={material.ring} scale={2.7} />
        <mesh geometry={geometry.ringThick} material={material.ringDim} scale={3.25} />
        <mesh geometry={geometry.ring} material={material.ring} scale={2.2} />
      </group>
      <mesh ref={glow} geometry={geometry.sphere} material={material.halo} scale={[3.5, 0.45, 3.5]} />
    </group>
  );
}

function GlassCube({ size = 0.5, ...props }) {
  const { resources } = useScene();
  const { geometry, material } = resources;
  return (
    <group {...props} scale={size}>
      <mesh geometry={geometry.box} material={material.glass} />
      <lineSegments geometry={geometry.boxEdges} material={material.edge} />
    </group>
  );
}

const HERO_VISUAL = ["#hero", ".hero-visual"].join(" ");

// Pins a group to a DOM element: the group sits `depth` units in front of the
// camera, centred on the element, and one world unit equals `fill` of its height.
function DomAnchor({ selector, depth = 9, fill = 0.43, anchorY = 0.45, children }) {
  const { stateRef } = useScene();
  const ref = useRef(null);
  const element = useRef(null);
  const ray = useMemo(() => new Vector3(), []);
  useFrame(({ camera, gl }) => {
    const node = ref.current;
    element.current ??= document.querySelector(selector);
    const target = element.current;
    if (!target || stateRef.current.journey > 1.2) {
      node.visible = false;
      return;
    }
    const box = target.getBoundingClientRect();
    const view = gl.domElement.getBoundingClientRect();
    node.visible = box.bottom > view.top && box.height > 0;
    if (!node.visible) return;
    const x = ((box.left + box.width / 2 - view.left) / view.width) * 2 - 1;
    const y = -(((box.top + box.height * anchorY - view.top) / view.height) * 2 - 1);
    camera.updateMatrixWorld();
    ray.set(x, y, 0.5).unproject(camera).sub(camera.position).normalize();
    node.position.copy(camera.position).addScaledVector(ray, depth);
    const unitsPerPixel = (2 * depth * Math.tan(MathUtils.degToRad(camera.fov / 2))) / view.height;
    node.scale.setScalar(box.height * fill * unitsPerPixel);
  });
  return <group ref={ref}>{children}</group>;
}

export function HeroStation() {
  const { profile } = useScene();
  return (
    <DomAnchor selector={HERO_VISUAL}>
      <Globe radius={1} ringFactors={[1.25, 1.5]} nodeCount={profile.tiles > 6 ? 64 : 28} />
      <Platform position={[0, -1.1, 0.1]} scale={0.3} />
      <Floater speed={0.5} amount={0.05} phase={2} position={[0.98, -0.72, 0.6]}>
        <GlassCube size={0.13} rotation={[0.5, 0.7, 0.1]} />
      </Floater>
      <Floater speed={0.7} amount={0.05} phase={1} position={[1.16, -0.86, 0.5]}>
        <GlassCube size={0.1} rotation={[0.3, 0.4, 0.2]} />
      </Floater>
    </DomAnchor>
  );
}

// ── About ──
export function AboutStation() {
  return (
    <Station index={1}>
      <group position={[2.2, 1.6, -3]}>
        <Globe radius={1.3} ringFactors={[1.5, 1.9]} nodeCount={20} />
      </group>
    </Station>
  );
}

// ── Technology ──
export function SkillsStation() {
  const { resources, timeRef } = useScene();
  const { geometry, material } = resources;
  const sweep = useRef(null);
  useFrame(() => {
    sweep.current.rotation.z = timeRef.current * 0.08;
  });
  return (
    <Station index={2}>
      <group position={[0.6, 1.3, -2]}>
        <Globe radius={1.25} ringFactors={[1.5, 1.9]} nodeCount={24} />
      </group>
      <group ref={sweep} position={[0.6, 1.3, -2]} rotation={[1.4, 0, 0.1]}>
        <mesh geometry={geometry.ring} material={material.ringDim} scale={4.3} />
      </group>
      <mesh geometry={geometry.terrain} material={material.mountain} position={[0, -6.5, -14]} />
    </Station>
  );
}

// ── Projects ──
function ProjectScreen({ index }) {
  const { resources, stateRef } = useScene();
  const { geometry, material } = resources;
  const group = useRef(null);
  const faces = useMemo(
    () => ({
      face: material.screen.clone(),
      edge: material.edge.clone(),
      bar: material.bar.clone(),
    }),
    [material],
  );
  useEffect(
    () => () => {
      faces.face.dispose();
      faces.edge.dispose();
      faces.bar.dispose();
    },
    [faces],
  );
  useFrame(() => {
    const d = index - stateRef.current.focus;
    const far = Math.abs(d);
    const node = group.current;
    node.visible = far < 2.6;
    node.position.set(d * 4.4, 1.2 - far * 0.12, -4 - far * 3.2);
    node.rotation.y = -d * 0.5;
    node.scale.setScalar(1 - Math.min(far, 2) * 0.1);
    const fade = 1 - Math.min(1, far) * 0.7;
    faces.face.opacity = fade * 0.05;
    faces.face.transparent = true;
    faces.edge.opacity = 0.04 + fade * 0.1;
    faces.bar.opacity = 0;
  });
  return (
    <group ref={group}>
      <group scale={[4, 2.5, 1]}>
        <mesh geometry={geometry.plane} material={faces.face} />
        <lineSegments geometry={geometry.edges} material={faces.edge} />
        <mesh geometry={geometry.plane} material={faces.bar} position={[0, 0.43, 0.003]} scale={[0.96, 0.08, 1]} />
        {[0, 1, 2].map((i) => (
          <mesh
            key={i}
            geometry={geometry.plane}
            material={faces.bar}
            position={[-0.25 + i * 0.01, 0.2 - i * 0.18, 0.003]}
            scale={[0.4 + (i % 2) * 0.1, 0.1, 1]}
          />
        ))}
        <mesh
          geometry={geometry.plane}
          material={faces.bar}
          position={[0.27, -0.05, 0.003]}
          scale={[0.34, 0.5, 1]}
        />
      </group>
    </group>
  );
}

export function ProjectsStation() {
  const { stateRef, resources } = useScene();
  const { geometry, material } = resources;
  const count = Math.min(6, Math.max(1, stateRef.current.projectCount));
  return (
    <Station index={3}>
      <group position={[0, 0.4, 0]}>
        {Array.from({ length: count }, (_, i) => (
          <ProjectScreen key={i} index={i} />
        ))}
        <mesh geometry={geometry.terrain} material={material.ground} position={[0, -4.6, -12]} />
        <mesh geometry={geometry.terrain} material={material.mountain} position={[0, -4.55, -12]} />
      </group>
    </Station>
  );
}

// ── Experience ──
const PATH_POINTS = [
  [-5, -2.2, 2],
  [-2.6, -0.6, 0],
  [-0.4, -1.4, -2.5],
  [1.8, 0.6, -3.5],
  [3.8, 1.2, -5],
  [5.4, 2.4, -7],
];

export function ExperienceStation() {
  const { resources, stateRef } = useScene();
  const { geometry, material } = resources;
  const curve = useMemo(() => new CatmullRomCurve3(PATH_POINTS.map((p) => new Vector3(...p))), []);
  const tube = useMemo(() => new TubeGeometry(curve, 96, 0.035, 6, false), [curve]);
  const lit = useMemo(() => new TubeGeometry(curve, 96, 0.05, 6, false), [curve]);
  useEffect(
    () => () => {
      tube.dispose();
      lit.dispose();
    },
    [tube, lit],
  );
  const count = Math.min(8, Math.max(2, stateRef.current.pathCount));
  const markers = useRef([]);
  const bead = useRef(null);
  const total = lit.index.count;
  useFrame(() => {
    const progress = stateRef.current.pathProgress;
    lit.setDrawRange(0, Math.floor((progress * total) / 3) * 3);
    const active = progress * (count - 1);
    markers.current.forEach((marker, i) => {
      if (!marker) return;
      const near = Math.max(0, 1 - Math.abs(i - active));
      marker.scale.setScalar(0.14 + near * 0.16);
      marker.material = i <= active + 0.05 ? material.glow : material.dim;
    });
    bead.current.position.copy(curve.getPoint(progress));
  });
  return (
    <Station index={4} leave={0.3}>
      <mesh geometry={tube} material={material.dim} />
      <mesh geometry={lit} material={material.glow} />
      {Array.from({ length: count }, (_, i) => (
        <mesh
          key={i}
          ref={(node) => {
            markers.current[i] = node;
          }}
          geometry={geometry.octa}
          material={material.dim}
          position={curve.getPoint(count === 1 ? 0 : i / (count - 1))}
        />
      ))}
      <mesh ref={bead} geometry={geometry.node} material={material.glowCyan} scale={0.11} />
      <mesh geometry={geometry.terrain} material={material.ground} position={[0, -4.2, -8]} />
      <mesh geometry={geometry.terrain} material={material.mountain} position={[0, -4.15, -8]} />
    </Station>
  );
}

// ── Contact ──
export function ContactStation() {
  const { stateRef } = useScene();
  const globe = useRef(null);
  const settle = useRef({ value: 1 });
  useFrame(() => {
    const target = 1 - stationWeight(stateRef.current.journey, 5, 1.2);
    settle.current.value = MathUtils.damp(settle.current.value, target, 3, 0.016);
    globe.current.scale.setScalar(0.8 + (1 - settle.current.value) * 0.35);
  });
  return (
    <Station index={5} center={3} arrive={0.4}>
      <group ref={globe} position={[3, 0, -1]}>
        <Globe radius={1.5} ringFactors={[1.4, 1.75]} settle={0.1} />
      </group>
    </Station>
  );
}

// ── Particles ──
export function Particles() {
  const { resources, profile } = useScene();
  const positions = useMemo(() => {
    let seed = 91;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    const result = new Float32Array(profile.particleCount * 3);
    for (let i = 0; i < profile.particleCount; i++) {
      result[i * 3] = (random() - 0.5) * 22;
      result[i * 3 + 1] = (random() - 0.5) * 12;
      result[i * 3 + 2] = 8 - random() * 96;
    }
    return result;
  }, [profile.particleCount]);
  const geometryRef = useRef(null);
  useEffect(() => () => geometryRef.current?.dispose(), []);
  return (
    <points frustumCulled={false} material={resources.material.particle}>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
    </points>
  );
}
