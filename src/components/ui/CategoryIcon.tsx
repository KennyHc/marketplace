import { BookOpen, Laptop, Sofa, PenTool, Shirt, Package, type LucideProps } from "lucide-react";
import type { Category } from "@/lib/types";

const ICONS = {
  libros_apuntes: BookOpen,
  electronica: Laptop,
  muebles: Sofa,
  material_oficina: PenTool,
  ropa: Shirt,
  otros: Package,
} satisfies Record<Category, React.ComponentType<LucideProps>>;

export function CategoryIcon({ category, ...props }: { category: Category } & LucideProps) {
  const Icon = ICONS[category] ?? Package;
  return <Icon strokeWidth={1.75} {...props} />;
}
