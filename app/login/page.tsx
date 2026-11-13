"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { BASE } from "@/lib/base";

export default function Login() {
  const router = useRouter();
  const [modo, setModo] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { supabase.auth.getSession().then(({ data }) => { if (data.session) router.replace("/"); }); }, [router]);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setMsg("");
    if (modo === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
      if (error) setMsg(error.message === "Invalid login credentials" ? "E-mail ou senha inválidos." : error.message); else router.replace("/");
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password: senha });
      if (error) setMsg(error.message);
      else if (data.session) router.replace("/");
      else { setMsg("Conta criada. Confirme o e-mail (se solicitado) e aguarde a liberação do administrador."); setModo("in"); }
    }
    setBusy(false);
  };
  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-b from-navy-800 to-navy-900 p-4">
      <div className="w-full max-w-sm">
        <img src={`${BASE}/logo-lockup.png`} alt="Rina Soluções Tecnológicas" className="mx-auto mb-5 w-72 max-w-full" />
        <form onSubmit={enviar} className="card space-y-3">
          <div className="grid grid-cols-2 rounded-lg bg-slate-100 p-1 text-sm font-semibold">
            {([["in", "Entrar"], ["up", "Criar conta"]] as const).map(([k, l]) => (
              <button type="button" key={k} onClick={() => { setModo(k); setMsg(""); }} className={"rounded-md py-2 " + (modo === k ? "bg-navy-900 text-gold-300" : "text-slate-500")}>{l}</button>))}
          </div>
          <input type="email" required className="inp" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          <input type="password" required minLength={6} className="inp" placeholder="Senha (mín. 6 caracteres)" value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete={modo === "in" ? "current-password" : "new-password"} />
          {msg && <p className={"text-sm " + (msg.startsWith("Conta criada") ? "text-emerald-700" : "text-red-600")}>{msg}</p>}
          <button disabled={busy} className="btn-gold w-full">{busy ? "Aguarde…" : modo === "in" ? "Entrar" : "Criar conta"}</button>
        </form>
      </div>
    </div>
  );
}
