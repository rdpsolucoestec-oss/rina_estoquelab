"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, Perfil } from "@/lib/supabase";

const Ctx = createContext<Perfil | null>(null);
export const usePerfil = () => useContext(Ctx)!;

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [st, setSt] = useState<"load" | "ok" | "pend">("load");
  useEffect(() => {
    let vivo = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/login"); return; }
      const { data } = await supabase.from("perfis").select("*").eq("id", session.user.id).single();
      if (!vivo) return;
      if (data && (data as Perfil).ativo) { setPerfil(data as Perfil); setSt("ok"); } else setSt("pend");
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((ev) => { if (ev === "SIGNED_OUT") router.replace("/login"); });
    return () => { vivo = false; sub.subscription.unsubscribe(); };
  }, [router]);
  if (st === "load") return <p className="p-8 text-center text-slate-500">Carregando…</p>;
  if (st === "pend") return (
    <div className="grid min-h-screen place-items-center bg-navy-900 p-6"><div className="card max-w-sm text-center">
      <p className="font-semibold">Cadastro aguardando aprovação</p>
      <p className="mt-2 text-sm text-slate-600">O administrador precisa liberar o seu acesso.</p>
      <button className="btn-line mt-4" onClick={() => supabase.auth.signOut()}>Sair</button></div></div>);
  return <Ctx.Provider value={perfil!}>{children}</Ctx.Provider>;
}
