// Sprint 2 - Modo Treino funcional
// Usa as perguntas fixas e as questões personalizadas cadastradas pela empresa.

const treinoState = {
  perguntas: [],
  indice: 0,
  acertos: 0,
  respostas: [],
  sessaoId: null,
  salvando: false,
};

function criarModalExplicacaoModo() {
  if (document.querySelector('#modo-explicacao-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'modo-explicacao-modal';
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-card modo-explicacao-card" role="dialog" aria-modal="true" aria-labelledby="modo-explicacao-titulo">
      <div class="modal-head">
        <div>
          <p id="modo-explicacao-etiqueta" class="eyebrow">Modo</p>
          <h2 id="modo-explicacao-titulo">Antes de começar</h2>
          <p id="modo-explicacao-subtitulo" class="muted"></p>
        </div>
        <button id="btn-fechar-explicacao-modo" class="btn btn-ghost" type="button">Fechar</button>
      </div>
      <div id="modo-explicacao-conteudo" class="modo-explicacao-conteudo"></div>
      <div class="hero-actions center modo-explicacao-acoes">
        <button id="btn-cancelar-explicacao-modo" class="btn btn-ghost" type="button">Voltar</button>
        <button id="btn-iniciar-explicacao-modo" class="btn btn-primary" type="button">Começar</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  modal.querySelector('#btn-fechar-explicacao-modo')?.addEventListener('click', fecharExplicacaoModo);
  modal.querySelector('#btn-cancelar-explicacao-modo')?.addEventListener('click', fecharExplicacaoModo);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) fecharExplicacaoModo();
  });
}

function fecharExplicacaoModo() {
  document.querySelector('#modo-explicacao-modal')?.classList.remove('active');
}

function abrirExplicacaoModo(tipo) {
  criarModalExplicacaoModo();

  const config = tipo === 'maestria'
    ? {
        etiqueta: 'Teste Completo',
        titulo: 'Antes de iniciar o Teste Completo',
        subtitulo: 'Este é o modo avaliativo principal da plataforma.',
        botao: 'Iniciar Teste Completo',
        conteudo: `
          <div class="modo-info-grid">
            <article><strong>100 cenários</strong><span>Você responderá o repertório completo em ordem aleatória.</span></article>
            <article><strong>Sem feedback imediato</strong><span>As respostas são avaliadas no final para simular uma prova.</span></article>
            <article><strong>Ranking da empresa</strong><span>O resultado final entra no ranking dos funcionários.</span></article>
          </div>
          <p>Leia cada cenário com atenção e decida se a situação apresentada representa um golpe ou uma situação segura. Você pode responder pelos botões ou deslizando o card para os lados.</p>
        `,
        iniciar: iniciarMaestria,
      }
    : {
        etiqueta: 'Modo Treino',
        titulo: 'Antes de começar o Treino',
        subtitulo: 'Este modo serve para praticar e aprender com feedback imediato.',
        botao: 'Começar Treino',
        conteudo: `
          <div class="modo-info-grid">
            <article><strong>20 cenários</strong><span>As perguntas são escolhidas aleatoriamente a cada treino.</span></article>
            <article><strong>Feedback imediato</strong><span>Após cada resposta, o sistema explica por que você acertou ou errou.</span></article>
            <article><strong>Foco em aprendizado</strong><span>Use as dicas para melhorar antes do Teste Completo.</span></article>
          </div>
          <p>Você verá situações comuns envolvendo golpes digitais, mensagens suspeitas e cenários seguros. Responda se aquilo é golpe ou não é golpe.</p>
        `,
        iniciar: iniciarTreino,
      };

  document.querySelector('#modo-explicacao-etiqueta').textContent = config.etiqueta;
  document.querySelector('#modo-explicacao-titulo').textContent = config.titulo;
  document.querySelector('#modo-explicacao-subtitulo').textContent = config.subtitulo;
  document.querySelector('#modo-explicacao-conteudo').innerHTML = config.conteudo;

  const botao = document.querySelector('#btn-iniciar-explicacao-modo');
  botao.textContent = config.botao;
  botao.onclick = async () => {
    fecharExplicacaoModo();
    await config.iniciar();
  };

  document.querySelector('#modo-explicacao-modal')?.classList.add('active');
}

