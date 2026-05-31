// Ajustes do menu principal unificado.

function criarModalConfiguracoes() {
  if (document.querySelector('#configuracoes-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'configuracoes-modal';
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-card config-modal" role="dialog" aria-modal="true" aria-labelledby="configuracoes-titulo">
      <div class="modal-head">
        <div>
          <p class="eyebrow">Conta</p>
          <h2 id="configuracoes-titulo">Configurações</h2>
          <p class="muted">Altere seu e-mail ou senha quando necessário.</p>
        </div>
        <button class="btn btn-ghost" id="btn-fechar-configuracoes" type="button">Fechar</button>
      </div>

      <div class="config-grid">
        <form id="form-alterar-email" class="form config-box">
          <h3>Alterar e-mail</h3>
          <p class="muted small-note">Dependendo da configuração do Supabase, a troca pode exigir confirmação no novo e-mail.</p>
          <label>Novo e-mail
            <input id="config-novo-email" type="email" placeholder="novo@email.com" required />
          </label>
          <button class="btn btn-primary full" type="submit">Salvar novo e-mail</button>
        </form>

        <form id="form-alterar-senha" class="form config-box">
          <h3>Alterar senha</h3>
          <p class="muted small-note">Use uma senha com pelo menos 6 caracteres.</p>
          <label>Nova senha
            <input id="config-nova-senha" type="password" minlength="6" placeholder="Nova senha" required />
          </label>
          <label>Confirmar nova senha
            <input id="config-confirmar-senha" type="password" minlength="6" placeholder="Repita a nova senha" required />
          </label>
          <button class="btn btn-primary full" type="submit">Salvar nova senha</button>
        </form>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  document.querySelector('#btn-fechar-configuracoes')?.addEventListener('click', fecharConfiguracoes);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) fecharConfiguracoes();
  });

  document.querySelector('#form-alterar-email')?.addEventListener('submit', alterarEmailUsuario);
  document.querySelector('#form-alterar-senha')?.addEventListener('submit', alterarSenhaUsuario);
}

function abrirConfiguracoes() {
  criarModalConfiguracoes();
  const emailInput = document.querySelector('#config-novo-email');
  if (emailInput && appState?.perfil?.email) emailInput.value = appState.perfil.email;
  document.querySelector('#configuracoes-modal')?.classList.add('active');
}

function fecharConfiguracoes() {
  document.querySelector('#configuracoes-modal')?.classList.remove('active');
}

async function alterarEmailUsuario(event) {
  event.preventDefault();
  const client = getSupabaseClient();
  const novoEmail = document.querySelector('#config-novo-email')?.value.trim();

  if (!client || !novoEmail) {
    showToast('Não foi possível alterar o e-mail agora.', 'error');
    return;
  }

  const { error } = await client.auth.updateUser({ email: novoEmail });

  if (error) {
    console.error('Erro ao alterar e-mail:', error);
    showToast(error.message || 'Erro ao alterar e-mail.', 'error');
    return;
  }

  if (appState?.perfil?.id) {
    await client.from('perfis').update({ email: novoEmail }).eq('id', appState.perfil.id);
    appState.perfil.email = novoEmail;
  }

  showToast('Solicitação de alteração de e-mail enviada. Verifique sua caixa de entrada.');
  fecharConfiguracoes();
}

async function alterarSenhaUsuario(event) {
  event.preventDefault();
  const client = getSupabaseClient();
  const senha = document.querySelector('#config-nova-senha')?.value || '';
  const confirmar = document.querySelector('#config-confirmar-senha')?.value || '';

  if (!client) {
    showToast('Não foi possível alterar a senha agora.', 'error');
    return;
  }

  if (senha.length < 6) {
    showToast('A senha precisa ter pelo menos 6 caracteres.', 'error');
    return;
  }

  if (senha !== confirmar) {
    showToast('As senhas não conferem.', 'error');
    return;
  }

  const { error } = await client.auth.updateUser({ password: senha });

  if (error) {
    console.error('Erro ao alterar senha:', error);
    showToast(error.message || 'Erro ao alterar senha.', 'error');
    return;
  }

  document.querySelector('#config-nova-senha').value = '';
  document.querySelector('#config-confirmar-senha').value = '';
  showToast('Senha alterada com sucesso.');
  fecharConfiguracoes();
}

function inserirEngrenagemConfiguracoes() {
  const head = document.querySelector('#view-menu-principal .dashboard-head');
  if (!head || document.querySelector('#btn-configuracoes')) return;

  const button = document.createElement('button');
  button.id = 'btn-configuracoes';
  button.className = 'settings-gear';
  button.type = 'button';
  button.title = 'Configurações';
  button.setAttribute('aria-label', 'Abrir configurações');
  button.innerHTML = '⚙';
  button.addEventListener('click', abrirConfiguracoes);
  head.appendChild(button);
}

