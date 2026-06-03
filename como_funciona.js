// Guia "Como funciona" e melhorias finais de acabamento do GolpeSwipe.

function abrirComoFunciona() {
  criarComoFuncionaModal();
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
    <div class="modal-card help-modal help-modal-wide" role="dialog" aria-modal="true" aria-labelledby="como-funciona-titulo">
      <div class="modal-head">
        <div>
          <p class="eyebrow">Guia da plataforma</p>
          <h2 id="como-funciona-titulo">Como funciona o GolpeSwipe</h2>
          <p class="muted">Entenda o fluxo completo de cadastro, treinamento, avaliação e acompanhamento pela empresa.</p>
        </div>
        <button class="btn btn-ghost" id="btn-fechar-como-funciona" type="button">Fechar</button>
      </div>

      <div class="help-section-block">
        <h3>Fluxo principal</h3>
        <div class="help-grid help-grid-expanded">
          <article class="help-step">
            <span>1</span>
            <h3>Cadastro da empresa</h3>
            <p>O responsável cria uma conta administrativa, informa os dados da empresa e define um código de acesso para vincular os funcionários ao ambiente correto.</p>
          </article>
          <article class="help-step">
            <span>2</span>
            <h3>Cadastro do funcionário</h3>
            <p>O funcionário informa nome, e-mail, senha e código da empresa. A partir disso, seus treinos, testes e resultados ficam associados à organização.</p>
          </article>
          <article class="help-step">
            <span>3</span>
            <h3>Treino rápido</h3>
            <p>O usuário responde 20 cenários aleatórios. A cada resposta, recebe feedback imediato explicando sinais de golpe, condutas seguras e dicas preventivas.</p>
          </article>
          <article class="help-step">
            <span>4</span>
            <h3>Teste Completo</h3>
            <p>O funcionário responde 100 cenários aleatórios sem feedback imediato. O resultado final é salvo no ranking da empresa como avaliação principal.</p>
          </article>
          <article class="help-step">
            <span>5</span>
            <h3>Ranking da equipe</h3>
            <p>O ranking apresenta a classificação dos funcionários com base no Teste Completo, permitindo comparar acertos, percentual, nível e data da avaliação.</p>
          </article>
          <article class="help-step">
            <span>6</span>
            <h3>Painel da empresa</h3>
            <p>O administrador acompanha funcionários, histórico de resultados, média da empresa, filtros, exportação CSV, ranking e relatórios finais.</p>
          </article>
        </div>
      </div>

      <div class="help-section-block">
        <h3>Recursos para a empresa</h3>
        <div class="help-grid help-grid-expanded">
          <article class="help-step secondary-step">
            <span>7</span>
            <h3>Questões da empresa</h3>
            <p>A empresa pode cadastrar cenários próprios, baseados em situações reais do seu cotidiano, como mensagens de fornecedores, pedidos de Pix, e-mails internos e golpes recorrentes.</p>
          </article>
          <article class="help-step secondary-step">
            <span>8</span>
            <h3>Relatório geral</h3>
            <p>O relatório geral separa o desempenho nos treinos do resultado do Teste Completo, apontando engajamento, pontos de atenção e recomendações para a empresa.</p>
          </article>
          <article class="help-step secondary-step">
            <span>9</span>
            <h3>Relatório individual</h3>
            <p>Cada funcionário pode ter um relatório próprio com treinos realizados, Testes Completos, melhor desempenho, histórico e recomendação individual.</p>
          </article>
        </div>
      </div>

      <div class="help-note">
        <strong>Ideia central:</strong> transformar a conscientização sobre golpes digitais em uma experiência interativa, mensurável e útil para pequenas empresas, unindo simulação, gamificação, feedback educativo e acompanhamento gerencial.
      </div>

      <div class="help-note soft-note">
        <strong>Uso recomendado:</strong> primeiro os funcionários fazem treinos rápidos para aprender com feedback. Depois realizam o Teste Completo. A empresa analisa ranking e relatórios, identifica pontos fracos e cadastra novas questões para reforçar situações específicas.
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
    <p>Entenda o fluxo do projeto: empresa, funcionário, treino, Teste Completo, ranking, questões e relatórios.</p>
    <button id="btn-como-funciona-card" class="btn btn-ghost full" type="button">Abrir guia</button>
  `;
  menuGrid.appendChild(card);
  document.querySelector('#btn-como-funciona-card')?.addEventListener('click', abrirComoFunciona);
}

function injetarMelhoriasFinaisCss() {
  if (document.querySelector('#golpeswipe-final-polish-css')) return;

  const style = document.createElement('style');
  style.id = 'golpeswipe-final-polish-css';
  style.textContent = `
    .help-modal-wide { width: min(1120px, 100%); }
    .help-section-block { margin-top: 1.25rem; }
    .help-section-block > h3 { margin: 0 0 0.8rem; }
    .help-grid-expanded { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .secondary-step { border-color: rgba(56, 189, 248, 0.18) !important; background: rgba(56, 189, 248, 0.055) !important; }
    .soft-note { margin-top: 0.8rem; background: rgba(34, 197, 94, 0.08) !important; border-color: rgba(34, 197, 94, 0.22) !important; }
    .final-polish-actions { display: flex; gap: 0.8rem; flex-wrap: wrap; justify-content: center; margin-top: 1rem; }
    .final-mini-badge { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.35rem 0.65rem; border-radius: 999px; border: 1px solid rgba(56, 189, 248, 0.22); background: rgba(56, 189, 248, 0.08); font-size: 0.85rem; opacity: 0.9; }
    #btn-abrir-questoes-empresa { white-space: nowrap; }
    #view-dashboard-empresa .dashboard-head { flex-wrap: wrap; }
    .questoes-modal { width: min(980px, 100%); }
    .question-company-table { margin-top: 1rem; }
    @media (max-width: 980px) { .help-grid-expanded { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    @media (max-width: 680px) { .help-grid-expanded { grid-template-columns: 1fr; } .final-polish-actions .btn { width: 100%; } }
  `;

  document.head.appendChild(style);
}

function adicionarBotoesResultado() {
  const resultCard = document.querySelector('#view-resultado .result-card');
  if (!resultCard || document.querySelector('#final-polish-actions')) return;

  const actions = document.createElement('div');
  actions.id = 'final-polish-actions';
  actions.className = 'final-polish-actions';
  actions.innerHTML = `
    <button class="btn btn-secondary" type="button" id="btn-refazer-treino-final">Fazer novo treino</button>
    <button class="btn btn-ghost" type="button" id="btn-meu-desempenho-final">Meu desempenho</button>
  `;

  resultCard.appendChild(actions);

  document.querySelector('#btn-refazer-treino-final')?.addEventListener('click', () => {
    if (typeof abrirExplicacaoModo === 'function') abrirExplicacaoModo('treino');
    else if (typeof iniciarTreino === 'function') iniciarTreino();
  });

  document.querySelector('#btn-meu-desempenho-final')?.addEventListener('click', () => {
    if (typeof showView === 'function') showView('meu-desempenho');
    if (typeof carregarMeuDesempenho === 'function') carregarMeuDesempenho();
  });
}

function melhorarTelaResultadoPeriodicamente() {
  adicionarBotoesResultado();
  setTimeout(adicionarBotoesResultado, 500);
  setTimeout(adicionarBotoesResultado, 1500);
}

function garantirBotaoQuestoesEmpresa() {
  if (typeof criarBotaoQuestoesEmpresa === 'function') criarBotaoQuestoesEmpresa();
  setTimeout(() => {
    if (typeof criarBotaoQuestoesEmpresa === 'function') criarBotaoQuestoesEmpresa();
  }, 600);
}

function atualizarLabelsVisuaisFinais() {
  document.querySelectorAll('*').forEach((el) => {
    if (el.childNodes.length === 1 && el.childNodes[0].nodeType === Node.TEXT_NODE) {
      el.textContent = el.textContent
        .replace(/Teste de Maestria/g, 'Teste Completo')
        .replace(/Maestria/g, 'Teste Completo')
        .replace(/maestria/g, 'teste completo');
    }
  });
}

function instalarMelhoriasFinais() {
  criarComoFuncionaModal();
  inserirBotaoComoFunciona();
  injetarMelhoriasFinaisCss();
  melhorarTelaResultadoPeriodicamente();
  garantirBotaoQuestoesEmpresa();
  atualizarLabelsVisuaisFinais();

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (target?.matches?.('[data-view="dashboard-empresa"]')) {
      setTimeout(garantirBotaoQuestoesEmpresa, 250);
      setTimeout(atualizarLabelsVisuaisFinais, 300);
    }
    if (target?.matches?.('[data-view="menu-principal"]')) {
      setTimeout(() => {
        inserirBotaoComoFunciona();
        atualizarLabelsVisuaisFinais();
      }, 250);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') fecharComoFunciona();
  });

  setInterval(() => {
    garantirBotaoQuestoesEmpresa();
    adicionarBotoesResultado();
    atualizarLabelsVisuaisFinais();
  }, 2500);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', instalarMelhoriasFinais);
} else {
  instalarMelhoriasFinais();
}
