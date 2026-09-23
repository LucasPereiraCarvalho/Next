import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import Head from "next/head";
import styles from "./styles.module.css";

export default function Dashboard() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Painel</title>
      </Head>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const session = await getSession({ req });
  console.log(session);

  if (!session?.user) {
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
