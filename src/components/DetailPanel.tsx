"use client";

import { useState } from "react";
import type { GraphNode } from "@/types/graph";
import {
  getDependents,
  getPrerequisites,
  getRelatedNodes,
  KIND_LABEL_KO,
  KIND_STYLE,
} from "@/lib/graphUtils";
import { LeanPanel } from "@/components/LeanPanel";

type Props = {
  node: GraphNode;
  /** Whether this node is already the center of the graph. */
  isCurrentFocus: boolean;
  onClose: () => void;
  onFocusNode: (id: string) => void;
  onNavigate: (id: string) => void;
  onGoUp: () => void;
};

type Tab = "overview" | "prereq" | "lean" | "related";

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

function ChipSection({
  title,
  nodes,
  onNavigate,
  emptyText,
}: {
  title: string;
  nodes: GraphNode[];
  onNavigate: (id: string) => void;
  emptyText?: string;
}) {
  if (nodes.length === 0) {
    return emptyText ? (
      <p className="rounded-xl bg-[#f4f2ec] px-3 py-2.5 text-[12px] text-[#6e7387]">
        {emptyText}
      </p>
    ) : null;
  }
  return (
    <div>
      <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9b9fae]">
        {title}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {nodes.map((n) => (
          <Chip key={n.id} node={n} onClick={() => onNavigate(n.id)} />
        ))}
      </div>
    </div>
  );
}

export function DetailPanel({
  node,
  isCurrentFocus,
  onClose,
  onFocusNode,
  onNavigate,
  onGoUp,
}: Props) {
  const style = KIND_STYLE[node.kind];
  const prereqs = getPrerequisites(node.id);
  const related = getRelatedNodes(node.id);
  const dependents = getDependents(node.id);
  const leanCount = node.leanRefs?.length ?? 0;

  const [tab, setTab] = useState<Tab>("overview");

  const tabs: Array<{ id: Tab; label: string; badge?: number }> = [
    { id: "overview", label: "개요" },
    { id: "prereq", label: "선행" },
    { id: "lean", label: "Lean", badge: leanCount > 0 ? leanCount : undefined },
    { id: "related", label: "관련" },
  ];

  return (
    <section
      aria-label={`${node.label} 상세 정보`}
      className="pointer-events-auto flex max-h-full w-[320px] flex-col overflow-hidden rounded-2xl border border-black/6 bg-white/88 shadow-[0_14px_44px_rgba(40,44,66,0.13)] backdrop-blur"
    >
      <div className="flex items-start justify-between gap-2 px-4 pb-2.5 pt-3.5">
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

      <div
        role="tablist"
        aria-label="상세 정보 탭"
        className="flex gap-0.5 border-b border-black/6 px-3"
        onKeyDown={(e) => {
          const ids = tabs.map((t) => t.id);
          const i = ids.indexOf(tab);
          let next: Tab | null = null;
          if (e.key === "ArrowRight") next = ids[(i + 1) % ids.length];
          else if (e.key === "ArrowLeft") next = ids[(i - 1 + ids.length) % ids.length];
          else if (e.key === "Home") next = ids[0];
          else if (e.key === "End") next = ids[ids.length - 1];
          if (next) {
            e.preventDefault();
            setTab(next);
            document.getElementById(`detail-tab-${next}`)?.focus();
          }
        }}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            id={`detail-tab-${t.id}`}
            role="tab"
            aria-selected={tab === t.id}
            aria-controls="detail-tabpanel"
            tabIndex={tab === t.id ? 0 : -1}
            onClick={() => setTab(t.id)}
            className={`-mb-px flex items-center gap-1 rounded-t-lg border-b-2 px-2.5 py-1.5 text-[11.5px] transition-colors ${
              tab === t.id
                ? "border-[#2f3a55] font-semibold text-[#2c3145]"
                : "border-transparent text-[#8d92a3] hover:text-[#565b6e]"
            }`}
          >
            {t.label}
            {t.badge !== undefined && (
              <span className="rounded-full bg-[#4e8f8a]/15 px-1.5 py-px text-[9px] font-semibold text-[#3d736f]">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id="detail-tabpanel"
        aria-labelledby={`detail-tab-${tab}`}
        tabIndex={0}
        className="thin-scroll flex-1 overflow-y-auto px-4 py-3"
      >
        {tab === "overview" && (
          <>
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
          </>
        )}

        {tab === "prereq" && (
          <ChipSection
            title="선행 개념"
            nodes={prereqs}
            onNavigate={onNavigate}
            emptyText="등록된 선행 개념이 없습니다."
          />
        )}

        {tab === "lean" && (
          <div className="flex flex-col gap-2.5">
            {node.leanFormalizationDifficulty && (
              <Row label="형식화 난이도" value={node.leanFormalizationDifficulty} />
            )}
            <LeanPanel node={node} />
          </div>
        )}

        {tab === "related" && (
          <div className="flex flex-col gap-3.5">
            <ChipSection
              title="관련 노드"
              nodes={related}
              onNavigate={onNavigate}
              emptyText={dependents.length === 0 ? "등록된 관련 노드가 없습니다." : undefined}
            />
            <ChipSection
              title="이 개념을 사용하는 결과"
              nodes={dependents.slice(0, 8)}
              onNavigate={onNavigate}
            />
          </div>
        )}
      </div>

      {/* Since v0.2 every click already centers its node, so the panel
          almost always shows the current center — offer the next useful
          move instead of a no-op "center this" button. */}
      {(!isCurrentFocus || node.parentId) && (
        <div className="border-t border-black/5 p-3">
          {!isCurrentFocus ? (
            <button
              onClick={() => onFocusNode(node.id)}
              className="w-full rounded-xl bg-[#2f3a55] py-2 text-[12.5px] font-medium text-[#f5f3ec] transition-colors hover:bg-[#3a4768]"
            >
              이 노드를 중심으로 보기
            </button>
          ) : (
            <button
              onClick={onGoUp}
              className="w-full rounded-xl bg-[#2f3a55] py-2 text-[12.5px] font-medium text-[#f5f3ec] transition-colors hover:bg-[#3a4768]"
            >
              ← 상위 분야로 이동
            </button>
          )}
        </div>
      )}
    </section>
  );
}
