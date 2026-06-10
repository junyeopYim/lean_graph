import type {
  DifficultyLevel,
  GraphEdge,
  GraphNode,
  LeanDifficulty,
  NodeKind,
} from "@/types/graph";

/**
 * Mock knowledge graph for the Lean Graph MVP.
 *
 * Nodes are declared with a compact helper; `childrenIds`, `domain` and the
 * flat edge list are derived automatically after all declarations so the
 * data stays consistent (parent links ↔ children arrays ↔ contains edges).
 */

type NodeOpts = {
  summary?: string;
  cd?: DifficultyLevel;
  lean?: LeanDifficulty;
  prereq?: string[];
  related?: string[];
  decls?: string[];
};

const seeds: GraphNode[] = [];

function node(
  id: string,
  label: string,
  labelKo: string,
  kind: NodeKind,
  parentId: string | undefined,
  opts: NodeOpts = {},
): void {
  seeds.push({
    id,
    label,
    labelKo,
    kind,
    parentId,
    summary: opts.summary,
    conceptualDifficulty: opts.cd,
    leanFormalizationDifficulty: opts.lean,
    prerequisiteIds: opts.prereq,
    relatedIds: opts.related,
    leanDeclarations: opts.decls,
  });
}

/* ------------------------------------------------------------------ */
/* Root                                                                */
/* ------------------------------------------------------------------ */

node("mathematics", "Mathematics", "전체 수학", "root", undefined, {
  summary:
    "공리에서 출발해 정의·구조·정리로 뻗어나가는 수학 전체의 지식 지도. 분야를 클릭해 안으로 들어가세요.",
});

/* ------------------------------------------------------------------ */
/* Top-level categories (ring 1 of the initial view)                   */
/* ------------------------------------------------------------------ */

node("foundations", "Foundations", "기초론", "category", "mathematics", {
  summary: "수학 전체가 서 있는 공리적 기반. ZF/ZFC 공리계와 그 구성 공리들을 다룹니다.",
});
node("set_theory", "Set Theory", "집합론", "category", "mathematics", {
  summary: "집합·관계·함수 등 모든 수학적 대상을 표현하는 공용 언어.",
});
node("logic", "Logic", "논리학", "category", "mathematics", {
  summary: "명제, 추론, 증명 가능성 자체를 수학적으로 다루는 분야.",
});
node("category_theory", "Category Theory", "범주론", "category", "mathematics", {
  summary: "대상과 사상의 구조를 통해 수학 분야들 사이의 공통 패턴을 추상화합니다.",
});
node("algebra", "Algebra", "대수학", "category", "mathematics", {
  summary: "군·환·체 등 연산이 주어진 구조와 그 사이의 사상을 연구합니다.",
});
node("linear_algebra", "Linear Algebra", "선형대수", "category", "mathematics", {
  summary: "벡터공간과 선형사상의 이론. 거의 모든 수학·과학의 공용 도구입니다.",
});
node("number_theory", "Number Theory", "수론", "category", "mathematics", {
  summary: "정수와 소수의 성질, 합동과 나누어떨어짐의 구조를 연구합니다.",
});
node("geometry", "Geometry", "기하학", "category", "mathematics", {
  summary: "공간과 도형, 곡률을 다룹니다. 현대적으로는 다양체 위의 기하로 일반화됩니다.",
});
node("topology", "Topology", "위상수학", "category", "mathematics", {
  summary: "연속성·근방·컴팩트성처럼 '늘이고 구부려도 변하지 않는' 성질을 연구합니다.",
});
node("analysis", "Analysis", "해석학", "category", "mathematics", {
  summary: "극한과 수렴을 중심으로 실수·복소수 위의 함수, 적분, 미분방정식을 다룹니다.",
});
// 함수해석학: 해석학의 하위 분야이지만 최상위 지도에도 함께 노출(cross-listed).
node("functional_analysis", "Functional Analysis", "함수해석학", "category", "analysis", {
  summary:
    "무한차원 벡터공간(함수 공간) 위의 해석학. 노름·완비성·작용소가 핵심 언어입니다.",
});
node("probability", "Probability", "확률론", "category", "mathematics", {
  summary: "측도론 위에 세워진 무작위성의 수학. 확률공간·확률변수·극한정리를 다룹니다.",
});

/* ------------------------------------------------------------------ */
/* Foundations                                                         */
/* ------------------------------------------------------------------ */

node("zf", "ZF", "체르멜로–프렝켈 공리계", "structure", "foundations", {
  summary: "선택공리를 제외한 표준 집합론 공리계. 현대 수학 대부분의 형식적 기반입니다.",
  cd: "학부 후반",
  lean: "높음",
  related: [
    "ax_extensionality",
    "ax_empty",
    "ax_pairing",
    "ax_union",
    "ax_power",
    "ax_infinity",
    "ax_separation",
    "ax_replacement",
    "ax_foundation",
  ],
  decls: ["ZFSet", "Mathlib.SetTheory.ZFC.Basic"],
});
node("zfc", "ZFC", "선택공리를 포함한 ZF", "structure", "foundations", {
  summary: "ZF에 선택공리(Choice)를 더한 공리계. 사실상 수학의 표준 토대입니다.",
  cd: "학부 후반",
  lean: "높음",
  prereq: ["zf", "ax_choice"],
  related: ["zorn_lemma"],
  decls: ["Classical.choice", "Mathlib.SetTheory.ZFC.Basic"],
});
node("ax_extensionality", "Extensionality", "외연 공리", "axiom", "foundations", {
  summary: "같은 원소를 갖는 두 집합은 같다. 집합의 정체성을 원소로 규정합니다.",
  cd: "입문",
  lean: "낮음",
  decls: ["Set.ext"],
});
node("ax_empty", "Empty Set", "공집합 공리", "axiom", "foundations", {
  summary: "아무 원소도 갖지 않는 집합 ∅가 존재한다.",
  cd: "입문",
  lean: "낮음",
  decls: ["Set.empty"],
});
node("ax_pairing", "Pairing", "짝 공리", "axiom", "foundations", {
  summary: "임의의 a, b에 대해 {a, b}가 집합으로 존재한다.",
  cd: "입문",
  lean: "낮음",
});
node("ax_union", "Union", "합집합 공리", "axiom", "foundations", {
  summary: "집합들의 집합이 주어지면 그 모든 원소들의 합집합이 존재한다.",
  cd: "입문",
  lean: "낮음",
});
node("ax_power", "Power Set", "멱집합 공리", "axiom", "foundations", {
  summary: "임의의 집합 X에 대해 모든 부분집합의 집합 𝒫(X)가 존재한다.",
  cd: "입문",
  lean: "낮음",
  decls: ["Set.powerset"],
});
node("ax_infinity", "Infinity", "무한 공리", "axiom", "foundations", {
  summary: "무한집합(귀납적 집합)이 존재한다. 자연수 구성의 출발점입니다.",
  cd: "학부 초반",
  lean: "중간",
});
node("ax_separation", "Separation", "분리 공리꼴", "axiom", "foundations", {
  summary: "집합과 성질이 주어지면 그 성질을 만족하는 원소들만 모은 부분집합이 존재한다.",
  cd: "학부 초반",
  lean: "중간",
});
node("ax_replacement", "Replacement", "치환 공리꼴", "axiom", "foundations", {
  summary: "집합의 원소들을 정의 가능한 함수로 보낸 상(image)도 집합이다.",
  cd: "학부 후반",
  lean: "중간",
});
node("ax_foundation", "Foundation", "정초 공리", "axiom", "foundations", {
  summary: "원소 관계 ∈ 에 무한히 내려가는 사슬이 없다. 자기 자신을 원소로 갖는 집합을 배제합니다.",
  cd: "학부 후반",
  lean: "중간",
});
node("ax_choice", "Choice", "선택공리", "axiom", "foundations", {
  summary:
    "공집합이 아닌 집합들의 모임에서 각 집합의 원소를 하나씩 고르는 함수가 존재한다. Zorn 보조정리와 동치입니다.",
  cd: "학부 후반",
  lean: "낮음",
  related: ["zorn_lemma", "zfc"],
  decls: ["Classical.choice", "Classical.axiomOfChoice"],
});

