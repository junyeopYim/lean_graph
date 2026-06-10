import { GRAPH_EDGES, GRAPH_NODES, NODE_MAP, ROOT_ID } from "@/data/mathGraph";
import type {
  DifficultyCeiling,
  DifficultyLevel,
  GraphNode,
  NodeKind,
} from "@/types/graph";

/* ------------------------------------------------------------------ */
/* Lookup helpers                                                      */
/* ------------------------------------------------------------------ */

export function getNode(id: string): GraphNode | undefined {
  return NODE_MAP.get(id);
}

export function getChildren(id: string): GraphNode[] {
  const n = NODE_MAP.get(id);
  if (!n?.childrenIds) return [];
  return n.childrenIds
    .map((c) => NODE_MAP.get(c))
    .filter((c): c is GraphNode => c !== undefined);
}

export function hasChildren(id: string): boolean {
  return (NODE_MAP.get(id)?.childrenIds?.length ?? 0) > 0;
}

export function getPrerequisites(id: string): GraphNode[] {
  const n = NODE_MAP.get(id);
  if (!n?.prerequisiteIds) return [];
  return n.prerequisiteIds
    .map((p) => NODE_MAP.get(p))
    .filter((p): p is GraphNode => p !== undefined);
}

/** Reverse index: nodes that list `id` as a prerequisite. */
const dependentsIndex = new Map<string, string[]>();
for (const n of GRAPH_NODES) {
  for (const p of n.prerequisiteIds ?? []) {
    const list = dependentsIndex.get(p) ?? [];
    list.push(n.id);
    dependentsIndex.set(p, list);
  }
}

export function getDependents(id: string): GraphNode[] {
  return (dependentsIndex.get(id) ?? [])
    .map((d) => NODE_MAP.get(d))
    .filter((d): d is GraphNode => d !== undefined);
}

/** Related nodes in both directions (relatedIds is stored one-way). */
const relatedIndex = new Map<string, Set<string>>();
for (const n of GRAPH_NODES) {
  for (const r of n.relatedIds ?? []) {
    (relatedIndex.get(n.id) ?? relatedIndex.set(n.id, new Set()).get(n.id)!).add(r);
    (relatedIndex.get(r) ?? relatedIndex.set(r, new Set()).get(r)!).add(n.id);
  }
}

export function getRelatedNodes(id: string): GraphNode[] {
  return [...(relatedIndex.get(id) ?? [])]
    .map((r) => NODE_MAP.get(r))
    .filter((r): r is GraphNode => r !== undefined);
}

/** Path from the root to `id` along primary parent links (inclusive). */
export function getBreadcrumbPath(id: string): GraphNode[] {
  const path: GraphNode[] = [];
  let cur = NODE_MAP.get(id);
  const guard = new Set<string>();
  while (cur && !guard.has(cur.id)) {
    guard.add(cur.id);
    path.unshift(cur);
    cur = cur.parentId ? NODE_MAP.get(cur.parentId) : undefined;
  }
  return path;
}

/** Top-level category an id belongs to (breadcrumb[1]), if any. */
export function getTopCategory(id: string): GraphNode | undefined {
  const path = getBreadcrumbPath(id);
  return path.length > 1 ? path[1] : undefined;
}

/**
 * Everything that should stay lit while `id` is hovered: the node itself,
 * its prerequisites, related nodes, dependents, children and parent.
 */
export function getNeighborhoodIds(id: string): Set<string> {
  const n = NODE_MAP.get(id);
  const ids = new Set<string>([id]);
  if (!n) return ids;
  for (const p of n.prerequisiteIds ?? []) ids.add(p);
  for (const r of relatedIndex.get(id) ?? []) ids.add(r);
  for (const d of dependentsIndex.get(id) ?? []) ids.add(d);
  for (const c of n.childrenIds ?? []) ids.add(c);
  if (n.parentId) ids.add(n.parentId);
  return ids;
}

/* ------------------------------------------------------------------ */
/* Search                                                              */
/* ------------------------------------------------------------------ */

