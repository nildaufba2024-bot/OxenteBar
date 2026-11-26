# Oxente — prévia local das cervejas

Data: 26/11/2026. Status: pronta para homologação local; sem deploy e sem alteração do Supabase.

## Resultado

- As 12 cervejas da categoria usam o mesmo enquadramento vertical, fundo de bar em luz quente, balcão amadeirado e gelo natural, sem cortar as garrafas.
- Os quatro destaques usam diretamente as artes prontas recebidas: Heineken, Stella, Amstel e Brahma 600ml.
- Nas outras oito cervejas, a garrafa e o rótulo vieram das fotografias de referência já existentes no projeto. As garrafas foram recortadas e colocadas sobre o cenário com gelo enviado pelo cliente, sem recriar marcas ou embalagens por IA. O recorte quebrado da Spaten foi corrigido nesse processo.
- Nome, volume e preço são elementos HTML vinculados aos dados do catálogo; cada card continua abrindo os detalhes. A mesma arte aparece no detalhe do produto.
- A ordem cadastrada, os nomes, os preços, as descrições e os links não foram modificados.

## Conferência individual

| ID | Produto cadastrado | Arte aplicada | Origem da garrafa |
| --- | --- | --- | --- |
| cervejas-101 | Heineken 600ml | beer-art-heineken-600ml.webp | arte final recebida |
| cervejas-102 | Stella 600ml | beer-art-stella-600ml.webp | arte final recebida |
| cervejas-103 | Spaten 600ml | beer-art-spaten-600ml.webp | referência original, recorte corrigido |
| cervejas-104 | Budweiser 600ml | beer-art-budweiser-600ml.webp | referência original |
| cervejas-105 | Eisenbanh 600ml | beer-art-eisenbahn-600ml.webp | referência original |
| cervejas-106 | Amstel 600ml | beer-art-amstel-600ml.webp | arte final recebida |
| cervejas-107 | Brahma 600ml | beer-art-brahma-600ml.webp | arte final recebida |
| cervejas-108 | Devassa 600ml | beer-art-devassa-600ml.webp | referência original |
| cervejas-109 | Itaipava 600ml | beer-art-itaipava-600ml.webp | referência original |
| cervejas-098 | Heineken Long | beer-art-heineken-long-330ml.webp | referência original |
| cervejas-099 | Corona Long | beer-art-corona-long-330ml.webp | referência original |
| cervejas-100 | Eisenbanh Long | beer-art-eisenbahn-long-355ml.webp | referência original |

Os nomes acima reproduzem o cadastro atual. Não foram corrigidas grafias ou volumes nesta alteração visual.

## Testes

- `npm run build:vercel`: passou.
- `npm run test:responsive`: 34 combinações de página e resolução, sem rolagem horizontal, erro JavaScript ou recurso local faltando.
- As 12 artes carregaram nas larguras de 320 e 390 px; ordem de 600ml antes das Long Neck preservada.
- Clique em cerveja, modal de detalhes, “Ver todas”, pesquisa, navegação e modo PWA testados. Cache atualizado para `oxente-visual-68`.
- As 12 artes somam 609 KB; cada arquivo WebP mede cerca de 42 a 67 KB.

## Prévia visual

- [Todas as cervejas, 390 px](previews/cervejas-todas-390.png)
- [Destaques, 390 px](previews/cervejas-destaque-390.png)
- [Destaques, 1440 px](previews/cervejas-destaque-1440.png)
- [Categoria, 320 px](previews/cervejas-320.png)

Prévia local: `http://127.0.0.1:51887/cardapio/`. Backup anterior: `tmp/backups/cervejas-antes-2026-11-26.zip`.

## Ponto para homologação

O documento do pacote recebido menciona pequenas imperfeições de impressão nos rótulos de algumas das quatro artes prontas, em especial Stella. As quatro artes foram usadas como enviadas e devem ser conferidas em tamanho real antes de autorizar publicação.
