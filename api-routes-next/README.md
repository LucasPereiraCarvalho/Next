# API Routes no Next.js

Este projeto demonstra como funcionam as **API Routes** no Next.js utilizando o **App Router**.

---

## O que são API Routes?

API Routes permitem criar endpoints HTTP diretamente dentro do seu projeto Next.js, sem precisar de um servidor back-end separado. Cada arquivo `route.ts` (ou `route.js`) dentro da pasta `app/` se torna um endpoint REST acessível via HTTP.

---

## Como funciona o sistema de rotas

O Next.js utiliza o sistema de arquivos para definir as URLs das rotas. A estrutura de pastas dentro de `src/app/` determina o caminho da URL:

```
src/
└── app/
    └── api/
        ├── route.ts              → GET /api
        └── tarefas/
            └── route.ts          → GET /api/tarefas
                                    POST /api/tarefas
                                    PUT /api/tarefas?index=0
                                    DELETE /api/tarefas?index=0
```

Cada método HTTP é exportado como uma função nomeada dentro do `route.ts`.

---

## Estrutura de um `route.ts`

```ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  return NextResponse.json({ message: "Olá!" });
}

export async function POST(request: Request) {
  const data = await request.json(); // lê o body da requisição
  return NextResponse.json(data);
}
```

Os métodos suportados são: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`.

---

## Endpoints deste projeto

### `GET /api`

Rota de boas-vindas da API.

**Resposta:**
```json
{ "message": "Bem vindo a API de TESTES" }
```

---

### `GET /api/tarefas`

Retorna a lista de tarefas.

**Resposta:**
```json
["Comprar coca", "Estudar NextJS"]
```

---

### `POST /api/tarefas`

Adiciona uma nova tarefa à lista.

**Body (JSON):**
```json
{ "name": "Nova tarefa" }
```

**Resposta:** lista atualizada de tarefas.

---

### `PUT /api/tarefas?index=1`

Atualiza a tarefa no índice informado via query string.

**Query param:** `index` — posição (0-based) da tarefa na lista.

**Body (JSON):**
```json
{ "name": "Tarefa atualizada" }
```

**Resposta:**
```json
{ "message": "Tarefa atualizada com sucesso!" }
```

---

### `DELETE /api/tarefas?index=1`

Remove a tarefa no índice informado via query string.

**Query param:** `index` — posição (0-based) da tarefa na lista.

**Resposta:**
```json
{ "message": "Tarefa deletada com sucesso!" }
```

---

## Lendo query params

Para acessar parâmetros da URL (query string), utilize a API nativa `URL`:

```ts
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const index = searchParams.get("index"); // "1"
}
```

---

## Lendo o body da requisição

Para requisições `POST` e `PUT`, o body JSON é lido com `request.json()`:

```ts
export async function POST(request: Request) {
  const data = await request.json();
  console.log(data.name);
}
```

---

## Retornando respostas

Use `NextResponse.json()` para retornar JSON com o status HTTP correto (padrão `200`):

```ts
return NextResponse.json({ ok: true });                        // 200
return NextResponse.json({ error: "Not found" }, { status: 404 }); // 404
```

---

## Executando o projeto

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

Para testar os endpoints, utilize ferramentas como **Insomnia**, **Postman** ou `curl`:

```bash
# Listar tarefas
curl http://localhost:3000/api/tarefas

# Adicionar tarefa
curl -X POST http://localhost:3000/api/tarefas \
  -H "Content-Type: application/json" \
  -d '{"name": "Aprender API Routes"}'

# Atualizar tarefa no índice 0
curl -X PUT "http://localhost:3000/api/tarefas?index=0" \
  -H "Content-Type: application/json" \
  -d '{"name": "Tarefa editada"}'

# Deletar tarefa no índice 0
curl -X DELETE "http://localhost:3000/api/tarefas?index=0"
```

---

## Referências

- [Next.js — Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Next.js — NextResponse API](https://nextjs.org/docs/app/api-reference/functions/next-response)
