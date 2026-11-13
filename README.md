# Estoque do Laboratório (Next.js + Supabase + PWA)

Next.js 14 (App Router), TypeScript, Tailwind CSS e Supabase (login, banco e tempo real).
Telas: Login, Painel (alertas de estoque baixo), Itens (cadastro e edição), Movimentações (entradas e saídas) e Usuários (só o master).

## 1. Rodar localmente
Requisitos: Node.js 18.17 ou superior.

```bash
npm install
npm run dev          # abre em http://localhost:3000
```
O arquivo `.env.local` já vem com a URL e a chave pública (publishable) do seu projeto Supabase.
Essa chave pode ficar no navegador. A proteção dos dados é feita pelas regras (RLS) do banco.
Nunca coloque a chave `service_role` neste projeto.

## 2. Criar as tabelas no Supabase
1. Abra o projeto no Supabase e vá em **SQL Editor**, depois **New query**.
2. Cole o conteúdo de `supabase/schema.sql` e clique em **Run**. Ele cria `perfis`, `produtos` e `movimentacoes`, os gatilhos que atualizam o saldo, as regras de segurança e o tempo real.
3. Em outra consulta, cole `supabase/seed.sql` e clique em **Run**. Ele cadastra os 90 itens da planilha `BALANÇO DE ESTOQUE` e lança o saldo atual como "Saldo inicial". Rode uma única vez.

## 3. Criar o usuário master
1. Em **Authentication, Providers**, confirme que **Email** está ativado.
2. Abra o sistema, clique em **Criar conta** e cadastre **rinaildo064@gmail.com** com uma senha. Esse e-mail vira master e já nasce ativo.
3. Se o Supabase pedir confirmação por e-mail, confirme antes de entrar.
4. Outras pessoas podem criar conta, mas ficam "aguardando aprovação" até o master liberar em **Usuários**.

## 4. Publicar no GitHub Pages
O projeto já está configurado como site estático e traz a publicação automática (`.github/workflows/deploy.yml`).
1. No GitHub, crie um repositório (ex.: `lab-estoque`).
2. Na pasta do projeto:
   ```bash
   git init
   git add .
   git commit -m "Estoque do laboratório"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/lab-estoque.git
   git push -u origin main
   ```
3. No repositório, vá em **Settings, Pages, Build and deployment, Source** e escolha **GitHub Actions**.
4. Abra a aba **Actions**. Quando o fluxo terminar (cerca de 2 minutos), o site abre em `https://SEU-USUARIO.github.io/lab-estoque/`.
5. No Supabase, em **Authentication, URL Configuration**, coloque esse endereço (com a barra no final) em **Site URL** e em **Redirect URLs**. Sem isso, o link do e-mail de confirmação abre no lugar errado.

Observações:
- O arquivo `.env.production` leva só a URL e a chave **publishable**, que são públicas. Ele é enviado ao GitHub de propósito. O `.env.local` não é enviado.
- Se o repositório se chamar `SEU-USUARIO.github.io`, edite o `deploy.yml` e deixe `NEXT_PUBLIC_BASE_PATH: ""`.
- Repositório privado só publica no Pages em planos pagos do GitHub. Repositório público funciona no plano gratuito. Como o código não contém segredos, público é seguro.

## 5. PWA (instalar como aplicativo)
O PWA funciona no site publicado (HTTPS). Para testar antes, na sua máquina: `npm run build && npm run preview`.
- **Android (Chrome):** menu ⋮, **Instalar app**.
- **iPhone (Safari):** botão Compartilhar, **Adicionar à Tela de Início**.
- **Windows (Chrome ou Edge):** ícone de instalar na barra de endereço.

Os arquivos do PWA ficam em `public/`: `manifest.webmanifest`, `sw.js` e os ícones `icon-192.png`, `icon-512.png`, `maskable-512.png`, `apple-touch-icon.png` e `favicon.ico`. Se o atalho aparecer com uma letra no lugar da logo, limpe os dados do site no navegador, apague o atalho antigo e instale de novo.

## Como o saldo funciona
O saldo (`produtos.quantidade`) só muda por movimentações. Um gatilho no banco soma as entradas e subtrai as saídas, e recusa saídas maiores que o saldo. O histórico não pode ser editado nem apagado. Nesta versão, a coluna **estoque_minimo** começa em 2 para todos os itens: ajuste item a item na tela **Itens**.
