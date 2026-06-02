-- GolpeSwipe - Questões personalizadas por empresa
-- Rode este script no SQL Editor do Supabase.

create table if not exists public.questoes_empresa (
  id bigserial primary key,
  empresa_id bigint not null references public.empresas(id) on delete cascade,
  criada_por uuid references auth.users(id) on delete set null,
  categoria text not null,
  titulo text not null,
  cenario text not null,
  resposta_correta text not null check (resposta_correta in ('golpe', 'seguro')),
  sinais text[] not null default '{}',
  dica text not null,
  ativa boolean not null default true,
  criado_em timestamptz not null default now()
);

create index if not exists idx_questoes_empresa_empresa_id on public.questoes_empresa(empresa_id);
create index if not exists idx_questoes_empresa_ativa on public.questoes_empresa(ativa);

alter table public.questoes_empresa enable row level security;

-- Remove políticas antigas, se existirem.
drop policy if exists "questoes_empresa_select_mesma_empresa" on public.questoes_empresa;
drop policy if exists "questoes_empresa_insert_admin" on public.questoes_empresa;
drop policy if exists "questoes_empresa_update_admin" on public.questoes_empresa;

-- Funcionários e administradores só podem visualizar questões ativas da própria empresa.
create policy "questoes_empresa_select_mesma_empresa"
on public.questoes_empresa
for select
to authenticated
using (
  ativa = true
  and empresa_id = (
    select p.empresa_id
    from public.perfis p
    where p.id = auth.uid()
    limit 1
  )
);

-- Apenas administrador da empresa pode cadastrar questão para a própria empresa.
create policy "questoes_empresa_insert_admin"
on public.questoes_empresa
for insert
to authenticated
with check (
  criada_por = auth.uid()
  and empresa_id = (
    select p.empresa_id
    from public.perfis p
    where p.id = auth.uid()
      and p.tipo_usuario = 'admin_empresa'
    limit 1
  )
);

-- Apenas administrador da empresa pode editar/desativar questões da própria empresa.
create policy "questoes_empresa_update_admin"
on public.questoes_empresa
for update
to authenticated
using (
  empresa_id = (
    select p.empresa_id
    from public.perfis p
    where p.id = auth.uid()
      and p.tipo_usuario = 'admin_empresa'
    limit 1
  )
)
with check (
  empresa_id = (
    select p.empresa_id
    from public.perfis p
    where p.id = auth.uid()
      and p.tipo_usuario = 'admin_empresa'
    limit 1
  )
);

-- RPC para listar questões da empresa do usuário logado.
create or replace function public.listar_questoes_empresa()
returns table (
  id bigint,
  categoria text,
  titulo text,
  cenario text,
  resposta_correta text,
  sinais text[],
  dica text,
  ativa boolean,
  criado_em timestamptz
)
language sql
security definer
set search_path = public
as $$
  select q.id, q.categoria, q.titulo, q.cenario, q.resposta_correta, q.sinais, q.dica, q.ativa, q.criado_em
  from public.questoes_empresa q
  join public.perfis p on p.empresa_id = q.empresa_id
  where p.id = auth.uid()
    and q.ativa = true
  order by q.criado_em desc;
$$;

grant execute on function public.listar_questoes_empresa() to authenticated;

-- RPC para inserir questão garantindo empresa_id pelo perfil do administrador.
create or replace function public.inserir_questao_empresa(
  p_categoria text,
  p_titulo text,
  p_cenario text,
  p_resposta_correta text,
  p_sinais text[],
  p_dica text
)
returns public.questoes_empresa
language plpgsql
security definer
set search_path = public
as $$
declare
  v_empresa_id bigint;
  v_resultado public.questoes_empresa;
begin
  select empresa_id into v_empresa_id
  from public.perfis
  where id = auth.uid()
    and tipo_usuario = 'admin_empresa'
  limit 1;

  if v_empresa_id is null then
    raise exception 'Apenas administradores da empresa podem cadastrar questões.';
  end if;

  if p_resposta_correta not in ('golpe', 'seguro') then
    raise exception 'Resposta correta inválida.';
  end if;

  insert into public.questoes_empresa (
    empresa_id,
    criada_por,
    categoria,
    titulo,
    cenario,
    resposta_correta,
    sinais,
    dica,
    ativa
  ) values (
    v_empresa_id,
    auth.uid(),
    trim(p_categoria),
    trim(p_titulo),
    trim(p_cenario),
    p_resposta_correta,
    coalesce(p_sinais, '{}'),
    trim(p_dica),
    true
  )
  returning * into v_resultado;

  return v_resultado;
end;
$$;

grant execute on function public.inserir_questao_empresa(text, text, text, text, text[], text) to authenticated;
