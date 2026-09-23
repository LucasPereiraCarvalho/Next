import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import Head from "next/head";
import { Textarea } from "../../components/textarea";
import styles from "./styles.module.css";

export default function Dashboard() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Dashboard</title>
      </Head>

      <main className={styles.main}>
        <section className={styles.content}>
          <div className={styles.contentForm}>
            <h1 className={styles.title}>Qual sua tarefa?</h1>

            <form action="">
              <Textarea placeholder="Digite sua tarefa" />
              <div className={styles.checkboxArea}>
                <input type="checkbox" className={styles.checkbox} />
                <label>Deixar tarefa publica</label>
              </div>

              <button className={styles.button} type="submit">
                Registar
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const session = await getSession({ req });
  console.log(session);

  if (!session?.user) {
    // se nao tem usuario logado, redireciona para home /
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};
