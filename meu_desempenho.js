// Tela de desempenho individual do funcionário.

async function carregarMeuDesempenho() {
  const client = getSupabaseClient();
  const container = document.querySelector('#meu-desempenho-conteudo');

  if (!container) return;
  container.innerHTML = '<div class="empty-state">Carregando seu desempenho...</div>';

  if (!client || !appState?.perfil) {
    container.innerHTML = '<div class="empty-state">Faça login para ver seu desempenho.</div>';
    return;
  }

  const [treinosResp, maestriaResp] = await Promise.all([
    client
      .from('sessoes_treino')
      .select('id,total_perguntas,acertos,finalizada,finalizada_em,iniciada_em')
      .eq('usuario_id', appState.perfil.id)
      .eq('finalizada', true)
      .order('finalizada_em', { ascending: false })
      .limit(20),
    client
      .from('testes_maestria')
      .select('id,total_perguntas,acertos,percentual,nivel_resultado,finalizado,finalizado_em,iniciado_em')
      .eq('usuario_id', appState.perfil.id)
      .eq('finalizado', true)
      .order('finalizado_em', { ascending: false })
      .limit(20),
  ]);

  if (treinosResp.error || maestriaResp.error) {
    console.error('Erro ao carregar desempenho:', treinosResp.error || maestriaResp.error);
    container.innerHTML = '<div class="empty-state">Não foi possível carregar seu desempenho.</div>';
    return;
  }

  const treinos = treinosResp.data || [];
  const maestrias = maestriaResp.data || [];
  const totalTreinos = treinos.length;
  const totalMaestrias = maestrias.length;
  const mediaTreinos = totalTreinos
    ? Math.round(treinos.reduce((acc, item) => acc + ((item.acertos / item.total_perguntas) * 100), 0) / totalTreinos)
    : 0;
  const melhorMaestria = maestrias.length
    ? Math.max(...maestrias.map((item) => Number(item.percentual || 0)))
    : 0;

  const linhas = [
    ...treinos.map((item) => ({
      tipo: 'Treino',
      acertos: item.acertos,
      total: item.total_perguntas,
      percentual: Math.round((item.acertos / item.total_perguntas) * 100),
      nivel: calcularNivelDesempenho(Math.round((item.acertos / item.total_perguntas) * 100)),
      data: item.finalizada_em,
    })),
    ...maestrias.map((item) => ({
      tipo: 'Teste de Maestria',
      acertos: item.acertos,
      total: item.total_perguntas,
      percentual: Math.round(Number(item.percentual || 0)),
      nivel: item.nivel_resultado || calcularNivelDesempenho(Math.round(Number(item.percentual || 0))),
      data: item.finalizado_em,
    })),
  ].sort((a, b) => new Date(b.data || 0) - new Date(a.data || 0));

  container.innerHTML = `
    <div class="stats-grid desempenho-stats">
      <div class="stat-card"><span>${totalTreinos}</span><small>Treinos finalizados</small></div>
      <div class="stat-card"><span>${totalMaestrias}</span><small>Testes de Maestria</small></div>
      <div class="stat-card"><span>${mediaTreinos}%</span><small>Média nos treinos</small></div>
      <div class="stat-card"><span>${Math.round(melhorMaestria)}%</span><small>Melhor maestria</small></div>
    </div>

    <div class="panel-card desempenho-card">
      <div class="panel-head">
        <h3>Histórico individual</h3>
        <button id="btn-atualizar-meu-desempenho" class="btn btn-secondary" type="button">Atualizar</button>
      </div>
      <div class="table-wrap">
        <table class="ranking-table">
          <thead><tr><th>Tipo</th><th>Acertos</th><th>Percentual</th><th>Nível</th><th>Data</th></tr></thead>
          <tbody>
            ${linhas.length ? linhas.map((item) => `
              <tr>
                <td>${item.tipo}</td>
                <td>${item.acertos}/${item.total}</td>
                <td>${item.percentual}%</td>
                <td>${item.nivel}</td>
                <td>${item.data ? new Date(item.data).toLocaleString('pt-BR') : '-'}</td>
              </tr>
            `).join('') : '<tr><td colspan="5">Você ainda não finalizou nenhum treino ou teste.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;

  document.querySelector('#btn-atualizar-meu-desempenho')?.addEventListener('click', carregarMeuDesempenho);
}

function calcularNivelDesempenho(percentual) {
  if (percentual >= 90) return 'Excelente';
  if (percentual >= 75) return 'Avançado';
  if (percentual >= 60) return 'Intermediário';
  if (percentual >= 40) return 'Básico';
  return 'Precisa praticar';
}

function inserirCardMeuDesempenho() {
  const menuGrid = document.querySelector('#view-menu-principal .menu-grid');
  if (!menuGrid || document.querySelector('#btn-meu-desempenho-card')) return;

  const card = document.createElement('article');
  card.className = 'action-card nav-funcionario desempenho-menu-card';
  card.innerHTML = `
    <span class="badge">Individual</span>
    <h3>Meu desempenho</h3>
    <p>Veja seus treinos finalizados, testes de maestria, média e evolução individual.</p>
    <button id="btn-meu-desempenho-card" class="btn btn-secondary full" data-view="meu-desempenho" type="button">Ver desempenho</button>
  `;
  menuGrid.appendChild(card);

  card.querySelector('[data-view="meu-desempenho"]')?.addEventListener('click', () => {
    showView('meu-desempenho');
    carregarMeuDesempenho();
  });

  atualizarNav();
}

function setupMeuDesempenho() {
  inserirCardMeuDesempenho();
  document.querySelectorAll('[data-view="meu-desempenho"]').forEach((button) => {
    button.addEventListener('click', () => setTimeout(carregarMeuDesempenho, 80));
  });
}

document.addEventListener('DOMContentLoaded', setupMeuDesempenho);
