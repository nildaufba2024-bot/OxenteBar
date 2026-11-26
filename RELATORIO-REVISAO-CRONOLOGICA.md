# Revisão cronológica das imagens do cardápio

**Estado:** prévia local para homologação. Sem deploy, push, alteração no Supabase ou edição de preços e conteúdo.

**Fonte oficial:** `OXENTE-FOTOS-REVISAO-CRONOLOGICA.zip` (SHA-256 `3581ebca8c7045f934ae0c34c1c4339c2c71c36956725f4674da8277c7ceb054`).
Foram abertas e examinadas as 46 artes; o `mapa-imagens.csv` determinou papel e destino. As 34 artes aplicadas mantêm exatamente os bytes dos arquivos oficiais no tamanho integral, com variantes WebP de 360 e 720 px para mobile.

## Resultado

- 34 imagens principais associadas a IDs específicos após confronto de nome, descrição, CSV e aparência.
- 5 imagens dependem de confirmação de sabor, variante ou item; 7 alternativas/superadas não foram usadas.
- “Tó Frito” tinha a mesma fotografia de Batata Tradicional. Essa associação foi removida; a prévia mostra o estado de fotografia pendente.
- “Xuxo” não consta entre os 111 produtos atuais nem foi identificado no pacote; confirmar cadastro e fotografia.
- 12 caminhos de imagem compartilhados ainda existem em produtos fora dos 34 vínculos oficiais; ver pendências abaixo.
- O CSV de auditoria anexo registra os 111 produtos, IDs, descrições, URLs anteriores/novas e estado de conferência. Fotografias antigas não cobertas pelo ZIP permanecem sem certificação visual.

## Conferência das 46 artes

