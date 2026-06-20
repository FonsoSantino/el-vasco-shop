"use client";

import { Edit, Trash2, Copy } from "lucide-react";
import Link from "next/link";
import { deleteProduct } from "@/app/actions/products";
import { useRouter } from "next/navigation";

export function ProductActions({ id }: { id: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      const res = await deleteProduct(id);
      if (res.success) {
        // Will refresh automatically via revalidatePath
      } else {
        alert("Error al eliminar: " + res.error);
      }
    }
  };

  const handleDuplicate = async () => {
    // Actually, duplicating should be simple. 
    // We could either send to a new page with prefilled query params, or create an action duplicateProduct.
    // Given the constraints, doing it later or via an API is better.
    alert("Duplicar producto no está implementado aún en este botón.");
  };

  return (
    <div className="flex justify-end gap-3">
      <button onClick={handleDuplicate} className="text-white/50 hover:text-white transition-colors" title="Duplicar">
        <Copy className="w-4 h-4" />
      </button>
      <Link href={`/admin/productos/editar/${id}`} className="text-white/50 hover:text-white transition-colors" title="Editar">
        <Edit className="w-4 h-4" />
      </Link>
      <button onClick={handleDelete} className="text-red-400/50 hover:text-red-400 transition-colors" title="Eliminar">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
