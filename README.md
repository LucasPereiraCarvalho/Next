# Estudos Next.js 🚀

Guia rápido dos projetos e conceitos estudados em cada pasta.

---

## 📂 Projetos

### 1. [`/app-router-next`](./app-router-next)
> **Foco:** Fundamentos e recursos do **App Router** (Next.js 13+ / 15).

- **File System Routing:** Estrutura de rotas por pastas, `page.tsx`, `layout.tsx`, rotas dinâmicas (`[id]`) com `params` assíncronos e Route Groups (`{site}`).
- **Server vs Client Components:** Padrão Server Component, diretiva `"use client"` e composição entre eles.
- **Data Fetching e Cache:** `fetch` com `force-cache` (SSG), `no-store` (SSR) e `revalidate` (ISR).
- **UI Especial:** `loading.tsx` com React Suspense, `not-found.tsx` e `error.tsx`.
- **Otimizações:** `<Image />` (Next Image), `next/font` e API de `Metadata` (SEO e Open Graph).

---

### 2. [`/api-routes-next`](./api-routes-next)
> **Foco:** Criação de endpoints HTTP e APIs REST com **Route Handlers** no App Router.

- **Route Handlers (`route.ts`):** Métodos HTTP (`GET`, `POST`, `PUT`, `DELETE`).
- **Respostas:** Uso de `NextResponse.json()` com status HTTP.
- **Parâmetros e Payload:** Leitura de query params via `new URL(request.url)` e corpo da requisição com `request.json()`.
- **Exemplo Prático:** CRUD simples de tarefas em memória.

---

### 3. [`/tarefas-app-next`](./tarefas-app-next)
> **Foco:** Aplicação completa usando **Pages Router**, autenticação e banco de dados em tempo real.

- **Estratégias de Renderização:**
  - **SSG / ISR:** `getStaticProps` com `revalidate` na página inicial.
  - **SSR:** `getServerSideProps` para proteção de rotas no servidor e rotas dinâmicas (`task/[id].tsx`).
  - **CSR:** `useEffect` com listeners em tempo real (`onSnapshot`).
- **Autenticação:** NextAuth.js com login Google e Catch-all Routes (`[...nextauth].js`).
- **Banco de Dados:** Firebase Firestore (CRUD e tempo real).