| Nº | Arquivo / produto informado | Papel | ID de destino | Imagem anterior → nova | Resultado |
|---:|---|---|---|---|---|
| 01 | Queijo Coalho na Chapa | principal | `beliscar-010` — Queijo Coalho na Chapa | `fase2-beliscar-010.webp` → `cronologica-01-beliscar-010.webp` | Conferida e aplicada |
| 02 | Abará Recheado | principal | `beliscar-009` — Abara Recheado | `fase2-beliscar-009.webp` → `cronologica-02-beliscar-009.webp` | Conferida e aplicada |
| 03 | Batata Frita | principal | `beliscar-006` — Batata Tradicional | `fase2-beliscar-006.webp` → `cronologica-03-beliscar-006.webp` | Conferida e aplicada; Não associar a Tô Frito sem confirmação. |
| 04 | Mini Churros | principal | `sobremesa-089` — MiniChurros | `fase2-sobremesa-089.webp` → `cronologica-04-sobremesa-089.webp` | Conferida e aplicada |
| 05 | Camarão C/Queijo Coalho na Chapa | principal | `oxente-refeicoes-066` — Camarão Filé c/Queijo Coalho | `fase2-oxente-refeicoes-066.webp` → `cronologica-05-oxente-refeicoes-066.webp` | Conferida e aplicada; Primeira foto, mais limpa; a segunda está na posição 35. |
| 06 | Codorna | principal | `do-ar-046` — Codorna | `fase2-do-ar-046.webp` → `cronologica-06-do-ar-046.webp` | Conferida e aplicada; Logo no frasco de pimenta é a exceção solicitada. |
| 07 | Danadinho - Calabresa C/Queijo Coalho | principal | `beliscar-004` — Danadinho | `fase2-beliscar-004.webp` → `cronologica-07-beliscar-004.webp` | Conferida e aplicada; Cadastro Danadinho: calabresa e queijo coalho, não dadinho de tapioca. |
| 08 | Caldo 1 (esse pode ser usado pro de Camarão) | principal | `caldos-034` — Camarão | `caldo-camarao-demo.webp` → `cronologica-08-caldos-034.webp` | Conferida e aplicada; Destino indicado expressamente: Caldo de Camarão. |
| 09 | Pirão Soteropolitano | principal | `pirao-de-aipim-075` — Soteropolitano | `fase2-pirao-de-aipim-075.webp` → `cronologica-09-pirao-de-aipim-075.webp` | Conferida e aplicada |
| 10 | Chapa Nordestina | superada | — | Sem alteração | Primeiro envio; versão com nome/logo rejeitada. Usar 11. |
| 11 | Chapa Nordestina | principal | `tabuas-ou-chapas-093` — Chapa Nordestina | `fase2-tabuas-ou-chapas-093.webp` → `cronologica-11-tabuas-ou-chapas-093.webp` | Conferida e aplicada; Última correção aprovada pelo usuário; sem objetos. |
| 12 | Feijoada | alternativa | — | Sem alteração | Primeira versão, panela de barro. Principal: 46. |
| 13 | Crocrete de Bacalhau | principal | `bolinhos-029` — Crocrete Bacalhau | `fase2-bolinhos-029.webp` → `cronologica-13-bolinhos-029.webp` | Conferida e aplicada; Primeira versão, fundo amadeirado. Segunda: 34. Cadastro pode usar Croquete de Bacalhau. |
| 14 | Coxinha de Frango | principal | `bolinhos-021` — Frango | `bolinho-frango-demo.webp` → `cronologica-14-bolinhos-021.webp` | Conferida e aplicada |
| 15 | Bolinho | alternativa | — | Sem alteração | Primeira edição, fundo escuro. Principal: 33. Não inferir recheio. |
| 16 | Costelinha Suína | principal | `da-terra-053` — Costelinha Suína | `fase2-da-terra-053.webp` → `cronologica-16-da-terra-053.webp` | Conferida e aplicada |
| 17 | Moqueca Camarão | principal | `oxente-refeicoes-067` — Moqueca Camarão | `fase2-oxente-refeicoes-067.webp` → `cronologica-17-oxente-refeicoes-067.webp` | Conferida e aplicada; Destino: Moqueca de Camarão. |
| 18 | Pirão de Aipim - Carne do Sol / Fumeiro | principal | `pirao-de-aipim-071` — Carne de Sol / Fumeiro | `fase2-pirao-de-aipim-071.webp` → `cronologica-18-pirao-de-aipim-071.webp` | Conferida e aplicada; Cliente indicou os dois sabores. Confirmar cadastro de cada um; não usar no de camarão. |
| 19 | Filé de Camarão ao Azeite | principal | `do-mar-060` — Camarão Filé ao Azeite | `fase2-do-mar-060.webp` → `cronologica-19-do-mar-060.webp` | Conferida e aplicada |
| 20 | Pirão de Aipim 1 | confirmar sabor | — | Sem alteração | Sem sabor informado. Não atribuir a uma variante por aparência. |
| 21 | Filé de Camarão Empanado | principal | `do-mar-059` — Filé de Camarão Empanado | `camarao-empanado-demo.webp` → `cronologica-21-do-mar-059.webp` | Conferida e aplicada |
| 22 | Chapa Fi da Égua | principal | `tabuas-ou-chapas-094` — Chapa Fi da Égua | `chapa-churras-demo.webp` → `cronologica-22-tabuas-ou-chapas-094.webp` | Conferida e aplicada; Arte tem placa com nome e cenário original; revisão visual antes de publicar. |
| 23 | Tábua do Mar | principal | `tabuas-ou-chapas-097` — Tábua do Mar | `tabua-mar-demo.webp` → `cronologica-23-tabuas-ou-chapas-097.webp` | Conferida e aplicada; Primeira foto enviada. Placa/pessoas/objetos no cenário; revisão visual antes de publicar. |
| 24 | Tábua do Mar | alternativa | — | Sem alteração | Segunda foto enviada; braço, reflexo e placa. Não confundir com Tábua Sertaneja. |
| 25 | Chapa Churras | principal | `tabuas-ou-chapas-095` — Chapa Churras | `chapa-churras-demo.webp` → `cronologica-25-tabuas-ou-chapas-095.webp` | Conferida e aplicada; Arte tem placa com nome e cenário original; revisão visual antes de publicar. |
| 26 | Pirão de Aipim - Camarão | principal | `pirao-de-aipim-074` — Camarão | `fase2-pirao-de-aipim-074.webp` → `cronologica-26-pirao-de-aipim-074.webp` | Conferida e aplicada; Versão final sem pessoa e sem placa. |
| 27 | Chiquitinho de Carne | superada | — | Sem alteração | Primeiro envio; edição ainda com pessoas. Usar 30. |
| 28 | Coxinha da Asa | principal | `do-ar-050` — Coxinha da Asa | `frango-passarinho-demo.webp` → `cronologica-28-do-ar-050.webp` | Conferida e aplicada; Não confundir com Coxinha de Frango. |
| 29 | Sarapatel | principal | `oxente-refeicoes-062` — Sarapatel | `fase2-oxente-refeicoes-062.webp` → `cronologica-29-oxente-refeicoes-062.webp` | Conferida e aplicada |
| 30 | Chiquitinho de Carne | principal | `beliscar-005` — Chiquitinho de Carne | `fase2-beliscar-005.webp` → `cronologica-30-beliscar-005.webp` | Conferida e aplicada; Segundo envio; versão corrigida sem pessoas. |
| 31 | Arrumadinho | principal | `beliscar-011` — Arrumadinho | `arrumadinho-demo.webp` → `cronologica-31-beliscar-011.webp` | Conferida e aplicada; Versão sem pessoa, mas alterou ingredientes visíveis. Validar fidelidade antes de publicar. |
| 32 | Dadinho de Tapioca | principal | `beliscar-008` — Dadinho de Tapioca | `fase2-beliscar-008.webp` → `cronologica-32-beliscar-008.webp` | Conferida e aplicada; Não confundir com Danadinho. |
| 33 | Bolinho | principal | — | Sem alteração | Segundo envio, edição correspondente. Sem recheio identificado; não atribuir a sabores específicos. |
| 34 | Crocrete de Bacalhau | alternativa | — | Sem alteração | Segundo envio; edição com croquete aberto. Principal: 13. |
| 35 | Camarão C/Queijo Coalho na Chapa | alternativa | — | Sem alteração | Segundo envio, com acompanhamentos e marcas ao fundo. Principal: 05. |
| 36 | Caldo 1.2. | confirmar sabor | — | Sem alteração | Rótulo enviado não identifica os sabores. Não substituir Caldo de Camarão nem outros caldos por dedução. |
| 37 | Pastelzinho 1.2.3. | principal | — | Sem alteração | Versão sem frase. Vincular somente ao item/grupo correspondente; se forem três sabores separados, confirmar associação antes de aplicar. |
| 38 | To Evoluído | principal | `beliscar-001` — Tó Evoluído | `chapa-churras-demo.webp` → `cronologica-38-beliscar-001.webp` | Conferida e aplicada; Destino: Tô Evoluído (rolinhos empanados e três molhos), jamais a chapa de carne. Material impresso ao fundo. |
| 39 | moqueca | principal | — | Sem alteração | Usar apenas no cadastro genérico Moqueca, se existir; se só houver sabores, confirmar qual. Braço ao fundo. |
| 40 | Casal Raiz | principal | `beliscar-003` — Casal Raiz | `arrumadinho-demo.webp` → `cronologica-40-beliscar-003.webp` | Conferida e aplicada; Cestinhas recheadas da foto enviada, com taça. Não é arrumadinho. Fundo de juta e taça ainda visíveis. |
| 41 | Camarão Encapotado | principal | `bolinhos-030` — Camarão Encapotado | `bolinho-camarao-demo.webp` → `cronologica-41-bolinhos-030.webp` | Conferida e aplicada; Empanado mais dourado do que no original; validar fidelidade. |
| 42 | Bobó de Camarão | principal | `oxente-refeicoes-070` — Bobó de Camarão | `fase2-oxente-refeicoes-070.webp` → `cronologica-42-oxente-refeicoes-070.webp` | Conferida e aplicada |
| 43 | Picanha Acebolada na Chapa | principal | `oxente-refeicoes-064` — Picanha Acebolada | `fase2-oxente-refeicoes-064.webp` → `cronologica-43-oxente-refeicoes-064.webp` | Conferida e aplicada |
| 44 | Tábua Sertaneja | principal | `tabuas-ou-chapas-096` — Tábua Sertaneja | `fase2-tabuas-ou-chapas-096.webp` → `cronologica-44-tabuas-ou-chapas-096.webp` | Conferida e aplicada; Não confundir com Tábua do Mar. |
| 45 | Carne do Sol C/Queijo Coalho | principal | `oxente-refeicoes-065` — Carne do Sol c/Queijo Coalho | `picanha-acebolada-demo.webp` → `cronologica-45-oxente-refeicoes-065.webp` | Conferida e aplicada; A edição alterou apresentação do queijo e carne; validar fidelidade antes de publicar. |
| 46 | Feijoada | principal | `oxente-refeicoes-061` — Feijoada | `fase2-oxente-refeicoes-061.webp` → `cronologica-46-oxente-refeicoes-061.webp` | Conferida e aplicada; Última foto enviada, travessa oval. Alternativa: 12. |