function montarMenuPrincipalEmColunas() {
  const menuGrid = document.querySelector('#view-menu-principal .menu-grid');
  if (!menuGrid) return;

  menuGrid.className = 'menu-columns-layout';
  menuGrid.innerHTML = `
    <div class="menu-column">
      <article class="action-card menu-card-compact">
        <span class="badge">20 perguntas</span>
        <h3>Treino rápido</h3>
        <p>Pratique com cenários aleatórios e receba feedback imediato em cada resposta.</p>
        <button class="btn btn-secondary full" data-start="treino" type="button">Começar treino</button>
      </article>
      <article class="action-card highlight menu-card-compact">
        <span class="badge">100 perguntas</span>
        <h3>Teste de Maestria</h3>
        <p>Responda o repertório completo. O resultado é salvo no ranking da empresa.</p>
        <button class="btn btn-primary full" data-start="maestria" type="button">Iniciar maestria</button>
      </article>
    </div>

    <div class="menu-separator" aria-hidden="true"></div>

    <div class="menu-column">
      <article class="action-card nav-admin menu-card-compact">
        <span class="badge">Gestão</span>
        <h3>Painel da empresa</h3>
        <p>Acompanhe funcionários, histórico, filtros, média geral e exportação CSV.</p>
        <button class="btn btn-secondary full" data-view="dashboard-empresa" type="button">Abrir painel</button>
      </article>
      <article class="action-card help-card menu-card-compact">
        <span class="badge">Guia</span>
        <h3>Como funciona</h3>
        <p>Veja o fluxo do projeto: empresa, funcionário, treino, maestria e ranking.</p>
        <button id="btn-como-funciona-card" class="btn btn-ghost full" type="button">Abrir guia</button>
      </article>
    </div>

    <div class="menu-separator" aria-hidden="true"></div>

    <div class="menu-column">
      <article class="action-card menu-card-compact">
        <span class="badge">Ranking</span>
        <h3>Ranking da equipe</h3>
        <p>Veja a classificação por Teste de Maestria finalizado.</p>
        <button class="btn btn-ghost full" data-view="ranking" type="button">Ver ranking</button>
      </article>
      <article class="action-card nav-funcionario desempenho-menu-card menu-card-compact">
        <span class="badge">Individual</span>
        <h3>Meu desempenho</h3>
        <p>Veja seus treinos, testes, média, melhor pontuação e histórico individual.</p>
        <button id="btn-meu-desempenho-card" class="btn btn-secondary full" data-view="meu-desempenho" type="button">Ver desempenho</button>
      </article>
    </div>
  `;

  setupNavigation();

  menuGrid.querySelector('#btn-como-funciona-card')?.addEventListener('click', () => {
    if (typeof abrirComoFunciona === 'function') abrirComoFunciona();
  });

  menuGrid.querySelector('#btn-meu-desempenho-card')?.addEventListener('click', () => {
    showView('meu-desempenho');
    if (typeof carregarMeuDesempenho === 'function') carregarMeuDesempenho();
  });

  atualizarNav();
}

function preencherMenuPrincipal() {
  const nome = appState?.perfil?.nome || 'usuário';
  const empresa = appState?.empresa?.nome || 'empresa não identificada';
  const titulo = document.querySelector('#menu-boas-vindas');
  const subtitulo = document.querySelector('#menu-empresa');

  if (titulo) titulo.textContent = `Olá, ${nome}!`;
  if (subtitulo) subtitulo.textContent = `Empresa vinculada: ${empresa}`;

  montarMenuPrincipalEmColunas();
  inserirEngrenagemConfiguracoes();
  atualizarNav();
}

// Faz login/cadastro cair no menu principal, e não diretamente em painel separado.
const irParaDashboardCorretoOriginal = irParaDashboardCorreto;
irParaDashboardCorreto = function irParaMenuPrincipal() {
  atualizarNav();
  if (!appState.perfil) {
    showView('home');
    return;
  }
  preencherMenuPrincipal();
  showView('menu-principal');
};

const showViewOriginalMenu = showView;
showView = function showViewComMenu(viewName) {
  if (viewName === 'menu-principal') preencherMenuPrincipal();
  showViewOriginalMenu(viewName);
};

document.addEventListener('DOMContentLoaded', () => {
  criarModalConfiguracoes();
  montarMenuPrincipalEmColunas();
  inserirEngrenagemConfiguracoes();
  document.querySelectorAll('[data-view="menu-principal"]').forEach((button) => {
    button.addEventListener('click', preencherMenuPrincipal);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') fecharConfiguracoes();
  });
});
