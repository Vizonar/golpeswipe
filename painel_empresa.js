// Painel da empresa: funcionários e histórico de resultados.
// Usa RPCs security definer no Supabase para evitar policy recursiva em perfis.

let resultadosEmpresaCache = [];
let funcionariosEmpresaCache = [];

function carregarModuloQuestoesEmpresa() {
  if (document.querySelector('script[data-modulo="questoes-empresa"]')) return;
  const script = document.createElement('script');
  script.src = 'questoes_empresa.js';
  script.dataset.modulo = 'questoes-empresa';
  document.body.appendChild(script);
}

function normalizarBusca(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function atualizarCardsResumoEmpresa() {
  const statFuncionarios = document.querySelector('#stat-funcionarios');
  const statTestes = document.querySelector('#stat-testes');
  const statMedia = document.querySelector('#stat-media');

  if (statFuncionarios) statFuncionarios.textContent = funcionariosEmpresaCache.length || 0;

  const testesCompletos = resultadosEmpresaCache.filter((item) => item.tipo === 'Teste de Maestria' || item.tipo === 'Teste Completo');
  const baseMedia = testesCompletos.length ? testesCompletos : resultadosEmpresaCache;

  if (statTestes) statTestes.textContent = testesCompletos.length || 0;

  const media = baseMedia.length
    ? Math.round(baseMedia.reduce((sum, item) => sum + Number(item.percentual || 0), 0) / baseMedia.length)
    : 0;

  if (statMedia) statMedia.textContent = `${media}%`;
}

function atualizarRelatoriosFinaisSeExistir() {
  if (typeof atualizarTabelaRelatoriosFinais === 'function') {
    atualizarTabelaRelatoriosFinais();
  }
}

function garantirFiltrosResultadosEmpresa() {
  if (document.querySelector('#filtro-resultados-busca')) return;

  const tabela = document.querySelector('#resultados-tbody')?.closest('.table-wrap');
  if (!tabela) return;

  const filtros = document.createElement('div');
  filtros.className = 'filters-bar';
  filtros.innerHTML = `
    <label>
      Buscar funcionário ou e-mail
      <input id="filtro-resultados-busca" type="search" placeholder="Ex: ana@empresa.com" />
    </label>
    <label>
      Tipo de resultado
      <select id="filtro-resultados-tipo">
        <option value="todos">Todos</option>
        <option value="Treino">Treino</option>
        <option value="Teste de Maestria">Teste Completo</option>
      </select>
    </label>
  `;

  tabela.parentElement.insertBefore(filtros, tabela);
  document.querySelector('#filtro-resultados-busca')?.addEventListener('input', aplicarFiltrosResultadosEmpresa);
  document.querySelector('#filtro-resultados-tipo')?.addEventListener('change', aplicarFiltrosResultadosEmpresa);
}

async function carregarFuncionariosEmpresa() {
  const supabaseClient = getSupabaseClient();
  const tbody = document.querySelector('#funcionarios-tbody');

  if (!tbody) return [];
  tbody.innerHTML = '<tr><td colspan="5">Carregando funcionários...</td></tr>';

  if (!supabaseClient || !appState?.perfil || appState.perfil.tipo_usuario !== 'admin_empresa') {
    funcionariosEmpresaCache = [];
    atualizarCardsResumoEmpresa();
    atualizarRelatoriosFinaisSeExistir();
    tbody.innerHTML = '<tr><td colspan="5">Apenas administradores da empresa podem ver esta lista.</td></tr>';
    return [];
  }

  const { data, error } = await supabaseClient.rpc('listar_funcionarios_empresa');

  if (error) {
    console.error('Erro ao carregar funcionários:', error);
    funcionariosEmpresaCache = [];
    atualizarCardsResumoEmpresa();
    atualizarRelatoriosFinaisSeExistir();
    tbody.innerHTML = '<tr><td colspan="5">Não foi possível carregar os funcionários. Rode o SQL de atualização no Supabase.</td></tr>';
    return [];
  }

  funcionariosEmpresaCache = data || [];
  atualizarCardsResumoEmpresa();
  atualizarRelatoriosFinaisSeExistir();

  if (funcionariosEmpresaCache.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5">Nenhum funcionário cadastrado ainda.</td></tr>';
    return [];
  }

  tbody.innerHTML = funcionariosEmpresaCache.map((funcionario) => {
    const dataCadastro = funcionario.criado_em
      ? new Date(funcionario.criado_em).toLocaleDateString('pt-BR')
      : '-';

    const ultimoTreino = funcionario.ultimo_treino
      ? new Date(funcionario.ultimo_treino).toLocaleDateString('pt-BR')
      : 'Sem treino';

    const melhorTeste = funcionario.melhor_maestria !== null && funcionario.melhor_maestria !== undefined
      ? `${Number(funcionario.melhor_maestria).toFixed(0)}%`
      : 'Sem teste';

    return `
      <tr>
        <td>${funcionario.nome}</td>
        <td>${funcionario.email}</td>
        <td>${dataCadastro}</td>
        <td>${funcionario.total_treinos || 0} treino(s) • ${ultimoTreino}</td>
        <td>${melhorTeste}</td>
      </tr>
    `;
  }).join('');

  return funcionariosEmpresaCache;
}

function renderizarResultadosEmpresa(lista) {
  const tbody = document.querySelector('#resultados-tbody');
  if (!tbody) return;

  if (!lista || lista.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7">Nenhum resultado encontrado com os filtros atuais.</td></tr>';
    return;
  }

  tbody.innerHTML = lista.map((resultado) => {
    const dataFinalizacao = resultado.finalizado_em
      ? new Date(resultado.finalizado_em).toLocaleString('pt-BR')
      : '-';

    const percentual = resultado.percentual !== null && resultado.percentual !== undefined
      ? `${Number(resultado.percentual).toFixed(0)}%`
      : '-';

    const tipo = resultado.tipo === 'Teste de Maestria' ? 'Teste Completo' : resultado.tipo;

    return `
      <tr>
        <td>${tipo}</td>
        <td>${resultado.funcionario}</td>
        <td>${resultado.email}</td>
        <td>${resultado.acertos}/${resultado.total_perguntas}</td>
        <td>${percentual}</td>
        <td>${resultado.nivel_resultado || '-'}</td>
        <td>${dataFinalizacao}</td>
      </tr>
    `;
  }).join('');
}

function aplicarFiltrosResultadosEmpresa() {
  const busca = normalizarBusca(document.querySelector('#filtro-resultados-busca')?.value || '');
  const tipo = document.querySelector('#filtro-resultados-tipo')?.value || 'todos';

  const filtrados = resultadosEmpresaCache.filter((resultado) => {
    const texto = normalizarBusca(`${resultado.funcionario} ${resultado.email}`);
    const passaBusca = !busca || texto.includes(busca);
    const passaTipo = tipo === 'todos' || resultado.tipo === tipo || (tipo === 'Teste de Maestria' && resultado.tipo === 'Teste Completo');
    return passaBusca && passaTipo;
  });

  renderizarResultadosEmpresa(filtrados);
}

async function carregarResultadosEmpresa() {
  garantirFiltrosResultadosEmpresa();
  const supabaseClient = getSupabaseClient();
  const tbody = document.querySelector('#resultados-tbody');

  if (!tbody) return [];
  tbody.innerHTML = '<tr><td colspan="7">Carregando resultados...</td></tr>';

  if (!supabaseClient || !appState?.perfil || appState.perfil.tipo_usuario !== 'admin_empresa') {
    resultadosEmpresaCache = [];
    atualizarCardsResumoEmpresa();
    atualizarRelatoriosFinaisSeExistir();
    tbody.innerHTML = '<tr><td colspan="7">Apenas administradores da empresa podem ver os resultados.</td></tr>';
    return [];
  }

  const { data, error } = await supabaseClient.rpc('listar_resultados_empresa');

  if (error) {
    console.error('Erro ao carregar resultados:', error);
    resultadosEmpresaCache = [];
    atualizarCardsResumoEmpresa();
    atualizarRelatoriosFinaisSeExistir();
    tbody.innerHTML = '<tr><td colspan="7">Não foi possível carregar os resultados. Rode o SQL de atualização no Supabase.</td></tr>';
    return [];
  }

  resultadosEmpresaCache = data || [];
  atualizarCardsResumoEmpresa();
  atualizarRelatoriosFinaisSeExistir();

  if (resultadosEmpresaCache.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7">Nenhum resultado registrado ainda. Finalize um treino para aparecer aqui.</td></tr>';
    return [];
  }

  aplicarFiltrosResultadosEmpresa();
  return resultadosEmpresaCache;
}

const preencherDashboardEmpresaOriginal = preencherDashboardEmpresa;
preencherDashboardEmpresa = async function preencherDashboardEmpresaComDados() {
  await preencherDashboardEmpresaOriginal();
  await carregarFuncionariosEmpresa();
  await carregarResultadosEmpresa();
  atualizarRelatoriosFinaisSeExistir();
  if (typeof criarPainelQuestoesEmpresa === 'function') {
    criarPainelQuestoesEmpresa();
    await carregarQuestoesEmpresa();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  carregarModuloQuestoesEmpresa();
  document.querySelector('#btn-atualizar-funcionarios')?.addEventListener('click', carregarFuncionariosEmpresa);
  document.querySelector('#btn-atualizar-resultados')?.addEventListener('click', carregarResultadosEmpresa);
});
