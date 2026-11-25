# Hospedagem do Oxente na Vercel

O repositório está preparado como site estático. `vercel.json` define o comando `npm run build:vercel`, a saída `dist/`, as rotas `/cardapio/` e `/admin/`, e os cabeçalhos do PWA. Não use o servidor local `scripts/serve.mjs` como processo de produção.

## Importar o repositório

1. Na Vercel, importe `nildaufba2024-bot/OxenteBar` do GitHub.
2. Escolha a raiz do repositório (`.`) e o preset **Other**. O build e a pasta de saída já estão definidos em `vercel.json`; não substitua esses valores no painel.
3. A configuração pública do Supabase já está no arquivo `data/runtime-config.js` do repositório. Para usar outro projeto Supabase, configure **juntas** as variáveis `SUPABASE_URL`, `SUPABASE_ANON_KEY` (chave `publishable` ou `anon`) e `ESTABLISHMENT_ID` nos ambientes da Vercel. O build valida as três e gera a configuração pública correspondente em `dist/data/runtime-config.js`.
4. Não configure uma chave `service_role` no navegador ou nas variáveis acima. O painel usa Supabase Auth e as permissões do banco.
5. Depois de obter o domínio, inclua `https://SEU-DOMINIO/admin/` nas URLs de redirecionamento permitidas do Supabase Auth para recuperação de senha.

## Conferir uma implantação

- `/` abre a página inicial; `/cardapio/` abre o cardápio; `/admin/` abre a tela de login.
- `/manifest.webmanifest` e `/sw.js` respondem; o Service Worker controla a página após atualização.
- Produtos, preços e horários carregam do Supabase. Quando não for possível confirmar dados atualizados, o cardápio informa a indisponibilidade em vez de tratar o cache como fonte oficial.
- No celular, a barra inferior aparece abaixo da área rolável. Teste também a instalação e a reabertura do PWA em um aparelho real.

Para verificar o pacote antes de importar, execute `npm run build:vercel`. O diretório `dist/` contém apenas as páginas, scripts de navegador, imagens, ícones e bibliotecas públicas necessários. `.env`, migrações SQL, scripts de desenvolvimento e documentação não entram nesse pacote.

O arquivo `vercel.json` não cria por si só um projeto na conta Vercel e não faz deploy. A importação do GitHub e a publicação ficam sob controle do proprietário da conta.