/* ------------------------------------------------------------------ */
/* Set Theory                                                          */
/* ------------------------------------------------------------------ */

node("set", "Set", "집합", "definition", "set_theory", {
  summary: "원소들의 모임. ZFC에서는 모든 수학적 대상이 집합으로 표현됩니다.",
  cd: "입문",
  lean: "낮음",
  decls: ["Set"],
});
node("element", "Element", "원소", "definition", "set_theory", {
  summary: "집합에 속하는 대상. 소속 관계 ∈ 는 집합론의 유일한 원시 관계입니다.",
  cd: "입문",
  lean: "낮음",
  prereq: ["set"],
  decls: ["Membership.mem"],
});
node("subset", "Subset", "부분집합", "definition", "set_theory", {
  summary: "A의 모든 원소가 B의 원소이면 A ⊆ B. 포함 관계는 집합 사이의 기본 순서입니다.",
  cd: "입문",
  lean: "낮음",
  prereq: ["set", "element"],
  decls: ["Set.Subset", "HasSubset.Subset"],
});
node("ordered_pair", "Ordered Pair", "순서쌍", "definition", "set_theory", {
  summary: "순서가 있는 쌍 (a, b). 쿠라토프스키 구성 {{a},{a,b}}로 집합 안에서 정의됩니다.",
  cd: "입문",
  lean: "낮음",
  prereq: ["set"],
  decls: ["Prod"],
});
node("relation", "Relation", "관계", "definition", "set_theory", {
  summary: "순서쌍들의 집합. 곱집합 A × B의 부분집합으로 정의됩니다.",
  cd: "입문",
  lean: "낮음",
  prereq: ["set", "ordered_pair"],
  decls: ["Rel"],
});
node("function", "Function", "함수", "definition", "set_theory", {
  summary: "각 입력에 정확히 하나의 출력을 대응시키는 관계. 수학 전체에서 가장 많이 쓰이는 개념입니다.",
  cd: "입문",
  lean: "낮음",
  prereq: ["set", "relation"],
  decls: ["Function", "Function.Injective", "Function.Surjective"],
});
node("natural_number", "Natural Number", "자연수", "definition", "set_theory", {
  summary: "0, 1, 2, …. 무한 공리로 존재가 보장되는 가장 작은 귀납적 집합으로 구성됩니다.",
  cd: "입문",
  lean: "낮음",
  prereq: ["ax_infinity", "set"],
  related: ["ordinal"],
  decls: ["Nat", "Nat.rec"],
});
node("cardinal", "Cardinal", "기수", "definition", "set_theory", {
  summary: "집합의 '크기'를 재는 수. 두 집합 사이 전단사가 있으면 기수가 같습니다.",
  cd: "학부 후반",
  lean: "높음",
  prereq: ["set", "function"],
  related: ["ordinal", "ax_choice"],
  decls: ["Cardinal", "Cardinal.mk"],
});
node("ordinal", "Ordinal", "서수", "definition", "set_theory", {
  summary: "정렬 순서의 '길이'를 재는 수. 초한 귀납법의 무대가 됩니다.",
  cd: "학부 후반",
  lean: "높음",
  prereq: ["set", "relation"],
  related: ["cardinal"],
  decls: ["Ordinal"],
});

/* ------------------------------------------------------------------ */
/* Logic                                                               */
/* ------------------------------------------------------------------ */

node("propositional_logic", "Propositional Logic", "명제논리", "definition", "logic", {
  summary: "참/거짓 값을 갖는 명제와 ∧, ∨, ¬, → 결합자의 논리.",
  cd: "입문",
  lean: "낮음",
  decls: ["Prop", "And", "Or", "Not"],
});
node("first_order_logic", "First-Order Logic", "1차 논리", "definition", "logic", {
  summary: "한정기호 ∀, ∃로 대상들을 양화하는 논리. ZFC가 기술되는 언어입니다.",
  cd: "학부 중반",
  lean: "중간",
  prereq: ["propositional_logic"],
  decls: ["FirstOrder.Language"],
});
node("peano_arithmetic", "Peano Arithmetic", "페아노 산술", "structure", "logic", {
  summary: "자연수와 그 연산을 1차 논리로 공리화한 체계.",
  cd: "학부 중반",
  lean: "중간",
  prereq: ["first_order_logic", "natural_number"],
});
node("completeness_theorem", "Gödel's Completeness Theorem", "괴델 완전성 정리", "theorem", "logic", {
  summary: "1차 논리에서 의미론적으로 참인 문장은 모두 증명 가능하다.",
  cd: "석사 초반",
  lean: "높음",
  prereq: ["first_order_logic"],
  related: ["compactness_logic"],
});
node("compactness_logic", "Compactness Theorem", "컴팩트성 정리 (논리)", "theorem", "logic", {
  summary: "이론의 모든 유한 부분이 모형을 가지면 전체 이론도 모형을 가진다.",
  cd: "석사 초반",
  lean: "높음",
  prereq: ["first_order_logic"],
  related: ["completeness_theorem", "compactness"],
});
node("godel_incompleteness", "Gödel's Incompleteness Theorems", "괴델 불완전성 정리", "theorem", "logic", {
  summary: "산술을 포함하는 일관된 형식 체계에는 증명도 반증도 불가능한 문장이 존재한다.",
  cd: "석사 중반",
  lean: "매우 높음",
  prereq: ["first_order_logic", "peano_arithmetic"],
});

/* ------------------------------------------------------------------ */
/* Category Theory                                                     */
/* ------------------------------------------------------------------ */

node("category_def", "Category", "범주", "structure", "category_theory", {
  summary: "대상과 사상, 그리고 결합법칙·항등사상을 갖춘 합성 구조.",
  cd: "학부 후반",
  lean: "중간",
  prereq: ["set", "function"],
  decls: ["CategoryTheory.Category"],
});
node("functor", "Functor", "함자", "definition", "category_theory", {
  summary: "범주 사이의 구조 보존 사상. 대상과 사상을 함께 옮깁니다.",
  cd: "학부 후반",
  lean: "중간",
  prereq: ["category_def"],
  decls: ["CategoryTheory.Functor"],
});
node("natural_transformation", "Natural Transformation", "자연 변환", "definition", "category_theory", {
  summary: "두 함자 사이의 사상. 모든 대상에서 일관되게 작동하는 변환입니다.",
  cd: "석사 초반",
  lean: "중간",
  prereq: ["category_def", "functor"],
  decls: ["CategoryTheory.NatTrans"],
});
node("limit_ct", "Limit", "극한 (범주론)", "definition", "category_theory", {
  summary: "도형(diagram)을 하나의 보편 대상으로 요약하는 구성. 곱·당김이 모두 극한입니다.",
  cd: "석사 초반",
  lean: "높음",
  prereq: ["category_def", "functor"],
  related: ["colimit"],
  decls: ["CategoryTheory.Limits.limit"],
});
node("colimit", "Colimit", "쌍대극한", "definition", "category_theory", {
  summary: "극한의 쌍대 개념. 합·밂(pushout)이 모두 쌍대극한입니다.",
  cd: "석사 초반",
  lean: "높음",
  prereq: ["limit_ct"],
  decls: ["CategoryTheory.Limits.colimit"],
});
node("adjunction", "Adjunction", "수반", "definition", "category_theory", {
  summary: "두 함자가 이루는 가장 중요한 짝 관계. '자유 구성 ⊣ 망각 함자'가 대표적입니다.",
  cd: "석사 중반",
  lean: "높음",
  prereq: ["functor", "natural_transformation"],
  decls: ["CategoryTheory.Adjunction"],
});
node("yoneda", "Yoneda Lemma", "요네다 보조정리", "theorem", "category_theory", {
  summary: "대상은 그로부터 나가는(들어오는) 사상 전체로 완전히 결정된다. 범주론의 초석.",
  cd: "석사 중반",
  lean: "높음",
  prereq: ["category_def", "functor", "natural_transformation"],
  decls: ["CategoryTheory.yoneda", "CategoryTheory.yonedaEquiv"],
});

