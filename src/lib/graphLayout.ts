import { linkRadial } from "d3-shape";
import type { GraphNode, NodeKind } from "@/types/graph";
import {
  getChildren,
  getDependents,
  getNode,
  getPrerequisites,
  getRelatedNodes,
} from "@/lib/graphUtils";

/* ------------------------------------------------------------------ */
/* Geometry constants (SVG user units; viewBox is set by RadialGraph)  */
/* ------------------------------------------------------------------ */

export const VIEWBOX = { x: -640, y: -430, width: 1280, height: 860 };
export const RING_1_RADIUS = 232;
export const RING_2_RADIUS = 362;
const RING_2_JITTER = 12;
/** Soft budget of preview (ring-2) nodes across the whole screen. */
const PREVIEW_BUDGET = 42;

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type PositionedNode = {
  node: GraphNode;
  /** 0 = focus, 1 = children ring, 2 = preview ring. */
  ring: 0 | 1 | 2;
  x: number;
  y: number;
  angle: number;
  radius: number;
  /** Visual circle radius. */
  r: number;
  /** Layout parent (the ring-1 node a preview hangs off, or the focus). */
  parentLayoutId?: string;
  /**
   * On a leaf focus there are no children; the ring shows the node's own
   * prerequisite / related / dependent neighborhood instead.
   */
  relation?: "child" | "prerequisite" | "related" | "dependent";
};

export type ContainsEdge = {
  sourceId: string;
  targetId: string;
  /** Ring of the target: 1 = focus→child, 2 = child→preview. */
  ring: 1 | 2;
};

export type TruncationBadge = {
  parentId: string;
  count: number;
  x: number;
  y: number;
};

export type RadialLayout = {
  focusId: string;
  /** True when the focus is a leaf and the ring shows its neighborhood. */
  leafFocus: boolean;
  nodes: PositionedNode[];
  byId: Map<string, PositionedNode>;
  containsEdges: ContainsEdge[];
  truncations: TruncationBadge[];
};

/* ------------------------------------------------------------------ */
/* Node sizing                                                         */
/* ------------------------------------------------------------------ */

const BASE_RADIUS: Record<NodeKind, number> = {
  root: 46,
  category: 30,
  theorem: 24,
  structure: 21,
  definition: 17,
  axiom: 15,
};

export function nodeRadius(kind: NodeKind, ring: 0 | 1 | 2): number {
  if (ring === 0) return 54;
  const base = BASE_RADIUS[kind];
  return ring === 2 ? Math.max(7, base * 0.42) : base;
}

/* ------------------------------------------------------------------ */
/* Radial layout                                                       */
/* ------------------------------------------------------------------ */

const polar = (angle: number, radius: number): [number, number] => [
  radius * Math.cos(angle),
  radius * Math.sin(angle),
];

/**
 * Place the focus node at the center, its children on ring 1 and a capped
 * preview of grandchildren on ring 2, fanned inside each child's angular
 * sector. Sectors are weighted so branches with more previews get more arc.
 */
export function computeRadialLayout(focusId: string): RadialLayout {
  const focus = getNode(focusId);
  if (!focus) throw new Error(`Unknown focus node "${focusId}"`);

  const placed = new Set<string>([focusId]);
  const nodes: PositionedNode[] = [
    {
      node: focus,
      ring: 0,
      x: 0,
      y: 0,
      angle: 0,
      radius: 0,
      r: nodeRadius(focus.kind, 0),
    },
  ];
  const containsEdges: ContainsEdge[] = [];
  const truncations: TruncationBadge[] = [];

  let ring1: Array<{ node: GraphNode; relation: PositionedNode["relation"] }> =
    getChildren(focusId).map((c) => ({ node: c, relation: "child" as const }));

  const leafFocus = ring1.length === 0;
  if (leafFocus) {
    // Leaf focus: surround the node with its own neighborhood.
    const seen = new Set<string>([focusId]);
    const pick = (
      list: GraphNode[],
      relation: PositionedNode["relation"],
    ): Array<{ node: GraphNode; relation: PositionedNode["relation"] }> =>
      list
        .filter((n) => !seen.has(n.id) && (seen.add(n.id), true))
        .map((n) => ({ node: n, relation }));
    ring1 = [
      ...pick(getPrerequisites(focusId), "prerequisite"),
      ...pick(getRelatedNodes(focusId), "related"),
      ...pick(getDependents(focusId), "dependent"),
    ];
  }

  // De-duplicate cross-listed children that may repeat.
  ring1 = ring1.filter(({ node }) => !placed.has(node.id) && (placed.add(node.id), true));

  if (ring1.length === 0) {
    return {
      focusId,
      leafFocus,
      nodes,
      byId: new Map(nodes.map((p) => [p.node.id, p])),
      containsEdges,
      truncations,
    };
  }

  const previewCap = leafFocus
    ? 0
    : Math.min(7, Math.max(2, Math.floor(PREVIEW_BUDGET / ring1.length)));

  // Previews per child (deduped against everything already placed).
  const previews = ring1.map(({ node: child }) => {
    if (leafFocus) return { shown: [] as GraphNode[], hidden: 0 };
    const candidates = getChildren(child.id).filter((g) => !placed.has(g.id));
    const shown = candidates.slice(0, previewCap);
    for (const g of shown) placed.add(g.id);
    return { shown, hidden: candidates.length - shown.length };
  });

  const weights = ring1.map((_, i) => 1 + previews[i].shown.length * 0.55);
  const totalWeight = weights.reduce((a, b) => a + b, 0);

  let cursor = -Math.PI / 2; // start at 12 o'clock
  ring1.forEach(({ node: child, relation }, i) => {
    const sector = (weights[i] / totalWeight) * Math.PI * 2;
    const angle = cursor + sector / 2;
    const [x, y] = polar(angle, RING_1_RADIUS);
    nodes.push({
      node: child,
      ring: 1,
      x,
      y,
      angle,
      radius: RING_1_RADIUS,
      r: nodeRadius(child.kind, 1),
      parentLayoutId: focusId,
      relation,
    });
    if (relation === "child") {
      containsEdges.push({ sourceId: focusId, targetId: child.id, ring: 1 });
    }

    const { shown, hidden } = previews[i];
    const spread = sector * 0.66;
    shown.forEach((grandchild, j) => {
      const t = shown.length === 1 ? 0.5 : j / (shown.length - 1);
      const gAngle = angle - spread / 2 + spread * t;
      const gRadius = RING_2_RADIUS + (j % 2 === 0 ? -RING_2_JITTER : RING_2_JITTER);
      const [gx, gy] = polar(gAngle, gRadius);
      nodes.push({
        node: grandchild,
        ring: 2,
        x: gx,
        y: gy,
        angle: gAngle,
        radius: gRadius,
        r: nodeRadius(grandchild.kind, 2),
        parentLayoutId: child.id,
        relation: "child",
      });
      containsEdges.push({ sourceId: child.id, targetId: grandchild.id, ring: 2 });
    });
    if (hidden > 0) {
      const [bx, by] = polar(angle + spread / 2 + 0.055, RING_2_RADIUS + 26);
      // Rounded so SSR and client serialize the same SVG attribute (raw
      // Math.cos/sin can differ in the last ulp → hydration mismatch).
      truncations.push({
        parentId: child.id,
        count: hidden,
        x: Number(bx.toFixed(1)),
        y: Number(by.toFixed(1)),
      });
    }

    cursor += sector;
  });

  return {
    focusId,
    leafFocus,
    nodes,
    byId: new Map(nodes.map((p) => [p.node.id, p])),
    containsEdges,
    truncations,
  };
}

