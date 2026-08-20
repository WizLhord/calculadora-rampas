# EngTools

Calculadoras técnicas, parâmetros normativos e índice de normas para
engenharia civil. Funciona offline depois da primeira visita (PWA).

## Estrutura

```
index.html              shell da aplicação (3 módulos)
css/styles.css           todo o visual
js/
  calc.js                 funções puras de cálculo (sem DOM — testáveis)
  data.js                  tabelas de referência e índice de normas
  search.js                normalização de busca (ignora acento/caixa)
  store.js                 localStorage: tema, favoritos, histórico, quantitativos
  ui.js                     liga o DOM às funções de calc.js
  quantitativos.js          tabela de quantitativos (estilo planilha) + CSV
  app.js                    ponto de entrada, registra o service worker
manifest.webmanifest      metadados do PWA (nome, ícone, cores)
sw.js                     service worker — cache do app shell p/ uso offline
icons/                    ícones do PWA (192px e 512px)
tests/calc.test.mjs       testes das funções de cálculo (Node, sem dependências)
```

## Rodar localmente

Os módulos usam `import`/`export` nativos do navegador, então **precisam
ser servidos por http** — abrir `index.html` direto (`file://`) não
funciona por causa da política de CORS de módulos ES. Qualquer servidor
estático resolve:

```bash
# opção 1 — Python (já vem em quase todo sistema)
python3 -m http.server 8080

# opção 2 — Node
npx serve .
```

Depois acesse `http://localhost:8080` (ou a porta indicada).

Para publicar de verdade, basta subir a pasta inteira para qualquer
hospedagem estática (GitHub Pages, Netlify, Vercel, Cloudflare Pages,
um S3/bucket com hosting estático, etc.) — não há backend.

## Instalar como app (PWA)

Com o site servido por HTTPS (ou `localhost`), o navegador oferece
"Instalar app" / "Adicionar à tela inicial". Depois de instalado uma
vez, ele funciona sem internet — o service worker (`sw.js`) guarda uma
cópia local de todos os arquivos.

## Rodar os testes

```bash
node tests/calc.test.mjs
```

Não precisa de `npm install` — são só `assert` do próprio Node contra
as funções de `js/calc.js`.

## Por que JavaScript puro (sem TypeScript/framework)?

Ver a resposta que acompanha esta entrega. Resumo: TypeScript e
frameworks como Vue precisam de um passo de build (bundler), que exige
`npm install` com acesso à internet — indisponível no ambiente onde
este projeto foi gerado. A estrutura em módulos ES nativos entrega a
mesma separação de responsabilidades (dados / cálculo / interface)
sem depender de build. Se quiser migrar para TypeScript depois, `calc.js`
já está pronto para isso: é só trocar a extensão, ativar o `tsc` e
copiar os tipos que já estão documentados em JSDoc.