function treinoShuffle(lista) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function treinoNivel(acertos, total) {
  const percentual = total ? Math.round((acertos / total) * 100) : 0;
  if (percentual >= 85) return 'Excelente atenção aos sinais de golpe.';
  if (percentual >= 70) return 'Bom conhecimento, mas ainda há pontos para revisar.';
  if (percentual >= 50) return 'Atenção necessária: revise os sinais de alerta.';
  return 'Iniciante: vale reforçar os cuidados básicos de segurança digital.';
}

function treinoPerguntaAtual() {
  return treinoState.perguntas[treinoState.indice];
}

function treinoGetSupabase() {
  return window.supabase?.createClient && window.GOLPESWIPE_CONFIG
    ? window.supabase.createClient(window.GOLPESWIPE_CONFIG.SUPABASE_URL, window.GOLPESWIPE_CONFIG.SUPABASE_ANON_KEY)
    : null;
}

async function treinoGetPerfil() {
  const client = treinoGetSupabase();
  if (!client) return null;
  const { data: sessionData } = await client.auth.getSession();
  const user = sessionData?.session?.user;
  if (!user) return null;
  const { data: perfil } = await client.from('perfis').select('*').eq('id', user.id).single();
  return perfil || null;
}

async function treinoCriarSessao() {
  const client = treinoGetSupabase();
  const perfil = await treinoGetPerfil();
  if (!client || !perfil?.id || !perfil?.empresa_id) return null;

  const { data, error } = await client
    .from('sessoes_treino')
    .insert({
      usuario_id: perfil.id,
      empresa_id: perfil.empresa_id,
      total_perguntas: 20,
      acertos: 0,
      finalizada: false,
    })
    .select()
    .single();

  if (error) {
    console.warn('Não foi possível criar sessão de treino:', error);
    return null;
  }
  return data?.id || null;
}

async function treinoSalvarResposta(pergunta, respostaUsuario, acertou) {
  if (!treinoState.sessaoId) return;
  const client = treinoGetSupabase();
  const perfil = await treinoGetPerfil();
  if (!client || !perfil?.id) return;

  await client.from('respostas_treino').insert({
    sessao_id: treinoState.sessaoId,
    usuario_id: perfil.id,
    pergunta_codigo: String(pergunta.codigo),
    resposta_usuario: respostaUsuario,
    acertou,
  });
}

async function treinoFinalizarSessao() {
  if (!treinoState.sessaoId) return;
  const client = treinoGetSupabase();
  if (!client) return;

  await client
    .from('sessoes_treino')
    .update({
      acertos: treinoState.acertos,
      finalizada: true,
      finalizada_em: new Date().toISOString(),
    })
    .eq('id', treinoState.sessaoId);
}

function treinoRenderizarPergunta() {
  const pergunta = treinoPerguntaAtual();
  if (!pergunta) return treinoMostrarResultado();

  document.querySelector('#treino-categoria').textContent = pergunta.categoria;
  document.querySelector('#treino-titulo').textContent = pergunta.titulo;
  document.querySelector('#treino-cenario').textContent = pergunta.cenario;
  document.querySelector('#treino-contador').textContent = `Pergunta ${treinoState.indice + 1} de ${treinoState.perguntas.length}`;
  document.querySelector('#treino-acertos').textContent = treinoState.acertos;
  document.querySelector('#treino-progresso').style.width = `${(treinoState.indice / treinoState.perguntas.length) * 100}%`;

  showView('treino');
}

async function iniciarTreino() {
  if (typeof carregarQuestoesEmpresa === 'function') await carregarQuestoesEmpresa();
  const repertorio = typeof obterRepertorioGolpeSwipe === 'function'
    ? obterRepertorioGolpeSwipe()
    : window.GOLPESWIPE_PERGUNTAS;

  if (!repertorio || repertorio.length < 20) {
    showToast('Repertório de perguntas não carregado.', 'error');
    return;
  }

  treinoState.perguntas = treinoShuffle(repertorio).slice(0, 20);
  treinoState.indice = 0;
  treinoState.acertos = 0;
  treinoState.respostas = [];
  treinoState.sessaoId = await treinoCriarSessao();
  treinoRenderizarPergunta();
}

