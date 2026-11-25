# Oxente Bar e Petiscaria

Cardápio digital responsivo e PWA do Oxente Bar e Petiscaria.

## Prévia local

1. Instale as dependências com `npm install`.
2. Copie `.env.example` para `.env` e configure o projeto Supabase, a chave pública (`anon` ou `publishable`) e o identificador do estabelecimento.
3. Execute `npm run dev` e abra `http://127.0.0.1:4174/`.

O servidor gera `data/runtime-config.js` a partir dessas variáveis. Esse arquivo contém somente a configuração pública necessária ao navegador. A chave de serviço do Supabase e credenciais administrativas não devem ser adicionadas ao repositório.

## Verificação

- `npm run check` — sintaxe dos módulos JavaScript.
- `npm run test:hours`, `npm run test:hours-sync` e `npm run test:admin-hours` — regras de funcionamento, sincronização simulada e validação do painel.
- `npm run test:responsive` — navegação, interações, PWA e visualização em diferentes larguras; requer o servidor local em execução.

O gerenciamento remoto de horários requer a migração `supabase/migrations/202611250001_oxente_hours.sql`, aplicada no projeto Supabase autorizado. O [relatório de horários](HORARIOS-RELATORIO.md) registra os testes locais e os passos ainda pendentes antes da publicação.

As imagens ilustrativas não substituem fotografias oficiais dos produtos e do salão. Preços, disponibilidade e horários são fornecidos pelo banco de dados quando há conexão.