/* ------------------------------------------------------------------ */
/* Algebra → subfields                                                 */
/* ------------------------------------------------------------------ */

node("group_theory", "Group Theory", "군론", "category", "algebra", {
  summary: "대칭의 수학. 하나의 연산과 역원을 갖춘 구조인 군을 연구합니다.",
});
node("ring_theory", "Ring Theory", "환론", "category", "algebra", {
  summary: "덧셈과 곱셈을 함께 갖춘 구조인 환과 그 아이디얼을 연구합니다.",
});
node("field_theory", "Field Theory", "체론", "category", "algebra", {
  summary: "사칙연산이 모두 가능한 구조인 체와 체의 확대를 연구합니다.",
});
node("module_theory", "Module Theory", "가군론", "category", "algebra", {
  summary: "환 위의 벡터공간 격인 가군을 연구합니다. 호몰로지 대수의 무대입니다.",
});
node("galois_theory", "Galois Theory", "갈루아 이론", "category", "algebra", {
  summary: "체 확대의 대칭(갈루아 군)으로 방정식의 풀이 가능성을 설명합니다.",
});

/* Group Theory */

node("group", "Group", "군", "structure", "group_theory", {
  summary: "결합법칙·항등원·역원을 갖춘 이항연산이 정의된 집합. 대칭을 기술하는 기본 구조.",
  cd: "학부 초반",
  lean: "낮음",
  prereq: ["set", "function"],
  decls: ["Group", "Monoid", "Mathlib.Algebra.Group.Defs"],
});
node("abelian_group", "Abelian Group", "아벨군", "structure", "group_theory", {
  summary: "연산이 교환법칙을 만족하는 군. 가군·벡터공간의 덧셈 구조가 됩니다.",
  cd: "학부 초반",
  lean: "낮음",
  prereq: ["group"],
  decls: ["CommGroup", "AddCommGroup"],
});
node("subgroup", "Subgroup", "부분군", "definition", "group_theory", {
  summary: "군의 연산에 닫혀 있고 역원을 포함하는 부분집합.",
  cd: "학부 초반",
  lean: "낮음",
  prereq: ["group", "subset"],
  decls: ["Subgroup"],
});
node("group_hom", "Homomorphism", "준동형사상", "definition", "group_theory", {
  summary: "군 구조를 보존하는 함수: f(ab) = f(a)f(b).",
  cd: "학부 초반",
  lean: "낮음",
  prereq: ["group", "function"],
  decls: ["MonoidHom", "MulHom"],
});
node("normal_subgroup", "Normal Subgroup", "정규부분군", "definition", "group_theory", {
  summary: "켤레에 대해 불변인 부분군. 몫군을 만들 수 있는 조건입니다.",
  cd: "학부 중반",
  lean: "낮음",
  prereq: ["subgroup"],
  related: ["quotient_group"],
  decls: ["Subgroup.Normal"],
});
node("quotient_group", "Quotient Group", "몫군", "structure", "group_theory", {
  summary: "정규부분군으로 군을 '접어서' 만드는 새 군. 준동형 정리의 핵심 구성입니다.",
  cd: "학부 중반",
  lean: "중간",
  prereq: ["group", "normal_subgroup"],
  decls: ["QuotientGroup.Quotient"],
});
node("group_action", "Group Action", "군의 작용", "definition", "group_theory", {
  summary: "군이 집합을 '움직이는' 방식. 궤도와 안정자 분석의 출발점입니다.",
  cd: "학부 중반",
  lean: "중간",
  prereq: ["group", "function"],
  decls: ["MulAction"],
});
node("lagrange_theorem", "Lagrange's Theorem", "라그랑주 정리", "theorem", "group_theory", {
  summary: "유한군에서 부분군의 위수는 전체 군 위수를 나눈다.",
  cd: "학부 초반",
  lean: "낮음",
  prereq: ["group", "subgroup"],
  related: ["quotient_group", "fermat_little"],
  decls: ["Subgroup.card_subgroup_dvd_card"],
});
node("sylow", "Sylow Theorems", "쉴로브 정리", "theorem", "group_theory", {
  summary: "유한군 안에 소수 거듭제곱 크기의 부분군이 존재하고, 그 개수와 켤레 관계를 기술한다.",
  cd: "학부 후반",
  lean: "높음",
  prereq: ["group", "subgroup", "group_action", "lagrange_theorem"],
  decls: ["Sylow", "Sylow.exists_subgroup_card_pow_prime"],
});

/* Ring Theory */

node("ring", "Ring", "환", "structure", "ring_theory", {
  summary: "덧셈에 대한 아벨군과 결합적 곱셈, 분배법칙을 갖춘 구조.",
  cd: "학부 중반",
  lean: "낮음",
  prereq: ["group", "abelian_group"],
  decls: ["Ring", "CommRing"],
});
node("ideal", "Ideal", "아이디얼", "definition", "ring_theory", {
  summary: "곱셈에 대해 흡수적인 부분가군. 환의 몫을 만드는 데 쓰입니다.",
  cd: "학부 중반",
  lean: "낮음",
  prereq: ["ring"],
  decls: ["Ideal"],
});
node("quotient_ring", "Quotient Ring", "몫환", "structure", "ring_theory", {
  summary: "아이디얼로 환을 접어 만든 새 환. ℤ/nℤ가 대표적입니다.",
  cd: "학부 중반",
  lean: "중간",
  prereq: ["ring", "ideal"],
  decls: ["Ideal.Quotient"],
});
node("polynomial_ring", "Polynomial Ring", "다항식환", "structure", "ring_theory", {
  summary: "계수가 환에서 오는 다항식들의 환 R[x].",
  cd: "학부 중반",
  lean: "중간",
  prereq: ["ring"],
  decls: ["Polynomial"],
});
node("crt", "Chinese Remainder Theorem", "중국인의 나머지 정리", "theorem", "ring_theory", {
  summary: "서로소인 아이디얼들에 대한 몫환의 곱 분해. 합동식 연립의 일반화입니다.",
  cd: "학부 중반",
  lean: "중간",
  prereq: ["ring", "ideal", "quotient_ring"],
  related: ["congruence"],
  decls: ["Ideal.quotientInfRingEquivPiQuotient"],
});

/* Field Theory */

node("field", "Field", "체", "structure", "field_theory", {
  summary: "0이 아닌 모든 원소가 곱셈 역원을 갖는 가환환. ℚ, ℝ, ℂ가 대표적입니다.",
  cd: "학부 중반",
  lean: "낮음",
  prereq: ["ring"],
  decls: ["Field"],
});
node("field_extension", "Field Extension", "체의 확대", "definition", "field_theory", {
  summary: "체 K를 포함하는 더 큰 체 L. 확대 L/K의 차수가 기본 불변량입니다.",
  cd: "학부 후반",
  lean: "중간",
  prereq: ["field"],
  decls: ["IntermediateField", "Algebra"],
});
node("algebraic_extension", "Algebraic Extension", "대수적 확대", "definition", "field_theory", {
  summary: "모든 원소가 기초 체 위 다항식의 근이 되는 확대.",
  cd: "학부 후반",
  lean: "중간",
  prereq: ["field_extension", "polynomial_ring"],
  decls: ["Algebra.IsAlgebraic"],
});
node("splitting_field", "Splitting Field", "분해체", "definition", "field_theory", {
  summary: "주어진 다항식이 일차식들의 곱으로 완전히 분해되는 가장 작은 확대체.",
  cd: "학부 후반",
  lean: "높음",
  prereq: ["field_extension", "polynomial_ring"],
  decls: ["Polynomial.SplittingField"],
});
node("finite_field", "Finite Field", "유한체", "structure", "field_theory", {
  summary: "원소가 유한 개인 체. 위수는 항상 소수의 거듭제곱입니다.",
  cd: "학부 후반",
  lean: "중간",
  prereq: ["field"],
  related: ["group", "prime"],
  decls: ["GaloisField"],
});

