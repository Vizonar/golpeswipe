// ==========================================================
// GOLPESWIPE EMPRESAS - FASE 1
// Autenticação, cadastro de empresa/funcionário e dashboards.
//
// Segurança:
// - Não coloque URL/key real do Supabase neste arquivo.
// - Para desenvolvimento local, copie config.example.js para config.local.js.
// - O arquivo config.local.js está no .gitignore e não deve ser commitado.
// - A anon key do Supabase é pública em apps frontend; proteja os dados com RLS.
// - Nunca use service_role key no navegador.
// ==========================================================

const appState = {
  user: null,
  perfil: null,
  empresa: null,
  supabaseClient: null,
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

function showToast(message, type = 'success') {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  setTimeout(() => {
    toast.className = 'toast';
  }, 3800);
}

function setLoading(form, isLoading, text = 'Processando...') {
  const button = form?.querySelector('button[type="submit"]');
  if (!button) return;
  if (isLoading) {
    button.dataset.originalText = button.textContent;
    button.textContent = text;
    button.disabled = true;
  } else {
    button.textContent = button.dataset.originalText || button.textContent;
    button.disabled = false;
  }
}

function normalizarCodigoEmpresa(codigo) {
  return String(codigo || '').trim().toUpperCase().replace(/\s+/g, '');
}

function showView(viewName) {
  $$('.view').forEach((view) => view.classList.remove('active'));
  const target = $(`#view-${viewName}`);
  if (!target) {
    console.warn(`Tela não encontrada: ${viewName}`);
    return;
  }
  target.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function atualizarNav() {
  const nav = $('#main-nav');
  if (!nav) return;

  const logado = Boolean(appState.user && appState.perfil);
  nav.classList.toggle('hidden', !logado);

  const isAdmin = appState.perfil?.tipo_usuario === 'admin_empresa';
  const isFuncionario = appState.perfil?.tipo_usuario === 'funcionario';

  $$('.nav-admin').forEach((el) => el.classList.toggle('hidden', !isAdmin));
  $$('.nav-funcionario').forEach((el) => el.classList.toggle('hidden', !(isFuncionario || isAdmin)));
}

function getSupabaseClient() {
  return appState.supabaseClient;
}

async function carregarConfigLocal() {
  if (window.GOLPESWIPE_CONFIG) return window.GOLPESWIPE_CONFIG;

  await new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'config.local.js';
    script.onload = resolve;
    script.onerror = resolve;
    document.head.appendChild(script);
  });

  return window.GOLPESWIPE_CONFIG || null;
}

async function inicializarSupabase() {
  const config = await carregarConfigLocal();

  if (!config?.SUPABASE_URL || !config?.SUPABASE_ANON_KEY) {
    showToast('Configuração do Supabase não encontrada. Crie o arquivo config.local.js a partir do config.example.js.', 'error');
    return null;
  }

  if (!window.supabase?.createClient) {
    showToast('Biblioteca do Supabase não carregou. Verifique sua conexão.', 'error');
    return null;
  }

  appState.supabaseClient = window.supabase.createClient(
    config.SUPABASE_URL,
    config.SUPABASE_ANON_KEY
  );

  return appState.supabaseClient;
}

async function carregarEmpresa(empresaId) {
  const supabaseClient = getSupabaseClient();
  if (!supabaseClient || !empresaId) return null;

  const { data, error } = await supabaseClient
    .from('empresas')
    .select('*')
    .eq('id', empresaId)
    .single();

  if (error) {
    console.error('Erro ao carregar empresa:', error);
    return null;
  }

  return data;
}

async function carregarPerfil(userId) {
  const supabaseClient = getSupabaseClient();
  if (!supabaseClient || !userId) return null;

  const { data, error } = await supabaseClient
    .from('perfis')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Erro ao carregar perfil:', error);
    return null;
  }

  return data;
}

