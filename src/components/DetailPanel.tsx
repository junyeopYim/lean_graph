"use client";

import type { GraphNode } from "@/types/graph";
import {
  getDependents,
  getPrerequisites,
  getRelatedNodes,
  KIND_LABEL_KO,
  KIND_STYLE,
} from "@/lib/graphUtils";

type Props = {
  node: GraphNode;
  onClose: () => void;
  onFocusNode: (id: string) => void;
  onNavigate: (id: string) => void;
};

function Chip({ node, onClick }: { node: GraphNode; onClick: () => void }) {
  const style = KIND_STYLE[node.kind];
  return (
    <button
      onClick={onClick}
      className="rounded-full border px-2.5 py-0.5 text-[11px] transition-transform hover:-translate-y-px"
      style={{ background: style.fill, borderColor: `${style.stroke}55`, color: style.text }}
      title={node.label}
    >
      {node.labelKo ?? node.label}
    </button>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[88px_1fr] gap-x-2 py-0.5 text-[12px]">
      <span className="text-[#9094a6]">{label}</span>
      <span className="text-[#3a3f53]">{value}</span>
    </div>
  );
}

export function DetailPanel({ node, onClose, onFocusNode, onNavigate }: Props) {
  const style = KIND_STYLE[node.kind];
  const prereqs = getPrerequisites(node.id);
  const related = getRelatedNodes(node.id);
  const dependents = getDependents(node.id);

  return (
    <section
      aria-label={`${node.label} 상세 정보`}
      className="pointer-events-auto flex max-h-full w-[320px] flex-col overflow-hidden rounded-2xl border border-black/6 bg-white/88 shadow-[0_14px_44px_rgba(40,44,66,0.13)] backdrop-blur"
    >
      <div className="flex items-start justify-between gap-2 border-b border-black/5 px-4 pb-3 pt-3.5">
        <div>
          <span
            className="mb-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{ background: style.fill, color: style.text }}
          >
            {KIND_LABEL_KO[node.kind]}
          </span>
          <h2 className="font-display text-[17px] font-semibold leading-snug text-[#23283b]">
            {node.label}
          </h2>
          {node.labelKo && (
            <div className="text-[12px] text-[#6e7387]">{node.labelKo}</div>
          )}
        </div>
        <button
          onClick={onClose}
          aria-label="닫기"
          className="rounded-md px-1.5 py-0.5 text-[15px] leading-none text-[#9094a6] transition-colors hover:bg-black/5 hover:text-[#2c3145]"
        >
          ×
        </button>
      </div>

      <div className="thin-scroll flex-1 overflow-y-auto px-4 py-3">
        <Row label="분야" value={(node.domain ?? []).join(" · ") || "—"} />
        {node.conceptualDifficulty && (
          <Row label="개념 난이도" value={node.conceptualDifficulty} />
        )}
        {node.leanFormalizationDifficulty && (
          <Row label="Lean 형식화" value={node.leanFormalizationDifficulty} />
        )}

        {node.summary && (
          <p className="mt-2.5 rounded-xl bg-[#f4f2ec] px-3 py-2.5 text-[12px] leading-relaxed text-[#4a5068]">
            {node.summary}
          </p>
        )}

        {prereqs.length > 0 && (
          <div className="mt-3.5">
            <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9b9fae]">
              선행 개념
            </div>
            <div className="flex flex-wrap gap-1.5">
              {prereqs.map((p) => (
                <Chip key={p.id} node={p} onClick={() => onNavigate(p.id)} />
              ))}
            </div>
          </div>
        )}

        {related.length > 0 && (
          <div className="mt-3.5">
            <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9b9fae]">
              관련 노드
            </div>
            <div className="flex flex-wrap gap-1.5">
              {related.map((r) => (
                <Chip key={r.id} node={r} onClick={() => onNavigate(r.id)} />
              ))}
            </div>
          </div>
        )}

        {dependents.length > 0 && (
          <div className="mt-3.5">
            <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9b9fae]">
              이 개념을 사용하는 결과
            </div>
            <div className="flex flex-wrap gap-1.5">
              {dependents.slice(0, 8).map((d) => (
                <Chip key={d.id} node={d} onClick={() => onNavigate(d.id)} />
              ))}
            </div>
          </div>
        )}

        {node.leanDeclarations && node.leanDeclarations.length > 0 && (
          <div className="mt-3.5">
            <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9b9fae]">
              Lean declarations
              <span className="rounded bg-[#4e8f8a]/12 px-1 py-px text-[9px] font-medium normal-case tracking-normal text-[#3d736f]">
                mock
              </span>
            </div>
            <ul className="flex flex-col gap-1">
              {node.leanDeclarations.map((d) => (
                <li
                  key={d}
                  className="truncate rounded-md bg-[#2f3a55]/5 px-2 py-1 font-mono text-[10.5px] text-[#3a4258]"
                  title={d}
                >
                  {d}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="border-t border-black/5 p-3">
        <button
          onClick={() => onFocusNode(node.id)}
          className="w-full rounded-xl bg-[#2f3a55] py-2 text-[12.5px] font-medium text-[#f5f3ec] transition-colors hover:bg-[#3a4768]"
        >
          이 노드를 중심으로 보기
        </button>
      </div>
    </section>
  );
}
