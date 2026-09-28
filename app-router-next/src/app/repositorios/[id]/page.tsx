interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function RepositorioId({ params }: PageProps) {
  const { id } = await params;

  return (
    <div>
      <h1>id : {id}</h1>
    </div>
  );
}
