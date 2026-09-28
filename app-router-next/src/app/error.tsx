"use client";

import Link from "next/link";
import { useEffect } from "react";

const Error = ({ error, reset }: { error: Error; reset: () => void }) => {
  useEffect(() => {
    console.log(error);
  }, [error]);

  return (
    <div>
      <h1>Error</h1>
      <div>
        <Link href="/">Voltar para Home</Link>
      </div>
    </div>
  );
};

export default Error;
