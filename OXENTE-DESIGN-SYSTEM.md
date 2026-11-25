# Sistema visual da página inicial — Oxente Bar e Petiscaria

Este documento registra o acabamento da home existente. O logotipo oficial, o cenário amadeirado, as fotos ilustrativas e a composição aprovada permanecem como base.

## Paleta e tipografia

| Papel | Token CSS | Valor |
| --- | --- | --- |
| Dourado das bordas e divisórias | `--home-gold` | `#f7bd32` |
| Dourado claro de realces | `--home-gold-light` | `#ffdc72` |
| Texto claro | `--home-cream` | `#fff0d5` |
| Madeira escura dos cards | `--home-wood` | `#2a1004` |

- **DM Sans:** textos de interface, status, botões e descrição.
- **Playfair Display:** frase principal e nome do estabelecimento no rodapé.
- **Placa Oxente:** recurso gráfico aprovado, sem substituição da sua tipografia.

## Componentes

- `.action`: borda, canto, sombra, foco, hover e resposta ao toque compartilhados pelas chamadas da home.
- `.service`: grade social de duas colunas; os quatro serviços têm a mesma altura e a mesma largura dentro de cada linha.
- `.service-icon`: área óptica compartilhada; SVG quadrado de `8cqw` (31 px em 390 px de largura), com proporção preservada. A divisória fica na mesma posição relativa em todos os serviços.
- `.action--menu`: chamada comercial integralmente clicável. Título e descrição são HTML; a foto começa após a área de texto e recebe transição escura.
- `.service--video`: card de apresentação com ícone SVG, título HTML e foto independente.
- `.home-status` e `.home-schedule`: estado e próxima mudança de horário são textos HTML calculados a partir do cadastro, com relógio do servidor e atualização na virada de cada minuto. Verde indica aberto, vermelho fechado, amarelo abertura em até 30 minutos e laranja encerramento em até 30 minutos. Quando o relógio não pode ser confirmado, o componente informa indisponibilidade e a linha auxiliar é ocultada.

## Interações e responsividade

- Elevação e brilho leves no hover, pequena resposta ao toque e foco visível por teclado. A preferência por movimento reduzido desativa transições.
- Dimensões proporcionais ao contêiner até 1024 px; a grade mantém duas colunas na home. O painel de vídeo permanece dentro da área segura em paisagem.
- A versão `oxente-visual-25` do service worker inclui os SVGs dos quatro serviços e o cálculo de horários no cache essencial; o status remoto exige nova confirmação do servidor.

## Origem dos ícones

- Glifos vetoriais de WhatsApp e Instagram: [Simple Icons](https://github.com/simple-icons/simple-icons), com as cores aplicadas ao fundo quadrado conforme a referência visual.
- Wordmark vetorial do iFood: [arquivo do iFood no Wikimedia Commons](https://commons.wikimedia.org/wiki/File:IFood_logo.svg), aplicado em branco sobre o vermelho da marca.
- Localização, cloche, calendário e claquete: SVGs próprios da interface, desenhados para acompanhar a linguagem dourada e amadeirada do Oxente.
