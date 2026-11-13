"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { supabase, Produto } from "@/lib/supabase";
import { useProdutos } from "@/lib/useProdutos";
import { usePerfil } from "@/components/AuthGate";
import Badge from "@/components/Badge";
import { nivel, fd, num } from "@/lib/estoque";

type F = { id?: string; nome: string; categoria: string; unidade: string; quantidade: string; estoque_minimo: string; qtd_por_embalagem: string; validade: string; observacoes: string };
const vazio: F = { nome: "", categoria: "", unidade: "U", quantidade: "", estoque_minimo: "2", qtd_por_embalagem: "", validade: "", observacoes: "" };
const UNID = ["U", "CX", "PCT", "FR", "L", "RESMA"];

export default function Itens() {
  const { produtos, loading, erro, reload } = useProdutos();
  const master = usePerfil().papel === "master";
  const [q, setQ] = useState(""); const [cat, setCat] = useState("");
  const [f, setF] = useState<F | null>(null); const [err, setErr] = useState("");
  const cats = useMemo(() => Array.from(new Set(produtos.map((p) => p.categoria || "Sem categoria"))).sort(), [produtos]);
  const lista = produtos.filter((p) => p.nome.toLowerCase().includes(q.toLowerCase()) && (!cat || (p.categoria || "Sem categoria") === cat));
  const set = (k: keyof F) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF(f && { ...f, [k]: e.target.value });
  const editar = (p: Produto) => { setErr(""); setF({ id: p.id, nome: p.nome, categoria: p.categoria || "", unidade: p.unidade, quantidade: "", estoque_minimo: String(p.estoque_minimo), qtd_por_embalagem: p.qtd_por_embalagem || "", validade: p.validade || "", observacoes: p.observacoes || "" }); };
  const arquivar = async (p: Produto) => {
    if (!confirm(`Arquivar "${p.nome}"? O histórico de movimentações é mantido.`)) return;
    const { error } = await supabase.from("produtos").update({ ativo: false }).eq("id", p.id);
    if (error) alert(error.message); else reload();
  };
  const salvar = async (e: React.FormEvent) => {
    e.preventDefault(); if (!f) return; setErr("");
    if (!f.nome.trim()) return setErr("Informe o nome do item.");
    const base = { nome: f.nome.trim(), categoria: f.categoria || null, unidade: f.unidade || "U", estoque_minimo: Number(f.estoque_minimo) || 0, qtd_por_embalagem: f.qtd_por_embalagem || null, validade: f.validade || null, observacoes: f.observacoes || null };
    if (f.id) {
      const { error } = await supabase.from("produtos").update(base).eq("id", f.id);
      if (error) return setErr(error.message);
    } else {
      const { data, error } = await supabase.from("produtos").insert(base).select().single();
      if (error) return setErr(error.message);
      const q0 = Number(f.quantidade) || 0;   // o saldo inicial entra como movimentação (fica no histórico)
      if (q0 > 0) { const r = await supabase.from("movimentacoes").insert({ produto_id: data.id, tipo: "entrada", quantidade: q0, observacao: "Saldo inicial" }); if (r.error) return setErr(r.error.message); }
    }
    setF(null); reload();
  };
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <input className="inp max-w-xs" placeholder="Buscar item" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="inp max-w-[200px]" value={cat} onChange={(e) => setCat(e.target.value)}><option value="">Todas as categorias</option>{cats.map((c) => <option key={c}>{c}</option>)}</select>
        <button className="btn-gold ml-auto" onClick={() => { setErr(""); setF(vazio); }}>Novo item</button>
      </div>
      {erro && <p className="text-red-600">{erro}</p>}
      <div className="card overflow-x-auto p-0">
        <table className="w-full"><thead><tr><th className="th">Item</th><th className="th">Categoria</th><th className="th">Saldo</th><th className="th">Mín.</th><th className="th">Validade</th><th className="th">Situação</th><th className="th"></th></tr></thead><tbody>
          {loading ? <tr><td className="td" colSpan={7}>Carregando…</td></tr> : lista.map((p) => (
            <tr key={p.id}>
              <td className="td"><p className="font-medium">{p.nome}</p>{(p.qtd_por_embalagem || p.observacoes) && <p className="text-xs text-slate-500">{[p.qtd_por_embalagem && "Emb.: " + p.qtd_por_embalagem, p.observacoes].filter(Boolean).join(" · ")}</p>}</td>
              <td className="td">{p.categoria || "—"}</td><td className="td whitespace-nowrap">{num(p.quantidade)} {p.unidade}</td><td className="td">{num(p.estoque_minimo)}</td>
              <td className="td whitespace-nowrap">{fd(p.validade)}</td><td className="td"><Badge n={nivel(p)} /></td>
              <td className="td whitespace-nowrap text-right">
                <Link className="btn-line mr-1 inline-block !px-2.5 !py-1.5" href={`/movimentacoes?produto=${p.id}&tipo=entrada`}>Entrada</Link>
                <Link className="btn-line mr-1 inline-block !px-2.5 !py-1.5" href={`/movimentacoes?produto=${p.id}&tipo=saida`}>Saída</Link>
                <button className="btn-line mr-1 !px-2.5 !py-1.5" onClick={() => editar(p)}>Editar</button>
                {master && <button className="btn-line !px-2.5 !py-1.5 text-red-600" onClick={() => arquivar(p)}>Arquivar</button>}
              </td></tr>))}
        </tbody></table>
      </div>
      {f && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 sm:items-center sm:p-4" onClick={() => setF(null)}>
          <form onSubmit={salvar} onClick={(e) => e.stopPropagation()} className="max-h-[92vh] w-full space-y-3 overflow-y-auto rounded-t-2xl bg-white p-5 sm:max-w-lg sm:rounded-2xl">
            <h3 className="text-lg font-semibold text-navy-900">{f.id ? "Editar item" : "Novo item"}</h3>
            <input className="inp" placeholder="Nome do item" value={f.nome} onChange={set("nome")} />
            <div className="grid grid-cols-2 gap-3">
              <input className="inp" list="cats" placeholder="Categoria" value={f.categoria} onChange={set("categoria")} /><datalist id="cats">{cats.map((c) => <option key={c} value={c} />)}</datalist>
              <select className="inp" value={f.unidade} onChange={set("unidade")}>{UNID.map((u) => <option key={u}>{u}</option>)}</select>
              {!f.id && <input type="number" min="0" className="inp" placeholder="Saldo inicial" value={f.quantidade} onChange={set("quantidade")} />}
              <input type="number" min="0" className="inp" placeholder="Estoque mínimo" value={f.estoque_minimo} onChange={set("estoque_minimo")} />
              <input className="inp" placeholder="Qtd. por embalagem (ex.: 100U)" value={f.qtd_por_embalagem} onChange={set("qtd_por_embalagem")} />
              <input type="date" className="inp" value={f.validade} onChange={set("validade")} />
            </div>
            <textarea className="inp" rows={2} placeholder="Observações" value={f.observacoes} onChange={set("observacoes")} />
            {f.id && <p className="text-xs text-slate-500">O saldo só muda por Movimentações (entradas e saídas).</p>}
            {err && <p className="text-sm text-red-600">{err}</p>}
            <div className="flex gap-2"><button type="button" className="btn-line flex-1" onClick={() => setF(null)}>Cancelar</button><button className="btn-gold flex-1">Salvar</button></div>
          </form>
        </div>)}
    </div>
  );
}