function preencherDashboardFuncionario() {
  const nome = appState.perfil?.nome || 'Funcionário';
  const empresa = appState.empresa?.nome || 'empresa não identificada';

  const boasVindas = $('#funcionario-boas-vindas');
  const funcionarioEmpresa = $('#funcionario-empresa');

  if (boasVindas) boasVindas.textContent = `Olá, ${nome}!`;
  if (funcionarioEmpresa) funcionarioEmpresa.textContent = `Empresa vinculada: ${empresa}`;
}

async function carregarResumoEmpresa() {
  const supabaseClient = getSupabaseClient();
  if (!supabaseClient || !appState.empresa?.id) return;

  const empresaId = appState.empresa.id;

  const { count: funcionariosCount } = await supabaseClient
    .from('perfis')
    .select('*', { count: 'exact', head: true })
    .eq('empresa_id', empresaId)
    .eq('tipo_usuario', 'funcionario');

  const { data: testes, error } = await supabaseClient
    .from('testes_maestria')
    .select('acertos,total_perguntas,percentual,nivel_resultado,finalizado_em,usuario_id')
    .eq('empresa_id', empresaId)
    .eq('finalizado', true)
    .order('percentual', { ascending: false })
    .limit(5);

  if (error) console.error('Erro ao carregar resumo:', error);

  const totalTestes = testes?.length || 0;
  const media = totalTestes
    ? Math.round(testes.reduce((sum, item) => sum + Number(item.percentual || 0), 0) / totalTestes)
    : 0;

  $('#stat-funcionarios').textContent = funcionariosCount || 0;
  $('#stat-testes').textContent = totalTestes;
  $('#stat-media').textContent = `${media}%`;

  const rankingResumo = $('#ranking-resumo');
  if (!rankingResumo) return;

  if (!testes || testes.length === 0) {
    rankingResumo.className = 'ranking-list empty-state';
    rankingResumo.textContent = 'Nenhum teste finalizado ainda.';
    return;
  }

  rankingResumo.className = 'ranking-list';
  rankingResumo.innerHTML = testes
    .map((teste, index) => `
      <div class="review-item">
        <strong>${index + 1}º lugar</strong><br />
        ${teste.acertos}/${teste.total_perguntas} acertos • ${teste.percentual}% • ${teste.nivel_resultado || 'Sem nível'}
      </div>
    `)
    .join('');
}

async function preencherDashboardEmpresa() {
  const empresaNome = $('#empresa-dashboard-nome');
  const empresaCodigo = $('#empresa-dashboard-codigo');

  if (empresaNome) empresaNome.textContent = appState.empresa?.nome || 'Empresa';
  if (empresaCodigo) empresaCodigo.textContent = `Código da empresa: ${appState.empresa?.codigo_empresa || '-'}`;

  await carregarResumoEmpresa();
}

function irParaDashboardCorreto() {
  atualizarNav();

  if (!appState.perfil) {
    showView('home');
    return;
  }

  if (appState.perfil.tipo_usuario === 'admin_empresa') {
    preencherDashboardEmpresa();
    showView('dashboard-empresa');
    return;
  }

  preencherDashboardFuncionario();
  showView('dashboard-funcionario');
}

async function carregarSessaoAtual() {
  const supabaseClient = getSupabaseClient();
  if (!supabaseClient) {
    showView('home');
    return;
  }

  const { data, error } = await supabaseClient.auth.getSession();

  if (error) {
    console.error(error);
    showView('home');
    return;
  }

  const session = data?.session;

  if (!session?.user) {
    appState.user = null;
    appState.perfil = null;
    appState.empresa = null;
    atualizarNav();
    showView('home');
    return;
  }

  appState.user = session.user;
  appState.perfil = await carregarPerfil(session.user.id);
  appState.empresa = await carregarEmpresa(appState.perfil?.empresa_id);

  if (!appState.perfil) {
    showToast('Usuário autenticado, mas perfil não encontrado.', 'error');
    showView('home');
    return;
  }

  irParaDashboardCorreto();
}

