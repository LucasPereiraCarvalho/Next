import styles from '@/components/header/header.module.css';
import Link from "next/link";


export function Header(){
  return(
    <header className={styles.header}>
      <h1>Meu site</h1>
      <Link href="/">Home</Link> <br/>
      <Link href="/contatos">Contatos</Link> <br/>
      <Link href="/dashboard">Dashboard</Link> <br/>

      <br/><br/>
      <hr/>

    </header>
  )
}