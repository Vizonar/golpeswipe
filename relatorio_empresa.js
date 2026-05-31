// Exportação CSV do histórico de resultados da empresa.

function csvEscape(value) {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}

function baixarCsv(nomeArquivo, linhas) {
  const conteudo = linhas.map((linha) => linha.map(csvEscape).join(';')).join('\n');
  const blob = new Blob(['\uFEFF' + conteudo], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

async function exportarResultadosEmpresaCsv() {
  const client = getSupabaseClient();

  if (!client || !appState?.perfil || appState.perfil.tipo_usuario !== 'admin_empresa') {
    showToast('Apenas administradores da empresa podem exportar relatórios.', 'error');
    return;
  }

  showToast('Gerando relatório CSV...');

  const { data, error } = await client.rpc('listar_resultados_empresa');

  if (error) {
    console.error('Erro ao exportar resultados:', error);
    showToast('Não foi possível gerar o CSV. Verifique se o SQL foi executado no Supabase.', 'error');
    return;
  }

  if (!data || data.length === 0) {
    showToast('Ainda não há resultados para exportar.', 'error');
    return;
  }

  const cabecalho = ['Tipo', 'Funcionário', 'E-mail', 'Acertos', 'Total de perguntas', 'Percentual', 'Nível', 'Data de finalização'];
  const linhas = data.map((item) => [
    item.tipo,
    item.funcionario,
    item.email,
    item.acertos,
    item.total_perguntas,
    item.percentual,
    item.nivel_resultado,
    item.finalizado_em ? new Date(item.finalizado_em).toLocaleString('pt-BR') : '',
  ]);

  const empresaSlug = String(appState?.empresa?.nome || 'empresa')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();

  const hoje = new Date().toISOString().slice(0, 10);
  baixarCsv(`golpeswipe-resultados-${empresaSlug}-${hoje}.csv`, [cabecalho, ...linhas]);
  showToast('Relatório CSV baixado com sucesso.');
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('#btn-exportar-resultados')?.addEventListener('click', exportarResultadosEmpresaCsv);
});
