## Geração automática de imagens de produtos (AI)

Este projeto inclui um script para gerar imagens de produtos que ainda não possuem imagens, criar derivados em múltiplos formatos e resoluções, enviar para o Supabase Storage (como CDN) e atualizar a coluna `products.images`.

Por padrão, a geração é feita localmente via Stable Diffusion WebUI (Automatic1111) em `http://127.0.0.1:7860`, ou seja, sem depender de um serviço externo.

### Pré-requisitos

- Supabase Storage: bucket `product-images` (ou ajuste com `--bucket=...`)
- Stable Diffusion WebUI rodando localmente com a API habilitada (`--api`)
- Variáveis de ambiente (copie `.env.example` e preencha)
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SD_WEBUI_URL` (opcional; padrão `http://127.0.0.1:7860`)

### Gerar pelo painel (admin)

Além do script por lote, o painel admin permite gerar imagens via IA e já fazer upload no bucket `product-images`:

- Em `/admin/products`, use o botão **Gerar imagens IA** (gera para itens sem imagem na lista).
- Em `/admin/products/:id`, use o botão **Gerar IA** na seção **Imagens** (gera e adiciona no formulário).

Configuração (frontend):

- `VITE_SD_WEBUI_URL` (padrão `http://127.0.0.1:7860`)
- `VITE_SD_WEBUI_WIDTH`, `VITE_SD_WEBUI_HEIGHT` (padrão `768`)

Observação: se a loja estiver publicada em HTTPS, o navegador pode bloquear chamadas para `http://127.0.0.1`. Para uso remoto, rode o admin localmente ou exponha o SD WebUI via HTTPS/reverse-proxy com CORS adequado.

### Executar manualmente

```bash
npm run images:ai -- --limit=20 --concurrency=2
```

Opções úteis:

```bash
npm run images:ai -- --dryRun=true
npm run images:ai -- --limit=50 --pageSize=200 --concurrency=2
npm run images:ai -- --provider=mock --limit=3
npm run images:ai -- --provider=sd-webui --limit=10 --concurrency=1
```

### Cron (exemplo)

Exemplo de `crontab` (Linux) rodando todo dia às 03:10:

```bash
10 3 * * * cd /caminho/do/projeto && /usr/bin/npm run images:ai -- --limit=50 --concurrency=2 >> logs/cron-ai-images.log 2>&1
```

### Saídas e logs

- As imagens são enviadas para o bucket com a chave:
  - `public/products/<productId>/<slug>/thumb-150x150.(jpeg|png|webp)`
  - `public/products/<productId>/<slug>/medium-500x500.(jpeg|png|webp)`
  - `public/products/<productId>/<slug>/large-1000x1000.(jpeg|png|webp)`
- Um log JSONL é gravado em `logs/ai-images-*.jsonl` (um arquivo por execução).
