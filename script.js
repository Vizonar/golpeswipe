const cards = [
  {cat:'WhatsApp', titulo:'Pedido urgente de Pix por número desconhecido', cenario:'Você recebe no WhatsApp, de um número desconhecido: “Oi filha, troquei de número. Preciso de um Pix urgente, depois te explico.”', correta:'golpe', sinais:['Número desconhecido','Pedido urgente de Pix','Tentativa de se passar por familiar','Falta de explicação clara'], dica:'Confirme por ligação ou por outro canal antes de enviar dinheiro.', ok:'Correto! O cenário apresenta sinais comuns de golpe de falsa identidade.', erro:'Atenção! Era golpe. A pessoa usa número novo, urgência e pedido de dinheiro para pressionar a vítima.'},
  {cat:'Banco', titulo:'Verificação pelo aplicativo oficial', cenario:'Você recebe um aviso de segurança. Em vez de clicar em link, abre o aplicativo oficial do banco já instalado e confere a informação dentro dele.', correta:'seguro', sinais:['Uso do app oficial','Sem clique em link externo','Sem envio de senha','Verificação manual'], dica:'Sempre acesse banco pelo aplicativo oficial ou pelo endereço digitado manualmente.', ok:'Correto! Essa é uma atitude segura.', erro:'Atenção! Não era golpe. A ação segura foi verificar diretamente no aplicativo oficial.'},
  {cat:'SMS', titulo:'Falso bloqueio de conta bancária', cenario:'Você recebe SMS: “Sua conta será bloqueada hoje. Acesse o link abaixo e confirme seus dados para evitar o bloqueio.” O link não parece oficial.', correta:'golpe', sinais:['Ameaça de bloqueio','Link suspeito','Pedido de dados','Urgência exagerada'], dica:'Não confirme dados bancários por SMS. Abra o app oficial do banco.', ok:'Correto! A mensagem usa medo e urgência para levar ao clique.', erro:'Atenção! Era golpe. Bancos não pedem confirmação de dados por link suspeito enviado por SMS.'},
  {cat:'Pix', titulo:'Conferência antes de pagar Pix', cenario:'Em uma loja física, antes de confirmar um Pix, você confere nome da empresa, CNPJ, banco e valor na tela do aplicativo. Tudo bate com a loja.', correta:'seguro', sinais:['Recebedor conferido','Valor correto','CNPJ compatível','Sem pressão suspeita'], dica:'Antes de confirmar Pix, confira sempre os dados do recebedor.', ok:'Correto! Conferir os dados antes do pagamento é uma prática segura.', erro:'Atenção! Não era golpe. O usuário validou os dados antes de pagar.'},
  {cat:'Pix', titulo:'Pix de verificação', cenario:'Um suposto atendente diz pelo WhatsApp que houve compra suspeita no cartão e pede um “Pix de verificação”, prometendo estorno automático.', correta:'golpe', sinais:['Pedido de Pix para cancelar compra','Promessa de estorno','Contato fora do canal oficial','Pressão para resolver rápido'], dica:'Instituições não pedem Pix para cancelar compra ou validar conta.', ok:'Correto! “Pix de verificação” é forte sinal de golpe.', erro:'Atenção! Era golpe. Não existe necessidade de enviar Pix para cancelar compra.'},
  {cat:'Entrega', titulo:'Rastreamento pelo site oficial', cenario:'Você recebe e-mail sobre uma encomenda. Como esperava uma compra, não clica no link e acessa o site oficial da loja para ver o rastreio.', correta:'seguro', sinais:['Compra esperada','Acesso pelo site oficial','Sem pagamento por link','Verificação dentro da conta'], dica:'Consulte entregas no site oficial da loja ou transportadora.', ok:'Correto! A verificação foi feita por canal confiável.', erro:'Atenção! Não era golpe. A atitude foi segura porque evitou o link do e-mail.'},
  {cat:'Entrega', titulo:'Taxa inesperada para liberar encomenda', cenario:'Você recebe e-mail dizendo que uma encomenda está retida e precisa pagar uma taxa por link, mas não lembra de ter comprado nada.', correta:'golpe', sinais:['Cobrança inesperada','Link por e-mail','Compra não reconhecida','Taxa pequena para parecer normal'], dica:'Verifique rastreios apenas em canais oficiais.', ok:'Correto! Cobrança inesperada por link é suspeita.', erro:'Atenção! Era golpe. Falsas entregas são usadas para roubar dados e dinheiro.'},
  {cat:'WhatsApp', titulo:'Confirmação por ligação antes de enviar dinheiro', cenario:'Um familiar pede dinheiro por mensagem. Você desconfia, liga para o número antigo dele e confirma que o pedido era falso antes de fazer qualquer Pix.', correta:'seguro', sinais:['Desconfiança saudável','Confirmação por ligação','Sem pagamento imediato','Verificação independente'], dica:'Pedidos urgentes de dinheiro devem ser confirmados por outro canal.', ok:'Correto! A atitude segura evitou o golpe.', erro:'Atenção! Não era golpe no sentido da sua atitude: você confirmou e não enviou dinheiro.'},
  {cat:'QR Code', titulo:'QR Code colado por cima do original', cenario:'Em um restaurante, um QR Code parece colado por cima do cardápio. Ao escanear, ele pede cadastro completo e dados do cartão para mostrar o menu.', correta:'golpe', sinais:['QR Code adulterado','Pedido de dados excessivos','Dados de cartão sem necessidade','Local improvisado'], dica:'Peça confirmação ao estabelecimento antes de acessar QR Codes suspeitos.', ok:'Correto! QR Code adulterado pode levar a páginas falsas.', erro:'Atenção! Era golpe. Cardápio não precisa pedir cartão ou dados completos.'},
  {cat:'QR Code', titulo:'QR Code confirmado no caixa', cenario:'Você vai pagar por QR Code em uma loja. O código está no caixa, o atendente confirma, e o app mostra o nome e CNPJ corretos antes do pagamento.', correta:'seguro', sinais:['QR Code no local correto','Atendente confirmou','CNPJ correto','Valor compatível'], dica:'Mesmo em QR Codes legítimos, confira recebedor e valor antes de pagar.', ok:'Correto! A situação não apresenta sinais fortes de fraude.', erro:'Atenção! Não era golpe. Houve conferência do recebedor e confirmação no local.'},
  {cat:'Redes sociais', titulo:'Promoção boa demais para ser verdade', cenario:'Você vê anúncio de tênis caro com 90% de desconto em perfil recém-criado. O link leva para uma loja desconhecida e só aceita Pix.', correta:'golpe', sinais:['Desconto exagerado','Perfil novo','Loja desconhecida','Pagamento somente por Pix'], dica:'Pesquise reputação da loja e desconfie de promoções irreais.', ok:'Correto! Promoções exageradas podem esconder lojas falsas.', erro:'Atenção! Era golpe. Preço muito abaixo do normal e Pix como única forma de pagamento são sinais de alerta.'},
  {cat:'Redes sociais', titulo:'Promoção verificada no site oficial', cenario:'Você vê uma promoção em rede social, mas não compra pelo anúncio. Entra no site oficial da loja digitando o endereço e encontra a mesma promoção.', correta:'seguro', sinais:['Verificação no site oficial','Promoção compatível','Sem compra por link duvidoso','Canal confiável'], dica:'Quando vir promoção em anúncio, confirme no site oficial.', ok:'Correto! Verificar no canal oficial reduz riscos.', erro:'Atenção! Não era golpe. A compra foi validada pelo site oficial.'},
  {cat:'WhatsApp', titulo:'Código de confirmação solicitado por desconhecido', cenario:'Uma pessoa diz que enviou um código para seu celular por engano e pede que você mande o número recebido por SMS.', correta:'golpe', sinais:['Pedido de código','Contato desconhecido','História de engano','Risco de invasão de conta'], dica:'Nunca compartilhe códigos recebidos por SMS, e-mail ou aplicativo.', ok:'Correto! Códigos podem permitir invasão de contas.', erro:'Atenção! Era golpe. O código pode ser usado para ativar sua conta em outro aparelho.'},
  {cat:'Segurança', titulo:'Ativação de autenticação em dois fatores', cenario:'Você entra nas configurações do seu e-mail pelo site oficial e ativa autenticação em dois fatores, sem compartilhar códigos com ninguém.', correta:'seguro', sinais:['Acesso pelo site oficial','Reforço de segurança','Sem compartilhar código','Configuração voluntária'], dica:'Ative 2FA em e-mail, redes sociais e bancos sempre que possível.', ok:'Correto! Essa prática aumenta a proteção da conta.', erro:'Atenção! Não era golpe. Ativar autenticação em dois fatores por canal oficial é uma medida segura.'},
  {cat:'Boleto', titulo:'Boleto recebido por e-mail estranho', cenario:'Você recebe boleto por e-mail de uma cobrança que não reconhece. O remetente é estranho e o beneficiário não tem relação com a empresa citada.', correta:'golpe', sinais:['Cobrança desconhecida','Remetente estranho','Beneficiário incompatível','Pressão para pagar'], dica:'Gere boletos apenas pelo site ou app oficial da empresa.', ok:'Correto! Boleto falso é golpe comum.', erro:'Atenção! Era golpe. O beneficiário incompatível indica risco de pagamento para criminoso.'},
  {cat:'Boleto', titulo:'Boleto gerado no aplicativo oficial', cenario:'Você precisa pagar a fatura. Abre o aplicativo oficial da empresa, gera o boleto por lá e confere o beneficiário antes de pagar.', correta:'seguro', sinais:['Uso do app oficial','Beneficiário conferido','Cobrança esperada','Sem link externo'], dica:'Prefira gerar boletos dentro do app ou site oficial.', ok:'Correto! Essa é uma forma segura de pagar.', erro:'Atenção! Não era golpe. O boleto foi gerado e conferido no canal oficial.'},
  {cat:'Investimento', titulo:'Investimento com lucro garantido', cenario:'Um perfil promete investimento com retorno de 30% ao mês, sem risco, com vagas limitadas e pagamento inicial por Pix.', correta:'golpe', sinais:['Lucro garantido','Retorno alto e rápido','Sem risco','Pressão por vaga limitada'], dica:'Desconfie de lucro fácil e pesquise a instituição.', ok:'Correto! Promessa de lucro alto sem risco é sinal clássico de golpe.', erro:'Atenção! Era golpe. Investimentos reais envolvem risco e não prometem retorno garantido assim.'},
  {cat:'Marketplace', titulo:'Comprovante falso de pagamento', cenario:'Você vende um produto usado. O comprador envia print de comprovante Pix e insiste para retirar o produto, mas o dinheiro não caiu na sua conta.', correta:'golpe', sinais:['Comprovante por imagem','Valor não recebido','Pressa para retirar','Pressão do comprador'], dica:'Só entregue o produto depois que o dinheiro aparecer na conta.', ok:'Correto! Prints podem ser falsificados.', erro:'Atenção! Era golpe. Confie no saldo da conta, não apenas em comprovante enviado.'},
  {cat:'Marketplace', titulo:'Entrega após dinheiro cair na conta', cenario:'Você vende um produto. O comprador envia Pix, mas você só entrega depois de abrir o app do banco e confirmar que o dinheiro entrou.', correta:'seguro', sinais:['Pagamento conferido no banco','Sem confiar só em print','Entrega após confirmação','Sem pressão aceita'], dica:'Em vendas online, confirme o recebimento no banco antes de entregar.', ok:'Correto! A atitude foi segura.', erro:'Atenção! Não era golpe. O vendedor verificou o pagamento antes da entrega.'},
  {cat:'Suporte falso', titulo:'Aplicativo de acesso remoto por telefone', cenario:'Alguém liga dizendo ser do suporte e afirma que seu celular está infectado. A pessoa pede para instalar um aplicativo de acesso remoto.', correta:'golpe', sinais:['Ligação inesperada','Medo de infecção','Pedido para instalar app','Acesso remoto'], dica:'Nunca instale apps indicados por desconhecidos em ligações.', ok:'Correto! Acesso remoto pode dar controle do aparelho ao golpista.', erro:'Atenção! Era golpe. Suportes falsos usam medo para fazer a vítima instalar programas perigosos.'}
];

