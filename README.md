# Lean Graph — 수학 지식 그래프 탐색기

Lean/Mathlib · ZFC · 학부~석사 수학의 **공리 / 정의 / 구조 / 정리**를
중앙에서 바깥으로 퍼지는 **2D 원형 트리(radial tree)** 로 탐색하는 웹앱의
프론트엔드 MVP입니다. 현재 단계는 실제 Lean 데이터 연동 없이 로컬 mock
데이터로 동작합니다.

탐색 흐름: **전체 수학 지도 → 대분류(해석학 등) → 세부 분야(함수해석학 등) →
개념/정리(Hahn–Banach 등)** 순으로 클릭해 들어가고, breadcrumb 또는 빈 화면
클릭으로 다시 나옵니다.

## 실행 방법

```bash
npm install
npm run dev        # http://localhost:3000
```

프로덕션 빌드:

```bash
npm run build
npm start
```

요구 사항: Node.js 18.18+ (개발은 Node 24에서 확인), 외부 백엔드 없음.

## 사용법 요약

| 동작 | 결과 |
| --- | --- |
| 분야(children 있는 노드) 클릭 | 그 노드를 중심으로 그래프가 부드럽게 재배치 |
| leaf(정리/정의/공리) 클릭 | 우측 상세 패널 열림 |
| 노드 hover | 노드 1.7~2배 확대 + 미리보기 카드, 연결 노드만 밝게 유지 |
| 빈 배경 클릭 / Esc | 패널 닫기 → 한 단계 위로 |
| 상단 검색 | label / 한국어 label / 분야로 검색, 선택 시 해당 노드로 이동 |
| 좌측 사이드바 | 보기 모드(개념/커리큘럼/Lean 의존성), 종류·난이도 필터 |
| 우하단 미니맵 | 12개 대분류로 바로 점프 |

## 주요 컴포넌트

```
src/
  app/page.tsx              # 진입점 — AppShell만 렌더
  components/
    AppShell.tsx            # 모든 상태(focus/hover/select/mode/filter/search) 보유
    Header.tsx              # 로고 · 검색(자동완성 드롭다운) · 외부 링크
    Sidebar.tsx             # 보기 모드, 종류 필터, 난이도 필터, 보기 버튼
    Breadcrumbs.tsx         # 전체 수학 › 해석학 › 함수해석학 › … + "상위로"
    RadialGraph.tsx         # SVG 캔버스 — 링 가이드, edge, 노드, 툴팁 조립
    GraphNode.tsx           # 노드 1개 — hover 확대(scale), 라벨 줄바꿈, 진입점 표시
    NodeTooltip.tsx         # hover 미리보기 카드(foreignObject, 그래프 좌표 추적)
    DetailPanel.tsx         # 상세 패널 — 난이도, 선행/관련 chips, Lean 선언 목록
    MiniMap.tsx             # 우하단 대분류 별자리 + 현재 위치 표시
  data/mathGraph.ts         # ★ mock 데이터 (~170 노드) + edge 자동 유도
  lib/
    graphLayout.ts          # radial 좌표 계산, 섹터 가중치, bezier path 헬퍼
    graphUtils.ts           # getChildren/getPrerequisites/검색/breadcrumb/필터
    useAnimatedLayout.ts    # focus 전환 시 노드 위치를 rAF로 트위닝하는 훅
  types/graph.ts            # GraphNode / GraphEdge / 난이도 타입
```

렌더링 파이프라인은 단방향입니다:

```
focusId ──computeRadialLayout()──▶ RadialLayout(노드 극좌표, contains edge)
        ──useAnimatedLayout()────▶ 프레임별 보간 좌표
        ──RadialGraph────────────▶ SVG (edge path는 d3-shape linkRadial 기반)
```

- 레이아웃은 focus 기준 **depth 2까지만** 그립니다. ring 1 = 직접 children,
  ring 2 = 손자 preview(브랜치당 개수 cap, 넘치면 `+N` 배지).
- children이 없는 노드를 중심으로 보면(상세 패널의 "이 노드를 중심으로 보기")
  선행 개념·관련·이 개념을 사용하는 결과들이 링에 배치됩니다.
- contains edge는 선명한 radial bezier, prerequisite는 dashed, related는 얇은
  곡선입니다. 보기 모드가 어떤 edge 종류를 그릴지 결정합니다
  (개념 지도: requires+related / 커리큘럼: requires+화살표 / Lean: lean_dependency+axiom_dependency).

## 데이터 모델

