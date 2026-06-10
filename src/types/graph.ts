/**
 * Core data model for the Lean Graph knowledge map.
 *
 * The graph is a DAG: every node has at most one primary parent (used for
 * breadcrumbs), but a node may be cross-listed in several `childrenIds`
 * arrays (e.g. Functional Analysis lives under Analysis but is also shown
 * on the top-level ring).
 */

export type NodeKind =
  | "root"
  | "category"
  | "axiom"
  | "definition"
  | "structure"
  | "theorem";

export type DifficultyLevel =
  | "입문"
  | "학부 초반"
  | "학부 중반"
  | "학부 후반"
  | "석사 초반"
  | "석사 중반"
  | "석사 후반"
  | "연구 수준";

export type LeanDifficulty = "낮음" | "중간" | "높음" | "매우 높음";

export type GraphNode = {
  id: string;
  label: string;
  labelKo?: string;
  kind: NodeKind;
  parentId?: string;
  childrenIds?: string[];
  prerequisiteIds?: string[];
  relatedIds?: string[];
  domain?: string[];
  summary?: string;
  conceptualDifficulty?: DifficultyLevel;
  leanFormalizationDifficulty?: LeanDifficulty;
  leanDeclarations?: string[];
};

export type EdgeType =
  | "contains"
  | "requires"
  | "related"
  | "lean_dependency"
  | "axiom_dependency";

export type GraphEdge = {
  source: string;
  target: string;
  type: EdgeType;
  weight?: number;
};

/** Sidebar view modes. */
export type ViewMode = "concept" | "curriculum" | "lean";

/** Sidebar difficulty ceiling filter. */
export type DifficultyCeiling = "all" | "ug-early" | "ug-late" | "grad";
