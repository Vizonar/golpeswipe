const perguntasBaseGolpeSwipe = [
  ['WhatsApp','Pedido urgente de Pix','Você recebe no WhatsApp uma mensagem de um número desconhecido dizendo: “Oi, filha. Troquei de número. Preciso de um Pix urgente; depois eu te explico.”','golpe',['Número desconhecido','Pedido urgente de Pix','Pressão emocional','Falta de explicação clara'],'Confirme por ligação ou por outro canal antes de enviar dinheiro.'],
  ['Banco','Verificação pelo aplicativo oficial','Você recebe um aviso de segurança, não clica em nenhum link e abre o aplicativo oficial do banco para conferir a informação.','seguro',['Uso do aplicativo oficial','Sem clique em link externo','Sem envio de senha','Verificação manual'],'Acesse o banco sempre pelo aplicativo oficial ou digitando o endereço manualmente.'],
  ['SMS','Falso bloqueio de conta','Você recebe um SMS dizendo que sua conta será bloqueada ainda hoje e que precisa confirmar seus dados em um link suspeito.','golpe',['Ameaça de bloqueio','Link suspeito','Pedido de dados','Urgência exagerada'],'Não confirme dados por links recebidos por SMS. Abra o aplicativo oficial do serviço.'],
  ['Pix','Conferência antes do pagamento','Em uma loja física, antes de confirmar um Pix, você confere o nome da empresa, o CNPJ, o banco e o valor. Tudo está correto.','seguro',['Recebedor conferido','Valor correto','CNPJ compatível','Sem pressão suspeita'],'Confira sempre o recebedor e o valor antes de confirmar pagamentos.'],
  ['Pix','Pix de verificação','Um suposto atendente diz que houve uma compra suspeita e pede um Pix de verificação, prometendo estorno automático.','golpe',['Pedido de Pix para cancelar compra','Promessa de estorno','Contato fora do canal oficial','Pressão para resolver rapidamente'],'Instituições financeiras não pedem Pix para cancelar compras ou validar contas.'],
  ['Entrega','Rastreamento pelo site oficial','Você recebe um e-mail sobre uma encomenda esperada, evita clicar no link do e-mail e consulta o rastreio no site oficial da loja.','seguro',['Compra esperada','Acesso pelo site oficial','Sem pagamento por link','Verificação dentro da conta'],'Consulte entregas no site oficial da loja ou da transportadora.'],
  ['Entrega','Taxa inesperada para liberar encomenda','Você recebe um e-mail dizendo que uma encomenda está retida e que é necessário pagar uma taxa por um link, mas você não se lembra de ter feito essa compra.','golpe',['Cobrança inesperada','Link por e-mail','Compra não reconhecida','Taxa pequena para parecer normal'],'Verifique rastreios apenas em canais oficiais.'],
  ['WhatsApp','Confirmação por ligação','Um familiar pede dinheiro por mensagem. Você liga para o número antigo dele e confirma que o pedido era falso antes de fazer o Pix.','seguro',['Desconfiança saudável','Confirmação por ligação','Sem pagamento imediato','Verificação independente'],'Pedidos urgentes de dinheiro devem ser confirmados por outro canal.'],
  ['QR Code','QR Code colado por cima','Em um restaurante, um QR Code parece ter sido colado por cima do original e pede cadastro completo e dados do cartão para mostrar o cardápio.','golpe',['QR Code adulterado','Pedido de dados excessivos','Dados de cartão sem necessidade','Local improvisado'],'Peça confirmação ao estabelecimento antes de usar QR Codes suspeitos.'],
  ['QR Code','QR Code confirmado no caixa','Você vai pagar por QR Code no caixa da loja, o atendente confirma o procedimento e o aplicativo mostra nome e CNPJ corretos.','seguro',['QR Code no local correto','Atendente confirmou','CNPJ correto','Valor compatível'],'Mesmo em QR Codes legítimos, confira o recebedor e o valor.'],
  ['Redes sociais','Promoção exagerada','Você vê um anúncio de um produto caro com 90% de desconto em um perfil recém-criado. A loja é desconhecida e só aceita Pix.','golpe',['Desconto exagerado','Perfil novo','Loja desconhecida','Pagamento somente por Pix'],'Pesquise a reputação da loja e desconfie de promoções irreais.'],
  ['Redes sociais','Promoção verificada no site oficial','Você vê uma promoção em uma rede social, mas acessa o site oficial digitando o endereço e encontra a mesma oferta.','seguro',['Verificação no site oficial','Promoção compatível','Sem compra por link duvidoso','Canal confiável'],'Confirme promoções no site oficial da loja.'],
  ['Conta online','Código de confirmação solicitado','Uma pessoa diz que enviou um código para seu celular por engano e pede que você informe o número recebido por SMS.','golpe',['Pedido de código','Contato desconhecido','História de engano','Risco de invasão de conta'],'Nunca compartilhe códigos recebidos por SMS, e-mail ou aplicativo.'],
  ['Segurança','Autenticação em dois fatores','Você entra nas configurações oficiais do e-mail e ativa a autenticação em dois fatores sem compartilhar códigos.','seguro',['Acesso pelo site oficial','Reforço de segurança','Sem compartilhar código','Configuração voluntária'],'Ative a autenticação em dois fatores em e-mails, redes sociais e bancos.'],
  ['Boleto','Boleto recebido por e-mail estranho','Você recebe um boleto de uma cobrança desconhecida. O remetente é estranho e o beneficiário não tem relação com a empresa citada.','golpe',['Cobrança desconhecida','Remetente estranho','Beneficiário incompatível','Pressão para pagar'],'Gere boletos apenas pelo site ou aplicativo oficial da empresa.'],
  ['Boleto','Boleto gerado no aplicativo oficial','Você precisa pagar uma fatura, abre o aplicativo oficial da empresa, gera o boleto e confere o beneficiário antes de pagar.','seguro',['Uso do aplicativo oficial','Beneficiário conferido','Cobrança esperada','Sem link externo'],'Prefira gerar boletos dentro do aplicativo ou site oficial.'],
  ['Investimento','Lucro garantido','Um perfil promete retorno de 30% ao mês, sem risco, com vagas limitadas e pagamento inicial por Pix.','golpe',['Lucro garantido','Retorno alto e rápido','Promessa de ausência de risco','Pressão por vaga limitada'],'Desconfie de lucro fácil e pesquise a instituição.'],
  ['Marketplace','Comprovante falso','Você vende um produto. O comprador envia um print de Pix e insiste para retirar o item, mas o dinheiro não caiu na sua conta.','golpe',['Comprovante por imagem','Valor não recebido','Pressa para retirar','Pressão do comprador'],'Só entregue o produto depois que o dinheiro aparecer na sua conta.'],
  ['Marketplace','Entrega após confirmação','Você vende um produto e só entrega depois de abrir o aplicativo do banco e confirmar que o dinheiro entrou.','seguro',['Pagamento conferido no banco','Sem confiar apenas em print','Entrega após confirmação','Sem aceitar pressão'],'Confirme o recebimento no banco antes de entregar.'],
  ['Suporte falso','Aplicativo de acesso remoto','Alguém liga dizendo ser do suporte e pede para você instalar um aplicativo de acesso remoto no celular.','golpe',['Ligação inesperada','Medo de infecção','Pedido para instalar aplicativo','Acesso remoto'],'Nunca instale aplicativos indicados por desconhecidos em ligações.'],
  ['E-mail','Anexo de nota fiscal inesperada','Você recebe uma nota fiscal inesperada com anexo executável e remetente desconhecido.','golpe',['Anexo suspeito','Remetente desconhecido','Cobrança inesperada','Arquivo executável'],'Não abra anexos inesperados; confirme a origem antes.'],
  ['E-mail','Conferência de remetente oficial','Você recebe um e-mail esperado do RH, confere o domínio da empresa, lê o conteúdo e acessa o portal interno já conhecido.','seguro',['E-mail esperado','Domínio compatível','Portal conhecido','Sem pedido de senha por e-mail'],'Mesmo em e-mails esperados, confira remetente e links.'],
  ['Senha','Pedido de senha por chat','Um suposto técnico pede sua senha pelo chat para “resolver o problema mais rápido”.','golpe',['Pedido de senha','Canal inadequado','Pressa para resolver','Quebra de procedimento'],'Senhas nunca devem ser compartilhadas com suporte.'],
  ['Senha','Troca de senha pelo portal oficial','Você troca sua senha acessando o portal oficial da empresa e cria uma senha forte, sem reutilizar senhas antigas.','seguro',['Portal oficial','Senha forte','Sem compartilhamento','Boa prática'],'Use senhas fortes e diferentes para cada serviço.'],
  ['Dispositivo','Pendrive encontrado','Você encontra um pendrive no estacionamento da empresa e pensa em conectá-lo ao computador para descobrir quem é o dono.','golpe',['Mídia desconhecida','Risco de malware','Origem incerta','Curiosidade explorada'],'Entregue mídias desconhecidas ao responsável de TI.']
];

