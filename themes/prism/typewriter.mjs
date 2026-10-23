export const TYPEWRITER_TIMING = Object.freeze({ initial: 100, type: 90, delete: 45, hold: 1800, between: 400 });

export function initialTypewriter(roles) {
  return { index: 0, text: roles.length < 2 ? roles[0] : "", phase: roles.length < 2 ? "static" : "type", delay: TYPEWRITER_TIMING.initial };
}

export function stepTypewriter(state, roles) {
  const full = roles[state.index];
  if (state.phase === "static") return state;
  if (state.phase === "type") {
    if (state.text === full) return { ...state, phase: "hold", delay: TYPEWRITER_TIMING.hold };
    return { ...state, text: full.slice(0, state.text.length + 1), delay: TYPEWRITER_TIMING.type };
  }
  if (state.phase === "hold") return { ...state, text: full.slice(0, -1), phase: "delete", delay: TYPEWRITER_TIMING.delete };
  if (state.phase === "delete") {
    if (!state.text) return { index: (state.index + 1) % roles.length, text: "", phase: "between", delay: TYPEWRITER_TIMING.between };
    return { ...state, text: full.slice(0, state.text.length - 1), delay: TYPEWRITER_TIMING.delete };
  }
  return { ...state, text: full.slice(0, 1), phase: "type", delay: TYPEWRITER_TIMING.type };
}
