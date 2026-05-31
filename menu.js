// Ajustes do menu principal unificado.

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
  montarMenuPrincipalEmColunas();
  document.querySelectorAll('[data-view="menu-principal"]').forEach((button) => {
    button.addEventListener('click', preencherMenuPrincipal);
  });
});
