export type Category =
  | "libros_apuntes"
  | "electronica"
  | "muebles"
  | "material_oficina"
  | "ropa"
  | "otros";

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: "libros_apuntes", label: "Libros y apuntes" },
  { value: "electronica", label: "Electrónica" },
  { value: "muebles", label: "Muebles" },
  { value: "material_oficina", label: "Material de oficina o estudio" },
  { value: "ropa", label: "Ropa" },
  { value: "otros", label: "Otros" },
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
