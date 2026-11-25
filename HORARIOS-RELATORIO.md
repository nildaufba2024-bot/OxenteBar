# Horários de funcionamento — implantação e validação

Data: 25/11/2026. A migração de horários foi aplicada no Supabase OXENTEBAR de produção após autorização explícita do cliente. O site frontend não foi publicado em hospedagem de produção.

## Horários preparados

Fuso `America/Bahia`: segunda fechada; terça e quarta 16h–22h; quinta 16h–23h; sexta 15h–00h; sábado 12h–00h; domingo 12h–22h. O fim `00:00` é tratado como meia-noite do dia seguinte. As mesmas regras foram colocadas nos dados iniciais locais, no seed e na migração do Oxente.

## Componente e painel

- A home exibe `ABERTO AGORA`, `FECHADO AGORA`, `ABRIMOS EM BREVE` ou `ENCERRANDO EM BREVE`, com cores próprias. Os estados “em breve” usam o limite inclusivo de 30 minutos. A mensagem complementar é calculada a partir do intervalo ou do ajuste ativo.
- O horário do servidor retornado pela RPC `opening_hours_clock` é a âncora do relógio. O cliente revalida a cada minuto, quando volta ao primeiro plano e quando recebe um evento Supabase Realtime. Se a confirmação expira, falha ou ainda traz a configuração antiga em `America/Sao_Paulo`, mostra “HORÁRIO TEMPORARIAMENTE INDISPONÍVEL”. O cache offline não é usado para afirmar que a casa está aberta.
- O painel “Horário de Funcionamento” edita a semana, abertura e fechamento manual com validade, feriados e datas especiais. Uma data especial substitui o dia semanal, permitindo extensão ou encerramento antecipado. O painel salva apenas a tabela de horários pela RPC `save_opening_hours`, com verificação de administrador no banco. A migração protege os horários contra sobrescrita pelo salvamento legado do catálogo e cria um ponto de restauração privado da configuração anterior.
- A frase principal da home é “Barzinho do jeito que você gosta!”, com destaque dourado em “você gosta!”. A frase secundária obrigatória foi mantida. Conforme o pedido mais recente, a chamada “Delícias do Oxente” foi retirada do card; o título “CARDÁPIO DIGITAL” permanece.

## Verificações executadas

- `npm run check`: sintaxe dos módulos JavaScript, incluindo o motor de horários e o painel.
- `npm run test:hours`: 28 cenários passaram. Abrangem os sete dias, segunda fechada, limites de 30 minutos, abertura e fechamento exatos, sexta e sábado à meia-noite, feriado, extensão, encerramento antecipado, ajuste manual e expiração.
- `npm run test:hours-sync`: passou com Supabase simulado. Verificou a âncora do relógio do servidor, atualização por evento Realtime, RPC exclusiva de horários, bloqueio de gravação sem administrador e estado indisponível após falha da confirmação.
- `npm run test:admin-hours`: passou. Verificou os sete dias, fuso, feriado fechado, intervalo até meia-noite e exigência de validade futura para ajustes manuais.
- A leitura inicial do Supabase confirmou a configuração antiga: `America/Sao_Paulo`, abertura às 18h nos dias abertos e fechamento à meia-noite. Após autorização explícita, a migração retornou `Success. No rows returned`. A leitura da RPC `opening_hours_clock` confirmou os sete dias corretos, `America/Bahia`, `manual: auto`, `serverNow` e `updatedAt`.
- A consulta de proteção retornou `backup_rls = true`, `backup_rows = 1` e `realtime_enabled = true`.
- A home local foi recarregada com o servidor ativo. A leitura visual e do DOM confirmou `FECHADO AGORA`, `Abrimos hoje às 16h00`, as duas frases aprovadas e o card sem a chamada “Delícias do Oxente”. A última auditoria completa de viewport anterior à mudança de horários passou em 34 combinações, sem rolagem horizontal e com os quatro botões sociais uniformes. A repetição visual completa após a mudança ainda não foi executada.

## Pendências antes de publicar o frontend

1. Validar uma gravação temporária pelo painel com conta administrativa e restaurar o automático. A assinatura Realtime e o fluxo de gravação foram testados com Supabase simulado; a propagação entre duas sessões reais ainda não foi observada.
2. Capturar e revisar a home atual em 320, 390, 998 e 1920 px, incluindo avisos longos e os quatro tons do indicador.

O banco agora retorna a programação oficial. A prévia local em `http://127.0.0.1:4174/` foi verificada com a abertura correta de quarta-feira às 16h00. A versão do frontend ainda não foi publicada na hospedagem de produção.
