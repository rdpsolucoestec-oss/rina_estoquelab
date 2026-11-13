"use client";
import { useCallback, useEffect, useState } from "react";
import { supabase, Perfil } from "@/lib/supabase";
import { usePerfil } from "@/components/AuthGate";

export default function Usuarios() {
  const eu = usePerfil();
  const [lista, setLista] = useState<Perfil[]>([]); const [err, setErr] = useState("");
  const carregar = useCallback(async () => {
    const { data, error } = await supabase.from("perfis").select("*").order("created_at");
    if (error) setErr(error.message); else setLista(data as Perfil[]);
  }, []);
  useEffect(() => { carregar(); }, [carregar]);
  if (eu.papel !== "master") return <p className="text-slate-600">Acesso restrito ao administrador master.</p>;
  const mudar = async (id: string, campos: Partial<Perfil>) => { const { error } = await supabase.from("perfis").update(campos).eq("id", id); if (error) setErr(error.message); else carregar(); };
  return (
    <div className="card overflow-x-auto p-0">
      <h2 className="px-4 pt-4 font-semibold">Usuários e perfis de acesso</h2>
      {err && <p className="px-4 text-sm text-red-600">{err}</p>}
      <table className="w-full"><thead><tr><th className="th">E-mail</th><th className="th">Perfil</th><th className="th">Situação</th><th className="th"></th></tr></thead><tbody>
        {lista.map((u) => (<tr key={u.id}><td className="td">{u.email}</td>
          <td className="td"><select disabled={u.id === eu.id} className="inp !w-auto !py-1.5" value={u.papel} onChange={(e) => mudar(u.id, { papel: e.target.value as Perfil["papel"] })}><option value="operador">Operador</option><option value="master">Master</option></select></td>
          <td className="td"><span className={"rounded-full px-2 py-0.5 text-xs font-semibold " + (u.ativo ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800")}>{u.ativo ? "Ativo" : "Aguardando aprovação"}</span></td>
          <td className="td text-right">{u.id !== eu.id && <button className={"btn-line !px-3 !py-1.5 " + (u.ativo ? "text-red-600" : "text-emerald-700")} onClick={() => mudar(u.id, { ativo: !u.ativo })}>{u.ativo ? "Bloquear" : "Aprovar"}</button>}</td></tr>))}
      </tbody></table>
    </div>
  );
}
