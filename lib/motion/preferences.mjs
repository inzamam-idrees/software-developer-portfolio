export const MOTION_STORAGE_KEY = "portfolio-motion";

const PAUSED = "paused";
const ENABLED = "enabled";

/**
 * Reads the motion preference shared by every theme. Storage can be missing
 * or throw (private mode, blocked site data); motion is then allowed and the
 * system reduced-motion setting still applies separately.
 */
export function readMotionPreference(storage) {
  try {
    return storage?.getItem(MOTION_STORAGE_KEY) === PAUSED ? PAUSED : ENABLED;
  } catch {
    return ENABLED;
  }
}

export function writeMotionPreference(storage, enabled) {
  try {
    storage?.setItem(MOTION_STORAGE_KEY, enabled ? ENABLED : PAUSED);
  } catch {}
}
