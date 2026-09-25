# 📝 Tarefas App — Next.js Study Project

Aplicação de gerenciamento de tarefas construída para aprender **Next.js**, com autenticação via Google (NextAuth), banco de dados em tempo real (Firebase Firestore) e diferentes estratégias de renderização de páginas.

---

## 🚀 Tecnologias utilizadas

- [Next.js](https://nextjs.org) (Pages Router)
- [Firebase Firestore](https://firebase.google.com/docs/firestore)
- [NextAuth.js](https://next-auth.js.org) — autenticação com Google
- [TypeScript](https://www.typescriptlang.org)
- CSS Modules

---

## ▶️ Como rodar o projeto

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

---

## 🗂️ Estrutura de páginas

```
src/pages/
├── index.tsx               → Página inicial (SSG)
├── dashboard/
│   └── index.tsx           → Painel do usuário (SSR)
├── task/
│   └── [id].tsx            → Detalhe de uma tarefa (SSR + rota dinâmica)
└── api/
    └── auth/
        └── [...nextauth].js → API route do NextAuth
```

---

## 📖 Conceitos de Next.js aplicados neste projeto

### 1. SSG — Static Site Generation (`getStaticProps`)

**Arquivo:** `src/pages/index.tsx`

```ts
export const getStaticProps: GetStaticProps = async () => {
  const commentSnapshot = await getDocs(collection(db, "comments"));
  const postSnapshot   = await getDocs(collection(db, "tarefas"));

  return {
    props: {
      posts:    postSnapshot.size || 0,
      comments: commentSnapshot.size || 0,
    },
    revalidate: 60, // ISR: revalida a cada 60 segundos
  };
};
```

**O que acontece:**
- O Next.js executa essa função **uma única vez, no momento do build** (quando você roda `npm run build`).
- O HTML da página é gerado com os dados já embutidos e salvo como um arquivo estático.
- Todos os usuários recebem **o mesmo HTML pré-gerado**, sem precisar consultar o servidor a cada visita — o que torna a página muito rápida.

**`revalidate: 60` → ISR (Incremental Static Regeneration)**
- Com o `revalidate`, a página não fica desatualizada para sempre.
- Após 60 segundos, na próxima visita, o Next.js regenera a página em segundo plano com dados novos.
- O usuário que disparou a revalidação ainda vê a versão antiga; o próximo já vê a atualizada.

**Quando usar SSG:**
- Conteúdo que não muda com frequência (landing pages, blogs, contadores aproximados).
- Quando performance máxima é prioridade.

---

### 2. SSR — Server-Side Rendering (`getServerSideProps`)

**Arquivo:** `src/pages/dashboard/index.tsx`

```ts
export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const session = await getSession({ req });

  if (!session?.user) {
    return {
      redirect: { destination: "/", permanent: false },
    };
  }

  return {
    props: { user: { email: session?.user?.email } },
  };
};
```

**O que acontece:**
- Essa função roda **no servidor a cada requisição** — ou seja, toda vez que alguém abre a página.
- Antes de enviar o HTML pro navegador, o Next.js verifica se o usuário está autenticado.
- Se não estiver logado, redireciona para `/` **sem nem chegar a renderizar a página**.
- Se estiver logado, os dados (`user.email`) chegam prontos como `props` para o componente React.

**Quando usar SSR:**
- Páginas que precisam de dados do usuário (autenticação, sessão).
- Conteúdo que muda a cada requisição e não pode ser cacheado.
- Quando você precisa fazer redirect/proteção de rota no servidor.

---

### 3. SSR + Rota Dinâmica (`getServerSideProps` + `[id].tsx`)

**Arquivo:** `src/pages/task/[id].tsx`

```ts
export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.id as string; // ← vem do nome do arquivo [id].tsx

  const docRef = doc(db, "tarefas", id);
  const snapshot = await getDoc(docRef);

  // Redireciona se a tarefa não existir
  if (snapshot.data() === undefined) {
    return { redirect: { destination: "/", permanent: false } };
  }

  // Redireciona se a tarefa não for pública
  if (!snapshot.data()?.public) {
    return { redirect: { destination: "/", permanent: false } };
  }

  return {
    props: { item: task, allComents: allComments },
  };
};
```

**Como o Next.js sabe que `params.id` é o ID da URL?**

O nome do arquivo define a chave do `params`. O colchete `[id]` vira a propriedade `id`:

```
Arquivo:  pages/task/[id].tsx
URL:      /task/abc123
params:   { id: "abc123" }
```

Se o arquivo se chamasse `[slug].tsx`, seria `params.slug`. O sistema de arquivos **é** o roteamento.

**O que acontece nesta página:**
1. O Next.js extrai o `id` da URL.
2. Busca a tarefa no Firestore pelo `id`.
3. Se não existir ou não for pública → redireciona para `/`.
4. Se existir e for pública → busca os comentários e envia tudo como `props`.
5. O componente React já recebe os dados prontos, sem precisar fazer fetch no navegador.

---

### 4. CSR — Client-Side Rendering (`useEffect`)

**Arquivo:** `src/pages/dashboard/index.tsx`

```ts
useEffect(() => {
  async function loadTarefas() {
    const tarefasRef = collection(db, "tarefas");
    const q = query(
      tarefasRef,
      orderBy("created", "desc"),
      where("user", "==", user?.email)
    );

    onSnapshot(q, (snapshot) => {
      // atualiza o estado em tempo real quando o Firestore muda
      setTasks(lista);
    });
  }

  loadTarefas(); // ← chama fora da definição
}, [user?.email]);
```

**O que acontece:**
- A busca acontece **no navegador**, depois que a página já foi carregada.
- `onSnapshot` mantém uma **conexão em tempo real** com o Firestore: sempre que um dado muda no banco, o componente atualiza automaticamente sem precisar recarregar a página.

**Padrão obrigatório com funções async no useEffect:**
```ts
useEffect(() => {
  async function minhaFuncao() {
    await algumaCoisa();
  }

  minhaFuncao(); // ← definir e só depois chamar, fora da função
}, [deps]);
```

**Quando usar CSR:**
- Dados personalizados por usuário que não precisam de SEO.
- Dados em tempo real (como o `onSnapshot` do Firestore).
- Interações que dependem do estado da sessão no cliente.

---

## 🔄 Comparativo das estratégias de renderização

| Estratégia | Função Next.js | Quando executa | Usado neste projeto em |
|---|---|---|---|
| **SSG** | `getStaticProps` | No build (1x) | `pages/index.tsx` |
| **ISR** | `getStaticProps` + `revalidate` | Build + re-build periódico | `pages/index.tsx` |
| **SSR** | `getServerSideProps` | A cada requisição (servidor) | `dashboard/`, `task/[id]` |
| **CSR** | `useEffect` / hooks | No navegador, após carregar | `dashboard/index.tsx` |

---

## 🔐 Autenticação (NextAuth)

**Arquivo:** `src/pages/api/auth/[...nextauth].js`

O `[...nextauth]` é uma **catch-all route** — captura qualquer URL que comece com `/api/auth/`, como `/api/auth/signin`, `/api/auth/callback/google`, etc. O NextAuth usa esse arquivo para gerenciar todo o fluxo de login automaticamente.

A proteção de rota é feita no servidor, dentro do `getServerSideProps` do dashboard:

```ts
const session = await getSession({ req });

if (!session?.user) {
  return { redirect: { destination: "/" } };
}
```

---

## 🔥 Firebase Firestore — coleções usadas

| Coleção | Campos | Onde é usado |
|---|---|---|
| `tarefas` | `tarefas`, `created`, `user`, `public` | Dashboard (CRUD), Task (leitura) |
| `comments` | `comment`, `created`, `user`, `name`, `taskId` | Task (leitura/escrita/exclusão) |

---

## 💡 Bugs corrigidos durante o desenvolvimento (aprendizados)

**1. Passar dados para o lugar errado:**
```ts
// ❌ errado — objeto de dados dentro de collection()
await addDoc(collection(db, "tarefas", { tarefas: input }))

// ✅ correto — collection() só recebe o caminho; dados vão no addDoc()
await addDoc(collection(db, "tarefas"), { tarefas: input })
```

**2. Recursão infinita no useEffect:**
```ts
// ❌ errado — função chama ela mesma infinitamente
async function loadTarefas() {
  loadTarefas() // ← loop infinito
}

// ✅ correto — chamar a função fora dela, no corpo do useEffect
async function loadTarefas() { ... }
loadTarefas()
```

**3. Chamar função em vez de referenciar no onClick:**
```tsx
// ❌ errado — executa durante o render (sem gesto do usuário)
onClick={handleShare(item.id)}

// ✅ correto — executa apenas quando o usuário clicar
onClick={() => handleShare(item.id)}
```
> Este bug causava `NotAllowedError` na Clipboard API porque `writeText` precisa de um gesto explícito do usuário.
