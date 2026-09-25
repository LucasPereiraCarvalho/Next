import { GetStaticProps } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/home.module.css";

import heroImg from "../../public/assets/hero.png";

import { db } from "../services/firebaseConnection";

import { collection, getDocs } from "firebase/firestore";

interface HomeProps {
  posts: number;
  comments: number;
}

export default function Home({ posts, comments }: HomeProps) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Tarefas</title>
      </Head>
      <main className={styles.main}>
        <div className={styles.logoContent}>
          <Image className={styles.hero} alt="logo" src={heroImg} priority />
        </div>
        <h1 className={styles.title}>
          Sistema feito para voce organizar <br />
          seus estudos e tarefas
        </h1>

        <div className={styles.infoContent}>
          <section className={styles.box}>
            <span>+{posts} posts</span>
          </section>
          <section className={styles.box}>
            <span>+{comments} comentários</span>
          </section>
        </div>
      </main>
    </div>
  );
}
// GetStaticProps é uma função do Next.js que faz parte do conceito de SSG (Static Site Generation).
// Com ela, os dados são buscados em tempo de build (construção) e a página é gerada estaticamente,
// ou seja, o HTML é pré-renderizado uma única vez e servido para todos os usuários sem precisar
// consultar o servidor a cada requisição. Isso torna a página muito mais rápida.
// O campo "revalidate" permite revalidar a página em segundo plano após um determinado tempo (em segundos),
// atualizando os dados sem precisar fazer um novo build completo (ISR - Incremental Static Regeneration).
export const getStaticProps: GetStaticProps = async () => {
  const commentRef = collection(db, "comments");
  const postRef = collection(db, "tarefas");

  const commentSnapshot = await getDocs(commentRef);
  const postSnapshot = await getDocs(postRef);

  return {
    props: {
      posts: postSnapshot.size || 0,
      comments: commentSnapshot.size || 0,
    },
    revalidate: 60, // seria revalidada a cada 60 segundos
  };
};