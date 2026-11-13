"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase, Mov } from "@/lib/supabase";
import { useProdutos } from "@/lib/useProdutos";
import { nivel, fd, num } from "@/lib/estoque";
import Badge from "@/components/Badge";

export default function Painel() {
  const { produtos, loading, erro } = useProdutos();
  const [movs, setMovs] = useState<Mov[]>([]);
  useEffect(() => {
    const ler = () => supabase.from("movimentacoes").select("*, produtos(nome,unidade)").order("created_at", { ascending: false }).limit(8)
      .then(({ data }) => setMovs((data || []) as unknown as Mov[]));
    ler();
    const ch = supabase.channel("mov-rt").on("postgres_changes", { event: "INSERT", schema: "public", table: "movimentacoes" }, ler).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);
  const em90 = new Date(Date.now() + 90 * 864e5).toISOString().slice(0, 10);
  const alertas = produtos.filter((p) => nivel(p) !== "ok").sort((a, b) => a.quantidade - b.quantidade);
  const zerados = produtos.filter((p) => nivel(p) === "zerado").length;
  const vencendo = produtos.filter((p) => p.validade && p.validade <= em90);
  const Card = ({ t, v, c }: { t: string; v: number; c?: string }) => (<div className="card"><p className="text-xs text-slate-500">{t}</p><p className={"mt-1 text-2xl font-bold " + (c || "text-navy-900")}>{v}</p></div>);
  if (loading) return <p className="text-slate-500">Carregando…</p>;
  return (
    <div className="space-y-5">
      {erro && <p className="text-red-600">{erro}</p>}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card t="Itens cadastrados" v={produtos.length} />
        <Card t="Estoque baixo" v={alertas.length - zerados} c="text-amber-600" />
        <Card t="Itens zerados" v={zerados} c="text-red-600" />
        <Card t="Validade em até 90 dias" v={vencendo.length} c="text-orange-600" />
      </section>
      <section className="card">
        <h2 className="mb-2 font-semibold">Alertas de estoque</h2>
        {alertas.length === 0 ? <p className="text-sm text-slate-500">Nenhum item abaixo do mínimo.</p> : (
          <div className="overflow-x-auto"><table className="w-full"><thead><tr><th className="th">Item</th><th className="th">Saldo</th><th className="th">Mínimo</th><th className="th">Situação</th><th className="th"></th></tr></thead><tbody>
            {alertas.map((p) => (<tr key={p.id}><td className="td font-medium">{p.nome}</td><td className="td">{num(p.quantidade)} {p.unidade}</td><td className="td">{num(p.estoque_minimo)}</td><td className="td"><Badge n={nivel(p)} /></td>
              <td className="td text-right"><Link className="text-sm font-semibold text-navy-700 underline" href={`/movimentacoes?produto=${p.id}&tipo=entrada`}>Registrar entrada</Link></td></tr>))}
          </tbody></table></div>)}
      </section>
      {vencendo.length > 0 && (
        <section className="card"><h2 className="mb-2 font-semibold">Validades próximas ou vencidas</h2>
          <ul className="divide-y text-sm">{vencendo.sort((a, b) => (a.validade! < b.validade! ? -1 : 1)).map((p) => (
            <li key={p.id} className="flex justify-between gap-2 py-1.5"><span>{p.nome}</span><span className={p.validade! < new Date().toISOString().slice(0, 10) ? "font-semibold text-red-600" : "text-orange-600"}>{fd(p.validade)}</span></li>))}</ul></section>)}
      <section className="card">
        <h2 className="mb-2 font-semibold">Últimas movimentações</h2>
        {movs.length === 0 ? <p className="text-sm text-slate-500">Sem movimentações.</p> : (
          <ul className="divide-y text-sm">{movs.map((m) => (
            <li key={m.id} className="flex justify-between gap-2 py-1.5"><span>{m.produtos?.nome}</span>
              <span className={m.tipo === "entrada" ? "text-emerald-700" : "text-red-600"}>{m.tipo === "entrada" ? "+" : "−"}{num(m.quantidade)} {m.produtos?.unidade} · {fd(m.data)}</span></li>))}</ul>)}
      </section>
    </div>
  );
}
