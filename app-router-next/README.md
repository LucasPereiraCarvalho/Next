# app-router-next

Projeto de estudos com **Next.js App Router**. Cada conceito abaixo foi aplicado diretamente neste repositório — os exemplos de código são os arquivos reais do projeto.

---

## Como rodar

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

---

## Estrutura de pastas

```
src/
├── app/
│   ├── layout.tsx              # Layout raiz (envolve todas as páginas)
│   ├── page.tsx                # Página: /
│   ├── loading.tsx             # Tela de carregamento automática
│   ├── contatos/
│   │   └── page.tsx            # Página: /contatos
│   ├── repositorios/
│   │   └── page.tsx            # Página: /repositorios  ← Client Component
│   └── dashboard/
│       ├── layout.tsx          # Layout aninhado do dashboard
│       ├── page.tsx            # Página: /dashboard
│       ├── cadastro/
│       │   └── page.tsx        # Página: /dashboard/cadastro
│       └── settings/
│           └── page.tsx        # Página: /dashboard/settings
└── components/
    └── header/
        ├── index.tsx           # Componente Header
        └── header.module.css
```

---

## Conceitos aplicados

### 1. Server Components vs Client Components

No App Router, **todo componente é Server Component por padrão**. Isso significa que ele roda no servidor, nunca chega ao browser como JavaScript e pode fazer `fetch`, acessar banco de dados etc.

Para virar Client Component, basta colocar `"use client"` na primeira linha do arquivo.

#### Quando usar cada um

| Situação | Tipo |
|---|---|
| Buscar dados de uma API ou banco | **Server** |
| `useState`, `useEffect`, `useReducer` | **Client** |
| Eventos do browser (`onClick`, `onChange`) | **Client** |
| Componente só renderiza HTML estático | **Server** |
| Acessa `window`, `localStorage` | **Client** |

#### Exemplo deste projeto

**Server Component** — `src/app/page.tsx`
> Busca os repositórios diretamente no servidor com `async/await`. Nenhum JS é enviado ao browser.

```tsx
// Sem "use client" = Server Component
async function getData() {
  const response = await fetch("https://api.github.com/users/LucasPereiraCarvalho/repos");
  return response.json();
}

export default async function Home() {
  const data = await getData(); // roda no servidor

  return (
    <main>
      {data.map((item) => (
        <div key={item.id}>{item.name}</div>
      ))}
    </main>
  );
}
```

**Client Component** — `src/app/repositorios/page.tsx`
> Usa `useState` e `useEffect` para buscar os dados no browser após a página carregar.

```tsx
"use client" // ← obrigatório para usar hooks
import { useEffect, useState } from "react";

export default function Repositorios() {
  const [repos, setRepos] = useState([]);

  useEffect(() => {
    fetch("https://api.github.com/users/LucasPereiraCarvalho/repos")
      .then((r) => r.json())
      .then((data) => setRepos(data));
  }, []);

  return (
    <div>
      {repos.map((item) => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
```

#### Usando ambos ao mesmo tempo

É comum ter um Server Component pai que busca dados e passa para um Client Component filho que precisa de interatividade:

```tsx
// page.tsx (Server Component — busca os dados)
import { LikeButton } from "./LikeButton"; // Client Component

export default async function Page() {
  const data = await getData(); // roda no servidor

  return <LikeButton initialCount={data.likes} />; // passa dados como prop
}
```

```tsx
// LikeButton.tsx (Client Component — precisa de onClick)
"use client"

export function LikeButton({ initialCount }) {
  const [count, setCount] = useState(initialCount);
  return <button onClick={() => setCount(count + 1)}>{count} ❤️</button>;
}
```

> **Regra:** Server Components podem importar Client Components, mas **Client Components não podem importar Server Components**.

---

### 2. `@` import (path alias)

O `@` é um atalho configurado pelo Next.js que aponta para a pasta `src/`. Evita caminhos relativos longos e difíceis de manter.

