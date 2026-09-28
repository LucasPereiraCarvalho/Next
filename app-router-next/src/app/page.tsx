import { OwnerRepo } from "@/components/OwnerRepo";

interface DataProps {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    id: number;
    avatar_url: string;
    url: string;
  };
}
// async function delayFetch(url: string, delay: number){
//   await new Promise(resolve => setTimeout(resolve, delay))
//   const response = await fetch(url);
//   return response.json();
// }

/**
 * Opções de cache para o fetch:
 * - 'force-cache': (padrão) Armazena a resposta em cache e a reutiliza nas requisições subsequentes (comportamento SSG)
 * - 'no-store': Nunca armazena a resposta em cache, sempre busca do servidor (comportamento SSR)
 * - 'no-cache': Revalida o cache a cada requisição
 * - 'reload': Ignora o cache e o atualiza com a nova resposta
 * - 'default': Utiliza o comportamento de cache padrão do navegador
 * - 'only-if-cached': Utiliza o cache apenas se disponível, caso contrário falha
 *
 * Opções do next.revalidate:
 * - 0: Revalida a cada requisição (comportamento SSR)
 * - false: Nunca revalida (cache permanente, comportamento SSG)
 * - N (número em segundos): Revalida após N segundos (comportamento ISR)
 */
async function getData() {
  const response = await fetch(
    "https://api.github.com/users/LucasPereiraCarvalho/repos",
    { cache: "force-cache", next: { revalidate: 60 } }
  );
  return response.json();
}

export default async function Home() {
  const data: DataProps[] = await getData();

  return (
    <main>
      <h1>Página Home</h1>
      <span>Seja bem vindo a página home</span>
      <br />

      <h3>Meus repositorios</h3>

      {data.map((item) => (
        <div key={item.id}>
          <strong>Repositório: </strong> <a>{item.name}</a>
          <br />
          <OwnerRepo
            avatar_url={item.owner.avatar_url}
            name={item.owner.login}
          />
          <br />
        </div>
      ))}
    </main>
  );
}
