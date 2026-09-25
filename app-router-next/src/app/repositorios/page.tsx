"use client"
import { useEffect, useState } from 'react';

interface DataProps{
  id: number;
  name: string;
  full_name: string;
  owner:{
    login: string;
    id: number;
    avatar_url: string;
    url: string;
  }
}

export default function Repositorios(){
  const [repos, setRepos] = useState<DataProps[]>([])

  useEffect(() => {
    function getData(){
      fetch("https://api.github.com/users/LucasPereiraCarvalho/repos")
      .then( response => response.json() )
      .then((data: DataProps[]) => {

        setTimeout(() => {
          setRepos(data);
        }, 1000 )

      })
    }

    getData();
  }, [])

  return(
    <div>
      <h1>Página repositórios</h1>

      {repos.map( (item) => (
        <div key={item.id}>
          <strong>Repositório: </strong> <a>{item.name}</a>
          <br/><br/>
        </div>
      ))}
    </div>
  )
}