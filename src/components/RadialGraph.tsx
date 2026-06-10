"use client";

import { useEffect, useMemo, useRef } from "react";
import type { GraphEdge, NodeKind, ViewMode, DifficultyCeiling } from "@/types/graph";
import type { RadialLayout } from "@/lib/graphLayout";
import {
  radialLinkPath,
  relationEdgePath,
  RING_1_RADIUS,
  RING_2_RADIUS,
  VIEWBOX,
} from "@/lib/graphLayout";
import {
  getNeighborhoodIds,
  getNode,
  GRAPH_EDGES,
  hasChildren,
  passesFilters,
} from "@/lib/graphUtils";
import { useAnimatedLayout, type AnimatedPos } from "@/lib/useAnimatedLayout";
import { GraphNode } from "@/components/GraphNode";
import { NodeTooltip } from "@/components/NodeTooltip";

type Props = {
  layout: RadialLayout;
  hoveredId: string | null;
  selectedId: string | null;
  mode: ViewMode;
  enabledKinds: ReadonlySet<NodeKind>;
  difficultyCeiling: DifficultyCeiling;
  onNodeClick: (id: string) => void;
  onHover: (id: string | null) => void;
  onBackgroundClick: () => void;
};

const MODE_EDGE_TYPES: Record<ViewMode, ReadonlyArray<GraphEdge["type"]>> = {
  concept: ["requires", "related"],
  curriculum: ["requires"],
  lean: ["lean_dependency", "axiom_dependency"],
};

type OverlayStyle = {
  stroke: string;
  width: number;
  dash?: string;
  arrow?: boolean;
  baseOpacity: number;
};

const OVERLAY_STYLE: Record<string, OverlayStyle> = {
  requires: { stroke: "#7e8aa6", width: 1.2, dash: "5 4", arrow: true, baseOpacity: 0.5 },
  related: { stroke: "#b1a8c4", width: 0.8, baseOpacity: 0.45 },
  lean_dependency: { stroke: "#4e8f8a", width: 1.1, dash: "2 3", arrow: true, baseOpacity: 0.55 },
  axiom_dependency: { stroke: "#b08a36", width: 1.2, dash: "7 3", arrow: true, baseOpacity: 0.6 },
};

