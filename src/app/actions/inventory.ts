"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createInventoryMovement(formData: FormData) {
  try {
    const productId = formData.get("productId") as string;
    const typeStr = formData.get("type") as string;
    const quantity = Number(formData.get("quantity"));
    const reason = formData.get("reason") as string;
    
    // First, find current product stock
    const product = db.prepare("SELECT stock FROM Product WHERE id = ?").get(productId) as any;

    if (!product) throw new Error("Producto no encontrado");

    let newStock = product.stock;
    let finalType = "MANUAL_ADJUSTMENT";
    let actualQuantity = quantity;

    if (typeStr === "IN") {
      newStock += quantity;
      finalType = "RESTOCK";
    } else if (typeStr === "OUT") {
      newStock -= quantity;
      finalType = "SALE";
      actualQuantity = -quantity; // Usually negative for sales
    } else if (typeStr === "ADJ") {
      newStock = quantity; // Absolute adjustment
      finalType = "MANUAL_ADJUSTMENT";
      actualQuantity = newStock - product.stock; // Difference
    }

    if (newStock < 0) {
      throw new Error("El stock no puede quedar en negativo");
    }

    // Transaction to update product and record movement
    const performMovement = db.transaction(() => {
      const id = `inv-${Date.now()}`;
      db.prepare(`
        INSERT INTO InventoryMovement (id, productId, type, quantity, reason)
        VALUES (?, ?, ?, ?, ?)
      `).run(id, productId, finalType, actualQuantity, reason);
      
      db.prepare("UPDATE Product SET stock = ? WHERE id = ?").run(newStock, productId);
    });
    
    performMovement();

    revalidatePath("/admin/inventario");
    revalidatePath("/admin/productos");
    
    const { uploadDbToBlob } = await import("@/lib/db-persistence");
    await uploadDbToBlob();
    
    return { success: true };
  } catch (error: any) {
    console.error("Error en movimiento de inventario:", error);
    return { success: false, error: error.message };
  }
}