## Pendências para validação

- **Sabores/variantes:** 20 (pirão não identificado), 33 (bolinho sem recheio identificado), 36 (caldo sem sabor), 37 (Pastelzinho 1.2.3 sem vínculo inequívoco com A/B/Mix) e 39 (Moqueca genérica sem item genérico no catálogo). Nenhuma foi atribuída por suposição.
- **Versões excluídas:** 10 e 27 superadas; 12, 15, 24, 34 e 35 alternativas. A principal 23 foi usada para Tábua do Mar, 44 para Tábua Sertaneja.
- **Estética das artes oficiais:** validar 22 e 25 (placas), 23 (placa/pessoas/objetos), 31 (ingredientes visíveis alterados), 38 (material impresso), 40 (juta/taça), 41 (cor do empanado) e 45 (apresentação da carne/queijo). Essas diferenças foram preservadas, não retocadas.
- **Cobertura completa:** fotografias dos demais produtos são anteriores ao pacote oficial e exigem confirmação individual do cliente para afirmar fidelidade. Há associações compartilhadas que podem ser incorretas; não inventamos destino nem imagem substituta.
- **Tó Frito e Xuxo:** enviar fotografia correta e esclarecer cadastro de Xuxo antes de dar a auditoria visual integral como concluída.

## Imagens antigas ainda compartilhadas

