"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DifficultyCeiling, NodeKind, ViewMode } from "@/types/graph";
import { ROOT_ID } from "@/data/mathGraph";
import { computeRadialLayout } from "@/lib/graphLayout";
import {
  getBreadcrumbPath,
  getNode,
  hasChildren,
  searchNodes,
} from "@/lib/graphUtils";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { RadialGraph } from "@/components/RadialGraph";
import { DetailPanel } from "@/components/DetailPanel";
import { MiniMap } from "@/components/MiniMap";

const ALL_KINDS: NodeKind[] = ["root", "category", "axiom", "definition", "structure", "theorem"];

export default function AppShell() {
  const [focusId, setFocusId] = useState<string>(ROOT_ID);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<ViewMode>("concept");
  const [enabledKinds, setEnabledKinds] = useState<ReadonlySet<NodeKind>>(
    new Set(ALL_KINDS),
  );
  const [difficultyCeiling, setDifficultyCeiling] = useState<DifficultyCeiling>("all");
  const [query, setQuery] = useState("");
  // Mobile-only: the sidebar collapses behind a toggle below the md breakpoint.
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const layout = useMemo(() => computeRadialLayout(focusId), [focusId]);
  const breadcrumbs = useMemo(() => getBreadcrumbPath(focusId), [focusId]);
  const results = useMemo(() => searchNodes(query), [query]);
  const selectedNode = selectedId ? (getNode(selectedId) ?? null) : null;

  // Hover intent: a short delay before (un)setting hover keeps fast mouse
  // sweeps from making the whole graph flicker.
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHoverIntent = useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  }, []);

  const setHoverWithIntent = useCallback(
    (id: string | null) => {
      clearHoverIntent();
      const delay = id ? 70 : 110;
      hoverTimerRef.current = setTimeout(() => {
        setHoveredId(id);
        hoverTimerRef.current = null;
      }, delay);
    },
    [clearHoverIntent],
  );

  useEffect(() => {
    return () => clearHoverIntent();
  }, [clearHoverIntent]);

  const focusOn = useCallback(
    (id: string, options?: { select?: boolean }) => {
      clearHoverIntent();
      setFocusId(id);
      setHoveredId(null);
      setSelectedId(options?.select ? id : null);
    },
    [clearHoverIntent],
  );

  /**
   * Every node can become the center. Leaves additionally stay selected so
   * the detail panel opens alongside their neighborhood ring.
   */
  const focusNodeByClick = useCallback(
    (id: string) => {
      focusOn(id, { select: !hasChildren(id) });
    },
    [focusOn],
  );

  /** Search / chip navigation follows the same policy as clicking. */
  const navigateToNode = useCallback(
    (id: string) => {
      const node = getNode(id);
      if (!node) return;
      focusOn(id, { select: !hasChildren(id) });
    },
    [focusOn],
  );

  const handleNodeClick = useCallback(
    (id: string) => {
      // Re-clicking the current center just toggles its detail panel.
      if (id === focusId) {
        setSelectedId((cur) => (cur === id ? null : id));
        return;
      }
      focusNodeByClick(id);
    },
    [focusId, focusNodeByClick],
  );

  const goUp = useCallback(() => {
    const parent = getNode(focusId)?.parentId;
    if (parent) focusOn(parent);
  }, [focusId, focusOn]);

  const handleBackgroundClick = useCallback(() => {
    if (selectedId) {
      setSelectedId(null);
    } else {
      goUp();
    }
  }, [selectedId, goUp]);

  // Escape: close the panel first, then step out one level.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      handleBackgroundClick();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleBackgroundClick]);

  const toggleKind = useCallback((k: NodeKind) => {
    setEnabledKinds((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  }, []);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#f7f5f0] text-[#2c3145]">
      <Header
        query={query}
        results={results}
        onQueryChange={setQuery}
        onSelectResult={(id) => {
          navigateToNode(id);
          setQuery("");
        }}
        onGoHome={() => focusOn(ROOT_ID)}
      />

      <div className="graph-backdrop relative flex-1 overflow-hidden">
        <RadialGraph
          layout={layout}
          hoveredId={hoveredId}
          selectedId={selectedId}
          mode={mode}
          enabledKinds={enabledKinds}
          difficultyCeiling={difficultyCeiling}
          onNodeClick={handleNodeClick}
          onHover={setHoverWithIntent}
          onBackgroundClick={handleBackgroundClick}
        />

        {/* Floating chrome — kept light so the graph stays the protagonist. */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-4 top-3">
            <Breadcrumbs path={breadcrumbs} onNavigate={focusOn} onUp={goUp} />
          </div>

          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="pointer-events-auto absolute left-4 top-14 rounded-lg border border-black/8 bg-white/80 px-2.5 py-1 text-[11.5px] text-[#565b6e] backdrop-blur md:hidden"
          >
            {sidebarOpen ? "× 닫기" : "☰ 보기 설정"}
          </button>
          <div
            className={`absolute left-4 top-[5.75rem] md:top-14 ${
              sidebarOpen ? "block" : "hidden"
            } md:block`}
          >
            <Sidebar
              mode={mode}
              enabledKinds={enabledKinds}
              difficultyCeiling={difficultyCeiling}
              hasSelection={selectedId !== null && selectedId !== focusId}
              onModeChange={setMode}
              onToggleKind={toggleKind}
              onDifficultyChange={setDifficultyCeiling}
              onFocusSelected={() => selectedId && focusNodeByClick(selectedId)}
              onResetView={() => focusOn(ROOT_ID)}
            />
          </div>

          {selectedNode && (
            <div className="absolute bottom-4 right-4 top-3">
              <DetailPanel
                node={selectedNode}
                isCurrentFocus={selectedNode.id === focusId}
                onClose={() => setSelectedId(null)}
                onFocusNode={focusNodeByClick}
                onNavigate={navigateToNode}
                onGoUp={goUp}
              />
            </div>
          )}

          {/* With the panel open the minimap moves bottom-left so it never
              parks on top of the ring-2 previews at narrower widths. */}
          <div
            className={`absolute bottom-4 hidden transition-all duration-300 sm:block ${
              selectedNode ? "left-[228px] max-md:left-4" : "right-4"
            }`}
          >
            <MiniMap
              activeCategoryId={breadcrumbs.length > 1 ? breadcrumbs[1].id : undefined}
              focusLabel={
                focusId === ROOT_ID
                  ? "전체 수학"
                  : (getNode(focusId)?.labelKo ?? getNode(focusId)?.label ?? "")
              }
              onNavigate={focusOn}
            />
          </div>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-[#f7f5f0]/85 px-3 py-1 text-[11px] text-[#a3a093] backdrop-blur">
            노드를 클릭해 들어가기 · 빈 곳을 클릭해 한 단계 위로 · 노드에 마우스를 올려 미리보기
          </div>
        </div>
      </div>
    </div>
  );
}
