import type { Nivel } from "@/lib/estoque";
const M = { ok: ["Normal", "bg-emerald-100 text-emerald-700"], baixo: ["Estoque baixo", "bg-amber-100 text-amber-800"], zerado: ["Zerado", "bg-red-100 text-red-700"] } as const;
export default function Badge({ n }: { n: Nivel }) {
  return <span className={"whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold " + M[n][1]}>{M[n][0]}</span>;
}