let indiceAtual = 0;
let pontuacao = 0;
let bloqueado = false;

const telas = {
  inicial: document.getElementById('tela-inicial'),
  jogo: document.getElementById('tela-jogo'),
  feedback: document.getElementById('tela-feedback'),
  final: document.getElementById('tela-final')
};

function trocarTela(nome) {
  Object.values(telas).forEach(tela => tela.classList.remove('ativa'));
  telas[nome].classList.add('ativa');
}

function renderizarCard() {
  const card = cards[indiceAtual];
  bloqueado = false;
  const total = cards.length;
  document.getElementById('categoria').textContent = card.cat;
  document.getElementById('titulo-card').textContent = card.titulo;
  document.getElementById('cenario-card').textContent = card.cenario;
  document.getElementById('contador').textContent = `Card ${indiceAtual + 1} de ${total}`;
  document.getElementById('pontuacao').textContent = pontuacao;
  document.getElementById('progresso').style.width = `${(indiceAtual / total) * 100}%`;
  const cardEl = document.getElementById('card');
  cardEl.className = 'card';
}

function responder(resposta) {
  if (bloqueado) return;
  bloqueado = true;
  const card = cards[indiceAtual];
  const acertou = resposta === card.correta;
  const cardEl = document.getElementById('card');
  cardEl.classList.add(resposta === 'golpe' ? 'sair-esquerda' : 'sair-direita');
  setTimeout(() => mostrarFeedback(card, acertou), 280);
}

