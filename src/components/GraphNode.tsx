"use client";

import { memo } from "react";
import type { PositionedNode } from "@/lib/graphLayout";
import { VIEWBOX, wrapLabel } from "@/lib/graphLayout";
import { KIND_STYLE } from "@/lib/graphUtils";

/** Rough glyph-width estimate in em units (Hangul wide, caps medium, …). */
function estWidthEm(text: string): number {
  let w = 0;
  for (const ch of text) {
    if (/[가-힯㄰-㆏一-鿿぀-ヿ]/.test(ch)) w += 0.95;
    else if (/[A-ZÀ-Þ–—@]/.test(ch)) w += 0.68;
    else if (/[iljft.,'’·:;\s()[\]\-]/.test(ch)) w += 0.32;
    else w += 0.52;
  }
  return w;
}

type Props = {
  positioned: PositionedNode;
  x: number;
  y: number;
  r: number;
  hovered: boolean;
  selected: boolean;
  dimmed: boolean;
  filteredOut: boolean;
  hasChildren: boolean;
  onHover: (id: string | null) => void;
  onClick: (id: string) => void;
};

/** A single node: positioned <g> + CSS-scaled inner <g> for the hover zoom. */
function GraphNodeInner({
  positioned,
  x,
  y,
  r,
  hovered,
  selected,
  dimmed,
  filteredOut,
  hasChildren,
  onHover,
  onClick,
}: Props) {
  const { node, ring } = positioned;
  const style = KIND_STYLE[node.kind];
  const isCenter = ring === 0;

  const opacity = filteredOut ? 0.08 : dimmed ? 0.2 : ring === 2 ? 0.82 : 1;

  // Resting ring-2 previews keep a single ellipsized line; everything else
  // wraps to at most two lines.
  const labelLines = isCenter
    ? wrapLabel(node.label, 12)
    : ring === 2 && !hovered
      ? [node.label.length > 13 ? node.label.slice(0, 12) + "…" : node.label]
      : hovered
        ? wrapLabel(node.label, 16)
        : wrapLabel(node.label, 14);

  // Center labels shrink (width-based) so wrapped text stays inside the
  // r=54 circle; ~96 SVG units is the safe chord at the text bands.
  const longestEm = Math.max(...labelLines.map(estWidthEm));
  const fontSize = isCenter
    ? Math.max(11, Math.min(17, 96 / longestEm))
    : ring === 1
      ? node.kind === "category"
        ? 12.5
        : 11
      : 9;

  // Hover zoom; ring-2 nodes near the bottom edge get a reduced scale so
  // the enlarged label stack stays inside the viewBox.
  let scale = 1;
  if (hovered) {
    if (ring === 2) {
      const stack =
        r + 9 + 6.4 + (labelLines.length - 1) * 9.5 + (node.labelKo ? 9.5 : 0) + 3;
      const room = VIEWBOX.y + VIEWBOX.height - 6 - y;
      scale = Math.min(2.0, Math.max(1.25, room / stack));
    } else {
      scale = 1.7;
    }
  }

  // Korean sub-label of the center node: compress overlong text to fit.
  const koWidth = node.labelKo ? estWidthEm(node.labelKo) * 10.5 : 0;

  const labelY = isCenter ? 0 : r + (ring === 2 ? 9 : 13);

  return (
    <g
      transform={`translate(${x.toFixed(1)},${y.toFixed(1)})`}
      style={{
        opacity,
        transition: "opacity 280ms ease",
        cursor: filteredOut ? "default" : "pointer",
        pointerEvents: filteredOut ? "none" : "auto",
      }}
      className="graph-node-enter"
      role="button"
      aria-label={`${node.label}${node.labelKo ? ` (${node.labelKo})` : ""}`}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
      onClick={(e) => {
        e.stopPropagation();
        onClick(node.id);
      }}
    >
      <g
        style={{
          transform: `scale(${scale})`,
          transition: "transform 240ms cubic-bezier(0.34, 1.3, 0.64, 1)",
        }}
      >
        {selected && (
          <circle
            r={r + 6}
            fill="none"
            stroke={style.stroke}
            strokeWidth={1.2}
            strokeDasharray="3 3"
            opacity={0.85}
          />
        )}
        <circle
          r={r}
          fill={isCenter ? style.fill : style.fill}
          stroke={isCenter ? "#23304d" : style.stroke}
          strokeWidth={hovered ? 1.8 : isCenter ? 0 : ring === 2 ? 1 : 1.4}
          style={{ transition: "stroke-width 200ms ease" }}
        />
        {/* Small affordance dot for nodes that can be entered. */}
        {hasChildren && !isCenter && (
          <circle r={2.1} cy={-r + 5.5} fill={style.stroke} opacity={0.8} />
        )}

        {isCenter ? (
          <text
            textAnchor="middle"
            fill={style.text}
            fontSize={fontSize}
            fontWeight={600}
            className="font-display"
          >
            {labelLines.map((line, i) => (
              <tspan
                key={i}
                x={0}
                dy={
                  i === 0
                    ? labelLines.length > 1
                      ? -9
                      : node.labelKo
                        ? -5
                        : 5
                    : 15
                }
              >
                {line}
              </tspan>
            ))}
            {node.labelKo && (
              <tspan
                x={0}
                dy={16}
                fontSize={10.5}
                fontWeight={400}
                opacity={0.75}
                textLength={koWidth > 92 ? 92 : undefined}
                lengthAdjust={koWidth > 92 ? "spacingAndGlyphs" : undefined}
              >
                {node.labelKo}
              </tspan>
            )}
          </text>
        ) : (
          <text
            textAnchor="middle"
            fill={hovered ? style.text : "#454a59"}
            fontSize={fontSize}
            fontWeight={hovered || node.kind === "category" ? 600 : 450}
            style={{ transition: "fill 200ms ease" }}
          >
            {labelLines.map((line, i) => (
              <tspan key={i} x={0} dy={i === 0 ? labelY + fontSize * 0.8 : fontSize + 1.5}>
                {line}
              </tspan>
            ))}
            {hovered && node.labelKo && (
              <tspan x={0} dy={fontSize + 1.5} fontSize={fontSize - 2} opacity={0.7}>
                {node.labelKo}
              </tspan>
            )}
          </text>
        )}
      </g>
    </g>
  );
}

export const GraphNode = memo(GraphNodeInner);
