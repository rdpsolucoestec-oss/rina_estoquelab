/* URL e chave "publishable" são públicas e podem ficar no código (a proteção é o RLS do banco). */
import { createClient } from "@supabase/supabase-js";
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://yvahnqdriarwrmmyjtjk.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_8TU2nAFPdfOlrWSDnGYgkg_9M9VpovL"
);
export type Produto = { id: string; nome: string; categoria: string | null; unidade: string; quantidade: number; estoque_minimo: number; qtd_por_embalagem: string | null; validade: string | null; observacoes: string | null; ativo: boolean };
export type Perfil = { id: string; email: string; nome: string | null; papel: "master" | "operador"; ativo: boolean };
export type Mov = { id: number; produto_id: string; tipo: "entrada" | "saida"; quantidade: number; data: string; observacao: string | null; usuario_email: string | null; created_at: string; produtos?: { nome: string; unidade: string } | null };
