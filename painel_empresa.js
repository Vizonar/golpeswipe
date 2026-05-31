// Lista de funcionários no painel da empresa.
// Usa uma RPC security definer no Supabase para evitar policy recursiva em perfis.

async function carregarFuncionariosEmpresa() {
  const supabaseClient = getSupabaseClient();
  const tbody = document.querySelector('#funcionarios-tbody');

  if (!tbody) return [];
  tbody.innerHTML = '<tr><td colspan="5">Carregando funcionários...</td></tr>';

  if (!supabaseClient || !appState?.perfil || appState.perfil.tipo_usuario !== 'admin_empresa') {
    tbody.innerHTML = '<tr><td colspan="5">Apenas administradores da empresa podem ver esta lista.</td></tr>';
    return [];
  }

  const { data, error } = await supabaseClient.rpc('listar_funcionarios_empresa');

  if (error) {
    console.error('Erro ao carregar funcionários:', error);
    tbody.innerHTML = '<tr><td colspan="5">Não foi possível carregar os funcionários. Rode o SQL de atualização no Supabase.</td></tr>';
    return [];
  }

  if (!data || data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5">Nenhum funcionário cadastrado ainda.</td></tr>';
    return [];
  }

  tbody.innerHTML = data.map((funcionario) => {
    const dataCadastro = funcionario.criado_em
      ? new Date(funcionario.criado_em).toLocaleDateString('pt-BR')
      : '-';

    const ultimoTreino = funcionario.ultimo_treino
      ? new Date(funcionario.ultimo_treino).toLocaleDateString('pt-BR')
      : 'Sem treino';

    const melhorMaestria = funcionario.melhor_maestria !== null && funcionario.melhor_maestria !== undefined
      ? `${Number(funcionario.melhor_maestria).toFixed(0)}%`
      : 'Sem teste';

    return `
      <tr>
        <td>${funcionario.nome}</td>
        <td>${funcionario.email}</td>
        <td>${dataCadastro}</td>
        <td>${funcionario.total_treinos || 0} treino(s) • ${ultimoTreino}</td>
        <td>${melhorMaestria}</td>
      </tr>
    `;
  }).join('');

  return data;
}

// Sobrescreve a função original para incluir a lista de funcionários no painel.
const preencherDashboardEmpresaOriginal = preencherDashboardEmpresa;
preencherDashboardEmpresa = async function preencherDashboardEmpresaComFuncionarios() {
  await preencherDashboardEmpresaOriginal();
  await carregarFuncionariosEmpresa();
};

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('#btn-atualizar-funcionarios')?.addEventListener('click', carregarFuncionariosEmpresa);
});