#### Exemplo deste projeto — `src/components/header/index.tsx`

```tsx
// ❌ Sem alias (caminho relativo — quebraria se o arquivo mudar de pasta)
import styles from '../../components/header/header.module.css';

// ✅ Com alias (sempre relativo à raiz src/)
import styles from '@/components/header/header.module.css';
```

Configurado automaticamente no `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

### 3. `loading.tsx`

Quando uma página usa `async/await` para buscar dados (Server Component), o Next.js exibe automaticamente o arquivo `loading.tsx` enquanto aguarda a resposta — sem nenhuma configuração extra.

Funciona graças ao **React Suspense** integrado ao App Router.

#### Exemplo deste projeto — `src/app/loading.tsx`

```tsx
export default function Loading() {
  return (
    <div>
      <strong>Carregando informações...</strong>
    </div>
  );
}
```

#### Como funciona na prática

```
Usuário acessa /
    ↓
Next.js começa a executar page.tsx (que faz fetch)
    ↓
Enquanto aguarda → exibe loading.tsx
    ↓
Fetch concluído → substitui loading.tsx pelo conteúdo real de page.tsx
```

#### Escopo do loading

O `loading.tsx` só cobre as páginas da mesma pasta (e subpastas que não tenham o próprio `loading.tsx`). Se criar um `dashboard/loading.tsx`, ele só aparece nas rotas do dashboard.

---

### 4. Metadata

`Metadata` é o objeto exportado de um `layout.tsx` ou `page.tsx` que define as tags `<title>` e `<meta>` da página — importantes para SEO e acessibilidade.

#### Layout raiz — `src/app/layout.tsx`
> Aplica o título padrão para todas as páginas.

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};
```

#### Layout aninhado — `src/app/dashboard/layout.tsx`
> Sobrescreve o título apenas nas rotas do dashboard (`/dashboard`, `/dashboard/cadastro` etc.).

```tsx
export const metadata = {
  title: "Painel do Site",
  description: "Esse é o painel demonstrativo do site",
};
```

#### Regra de sobreposição

```
/ → title: "Create Next App"      (layout raiz)
/dashboard → title: "Painel do Site"  (layout do dashboard sobrescreve)
/contatos  → title: "Create Next App" (herda do layout raiz)
```

> `Metadata` só funciona em **Server Components**. Não pode ser exportado de arquivos com `"use client"`.

---

### 5. `children`

`children` é uma prop especial do React que representa o conteúdo passado entre as tags de abertura e fechamento de um componente. O componente não precisa saber antecipadamente o que vai receber — ele só reserva um espaço com `{children}`.

#### No layout raiz — `src/app/layout.tsx`

```tsx
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children} {/* ← aqui entra a página acessada no momento */}
      </body>
    </html>
  );
}
```

```
Usuário acessa /           → children = conteúdo de app/page.tsx
Usuário acessa /contatos   → children = conteúdo de app/contatos/page.tsx
Usuário acessa /dashboard  → children = conteúdo de app/dashboard/page.tsx
```

#### No layout aninhado — `src/app/dashboard/layout.tsx`

```tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <h3>Header do dashboard</h3>
      {children} {/* ← página do dashboard atual */}
    </>
  );
}
```

Ao acessar `/dashboard/cadastro`, a renderização fica assim:

```
RootLayout           (layout.tsx raiz)
  └── Header
  └── DashboardLayout  (dashboard/layout.tsx)
        └── "Header do dashboard"
        └── Cadastro   (dashboard/cadastro/page.tsx) ← children do DashboardLayout
```

O `children` é o mecanismo que permite layouts aninhados funcionarem sem que cada layout precise importar explicitamente as páginas filhas.

---

## Referências

- [Next.js Docs — App Router](https://nextjs.org/docs/app)
- [Server and Client Components](https://nextjs.org/docs/app/building-your-application/rendering)
- [Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Loading UI and Streaming](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)
