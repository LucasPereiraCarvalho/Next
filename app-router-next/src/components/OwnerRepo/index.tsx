"use client";
import Image from "next/image";
import { useState } from "react";

export function OwnerRepo({
  avatar_url,
  name,
}: {
  avatar_url: string;
  name: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <div>
      {show && (
        <>
          <Image
            src={avatar_url}
            alt="Imagem do usuario"
            width={34}
            height={34}
            style={{ borderRadius: 8 }}
          ></Image>
          <strong>{name}</strong>
        </>
      )}

      <button onClick={() => setShow(!show)}>
        {show ? "Ocultar Nome" : "Exibir Nome"}
      </button>
    </div>
  );
}
