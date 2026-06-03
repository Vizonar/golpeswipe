// Relatórios finais da empresa: geral e individual por funcionário.

function formatarPercentual(valor) {
  const numero = Number(valor || 0);
  return `${Math.round(numero)}%`;
}

function ehTesteCompleto(item) {
  return item?.tipo === 'Teste de Maestria' || item?.tipo === 'Teste Completo';
}

function tipoResultadoFormatado(tipo) {
  return tipo === 'Teste de Maestria' ? 'Teste Completo' : tipo;
}

function obterResultadosDoFuncionario(email) {
  return resultadosEmpresaCache.filter((item) => item.email === email);
}

function calcularMedia(lista) {
  return lista.length
    ? lista.reduce((sum, item) => sum + Number(item.percentual || 0), 0) / lista.length
    : 0;
}

function calcularResumoFuncionario(funcionario) {
  const resultados = obterResultadosDoFuncionario(funcionario.email);
  const treinos = resultados.filter((item) => item.tipo === 'Treino');
  const testes = resultados.filter(ehTesteCompleto);
  const melhorTeste = testes.length
    ? Math.max(...testes.map((item) => Number(item.percentual || 0)))
    : 0;
  const mediaTreino = calcularMedia(treinos);
  const mediaTeste = calcularMedia(testes);
  const mediaGeral = calcularMedia(resultados);
  const ultimoResultado = resultados[0];

  return {
    funcionario,
    resultados,
    treinos,
    testes,
    maestrias: testes,
    melhorTeste,
    melhorMaestria: melhorTeste,
    mediaTreino,
    mediaTeste,
    mediaGeral,
    ultimoResultado,
  };
}

function calcularResumoGeralEmpresa() {
  const funcionarios = funcionariosEmpresaCache.map(calcularResumoFuncionario);
  const funcionariosComResultados = funcionarios.filter((item) => item.resultados.length > 0);
  const testes = resultadosEmpresaCache.filter(ehTesteCompleto);
  const treinos = resultadosEmpresaCache.filter((item) => item.tipo === 'Treino');
  const mediaTreinos = calcularMedia(treinos);
  const mediaTeste = calcularMedia(testes);
  const mediaEmpresa = calcularMedia(resultadosEmpresaCache);
  const melhorFuncionario = funcionarios.length
    ? [...funcionarios].sort((a, b) => b.melhorTeste - a.melhorTeste || b.mediaTeste - a.mediaTeste || b.mediaTreino - a.mediaTreino)[0]
    : null;
  const funcionariosSemTeste = funcionarios.filter((item) => item.testes.length === 0);
  const funcionariosSemTreino = funcionarios.filter((item) => item.treinos.length === 0);
  const funcionariosBaixoTeste = funcionarios.filter((item) => item.testes.length > 0 && item.melhorTeste < 70);
  const funcionariosAtencaoTeste = funcionarios.filter((item) => item.testes.length > 0 && item.melhorTeste >= 70 && item.melhorTeste < 85);
  const funcionariosExcelentes = funcionarios.filter((item) => item.testes.length > 0 && item.melhorTeste >= 95);
  const todosAcima95 = funcionarios.length > 0 && funcionarios.every((item) => item.testes.length > 0 && item.melhorTeste >= 95);
  const quedaTesteAposTreino = funcionarios.filter((item) => item.treinos.length > 0 && item.testes.length > 0 && item.mediaTreino - item.mediaTeste >= 15);

  return {
    funcionarios,
    funcionariosComResultados,
    testes,
    maestrias: testes,
    treinos,
    mediaEmpresa,
    mediaTreinos,
    mediaTeste,
    mediaMaestria: mediaTeste,
    melhorFuncionario,
    funcionariosSemTeste,
    funcionariosSemTreino,
    funcionariosBaixoTeste,
    funcionariosAtencaoTeste,
    funcionariosExcelentes,
    todosAcima95,
    quedaTesteAposTreino,
  };
}

function nivelRelatorio(percentual) {
  const valor = Number(percentual || 0);
  if (valor >= 95) return 'Excelência comprovada';
  if (valor >= 85) return 'Excelente domínio';
  if (valor >= 70) return 'Bom conhecimento';
  if (valor >= 50) return 'Atenção necessária';
  return 'Precisa de reforço';
}

