import type { LeanDeclarationRef } from "@/types/graph";

/**
 * Hand-curated Lean 4 / Mathlib declaration metadata, keyed by graph node id.
 *
 * confidence:
 *  - "docs_verified": name/module/kind checked against loogle.lean-lang.org
 *    and the mathlib4 docs at curation time (2026-06).
 *  - "manual": written from memory; treat the module path as approximate.
 *  - "exported" is reserved for a future automated pipeline (lean4export /
 *    a Lean metaprogram emitting JSON) — nothing here uses it yet.
 *
 * Keep entries small and human-checkable; this file is the seam where a
 * generated catalog will eventually plug in.
 */
export const LEAN_CATALOG = {
  ax_choice: [
    {
      name: "Classical.choice",
      kind: "axiom",
      module: "Init.Prelude",
      statement: "axiom Classical.choice {α : Sort u} : Nonempty α → α",
      informalStatement:
        "원소가 하나라도 존재한다는 사실(Nonempty)만으로 실제 원소를 얻는 선택 공리. Lean의 고전 논리는 이 공리 위에 서 있습니다.",
      tags: ["foundations", "choice", "classical"],
      confidence: "docs_verified",
    },
    {
      name: "Classical.axiomOfChoice",
      kind: "theorem",
      module: "Init.Classical",
      statement:
        "theorem Classical.axiomOfChoice {β : α → Sort v} {r : (x : α) → β x → Prop} (h : ∀ x, ∃ y, r x y) : ∃ f, ∀ x, r x (f x)",
      informalStatement:
        "관계형 선택공리: 각 x마다 조건을 만족하는 y가 있으면 선택 함수가 존재한다. Classical.choice에서 유도되는 정리입니다.",
      tags: ["foundations", "choice"],
      confidence: "docs_verified",
    },
  ],
  zfc: [
    {
      name: "ZFSet",
      kind: "def",
      module: "Mathlib.SetTheory.ZFC.Basic",
      statement: "def ZFSet : Type (u + 1)  -- pre-set들을 외연적 동치로 나눈 몫",
      informalStatement:
        "Mathlib 안에 구성된 ZFC 집합 우주. 타입론 위에서 ZFC의 모형을 만드는 정의입니다.",
      tags: ["set_theory", "zfc", "model"],
      confidence: "docs_verified",
    },
  ],
  set: [
    {
      name: "Set",
      kind: "def",
      module: "Mathlib.Data.Set.Defs",
      statement: "def Set (α : Type u) := α → Prop",
      informalStatement:
        "Lean의 집합은 술어 α → Prop입니다. ZFC의 재료가 아니라 타입 위의 부분집합 개념입니다.",
      tags: ["set_theory", "basic"],
      confidence: "docs_verified",
    },
  ],
  subset: [
    {
      name: "Set.Subset",
      kind: "def",
      module: "Mathlib.Data.Set.Defs",
      statement: "protected def Set.Subset (s₁ s₂ : Set α) : Prop := ∀ ⦃a⦄, a ∈ s₁ → a ∈ s₂",
      informalStatement: "부분집합 관계 s₁ ⊆ s₂의 정의.",
      tags: ["set_theory", "order"],
      confidence: "docs_verified",
    },
  ],
  function: [
    {
      name: "Function.Injective",
      kind: "def",
      module: "Init.Data.Function",
      statement: "def Function.Injective (f : α → β) : Prop := ∀ ⦃a₁ a₂⦄, f a₁ = f a₂ → a₁ = a₂",
      informalStatement:
        "단사 함수의 정의. 함수 자체는 Lean의 원시 개념(→)이라 별도 선언이 없고, 핵심 성질들이 코어에 정의됩니다.",
      tags: ["logic", "function"],
      confidence: "docs_verified",
    },
  ],
  group: [
    {
      name: "Group",
      kind: "class",
      module: "Mathlib.Algebra.Group.Defs",
      statement: "class Group (G : Type u) extends DivInvMonoid G",
      informalStatement:
        "군의 타입클래스. 모노이드 계층(Mul → Semigroup → Monoid → DivInvMonoid → Group) 위에서 a⁻¹ * a = 1을 요구합니다.",
      tags: ["algebra", "group_theory"],
      confidence: "docs_verified",
    },
  ],
  ring: [
    {
      name: "Ring",
      kind: "class",
      module: "Mathlib.Algebra.Ring.Defs",
      statement: "class Ring (R : Type u) extends Semiring R, AddCommGroup R, AddGroupWithOne R",
      informalStatement: "환의 타입클래스. 반환(Semiring)에 덧셈 역원을 더해 얻습니다.",
      tags: ["algebra", "ring_theory"],
      confidence: "docs_verified",
    },
  ],
  field: [
    {
      name: "Field",
      kind: "class",
      module: "Mathlib.Algebra.Field.Defs",
      statement: "class Field (K : Type u) extends CommRing K, DivisionRing K",
      informalStatement: "체의 타입클래스. 0이 아닌 원소의 역원을 갖는 가환환입니다.",
      tags: ["algebra", "field_theory"],
      confidence: "docs_verified",
    },
  ],
  vector_space: [
    {
      name: "Module",
      kind: "class",
      module: "Mathlib.Algebra.Module.Defs",
      statement:
        "class Module (R M) [Semiring R] [AddCommMonoid M] extends DistribMulAction R M",
      informalStatement:
        "Mathlib에는 별도의 VectorSpace가 없습니다 — 체 위의 Module이 곧 벡터공간입니다.",
      tags: ["linear_algebra", "module"],
      confidence: "docs_verified",
    },
  ],
  normed_space: [
    {
      name: "NormedSpace",
      kind: "class",
      module: "Mathlib.Analysis.Normed.Module.Basic",
      statement:
        "class NormedSpace (𝕜 E) [NormedField 𝕜] [SeminormedAddCommGroup E] extends Module 𝕜 E where\n  norm_smul_le (a : 𝕜) (b : E) : ‖a • b‖ ≤ ‖a‖ * ‖b‖",
      informalStatement: "노름이 스칼라배와 호환되는(‖c • x‖ ≤ ‖c‖‖x‖) 벡터공간.",
      tags: ["functional_analysis", "normed_space"],
      confidence: "docs_verified",
    },
  ],
  hahn_banach: [
    {
      name: "exists_extension_norm_eq",
      kind: "theorem",
      module: "Mathlib.Analysis.Normed.Module.HahnBanach",
      statement:
        "(p : Subspace 𝕜 E) (f : StrongDual 𝕜 ↥p) : ∃ g, (∀ (x : ↥p), g ↑x = f x) ∧ ‖g‖ = ‖f‖",
      informalStatement:
        "부분공간 위의 연속 선형 범함수를 전체 공간으로 노름을 보존하며 확장할 수 있다는 Hahn–Banach 정리.",
      docsUrl:
        "https://leanprover-community.github.io/mathlib4_docs/Mathlib/Analysis/Normed/Module/HahnBanach.html#exists_extension_norm_eq",
      sourceUrl:
        "https://github.com/leanprover-community/mathlib4/blob/master/Mathlib/Analysis/Normed/Module/HahnBanach.lean",
      imports: [
        "Mathlib.Analysis.RCLike.Lemmas",
        "Mathlib.Analysis.Convex.Cone.Extension",
        "Mathlib.Topology.Algebra.Module.Complement",
        "Mathlib.Analysis.Normed.Module.RCLike.Extend",
      ],
      tags: ["functional_analysis", "normed_space", "continuous_linear_map"],
      confidence: "docs_verified",
    },
    {
      name: "Real.exists_extension_norm_eq",
      kind: "theorem",
      module: "Mathlib.Analysis.Normed.Module.HahnBanach",
      statement:
        "(p : Subspace ℝ E) (f : StrongDual ℝ ↥p) : ∃ g, (∀ (x : ↥p), g ↑x = f x) ∧ ‖g‖ = ‖f‖",
      informalStatement: "실수 스칼라 버전의 Hahn–Banach 확장 정리.",
      tags: ["functional_analysis", "normed_space"],
      confidence: "docs_verified",
    },
  ],
  dct: [
    {
      name: "MeasureTheory.tendsto_integral_of_dominated_convergence",
      kind: "theorem",
      module: "Mathlib.MeasureTheory.Integral.DominatedConvergence",
      statement:
        "(bound : α → ℝ) (F_measurable : ∀ n, AEStronglyMeasurable (F n) μ) (bound_integrable : Integrable bound μ) … : Tendsto (fun n => ∫ a, F n a ∂μ) atTop (𝓝 (∫ a, f a ∂μ))",
      informalStatement:
        "지배 함수가 적분 가능하면 극한과 (보흐너) 적분의 순서를 바꿀 수 있다 — 지배수렴정리.",
      tags: ["measure_theory", "integration", "convergence"],
      confidence: "docs_verified",
    },
  ],
  yoneda: [
    {
      name: "CategoryTheory.yoneda",
      kind: "def",
      module: "Mathlib.CategoryTheory.Yoneda",
      statement: "def yoneda : C ⥤ Cᵒᵖ ⥤ Type v₁",
      informalStatement: "요네다 매장: 대상 X를 준층 Hom(-, X)로 보내는 함자입니다.",
      tags: ["category_theory", "yoneda"],
      confidence: "docs_verified",
    },
    {
      name: "CategoryTheory.yonedaEquiv",
      kind: "def",
      module: "Mathlib.CategoryTheory.Yoneda",
      statement:
        "def yonedaEquiv {X : C} {F : Cᵒᵖ ⥤ Type v₁} : (yoneda.obj X ⟶ F) ≃ F.obj (op X)",
      informalStatement:
        "요네다 보조정리의 핵심 동형: 자연변환 (Hom(-,X) ⟹ F)와 F(X)의 원소가 일대일 대응한다.",
      tags: ["category_theory", "yoneda"],
      confidence: "docs_verified",
    },
  ],
  topological_space: [
    {
      name: "TopologicalSpace",
      kind: "class",
      module: "Mathlib.Topology.Defs.Basic",
      statement:
        "class TopologicalSpace (X : Type u) where\n  IsOpen : Set X → Prop\n  isOpen_univ; isOpen_inter; isOpen_sUnion",
      informalStatement: "열린집합 술어와 세 공리로 정의되는 위상공간 타입클래스.",
      tags: ["topology", "basic"],
      confidence: "docs_verified",
    },
  ],
  compactness: [
    {
      name: "IsCompact",
      kind: "def",
      module: "Mathlib.Topology.Defs.Filter",
      statement:
        "def IsCompact (s : Set X) : Prop := ∀ ⦃f : Filter X⦄ [NeBot f], f ≤ 𝓟 s → ∃ x ∈ s, ClusterPt x f",
      informalStatement:
        "Mathlib의 컴팩트성은 필터 언어로 정의됩니다 — s를 포함하는 모든 비자명 필터가 s 안에 집적점을 가진다는 형태입니다.",
      tags: ["topology", "compactness", "filter"],
      confidence: "docs_verified",
    },
  ],
  heine_borel: [
    {
      name: "Metric.isCompact_iff_isClosed_bounded",
      kind: "theorem",
      module: "Mathlib.Topology.MetricSpace.Bounded",
      statement:
        "[PseudoMetricSpace α] [T2Space α] [ProperSpace α] : IsCompact s ↔ IsClosed s ∧ Bornology.IsBounded s",
      informalStatement:
        "고유(proper) 거리공간 — 예: ℝⁿ — 에서 컴팩트 ⇔ 닫혀 있고 유계라는 하이네–보렐 정리.",
      tags: ["topology", "metric_space", "compactness"],
      confidence: "docs_verified",
    },
  ],
} satisfies Record<string, LeanDeclarationRef[]>;
