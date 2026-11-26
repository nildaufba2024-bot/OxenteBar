# Oxente — revisão das imagens e dos cards do cardápio

**Estado:** prévia local para homologação; sem push ao GitHub, deploy, alteração no Supabase ou atualização de preços e produtos.

## Critério e resultado

A logo recebida (`b558aaaf-5a3f-4039-ba7b-0d5b73099f1a.png`) tem o mesmo SHA-256 da `public/assets/oxente-logo-cliente.png` já existente: `0c999ed4cf5fd9e8534ac9e1303788c5291cb5aa3f74d63274c6b4cf9020dca6`. A interface usa essa arte oficial, sem redesenhá-la, centralizada sobre o fundo amadeirado existente.

| Tipo | Produtos | Ação |
|---|---:|---|
| Artes cronológicas da etapa anterior | 34 | Preservadas |
| Cervejas personalizadas | 12 | Preservadas |
| Composição de latas com Guaraná | 1 | Preservada por solicitação expressa |
| Fotos genéricas, provisórias ou associação sem foto | 64 | Referência trocada pela logo oficial |
| **Total** | **111** | Todas as 16 categorias conferidas |

A imagem da **Garrafa KS** era uma composição marcada como ilustrativa e recebeu a logo. A composição da **Lata 350 ml**, que contém Guaraná, foi preservada. “Tó Frito”, que estava sem foto própria, também recebeu a logo. As fotografias originais aprovadas não foram alteradas nem sobrepostas: os hashes dos 47 arquivos preservados coincidem com a cópia anterior.

O [CSV de auditoria](AUDITORIA-FOTOS-GENERICAS.csv) lista cada produto, ID, categoria, imagem anterior, imagem final e decisão. Os arquivos genéricos antigos foram mantidos apenas para restauração; nenhum deles permanece associado aos cards do cardápio.

## Conferência por categoria

| Categoria | Produtos | Com logo | Imagens preservadas | Captura mobile |
|---|---:|---:|---:|---|
| Beliscar | 15 | 6 | 9 | `tmp/revisao-logo/mobile/logo-beliscar-390.png` |
| Pastelzinho | 3 | 3 | 0 | `tmp/revisao-logo/mobile/logo-pastelzinho-390.png` |
| Bolinhos | 12 | 9 | 3 | `tmp/revisao-logo/mobile/logo-bolinhos-390.png` |
| Caldos | 4 | 3 | 1 | `tmp/revisao-logo/mobile/logo-caldos-390.png` |
| Espetinhos | 11 | 11 | 0 | `tmp/revisao-logo/mobile/logo-espetinhos-390.png` |
| Do Ar | 5 | 3 | 2 | `tmp/revisao-logo/mobile/logo-do-ar-390.png` |
| Da Terra | 4 | 3 | 1 | `tmp/revisao-logo/mobile/logo-da-terra-390.png` |
| Do Mar | 6 | 4 | 2 | `tmp/revisao-logo/mobile/logo-do-mar-390.png` |
| Oxente Refeições | 10 | 3 | 7 | `tmp/revisao-logo/mobile/logo-oxente-refeicoes-390.png` |
| Pirão de Aipim | 7 | 4 | 3 | `tmp/revisao-logo/mobile/logo-pirao-de-aipim-390.png` |
| Oxente Kids | 3 | 3 | 0 | `tmp/revisao-logo/mobile/logo-oxente-kids-390.png` |
| Porções | 8 | 8 | 0 | `tmp/revisao-logo/mobile/logo-porcoes-390.png` |
| Sobremesa | 3 | 2 | 1 | `tmp/revisao-logo/mobile/logo-sobremesa-390.png` |
| Tábuas ou Chapas | 6 | 1 | 5 | `tmp/revisao-logo/mobile/logo-tabuas-ou-chapas-390.png` |
| Cervejas | 12 | 0 | 12 | `tmp/revisao-logo/mobile/logo-cervejas-390.png` |
| Refrigerantes | 2 | 1 | 1 | `tmp/revisao-logo/mobile/logo-refrigerantes-390.png` |