function mostrarFeedback(card, acertou) {
  if (acertou) pontuacao++;
  const status = document.getElementById('status-feedback');
  status.textContent = acertou ? 'Resposta correta' : 'Resposta incorreta';
  status.className = acertou ? 'status acerto' : 'status erro';
  document.getElementById('titulo-feedback').textContent = acertou ? 'Você acertou!' : `Você errou: essa situação ${card.correta === 'golpe' ? 'era golpe' : 'não era golpe'}.`;
  document.getElementById('texto-feedback').textContent = acertou ? card.ok : card.erro;
  document.getElementById('dica-feedback').textContent = card.dica;
  const lista = document.getElementById('lista-sinais');
  lista.innerHTML = '';
  card.sinais.forEach(sinal => {
    const li = document.createElement('li');
    li.textContent = sinal;
    lista.appendChild(li);
  });
  document.getElementById('pontuacao').textContent = pontuacao;
  document.getElementById('progresso').style.width = `${((indiceAtual + 1) / cards.length) * 100}%`;
  trocarTela('feedback');
}

function proximoCard() {
  indiceAtual++;
  if (indiceAtual >= cards.length) return mostrarFinal();
  renderizarCard();
  trocarTela('jogo');
}

function mostrarFinal() {
  const total = cards.length;
  const percentual = Math.round((pontuacao / total) * 100);
  document.getElementById('acertos-final').textContent = pontuacao;
  document.getElementById('resultado-texto').textContent = `Você acertou ${pontuacao} de ${total} cenários (${percentual}%).`;
  let msg = 'Continue praticando para reconhecer melhor os sinais de alerta.';
  if (percentual >= 85) msg = 'Excelente! Você demonstrou ótima atenção aos sinais de golpes digitais.';
  else if (percentual >= 60) msg = 'Bom resultado! Revise os feedbacks dos erros para melhorar ainda mais.';
  document.getElementById('mensagem-final').textContent = msg;
  trocarTela('final');
}

function reiniciar() {
  indiceAtual = 0;
  pontuacao = 0;
  renderizarCard();
  trocarTela('jogo');
}

document.getElementById('btn-comecar').addEventListener('click', reiniciar);
document.getElementById('btn-golpe').addEventListener('click', () => responder('golpe'));
document.getElementById('btn-seguro').addEventListener('click', () => responder('seguro'));
document.getElementById('btn-proximo').addEventListener('click', proximoCard);
document.getElementById('btn-reiniciar').addEventListener('click', reiniciar);

document.addEventListener('keydown', event => {
  if (!telas.jogo.classList.contains('ativa')) return;
  if (event.key === 'ArrowLeft') responder('golpe');
  if (event.key === 'ArrowRight') responder('seguro');
});