Estes vínculos não foram atribuídos pelo ZIP cronológico. O mesmo arquivo aparece em produtos diferentes; a fidelidade precisa de confirmação individual. Exemplos visivelmente divergentes incluem Chapa La Ele com imagem genérica de Chapa Churras e Moqueca Mista com a imagem de camarão.

| Arquivo anterior | Produtos que compartilham o arquivo |
|---|---|
| `bolinho-charque-demo.webp` | `bolinhos-023` Charque c/Queijo, `bolinhos-025` Carne do Sol c/Coalho |
| `bolinhos-queijos-demo.webp` | `bolinhos-019` Queijos, `bolinhos-028` Kibe Queijo |
| `espetinho-carne-demo.webp` | `espetinhos-036` Carne, `espetinhos-037` Cupim, `espetinhos-038` Carne do Sol, `espetinhos-039` Picanha, `espetinhos-044` Medalhão de Filé, `espetinhos-045` Carne do Sol c/Queijo Coalho |
| `espetinho-frango-demo.webp` | `espetinhos-035` Frango, `espetinhos-042` Carne + Frango, `espetinhos-043` Medalhão Frango |
| `frango-passarinho-demo.webp` | `do-ar-048` Isca de Frango, `do-ar-049` Frango à Passarinho, `oxente-kids-078` Filezinho Frango |
| `pastelzinho-a-demo.webp` | `pastelzinho-016` Pastelzinho (A), `beliscar-014` Pastel Nordestino |
| `pastelzinho-b-demo.webp` | `pastelzinho-017` Pastelzinho (B), `beliscar-012` Pastel de Camarão, `beliscar-013` Pastel de Camarão c/Catupiry |
| `pastelzinho-mix-demo.webp` | `pastelzinho-018` Pastelzinho Mix, `beliscar-015` Pastel de Frango c/Queijo |
| `picanha-acebolada-demo.webp` | `da-terra-051` Filezinho Molho Madeira, `da-terra-052` Carne do Sol / Fumeiro, `da-terra-054` Picanha Aperitiva, `oxente-kids-079` Filezinho Carne |
| `pirao-aipim-demo.webp` | `porcoes-085` Pirão Aipim, `pirao-de-aipim-076` Misto (2 Sabores) |
| `pirao-carne-demo.webp` | `pirao-de-aipim-072` Cupim ao Molho, `pirao-de-aipim-073` Picanha |
| `queijo-coalho-chapa-demo.webp` | `espetinhos-041` Queijo Coalho, `porcoes-086` Adicional Queijo Coalho |

