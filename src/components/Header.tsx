"use client";

import { useEffect, useRef, useState } from "react";
import type { GraphNode } from "@/types/graph";
import { KIND_LABEL_KO, KIND_STYLE } from "@/lib/graphUtils";

type Props = {
  query: string;
  results: GraphNode[];
  onQueryChange: (q: string) => void;
  onSelectResult: (id: string) => void;
  onGoHome: () => void;
};

export function Header({ query, results, onQueryChange, onSelectResult, onGoHome }: Props) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => setActive(0), [query]);

  // Close the dropdown on outside click.
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, []);

  const showList = open && query.trim().length > 0;

  const choose = (id: string) => {
    onSelectResult(id);
    setOpen(false);
  };

  return (
    <header className="relative z-30 flex h-14 shrink-0 items-center gap-6 border-b border-black/6 bg-[#f7f5f0]/85 px-5 backdrop-blur">
      <button onClick={onGoHome} className="flex items-baseline gap-2 text-left">
        <span className="font-display text-[19px] font-semibold tracking-tight text-[#2c3145]">
          Lean Graph
        </span>
        <span className="hidden text-[11px] text-[#8d92a3] sm:inline">
          수학 지식 그래프
        </span>
      </button>

      <div ref={boxRef} className="relative mx-auto w-full max-w-md">
        <input
          value={query}
          onChange={(e) => {
            onQueryChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (!showList || results.length === 0) {
              if (e.key === "Escape") setOpen(false);
              return;
            }
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => (a + 1) % results.length);
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => (a - 1 + results.length) % results.length);
            } else if (e.key === "Enter") {
              e.preventDefault();
              choose(results[Math.min(active, results.length - 1)].id);
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
          placeholder="정리·정의·분야 검색  (예: Hahn–Banach, 측도, topology)"
          className="w-full rounded-full border border-black/8 bg-white/80 px-4 py-1.5 text-[12.5px] text-[#33384a] placeholder:text-[#a3a7b6] focus:border-[#5d7299]/50 focus:outline-none"
          aria-label="노드 검색"
        />
        {showList && (
          <ul className="absolute left-0 right-0 top-[calc(100%+6px)] overflow-hidden rounded-xl border border-black/8 bg-white/97 shadow-[0_12px_36px_rgba(38,42,64,0.14)] backdrop-blur">
            {results.length === 0 && (
              <li className="px-4 py-2.5 text-[12px] text-[#9094a6]">
                검색 결과가 없습니다
              </li>
            )}
            {results.map((n, i) => {
              const style = KIND_STYLE[n.kind];
              return (
                <li key={n.id}>
                  <button
                    className={`flex w-full items-center gap-2.5 px-4 py-2 text-left text-[12.5px] transition-colors ${
                      i === active ? "bg-[#eef0f5]" : "hover:bg-[#f3f4f7]"
                    }`}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => choose(n.id)}
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full border"
                      style={{ background: style.fill, borderColor: style.stroke }}
                    />
                    <span className="font-medium text-[#2c3145]">{n.label}</span>
                    {n.labelKo && (
                      <span className="text-[11px] text-[#8d92a3]">{n.labelKo}</span>
                    )}
                    <span className="ml-auto shrink-0 text-[10px] text-[#a3a7b6]">
                      {KIND_LABEL_KO[n.kind]}
                      {n.domain?.length ? ` · ${n.domain[n.domain.length - 1]}` : ""}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <nav className="hidden items-center gap-4 text-[12px] text-[#6b7080] md:flex">
        <a
          href="https://leanprover-community.github.io/mathlib4_docs/"
          target="_blank"
          rel="noreferrer"
          className="transition-colors hover:text-[#2c3145]"
        >
          Mathlib
        </a>
        <a
          href="https://github.com/junyeopYim/lean_graph"
          target="_blank"
          rel="noreferrer"
          className="transition-colors hover:text-[#2c3145]"
        >
          GitHub
        </a>
      </nav>
    </header>
  );
}