`src/types/graph.ts`:

```ts
type GraphNode = {
  id: string;
  label: string;            // 영문 이름
  labelKo?: string;         // 한국어 이름
  kind: "root" | "category" | "axiom" | "definition" | "structure" | "theorem";
  parentId?: string;        // breadcrumb에 쓰이는 단일 주 분류
  childrenIds?: string[];   // 선언 순서대로 자동 유도 (+cross-listing 허용)
  prerequisiteIds?: string[];
  relatedIds?: string[];
  domain?: string[];        // 상위 category 경로에서 자동 계산
  summary?: string;
  conceptualDifficulty?: "입문" | "학부 초반" | … | "연구 수준";
  leanFormalizationDifficulty?: "낮음" | "중간" | "높음" | "매우 높음";
  leanDeclarations?: string[];  // mock Mathlib 선언 이름
};

type GraphEdge = {
  source: string;
  target: string;
  type: "contains" | "requires" | "related" | "lean_dependency" | "axiom_dependency";
};
```

`data/mathGraph.ts`는 노드만 선언하면 나머지를 자동으로 만듭니다:

- `childrenIds` ← `parentId` 역방향 수집 (+ `CROSS_LINKS`로 교차 노출.
  예: 함수해석학은 해석학 소속이지만 최상위 링에도 보이고, 벡터공간은
  선형대수 소속이지만 함수해석학 링에도 보입니다)
- `contains` / `requires` / `related` edge ← parent/prereq/related 필드에서 유도
- `lean_dependency` ← 양쪽 모두 `leanDeclarations`가 있는 prerequisite 쌍
- `axiom_dependency` ← 선택공리(Choice)에 기대는 결과들(Zorn, Hahn–Banach 등)
- 존재하지 않는 id를 참조하면 모듈 로드 시점에 throw → 데이터 오타 즉시 검출

## 추후 실제 Lean/Mathlib 데이터와 연결하려면

바꿔야 할 곳은 사실상 한 곳입니다.

1. **`src/data/mathGraph.ts`를 데이터 소스 어댑터로 교체**
   — UI 전체는 `GRAPH_NODES` / `GRAPH_EDGES` / `NODE_MAP` / `ROOT_ID` export만
   바라봅니다. Lean 쪽 추출 결과(JSON)를 같은 `GraphNode[]` 형태로 변환해
   export하면 컴포넌트는 수정 없이 동작합니다.
   - Mathlib declaration 그래프는 `lake exe graph`, [mathlib4 docs 데이터],
     LeanDojo 추출 결과 등에서 얻을 수 있습니다.
   - declaration → `kind` 매핑(`theorem`/`def`/`structure`/`axiom`)과
     모듈 경로 → `parentId`(분류 트리) 매핑 규칙이 핵심 작업입니다.
2. 데이터가 커지면(수만 노드) **`lib/graphUtils.ts`의 인덱스 빌드와
   `searchNodes`** 를 서버 API 또는 사전 빌드된 인덱스로 옮기는 것을 권합니다.
   레이아웃은 focus 기준 depth 2만 계산하므로 그대로 확장됩니다.
3. 비동기 로딩이 필요해지면 `AppShell`에서 데이터를 props/context로 주입하도록
   바꾸면 됩니다 (현재는 정적 import).

## 현재 mock 데이터의 한계

- **수동 큐레이션**: 약 170개 노드는 손으로 고른 것이라 분야 간 깊이가
  고르지 않습니다 (예: 함수해석학은 15개, 기하학은 6개).
- **단순화된 분류**: 실제 수학은 DAG입니다. cross-listing을 두 곳만
  사용했고(함수해석학, 벡터공간), 다중 소속이 자연스러운 개념이 더 많습니다.
- **`leanDeclarations`는 mock**: 실제 Mathlib 이름을 본떴지만 버전 검증을
  거치지 않았고, 링크도 걸려 있지 않습니다.
- **난이도는 주관적 라벨**: 강의계획서 기반의 대략적 추정값입니다.
- **prerequisite는 대표 관계만**: 교육적으로 중요한 간선 위주이며 논리적
  의존성 전체가 아닙니다. `lean_dependency`도 실제 import 그래프가 아니라
  prerequisite에서 유도한 근사입니다.
- 검색은 단순 부분 문자열 매칭입니다 (fuzzy/동의어 없음).

## 기술 스택

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
SVG 렌더링 + `d3-shape`(radial link path 계산만 사용) · 상태 관리는
`useState`/`useMemo`만 사용.
