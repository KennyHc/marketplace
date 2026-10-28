"use client";

import { useRef, useState } from "react";
import { AlertCircle, Check, ImagePlus, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { AnimatePresence, motion, SPRING } from "@/components/ui/motion";
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

  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function takeFile(f: File | undefined) {
    if (!f) return;
    if (!f.type.startsWith("image/")) return setError("El archivo debe ser una imagen.");
    if (f.size > MAX_BYTES) return setError("La foto no puede superar los 8 MB.");
    setError(null);
    setFile(f);
    if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(f));
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    takeFile(e.target.files?.[0]);
    e.target.value = "";
  }

  function removePhoto() {
    if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(editing ? (listing?.photo_url ?? null) : null);
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

  const submitLabel = loading ? "Guardando…" : editing ? "Guardar cambios" : "Publicar anuncio";
  const titleLen = title.trim().length;

  return (
    <form onSubmit={onSubmit} className="space-y-7 pb-24 sm:pb-0">
      <div>
        <span className="label">Foto</span>
        <input ref={inputRef} type="file" accept="image/*" onChange={onFile} className="sr-only" tabIndex={-1} />
        <AnimatePresence mode="wait" initial={false}>
          {preview ? (
            <motion.div
              key={preview}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={SPRING}
              className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line bg-surface-2 shadow-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Vista previa" className="h-full w-full object-cover" />
              <div className="absolute inset-x-3 bottom-3 flex gap-2">
                <button type="button" onClick={() => inputRef.current?.click()} className="btn-secondary btn-sm bg-white/90 backdrop-blur">
                  <RefreshCw size={15} strokeWidth={1.75} />
                  Cambiar
                </button>
                {file && (
                  <button type="button" onClick={removePhoto} className="btn-secondary btn-sm bg-white/90 text-danger backdrop-blur">
                    <Trash2 size={15} strokeWidth={1.75} />
                    {editing ? "Descartar" : "Quitar"}
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.button
              key="drop"
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); takeFile(e.dataTransfer.files?.[0]); }}
              className={`flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 text-center transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/25 ${
                drag ? "border-brand bg-brand-soft" : "border-line-strong bg-brand-softer hover:border-brand hover:bg-brand-soft"
              }`}
            >
              <span className="flex size-14 items-center justify-center rounded-full bg-brand-soft text-brand">
                <ImagePlus size={26} strokeWidth={1.75} />
              </span>
              <span className="text-sm font-medium">Arrastra o toca para subir una foto</span>
              <span className="text-xs text-muted">JPG, PNG o WebP, hasta 8 MB</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div>
        <label htmlFor="title" className="label">Título</label>
        <input id="title" className="input" value={title} maxLength={100} onChange={(e) => setTitle(e.target.value)} placeholder="Ej. Silla de oficina ergonómica" />
        <p className="hint text-right tabular-nums">{titleLen}/100</p>
      </div>

      <div>
        <label htmlFor="description" className="label">Descripción</label>
        <textarea id="description" className="textarea min-h-32" value={description} maxLength={2000} onChange={(e) => setDescription(e.target.value)} placeholder="Medidas, motivo de venta, detalles…" />
        <p className="hint">Incluye el estado: nuevo, como nuevo o usado</p>
      </div>

      <div>
        <label htmlFor="price" className="label">Precio</label>
        <div className="relative max-w-48">
          <input id="price" className="input pr-9 tabular-nums" type="number" inputMode="decimal" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0,00" />
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted">€</span>
        </div>
      </div>

      <div>
        <span className="label">Categoría</span>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {CATEGORIES.map((c) => {
            const on = category === c.value;
            return (
              <button
                key={c.value}
                type="button"
                onClick={() => setCategory(c.value)}
                aria-pressed={on}
                className={`relative flex min-h-16 items-center gap-2.5 rounded-xl border px-3 py-3 text-left text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/25 ${
                  on ? "border-brand bg-brand-soft text-brand-active" : "border-line bg-surface text-foreground hover:border-line-strong"
                }`}
              >
                <CategoryIcon category={c.value} size={20} className={`shrink-0 ${on ? "text-brand" : "text-muted"}`} />
                <span className="leading-tight">{c.label}</span>
                <AnimatePresence>
                  {on && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={SPRING}
                      className="absolute right-2 top-2 flex size-4 items-center justify-center rounded-full bg-brand text-white"
                    >
                      <Check size={11} strokeWidth={3} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="error"
            role="alert"
          >
            <AlertCircle size={18} strokeWidth={1.75} className="mt-px shrink-0" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/90 p-3 backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        <button type="submit" disabled={loading} className="btn-primary btn-lg w-full">
          {loading && <Loader2 size={18} strokeWidth={1.75} className="animate-spin" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