/* Module Theory */

node("module", "Module", "가군", "structure", "module_theory", {
  summary: "환의 원소로 스칼라배가 가능한 아벨군. 체 위의 가군이 곧 벡터공간입니다.",
  cd: "학부 후반",
  lean: "낮음",
  prereq: ["ring", "abelian_group"],
  related: ["vector_space"],
  decls: ["Module"],
});
node("free_module", "Free Module", "자유가군", "definition", "module_theory", {
  summary: "기저를 갖는 가군. R^n 꼴과 동형입니다.",
  cd: "학부 후반",
  lean: "중간",
  prereq: ["module"],
  related: ["basis"],
  decls: ["Module.Free"],
});
node("exact_sequence", "Exact Sequence", "완전열", "definition", "module_theory", {
  summary: "각 단계에서 상과 핵이 일치하는 사상들의 열. 호몰로지 대수의 기본 언어입니다.",
  cd: "석사 초반",
  lean: "높음",
  prereq: ["module", "group_hom"],
  decls: ["CategoryTheory.ShortComplex.Exact"],
});
node("tensor_product", "Tensor Product", "텐서곱", "definition", "module_theory", {
  summary: "쌍선형사상을 선형사상으로 바꾸는 보편 구성 M ⊗ N.",
  cd: "석사 초반",
  lean: "높음",
  prereq: ["module"],
  decls: ["TensorProduct"],
});

/* Galois Theory */

node("galois_group", "Galois Group", "갈루아 군", "structure", "galois_theory", {
  summary: "체 확대의 자기동형사상들이 이루는 군. 확대의 대칭을 담습니다.",
  cd: "학부 후반",
  lean: "높음",
  prereq: ["group", "field_extension"],
  decls: ["IntermediateField.fixingSubgroup"],
});
node("galois_extension", "Galois Extension", "갈루아 확대", "definition", "galois_theory", {
  summary: "정규이면서 분리 가능한 대수적 확대. 갈루아 대응이 성립하는 무대입니다.",
  cd: "학부 후반",
  lean: "높음",
  prereq: ["field_extension", "algebraic_extension"],
  decls: ["IsGalois"],
});
node("galois_correspondence", "Fundamental Theorem of Galois Theory", "갈루아 이론의 기본정리", "theorem", "galois_theory", {
  summary: "갈루아 확대의 중간체와 갈루아 군의 부분군이 일대일로 대응한다.",
  cd: "석사 초반",
  lean: "매우 높음",
  prereq: ["galois_group", "galois_extension", "subgroup"],
  decls: ["IsGalois.intermediateFieldEquivSubgroup"],
});
node("abel_ruffini", "Abel–Ruffini Theorem", "아벨–루피니 정리", "theorem", "galois_theory", {
  summary: "일반적인 5차 이상의 방정식은 거듭제곱근으로 풀 수 없다.",
  cd: "석사 초반",
  lean: "매우 높음",
  prereq: ["galois_correspondence", "polynomial_ring"],
  decls: ["AbelRuffini.exists_not_solvable_by_rad"],
});

/* ------------------------------------------------------------------ */
/* Linear Algebra                                                      */
/* ------------------------------------------------------------------ */

// 벡터공간: 선형대수 소속이지만 함수해석학 링에도 함께 노출(cross-listed).
node("vector_space", "Vector Space", "벡터공간", "structure", "linear_algebra", {
  summary: "체 위에서 덧셈과 스칼라배가 정의된 구조. Lean/Mathlib에서는 체 위의 Module로 표현됩니다.",
  cd: "학부 초반",
  lean: "낮음",
  prereq: ["field", "abelian_group"],
  related: ["module"],
  decls: ["Module", "Mathlib.LinearAlgebra.Basic"],
});
node("linear_map", "Linear Map", "선형사상", "definition", "linear_algebra", {
  summary: "덧셈과 스칼라배를 보존하는 함수. 행렬은 그 좌표 표현입니다.",
  cd: "학부 초반",
  lean: "낮음",
  prereq: ["vector_space", "function"],
  related: ["matrix"],
  decls: ["LinearMap"],
});
node("basis", "Basis", "기저", "definition", "linear_algebra", {
  summary: "공간 전체를 유일하게 생성하는 선형독립 집합. 차원 개념의 근거입니다.",
  cd: "학부 초반",
  lean: "중간",
  prereq: ["vector_space"],
  decls: ["Basis", "Module.rank"],
});
node("matrix", "Matrix", "행렬", "definition", "linear_algebra", {
  summary: "수를 직사각형으로 배열한 것. 기저를 고정하면 선형사상과 일대일 대응됩니다.",
  cd: "입문",
  lean: "낮음",
  prereq: ["field"],
  related: ["linear_map"],
  decls: ["Matrix"],
});
node("determinant", "Determinant", "행렬식", "definition", "linear_algebra", {
  summary: "정사각행렬에 부피 배율을 대응시키는 다중선형 함수. 가역성을 판정합니다.",
  cd: "학부 초반",
  lean: "중간",
  prereq: ["matrix"],
  decls: ["Matrix.det"],
});
node("eigenvalue", "Eigenvalue", "고유값", "definition", "linear_algebra", {
  summary: "Av = λv를 만족하는 스칼라 λ. 선형사상의 본질적 스케일을 드러냅니다.",
  cd: "학부 초반",
  lean: "중간",
  prereq: ["linear_map", "vector_space"],
  related: ["spectral_theorem", "determinant"],
  decls: ["Module.End.HasEigenvalue"],
});
node("inner_product_space", "Inner Product Space", "내적공간", "structure", "linear_algebra", {
  summary: "내적 ⟨·,·⟩으로 길이와 각도를 잴 수 있는 벡터공간.",
  cd: "학부 중반",
  lean: "중간",
  prereq: ["vector_space"],
  related: ["hilbert_space"],
  decls: ["InnerProductSpace"],
});
node("rank_nullity", "Rank–Nullity Theorem", "차원 정리", "theorem", "linear_algebra", {
  summary: "선형사상에서 dim(정의역) = rank + nullity. 선형대수의 보존 법칙입니다.",
  cd: "학부 초반",
  lean: "중간",
  prereq: ["linear_map", "basis"],
  decls: ["LinearMap.rank_add_ker_eq"],
});

/* ------------------------------------------------------------------ */
/* Number Theory                                                       */
/* ------------------------------------------------------------------ */

