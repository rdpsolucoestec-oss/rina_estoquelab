import type { Produto } from "./supabase";
export type Nivel = "ok" | "baixo" | "zerado";
export const nivel = (p: Produto): Nivel => (p.quantidade <= 0 ? "zerado" : p.quantidade <= p.estoque_minimo ? "baixo" : "ok");
export const fd = (s?: string | null) => (s ? s.slice(0, 10).split("-").reverse().join("/") : "—");
export const num = (n: number) => n.toLocaleString("pt-BR");
export const hoje = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