export function RadialGraph({
  layout,
  hoveredId,
  selectedId,
  mode,
  enabledKinds,
  difficultyCeiling,
  onNodeClick,
  onHover,
  onBackgroundClick,
}: Props) {
  const positions = useAnimatedLayout(layout);

  const pos = (id: string): AnimatedPos => {
    const p = positions.get(id);
    if (p) return p;
    // Node not yet tweened (first frame after a focus change): mirror the
    // enter heuristic of useAnimatedLayout so there is no one-frame flash
    // at the final position before the tween kicks in.
    const ln = layout.byId.get(id);
    if (!ln) return { x: 0, y: 0, r: 0 };
    const parent = ln.parentLayoutId ? positions.get(ln.parentLayoutId) : undefined;
    return parent
      ? { x: parent.x, y: parent.y, r: Math.min(2, ln.r) }
      : { x: ln.x * 0.3, y: ln.y * 0.3, r: Math.min(2, ln.r) };
  };

  const neighborhood = useMemo(
    () => (hoveredId ? getNeighborhoodIds(hoveredId) : null),
    [hoveredId],
  );

  const filteredOut = useMemo(() => {
    const out = new Set<string>();
    for (const p of layout.nodes) {
      if (p.ring === 0) continue;
      if (!passesFilters(p.node, enabledKinds, difficultyCeiling)) out.add(p.node.id);
    }
    return out;
  }, [layout, enabledKinds, difficultyCeiling]);

  // Relation edges among currently visible nodes, chosen by view mode.
  const overlayEdges = useMemo(() => {
    const types = MODE_EDGE_TYPES[mode];
    return GRAPH_EDGES.filter(
      (e) =>
        types.includes(e.type) &&
        layout.byId.has(e.source) &&
        layout.byId.has(e.target),
    );
  }, [layout, mode]);

  const edgeOpacity = (sourceId: string, targetId: string, base: number): number => {
    if (filteredOut.has(sourceId) || filteredOut.has(targetId)) return 0.04;
    if (neighborhood) {
      const incident = hoveredId === sourceId || hoveredId === targetId;
      return incident ? Math.max(0.9, base) : 0.07;
    }
    // Relation edges that only touch faint preview nodes stay quieter.
    const touchesPreview =
      layout.byId.get(sourceId)?.ring === 2 || layout.byId.get(targetId)?.ring === 2;
    return touchesPreview ? base * 0.45 : base;
  };

  const hoveredLayout = hoveredId ? layout.byId.get(hoveredId) : undefined;
  const hoveredNode = hoveredId ? getNode(hoveredId) : undefined;

  // Tooltip handoff: when hover slides directly from one node to another the
  // entrance replay skips its 80ms delay so the card never goes blank.
  const prevHoveredRef = useRef<string | null>(null);
  const isHandoff =
    prevHoveredRef.current !== null && prevHoveredRef.current !== hoveredId;
  useEffect(() => {
    prevHoveredRef.current = hoveredId;
  });

  // Stable render order (previews under ring-1 under the center). The
  // hovered node must NOT be hoisted in the DOM: React would move the
  // element, which cancels its CSS transform transition mid-tween and
  // restarts the enter animation (a visible blink). It is elevated with a
  // <use> overlay below instead.
  const orderedNodes = useMemo(
    () => [...layout.nodes].sort((a, b) => b.ring - a.ring),
    [layout],
  );

  return (
    <svg
      className="h-full w-full select-none"
      viewBox={`${VIEWBOX.x} ${VIEWBOX.y} ${VIEWBOX.width} ${VIEWBOX.height}`}
      preserveAspectRatio="xMidYMid meet"
      onClick={onBackgroundClick}
    >
      <defs>
        {Object.entries(OVERLAY_STYLE).map(([type, s]) => (
          <marker
            key={type}
            id={`arrow-${type}`}
            viewBox="0 0 8 8"
            refX={6.5}
            refY={4}
            markerWidth={5.5}
            markerHeight={5.5}
            orient="auto-start-reverse"
          >
            <path d="M0.5,0.5 L7.5,4 L0.5,7.5 z" fill={s.stroke} />
          </marker>
        ))}
      </defs>

      {/* Faint concentric guides — gives the “circular map” read. */}
      <g aria-hidden>
        {[RING_1_RADIUS, RING_2_RADIUS].map((r) => (
          <circle
            key={r}
            r={r}
            fill="none"
            stroke="#e6e1d5"
            strokeWidth={1}
            strokeDasharray="1 7"
            opacity={neighborhood ? 0.45 : 0.9}
            style={{ transition: "opacity 380ms ease" }}
          />
        ))}
      </g>

      {/* Leaf-focus placement spokes — drawn in every view mode so a
          neighborhood satellite never floats fully disconnected. */}
      {layout.spokeEdges.length > 0 && (
        <g fill="none">
          {layout.spokeEdges.map((e) => {
            const s = pos(e.sourceId);
            const t = pos(e.targetId);
            return (
              <path
                key={`s:${e.sourceId}->${e.targetId}`}
                d={radialLinkPath(s.x, s.y, s.r, t.x, t.y, t.r)}
                stroke="#d6d0c2"
                strokeWidth={1}
                opacity={edgeOpacity(e.sourceId, e.targetId, 0.5)}
                style={{ transition: "opacity 380ms ease" }}
              />
            );
          })}
        </g>
      )}

      {/* Contains edges (center → ring1 → ring2) */}
      <g fill="none">
        {layout.containsEdges.map((e) => {
          const s = pos(e.sourceId);
          const t = pos(e.targetId);
          return (
            <path
              key={`c:${e.sourceId}->${e.targetId}`}
              d={radialLinkPath(s.x, s.y, s.r, t.x, t.y, t.r)}
              stroke={e.ring === 1 ? "#c6bfae" : "#d6d0c2"}
              strokeWidth={e.ring === 1 ? 1.5 : 0.9}
              opacity={edgeOpacity(e.sourceId, e.targetId, e.ring === 1 ? 0.9 : 0.45)}
              style={{ transition: "opacity 380ms ease" }}
            />
          );
        })}
      </g>

      {/* Relation overlays (requires / related / lean) */}
      <g fill="none">
        {overlayEdges.map((e) => {
          const s = pos(e.source);
          const t = pos(e.target);
          const st = OVERLAY_STYLE[e.type];
          const o = edgeOpacity(e.source, e.target, st.baseOpacity);
          // Curriculum mode reads as a study-order map, so arrows stay on.
          const showArrow =
            st.arrow &&
            o > 0.2 &&
            (o > 0.8 || (mode === "curriculum" && e.type === "requires"));
          return (
            <path
              key={`${e.type}:${e.source}->${e.target}`}
              d={relationEdgePath(s.x, s.y, s.r, t.x, t.y, t.r)}
              stroke={st.stroke}
              strokeWidth={o > 0.8 ? st.width + 0.5 : st.width}
              strokeDasharray={st.dash}
              markerEnd={showArrow ? `url(#arrow-${e.type})` : undefined}
              opacity={o}
              style={{ transition: "opacity 380ms ease" }}
            />
          );
        })}
      </g>

      {/* “+N more” badges for truncated previews */}
      <g aria-hidden>
        {layout.truncations.map((t) => (
          <text
            key={`trunc:${t.parentId}`}
            x={t.x}
            y={t.y}
            textAnchor="middle"
            fontSize={9}
            fill="#a39f92"
            opacity={neighborhood ? 0.25 : 0.8}
            style={{ transition: "opacity 380ms ease" }}
          >
            +{t.count}
          </text>
        ))}
      </g>

      {/* Nodes */}
      <g>
        {orderedNodes.map((p) => {
          const a = pos(p.node.id);
          return (
            <GraphNode
              key={p.node.id}
              positioned={p}
              x={a.x}
              y={a.y}
              r={a.r}
              hovered={hoveredId === p.node.id}
              selected={selectedId === p.node.id}
              dimmed={neighborhood !== null && !neighborhood.has(p.node.id)}
              filteredOut={filteredOut.has(p.node.id)}
              hasChildren={hasChildren(p.node.id)}
              onHover={onHover}
              onClick={onNodeClick}
            />
          );
        })}
      </g>

      {/* Hovered node painted again on top of all siblings via <use>: the
          original element never moves in the DOM, so its scale transition
          keeps tweening while this clone provides the elevation. */}
      {hoveredId && hoveredLayout && (
        <use
          href={`#gn-${hoveredId}`}
          aria-hidden
          style={{ pointerEvents: "none" }}
        />
      )}

      {/* Hover preview card — keyed by node so the entrance animation
          replays when hover slides from one node straight to another. */}
      {hoveredNode && hoveredLayout && (
        <NodeTooltip
          key={hoveredNode.id}
          node={hoveredNode}
          x={pos(hoveredNode.id).x}
          y={pos(hoveredNode.id).y}
          nodeR={pos(hoveredNode.id).r}
          delayMs={isHandoff ? 0 : 80}
        />
      )}
    </svg>
  );
}