/* ------------------------------------------------------------------ */
/* Edge path helpers                                                   */
/* ------------------------------------------------------------------ */

const radialLinkGen = linkRadial<
  { source: [number, number]; target: [number, number] },
  [number, number]
>()
  // d3's radial convention puts angle 0 at 12 o'clock; ours is at 3 o'clock.
  .angle((d) => d[0] + Math.PI / 2)
  .radius((d) => d[1]);

/**
 * Smooth radial bezier between two points given in cartesian coordinates,
 * trimmed so the path starts/ends at the node circles rather than centers.
 */
export function radialLinkPath(
  x1: number,
  y1: number,
  r1: number,
  x2: number,
  y2: number,
  r2: number,
): string {
  const rad1 = Math.hypot(x1, y1);
  const rad2 = Math.hypot(x2, y2);
  const a2 = Math.atan2(y2, x2);
  const a1 = rad1 < 1 ? a2 : Math.atan2(y1, x1);
  return (
    radialLinkGen({
      source: [a1, Math.min(rad1 + r1 + 2, rad2)],
      target: [a2, Math.max(rad2 - r2 - 2, rad1)],
    }) ?? ""
  );
}

/**
 * Quadratic curve between two arbitrary nodes, bowed toward the center so
 * cross-ring relation edges arc through the inner disc. Trimmed at both
 * node circles; never passes through the very middle (focus node).
 */
export function relationEdgePath(
  x1: number,
  y1: number,
  r1: number,
  x2: number,
  y2: number,
  r2: number,
): string {
  let cx = ((x1 + x2) / 2) * 0.5;
  let cy = ((y1 + y2) / 2) * 0.5;
  const cDist = Math.hypot(cx, cy);
  if (cDist < 88) {
    // Control point too close to the focus node: push it sideways,
    // perpendicular to the chord.
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    cx += (-dy / len) * (95 - cDist);
    cy += (dx / len) * (95 - cDist);
  }
  // Trim ends to the node boundaries along the curve tangents.
  const trim = (
    px: number,
    py: number,
    towardX: number,
    towardY: number,
    r: number,
  ): [number, number] => {
    const dx = towardX - px;
    const dy = towardY - py;
    const len = Math.hypot(dx, dy) || 1;
    return [px + (dx / len) * (r + 3), py + (dy / len) * (r + 3)];
  };
  const [sx, sy] = trim(x1, y1, cx, cy, r1);
  const [ex, ey] = trim(x2, y2, cx, cy, r2);
  return `M${sx.toFixed(1)},${sy.toFixed(1)}Q${cx.toFixed(1)},${cy.toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}`;
}

/* ------------------------------------------------------------------ */
/* Label wrapping                                                      */
/* ------------------------------------------------------------------ */

/**
 * Wrap a label into at most two lines, splitting at the space nearest the
 * middle. Overlong second lines are ellipsized.
 */
export function wrapLabel(label: string, maxChars = 14): string[] {
  if (label.length <= maxChars) return [label];
  const words = label.split(" ");
  if (words.length === 1) {
    return [label.slice(0, maxChars - 1) + "…"];
  }
  let best = 0;
  let bestDiff = Number.POSITIVE_INFINITY;
  for (let i = 1; i < words.length; i++) {
    const left = words.slice(0, i).join(" ").length;
    const right = words.slice(i).join(" ").length;
    const diff = Math.abs(left - right);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = i;
    }
  }
  let line1 = words.slice(0, best).join(" ");
  let line2 = words.slice(best).join(" ");
  const cap = maxChars + 4;
  if (line1.length > cap) line1 = line1.slice(0, cap - 1) + "…";
  if (line2.length > cap) line2 = line2.slice(0, cap - 1) + "…";
  return [line1, line2];
}
