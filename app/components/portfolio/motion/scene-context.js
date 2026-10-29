"use client";
import { createContext, useContext } from "react";

// Shared mutable scene state (a ref), so DOM controls can steer the 3D scene
// without going through React state on every frame.
export const SceneStateContext = createContext(null);
export const useSceneState = () => useContext(SceneStateContext);
