"use client";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { relatedTo } from "../graph.mjs";

const SelectionContext = createContext(null);

export function useSelection() {
  return useContext(SelectionContext);
}

export default function SelectionProvider({ graph, children }) {
  const [selectedId, setSelectedId] = useState(null);
  const [focusedProjectId, setFocusedProjectId] = useState(null);
  const select = useCallback((id) => setSelectedId(id ?? null), []);
  const focusProject = useCallback((id) => setFocusedProjectId(id ?? null), []);
  const value = useMemo(
    () => ({
      selectedId,
      related: selectedId ? relatedTo(graph, selectedId) : null,
      select,
      focusedProjectId,
      focusProject,
    }),
    [graph, selectedId, select, focusedProjectId, focusProject],
  );
  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  );
}