Há capturas complementares de Beliscar em 320 px e Tábuas ou Chapas em 430 px na mesma pasta.

## Apresentação visual

Os cards de produtos agora apresentam a imagem em toda a largura, em uma área quadrada que representa cerca de 75% a 80% da altura do card. As fotografias gastronômicas usam `object-fit: cover` e foco central, sem esticar o arquivo original. Nome, preço e acesso aos detalhes ficam em um rodapé amadeirado sob a fotografia. Produtos sem foto própria mantêm a logo oficial inteira, centralizada sobre madeira escura.

As cervejas aprovadas continuam sem alterações nos arquivos e no cadastro. A seção de destaque apresenta quatro cards verticais no desktop, com garrafas inteiras, gelo na base, nome, volume e preço em rodapé próprio; no celular, são duas colunas. Para Amstel e Brahma, máscaras de transparência escondem apenas o branco das fotos originais; os pixels das garrafas e rótulos permanecem dos arquivos originais. O gelo é uma camada decorativa separada e não altera essas fotos. Os cards da categoria Cervejas usam a mesma apresentação de produtos, mantendo a garrafa visível.

Comparação visual: a [captura mobile dos produtos](tmp/revisao-logo/mobile/logo-beliscar-390.png) mostra os cards após o ajuste; a [captura desktop dos produtos](tmp/revisao-logo/mobile/produtos-1440.png) mostra a grade de três colunas e a [captura desktop do cardápio](tmp/revisao-logo/mobile/cardapio-1440.png) mostra o destaque das cervejas. As 16 capturas por categoria estão relacionadas na tabela acima.

O [destaque das cervejas no desktop](tmp/revisao-logo/mobile/cervejas-destaque-1440.png) e a [captura mobile](tmp/revisao-logo/mobile/cervejas-destaque-390.png) registram o acabamento atualizado após a correção dos contornos e inclusão do gelo.

Camadas geradas com a ferramenta integrada de imagens, sem gerar novas embalagens para exibição:

- `public/assets/beer-ice-overlay.png`: prompt final — “Uma faixa esparsa e fotográfica de cubos de gelo transparentes, iluminados em âmbar, com sombra de contato, fundo totalmente transparente, sem garrafas, marcas, textos ou cenário.”
- `public/assets/beer-amstel-alpha-mask.png` e `public/assets/beer-brahma-alpha-mask.png`: prompt final — “Remover somente o fundo branco da fotografia original e produzir transparência com borda suave, mantendo tamanho e silhueta da garrafa; a saída será usada apenas pelo canal alfa.” Os pixels visíveis dos rótulos continuam vindo das fotografias originais.

## Testes

- `npm run build:vercel`: aprovado.
- Auditoria estática: 111 imagens mapeadas, nenhum arquivo ou variante ausente, nenhum preço inválido.
- Auditoria no navegador: 34 verificações de viewport; as 16 categorias capturadas a 390 px, com categorias prioritárias também verificadas a 320, 360 e 430 px.
- Nenhuma foto de demonstração renderizada, nenhum aviso “IMAGEM ILUSTRATIVA”, nenhuma rolagem horizontal, erro de JavaScript ou requisição local quebrada.
- Supabase público consultado em modo leitura: 111 produtos, zero fotos e zero galerias remotas sobrepondo o mapeamento local.
- PWA: cache atualizado para `oxente-visual-66`; navegação e recarga offline verificadas.
- Busca, categorias, abertura de detalhes, navegação inferior, links sociais e preços existentes continuaram operacionais.
- Nova inspeção visual: 15 cards de Beliscar verificados em 320, 360, 390, 430, 768 e 1440 px; 111 imagens carregadas nas 16 categorias a 390 px. Nenhum nome ou preço cortado, texto sobreposto ou rolagem horizontal.

## Restauração e publicação

O ponto de restauração anterior às substituições está em `tmp/backups/generic-photo-mappings-before-2026-11-26.zip`. A prévia local está em `http://127.0.0.1:51887/cardapio/`. Nenhuma alteração foi enviada à produção.
