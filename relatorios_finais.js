// Relatórios finais da empresa: geral e individual por funcionário.

function formatarPercentual(valor) {
  const numero = Number(valor || 0);
  return `${Math.round(numero)}%`;
}

function obterResultadosDoFuncionario(email) {
  return resultadosEmpresaCache.filter((item) => item.email === email);
}

function calcularResumoFuncionario(funcionario) {
  const resultados = obterResultadosDoFuncionario(funcionario.email);
  const treinos = resultados.filter((item) => item.tipo === 'Treino');
  const maestrias = resultados.filter((item) => item.tipo === 'Teste de Maestria');
  const melhorMaestria = maestrias.length
    ? Math.max(...maestrias.map((item) => Number(item.percentual || 0)))
    : 0;
  const mediaGeral = resultados.length
    ? resultados.reduce((sum, item) => sum + Number(item.percentual || 0), 0) / resultados.length
    : 0;
  const ultimoResultado = resultados[0];

  return {
    funcionario,
    resultados,
    treinos,
    maestrias,
    melhorMaestria,
    mediaGeral,
    ultimoResultado,
  };
}

function calcularResumoGeralEmpresa() {
  const funcionarios = funcionariosEmpresaCache.map(calcularResumoFuncionario);
  const funcionariosComResultados = funcionarios.filter((item) => item.resultados.length > 0);
  const maestrias = resultadosEmpresaCache.filter((item) => item.tipo === 'Teste de Maestria');
  const treinos = resultadosEmpresaCache.filter((item) => item.tipo === 'Treino');
  const mediaEmpresa = resultadosEmpresaCache.length
    ? resultadosEmpresaCache.reduce((sum, item) => sum + Number(item.percentual || 0), 0) / resultadosEmpresaCache.length
    : 0;
  const mediaMaestria = maestrias.length
    ? maestrias.reduce((sum, item) => sum + Number(item.percentual || 0), 0) / maestrias.length
    : 0;
  const melhorFuncionario = funcionarios.length
    ? [...funcionarios].sort((a, b) => b.melhorMaestria - a.melhorMaestria || b.mediaGeral - a.mediaGeral)[0]
    : null;
  const funcionariosSemTeste = funcionarios.filter((item) => item.maestrias.length === 0);

  return {
    funcionarios,
    funcionariosComResultados,
    maestrias,
    treinos,
    mediaEmpresa,
    mediaMaestria,
    melhorFuncionario,
    funcionariosSemTeste,
  };
}

