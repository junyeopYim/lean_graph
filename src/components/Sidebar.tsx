"use client";

import type { DifficultyCeiling, NodeKind, ViewMode } from "@/types/graph";
import { KIND_LABEL_KO, KIND_STYLE } from "@/lib/graphUtils";

type Props = {
  mode: ViewMode;
  enabledKinds: ReadonlySet<NodeKind>;
  difficultyCeiling: DifficultyCeiling;
  hasSelection: boolean;
  onModeChange: (m: ViewMode) => void;
  onToggleKind: (k: NodeKind) => void;
  onDifficultyChange: (d: DifficultyCeiling) => void;
  onFocusSelected: () => void;
  onResetView: () => void;
};

const MODES: Array<{ id: ViewMode; label: string }> = [
  { id: "concept", label: "ZFC 개념 지도" },
  { id: "curriculum", label: "커리큘럼 그래프" },
  { id: "lean", label: "Lean 형식 의존성" },
];

const FILTER_KINDS: NodeKind[] = ["axiom", "definition", "structure", "theorem", "category"];

const DIFFICULTIES: Array<{ id: DifficultyCeiling; label: string }> = [
  { id: "all", label: "전체" },
  { id: "ug-early", label: "학부 초반" },
  { id: "ug-late", label: "학부 후반" },
  { id: "grad", label: "석사" },
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9b9fae]">
      {children}
    </div>
  );
}

export function Sidebar({
  mode,
  enabledKinds,
  difficultyCeiling,
  hasSelection,
  onModeChange,
  onToggleKind,
  onDifficultyChange,
  onFocusSelected,
  onResetView,
}: Props) {
  return (
    <aside className="pointer-events-auto w-[196px] rounded-2xl border border-black/6 bg-white/72 p-3.5 shadow-[0_8px_28px_rgba(40,44,66,0.07)] backdrop-blur">
      <SectionTitle>보기 모드</SectionTitle>
      <div className="flex flex-col gap-0.5">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => onModeChange(m.id)}
            className={`rounded-lg px-2 py-1 text-left text-[12px] transition-colors ${
              mode === m.id
                ? "bg-[#2f3a55] font-medium text-[#f5f3ec]"
                : "text-[#565b6e] hover:bg-black/4"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="my-3 border-t border-black/6" />

      <SectionTitle>표시 필터</SectionTitle>
      <div className="flex flex-col gap-0.5">
        {FILTER_KINDS.map((k) => {
          const on = enabledKinds.has(k);
          const style = KIND_STYLE[k];
          return (
            <label
              key={k}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-0.5 text-[12px] text-[#565b6e] transition-colors hover:bg-black/4"
            >
              <input
                type="checkbox"
                checked={on}
                onChange={() => onToggleKind(k)}
                className="h-3 w-3 accent-[#2f3a55]"
              />
              <span
                className="h-2 w-2 rounded-full border"
                style={{
                  background: on ? style.fill : "transparent",
                  borderColor: style.stroke,
                  opacity: on ? 1 : 0.4,
                }}
              />
              <span style={{ opacity: on ? 1 : 0.5 }}>{KIND_LABEL_KO[k]}</span>
            </label>
          );
        })}
      </div>

      <div className="my-3 border-t border-black/6" />

      <SectionTitle>개념 난이도</SectionTitle>
      <div className="grid grid-cols-2 gap-1">
        {DIFFICULTIES.map((d) => (
          <button
            key={d.id}
            onClick={() => onDifficultyChange(d.id)}
            className={`rounded-md px-1.5 py-1 text-[11px] transition-colors ${
              difficultyCeiling === d.id
                ? "bg-[#2f3a55] font-medium text-[#f5f3ec]"
                : "bg-black/3 text-[#565b6e] hover:bg-black/7"
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className="my-3 border-t border-black/6" />

      <div className="flex flex-col gap-1.5">
        <button
          onClick={onFocusSelected}
          disabled={!hasSelection}
          className="rounded-lg border border-[#2f3a55]/20 bg-white/60 px-2 py-1.5 text-[11.5px] font-medium text-[#2f3a55] transition-colors hover:bg-white disabled:opacity-35"
        >
          선택 노드 중심 보기
        </button>
        <button
          onClick={onResetView}
          className="rounded-lg bg-black/4 px-2 py-1.5 text-[11.5px] text-[#565b6e] transition-colors hover:bg-black/8"
        >
          전체로 돌아가기
        </button>
      </div>
    </aside>
  );
}
