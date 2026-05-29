-- GolpeSwipe Empresas - SQL minimo
-- Perguntas ficam no codigo. Supabase guarda usuarios, empresas e resultados.

create extension if not exists "pgcrypto";

create table if not exists public.empresas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cnpj text,
  codigo_empresa text not null unique,
  criada_em timestamp with time zone default now()
);

create table if not exists public.perfis (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  email text not null,
  tipo_usuario text not null check (tipo_usuario in ('admin_empresa', 'funcionario')),
  empresa_id uuid references public.empresas(id) on delete set null,
  criado_em timestamp with time zone default now()
);

create table if not exists public.sessoes_treino (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.perfis(id) on delete cascade,
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  total_perguntas integer not null default 20,
  acertos integer not null default 0,
  finalizada boolean default false,
  iniciada_em timestamp with time zone default now(),
  finalizada_em timestamp with time zone
);

create table if not exists public.respostas_treino (
  id uuid primary key default gen_random_uuid(),
  sessao_id uuid not null references public.sessoes_treino(id) on delete cascade,
  usuario_id uuid not null references public.perfis(id) on delete cascade,
  pergunta_codigo integer not null,
  resposta_usuario text not null check (resposta_usuario in ('golpe', 'seguro')),
  acertou boolean not null,
  respondida_em timestamp with time zone default now()
);

create table if not exists public.testes_maestria (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.perfis(id) on delete cascade,
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  total_perguntas integer not null default 100,
  acertos integer not null default 0,
  percentual numeric(5,2) not null default 0,
  nivel_resultado text,
  finalizado boolean default false,
  iniciado_em timestamp with time zone default now(),
  finalizado_em timestamp with time zone
);

create table if not exists public.respostas_maestria (
  id uuid primary key default gen_random_uuid(),
  teste_id uuid not null references public.testes_maestria(id) on delete cascade,
  usuario_id uuid not null references public.perfis(id) on delete cascade,
  pergunta_codigo integer not null,
  resposta_usuario text not null check (resposta_usuario in ('golpe', 'seguro')),
  acertou boolean not null,
  respondida_em timestamp with time zone default now()
);

create or replace view public.ranking_maestria as
select
  tm.empresa_id,
  e.nome as empresa,
  p.nome as funcionario,
  p.email,
  tm.acertos,
  tm.total_perguntas,
  tm.percentual,
  tm.nivel_resultado,
  tm.finalizado_em,
  rank() over (
    partition by tm.empresa_id
    order by tm.percentual desc, tm.acertos desc, tm.finalizado_em asc
  ) as posicao
from public.testes_maestria tm
join public.perfis p on p.id = tm.usuario_id
join public.empresas e on e.id = tm.empresa_id
where tm.finalizado = true;

create index if not exists idx_perfis_empresa on public.perfis(empresa_id);
create index if not exists idx_empresas_codigo on public.empresas(codigo_empresa);
create index if not exists idx_testes_empresa on public.testes_maestria(empresa_id);
create index if not exists idx_testes_usuario on public.testes_maestria(usuario_id);
