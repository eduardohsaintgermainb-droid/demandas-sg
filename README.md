# Demandas — Saint Germain Brand

Sistema de controle de demandas com Next.js + Supabase + Vercel.

---

## Stack
- **Next.js 14** (App Router) — frontend + API routes
- **Supabase** — banco de dados PostgreSQL + storage de arquivos
- **Vercel** — deploy automático via GitHub

---

## Passo a passo de setup

### 1. Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta gratuita
2. Clique em **New Project** → dê um nome (ex: `demandas-sg`) → defina uma senha forte → região **South America (São Paulo)**
3. Aguarde o projeto subir (~1 min)
4. Vá em **SQL Editor** → cole e execute o conteúdo de `supabase_setup.sql`
5. Vá em **Project Settings → API** e copie:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

---

### 2. GitHub

1. Crie um repositório **privado** no GitHub (ex: `demandas-sg`)
2. Suba os arquivos deste projeto:
```bash
git init
git add .
git commit -m "init"
git remote add origin https://github.com/SEU_USUARIO/demandas-sg.git
git push -u origin main
```

---

### 3. Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login com GitHub
2. Clique em **Add New Project** → selecione o repositório `demandas-sg`
3. Em **Environment Variables**, adicione as 3 variáveis:
   ```
   NEXT_PUBLIC_SUPABASE_URL     = https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
   SUPABASE_SERVICE_ROLE_KEY     = eyJ...
   ```
4. Clique em **Deploy** — em ~2 minutos seu sistema estará no ar

---

## Uso

### Gestor (você)
- Cria demandas com título, descrição detalhada, prioridade e prazo
- Adiciona tags para categorizar (ex: #wms, #frete, #bling)
- Acompanha o status em tempo real
- Exclui ou edita demandas quando necessário

### Analista
- Acessa a mesma URL
- Clica em qualquer demanda para ver todos os detalhes
- Atualiza o status (Pendente → Em andamento → Concluído)
- Adiciona comentários e atualizações de progresso
- Faz upload de evidências (prints, planilhas, etc.)

---

## Estrutura do projeto

```
demandas/
├── app/
│   ├── api/
│   │   ├── demandas/route.ts    # CRUD de demandas
│   │   ├── comentarios/route.ts # Histórico de comentários
│   │   └── uploads/route.ts     # Upload de evidências
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                 # Painel único
├── lib/
│   └── supabase.ts              # Client + tipos
├── supabase_setup.sql           # Script de criação das tabelas
└── .env.example                 # Variáveis necessárias
```

---

## Personalização

Para trocar o nome da empresa, edite em `app/page.tsx`:
```tsx
<p className="...">Saint Germain Brand — Gestão de atividades</p>
```

---

## Custos

- **Supabase Free**: 500MB banco + 1GB storage — suficiente para uso interno
- **Vercel Free**: hobby plan — suficiente para uso interno
- **Total: R$ 0,00**