function gerarTabelaResultadosRelatorio(resultados) {
  if (!resultados.length) {
    return '<p class="empty-state">Nenhum resultado registrado para este funcionário.</p>';
  }

  return `
    <div class="table-wrap">
      <table class="ranking-table">
        <thead>
          <tr><th>Tipo</th><th>Acertos</th><th>Percentual</th><th>Nível</th><th>Data</th></tr>
        </thead>
        <tbody>
          ${resultados.map((item) => `
            <tr>
              <td>${tipoResultadoFormatado(item.tipo)}</td>
              <td>${item.acertos}/${item.total_perguntas}</td>
              <td>${formatarPercentual(item.percentual)}</td>
              <td>${item.nivel_resultado || nivelRelatorio(item.percentual)}</td>
              <td>${item.finalizado_em ? new Date(item.finalizado_em).toLocaleString('pt-BR') : '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function abrirModalRelatorio(titulo, conteudo) {
  let modal = document.querySelector('#relatorio-final-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'relatorio-final-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-card report-modal" role="dialog" aria-modal="true">
        <div class="modal-head no-print">
          <div>
            <p class="eyebrow">Relatório final</p>
            <h2 id="relatorio-final-titulo"></h2>
          </div>
          <div class="report-actions">
            <button id="btn-imprimir-relatorio" class="btn btn-primary" type="button">Imprimir / salvar PDF</button>
            <button id="btn-fechar-relatorio" class="btn btn-ghost" type="button">Fechar</button>
          </div>
        </div>
        <div id="relatorio-final-conteudo"></div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('#btn-fechar-relatorio')?.addEventListener('click', fecharModalRelatorio);
    modal.querySelector('#btn-imprimir-relatorio')?.addEventListener('click', () => window.print());
    modal.addEventListener('click', (event) => {
      if (event.target === modal) fecharModalRelatorio();
    });
  }

  modal.querySelector('#relatorio-final-titulo').textContent = titulo;
  modal.querySelector('#relatorio-final-conteudo').innerHTML = conteudo;
  modal.classList.add('active');
}

function fecharModalRelatorio() {
  document.querySelector('#relatorio-final-modal')?.classList.remove('active');
}

function nomes(lista) {
  return lista.map((item) => item.funcionario?.nome || item.nome).filter(Boolean).join(', ') || 'Nenhum';
}

function gerarAnaliseFocosEmpresa(resumo) {
  if (resumo.todosAcima95) {
    return `
      <div class="info-box">
        <h3>Congratulações à equipe</h3>
        <p>Todos os funcionários cadastrados realizaram o Teste Completo e alcançaram pontuação igual ou superior a 95%. Esse resultado indica alto nível de atenção aos sinais de golpe, boa assimilação dos cenários simulados e uma cultura preventiva bem consolidada.</p>
        <p>Recomenda-se manter ciclos periódicos de atualização, adicionando novas questões da empresa para simular golpes recentes e situações específicas do cotidiano interno.</p>
      </div>
    `;
  }

  const pontos = [];

  if (resumo.funcionariosSemTeste.length) {
    pontos.push(`<li><strong>Aplicação do Teste Completo:</strong> ${resumo.funcionariosSemTeste.length} funcionário(s) ainda não realizou(aram) o Teste Completo. A empresa deve priorizar a conclusão da avaliação para obter uma visão real do nível da equipe.</li>`);
  }

  if (resumo.funcionariosSemTreino.length) {
    pontos.push(`<li><strong>Engajamento em treinamento:</strong> ${resumo.funcionariosSemTreino.length} funcionário(s) ainda não realizou(aram) treinos. Antes de novas avaliações, é recomendado incentivar a prática para reforçar o aprendizado.</li>`);
  }

  if (resumo.funcionariosBaixoTeste.length) {
    pontos.push(`<li><strong>Reforço urgente:</strong> ${nomes(resumo.funcionariosBaixoTeste)} apresentou(aram) resultado abaixo de 70% no Teste Completo. Esse grupo deve revisar os feedbacks, repetir treinos e receber orientação sobre sinais de urgência, links suspeitos, Pix indevido e confirmação por canais oficiais.</li>`);
  }

  if (resumo.funcionariosAtencaoTeste.length) {
    pontos.push(`<li><strong>Aprimoramento direcionado:</strong> ${nomes(resumo.funcionariosAtencaoTeste)} ficou(aram) entre 70% e 84%. O desempenho é razoável, mas ainda há margem para reduzir erros em situações mais ambíguas.</li>`);
  }

  if (resumo.quedaTesteAposTreino.length) {
    pontos.push(`<li><strong>Diferença entre treino e avaliação:</strong> ${nomes(resumo.quedaTesteAposTreino)} teve(iveram) média de treino consideravelmente maior que o resultado do Teste Completo. Isso pode indicar que o feedback imediato ajuda no treino, mas o conhecimento ainda precisa ser fixado para decisões sem ajuda.</li>`);
  }

  if (resumo.mediaTeste < 70 && resumo.testes.length) {
    pontos.push('<li><strong>Risco coletivo:</strong> a média do Teste Completo ficou abaixo de 70%. A empresa deve reforçar campanhas internas, simulações de golpes e orientações práticas antes de uma nova rodada de avaliação.</li>');
  } else if (resumo.mediaTeste >= 85 && resumo.testes.length) {
    pontos.push('<li><strong>Bom nível geral:</strong> a média do Teste Completo está em faixa alta. O foco agora deve ser manutenção, atualização dos cenários e acompanhamento dos poucos pontos de erro restantes.</li>');
  }

  if (!pontos.length) {
    pontos.push('<li><strong>Acompanhamento contínuo:</strong> os dados ainda são limitados. Recomenda-se manter ciclos de treino e Teste Completo para gerar histórico suficiente e identificar padrões com mais segurança.</li>');
  }

  return `
    <ul>
      ${pontos.join('')}
    </ul>
  `;
}

function gerarRelatorioGeralEmpresa() {
  const resumo = calcularResumoGeralEmpresa();
  const empresa = appState?.empresa?.nome || 'Empresa';
  const dataGeracao = new Date().toLocaleString('pt-BR');

  const rankingTreinos = [...resumo.funcionarios]
    .sort((a, b) => b.mediaTreino - a.mediaTreino || b.treinos.length - a.treinos.length)
    .map((item, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${item.funcionario.nome}</td>
        <td>${item.funcionario.email}</td>
        <td>${item.treinos.length}</td>
        <td>${formatarPercentual(item.mediaTreino)}</td>
        <td>${item.treinos.length ? 'Participou dos treinos' : 'Sem treino registrado'}</td>
      </tr>
    `).join('');

  const rankingTestes = [...resumo.funcionarios]
    .sort((a, b) => b.melhorTeste - a.melhorTeste || b.mediaTeste - a.mediaTeste)
    .map((item, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${item.funcionario.nome}</td>
        <td>${item.funcionario.email}</td>
        <td>${item.testes.length}</td>
        <td>${formatarPercentual(item.melhorTeste)}</td>
        <td>${formatarPercentual(item.mediaTeste)}</td>
        <td>${nivelRelatorio(item.melhorTeste || item.mediaTeste)}</td>
      </tr>
    `).join('');

  const conteudo = `
    <section class="report-document">
      <h1>Relatório Geral de Desempenho</h1>
      <p><strong>Empresa:</strong> ${empresa}</p>
      <p><strong>Gerado em:</strong> ${dataGeracao}</p>

      <div class="report-summary-grid">
        <div><strong>${funcionariosEmpresaCache.length}</strong><span>Funcionários cadastrados</span></div>
        <div><strong>${resumo.funcionariosComResultados.length}</strong><span>Funcionários com resultados</span></div>
        <div><strong>${resumo.treinos.length}</strong><span>Treinos finalizados</span></div>
        <div><strong>${resumo.testes.length}</strong><span>Testes Completos finalizados</span></div>
        <div><strong>${formatarPercentual(resumo.mediaTreinos)}</strong><span>Média dos treinos</span></div>
        <div><strong>${formatarPercentual(resumo.mediaTeste)}</strong><span>Média do Teste Completo</span></div>
      </div>

      <h2>Resumo executivo</h2>
      <p>A empresa possui <strong>${funcionariosEmpresaCache.length}</strong> funcionário(s) cadastrado(s). Desses, <strong>${resumo.funcionariosComResultados.length}</strong> apresentam ao menos um resultado registrado na plataforma.</p>
      <p>Foram finalizados <strong>${resumo.treinos.length}</strong> treino(s) e <strong>${resumo.testes.length}</strong> Teste(s) Completo(s). Os treinos indicam o nível de prática e evolução durante o aprendizado, enquanto o Teste Completo representa a avaliação final sem feedback imediato.</p>
      <p><strong>Melhor desempenho no Teste Completo:</strong> ${resumo.melhorFuncionario?.funcionario?.nome || 'Ainda não disponível'} ${resumo.melhorFuncionario ? `com melhor pontuação de ${formatarPercentual(resumo.melhorFuncionario.melhorTeste)}.` : ''}</p>

      <h2>1. Desempenho nos treinos</h2>
      <p>Esta seção mostra o empenho dos funcionários durante a etapa de aprendizagem. A média dos treinos foi de <strong>${formatarPercentual(resumo.mediaTreinos)}</strong>. Esse dado deve ser analisado separadamente do teste final, pois o treino possui feedback imediato e tem foco educativo.</p>
      <div class="table-wrap">
        <table class="ranking-table">
          <thead><tr><th>#</th><th>Funcionário</th><th>E-mail</th><th>Treinos</th><th>Média nos treinos</th><th>Observação</th></tr></thead>
          <tbody>${rankingTreinos || '<tr><td colspan="6">Nenhum treino registrado.</td></tr>'}</tbody>
        </table>
      </div>

      <h2>2. Resultado do Teste Completo</h2>
      <p>Esta seção representa o resultado avaliativo principal. Diferentemente do treino, o Teste Completo não apresenta feedback imediato a cada questão, permitindo verificar se o funcionário consegue identificar golpes e situações seguras de forma independente.</p>
      <div class="table-wrap">
        <table class="ranking-table">
          <thead><tr><th>#</th><th>Funcionário</th><th>E-mail</th><th>Testes</th><th>Melhor resultado</th><th>Média no teste</th><th>Situação</th></tr></thead>
          <tbody>${rankingTestes || '<tr><td colspan="7">Nenhum Teste Completo registrado.</td></tr>'}</tbody>
        </table>
      </div>

      <h2>3. Pontos de atenção para a empresa</h2>
      ${gerarAnaliseFocosEmpresa(resumo)}

      <h2>4. Recomendações práticas</h2>
      <p>Recomenda-se que a empresa utilize os resultados para organizar ações simples e periódicas de prevenção. Funcionários sem treino devem iniciar pelo modo Treino Rápido. Funcionários sem Teste Completo devem realizar a avaliação para que a gestão tenha uma medida comparável de desempenho.</p>
      <p>Para funcionários abaixo de 70%, o foco deve ser reforçar sinais clássicos de engenharia social: urgência exagerada, pedidos de Pix, links enviados por canais externos, compartilhamento de códigos, anexos suspeitos e confirmação de identidade por outro canal.</p>
      <p>Para funcionários entre 70% e 84%, recomenda-se trabalhar cenários mais ambíguos, pois esse grupo já demonstra conhecimento básico, mas ainda pode errar situações que parecem legítimas. Para pontuações acima de 85%, a recomendação é manter reciclagens periódicas e adicionar questões personalizadas com exemplos reais do cotidiano da empresa.</p>
    </section>
  `;

  abrirModalRelatorio('Relatório geral da empresa', conteudo);
}

function gerarRelatorioFuncionario(email) {
  const funcionario = funcionariosEmpresaCache.find((item) => item.email === email);
  if (!funcionario) {
    showToast('Funcionário não encontrado para gerar relatório.', 'error');
    return;
  }

  const resumo = calcularResumoFuncionario(funcionario);
  const empresa = appState?.empresa?.nome || 'Empresa';
  const dataGeracao = new Date().toLocaleString('pt-BR');
  const percentualBase = resumo.melhorTeste || resumo.mediaTeste || resumo.mediaTreino;

  const conteudo = `
    <section class="report-document">
      <h1>Relatório Individual de Funcionário</h1>
      <p><strong>Empresa:</strong> ${empresa}</p>
      <p><strong>Funcionário:</strong> ${funcionario.nome}</p>
      <p><strong>E-mail:</strong> ${funcionario.email}</p>
      <p><strong>Gerado em:</strong> ${dataGeracao}</p>

      <div class="report-summary-grid">
        <div><strong>${resumo.treinos.length}</strong><span>Treinos finalizados</span></div>
        <div><strong>${resumo.testes.length}</strong><span>Testes Completos</span></div>
        <div><strong>${formatarPercentual(resumo.mediaTreino)}</strong><span>Média nos treinos</span></div>
        <div><strong>${formatarPercentual(resumo.melhorTeste)}</strong><span>Melhor Teste Completo</span></div>
      </div>

      <h2>Análise do desempenho</h2>
      <p>O funcionário possui ${resumo.resultados.length} resultado(s) registrado(s), sendo ${resumo.treinos.length} treino(s) e ${resumo.testes.length} Teste(s) Completo(s).</p>
      <p>A média nos treinos é de <strong>${formatarPercentual(resumo.mediaTreino)}</strong>. A melhor pontuação no Teste Completo foi de <strong>${formatarPercentual(resumo.melhorTeste)}</strong>.</p>
      <p><strong>Situação atual:</strong> ${nivelRelatorio(percentualBase)}.</p>

      <h2>Histórico de resultados</h2>
      ${gerarTabelaResultadosRelatorio(resumo.resultados)}

      <h2>Recomendação individual</h2>
      <p>${percentualBase >= 95
        ? 'Desempenho excelente. Recomenda-se manter reciclagens periódicas e usar o funcionário como referência positiva em campanhas internas.'
        : percentualBase >= 70
          ? 'O funcionário apresenta desempenho satisfatório. Recomenda-se manter a prática periódica e revisar os cenários em que ainda houve erro.'
          : 'O funcionário deve realizar novos treinos e revisar os feedbacks dos cenários antes de repetir o Teste Completo.'}</p>
    </section>
  `;

  abrirModalRelatorio(`Relatório de ${funcionario.nome}`, conteudo);
}

function baixarRelatorioGeralCsv() {
  if (typeof baixarCsv !== 'function') {
    showToast('Função de exportação CSV não encontrada.', 'error');
    return;
  }

  const cabecalho = ['Funcionário', 'E-mail', 'Treinos finalizados', 'Média nos treinos', 'Testes Completos', 'Melhor teste completo', 'Média no teste', 'Situação'];
  const linhas = funcionariosEmpresaCache.map((funcionario) => {
    const resumo = calcularResumoFuncionario(funcionario);
    const percentualBase = resumo.melhorTeste || resumo.mediaTeste || resumo.mediaTreino;
    return [
      funcionario.nome,
      funcionario.email,
      resumo.treinos.length,
      formatarPercentual(resumo.mediaTreino),
      resumo.testes.length,
      formatarPercentual(resumo.melhorTeste),
      formatarPercentual(resumo.mediaTeste),
      nivelRelatorio(percentualBase),
    ];
  });

  const hoje = new Date().toISOString().slice(0, 10);
  baixarCsv(`golpeswipe-relatorio-geral-${hoje}.csv`, [cabecalho, ...linhas]);
}

function renderizarPainelRelatoriosFinais() {
  const dashboard = document.querySelector('#view-dashboard-empresa');
  if (!dashboard || document.querySelector('#relatorios-finais-card')) return;

  const panel = document.createElement('div');
  panel.id = 'relatorios-finais-card';
  panel.className = 'panel-card reports-panel';
  panel.innerHTML = `
    <div class="panel-head">
      <div>
        <h3>Relatórios finais</h3>
        <p class="muted">Gere relatórios para apresentação, acompanhamento interno ou envio à gestão.</p>
      </div>
      <div class="panel-actions">
        <button id="btn-relatorio-geral" class="btn btn-primary" type="button">Relatório geral</button>
        <button id="btn-relatorio-geral-csv" class="btn btn-secondary" type="button">CSV geral</button>
      </div>
    </div>
    <div class="table-wrap">
      <table class="ranking-table">
        <thead><tr><th>Funcionário</th><th>E-mail</th><th>Treinos</th><th>Testes</th><th>Melhor teste</th><th>Ação</th></tr></thead>
        <tbody id="relatorios-funcionarios-tbody"><tr><td colspan="6">Carregando relatórios...</td></tr></tbody>
      </table>
    </div>
  `;

  dashboard.appendChild(panel);
  panel.querySelector('#btn-relatorio-geral')?.addEventListener('click', gerarRelatorioGeralEmpresa);
  panel.querySelector('#btn-relatorio-geral-csv')?.addEventListener('click', baixarRelatorioGeralCsv);
}

function atualizarTabelaRelatoriosFinais() {
  renderizarPainelRelatoriosFinais();
  const tbody = document.querySelector('#relatorios-funcionarios-tbody');
  if (!tbody) return;

  if (!funcionariosEmpresaCache.length) {
    tbody.innerHTML = '<tr><td colspan="6">Nenhum funcionário cadastrado ainda.</td></tr>';
    return;
  }

  tbody.innerHTML = funcionariosEmpresaCache.map((funcionario) => {
    const resumo = calcularResumoFuncionario(funcionario);
    return `
      <tr>
        <td>${funcionario.nome}</td>
        <td>${funcionario.email}</td>
        <td>${resumo.treinos.length}</td>
        <td>${resumo.testes.length}</td>
        <td>${formatarPercentual(resumo.melhorTeste)}</td>
        <td><button class="btn btn-secondary btn-relatorio-individual" data-email="${funcionario.email}" type="button">Gerar relatório</button></td>
      </tr>
    `;
  }).join('');

  tbody.querySelectorAll('.btn-relatorio-individual').forEach((button) => {
    button.addEventListener('click', () => gerarRelatorioFuncionario(button.dataset.email));
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderizarPainelRelatoriosFinais();
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') fecharModalRelatorio();
  });
});
