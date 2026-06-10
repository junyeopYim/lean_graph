import type { LeanDeclarationRef } from "@/types/graph";

/** mathlib4 docs page for a module, e.g. Mathlib.Algebra.Group.Defs. */
export function moduleToDocsUrl(module: string): string {
  return `https://leanprover-community.github.io/mathlib4_docs/${module.replaceAll(".", "/")}.html`;
}

/**
 * GitHub source for a module. Mathlib modules live in mathlib4; core
 * (`Init.*`, `Lean.*`) and other prefixes have no stable counterpart here.
 */
export function moduleToSourceUrl(module: string): string | undefined {
  if (!module.startsWith("Mathlib.")) return undefined;
  return `https://github.com/leanprover-community/mathlib4/blob/master/${module.replaceAll(".", "/")}.lean`;
}

/** Docs deep link for one declaration (page + #anchor). */
export function declarationDocsUrl(ref: LeanDeclarationRef): string {
  return ref.docsUrl ?? `${moduleToDocsUrl(ref.module)}#${ref.name}`;
}

export function declarationToCheckCommand(name: string): string {
  return `#check ${name}`;
}

export function declarationToAxiomsCommand(name: string): string {
  return `#print axioms ${name}`;
}

export function importCommand(module: string): string {
  return `import ${module}`;
}

export const CONFIDENCE_LABEL: Record<LeanDeclarationRef["confidence"], string> = {
  manual: "수동 작성",
  docs_verified: "문서 확인",
  exported: "자동 추출",
};
