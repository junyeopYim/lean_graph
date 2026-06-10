"use client";

import { useEffect, useRef, useState } from "react";
import type { RadialLayout } from "@/lib/graphLayout";

export type AnimatedPos = { x: number; y: number; r: number };

const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/**
 * Tweens node positions (and visual radii) whenever the layout changes,
 * so refocusing the graph glides nodes to their new rings instead of
 * teleporting them. Entering nodes grow out of their layout parent's
 * previous position, which makes a click feel like "expanding into" the
 * branch.
 */
export function useAnimatedLayout(
  layout: RadialLayout,
  duration = 600,
): Map<string, AnimatedPos> {
  const currentRef = useRef<Map<string, AnimatedPos>>(new Map());
  const mountedRef = useRef(false);
  const [, setFrame] = useState(0);

  // First render (incl. SSR): snap to targets so hydration matches.
  if (!mountedRef.current) {
    currentRef.current = new Map(
      layout.nodes.map((p) => [p.node.id, { x: p.x, y: p.y, r: p.r }]),
    );
  }

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    const previous = currentRef.current;
    const starts = new Map<string, AnimatedPos>();
    const targets = new Map<string, AnimatedPos>();

    for (const p of layout.nodes) {
      targets.set(p.node.id, { x: p.x, y: p.y, r: p.r });
      const existing = previous.get(p.node.id);
      if (existing) {
        starts.set(p.node.id, { ...existing });
      } else {
        const origin = p.parentLayoutId
          ? previous.get(p.parentLayoutId)
          : undefined;
        starts.set(
          p.node.id,
          origin
            ? { x: origin.x, y: origin.y, r: Math.min(2, p.r) }
            : { x: p.x * 0.3, y: p.y * 0.3, r: Math.min(2, p.r) },
        );
      }
    }

    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / duration);
      const e = easeInOutCubic(t);
      const next = new Map<string, AnimatedPos>();
      for (const [id, target] of targets) {
        const s = starts.get(id)!;
        next.set(id, {
          x: s.x + (target.x - s.x) * e,
          y: s.y + (target.y - s.y) * e,
          r: s.r + (target.r - s.r) * e,
        });
      }
      currentRef.current = next;
      setFrame((f) => f + 1);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [layout, duration]);

  return currentRef.current;
}
