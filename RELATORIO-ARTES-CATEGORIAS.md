# Oxente — artes de “Explore o cardápio”

Prévia local para homologação. Nenhum deploy, push ou alteração no banco de dados.

As quatro artes recebidas foram associadas, nesta ordem, a Beliscar, Pastelzinho, Bolinhos e Do Mar. Os PNGs originais permanecem sem edição em `tmp/approved-feature-originals/`; os WebP de 640 e 1280 px foram criados para carregamento responsivo. Cada card mantém borda dourada, seta, nome acessível e o clique na categoria. A legenda HTML visível foi removida apenas desses quatro cards, pois o título já faz parte da arte.

O ponto de restauração está em `tmp/backups/feature-cards-before-2026-11-26.zip`.

## Conferência

- `npm run build:vercel`: passou.
- `npm run test:responsive`: passou com 34 verificações de viewport, sem rolagem horizontal, requisições locais quebradas ou erro de JavaScript.
- Em 320, 390, 768 e 1440 px: quatro imagens carregadas, ordem correta, proporção aproximada de 1672:941, sem títulos HTML sobrepostos, setas e nomes acessíveis presentes.
- Clique na arte Do Mar: selecionou a categoria Do Mar no cardápio.
- PWA: cache `oxente-visual-67` com as versões leves e amplas das quatro artes.

Capturas: [mobile 390 px](tmp/previews/artes-categorias/cardapio-390.png), [mobile 320 px](tmp/previews/artes-categorias/cardapio-320.png) e [desktop 1440 px](tmp/previews/artes-categorias/cardapio-1440.png).
