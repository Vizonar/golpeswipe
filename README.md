# GolpeSwipe

Site interativo de conscientização sobre golpes digitais, desenvolvido como projeto final de TCC.

## Link do site

Quando o GitHub Pages estiver ativado, o projeto ficará disponível em:

```txt
https://vizonar.github.io/golpeswipe/
```

## Sobre o projeto

O **GolpeSwipe** apresenta cenários simulados de situações digitais do cotidiano e desafia o usuário a decidir se cada caso é **golpe** ou **não é golpe**.

A proposta usa uma mecânica inspirada em cards de decisão: o usuário analisa o cenário, escolhe uma resposta e recebe feedback educativo imediato. Quando erra, o sistema explica por que a resposta está incorreta, mostra os sinais de alerta e apresenta uma dica preventiva.

## Funcionalidades

- 20 cenários simulados sobre golpes digitais.
- Mistura de situações fraudulentas e situações seguras.
- Respostas: **É golpe** ou **Não é golpe**.
- Feedback de acerto e erro.
- Explicação educativa para cada cenário.
- Lista de sinais observados.
- Dica preventiva.
- Pontuação final.
- Layout responsivo para celular.
- Animação de card deslizando.
- Atalhos de teclado: seta esquerda para golpe e seta direita para não é golpe.

## Temas abordados

- Golpes por WhatsApp.
- Falso pedido de Pix.
- Phishing por SMS/e-mail.
- Falsa entrega pendente.
- QR Code adulterado.
- Boleto falso.
- Promoções falsas em redes sociais.
- Roubo de código de confirmação.
- Falso suporte técnico.
- Comprovante falso de pagamento.
- Investimento com lucro garantido.

## Estrutura

```txt
/
├── index.html
├── style.css
├── script.js
└── .nojekyll
```

## Como executar localmente

Como o projeto usa apenas HTML, CSS e JavaScript puro, não precisa instalar dependências.

### Opção 1: abrir direto

Abra o arquivo `index.html` no navegador.

### Opção 2: usar Live Server no VS Code

1. Abra a pasta do projeto no VS Code.
2. Instale a extensão **Live Server**.
3. Clique com o botão direito no arquivo `index.html`.
4. Escolha **Open with Live Server**.

## Como publicar no GitHub Pages

1. Abra o repositório no GitHub.
2. Vá em **Settings**.
3. No menu lateral, clique em **Pages**.
4. Em **Build and deployment**, selecione:
   - **Source:** Deploy from a branch
   - **Branch:** main
   - **Folder:** /root
5. Clique em **Save**.
6. Aguarde alguns instantes até o GitHub gerar o link.

## Objetivo acadêmico

O projeto tem como objetivo apoiar a educação preventiva contra golpes digitais por meio de simulações interativas. Em vez de apenas apresentar recomendações teóricas, o site coloca o usuário diante de cenários práticos e fornece correções explicativas, ajudando no reconhecimento de sinais de risco.

## Autores

Projeto desenvolvido para fins acadêmicos no contexto de TCC do curso de Sistemas de Informação.
