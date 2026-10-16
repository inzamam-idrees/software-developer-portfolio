"use client";
import { createContext, useContext, useEffect, useMemo, useRef } from "react";
import { createPortal } from "@react-three/fiber";
import { PerspectiveCamera, Scene } from "three";
import StationBoundary from "./station-boundary";

const RegistryContext = createContext(null);

export function StationRegistry({ registry, children }) {
  return <RegistryContext.Provider value={registry}>{children}</RegistryContext.Provider>;
}

export function slotElement(name) {
  return document.querySelector(`[data-spatial-slot="${name}"]`);
}

// A station owns a scene and camera and renders into the DOM slot of the same name.
export default function Station({ name, camera: placement, update, children }) {
  const registry = useContext(RegistryContext);
  const scene = useMemo(() => new Scene(), []);
  const camera = useMemo(() => {
    const perspective = new PerspectiveCamera(placement.fov, 1, 0.1, 100);
    perspective.position.set(...placement.position);
    perspective.lookAt(...placement.target);
    return perspective;
  }, [placement]);
  const updateRef = useRef(update);
  updateRef.current = update;

  useEffect(() => {
    const station = { name, scene, camera, update: (...args) => updateRef.current?.(...args) };
    registry.current.push(station);
    return () => {
      registry.current = registry.current.filter((entry) => entry !== station);
    };
  }, [name, scene, camera, registry]);

  const markFailed = () => slotElement(name)?.setAttribute("data-station-failed", "");

  return createPortal(
    <StationBoundary name={name} onError={markFailed}>
      <hemisphereLight args={["#F4F6F8", "#8D98A2", 1.7]} />
      <directionalLight position={[4, 9, 6]} intensity={2.2} />
      {children}
    </StationBoundary>,
    scene,
  );
}