## Validação técnica

- Backup prévio: `tmp/backups/cronologica-before-2026-11-26.zip` (catálogo de imagens e arquivos afetados).
- `npm run build:vercel`: aprovado.
- `node scripts/refinement-audit.mjs`: 16 categorias, 111 produtos, 0 arquivos/variantes ausentes, 0 preços inválidos, 1 fotografia pendente intencional.
- `npm run test:responsive`: 34 verificações de viewport, zero rolagem horizontal e zero erros de JavaScript/requisições locais. As 16 categorias foram capturadas a 390 px; categorias prioritárias também inspecionadas em 320, 360 e 430 px.
- PWA: Service Worker versionado em `oxente-visual-60`; recursos de fotos antigas não são referenciados, e o teste de navegação offline passou.
- Imagens integrais comparadas byte a byte com o ZIP; variantes responsivas existentes para cada nova imagem.
- Peso combinado das 34 artes: 14,59 MiB no tamanho integral; variantes mobile 360 px: 1,02 MiB; variantes 720 px: 3,57 MiB. O navegador carrega somente as imagens necessárias para a visualização.
- O painel administrativo, o banco de dados e as integrações não foram modificados. Um eventual upload de foto pelo painel continua tendo precedência sobre o arquivo local; o teste leu o catálogo Supabase sem URLs de foto remotas.

## Capturas mobile (390 px)

- Beliscar: `tmp/revisao-cronologica/mobile/cronologica-beliscar-390.png`
- Pastelzinho: `tmp/revisao-cronologica/mobile/cronologica-pastelzinho-390.png`
- Bolinhos: `tmp/revisao-cronologica/mobile/cronologica-bolinhos-390.png`
- Caldos: `tmp/revisao-cronologica/mobile/cronologica-caldos-390.png`
- Espetinhos: `tmp/revisao-cronologica/mobile/cronologica-espetinhos-390.png`
- Do Ar: `tmp/revisao-cronologica/mobile/cronologica-do-ar-390.png`
- Da Terra: `tmp/revisao-cronologica/mobile/cronologica-da-terra-390.png`
- Do Mar: `tmp/revisao-cronologica/mobile/cronologica-do-mar-390.png`
- Oxente Refeições: `tmp/revisao-cronologica/mobile/cronologica-oxente-refeicoes-390.png`
- Pirão de Aipim: `tmp/revisao-cronologica/mobile/cronologica-pirao-de-aipim-390.png`
- Oxente Kids: `tmp/revisao-cronologica/mobile/cronologica-oxente-kids-390.png`
- Porções: `tmp/revisao-cronologica/mobile/cronologica-porcoes-390.png`
- Sobremesa: `tmp/revisao-cronologica/mobile/cronologica-sobremesa-390.png`
- Tábuas ou Chapas: `tmp/revisao-cronologica/mobile/cronologica-tabuas-ou-chapas-390.png`
- Cervejas: `tmp/revisao-cronologica/mobile/cronologica-cervejas-390.png`
- Refrigerantes: `tmp/revisao-cronologica/mobile/cronologica-refrigerantes-390.png`

Nenhuma mudança foi enviada ao GitHub ou Vercel nesta etapa.