const variacoesContexto = [
  'no início do expediente',
  'durante o horário de almoço',
  'perto do fim do expediente',
  'em um dia de muito movimento'
];

window.GOLPESWIPE_PERGUNTAS_BASE = perguntasBaseGolpeSwipe.flatMap((item, index) =>
  variacoesContexto.map((contexto, variacao) => {
    const [categoria, titulo, cenario, respostaCorreta, sinais, dica] = item;
    const codigo = index * variacoesContexto.length + variacao + 1;
    const ehGolpe = respostaCorreta === 'golpe';
    return {
      codigo,
      categoria,
      titulo,
      cenario: `Cenário simulado ${codigo}: ${contexto}, ${cenario} Considerando esse cenário, é golpe ou não é golpe?`,
      respostaCorreta,
      feedbackAcerto: ehGolpe
        ? 'Correto! Esse cenário apresenta sinais de golpe e exige cuidado antes de qualquer ação.'
        : 'Correto! Esse cenário mostra uma atitude segura, com verificação por canais confiáveis.',
      feedbackErro: ehGolpe
        ? 'Atenção! Essa situação era golpe. Observe os sinais de alerta antes de clicar, pagar, enviar dados ou compartilhar códigos.'
        : 'Atenção! Essa situação não era golpe. O cenário mostra uma conduta segura, como verificar dados, usar canal oficial ou confirmar por outro meio.',
      sinais,
      dica,
      nivel: variacao < 2 ? 'basico' : variacao === 2 ? 'intermediario' : 'avancado',
      origem: 'base'
    };
  })
);

window.GOLPESWIPE_PERGUNTAS = window.GOLPESWIPE_PERGUNTAS_BASE;
