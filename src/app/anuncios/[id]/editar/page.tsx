import { notFound, redirect } from "next/navigation";
import { requireCompleteProfile } from "@/lib/auth";
import ListingForm from "@/components/ListingForm";
import type { Listing } from "@/lib/types";

export default async function EditarAnuncio({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await requireCompleteProfile();
  const { data: listing } = await supabase.from("listings").select("*").eq("id", id).maybeSingle<Listing>();
  if (!listing || listing.seller_id !== user.id) notFound();
  if (listing.status === "vendido") redirect(`/anuncios/${id}`);
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold">Editar anuncio</h1>
      <ListingForm listing={listing} />
    </div>
  );
}
