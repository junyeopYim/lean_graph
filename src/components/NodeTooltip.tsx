"use client";

import type { GraphNode } from "@/types/graph";
import { VIEWBOX } from "@/lib/graphLayout";
import { getPrerequisites, KIND_LABEL_KO, KIND_STYLE } from "@/lib/graphUtils";

type Props = {
  node: GraphNode;
  x: number;
  y: number;
  nodeR: number;
};

const CARD_W = 264;
const CARD_H = 230;

/**
 * Magnified hover preview, rendered inside the SVG via <foreignObject> so it
 * tracks the node in graph coordinates. Flips horizontally/vertically near
 * the viewBox edges. Pointer events are disabled to avoid hover flicker.
 */
export function NodeTooltip({ node, x, y, nodeR }: Props) {
  const style = KIND_STYLE[node.kind];
  const prereqs = getPrerequisites(node.id);

  const gap = nodeR * 1.9 + 14;
  const right = x + gap + CARD_W < VIEWBOX.x + VIEWBOX.width - 8;
  const fx = right ? x + gap : x - gap - CARD_W;
  const fy = Math.max(
    VIEWBOX.y + 8,
    Math.min(y - CARD_H / 2, VIEWBOX.y + VIEWBOX.height - CARD_H - 8),
  );

  return (
    <foreignObject
      x={fx}
      y={fy}
      width={CARD_W}
      height={CARD_H}
      style={{ pointerEvents: "none", overflow: "visible" }}
    >
      <div
        className="rounded-xl border border-black/8 bg-white/95 px-4 py-3 shadow-[0_10px_32px_rgba(38,42,64,0.16)] backdrop-blur"
        style={{ fontSize: 11, lineHeight: 1.45, color: "#33384a" }}
      >
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <div className="font-display text-[13.5px] font-semibold leading-tight text-[#23283b]">
              {node.label}
            </div>
            {node.labelKo && (
              <div className="text-[11px] text-[#6e7387]">{node.labelKo}</div>
            )}
          </div>
          <span
            className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{ background: style.fill, color: style.text }}
          >
            {KIND_LABEL_KO[node.kind]}
          </span>
        </div>

        <div className="mt-2 grid grid-cols-[64px_1fr] gap-x-2 gap-y-1 text-[10.5px]">
          <span className="text-[#9094a6]">분야</span>
          <span>{(node.domain ?? []).join(" · ") || "—"}</span>
          {node.conceptualDifficulty && (
            <>
              <span className="text-[#9094a6]">개념 난이도</span>
              <span>{node.conceptualDifficulty}</span>
            </>
          )}
          {node.leanFormalizationDifficulty && (
            <>
              <span className="text-[#9094a6]">Lean 형식화</span>
              <span>{node.leanFormalizationDifficulty}</span>
            </>
          )}
          {prereqs.length > 0 && (
            <>
              <span className="text-[#9094a6]">선행 개념</span>
              <span className="text-[#4a5068]">
                {prereqs
                  .slice(0, 4)
                  .map((p) => p.labelKo ?? p.label)
                  .join(", ")}
                {prereqs.length > 4 ? ` 외 ${prereqs.length - 4}` : ""}
              </span>
            </>
          )}
        </div>

        {node.summary && (
          <p className="mt-2 border-t border-black/5 pt-2 text-[10.5px] leading-relaxed text-[#565b6e]">
            {node.summary}
          </p>
        )}
      </div>
    </foreignObject>
  );
}
