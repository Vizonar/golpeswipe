// Questões personalizadas por empresa.
// Permite que administradores adicionem novos cenários além das perguntas fixas.

let questoesEmpresaCache = [];

function normalizarQuestaoEmpresa(item, index = 0) {
  return {
    codigo: `empresa-${item.id || Date.now()}-${index}`,
    categoria: item.categoria,
    titulo: item.titulo,
    cenario: item.cenario.startsWith('Cenário simulado')
      ? item.cenario
      : `Cenário simulado personalizado: ${item.cenario} Considerando esse cenário, é golpe ou não é golpe?`,
    respostaCorreta: item.resposta_correta,
    feedbackAcerto: item.resposta_correta === 'golpe'
      ? 'Correto! Esse cenário personalizado apresenta sinais de golpe e exige atenção.'
      : 'Correto! Esse cenário personalizado apresenta uma conduta segura.',
    feedbackErro: item.resposta_correta === 'golpe'
      ? 'Atenção! Essa situação era golpe. Revise os sinais de alerta e evite agir com pressa.'
      : 'Atenção! Essa situação não era golpe. O cenário apresenta uma verificação segura ou uma conduta adequada.',
    sinais: Array.isArray(item.sinais) ? item.sinais : [],
    dica: item.dica,
    nivel: 'personalizado',
    origem: 'empresa',
  };
}

function obterRepertorioGolpeSwipe() {
  const fixas = Array.isArray(window.GOLPESWIPE_PERGUNTAS_BASE)
    ? window.GOLPESWIPE_PERGUNTAS_BASE
    : Array.isArray(window.GOLPESWIPE_PERGUNTAS)
      ? window.GOLPESWIPE_PERGUNTAS
      : [];

  const personalizadas = questoesEmpresaCache.map(normalizarQuestaoEmpresa);
  return [...fixas, ...personalizadas];
}

async function carregarQuestoesEmpresa() {
  const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
  if (!client || !window.appState?.perfil?.empresa_id) return [];

  const { data, error } = await client.rpc('listar_questoes_empresa');

  if (error) {
    console.warn('Não foi possível carregar questões da empresa:', error);
    questoesEmpresaCache = [];
    return [];
  }

  questoesEmpresaCache = data || [];
  atualizarListaQuestoesEmpresa();
  return questoesEmpresaCache;
}

function criarPainelQuestoesEmpresa() {
  const dashboard = document.querySelector('#view-dashboard-empresa');
  if (!dashboard || document.querySelector('#questoes-empresa-card')) return;

  const card = document.createElement('div');
  card.id = 'questoes-empresa-card';
  card.className = 'panel-card nav-admin';
  card.innerHTML = `
    <div class="panel-head">
      <div>
        <h3>Questões da empresa</h3>
        <p class="muted">Cadastre novos cenários personalizados para aparecerem junto das perguntas fixas.</p>
      </div>
    </div>

    <form id="form-questao-empresa" class="form two-cols question-company-form">
      <label>Categoria
        <input id="questao-categoria" type="text" placeholder="Ex: WhatsApp, Pix, E-mail" required />
      </label>
      <label>Resposta correta
        <select id="questao-resposta" required>
          <option value="golpe">É golpe</option>
          <option value="seguro">Não é golpe</option>
        </select>
      </label>
      <label class="span-2">Título
        <input id="questao-titulo" type="text" placeholder="Ex: Pedido urgente de transferência" required />
      </label>
      <label class="span-2">Cenário simulado
        <textarea id="questao-cenario" rows="4" placeholder="Ex: Você recebe uma mensagem de um fornecedor pedindo alteração urgente da chave Pix..." required></textarea>
      </label>
      <label class="span-2">Sinais observados
        <textarea id="questao-sinais" rows="3" placeholder="Digite um sinal por linha. Ex: Urgência exagerada"></textarea>
      </label>
      <label class="span-2">Dica preventiva
        <textarea id="questao-dica" rows="3" placeholder="Ex: Confirme alterações de pagamento por um canal oficial antes de transferir valores." required></textarea>
      </label>
      <button class="btn btn-primary full span-2" type="submit">Adicionar questão</button>
    </form>

    <div class="table-wrap question-company-table">
      <table class="ranking-table">
        <thead>
          <tr><th>Categoria</th><th>Título</th><th>Resposta</th><th>Data</th></tr>
        </thead>
        <tbody id="questoes-empresa-tbody"><tr><td colspan="4">Nenhuma questão personalizada carregada.</td></tr></tbody>
      </table>
    </div>
  `;

  const primeiroPainel = dashboard.querySelector('.panel-card');
  if (primeiroPainel) {
    dashboard.insertBefore(card, primeiroPainel);
  } else {
    dashboard.appendChild(card);
  }

  card.querySelector('#form-questao-empresa')?.addEventListener('submit', salvarQuestaoEmpresa);
  if (typeof atualizarNav === 'function') atualizarNav();
}

