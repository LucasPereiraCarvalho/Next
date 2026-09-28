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
│   ├── layout.tsx                    # Layout raiz (envolve todas as páginas)
│   ├── page.tsx                      # Página: /
│   ├── loading.tsx                   # Tela de carregamento automática
│   ├── not-found.tsx                 # Página 404 global
│   ├── error.tsx                     # Página de erro global
│   ├── repositorios/
│   │   ├── page.tsx                  # Página: /repositorios  ← Client Component
│   │   └── [id]/
│   │       └── page.tsx              # Página: /repositorios/123  ← rota dinâmica
│   └── {site}/                       # Route Group (não vira segmento de URL)
│       ├── contatos/
│       │   └── page.tsx              # Página: /contatos
│       └── dashboard/
│           ├── layout.tsx            # Layout aninhado do dashboard
│           ├── page.tsx              # Página: /dashboard
│           ├── cadastro/
│           │   └── page.tsx          # Página: /dashboard/cadastro
│           └── settings/
│               └── page.tsx          # Página: /dashboard/settings
└── components/
    ├── header/
    │   ├── index.tsx                 # Componente Header
    │   └── header.module.css
    └── OwnerRepo/
        └── index.tsx                 # Client Component com Image + useState
```

---

## Conceitos aplicados

### 1. File System Routing

No Next.js, o sistema de rotas é baseado na estrutura de pastas — **cada pasta vira um segmento de URL** e o arquivo `page.tsx` dentro dela define o conteúdo daquela rota.

#### Pages Router vs App Router

O Next.js tem dois sistemas de roteamento:

| | Pages Router (`/pages`) | App Router (`/app`) |
|---|---|---|
| Pasta raiz | `src/pages/` | `src/app/` |
| Arquivo de página | `index.tsx`, `contatos.tsx` | `contatos/page.tsx` |
| Layout compartilhado | `_app.tsx` | `layout.tsx` |
| Componentes | Client por padrão | **Server por padrão** |
| Versão | Até Next.js 12 (ainda suportado) | Next.js 13+ (recomendado) |

Este projeto usa o **App Router**.

#### Arquivos especiais do App Router

| Arquivo | Finalidade |
|---|---|
| `page.tsx` | Conteúdo da rota — obrigatório para a rota existir |
| `layout.tsx` | Envolve a página e persiste entre navegações |
| `loading.tsx` | Exibido enquanto a página carrega (Suspense) |
| `not-found.tsx` | Página 404 |
| `error.tsx` | Página de erro |

#### Rotas dinâmicas — `[id]`

Colchetes no nome da pasta criam um segmento dinâmico que aceita qualquer valor:

```
repositorios/[id]/page.tsx
```

```
/repositorios/123   → params.id = "123"
/repositorios/abc   → params.id = "abc"
```

No Next.js 15, `params` é uma Promise e precisa de `await`:

```tsx
// src/app/repositorios/[id]/page.tsx
interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RepositorioId({ params }: PageProps) {
  const { id } = await params;

  return <h1>Repositório: {id}</h1>;
}
```

#### Route Groups — `{site}`

Parênteses (ou chaves, dependendo da versão) no nome da pasta criam um **grupo de rotas** — a pasta **não vira segmento de URL**, serve apenas para organizar arquivos:

```
app/
└── {site}/
    ├── contatos/page.tsx   → URL: /contatos   (não /site/contatos)
    └── dashboard/page.tsx  → URL: /dashboard  (não /site/dashboard)
```

Útil para agrupar rotas que compartilham um layout sem afetar a URL.

---

### 2. Server Components vs Client Components

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

É comum ter um Server Component pai que busca dados e passa para um Client Component filho que precisa de interatividade. Exemplo real deste projeto:

```tsx
// page.tsx (Server Component — busca os dados no servidor)
import { OwnerRepo } from "@/components/OwnerRepo";

export default async function Home() {
  const data = await getData();

  return (
    <>
      {data.map((item) => (
        <OwnerRepo
          key={item.id}
          avatar_url={item.owner.avatar_url}  // dado do servidor
          name={item.owner.login}             // dado do servidor
        />
      ))}
    </>
  );
}
```

```tsx
// OwnerRepo/index.tsx (Client Component — precisa de useState e onClick)
"use client"