async function handleLogin(event) {
  event.preventDefault();
  const supabaseClient = getSupabaseClient();

  if (!supabaseClient) {
    showToast('Configure o Supabase antes de fazer login.', 'error');
    return;
  }

  const form = event.currentTarget;
  setLoading(form, true, 'Entrando...');

  try {
    const email = $('#login-email').value.trim();
    const password = $('#login-senha').value;

    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) throw error;

    appState.user = data.user;
    appState.perfil = await carregarPerfil(data.user.id);
    appState.empresa = await carregarEmpresa(appState.perfil?.empresa_id);

    if (!appState.perfil) throw new Error('Perfil não encontrado. Verifique se o cadastro foi concluído corretamente.');

    showToast('Login realizado com sucesso.');
    irParaDashboardCorreto();
  } catch (error) {
    console.error(error);
    showToast(error.message || 'Erro ao fazer login.', 'error');
  } finally {
    setLoading(form, false);
  }
}

async function handleCadastroEmpresa(event) {
  event.preventDefault();
  const supabaseClient = getSupabaseClient();

  if (!supabaseClient) {
    showToast('Configure o Supabase antes de cadastrar.', 'error');
    return;
  }

  const form = event.currentTarget;
  setLoading(form, true, 'Cadastrando...');

  try {
    const nomeResponsavel = $('#empresa-responsavel').value.trim();
    const email = $('#empresa-email').value.trim();
    const password = $('#empresa-senha').value;
    const nomeEmpresa = $('#empresa-nome').value.trim();
    const cnpj = $('#empresa-cnpj').value.trim() || null;
    const codigoEmpresa = normalizarCodigoEmpresa($('#empresa-codigo').value);

    if (!codigoEmpresa) throw new Error('Informe um código de empresa válido.');

    const { data: authData, error: authError } = await supabaseClient.auth.signUp({ email, password });
    if (authError) throw authError;
    if (!authData.user) throw new Error('Não foi possível criar o usuário.');

    const { data: empresa, error: empresaError } = await supabaseClient
      .from('empresas')
      .insert({ nome: nomeEmpresa, cnpj, codigo_empresa: codigoEmpresa })
      .select()
      .single();

    if (empresaError) throw empresaError;

    const { error: perfilError } = await supabaseClient.from('perfis').insert({
      id: authData.user.id,
      nome: nomeResponsavel,
      email,
      tipo_usuario: 'admin_empresa',
      empresa_id: empresa.id,
    });

    if (perfilError) throw perfilError;

    appState.user = authData.user;
    appState.perfil = await carregarPerfil(authData.user.id);
    appState.empresa = empresa;

    form.reset();
    showToast(`Empresa cadastrada. Código: ${codigoEmpresa}`);
    irParaDashboardCorreto();
  } catch (error) {
    console.error(error);
    showToast(error.message || 'Erro ao cadastrar empresa.', 'error');
  } finally {
    setLoading(form, false);
  }
}

async function handleCadastroFuncionario(event) {
  event.preventDefault();
  const supabaseClient = getSupabaseClient();

  if (!supabaseClient) {
    showToast('Configure o Supabase antes de cadastrar.', 'error');
    return;
  }

  const form = event.currentTarget;
  setLoading(form, true, 'Cadastrando...');

  try {
    const nome = $('#funcionario-nome').value.trim();
    const email = $('#funcionario-email').value.trim();
    const password = $('#funcionario-senha').value;
    const codigoEmpresa = normalizarCodigoEmpresa($('#funcionario-codigo').value);

    const { data: empresa, error: empresaError } = await supabaseClient
      .from('empresas')
      .select('*')
      .eq('codigo_empresa', codigoEmpresa)
      .single();

    if (empresaError || !empresa) throw new Error('Código da empresa não encontrado.');

    const { data: authData, error: authError } = await supabaseClient.auth.signUp({ email, password });
    if (authError) throw authError;
    if (!authData.user) throw new Error('Não foi possível criar o usuário.');

    const { error: perfilError } = await supabaseClient.from('perfis').insert({
      id: authData.user.id,
      nome,
      email,
      tipo_usuario: 'funcionario',
      empresa_id: empresa.id,
    });

    if (perfilError) throw perfilError;

    appState.user = authData.user;
    appState.perfil = await carregarPerfil(authData.user.id);
    appState.empresa = empresa;

    form.reset();
    showToast('Funcionário cadastrado com sucesso.');
    irParaDashboardCorreto();
  } catch (error) {
    console.error(error);
    showToast(error.message || 'Erro ao cadastrar funcionário.', 'error');
  } finally {
    setLoading(form, false);
  }
}

