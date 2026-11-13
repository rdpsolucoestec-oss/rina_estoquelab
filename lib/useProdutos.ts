"use client";
import { useCallback, useEffect, useState } from "react";
import { supabase, Produto } from "./supabase";

/** Lista produtos ativos e se atualiza em tempo real (Supabase Realtime). */
export function useProdutos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const load = useCallback(async () => {
    const { data, error } = await supabase.from("produtos").select("*").eq("ativo", true).order("nome");
    if (error) setErro(error.message); else setProdutos(data as Produto[]);
    setLoading(false);
  }, []);
  useEffect(() => {
    load();
    const ch = supabase.channel("produtos-rt").on("postgres_changes", { event: "*", schema: "public", table: "produtos" }, () => load()).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);
  return { produtos, loading, erro, reload: load };
}