node("divisibility", "Divisibility", "나누어떨어짐", "definition", "number_theory", {
  summary: "b = ac인 c가 존재하면 a | b. 수론의 출발 관계입니다.",
  cd: "입문",
  lean: "낮음",
  prereq: ["natural_number"],
  decls: ["Dvd.dvd"],
});
node("prime", "Prime Number", "소수", "definition", "number_theory", {
  summary: "1과 자기 자신만을 약수로 갖는 1보다 큰 자연수.",
  cd: "입문",
  lean: "낮음",
  prereq: ["divisibility"],
  decls: ["Nat.Prime"],
});
node("congruence", "Congruence", "합동", "definition", "number_theory", {
  summary: "n으로 나눈 나머지가 같다는 관계 a ≡ b (mod n). 몫환 ℤ/nℤ의 언어입니다.",
  cd: "입문",
  lean: "낮음",
  prereq: ["divisibility"],
  related: ["quotient_ring"],
  decls: ["Int.ModEq", "ZMod"],
});
node("fta", "Fundamental Theorem of Arithmetic", "산술의 기본정리", "theorem", "number_theory", {
  summary: "1보다 큰 모든 자연수는 소수들의 곱으로 순서를 제외하면 유일하게 분해된다.",
  cd: "학부 초반",
  lean: "중간",
  prereq: ["prime", "divisibility"],
  decls: ["Nat.factorization", "Nat.primeFactorsList"],
});
node("fermat_little", "Fermat's Little Theorem", "페르마 소정리", "theorem", "number_theory", {
  summary: "소수 p와 p의 배수가 아닌 a에 대해 a^(p−1) ≡ 1 (mod p).",
  cd: "학부 초반",
  lean: "낮음",
  prereq: ["congruence", "prime"],
  related: ["group", "lagrange_theorem"],
  decls: ["ZMod.pow_card_sub_one_eq_one"],
});
node("euler_theorem", "Euler's Theorem", "오일러 정리", "theorem", "number_theory", {
  summary: "gcd(a, n) = 1이면 a^φ(n) ≡ 1 (mod n). 페르마 소정리의 일반화입니다.",
  cd: "학부 중반",
  lean: "중간",
  prereq: ["fermat_little", "congruence"],
  decls: ["ZMod.pow_totient"],
});
node("quadratic_reciprocity", "Quadratic Reciprocity", "이차 상호 법칙", "theorem", "number_theory", {
  summary: "두 홀소수 p, q에 대해 서로가 서로의 제곱잉여인지가 우아하게 연결된다.",
  cd: "학부 후반",
  lean: "높음",
  prereq: ["congruence", "prime"],
  decls: ["legendreSym.quadratic_reciprocity"],
});

/* ------------------------------------------------------------------ */
/* Geometry                                                            */
/* ------------------------------------------------------------------ */

node("euclidean_space", "Euclidean Space", "유클리드 공간", "structure", "geometry", {
  summary: "내적이 주어진 ℝⁿ. 고전 기하학의 표준 무대입니다.",
  cd: "학부 초반",
  lean: "낮음",
  prereq: ["vector_space", "inner_product_space"],
  decls: ["EuclideanSpace"],
});
node("manifold", "Manifold", "다양체", "structure", "geometry", {
  summary: "국소적으로 유클리드 공간과 닮은 위상공간. 현대 기하학의 기본 대상입니다.",
  cd: "석사 초반",
  lean: "높음",
  prereq: ["topological_space", "hausdorff"],
  decls: ["IsManifold", "ChartedSpace"],
});
node("smooth_manifold", "Smooth Manifold", "매끄러운 다양체", "structure", "geometry", {
  summary: "좌표 전환이 무한 번 미분 가능한 다양체. 미분기하의 무대입니다.",
  cd: "석사 초반",
  lean: "매우 높음",
  prereq: ["manifold", "derivative"],
  decls: ["ContMDiff"],
});
node("riemannian_metric", "Riemannian Metric", "리만 계량", "definition", "geometry", {
  summary: "각 접공간에 내적을 매끄럽게 부여한 것. 길이·각도·곡률을 정의합니다.",
  cd: "석사 중반",
  lean: "매우 높음",
  prereq: ["smooth_manifold", "inner_product_space"],
});
node("geodesic", "Geodesic", "측지선", "definition", "geometry", {
  summary: "리만 다양체 위에서 국소적으로 가장 짧은 곡선. 직선의 일반화입니다.",
  cd: "석사 중반",
  lean: "매우 높음",
  prereq: ["riemannian_metric"],
});
node("gauss_bonnet", "Gauss–Bonnet Theorem", "가우스–보네 정리", "theorem", "geometry", {
  summary: "곡면의 전곡률 적분이 위상 불변량(오일러 지표)으로 결정된다.",
  cd: "석사 중반",
  lean: "매우 높음",
  prereq: ["riemannian_metric", "compactness"],
});

/* ------------------------------------------------------------------ */
/* Topology                                                            */
/* ------------------------------------------------------------------ */

node("topological_space", "Topological Space", "위상공간", "structure", "topology", {
  summary: "열린집합의 모임으로 '가까움'을 추상화한 구조. 연속성의 가장 일반적인 무대입니다.",
  cd: "학부 중반",
  lean: "낮음",
  prereq: ["set", "subset"],
  decls: ["TopologicalSpace"],
});
node("open_set", "Open Set", "열린집합", "definition", "topology", {
  summary: "위상을 이루는 기본 단위. 각 점 주위에 '여유'가 있는 집합입니다.",
  cd: "학부 중반",
  lean: "낮음",
  prereq: ["topological_space"],
  related: ["closed_set"],
  decls: ["IsOpen"],
});
node("closed_set", "Closed Set", "닫힌집합", "definition", "topology", {
  summary: "여집합이 열린집합인 집합. 극한점을 모두 포함합니다.",
  cd: "학부 중반",
  lean: "낮음",
  prereq: ["open_set"],
  decls: ["IsClosed"],
});
node("continuous_map", "Continuous Map", "연속사상", "definition", "topology", {
  summary: "열린집합의 역상이 열린집합인 함수. ε-δ 정의의 위상적 일반화입니다.",
  cd: "학부 중반",
  lean: "낮음",
  prereq: ["topological_space", "function", "open_set"],
  related: ["continuity"],
  decls: ["Continuous", "ContinuousMap"],
});
node("compactness", "Compactness", "컴팩트성", "definition", "topology", {
  summary: "모든 열린 덮개가 유한 부분덮개를 갖는 성질. '유한처럼 행동하는 무한'입니다.",
  cd: "학부 후반",
  lean: "중간",
  prereq: ["topological_space", "open_set"],
  related: ["heine_borel", "bolzano_weierstrass"],
  decls: ["IsCompact", "CompactSpace"],
});
node("connectedness", "Connectedness", "연결성", "definition", "topology", {
  summary: "공간이 두 개의 분리된 열린집합으로 쪼개지지 않는 성질.",
  cd: "학부 후반",
  lean: "중간",
  prereq: ["topological_space", "open_set"],
  decls: ["IsConnected", "ConnectedSpace"],
});
node("hausdorff", "Hausdorff Space", "하우스도르프 공간", "structure", "topology", {
  summary: "서로 다른 두 점을 분리된 열린집합으로 나눌 수 있는 공간. 극한의 유일성을 보장합니다.",
  cd: "학부 후반",
  lean: "낮음",
  prereq: ["topological_space"],
  decls: ["T2Space"],
});
node("product_topology", "Product Topology", "곱위상", "definition", "topology", {
  summary: "곱집합 위에 사영이 연속이 되도록 주는 가장 거친 위상.",
  cd: "학부 후반",
  lean: "중간",
  prereq: ["topological_space", "ordered_pair"],
  decls: ["instTopologicalSpaceProd"],
});
node("heine_borel", "Heine–Borel Theorem", "하이네–보렐 정리", "theorem", "topology", {
  summary: "ℝⁿ의 부분집합이 컴팩트 ⇔ 닫혀 있고 유계이다.",
  cd: "학부 후반",
  lean: "중간",
  prereq: ["compactness", "closed_set"],
  related: ["bolzano_weierstrass"],
  decls: ["Metric.isCompact_iff_isClosed_bounded"],
});
node("stone_weierstrass", "Stone–Weierstrass Theorem", "스톤–바이어슈트라스 정리", "theorem", "topology", {
  summary: "컴팩트 공간 위의 연속함수는 점을 분리하는 부분대수로 균등 근사할 수 있다.",
  cd: "석사 초반",
  lean: "높음",
  prereq: ["compactness", "continuous_map", "uniform_convergence"],
  related: ["banach_space"],
  decls: ["ContinuousMap.subalgebra_topologicalClosure_eq_top_of_separatesPoints"],
});

/* ------------------------------------------------------------------ */
/* Analysis → subfields                                                */
/* ------------------------------------------------------------------ */

