import { LoginForm } from "./LoginForm";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight">Compra y vende entre compañeros</h1>
      <p className="mt-2 text-muted">El mercadillo de segunda mano de tu organización.</p>
      <ul className="mt-4 space-y-2 text-sm">
        <li className="card px-4 py-3">🤝 <b>Confianza:</b> todos los usuarios son de tu organización.</li>
        <li className="card px-4 py-3">📦 <b>Sin envíos:</b> se entrega en mano, en el pasillo.</li>
      </ul>
      <div className="mt-6">
        {error && (
          <div className="error mb-4">El enlace no es válido o ha caducado. Inténtalo de nuevo.</div>
        )}
        <LoginForm />
      </div>
    </div>
  );
}
