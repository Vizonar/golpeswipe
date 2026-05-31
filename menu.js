// Ajustes do menu principal unificado.

function preencherMenuPrincipal() {
  const nome = appState?.perfil?.nome || 'usuário';
  const empresa = appState?.empresa?.nome || 'empresa não identificada';
  const titulo = document.querySelector('#menu-boas-vindas');
  const subtitulo = document.querySelector('#menu-empresa');

  if (titulo) titulo.textContent = `Olá, ${nome}!`;
  if (subtitulo) subtitulo.textContent = `Empresa vinculada: ${empresa}`;

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
  document.querySelectorAll('[data-view="menu-principal"]').forEach((button) => {
    button.addEventListener('click', preencherMenuPrincipal);
  });
});
