# Bruno Diniz — Site Institucional Imobiliário & CRM Privado

Site institucional de alto padrão para **Bruno Diniz — Corretor de Imóveis (CRECI-PE 21512)**, especialista em imóveis de **Litoral, Médio e Alto Padrão** em Pernambuco.

> *"Uma marca à altura de uma trajetória."*

## Arquitetura do Projeto

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion (`motion/react`), Lucide Icons.
- **Backend / Servidor**: Express (`server.ts`) servindo API proxy segura para **Vercel Blob** (`/api/blob/upload`), `/sitemap.xml` e `/robots.txt`.
- **Banco de Dados e Autenticação**: Firebase Firestore (instância dedicada e isolada em `firebase-applet-config.json`) + Firebase Authentication + Regras de Segurança (`firestore.rules`).

## Rotas Principais

### Site Público
- `/` — Home institucional (Hero, Busca Rápida, Imóveis em Destaque, Empreendimentos, Pilares, Sobre Bruno Diniz, Landing Page Especial, Captura de Leads).
- `/comprar`, `/litoral`, `/alto-padrao` — Catálogo com filtros completos conectados ao Firestore.
- `/imovel/:slug` — Página individual compartilhável do imóvel com aviso de confirmação de dados e agendamento de visita.
- `/empreendimentos` e `/empreendimento/:slug` — Catálogo e página individual de empreendimentos.
- `/lp/:slug` — Landing Page Premium exclusiva gerenciada pelo painel.
- `/sobre` e `/contato` — Página institucional, registro profissional e formulário com conformidade LGPD.

### Área Privada (Admin & CRM)
- `/admin` — Acesso protegido por Firebase Authentication:
  - **CRM Avançado**: Pipeline Kanban (9 etapas), Leads com scoring automático (`quente`/`morno`/`frio`) e UTMs, Fichas de Clientes com histórico de interações, Agenda de Visitas, Tarefas/Follow-ups, Propostas com upload de documentos e Analytics de conversão.
  - **Gestão de Conteúdo (CMS)**: CRUD completo de Imóveis, Empreendimentos, 1 Landing Page Premium exclusiva, Biblioteca de Mídia (Vercel Blob), Configurações Visuais/SEO/GA4/GTM e Perfil Profissional.

## Configuração e Primeiro Acesso Administrativo

1. **Variáveis de Ambiente** (`.env` ou painel da Vercel):
   - `BLOB_READ_WRITE_TOKEN` (opcional para uploads no Vercel Blob)
   - `APP_URL` (URL pública do projeto para `sitemap.xml`)
2. **Autenticação no Painel (`/admin`)**:
   - **Login Google**: Funciona imediatamente para o proprietário do projeto Firebase.
   - **Login `admin@x.com` / senha `admin4321`**: Habilite o provedor **E-mail/Senha** em *Firebase Console → Authentication → Sign-in method*. Ao acessar `/admin` pela primeira vez com `admin@x.com` / `admin4321`, o cadastro é criado automaticamente e o UID pode ser autorizado em *Configurações & SEO → Administradores Autorizados*.

## Scripts

```bash
npm install
npm run dev      # Executa servidor Express + Vite na porta 3000
npm run lint     # Verificação TypeScript
npm run build    # Gera bundle de produção em dist/
npm run start    # Executa servidor em produção
```
