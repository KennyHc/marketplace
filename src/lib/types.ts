export type Category =
  | "libros_apuntes"
  | "electronica"
  | "muebles"
  | "material_oficina"
  | "ropa"
  | "otros";

export const CATEGORIES: { value: Category; label: string; emoji: string }[] = [
  { value: "libros_apuntes", label: "Libros y apuntes", emoji: "📚" },
  { value: "electronica", label: "Electrónica", emoji: "💻" },
  { value: "muebles", label: "Muebles", emoji: "🪑" },
  { value: "material_oficina", label: "Material de oficina o estudio", emoji: "✏️" },
  { value: "ropa", label: "Ropa", emoji: "👕" },
  { value: "otros", label: "Otros", emoji: "📦" },
];

export const categoryLabel = (c: Category) => CATEGORIES.find((x) => x.value === c)?.label ?? c;

export type ListingStatus = "activo" | "vendido";

export type Listing = {
  id: string;
  org_id: string;
  seller_id: string;
  title: string;
  description: string;
  price: number;
  category: Category;
  photo_url: string;
  status: ListingStatus;
  buyer_id: string | null;
  sold_at: string | null;
  created_at: string;
};

export type Profile = {
  id: string;
  org_id: string;
  email: string;
  name: string | null;
  created_at: string;
};

export type Reputation = {
  user_id: string;
  avg_stars: number | null;
  rating_count: number;
};

export const formatPrice = (n: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n);