async function responderTreino(respostaUsuario) {
  const pergunta = treinoPerguntaAtual();
  if (!pergunta || treinoState.salvando) return;

  treinoState.salvando = true;
  const acertou = respostaUsuario === pergunta.respostaCorreta;
  if (acertou) treinoState.acertos++;

  treinoState.respostas.push({ pergunta, respostaUsuario, acertou });
  await treinoSalvarResposta(pergunta, respostaUsuario, acertou);

  const status = document.querySelector('#feedback-status');
  status.textContent = acertou ? 'Resposta correta' : 'Resposta incorreta';
  status.className = `status-pill ${acertou ? 'success' : 'danger'}`;

  document.querySelector('#feedback-titulo').textContent = acertou
    ? 'Você acertou!'
    : `Você errou: essa situação ${pergunta.respostaCorreta === 'golpe' ? 'era golpe' : 'não era golpe'}.`;

  document.querySelector('#feedback-texto').textContent = acertou ? pergunta.feedbackAcerto : pergunta.feedbackErro;
  document.querySelector('#feedback-dica').textContent = pergunta.dica;

  const lista = document.querySelector('#feedback-sinais');
  lista.innerHTML = '';
  pergunta.sinais.forEach((sinal) => {
    const li = document.createElement('li');
    li.textContent = sinal;
    lista.appendChild(li);
  });

  document.querySelector('#treino-acertos').textContent = treinoState.acertos;
  document.querySelector('#treino-progresso').style.width = `${((treinoState.indice + 1) / treinoState.perguntas.length) * 100}%`;
  treinoState.salvando = false;
  showView('feedback-treino');
}

function proximaPerguntaTreino() {
  treinoState.indice++;
  if (treinoState.indice >= treinoState.perguntas.length) {
    treinoMostrarResultado();
    return;
  }
  treinoRenderizarPergunta();
}

async function treinoMostrarResultado() {
  await treinoFinalizarSessao();

  const total = treinoState.perguntas.length;
  const percentual = total ? Math.round((treinoState.acertos / total) * 100) : 0;

  document.querySelector('#resultado-titulo').textContent = 'Treino concluído!';
  document.querySelector('#resultado-acertos').textContent = treinoState.acertos;
  document.querySelector('#resultado-total').textContent = total;
  document.querySelector('#resultado-percentual').textContent = `Você acertou ${percentual}% dos cenários do treino.`;
  document.querySelector('#resultado-nivel').textContent = treinoNivel(treinoState.acertos, total);

  const detalhes = document.querySelector('#resultado-detalhes');
  detalhes.innerHTML = treinoState.respostas
    .filter((item) => !item.acertou)
    .slice(0, 6)
    .map((item) => `
      <div class="review-item">
        <strong>${item.pergunta.titulo}</strong><br />
        Resposta correta: ${item.pergunta.respostaCorreta === 'golpe' ? 'É golpe' : 'Não é golpe'}<br />
        ${item.pergunta.dica}
      </div>
    `)
    .join('') || '<div class="review-item"><strong>Excelente!</strong><br />Você não errou nenhum cenário neste treino.</div>';

  showView('resultado');
}

function setupTreinoSprint2() {
  criarModalExplicacaoModo();

  document.querySelectorAll('[data-start="treino"]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      abrirExplicacaoModo('treino');
    }, true);
  });

  document.querySelector('#treino-btn-golpe')?.addEventListener('click', () => responderTreino('golpe'));
  document.querySelector('#treino-btn-seguro')?.addEventListener('click', () => responderTreino('seguro'));
  document.querySelector('#feedback-proximo')?.addEventListener('click', proximaPerguntaTreino);

  document.addEventListener('keydown', (event) => {
    const treinoAtivo = document.querySelector('#view-treino')?.classList.contains('active');
    if (!treinoAtivo) return;
    if (event.key === 'ArrowLeft') responderTreino('golpe');
    if (event.key === 'ArrowRight') responderTreino('seguro');
  });
}

document.addEventListener('DOMContentLoaded', setupTreinoSprint2);
