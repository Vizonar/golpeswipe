// Guia "Como funciona" para apresentação e uso do GolpeSwipe.

function abrirComoFunciona() {
  const modal = document.querySelector('#como-funciona-modal');
  if (modal) modal.classList.add('active');
}

function fecharComoFunciona() {
  const modal = document.querySelector('#como-funciona-modal');
  if (modal) modal.classList.remove('active');
}

function criarComoFuncionaModal() {
  if (document.querySelector('#como-funciona-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'como-funciona-modal';
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-card help-modal" role="dialog" aria-modal="true" aria-labelledby="como-funciona-titulo">
      <div class="modal-head">
        <div>
          <p class="eyebrow">Guia rápido</p>
          <h2 id="como-funciona-titulo">Como funciona o GolpeSwipe</h2>
        </div>
        <button class="btn btn-ghost" id="btn-fechar-como-funciona" type="button">Fechar</button>
      </div>

      <div class="help-grid">
        <article class="help-step">
          <span>1</span>
          <h3>Cadastro da empresa</h3>
          <p>A empresa cria uma conta administrativa e define um código. Esse código é usado pelos funcionários no cadastro.</p>
        </article>
        <article class="help-step">
          <span>2</span>
          <h3>Cadastro do funcionário</h3>
          <p>O funcionário informa nome, e-mail, senha e código da empresa. Assim, seus resultados ficam vinculados ao painel correto.</p>
        </article>
        <article class="help-step">
          <span>3</span>
          <h3>Treino rápido</h3>
          <p>O usuário responde 20 cenários aleatórios. Cada resposta gera feedback imediato, explicando sinais de golpe ou atitude segura.</p>
        </article>
        <article class="help-step">
          <span>4</span>
          <h3>Teste de Maestria</h3>
          <p>O funcionário responde 100 questões. O resultado final é salvo no ranking da empresa para comparação de desempenho.</p>
        </article>
        <article class="help-step">
          <span>5</span>
          <h3>Ranking</h3>
          <p>A classificação usa o melhor Teste de Maestria de cada funcionário, ordenando por percentual, acertos e data de finalização.</p>
        </article>
        <article class="help-step">
          <span>6</span>
          <h3>Painel da empresa</h3>
          <p>O administrador acompanha funcionários, treinos, testes, histórico, filtros e exportação CSV dos resultados.</p>
        </article>
      </div>

      <div class="help-note">
        <strong>Ideia central:</strong> transformar a conscientização sobre golpes digitais em uma experiência interativa, rápida e mensurável para pequenas empresas.
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  document.querySelector('#btn-fechar-como-funciona')?.addEventListener('click', fecharComoFunciona);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) fecharComoFunciona();
  });
}

function inserirBotaoComoFunciona() {
  const menuGrid = document.querySelector('#view-menu-principal .menu-grid');
  if (!menuGrid || document.querySelector('#btn-como-funciona-card')) return;

  const card = document.createElement('article');
  card.className = 'action-card help-card';
  card.innerHTML = `
    <span class="badge">Guia</span>
    <h3>Como funciona</h3>
    <p>Entenda o fluxo do projeto: empresa, funcionário, treino, maestria, ranking e painel administrativo.</p>
    <button id="btn-como-funciona-card" class="btn btn-ghost full" type="button">Abrir guia</button>
  `;
  menuGrid.appendChild(card);
  document.querySelector('#btn-como-funciona-card')?.addEventListener('click', abrirComoFunciona);
}

document.addEventListener('DOMContentLoaded', () => {
  criarComoFuncionaModal();
  inserirBotaoComoFunciona();
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') fecharComoFunciona();
  });
});
