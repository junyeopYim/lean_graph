"use client";

import { useRef, useState } from "react";
import type { GraphNode, LeanDeclarationKind, LeanDeclarationRef } from "@/types/graph";
import {
  CONFIDENCE_LABEL,
  declarationDocsUrl,
  declarationToAxiomsCommand,
  declarationToCheckCommand,
  importCommand,
  moduleToSourceUrl,
} from "@/lib/leanUtils";

const KIND_BADGE: Record<LeanDeclarationKind, { bg: string; text: string }> = {
  theorem: { bg: "#f3e4dd", text: "#7c4636" },
  lemma: { bg: "#f3e4dd", text: "#7c4636" },
  def: { bg: "#dfeae6", text: "#39615a" },
  abbrev: { bg: "#dfeae6", text: "#39615a" },
  class: { bg: "#e3e9f2", text: "#3c4d6e" },
  structure: { bg: "#ece5f0", text: "#5f4a6d" },
  inductive: { bg: "#ece5f0", text: "#5f4a6d" },
  instance: { bg: "#eceae4", text: "#5d5a4e" },
  axiom: { bg: "#f1e9d4", text: "#6f5b1f" },
};

function CopyButton({
  label,
  text,
  copiedKey,
  myKey,
  onCopy,
}: {
  label: string;
  text: string;
  copiedKey: string | null;
  myKey: string;
  onCopy: (key: string, text: string) => void;
}) {
  const copied = copiedKey === myKey;
  return (
    <button
      onClick={() => onCopy(myKey, text)}
      title={text}
      className={`rounded-md px-1.5 py-0.5 font-mono text-[10px] transition-colors ${
        copied
          ? "bg-[#4e8f8a]/15 text-[#3d736f]"
          : "bg-black/4 text-[#565b6e] hover:bg-black/8"
      }`}
    >
      {copied ? "복사됨 ✓" : label}
    </button>
  );
}

function DeclarationCard({
  decl,
  copiedKey,
  onCopy,
}: {
  decl: LeanDeclarationRef;
  copiedKey: string | null;
  onCopy: (key: string, text: string) => void;
}) {
  const badge = KIND_BADGE[decl.kind];
  const sourceUrl = decl.sourceUrl ?? moduleToSourceUrl(decl.module);
  return (
    <div className="rounded-xl border border-black/6 bg-white/70 p-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div
            className="truncate font-mono text-[11.5px] font-semibold text-[#2c3145]"
            title={decl.name}
          >
            {decl.name}
          </div>
          <div className="truncate font-mono text-[9.5px] text-[#9094a6]" title={decl.module}>
            {decl.module}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <span
            className="rounded-full px-1.5 py-px text-[9px] font-medium"
            style={{ background: badge.bg, color: badge.text }}
          >
            {decl.kind}
          </span>
          <span
            className="rounded-full bg-black/4 px-1.5 py-px text-[9px] text-[#8d92a3]"
            title={
              decl.confidence === "docs_verified"
                ? "loogle / mathlib4 docs에서 확인된 항목"
                : decl.confidence === "manual"
                  ? "수동 작성 — 모듈 경로가 부정확할 수 있음"
                  : "자동 추출 파이프라인 산출물"
            }
          >
            {CONFIDENCE_LABEL[decl.confidence]}
          </span>
        </div>
      </div>

      {decl.statement && (
        <pre className="thin-scroll mt-2 max-h-28 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-[#2f3a55]/5 px-2 py-1.5 font-mono text-[10px] leading-relaxed text-[#3a4258]">
          {decl.statement}
        </pre>
      )}
      {decl.informalStatement && (
        <p className="mt-1.5 text-[11px] leading-relaxed text-[#565b6e]">
          {decl.informalStatement}
        </p>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-1">
        <a
          href={declarationDocsUrl(decl)}
          target="_blank"
          rel="noreferrer"
          className="rounded-md bg-[#2f3a55]/8 px-1.5 py-0.5 text-[10px] font-medium text-[#2f3a55] transition-colors hover:bg-[#2f3a55]/15"
        >
          docs ↗
        </a>
        {sourceUrl && (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-md bg-[#2f3a55]/8 px-1.5 py-0.5 text-[10px] font-medium text-[#2f3a55] transition-colors hover:bg-[#2f3a55]/15"
          >
            source ↗
          </a>
        )}
        <span className="mx-0.5 h-3 w-px bg-black/8" />
        <CopyButton
          label="import"
          text={importCommand(decl.module)}
          myKey={`${decl.name}:import`}
          copiedKey={copiedKey}
          onCopy={onCopy}
        />
        <CopyButton
          label="#check"
          text={declarationToCheckCommand(decl.name)}
          myKey={`${decl.name}:check`}
          copiedKey={copiedKey}
          onCopy={onCopy}
        />
        <CopyButton
          label="#print axioms"
          text={declarationToAxiomsCommand(decl.name)}
          myKey={`${decl.name}:axioms`}
          copiedKey={copiedKey}
          onCopy={onCopy}
        />
      </div>

      {decl.imports && decl.imports.length > 0 && (
        <details className="mt-1.5">
          <summary className="cursor-pointer text-[10px] text-[#9094a6] hover:text-[#565b6e]">
            모듈 imports {decl.imports.length}개
          </summary>
          <ul className="mt-1 flex flex-col gap-0.5">
            {decl.imports.map((m) => (
              <li key={m} className="truncate font-mono text-[9.5px] text-[#7a7f92]" title={m}>
                {m}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

/** Lean declaration metadata for one node (the DetailPanel "Lean" tab). */
export function LeanPanel({ node }: { node: GraphNode }) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onCopy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      if (timerRef.current) clearTimeout(timerRef.current);
      setCopiedKey(key);
      timerRef.current = setTimeout(() => setCopiedKey(null), 1400);
    } catch {
      // Clipboard unavailable (permissions / non-secure context) — ignore.
    }
  };

  const refs = node.leanRefs ?? [];
  // Legacy mock names not yet promoted to full refs.
  const refNames = new Set(refs.map((r) => r.name));
  const legacy = (node.leanDeclarations ?? []).filter((d) => !refNames.has(d));

  if (refs.length === 0 && legacy.length === 0) {
    return (
      <p className="rounded-xl bg-[#f4f2ec] px-3 py-2.5 text-[12px] leading-relaxed text-[#6e7387]">
        아직 연결된 Lean 선언이 없습니다.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {refs.map((decl) => (
        <DeclarationCard
          key={decl.name}
          decl={decl}
          copiedKey={copiedKey}
          onCopy={onCopy}
        />
      ))}

      {legacy.length > 0 && (
        <div>
          <div className="mb-1 mt-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9b9fae]">
            참고 이름 <span className="font-normal normal-case">(미검증)</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {legacy.map((d) => {
              // Some legacy strings are module paths, not declarations —
              // a module can be imported but not #check-ed.
              const isModulePath = d.startsWith("Mathlib.");
              const command = isModulePath
                ? importCommand(d)
                : declarationToCheckCommand(d);
              return (
              <button
                key={d}
                onClick={() => onCopy(`legacy:${d}`, command)}
                title={`${command} 복사`}
                className={`rounded-md px-1.5 py-0.5 font-mono text-[10px] transition-colors ${
                  copiedKey === `legacy:${d}`
                    ? "bg-[#4e8f8a]/15 text-[#3d736f]"
                    : "bg-black/4 text-[#7a7f92] hover:bg-black/8"
                }`}
              >
                {copiedKey === `legacy:${d}` ? "복사됨 ✓" : d}
              </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
