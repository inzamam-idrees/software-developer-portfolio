import {
  AdditiveBlending,
  BackSide,
  BoxGeometry,
  CylinderGeometry,
  Color,
  DoubleSide,
  EdgesGeometry,
  IcosahedronGeometry,
  LineBasicMaterial,
  MeshBasicMaterial,
  MeshStandardMaterial,
  OctahedronGeometry,
  PlaneGeometry,
  BufferGeometry,
  Float32BufferAttribute,
  PointsMaterial,
  SRGBColorSpace,
  ShaderMaterial,
  TextureLoader,
  SphereGeometry,
  TorusGeometry,
} from "three";

// ── Palette ──
export const PALETTE = Object.freeze({
  obsidian: "#05080D",
  navy: "#071522",
  teal: "#20E5D2",
  cyan: "#65F5FF",
  ice: "#F3F7FA",
  steel: "#8A9BAA",
});

// ── Procedural helpers ──
function landDots(count) {
  const positions = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  const total = count * 3;
  for (let i = 0; i < total; i++) {
    const y = 1 - (i / (total - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const x = Math.cos(golden * i) * r;
    const z = Math.sin(golden * i) * r;
    const land = Math.sin(x * 3.1 + 1) + Math.sin(y * 4.2 + 2) + Math.sin(z * 3.7) + Math.sin((x + z) * 5.3);
    if (land > 0.9) positions.push(x, y, z);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  return geometry;
}

function terrain(segments) {
  const columns = Math.round(segments * 1.2);
  const rows = Math.round(segments * 0.6);
  const geometry = new PlaneGeometry(80, 44, columns, rows);
  geometry.rotateX(-Math.PI / 2);
  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const z = position.getZ(i);
    const ridge = Math.max(0, (-z + 6) / 22);
    const noise = Math.sin(x * 0.35) * Math.cos(z * 0.5) + Math.sin(x * 0.9 + z * 0.3) * 0.5;
    position.setY(i, (noise + 1.2) * (0.5 + ridge * 2.2));
  }
  geometry.computeVertexNormals();
  return geometry;
}

const RIM_VERTEX = `
varying vec3 vNormal;
varying vec3 vView;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vNormal = normalize(normalMatrix * normal);
  vView = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;
const RIM_FRAGMENT = `
uniform vec3 color;
uniform float power;
uniform float strength;
varying vec3 vNormal;
varying vec3 vView;
void main() {
  float f = pow(1.0 - max(dot(normalize(vNormal), normalize(vView)), 0.0), power);
  gl_FragColor = vec4(color * f * strength, f * strength);
}`;

function rimMaterial(color, power = 2.4, strength = 1.2) {
  return new ShaderMaterial({
    uniforms: { color: { value: new Color(color) }, power: { value: power }, strength: { value: strength } },
    vertexShader: RIM_VERTEX,
    fragmentShader: RIM_FRAGMENT,
    transparent: true,
    blending: AdditiveBlending,
    depthWrite: false,
  });
}

/**
 * Geometries and materials are created once per canvas and shared by every
 * station, then released together with `disposeResources`.
 */
export function createResources(profile) {
  const geometry = {
    plane: new PlaneGeometry(1, 1),
    edges: new EdgesGeometry(new PlaneGeometry(1, 1)),
    sphere: new SphereGeometry(1, profile.segments, profile.segments / 2),
    node: new SphereGeometry(1, 8, 6),
    ring: new TorusGeometry(1, 0.007, 6, profile.segments * 2),
    octa: new OctahedronGeometry(1, 0),
    icosa: new IcosahedronGeometry(1, 1),
    box: new BoxGeometry(1, 1, 1),
    boxEdges: new EdgesGeometry(new BoxGeometry(1, 1, 1)),
    disc: new CylinderGeometry(1, 1, 1, 64),
    ringThick: new TorusGeometry(1, 0.03, 8, 96),
    land: landDots(profile.particleCount > 100 ? 420 : 150),
    terrain: terrain(profile.segments),
  };
  const texture = {
    earth: new TextureLoader().load("/cinematic/earth-night.jpg"),
  };
  texture.earth.colorSpace = SRGBColorSpace;
  texture.earth.anisotropy = 4;
  const material = {
    glass: new MeshStandardMaterial({
      color: "#0d2a3a",
      transparent: true,
      opacity: 0.24,
      metalness: 0.4,
      roughness: 0.15,
      side: DoubleSide,
      depthWrite: false,
    }),
    screen: new MeshStandardMaterial({
      color: PALETTE.navy,
      metalness: 0.5,
      roughness: 0.4,
      side: DoubleSide,
    }),
    edge: new LineBasicMaterial({ color: PALETTE.teal, transparent: true, opacity: 0.8 }),
    edgeDim: new LineBasicMaterial({ color: PALETTE.cyan, transparent: true, opacity: 0.28 }),
    glow: new MeshBasicMaterial({ color: PALETTE.teal }),
    glowCyan: new MeshBasicMaterial({ color: PALETTE.cyan }),
    dim: new MeshBasicMaterial({ color: "#14414f", transparent: true, opacity: 0.7 }),
    bar: new MeshBasicMaterial({ color: PALETTE.teal, transparent: true, opacity: 0.35, depthWrite: false }),
    metal: new MeshStandardMaterial({
      color: "#1b3b57",
      emissive: "#0b3446",
      emissiveIntensity: 0.9,
      metalness: 0.7,
      roughness: 0.3,
    }),
    earth: new MeshBasicMaterial({ map: texture.earth, transparent: true, opacity: 0.92 }),
    land: new PointsMaterial({
      color: PALETTE.cyan,
      size: 0.028,
      transparent: true,
      opacity: 0.5,
      blending: AdditiveBlending,
      depthWrite: false,
    }),
    rim: rimMaterial(PALETTE.teal, 2.2, 1.5),
    rimWarm: rimMaterial("#ffb067", 1.8, 0.9),
    ground: new MeshBasicMaterial({ color: "#0b0d12" }),
    mountain: new MeshBasicMaterial({ color: PALETTE.teal, wireframe: true, transparent: true, opacity: 0.09 }),
    wire: new MeshBasicMaterial({ color: PALETTE.cyan, wireframe: true, transparent: true, opacity: 0.1 }),
    halo: new MeshBasicMaterial({
      color: PALETTE.teal,
      transparent: true,
      opacity: 0.025,
      side: BackSide,
      blending: AdditiveBlending,
      depthWrite: false,
    }),
    ring: new MeshBasicMaterial({ color: PALETTE.teal, transparent: true, opacity: 0.75 }),
    ringDim: new MeshBasicMaterial({ color: PALETTE.cyan, transparent: true, opacity: 0.3 }),
    particle: new PointsMaterial({
      color: PALETTE.ice,
      size: 0.035,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    }),
  };
  return { geometry, material, texture };
}

export function disposeResources(resources) {
  for (const group of [resources.geometry, resources.material, resources.texture]) {
    for (const item of Object.values(group)) item.dispose();
  }
}