node("real_analysis", "Real Analysis", "실해석", "category", "analysis", {
  summary: "실수 위 수열·함수의 극한, 연속, 미분, 적분을 엄밀하게 다룹니다.",
});
node("complex_analysis", "Complex Analysis", "복소해석", "category", "analysis", {
  summary: "복소 미분 가능한(정칙) 함수의 놀랍도록 견고한 이론.",
});
node("measure_theory", "Measure Theory", "측도론", "category", "analysis", {
  summary: "길이·넓이·확률을 일반화한 측도와 르베그 적분의 이론.",
});
node("differential_equations", "Differential Equations", "미분방정식", "category", "analysis", {
  summary: "미지의 함수와 그 도함수가 얽힌 방정식. 자연 현상의 표준 모델링 언어입니다.",
});

/* Real Analysis */

node("sequence", "Sequence", "수열", "definition", "real_analysis", {
  summary: "자연수로 번호 매겨진 값들의 나열. 극한 개념의 출발점입니다.",
  cd: "입문",
  lean: "낮음",
  prereq: ["natural_number", "function"],
  decls: ["Filter.Tendsto"],
});
node("limit_seq", "Limit of a Sequence", "수열의 극한", "definition", "real_analysis", {
  summary: "충분히 멀리 가면 임의로 가까워지는 값. ε-N 논법으로 정의됩니다.",
  cd: "학부 초반",
  lean: "낮음",
  prereq: ["sequence"],
  decls: ["Filter.Tendsto", "Filter.atTop"],
});
node("continuity", "Continuity", "연속성", "definition", "real_analysis", {
  summary: "입력의 작은 변화가 출력의 작은 변화만 일으키는 성질. ε-δ로 정식화됩니다.",
  cd: "학부 초반",
  lean: "낮음",
  prereq: ["limit_seq"],
  related: ["continuous_map"],
  decls: ["ContinuousAt", "Continuous"],
});
node("derivative", "Derivative", "도함수", "definition", "real_analysis", {
  summary: "순간 변화율. 차분 몫의 극한으로 정의됩니다.",
  cd: "학부 초반",
  lean: "중간",
  prereq: ["limit_seq", "continuity"],
  decls: ["deriv", "HasDerivAt", "fderiv"],
});
node("riemann_integral", "Riemann Integral", "리만 적분", "definition", "real_analysis", {
  summary: "구간을 잘게 쪼갠 직사각형 합의 극한으로 정의되는 적분.",
  cd: "학부 초반",
  lean: "중간",
  prereq: ["continuity", "limit_seq"],
  related: ["lebesgue_integral"],
  decls: ["intervalIntegral"],
});
node("uniform_convergence", "Uniform Convergence", "균등수렴", "definition", "real_analysis", {
  summary: "함수열이 정의역 전체에서 같은 속도로 수렴하는 것. 연속성과 적분을 보존합니다.",
  cd: "학부 중반",
  lean: "중간",
  prereq: ["sequence", "limit_seq"],
  decls: ["TendstoUniformly"],
});
node("bolzano_weierstrass", "Bolzano–Weierstrass Theorem", "볼차노–바이어슈트라스 정리", "theorem", "real_analysis", {
  summary: "유계 수열은 수렴하는 부분수열을 가진다. 실수 완비성의 핵심 결과입니다.",
  cd: "학부 초반",
  lean: "중간",
  prereq: ["sequence", "limit_seq"],
  related: ["compactness", "heine_borel"],
  decls: ["tendsto_subseq_of_bounded"],
});
node("mvt", "Mean Value Theorem", "평균값 정리", "theorem", "real_analysis", {
  summary: "구간에서 평균 변화율과 같은 순간 변화율을 갖는 점이 존재한다.",
  cd: "학부 초반",
  lean: "중간",
  prereq: ["derivative", "continuity"],
  decls: ["exists_deriv_eq_slope"],
});
node("ftc", "Fundamental Theorem of Calculus", "미적분학의 기본정리", "theorem", "real_analysis", {
  summary: "미분과 적분이 서로 역과정임을 밝힌 정리.",
  cd: "학부 초반",
  lean: "중간",
  prereq: ["derivative", "riemann_integral"],
  decls: ["intervalIntegral.integral_hasStrictDerivAt"],
});

/* Complex Analysis */

node("holomorphic", "Holomorphic Function", "정칙함수", "definition", "complex_analysis", {
  summary: "복소 미분 가능한 함수. 한 번 미분 가능하면 무한히 미분 가능해집니다.",
  cd: "학부 후반",
  lean: "중간",
  prereq: ["derivative", "continuity"],
  decls: ["DifferentiableOn", "AnalyticAt"],
});
node("cauchy_riemann", "Cauchy–Riemann Equations", "코시–리만 방정식", "theorem", "complex_analysis", {
  summary: "복소 미분 가능성을 실 편미분 조건으로 특징짓는 방정식.",
  cd: "학부 후반",
  lean: "중간",
  prereq: ["holomorphic", "derivative"],
});
node("cauchy_integral", "Cauchy's Integral Theorem", "코시 적분 정리", "theorem", "complex_analysis", {
  summary: "정칙함수의 닫힌 경로 적분은 0이다. 복소해석 전체의 주춧돌입니다.",
  cd: "학부 후반",
  lean: "높음",
  prereq: ["holomorphic", "riemann_integral"],
  decls: ["Complex.integral_boundary_rect_eq_zero_of_differentiableOn"],
});
node("laurent_series", "Laurent Series", "로랑 급수", "definition", "complex_analysis", {
  summary: "음수 차수 항까지 허용하는 멱급수 전개. 특이점 분석의 도구입니다.",
  cd: "학부 후반",
  lean: "높음",
  prereq: ["holomorphic", "sequence"],
});
node("residue_theorem", "Residue Theorem", "유수 정리", "theorem", "complex_analysis", {
  summary: "닫힌 경로 적분이 내부 특이점들의 유수 합으로 계산된다.",
  cd: "학부 후반",
  lean: "높음",
  prereq: ["cauchy_integral", "laurent_series"],
});

/* Measure Theory */

node("sigma_algebra", "Sigma Algebra", "시그마 대수", "structure", "measure_theory", {
  summary: "여집합과 가산 합집합에 닫힌 부분집합들의 모임. '잴 수 있는 집합'의 목록입니다.",
  cd: "학부 후반",
  lean: "낮음",
  prereq: ["set", "subset"],
  decls: ["MeasurableSpace"],
});
node("measure_space", "Measure Space", "측도공간", "structure", "measure_theory", {
  summary: "시그마 대수의 각 집합에 가산가법적으로 크기를 부여한 공간 (X, 𝒜, μ).",
  cd: "학부 후반",
  lean: "중간",
  prereq: ["sigma_algebra"],
  decls: ["MeasureTheory.MeasureSpace", "MeasureTheory.Measure"],
});
node("measurable_function", "Measurable Function", "가측함수", "definition", "measure_theory", {
  summary: "가측집합의 역상이 가측인 함수. 적분 가능한 함수의 후보들입니다.",
  cd: "학부 후반",
  lean: "중간",
  prereq: ["measure_space", "function"],
  decls: ["Measurable", "AEMeasurable"],
});
node("almost_everywhere", "Almost Everywhere", "거의 어디서나", "definition", "measure_theory", {
  summary: "측도 0인 집합을 제외한 모든 점에서 성립함. 측도론 특유의 '무시 가능' 개념입니다.",
  cd: "학부 후반",
  lean: "중간",
  prereq: ["measure_space"],
  decls: ["MeasureTheory.ae", "Filter.Eventually"],
});
node("lebesgue_integral", "Lebesgue Integral", "르베그 적분", "definition", "measure_theory", {
  summary: "함수값을 기준으로 영역을 쪼개 적분하는 방식. 극한과 호환성이 뛰어납니다.",
  cd: "학부 후반",
  lean: "높음",
  prereq: ["measurable_function", "measure_space"],
  related: ["riemann_integral"],
  decls: ["MeasureTheory.integral", "MeasureTheory.lintegral"],
});
node("fatou", "Fatou's Lemma", "파투의 보조정리", "theorem", "measure_theory", {
  summary: "음이 아닌 함수열에서 ∫liminf ≤ liminf∫. 수렴 정리들의 기초가 됩니다.",
  cd: "학부 후반",
  lean: "중간",
  prereq: ["lebesgue_integral", "limit_seq"],
  related: ["mct", "dct"],
  decls: ["MeasureTheory.lintegral_liminf_le"],
});
node("mct", "Monotone Convergence Theorem", "단조수렴정리", "theorem", "measure_theory", {
  summary: "증가하는 음이 아닌 함수열에서 극한과 적분의 순서를 바꿀 수 있다.",
  cd: "학부 후반",
  lean: "중간",
  prereq: ["lebesgue_integral", "sequence"],
  related: ["fatou", "dct"],
  decls: ["MeasureTheory.lintegral_iSup"],
});
node("dct", "Dominated Convergence Theorem", "지배수렴정리", "theorem", "measure_theory", {
  summary: "적분 가능한 함수가 지배하면 극한과 적분의 순서를 바꿀 수 있다. 해석학의 일꾼 정리.",
  cd: "학부 후반",
  lean: "높음",
  prereq: ["lebesgue_integral", "measurable_function", "almost_everywhere"],
  related: ["fatou", "mct"],
  decls: ["MeasureTheory.tendsto_integral_of_dominated_convergence"],
});

