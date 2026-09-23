import Head from 'next/head'
import styles from './styles.module.css'


export default function Dashboard() {
    return (
        <div className={styles.container}>
            <Head>
                <title>Painel</title>
            </Head>
        </div>
    )
}