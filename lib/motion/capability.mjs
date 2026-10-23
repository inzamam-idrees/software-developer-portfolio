export const COMPACT_QUERY = "(max-width: 767px)";

const SOFTWARE_RENDERER = /swiftshader|llvmpipe|software/i;
const UNAVAILABLE = Object.freeze({ webgl2: false, software: false });

/**
 * Probes for WebGL2 with a throwaway canvas and releases the context right
 * away so the probe never counts against the browser's context limit.
 */
export function detectWebGL(doc) {
  try {
    const context = doc?.createElement("canvas").getContext("webgl2");
    if (!context) return { ...UNAVAILABLE };
    const debug = context.getExtension("WEBGL_debug_renderer_info");
    const renderer = debug ? String(context.getParameter(debug.UNMASKED_RENDERER_WEBGL) ?? "") : "";
    context.getExtension("WEBGL_lose_context")?.loseContext();
    return { webgl2: true, software: SOFTWARE_RENDERER.test(renderer) };
  } catch {
    return { ...UNAVAILABLE };
  }
}
