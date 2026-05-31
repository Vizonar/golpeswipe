// Ranking funcional da empresa com base no Teste de Maestria.

async function carregarRankingEmpresa() {
  const client = getSupabaseClient();
  const tbody = document.querySelector('#ranking-tbody');
  const labelEmpresa = document.querySelector('#ranking-empresa');

  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="6">Carregando ranking...</td></tr>';
  if (labelEmpresa) labelEmpresa.textContent = appState?.empresa?.nome ? `Empresa: ${appState.empresa.nome}` : '';

  if (!client || !appState?.perfil) {
    tbody.innerHTML = '<tr><td colspan="6">Faça login para ver o ranking.</td></tr>';
    return;
  }

  const { data, error } = await client.rpc('listar_ranking_empresa');

  if (error) {
    console.error('Erro ao carregar ranking:', error);
    tbody.innerHTML = '<tr><td colspan="6">Não foi possível carregar o ranking. Rode o SQL de atualização no Supabase.</td></tr>';
    return;
  }

  if (!data || data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6">Nenhum Teste de Maestria finalizado ainda.</td></tr>';
    return;
  }

  tbody.innerHTML = data.map((item) => {
    const dataFinalizacao = item.finalizado_em
      ? new Date(item.finalizado_em).toLocaleDateString('pt-BR')
      : '-';

    return `
      <tr>
        <td>${item.posicao}</td>
        <td>${item.funcionario}</td>
        <td>${item.acertos}/${item.total_perguntas}</td>
        <td>${Number(item.percentual).toFixed(0)}%</td>
        <td>${item.nivel_resultado || '-'}</td>
        <td>${dataFinalizacao}</td>
      </tr>
    `;
  }).join('');
}

function setupRanking() {
  document.querySelector('#btn-atualizar-ranking')?.addEventListener('click', carregarRankingEmpresa);

  document.querySelectorAll('[data-view="ranking"]').forEach((button) => {
    button.addEventListener('click', () => {
      setTimeout(carregarRankingEmpresa, 80);
    });
  });
}

document.addEventListener('DOMContentLoaded', setupRanking);