export function OwnerRepo({ avatar_url, name }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      {show && <Image src={avatar_url} alt={name} width={34} height={34} />}
      <button onClick={() => setShow(!show)}>
        {show ? "Ocultar" : "Exibir"}
      </button>
    </div>
  );
}
```

> **Regra:** Server Components podem importar Client Components, mas **Client Components não podem importar Server Components**.

---

### 3. Otimizações do Next.js

#### `layout.tsx` — persistência entre páginas

O `layout.tsx` envolve as páginas sem se re-renderizar durante a navegação. O `<Header>` é renderizado uma vez e permanece enquanto o usuário navega — diferente de re-renderizar tudo a cada troca de página.

```tsx
// src/app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header />    {/* renderizado uma vez, persiste na navegação */}
        {children}    {/* só esta parte muda ao trocar de página */}
      </body>
    </html>
  );
}
```

Layouts podem ser **aninhados** — o `dashboard/layout.tsx` adiciona um header específico apenas para as rotas do dashboard, sem afetar o resto do site.

#### `Metadata` — SEO e redes sociais

Exportar `metadata` de um `layout.tsx` ou `page.tsx` gera automaticamente as tags `<title>`, `<meta>` e Open Graph no `<head>` — sem precisar manipular o HTML manualmente.

```tsx
// src/app/layout.tsx — metadata real deste projeto
export const metadata: Metadata = {
  title: "Meu Site - Aprendendo NextJS",
  description: "Site completo para praticar nextjs com sujeito programador",
  keywords: ["HTML", "CSS", "JavaScript", "Programação"],
  openGraph: {
    // imagem exibida ao compartilhar o link no WhatsApp, Twitter etc.
    images: ["https://sujeitoprogramador.com/.../softsk-1024x576.jpg"],
  },
  robots: {
    index: true,       // Google pode indexar a página
    follow: true,      // Google pode seguir os links
    nocache: true,     // Google não exibe versão em cache
    googleBot: {
      index: true,
      follow: true,
      noimageindex: true, // Google não indexa as imagens
    },
  },
};
```

> `Metadata` só funciona em **Server Components**. Não pode ser exportado de arquivos com `"use client"`.

**Regra de sobreposição:** cada rota herda o metadata do layout pai, mas pode sobrescrever campos específicos:

```
/           → title: "Meu Site - Aprendendo NextJS"  (layout raiz)
/dashboard  → title: "Painel do Site"                (dashboard/layout.tsx sobrescreve)
/contatos   → title: "Meu Site - Aprendendo NextJS"  (herda do layout raiz)
```

#### `<Image>` — otimização automática de imagens

O componente `<Image>` do Next.js substitui a tag `<img>` com otimizações automáticas:

- Converte para **WebP/AVIF** (formatos modernos mais leves)
- Aplica **lazy loading** por padrão (só carrega quando entra na tela)
- **Evita layout shift** (CLS) exigindo `width` e `height`
- Redimensiona a imagem no servidor conforme o tamanho solicitado

```tsx
// src/components/OwnerRepo/index.tsx
import Image from "next/image";

<Image
  src={avatar_url}          // URL da imagem
  alt="Imagem do usuario"   // obrigatório para acessibilidade
  width={34}                // obrigatório — evita layout shift
  height={34}               // obrigatório — evita layout shift
  style={{ borderRadius: 8 }}
/>
```

Para imagens de domínios externos, é necessário liberar o hostname no `next.config.ts` (segurança contra domínios maliciosos):

```ts
// next.config.ts
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "avatars.githubusercontent.com",
    },
  ],
},
```

#### Cache e revalidação do `fetch`

O Next.js estende o `fetch` nativo com opções de cache. Configurado em `src/app/page.tsx`:

```tsx
const response = await fetch(url, {
  cache: "force-cache",    // padrão: armazena em cache (comportamento SSG)
  next: { revalidate: 60 } // revalida o cache a cada 60 segundos (ISR)
});
```

| Opção | Comportamento | Equivalente |
|---|---|---|
| `cache: "force-cache"` | Armazena e reutiliza | SSG |
| `cache: "no-store"` | Nunca armazena, sempre busca | SSR |
| `next: { revalidate: N }` | Revalida após N segundos | ISR |
| `next: { revalidate: 0 }` | Revalida a cada requisição | SSR |

#### Fontes — `next/font`

O Next.js baixa as fontes do Google em **build time** e as serve localmente, sem nenhuma requisição externa do browser. Isso elimina o flash de texto (FOUT) e melhora a privacidade do usuário.

```tsx
// src/app/layout.tsx
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
```

---

### 4. `@` import (path alias)

O `@` é um atalho configurado pelo Next.js que aponta para a pasta `src/`. Evita caminhos relativos longos e difíceis de manter.

```tsx
// ❌ Sem alias (quebra se o arquivo mudar de pasta)
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

### 5. `loading.tsx`

Quando uma página usa `async/await` para buscar dados (Server Component), o Next.js exibe automaticamente o arquivo `loading.tsx` enquanto aguarda a resposta — sem nenhuma configuração extra.

Funciona graças ao **React Suspense** integrado ao App Router.

```tsx
// src/app/loading.tsx
export default function Loading() {
  return (
    <div>
      <strong>Carregando informações...</strong>
    </div>
  );
}
```

```
Usuário acessa /
    ↓
Next.js começa a executar page.tsx (que faz fetch)
    ↓
Enquanto aguarda → exibe loading.tsx
    ↓
Fetch concluído → substitui pelo conteúdo real de page.tsx
```

O `loading.tsx` só cobre as páginas da mesma pasta. Um `dashboard/loading.tsx` só aparece nas rotas do dashboard.

---

### 6. `children`

`children` é uma prop especial do React que representa o conteúdo passado entre as tags de abertura e fechamento de um componente.

```tsx
// src/app/layout.tsx
export default function RootLayout({ children }) {
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
Usuário acessa /            → children = conteúdo de app/page.tsx
Usuário acessa /contatos    → children = conteúdo de app/{site}/contatos/page.tsx
Usuário acessa /dashboard   → children = conteúdo de app/{site}/dashboard/page.tsx
```

Ao acessar `/dashboard/cadastro`, a árvore de renderização fica:

```
RootLayout                    (app/layout.tsx)
  └── Header
  └── DashboardLayout         (app/{site}/dashboard/layout.tsx)
        └── "Header do dashboard"
        └── Cadastro          (app/{site}/dashboard/cadastro/page.tsx)
```

---

## Referências

- [Next.js Docs — App Router](https://nextjs.org/docs/app)
- [File System Routing](https://nextjs.org/docs/app/building-your-application/routing)
- [Server and Client Components](https://nextjs.org/docs/app/building-your-application/rendering)
- [Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Font Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)
- [Loading UI and Streaming](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)
- [Data Fetching and Caching](https://nextjs.org/docs/app/building-your-application/data-fetching/fetching)