/**
 * Lean-side searchable text per node: declaration names, modules, tags and
 * the legacy plain declaration strings. Precomputed once at module load.
 */
const leanSearchIndex = new Map<string, string>();
for (const n of GRAPH_NODES) {
  const parts: string[] = [];
  for (const ref of n.leanRefs ?? []) {
    parts.push(ref.name, ref.module, ...(ref.tags ?? []));
  }
  parts.push(...(n.leanDeclarations ?? []));
  if (parts.length > 0) leanSearchIndex.set(n.id, parts.join(" ").toLowerCase());
}

export function searchNodes(query: string, limit = 8): GraphNode[] {
  const q = query.trim().toLowerCase();
  if (q.length === 0) return [];
  const scored: Array<{ node: GraphNode; score: number }> = [];
  for (const n of GRAPH_NODES) {
    const label = n.label.toLowerCase();
    const ko = (n.labelKo ?? "").toLowerCase();
    const domain = (n.domain ?? []).join(" ").toLowerCase();
    const lean = leanSearchIndex.get(n.id);
    let score = -1;
    if (label.startsWith(q) || ko.startsWith(q)) score = 0;
    else if (label.includes(q) || ko.includes(q)) score = 1;
    else if (lean?.includes(q)) score = 1.5;
    else if (n.id.includes(q.replaceAll(" ", "_"))) score = 2;
    else if (domain.includes(q)) score = 3;
    if (score >= 0) scored.push({ node: n, score });
  }
  scored.sort(
    (a, b) => a.score - b.score || a.node.label.length - b.node.label.length,
  );
  return scored.slice(0, limit).map((s) => s.node);
}

/* ------------------------------------------------------------------ */
/* Display metadata                                                    */
/* ------------------------------------------------------------------ */

export const KIND_LABEL_KO: Record<NodeKind, string> = {
  root: "루트",
  category: "분야",
  axiom: "공리",
  definition: "정의",
  structure: "구조",
  theorem: "정리",
};

export type KindStyle = { fill: string; stroke: string; text: string };

/** Muted, scholarly palette — one hue per node kind. */
export const KIND_STYLE: Record<NodeKind, KindStyle> = {
  root: { fill: "#2f3a55", stroke: "#2f3a55", text: "#f5f3ec" },
  category: { fill: "#e3e9f2", stroke: "#5d7299", text: "#3c4d6e" },
  structure: { fill: "#ece5f0", stroke: "#8a6d99", text: "#5f4a6d" },
  theorem: { fill: "#f3e4dd", stroke: "#a8654f", text: "#7c4636" },
  definition: { fill: "#dfeae6", stroke: "#4f8276", text: "#39615a" },
  axiom: { fill: "#f1e9d4", stroke: "#a08434", text: "#6f5b1f" },
};

const DIFFICULTY_ORDER: DifficultyLevel[] = [
  "입문",
  "학부 초반",
  "학부 중반",
  "학부 후반",
  "석사 초반",
  "석사 중반",
  "석사 후반",
  "연구 수준",
];

export function difficultyRank(level: DifficultyLevel): number {
  return DIFFICULTY_ORDER.indexOf(level);
}

export const DIFFICULTY_MAX_RANK = DIFFICULTY_ORDER.length - 1;

const CEILING_RANK: Record<DifficultyCeiling, number> = {
  all: Number.POSITIVE_INFINITY,
  "ug-early": 1, // ≤ 학부 초반
  "ug-late": 3, // ≤ 학부 후반
  grad: 6, // ≤ 석사 후반
};

/** True when a node passes the sidebar filters (kind + difficulty). */
export function passesFilters(
  node: GraphNode,
  enabledKinds: ReadonlySet<NodeKind>,
  ceiling: DifficultyCeiling,
): boolean {
  if (node.kind === "root") return true;
  if (!enabledKinds.has(node.kind)) return false;
  if (node.conceptualDifficulty) {
    if (difficultyRank(node.conceptualDifficulty) > CEILING_RANK[ceiling]) {
      return false;
    }
  }
  return true;
}

export { GRAPH_EDGES, GRAPH_NODES, ROOT_ID };
