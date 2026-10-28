import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireCompleteProfile } from "@/lib/auth";
import ListingForm from "@/components/ListingForm";
import { FadeIn } from "@/components/ui/motion";
import type { Listing } from "@/lib/types";

export default async function EditarAnuncio({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await requireCompleteProfile();
  const { data: listing } = await supabase.from("listings").select("*").eq("id", id).maybeSingle<Listing>();
  if (!listing || listing.seller_id !== user.id) notFound();
  if (listing.status === "vendido") redirect(`/anuncios/${id}`);
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <Link href={`/anuncios/${id}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-foreground">
        <ArrowLeft size={16} strokeWidth={1.75} />
        Volver al anuncio
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">Editar anuncio</h1>
      <p className="mt-1.5 text-muted">Actualiza los datos de tu anuncio.</p>
      <FadeIn delay={0.08} className="card mt-6 p-5 sm:p-7">
        <ListingForm listing={listing} />
      </FadeIn>
    </div>
  );
}
