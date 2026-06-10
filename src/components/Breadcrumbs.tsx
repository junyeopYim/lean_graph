"use client";

import type { GraphNode } from "@/types/graph";

type Props = {
  path: GraphNode[];
  onNavigate: (id: string) => void;
  onUp: () => void;
};

export function Breadcrumbs({ path, onNavigate, onUp }: Props) {
  const canGoUp = path.length > 1;
  return (
    <nav
      aria-label="경로"
      className="pointer-events-auto flex max-w-[60vw] flex-wrap items-center gap-1 text-[12px] text-[#6b7080]"
    >
      <button
        onClick={onUp}
        disabled={!canGoUp}
        className="mr-1 rounded-md border border-black/8 bg-white/70 px-2 py-0.5 text-[11px] backdrop-blur transition-colors hover:bg-white disabled:opacity-35 disabled:hover:bg-white/70"
        title="상위로 돌아가기"
      >
        ← 상위로
      </button>
      {path.map((n, i) => {
        const last = i === path.length - 1;
        const label = i === 0 ? "전체 수학" : (n.labelKo ?? n.label);
        return (
          <span key={n.id} className="flex items-center gap-1">
            {i > 0 && <span className="text-[#b8b4a8]">›</span>}
            {last ? (
              // The current focus is not a link — clicking it would have to
              // pick between "re-center" (no-op) and the panel toggle.
              <span aria-current="page" className="px-0.5 font-semibold text-[#2c3145]">
                {label}
              </span>
            ) : (
              <button
                onClick={() => onNavigate(n.id)}
                className="rounded px-0.5 transition-colors hover:text-[#2c3145]"
              >
                {label}
              </button>
            )}
          </span>
        );
      })}
    </nav>
  );
}
