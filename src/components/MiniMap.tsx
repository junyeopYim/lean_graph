"use client";

import { ROOT_ID } from "@/data/mathGraph";
import { getChildren, KIND_STYLE } from "@/lib/graphUtils";

type Props = {
  /** Top-level category containing the current focus (breadcrumb[1]). */
  activeCategoryId?: string;
  focusLabel: string;
  onNavigate: (id: string) => void;
};

/**
 * Tiny constellation of the top-level map. Always shows where you are at
 * the global scale; clicking a dot jumps straight to that field.
 */
export function MiniMap({ activeCategoryId, focusLabel, onNavigate }: Props) {
  const categories = getChildren(ROOT_ID);
  const R = 40;

  return (
    <div className="pointer-events-auto flex flex-col items-center gap-1 rounded-2xl border border-black/6 bg-white/72 px-3 pb-2 pt-3 shadow-[0_8px_28px_rgba(40,44,66,0.07)] backdrop-blur">
      <svg width={104} height={104} viewBox="-52 -52 104 104">
        <circle r={R} fill="none" stroke="#e2ddd1" strokeWidth={1} strokeDasharray="1 4" />
        <circle
          r={5.5}
          fill={activeCategoryId ? "#c8c2b4" : "#2f3a55"}
          className="cursor-pointer"
          onClick={() => onNavigate(ROOT_ID)}
        >
          <title>전체 수학</title>
        </circle>
        {categories.map((c, i) => {
          const a = -Math.PI / 2 + (i / categories.length) * Math.PI * 2;
          const active = c.id === activeCategoryId;
          return (
            <circle
              key={c.id}
              // Rounded so SSR and client serialize identically (hydration).
              cx={Number((R * Math.cos(a)).toFixed(2))}
              cy={Number((R * Math.sin(a)).toFixed(2))}
              r={active ? 5 : 3}
              fill={active ? KIND_STYLE.category.stroke : "#cfcabd"}
              stroke={active ? "#2f3a55" : "none"}
              strokeWidth={active ? 1.2 : 0}
              className="cursor-pointer transition-[r,fill] duration-200"
              onClick={() => onNavigate(c.id)}
            >
              <title>{c.labelKo ?? c.label}</title>
            </circle>
          );
        })}
      </svg>
      <div className="max-w-[100px] truncate text-center text-[10px] text-[#8d92a3]">
        {focusLabel}
      </div>
    </div>
  );
}
