"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES, type Category, type Listing } from "@/lib/types";

const MAX_BYTES = 8 * 1024 * 1024;

export default function ListingForm({ listing }: { listing?: Listing }) {
  const router = useRouter();
  const editing = Boolean(listing);
  const [title, setTitle] = useState(listing?.title ?? "");
  const [description, setDescription] = useState(listing?.description ?? "");
  const [price, setPrice] = useState(listing ? String(listing.price) : "");
  const [category, setCategory] = useState<Category | "">(listing?.category ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(listing?.photo_url ?? null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) return setError("El archivo debe ser una imagen.");
    if (f.size > MAX_BYTES) return setError("La foto no puede superar los 8 MB.");
    setError(null);
    setFile(f);
    if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(f));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const priceNum = Number(price.replace(",", "."));
    if (title.trim().length < 3) return setError("El título debe tener al menos 3 caracteres.");
    if (title.trim().length > 100) return setError("El título no puede superar los 100 caracteres.");
    if (!description.trim()) return setError("Añade una descripción.");
    if (description.trim().length > 2000) return setError("La descripción no puede superar los 2000 caracteres.");
    if (price === "" || !Number.isFinite(priceNum) || priceNum < 0) return setError("Introduce un precio válido.");
    if (!category) return setError("Elige una categoría.");
    if (!editing && !file) return setError("Añade una foto.");

    setLoading(true);
    try {
      const supabase = createClient();
      let photo_url = listing?.photo_url ?? "";
      if (file) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Tu sesión ha caducado. Vuelve a iniciar sesión.");
        const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("listing-photos")
          .upload(path, file, { contentType: file.type, upsert: false });
        if (upErr) throw new Error("No se pudo subir la foto. Inténtalo de nuevo.");
        photo_url = supabase.storage.from("listing-photos").getPublicUrl(path).data.publicUrl;
      }
      const fields = {
        title: title.trim(),
        description: description.trim(),
        price: Math.round(priceNum * 100) / 100,
        category,
        photo_url,
      };
      if (listing) {
        const { error: err } = await supabase.from("listings").update(fields).eq("id", listing.id);
        if (err) throw new Error("No se pudo guardar el anuncio. Inténtalo de nuevo.");
        router.push(`/anuncios/${listing.id}`);
      } else {
        const { data, error: err } = await supabase.from("listings").insert(fields).select("id").single();
        if (err || !data) throw new Error("No se pudo publicar el anuncio. Revisa que tu perfil esté completo.");
        router.push(`/anuncios/${data.id}`);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salió mal. Inténtalo de nuevo.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <span className="label">Foto</span>
        <label className="card flex aspect-[4/3] cursor-pointer items-center justify-center overflow-hidden border-dashed bg-stone-50 text-sm text-muted hover:bg-stone-100">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Vista previa" className="h-full w-full object-cover" />
          ) : (
            <span className="text-center">
              <span className="block text-3xl">📷</span>Toca para hacer o elegir una foto
            </span>
          )}
          <input type="file" accept="image/*" onChange={onFile} className="sr-only" />
        </label>
        {preview && <p className="mt-1.5 text-xs text-muted">Toca la imagen para cambiarla.</p>}
      </div>

      <div>
        <label htmlFor="title" className="label">Título</label>
        <input id="title" className="input" value={title} maxLength={100} onChange={(e) => setTitle(e.target.value)} placeholder="Ej. Silla de oficina ergonómica" />
      </div>

      <div>
        <label htmlFor="description" className="label">Descripción</label>
        <textarea id="description" className="input min-h-32" value={description} maxLength={2000} onChange={(e) => setDescription(e.target.value)} placeholder="Incluye el estado (nuevo / como nuevo / usado), medidas, motivo de venta…" />
      </div>

      <div>
        <label htmlFor="price" className="label">Precio (€)</label>
        <input id="price" className="input" type="number" inputMode="decimal" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0,00" />
      </div>

      <div>
        <span className="label">Categoría</span>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setCategory(c.value)}
              aria-pressed={category === c.value}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                category === c.value ? "border-brand bg-brand text-white" : "border-line bg-card hover:bg-stone-100"
              }`}
            >
              {c.emoji} {c.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="error" role="alert">{error}</p>}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "Guardando…" : editing ? "Guardar cambios" : "Publicar anuncio"}
      </button>
    </form>
  );
}
