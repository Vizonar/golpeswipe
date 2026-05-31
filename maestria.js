// Teste de Maestria - 100 perguntas, sem feedback imediato, salvando no ranking.

const maestriaState = {
  perguntas: [],
  indice: 0,
  acertos: 0,
  respostas: [],
  testeId: null,
  salvando: false,
};

function maestriaShuffle(lista) {
  return [...lista].sort(() => Math.random() - 0.5);
}

function maestriaNivel(percentual) {
  if (percentual >= 90) return 'Mestre em prevenção digital';
  if (percentual >= 80) return 'Avançado';
  if (percentual >= 70) return 'Intermediário';
  if (percentual >= 50) return 'Básico';
  return 'Necessita reforço';
}

function maestriaGetPergunta() {
  return maestriaState.perguntas[maestriaState.indice];
}

async function maestriaCriarTeste() {
  const client = getSupabaseClient();
  if (!client || !appState?.perfil?.id || !appState?.perfil?.empresa_id) return null;

  const { data, error } = await client
    .from('testes_maestria')
    .insert({
      usuario_id: appState.perfil.id,
      empresa_id: appState.perfil.empresa_id,
      total_perguntas: 100,
      acertos: 0,
      percentual: 0,
      nivel_resultado: 'Em andamento',
      finalizado: false,
    })
    .select()
    .single();

  if (error) {
    console.warn('Não foi possível criar Teste de Maestria:', error);
    return null;
  }

  return data?.id || null;
}

async function maestriaSalvarResposta(pergunta, respostaUsuario, acertou) {
  if (!maestriaState.testeId) return;
  const client = getSupabaseClient();
  if (!client || !appState?.perfil?.id) return;

  await client.from('respostas_maestria').insert({
    teste_id: maestriaState.testeId,
    usuario_id: appState.perfil.id,
    pergunta_codigo: pergunta.codigo,
    resposta_usuario: respostaUsuario,
    acertou,
  });
}

async function maestriaFinalizarTeste() {
  if (!maestriaState.testeId) return;
  const client = getSupabaseClient();
  if (!client) return;

  const total = maestriaState.perguntas.length || 100;
  const percentual = Number(((maestriaState.acertos / total) * 100).toFixed(2));
  const nivel = maestriaNivel(percentual);

  await client
    .from('testes_maestria')
    .update({
      acertos: maestriaState.acertos,
      percentual,
      nivel_resultado: nivel,
      finalizado: true,
      finalizado_em: new Date().toISOString(),
    })
    .eq('id', maestriaState.testeId);
}

function maestriaRenderizarPergunta() {
  const pergunta = maestriaGetPergunta();
  if (!pergunta) {
    maestriaMostrarResultado();
    return;
  }

  document.querySelector('#maestria-categoria').textContent = pergunta.categoria;
  document.querySelector('#maestria-titulo').textContent = pergunta.titulo;
  document.querySelector('#maestria-cenario').textContent = pergunta.cenario;
  document.querySelector('#maestria-contador').textContent = `Pergunta ${maestriaState.indice + 1} de ${maestriaState.perguntas.length}`;
  document.querySelector('#maestria-acertos').textContent = maestriaState.acertos;
  document.querySelector('#maestria-progresso').style.width = `${(maestriaState.indice / maestriaState.perguntas.length) * 100}%`;

  showView('maestria');
}

async function iniciarMaestria() {
  if (!appState?.perfil) {
    showToast('Faça login para iniciar o Teste de Maestria.', 'error');
    showView('login');
    return;
  }

  if (!window.GOLPESWIPE_PERGUNTAS || window.GOLPESWIPE_PERGUNTAS.length < 100) {
    showToast('Repertório de 100 perguntas não carregado.', 'error');
    return;
  }

  maestriaState.perguntas = maestriaShuffle(window.GOLPESWIPE_PERGUNTAS).slice(0, 100);
  maestriaState.indice = 0;
  maestriaState.acertos = 0;
  maestriaState.respostas = [];
  maestriaState.testeId = await maestriaCriarTeste();

  maestriaRenderizarPergunta();
}

async function responderMaestria(respostaUsuario) {
  const pergunta = maestriaGetPergunta();
  if (!pergunta || maestriaState.salvando) return;

  maestriaState.salvando = true;
  const acertou = respostaUsuario === pergunta.respostaCorreta;
  if (acertou) maestriaState.acertos++;

  maestriaState.respostas.push({ pergunta, respostaUsuario, acertou });
  await maestriaSalvarResposta(pergunta, respostaUsuario, acertou);

  maestriaState.indice++;
  maestriaState.salvando = false;

  if (maestriaState.indice >= maestriaState.perguntas.length) {
    await maestriaMostrarResultado();
    return;
  }

  maestriaRenderizarPergunta();
}

async function maestriaMostrarResultado() {
  await maestriaFinalizarTeste();

  const total = maestriaState.perguntas.length;
  const percentual = total ? Math.round((maestriaState.acertos / total) * 100) : 0;
  const nivel = maestriaNivel(percentual);

  document.querySelector('#resultado-titulo').textContent = 'Teste de Maestria concluído!';
  document.querySelector('#resultado-acertos').textContent = maestriaState.acertos;
  document.querySelector('#resultado-total').textContent = total;
  document.querySelector('#resultado-percentual').textContent = `Você acertou ${percentual}% dos cenários.`;
  document.querySelector('#resultado-nivel').textContent = `${nivel}. Resultado salvo no ranking da empresa.`;

  const erros = maestriaState.respostas.filter((item) => !item.acertou).slice(0, 10);
  const detalhes = document.querySelector('#resultado-detalhes');
  detalhes.innerHTML = erros.length
    ? erros.map((item) => `
      <div class="review-item">
        <strong>${item.pergunta.titulo}</strong><br />
        Correto: ${item.pergunta.respostaCorreta === 'golpe' ? 'É golpe' : 'Não é golpe'}<br />
        ${item.pergunta.dica}
      </div>
    `).join('')
    : '<div class="review-item"><strong>Perfeito!</strong><br />Você acertou todos os cenários do Teste de Maestria.</div>';

  showView('resultado');
}

function setupMaestria() {
  document.querySelectorAll('[data-start="maestria"]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (typeof abrirExplicacaoModo === 'function') {
        abrirExplicacaoModo('maestria');
      } else {
        iniciarMaestria();
      }
    }, true);
  });

  document.querySelector('#maestria-btn-golpe')?.addEventListener('click', () => responderMaestria('golpe'));
  document.querySelector('#maestria-btn-seguro')?.addEventListener('click', () => responderMaestria('seguro'));

  document.addEventListener('keydown', (event) => {
    const ativo = document.querySelector('#view-maestria')?.classList.contains('active');
    if (!ativo) return;
    if (event.key === 'ArrowLeft') responderMaestria('golpe');
    if (event.key === 'ArrowRight') responderMaestria('seguro');
  });
}

document.addEventListener('DOMContentLoaded', setupMaestria);
