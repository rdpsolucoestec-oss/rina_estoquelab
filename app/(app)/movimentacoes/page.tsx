"use client";
import { useCallback, useEffect, useState } from "react";
import { supabase, Mov } from "@/lib/supabase";
import { useProdutos } from "@/lib/useProdutos";
import { hoje, fd, num } from "@/lib/estoque";

export default function Movimentacoes() {
  const { produtos } = useProdutos();
  const [movs, setMovs] = useState<Mov[]>([]);
  const [pid, setPid] = useState(""); const [tipo, setTipo] = useState<"entrada" | "saida">("saida");
  const [qtd, setQtd] = useState(""); const [dia, setDia] = useState(hoje()); const [obs, setObs] = useState("");
  const [busca, setBusca] = useState(""); const [ok, setOk] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const carregar = useCallback(async () => {
    const { data } = await supabase.from("movimentacoes").select("*, produtos(nome,unidade)").order("created_at", { ascending: false }).limit(50);
    setMovs((data || []) as unknown as Mov[]);
  }, []);
  useEffect(() => {
    carregar();
    const sp = new URLSearchParams(window.location.search); const p = sp.get("produto"), t = sp.get("tipo");
    if (p) setPid(p); if (t === "entrada" || t === "saida") setTipo(t);
  }, [carregar]);
  const sel = produtos.find((p) => p.id === pid);
  const opcoes = produtos.filter((p) => p.nome.toLowerCase().includes(busca.toLowerCase()) || p.id === pid);
  const registrar = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(""); setOk(""); const q = Number(qtd);
    if (!pid) return setErr("Escolha o item.");
    if (!(q > 0)) return setErr("Informe uma quantidade maior que zero.");
    setBusy(true);
    const { error } = await supabase.from("movimentacoes").insert({ produto_id: pid, tipo, quantidade: q, data: dia, observacao: obs || null });
    setBusy(false);
    if (error) return setErr(error.message);
    setOk(tipo === "entrada" ? "Entrada registrada." : "Saída registrada."); setQtd(""); setObs(""); carregar();
  };
  return (
    <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
      <form onSubmit={registrar} className="card h-fit space-y-3">
        <h2 className="font-semibold">Registrar movimentação</h2>
        <div className="grid grid-cols-2 rounded-lg bg-slate-100 p-1 text-sm font-semibold">
          {([["entrada", "Entrada"], ["saida", "Saída"]] as const).map(([k, l]) => (
            <button type="button" key={k} onClick={() => setTipo(k)} className={"rounded-md py-2 " + (tipo === k ? (k === "entrada" ? "bg-emerald-600 text-white" : "bg-red-600 text-white") : "text-slate-500")}>{l}</button>))}
        </div>
        <input className="inp" placeholder="Filtrar item pelo nome" value={busca} onChange={(e) => setBusca(e.target.value)} />
        <select className="inp" value={pid} onChange={(e) => setPid(e.target.value)}><option value="">Selecione o item</option>
          {opcoes.map((p) => <option key={p.id} value={p.id}>{p.nome} (saldo {num(p.quantidade)} {p.unidade})</option>)}</select>
        <div className="grid grid-cols-2 gap-3">
          <input type="number" min="0" step="any" className="inp" placeholder={"Quantidade" + (sel ? " (" + sel.unidade + ")" : "")} value={qtd} onChange={(e) => setQtd(e.target.value)} />
          <input type="date" className="inp" value={dia} onChange={(e) => setDia(e.target.value)} />
        </div>
        <input className="inp" placeholder="Observação (opcional)" value={obs} onChange={(e) => setObs(e.target.value)} />
        {err && <p className="text-sm text-red-600">{err}</p>}{ok && <p className="text-sm text-emerald-700">{ok}</p>}
        <button disabled={busy} className="btn-gold w-full">{busy ? "Registrando…" : "Registrar"}</button>
      </form>
      <div className="card overflow-x-auto p-0">
        <h2 className="px-4 pt-4 font-semibold">Histórico recente</h2>
        <table className="w-full"><thead><tr><th className="th">Data</th><th className="th">Item</th><th className="th">Tipo</th><th className="th">Qtd.</th><th className="th">Usuário</th></tr></thead><tbody>
          {movs.map((m) => (<tr key={m.id}><td className="td whitespace-nowrap">{fd(m.data)}</td><td className="td">{m.produtos?.nome}{m.observacao && <p className="text-xs text-slate-500">{m.observacao}</p>}</td>
            <td className={"td font-semibold " + (m.tipo === "entrada" ? "text-emerald-700" : "text-red-600")}>{m.tipo === "entrada" ? "Entrada" : "Saída"}</td>
            <td className="td whitespace-nowrap">{num(m.quantidade)} {m.produtos?.unidade}</td><td className="td text-xs">{m.usuario_email || "—"}</td></tr>))}
        </tbody></table>
      </div>
    </div>
  );
}