function atualizarListaQuestoesEmpresa() {
  criarPainelQuestoesEmpresa();
  const tbody = document.querySelector('#questoes-empresa-tbody');
  if (!tbody) return;

  if (!questoesEmpresaCache.length) {
    tbody.innerHTML = '<tr><td colspan="4">Nenhuma questão personalizada cadastrada ainda.</td></tr>';
    return;
  }

  tbody.innerHTML = questoesEmpresaCache.map((q) => `
    <tr>
      <td>${q.categoria}</td>
      <td>${q.titulo}</td>
      <td>${q.resposta_correta === 'golpe' ? 'É golpe' : 'Não é golpe'}</td>
      <td>${q.criado_em ? new Date(q.criado_em).toLocaleDateString('pt-BR') : '-'}</td>
    </tr>
  `).join('');
}

async function salvarQuestaoEmpresa(event) {
  event.preventDefault();
  const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
  const form = event.currentTarget;

  if (!client || window.appState?.perfil?.tipo_usuario !== 'admin_empresa') {
    showToast('Apenas administradores da empresa podem cadastrar questões.', 'error');
    return;
  }

  const categoria = document.querySelector('#questao-categoria')?.value.trim();
  const titulo = document.querySelector('#questao-titulo')?.value.trim();
  const cenario = document.querySelector('#questao-cenario')?.value.trim();
  const resposta = document.querySelector('#questao-resposta')?.value;
  const sinaisTexto = document.querySelector('#questao-sinais')?.value || '';
  const dica = document.querySelector('#questao-dica')?.value.trim();
  const sinais = sinaisTexto.split('\n').map((s) => s.trim()).filter(Boolean);

  if (!categoria || !titulo || !cenario || !resposta || !dica) {
    showToast('Preencha os campos obrigatórios da questão.', 'error');
    return;
  }

  setLoading(form, true, 'Salvando...');

  const { error } = await client.rpc('inserir_questao_empresa', {
    p_categoria: categoria,
    p_titulo: titulo,
    p_cenario: cenario,
    p_resposta_correta: resposta,
    p_sinais: sinais,
    p_dica: dica,
  });

  setLoading(form, false);

  if (error) {
    console.error('Erro ao cadastrar questão:', error);
    showToast(error.message || 'Não foi possível cadastrar a questão. Rode o SQL de questões no Supabase.', 'error');
    return;
  }

  form.reset();
  showToast('Questão adicionada com sucesso.');
  await carregarQuestoesEmpresa();
}

function instalarQuestoesEmpresa() {
  if (window.__GOLPESWIPE_QUESTOES_INSTALADO) return;
  window.__GOLPESWIPE_QUESTOES_INSTALADO = true;

  const tentarInstalar = () => {
    if (typeof preencherMenuPrincipal === 'function' && !preencherMenuPrincipal.__questoesEmpresa) {
      const original = preencherMenuPrincipal;
      const wrapper = function preencherMenuPrincipalComQuestoes() {
        original();
        carregarQuestoesEmpresa();
      };
      wrapper.__questoesEmpresa = true;
      preencherMenuPrincipal = wrapper;
    }

    if (typeof preencherDashboardEmpresa === 'function' && !preencherDashboardEmpresa.__questoesEmpresa) {
      const originalDashboard = preencherDashboardEmpresa;
      const wrapperDashboard = async function preencherDashboardEmpresaComQuestoes() {
        await originalDashboard();
        criarPainelQuestoesEmpresa();
        await carregarQuestoesEmpresa();
      };
      wrapperDashboard.__questoesEmpresa = true;
      preencherDashboardEmpresa = wrapperDashboard;
    }
  };

  tentarInstalar();
  setTimeout(tentarInstalar, 0);
  setTimeout(tentarInstalar, 300);
}

window.obterRepertorioGolpeSwipe = obterRepertorioGolpeSwipe;
window.carregarQuestoesEmpresa = carregarQuestoesEmpresa;
window.criarPainelQuestoesEmpresa = criarPainelQuestoesEmpresa;
window.atualizarListaQuestoesEmpresa = atualizarListaQuestoesEmpresa;

document.addEventListener('DOMContentLoaded', () => {
  instalarQuestoesEmpresa();
  criarPainelQuestoesEmpresa();
});