async function handleLogout() {
  const supabaseClient = getSupabaseClient();
  if (!supabaseClient) return;

  await supabaseClient.auth.signOut();
  appState.user = null;
  appState.perfil = null;
  appState.empresa = null;
  atualizarNav();
  showToast('Você saiu da conta.');
  showView('home');
}

function bloquearRecursosNaoImplementados() {
  $$('[data-start="treino"]').forEach((button) => {
    button.addEventListener('click', () => {
      showToast('O modo treino será ativado na próxima etapa do JavaScript.', 'error');
    });
  });

  $$('[data-start="maestria"]').forEach((button) => {
    button.addEventListener('click', () => {
      showToast('O Teste de Maestria será ativado na próxima etapa do JavaScript.', 'error');
    });
  });

  $('#btn-atualizar-ranking')?.addEventListener('click', () => {
    showToast('O ranking completo será ativado na fase de resultados.', 'error');
  });
}

function setupNavigation() {
  $$('[data-view]').forEach((element) => {
    element.addEventListener('click', () => {
      const view = element.dataset.view;

      if (['dashboard-funcionario', 'dashboard-empresa', 'ranking'].includes(view) && !appState.perfil) {
        showToast('Faça login para acessar essa área.', 'error');
        showView('login');
        return;
      }

      if (view === 'dashboard-funcionario') preencherDashboardFuncionario();
      if (view === 'dashboard-empresa') preencherDashboardEmpresa();

      showView(view);
    });
  });

  $('#logo-btn')?.addEventListener('click', () => {
    if (appState.perfil) irParaDashboardCorreto();
    else showView('home');
  });
}

function setupForms() {
  $('#form-login')?.addEventListener('submit', handleLogin);
  $('#form-cadastro-empresa')?.addEventListener('submit', handleCadastroEmpresa);
  $('#form-cadastro-funcionario')?.addEventListener('submit', handleCadastroFuncionario);
  $('#btn-logout')?.addEventListener('click', handleLogout);
}

function setupAuthListener() {
  const supabaseClient = getSupabaseClient();
  if (!supabaseClient) return;

  supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
      appState.user = null;
      appState.perfil = null;
      appState.empresa = null;
      atualizarNav();
      return;
    }

    // Não use await direto dentro do onAuthStateChange.
    // Em alguns navegadores/versões do supabase-js isso pode travar signInWithPassword,
    // deixando o botão preso em "Entrando...".
    if (session?.user && !appState.user) {
      setTimeout(async () => {
        try {
          appState.user = session.user;
          appState.perfil = await carregarPerfil(session.user.id);
          appState.empresa = await carregarEmpresa(appState.perfil?.empresa_id);
          atualizarNav();
        } catch (error) {
          console.error('Erro no listener de autenticação:', error);
        }
      }, 0);
    }
  });
}

async function init() {
  setupNavigation();
  setupForms();
  bloquearRecursosNaoImplementados();
  await inicializarSupabase();
  setupAuthListener();
  await carregarSessaoAtual();
}

document.addEventListener('DOMContentLoaded', init);
