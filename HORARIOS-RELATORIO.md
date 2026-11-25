# Horários de funcionamento — implementação local

Data: 25/11/2026. Nenhuma migração foi aplicada ao Supabase nesta etapa e nenhuma versão foi publicada em produção.

## Horários preparados

Fuso `America/Bahia`: segunda fechada; terça e quarta 16h–22h; quinta 16h–23h; sexta 15h–00h; sábado 12h–00h; domingo 12h–22h. O fim `00:00` é tratado como meia-noite do dia seguinte. As mesmas regras foram colocadas nos dados iniciais locais, no seed e na migração do Oxente.

## Componente e painel

- A home exibe `ABERTO AGORA`, `FECHADO AGORA`, `ABRIMOS EM BREVE` ou `ENCERRANDO EM BREVE`, com cores próprias. Os estados “em breve” usam o limite inclusivo de 30 minutos. A mensagem complementar é calculada a partir do intervalo ou do ajuste ativo.
- O horário do servidor retornado pela RPC `opening_hours_clock` é a âncora do relógio. O cliente revalida a cada minuto, quando volta ao primeiro plano e quando recebe um evento Supabase Realtime. Se a confirmação expira ou falha, mostra “HORÁRIO TEMPORARIAMENTE INDISPONÍVEL”. O cache offline não é usado para afirmar que a casa está aberta.
- O painel “Horário de Funcionamento” edita a semana, abertura e fechamento manual com validade, feriados e datas especiais. Uma data especial substitui o dia semanal, permitindo extensão ou encerramento antecipado. O painel salva apenas a tabela de horários pela RPC `save_opening_hours`, com verificação de administrador no banco. A migração protege os horários contra sobrescrita pelo salvamento legado do catálogo e cria um ponto de restauração privado da configuração anterior.
- A frase principal da home é “Barzinho do jeito que você gosta!”, com destaque dourado em “você gosta!”. A frase secundária obrigatória foi mantida. Conforme o pedido mais recente, a chamada “Delícias do Oxente” foi retirada do card; o título “CARDÁPIO DIGITAL” permanece.

## Verificações executadas

- `npm run check`: sintaxe dos módulos JavaScript, incluindo o motor de horários e o painel.
- `npm run test:hours`: 28 cenários passaram. Abrangem os sete dias, segunda fechada, limites de 30 minutos, abertura e fechamento exatos, sexta e sábado à meia-noite, feriado, extensão, encerramento antecipado, ajuste manual e expiração.
- `npm run test:hours-sync`: passou com Supabase simulado. Verificou a âncora do relógio do servidor, atualização por evento Realtime, RPC exclusiva de horários, bloqueio de gravação sem administrador e estado indisponível após falha da confirmação.
- `npm run test:admin-hours`: passou. Verificou os sete dias, fuso, feriado fechado, intervalo até meia-noite e exigência de validade futura para ajustes manuais.
- A home local foi inspecionada visualmente em uma janela de aproximadamente 500 px após a alteração de textos e indicador. Ela ainda recebeu do Supabase o horário antigo de 18h, confirmando que a migração não foi aplicada. A última auditoria completa de viewport anterior à mudança de horários passou em 34 combinações, sem rolagem horizontal e com os quatro botões sociais uniformes. A repetição visual após a mudança foi recusada pela revisão automática por limite de uso; por isso, essa inspeção não substitui a validação final nas resoluções exigidas.

## Pendências antes da publicação

1. Aplicar `supabase/migrations/202611250001_oxente_hours.sql` no projeto autorizado, com acesso administrativo ao banco. A migração altera apenas `opening_hours`, cria as duas RPCs de horários e habilita Realtime nessa tabela.
2. Confirmar por leitura pública a programação oficial gravada, o relógio da RPC e a propagação Realtime com duas sessões. Testar uma gravação temporária pelo painel com conta autorizada e restaurar o automático.
3. Capturar e revisar a home atual em 320, 390, 998 e 1920 px, incluindo segunda-feira, avisos longos e os quatro tons do indicador, assim que a verificação de navegador estiver disponível.

Até essas etapas serem concluídas, o Supabase atual ainda pode retornar a programação antiga e a RPC nova pode não existir. O componente mostra indisponibilidade quando não obtém horário confiável. A versão local não deve ser apresentada como publicada.