/* Functional Analysis */

node("normed_space", "Normed Space", "노름공간", "structure", "functional_analysis", {
  summary: "벡터의 '길이'인 노름이 주어진 벡터공간. 거리와 위상이 자동으로 따라옵니다.",
  cd: "학부 후반",
  lean: "낮음",
  prereq: ["vector_space"],
  decls: ["NormedSpace", "NormedAddCommGroup"],
});
node("banach_space", "Banach Space", "바나흐 공간", "structure", "functional_analysis", {
  summary: "완비인 노름공간. 코시열이 항상 수렴하므로 극한 논증이 자유롭습니다.",
  cd: "학부 후반",
  lean: "중간",
  prereq: ["normed_space"],
  related: ["hilbert_space"],
  decls: ["CompleteSpace", "Banach"],
});
node("hilbert_space", "Hilbert Space", "힐베르트 공간", "structure", "functional_analysis", {
  summary: "완비인 내적공간. 직교성과 사영이 작동하는 무한차원 기하학의 무대입니다.",
  cd: "석사 초반",
  lean: "중간",
  prereq: ["vector_space", "inner_product_space"],
  related: ["banach_space"],
  decls: ["InnerProductSpace", "HilbertSpace"],
});
node("bounded_operator", "Bounded Linear Operator", "유계선형작용소", "definition", "functional_analysis", {
  summary: "노름을 일정 배율 이하로만 키우는 선형사상. 연속성과 동치입니다.",
  cd: "석사 초반",
  lean: "중간",
  prereq: ["normed_space", "linear_map"],
  decls: ["ContinuousLinearMap"],
});
node("dual_space", "Dual Space", "쌍대공간", "definition", "functional_analysis", {
  summary: "공간 위의 연속 선형 범함수 전체. 공간을 '바깥에서' 바라보는 관점입니다.",
  cd: "석사 초반",
  lean: "중간",
  prereq: ["bounded_operator", "normed_space"],
  related: ["riesz", "hahn_banach"],
  decls: ["NormedSpace.Dual"],
});
node("seminorm", "Seminorm", "반노름", "definition", "functional_analysis", {
  summary: "0이 아닌 벡터의 길이가 0일 수 있는 노름. 한–바나흐 정리의 핵심 가정입니다.",
  cd: "석사 초반",
  lean: "중간",
  prereq: ["vector_space"],
  decls: ["Seminorm"],
});
node("convexity", "Convexity", "볼록성", "definition", "functional_analysis", {
  summary: "두 점을 잇는 선분이 집합 안에 머무는 성질. 분리 정리와 최적화의 기초입니다.",
  cd: "학부 후반",
  lean: "중간",
  prereq: ["vector_space"],
  decls: ["Convex"],
});
// 초른 보조정리: 집합론 소속이지만 한–바나흐 옆(함수해석학 링)에도 노출.
node("zorn_lemma", "Zorn's Lemma", "초른의 보조정리", "theorem", "set_theory", {
  summary: "모든 사슬이 상계를 가지면 극대원소가 존재한다. 선택공리와 동치입니다.",
  cd: "학부 후반",
  lean: "낮음",
  prereq: ["set", "relation"],
  related: ["ax_choice"],
  decls: ["zorn_le", "zorn_subset"],
});
node("hahn_banach", "Hahn–Banach Theorem", "한–바나흐 정리", "theorem", "functional_analysis", {
  summary:
    "부분공간의 선형 범함수를 반노름을 넘지 않게 전체 공간으로 확장할 수 있다. 쌍대공간이 풍부함을 보장합니다.",
  cd: "석사 초반",
  lean: "높음",
  prereq: ["vector_space", "seminorm", "convexity", "zorn_lemma"],
  related: ["dual_space"],
  decls: ["exists_extension_norm_eq", "Real.exists_extension_of_le_sublinear"],
});
node("ubp", "Uniform Boundedness Principle", "균등유계원리", "theorem", "functional_analysis", {
  summary: "점마다 유계인 작용소족은 노름으로도 균등하게 유계이다(바나흐–슈타인하우스).",
  cd: "석사 초반",
  lean: "높음",
  prereq: ["banach_space", "bounded_operator"],
  related: ["open_mapping"],
  decls: ["banach_steinhaus"],
});
node("open_mapping", "Open Mapping Theorem", "열린사상정리", "theorem", "functional_analysis", {
  summary: "바나흐 공간 사이의 전사 유계작용소는 열린사상이다. 베르 범주 정리에서 나옵니다.",
  cd: "석사 초반",
  lean: "높음",
  prereq: ["banach_space", "bounded_operator", "continuous_map"],
  related: ["closed_graph", "ubp"],
  decls: ["ContinuousLinearMap.isOpenMap"],
});
node("closed_graph", "Closed Graph Theorem", "닫힌그래프정리", "theorem", "functional_analysis", {
  summary: "바나흐 공간 사이 선형사상은 그래프가 닫혀 있으면 연속이다.",
  cd: "석사 초반",
  lean: "높음",
  prereq: ["banach_space", "bounded_operator"],
  related: ["open_mapping"],
  decls: ["LinearMap.continuous_of_isClosed_graph"],
});
node("riesz", "Riesz Representation Theorem", "리스 표현 정리", "theorem", "functional_analysis", {
  summary: "힐베르트 공간의 연속 선형 범함수는 내적 ⟨·, y⟩로 유일하게 표현된다.",
  cd: "석사 초반",
  lean: "높음",
  prereq: ["hilbert_space", "dual_space", "bounded_operator"],
  decls: ["InnerProductSpace.toDual"],
});
node("spectral_theorem", "Spectral Theorem", "스펙트럼 정리", "theorem", "functional_analysis", {
  summary: "자기수반 작용소를 고유공간(스펙트럼)으로 분해한다. 대각화의 무한차원 일반화입니다.",
  cd: "석사 중반",
  lean: "매우 높음",
  prereq: ["hilbert_space", "bounded_operator"],
  related: ["eigenvalue"],
  decls: ["IsSelfAdjoint", "spectrum"],
});

/* Differential Equations */

