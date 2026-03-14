# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## Segurança

### Checks automatizados

- Segredos (Secretlint):
  - Config: [.secretlintrc.json](file:///c:/Users/Vinicius%20Bassini/Downloads/foca-no-cell-helper-main/.secretlintrc.json), [.secretlintignore](file:///c:/Users/Vinicius%20Bassini/Downloads/foca-no-cell-helper-main/.secretlintignore)
  - Execução: `npm run security:secrets`
- CSP/headers (CSP Evaluator + validação mínima):
  - Script: [security-check.mjs](file:///c:/Users/Vinicius%20Bassini/Downloads/foca-no-cell-helper-main/scripts/security-check.mjs)
  - Fonte: [vercel.json](file:///c:/Users/Vinicius%20Bassini/Downloads/foca-no-cell-helper-main/vercel.json)
  - Execução: `npm run security:csp`
- Vulnerabilidades em dependências (produção):
  - Execução: `npm run security:audit`
- Consolidação:
  - Execução: `npm run security:check`

### Mitigação de injeção CSS (Charts)

- Implementação: [chart.tsx](file:///c:/Users/Vinicius%20Bassini/Downloads/foca-no-cell-helper-main/src/components/ui/chart.tsx)
  - Sanitização de `color/theme` antes de inserir em `style`/CSS variables.
  - Bloqueio de quebras de contexto (`</style>`, quebras de linha, NUL, etc.) e restrição a formatos esperados.
- Testes: [chart.security.test.tsx](file:///c:/Users/Vinicius%20Bassini/Downloads/foca-no-cell-helper-main/src/components/ui/chart.security.test.tsx)

### Rotas (React Router)

- O fallback SPA no Vercel mantém rotas client-side funcionais: [vercel.json](file:///c:/Users/Vinicius%20Bassini/Downloads/foca-no-cell-helper-main/vercel.json)
- Teste de integração de rotas e 404: [App.router.test.tsx](file:///c:/Users/Vinicius%20Bassini/Downloads/foca-no-cell-helper-main/src/App.router.test.tsx)

### Checklist de revisão manual (base OWASP Top 10)

- A01 Broken Access Control: app é SPA estática; não expor rotas/admin sem autenticação.
- A02 Cryptographic Failures: todo tráfego em HTTPS via Vercel; HSTS habilitado em headers.
- A03 Injection: sanitização de valores CSS e ausência de construção de HTML a partir de input não confiável.
- A04 Insecure Design: CSP/headers defensivos e redução de superfícies (object-src none, frame-ancestors none).
- A05 Security Misconfiguration: checks automatizados de CSP, secrets e dependências; build reproduzível em CI.
- A06 Vulnerable/Outdated Components: `npm run security:audit` bloqueia vulnerabilidades altas em prod.
- A07 Identification and Authentication Failures: não aplicável no estado atual (sem auth).
- A08 Software and Data Integrity Failures: dependências travadas por lockfile; CI usa `npm ci`.
- A09 Logging and Monitoring Failures: evitar logs sensíveis no client; manter logs somente para erro real.
- A10 SSRF: não aplicável (sem backend).

### CI/CD e simulação de deploy (staging/preview)

- Pipeline: [.github/workflows/ci.yml](file:///c:/Users/Vinicius%20Bassini/Downloads/foca-no-cell-helper-main/.github/workflows/ci.yml)
  - Executa lint + testes + build + checks de segurança via `npm run ci`.
  - Simulação de deploy no Vercel (Preview) roda somente se secrets estiverem configurados:
    - `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
  - O job faz `vercel pull`, `vercel build` e `vercel deploy --prebuilt` para validar o fluxo de staging.
