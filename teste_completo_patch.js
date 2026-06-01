// Ajuste final: renomeia Teste de Maestria para Teste Completo
// e reforça o embaralhamento aleatório das questões.

(function () {
  const substituicoes = [
    [/Teste de Maestria/g, 'Teste Completo'],
    [/teste de maestria/g, 'teste completo'],
    [/Testes de Maestria/g, 'Testes Completos'],
    [/testes de maestria/g, 'testes completos'],
    [/Iniciar maestria/g, 'Iniciar teste completo'],
    [/Melhor maestria/g, 'Melhor teste completo'],
    [/melhor maestria/g, 'melhor teste completo'],
    [/Média na maestria/g, 'Média no teste completo'],
    [/maestria/g, 'teste completo'],
    [/Maestria/g, 'Teste Completo'],
  ];

  function aplicarSubstituicoesTexto(texto) {
    return substituicoes.reduce((resultado, [regex, valor]) => resultado.replace(regex, valor), texto);
  }

  function atualizarTextosDaTela(raiz = document.body) {
    if (!raiz) return;

    const walker = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        const tag = parent.tagName?.toLowerCase();
        if (tag === 'script' || tag === 'style') return NodeFilter.FILTER_REJECT;
        return substituicoes.some(([regex]) => regex.test(node.nodeValue || ''))
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_SKIP;
      },
    });

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      node.nodeValue = aplicarSubstituicoesTexto(node.nodeValue || '');
    });

    document.querySelectorAll('[title], [aria-label], [placeholder]').forEach((el) => {
      ['title', 'aria-label', 'placeholder'].forEach((attr) => {
        const valor = el.getAttribute(attr);
        if (valor) el.setAttribute(attr, aplicarSubstituicoesTexto(valor));
      });
    });
  }

  function embaralharFisherYates(lista) {
    const copia = [...lista];
    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
  }

  window.maestriaShuffle = embaralharFisherYates;

  if (typeof maestriaShuffle === 'function') {
    maestriaShuffle = embaralharFisherYates;
  }

  const iniciarMaestriaOriginal = window.iniciarMaestria;
  if (typeof iniciarMaestriaOriginal === 'function') {
    window.iniciarMaestria = async function iniciarTesteCompletoAleatorio() {
      const resultado = await iniciarMaestriaOriginal.apply(this, arguments);
      atualizarTextosDaTela();
      return resultado;
    };
  }

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) atualizarTextosDaTela(node);
          if (node.nodeType === Node.TEXT_NODE) node.nodeValue = aplicarSubstituicoesTexto(node.nodeValue || '');
        });
      }

      if (mutation.type === 'characterData') {
        mutation.target.nodeValue = aplicarSubstituicoesTexto(mutation.target.nodeValue || '');
      }
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    atualizarTextosDaTela();
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  });
})();