function nivelRelatorio(percentual) {
  const valor = Number(percentual || 0);
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
              <td>${item.tipo}</td>
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

function gerarRelatorioGeralEmpresa() {
  const resumo = calcularResumoGeralEmpresa();
  const empresa = appState?.empresa?.nome || 'Empresa';
  const dataGeracao = new Date().toLocaleString('pt-BR');

  const rankingInterno = [...resumo.funcionarios]
    .sort((a, b) => b.melhorMaestria - a.melhorMaestria || b.mediaGeral - a.mediaGeral)
    .map((item, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${item.funcionario.nome}</td>
        <td>${item.funcionario.email}</td>
        <td>${item.treinos.length}</td>
        <td>${item.maestrias.length}</td>
        <td>${formatarPercentual(item.melhorMaestria)}</td>
        <td>${formatarPercentual(item.mediaGeral)}</td>
        <td>${nivelRelatorio(item.melhorMaestria || item.mediaGeral)}</td>
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
        <div><strong>${resumo.maestrias.length}</strong><span>Testes de Maestria</span></div>
        <div><strong>${formatarPercentual(resumo.mediaEmpresa)}</strong><span>Média geral</span></div>
        <div><strong>${formatarPercentual(resumo.mediaMaestria)}</strong><span>Média na maestria</span></div>
      </div>

      <h2>Resumo interpretativo</h2>
      <p>A empresa possui ${funcionariosEmpresaCache.length} funcionário(s) cadastrado(s), com ${resumo.funcionariosComResultados.length} funcionário(s) apresentando ao menos um resultado registrado. Foram identificados ${resumo.treinos.length} treino(s) finalizado(s) e ${resumo.maestrias.length} Teste(s) de Maestria finalizado(s).</p>
      <p>A média geral registrada foi de <strong>${formatarPercentual(resumo.mediaEmpresa)}</strong>. Considerando apenas Testes de Maestria, a média foi de <strong>${formatarPercentual(resumo.mediaMaestria)}</strong>.</p>
      <p><strong>Melhor desempenho:</strong> ${resumo.melhorFuncionario?.funcionario?.nome || 'Ainda não disponível'} ${resumo.melhorFuncionario ? `com melhor maestria de ${formatarPercentual(resumo.melhorFuncionario.melhorMaestria)}.` : ''}</p>
      <p><strong>Funcionários sem Teste de Maestria:</strong> ${resumo.funcionariosSemTeste.length}.</p>

      <h2>Ranking consolidado dos funcionários</h2>
      <div class="table-wrap">
        <table class="ranking-table">
          <thead><tr><th>#</th><th>Funcionário</th><th>E-mail</th><th>Treinos</th><th>Maestrias</th><th>Melhor maestria</th><th>Média geral</th><th>Situação</th></tr></thead>
          <tbody>${rankingInterno || '<tr><td colspan="8">Nenhum funcionário cadastrado.</td></tr>'}</tbody>
        </table>
      </div>

      <h2>Recomendação para a empresa</h2>
      <p>Funcionários sem Teste de Maestria ou com desempenho abaixo de 70% devem ser incentivados a realizar novos treinos antes de repetir a avaliação. O acompanhamento periódico permite identificar pontos de atenção e melhorar a prevenção contra golpes digitais no ambiente de trabalho.</p>
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
  const percentualBase = resumo.melhorMaestria || resumo.mediaGeral;

  const conteudo = `
    <section class="report-document">
      <h1>Relatório Individual de Funcionário</h1>
      <p><strong>Empresa:</strong> ${empresa}</p>
      <p><strong>Funcionário:</strong> ${funcionario.nome}</p>
      <p><strong>E-mail:</strong> ${funcionario.email}</p>
      <p><strong>Gerado em:</strong> ${dataGeracao}</p>

      <div class="report-summary-grid">
        <div><strong>${resumo.treinos.length}</strong><span>Treinos finalizados</span></div>
        <div><strong>${resumo.maestrias.length}</strong><span>Testes de Maestria</span></div>
        <div><strong>${formatarPercentual(resumo.mediaGeral)}</strong><span>Média geral</span></div>
        <div><strong>${formatarPercentual(resumo.melhorMaestria)}</strong><span>Melhor maestria</span></div>
      </div>

      <h2>Análise do desempenho</h2>
      <p>O funcionário possui ${resumo.resultados.length} resultado(s) registrado(s), sendo ${resumo.treinos.length} treino(s) e ${resumo.maestrias.length} Teste(s) de Maestria.</p>
      <p>A melhor pontuação em Teste de Maestria foi de <strong>${formatarPercentual(resumo.melhorMaestria)}</strong>. A média geral considerando todos os registros é de <strong>${formatarPercentual(resumo.mediaGeral)}</strong>.</p>
      <p><strong>Situação atual:</strong> ${nivelRelatorio(percentualBase)}.</p>

      <h2>Histórico de resultados</h2>
      ${gerarTabelaResultadosRelatorio(resumo.resultados)}

      <h2>Recomendação individual</h2>
      <p>${percentualBase >= 70
        ? 'O funcionário apresenta desempenho satisfatório. Recomenda-se manter a prática periódica para reforçar a identificação de golpes digitais.'
        : 'O funcionário deve realizar novos treinos e revisar os feedbacks dos cenários, principalmente antes de repetir o Teste de Maestria.'}</p>
    </section>
  `;

  abrirModalRelatorio(`Relatório de ${funcionario.nome}`, conteudo);
}

function baixarRelatorioGeralCsv() {
  if (typeof baixarCsv !== 'function') {
    showToast('Função de exportação CSV não encontrada.', 'error');
    return;
  }

  const cabecalho = ['Funcionário', 'E-mail', 'Treinos finalizados', 'Testes de Maestria', 'Melhor maestria', 'Média geral', 'Situação'];
  const linhas = funcionariosEmpresaCache.map((funcionario) => {
    const resumo = calcularResumoFuncionario(funcionario);
    const percentualBase = resumo.melhorMaestria || resumo.mediaGeral;
    return [
      funcionario.nome,
      funcionario.email,
      resumo.treinos.length,
      resumo.maestrias.length,
      formatarPercentual(resumo.melhorMaestria),
      formatarPercentual(resumo.mediaGeral),
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
        <thead><tr><th>Funcionário</th><th>E-mail</th><th>Treinos</th><th>Maestrias</th><th>Melhor maestria</th><th>Ação</th></tr></thead>
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
        <td>${resumo.maestrias.length}</td>
        <td>${formatarPercentual(resumo.melhorMaestria)}</td>
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
