"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { usePerfil } from "./AuthGate";
import { BASE } from "@/lib/base";

const NAV = [["/", "Painel"], ["/itens", "Itens"], ["/movimentacoes", "Movimentações"]];
export default function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const perfil = usePerfil();
  const links = perfil.papel === "master" ? [...NAV, ["/usuarios", "Usuários"]] : NAV;
  return (
    <div className="min-h-screen pb-[env(safe-area-inset-bottom)]">
      <header className="sticky top-0 z-30 bg-navy-900 pt-[env(safe-area-inset-top)] text-white shadow">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2">
          <img src={`${BASE}/logo-shield.png`} alt="Rina Soluções" className="h-10 w-auto" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-gold-300">Estoque do Laboratório</p>
            <p className="truncate text-xs text-slate-300">{perfil.email} · {perfil.papel}</p>
          </div>
          <button onClick={() => supabase.auth.signOut()} className="rounded-lg border border-white/20 px-3 py-1.5 text-sm">Sair</button>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-3">
          {links.map(([h, l]) => (
            <Link key={h} href={h} className={"whitespace-nowrap border-b-2 px-3 py-2 text-sm " + (path === h ? "border-gold-500 text-gold-300" : "border-transparent text-slate-300")}>{l}</Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl p-4">{children}</main>
    </div>
  );
}