node("ode", "Ordinary Differential Equation", "상미분방정식", "definition", "differential_equations", {
  summary: "한 변수 함수와 그 도함수들 사이의 방정식.",
  cd: "학부 중반",
  lean: "높음",
  prereq: ["derivative", "function"],
});
node("pde", "Partial Differential Equation", "편미분방정식", "definition", "differential_equations", {
  summary: "여러 변수 함수의 편도함수들이 얽힌 방정식. 물리 법칙의 표준 형태입니다.",
  cd: "학부 후반",
  lean: "매우 높음",
  prereq: ["derivative"],
});
node("ivp", "Initial Value Problem", "초기값 문제", "definition", "differential_equations", {
  summary: "미분방정식에 시작 조건을 붙인 문제. 해의 존재·유일성이 핵심 질문입니다.",
  cd: "학부 중반",
  lean: "높음",
  prereq: ["ode"],
});
node("picard_lindelof", "Picard–Lindelöf Theorem", "피카르–린델뢰프 정리", "theorem", "differential_equations", {
  summary: "립시츠 조건 아래 초기값 문제의 해가 유일하게 존재한다. 바나흐 고정점 정리로 증명됩니다.",
  cd: "학부 후반",
  lean: "높음",
  prereq: ["ivp", "continuity"],
  related: ["banach_space"],
  decls: ["IsPicardLindelof"],
});

/* ------------------------------------------------------------------ */
/* Probability                                                         */
/* ------------------------------------------------------------------ */

node("probability_space", "Probability Space", "확률공간", "structure", "probability", {
  summary: "전체 측도가 1인 측도공간 (Ω, ℱ, P). 무작위성의 형식적 무대입니다.",
  cd: "학부 후반",
  lean: "중간",
  prereq: ["measure_space"],
  decls: ["MeasureTheory.IsProbabilityMeasure"],
});
node("random_variable", "Random Variable", "확률변수", "definition", "probability", {
  summary: "표본공간에서 값 공간으로 가는 가측함수. 무작위 수량의 수학적 정의입니다.",
  cd: "학부 후반",
  lean: "중간",
  prereq: ["probability_space", "measurable_function"],
  decls: ["MeasureTheory.AEMeasurable"],
});
node("expectation", "Expectation", "기댓값", "definition", "probability", {
  summary: "확률변수의 평균. 확률측도에 대한 르베그 적분으로 정의됩니다.",
  cd: "학부 후반",
  lean: "중간",
  prereq: ["random_variable", "lebesgue_integral"],
  decls: ["MeasureTheory.integral"],
});
node("independence", "Independence", "독립성", "definition", "probability", {
  summary: "한 사건의 발생이 다른 사건의 확률에 영향을 주지 않는 관계.",
  cd: "학부 후반",
  lean: "중간",
  prereq: ["probability_space"],
  decls: ["ProbabilityTheory.iIndepFun"],
});
node("conditional_probability", "Conditional Probability", "조건부 확률", "definition", "probability", {
  summary: "사건 B가 일어났을 때 A의 확률 P(A|B). 베이즈 추론의 출발점입니다.",
  cd: "학부 후반",
  lean: "높음",
  prereq: ["probability_space"],
  decls: ["ProbabilityTheory.cond"],
});
node("lln", "Law of Large Numbers", "큰 수의 법칙", "theorem", "probability", {
  summary: "독립 동일분포 표본평균이 기댓값으로 수렴한다.",
  cd: "석사 초반",
  lean: "높음",
  prereq: ["random_variable", "expectation", "independence"],
  related: ["clt"],
  decls: ["ProbabilityTheory.strong_law_ae"],
});
node("clt", "Central Limit Theorem", "중심극한정리", "theorem", "probability", {
  summary: "표준화한 표본평균 √n(X̄−μ)의 분포가 정규분포로 수렴한다. 통계학의 근간입니다.",
  cd: "석사 중반",
  lean: "매우 높음",
  prereq: ["random_variable", "expectation", "independence"],
  related: ["lln"],
});

/* ------------------------------------------------------------------ */
/* Derived structures: children, cross-links, domains, edges           */
/* ------------------------------------------------------------------ */

/**
 * Cross-listings: child appears on an additional parent's ring.
 * `lead: true` marks an entry concept that should open the ring (placed
 * first); otherwise the cross-listed child is appended at the end.
 */
const CROSS_LINKS: Array<[parentId: string, childId: string, lead?: boolean]> = [
  ["mathematics", "functional_analysis"],
  ["functional_analysis", "vector_space", true],
  ["functional_analysis", "zorn_lemma"],
];

const byId = new Map<string, GraphNode>(seeds.map((n) => [n.id, n]));

// childrenIds: declaration order under each primary parent, then cross-links.
for (const n of seeds) {
  if (!n.parentId) continue;
  const parent = byId.get(n.parentId);
  if (!parent) throw new Error(`Unknown parentId "${n.parentId}" on node "${n.id}"`);
  (parent.childrenIds ??= []).push(n.id);
}
for (const [parentId, childId, lead] of CROSS_LINKS) {
  const parent = byId.get(parentId);
  const child = byId.get(childId);
  if (!parent || !child) throw new Error(`Bad cross link ${parentId} → ${childId}`);
  const children = (parent.childrenIds ??= []);
  if (!children.includes(childId)) {
    if (lead) children.unshift(childId);
    else children.push(childId);
  }
}

// domain: Korean labels of category ancestors along the primary parent chain.
for (const n of seeds) {
  const path: string[] = [];
  let cur = n.parentId ? byId.get(n.parentId) : undefined;
  while (cur) {
    if (cur.kind === "category") path.unshift(cur.labelKo ?? cur.label);
    cur = cur.parentId ? byId.get(cur.parentId) : undefined;
  }
  if (n.kind === "category") path.push(n.labelKo ?? n.label);
  n.domain = path.length > 0 ? path : ["전체"];
}

// Validate prerequisite / related references early (fail loud in dev).
for (const n of seeds) {
  for (const ref of [...(n.prerequisiteIds ?? []), ...(n.relatedIds ?? [])]) {
    if (!byId.has(ref)) throw new Error(`Unknown reference "${ref}" on node "${n.id}"`);
  }
}

/* Flat edge list */

const edgeList: GraphEdge[] = [];
const seenRelated = new Set<string>();

// Pairs already connected by a requires edge: a related edge between them
// would just draw a parallel curve, so those are suppressed below.
const requiresPairs = new Set<string>();
for (const n of seeds) {
  for (const p of n.prerequisiteIds ?? []) {
    requiresPairs.add([p, n.id].sort().join("→"));
  }
}

for (const n of seeds) {
  for (const childId of n.childrenIds ?? []) {
    edgeList.push({ source: n.id, target: childId, type: "contains" });
  }
  // requires: prerequisite → dependent (arrow points to what builds on it).
  for (const p of n.prerequisiteIds ?? []) {
    edgeList.push({ source: p, target: n.id, type: "requires" });
  }
  for (const r of n.relatedIds ?? []) {
    const key = [n.id, r].sort().join("→");
    if (seenRelated.has(key) || requiresPairs.has(key)) continue;
    seenRelated.add(key);
    edgeList.push({ source: n.id, target: r, type: "related", weight: 0.5 });
  }
}

// lean_dependency: mock Lean-level imports — prerequisite pairs where both
// sides have formalized declarations.
for (const n of seeds) {
  if (!n.leanDeclarations?.length) continue;
  for (const p of n.prerequisiteIds ?? []) {
    if (byId.get(p)?.leanDeclarations?.length) {
      edgeList.push({ source: p, target: n.id, type: "lean_dependency" });
    }
  }
}

// axiom_dependency: results whose standard proofs lean on Choice.
for (const target of ["zorn_lemma", "hahn_banach", "cardinal", "zfc"]) {
  edgeList.push({ source: "ax_choice", target, type: "axiom_dependency" });
}

export const GRAPH_NODES: GraphNode[] = seeds;
export const GRAPH_EDGES: GraphEdge[] = edgeList;
export const NODE_MAP: ReadonlyMap<string, GraphNode> = byId;
export const ROOT_ID = "mathematics";
