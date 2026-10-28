import { requireCompleteProfile } from "@/lib/auth";
import ListingForm from "@/components/ListingForm";

export default async function NuevoAnuncio() {
  await requireCompleteProfile();
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold">Publicar anuncio</h1>
      <ListingForm />
    </div>
  );
}
