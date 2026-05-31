-- GolpeSwipe Empresas - SQL minimo
-- Perguntas ficam no codigo. Supabase guarda usuarios, empresas e resultados.
-- Versao sem policies recursivas em perfis.

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

-- Função segura para o admin listar apenas funcionários da própria empresa.
-- Evita policy recursiva em perfis.
create or replace function public.listar_funcionarios_empresa()
returns table (
  id uuid,
  nome text,
  email text,
  criado_em timestamp with time zone,
  total_treinos bigint,
  ultimo_treino timestamp with time zone,
  melhor_maestria numeric
)
language sql
security definer
set search_path = public
as $$
  with admin_atual as (
    select empresa_id
    from public.perfis
    where id = auth.uid()
      and tipo_usuario = 'admin_empresa'
    limit 1
  )
  select
    p.id,
    p.nome,
    p.email,
    p.criado_em,
    count(st.id) filter (where st.finalizada = true) as total_treinos,
    max(st.finalizada_em) as ultimo_treino,
    max(tm.percentual) filter (where tm.finalizado = true) as melhor_maestria
  from public.perfis p
  join admin_atual a on a.empresa_id = p.empresa_id
  left join public.sessoes_treino st on st.usuario_id = p.id
  left join public.testes_maestria tm on tm.usuario_id = p.id
  where p.tipo_usuario = 'funcionario'
  group by p.id, p.nome, p.email, p.criado_em
  order by p.criado_em desc;
$$;

revoke all on function public.listar_funcionarios_empresa() from public;
grant execute on function public.listar_funcionarios_empresa() to authenticated;

alter table public.empresas enable row level security;
alter table public.perfis enable row level security;
alter table public.sessoes_treino enable row level security;
alter table public.respostas_treino enable row level security;
alter table public.testes_maestria enable row level security;
alter table public.respostas_maestria enable row level security;

-- Limpeza de policies antigas, inclusive as que causam recursao infinita.
drop policy if exists "usuarios autenticados criam empresa" on public.empresas;
drop policy if exists "usuarios veem empresas pelo codigo para cadastro" on public.empresas;
drop policy if exists "usuarios autenticados podem criar empresas" on public.empresas;
drop policy if exists "usuarios autenticados podem consultar empresas" on public.empresas;
drop policy if exists "empresas_select_anon_codigo" on public.empresas;
drop policy if exists "usuario ve proprio perfil" on public.perfis;
drop policy if exists "usuario cria proprio perfil" on public.perfis;
drop policy if exists "usuario atualiza proprio perfil" on public.perfis;
drop policy if exists "admin ve perfis da propria empresa" on public.perfis;
drop policy if exists "usuario pode criar o proprio perfil" on public.perfis;
drop policy if exists "usuario pode ver o proprio perfil" on public.perfis;
drop policy if exists "usuario pode atualizar o proprio perfil" on public.perfis;

-- EMPRESAS
create policy "empresas_select_authenticated"
on public.empresas
for select
to authenticated
using (true);

create policy "empresas_select_anon_codigo"
on public.empresas
for select
to anon
using (true);

create policy "empresas_insert_authenticated"
on public.empresas
for insert
to authenticated
with check (true);

-- PERFIS
create policy "perfis_select_own"
on public.perfis
for select
to authenticated
using (id = auth.uid());

create policy "perfis_insert_own"
on public.perfis
for insert
to authenticated
with check (id = auth.uid());

create policy "perfis_update_own"
on public.perfis
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- TREINO
create policy "sessoes_treino_insert_own"
on public.sessoes_treino
for insert
to authenticated
with check (usuario_id = auth.uid());

create policy "sessoes_treino_select_own"
on public.sessoes_treino
for select
to authenticated
using (usuario_id = auth.uid());

create policy "sessoes_treino_update_own"
on public.sessoes_treino
for update
to authenticated
using (usuario_id = auth.uid())
with check (usuario_id = auth.uid());

create policy "respostas_treino_insert_own"
on public.respostas_treino
for insert
to authenticated
with check (usuario_id = auth.uid());

create policy "respostas_treino_select_own"
on public.respostas_treino
for select
to authenticated
using (usuario_id = auth.uid());

-- MAESTRIA
create policy "testes_maestria_insert_own"
on public.testes_maestria
for insert
to authenticated
with check (usuario_id = auth.uid());

create policy "testes_maestria_select_own_or_company_basic"
on public.testes_maestria
for select
to authenticated
using (usuario_id = auth.uid());

create policy "testes_maestria_update_own"
on public.testes_maestria
for update
to authenticated
using (usuario_id = auth.uid())
with check (usuario_id = auth.uid());

create policy "respostas_maestria_insert_own"
on public.respostas_maestria
for insert
to authenticated
with check (usuario_id = auth.uid());

create policy "respostas_maestria_select_own"
on public.respostas_maestria
for select
to authenticated
using (usuario_id = auth.uid());

create index if not exists idx_perfis_empresa on public.perfis(empresa_id);
create index if not exists idx_empresas_codigo on public.empresas(codigo_empresa);
create index if not exists idx_testes_empresa on public.testes_maestria(empresa_id);
create index if not exists idx_testes_usuario on public.testes_maestria(usuario_id);
