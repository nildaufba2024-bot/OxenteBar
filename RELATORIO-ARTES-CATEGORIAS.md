# Oxente — artes de “Explore o cardápio”

Prévia local para homologação, atualizada em 26/11/2026. Nenhum deploy, push ou alteração no banco de dados.

As quatro novas artes recebidas foram associadas nesta ordem: Beliscar, Pastelzinho, Bolinhos e Do Mar. Os PNGs originais estão preservados sem edição em `tmp/approved-feature-originals-v2/`. Foram geradas versões WebP de 640 e 1280 px para carregamento responsivo, sem modificar o conteúdo das artes.

Os cards continuam em duas colunas e agora são quadrados. As duas artes verticais usam `object-fit: cover`, preservando sua proporção e mantendo os títulos completos; as artes quadradas preenchem integralmente seus cards. Borda dourada, seta de navegação, nome acessível e clique na categoria permanecem. Nenhuma legenda HTML visível é sobreposta às imagens.

## Conferência

- `npm run build:vercel`: passou.
- `npm run test:responsive`: 34 combinações de página e resolução, sem rolagem horizontal, requisições locais quebradas ou erro de JavaScript.
- Em 320, 390, 768 e 1440 px: quatro imagens carregadas, ordem correta, cards com a mesma proporção, sem títulos HTML sobrepostos, setas e nomes acessíveis presentes.
- Os quatro cliques selecionaram suas categorias corretas: Beliscar, Pastelzinho, Bolinhos e Do Mar.
- PWA: cache atualizado para `oxente-visual-69` e pré-carregamento das novas versões das artes. As versões antigas saíram da lista de pré-cache.
- Nomes, preços, descrições, imagens dos produtos, banco de dados e outras seções permaneceram como estavam.

## Capturas

- [Grade mobile, 320 px](previews/explore-v2-320.png)
- [Grade mobile, 390 px](previews/explore-v2-390.png)
- [Grade desktop, 1440 px](previews/explore-v2-1440.png)

Prévia local: `http://127.0.0.1:51887/cardapio/`. Ponto de restauração: `tmp/backups/feature-cards-v2-before-2026-11-26.zip`.
