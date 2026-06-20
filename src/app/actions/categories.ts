"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";
import { uploadDbToBlob } from "@/lib/db-persistence";

const DEFAULT_CATEGORIES = [
  { id: "cat-1", name: "Vapes", slug: "vapes", description: "Cigarrillos electrónicos y vapes desechables" },
  { id: "cat-2", name: "Perfumería", slug: "perfumeria", description: "Fragancias árabes e importadas" },
  { id: "cat-3", name: "Electrónica", slug: "electronica", description: "Celulares, auriculares y parlantes" },
  { id: "cat-4", name: "Importados Express", slug: "importados-express", description: "Productos por encargo en el día" }
];

export async function initCategories() {
  try {
    const checkStmt = db.prepare("SELECT id FROM Category WHERE slug = ?");
    const insertStmt = db.prepare(`
      INSERT INTO Category (id, name, slug, description, "order")
      VALUES (?, ?, ?, ?, ?)
    `);

    for (let i = 0; i < DEFAULT_CATEGORIES.length; i++) {
      const cat = DEFAULT_CATEGORIES[i];
      const exists = checkStmt.get(cat.slug);
      if (!exists) {
        insertStmt.run(cat.id, cat.name, cat.slug, cat.description, i);
      }
    }
  } catch (error) {
    console.error("Error init categories", error);
  }
}

export async function getCategories() {
  await initCategories();
  try {
    const categories = db.prepare(`
      SELECT 
        c.*, 
        (SELECT COUNT(*) FROM Product p WHERE p.categoryId = c.id) as productsCount 
      FROM Category c 
      ORDER BY c."order" ASC
    `).all() as any[];
    
    // map the structure to match what UI expects: category.products?.length
    return categories.map(c => ({
      ...c,
      products: Array.from({ length: c.productsCount }) // mock array to satisfy length check
    }));
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export async function updateCategory(id: string, formData: FormData) {
  try {
    const updates: string[] = [];
    const values: any[] = [];
    
    if (formData.has("name")) {
      updates.push("name = ?");
      values.push(formData.get("name"));
    }
    if (formData.has("description")) {
      updates.push("description = ?");
      values.push(formData.get("description"));
    }
    if (formData.has("order")) {
      updates.push('"order" = ?');
      values.push(Number(formData.get("order")));
    }
    if (formData.has("filters")) {
      updates.push("filters = ?");
      values.push(formData.get("filters"));
    }
    
    if (updates.length > 0) {
      values.push(id);
      db.prepare(`UPDATE Category SET ${updates.join(", ")} WHERE id = ?`).run(...values);
    }

    revalidatePath("/admin/categorias");
    revalidatePath("/perfumeria");
    revalidatePath("/vapes");
    revalidatePath("/electronica");
    revalidatePath("/importados-express");
    
    await uploadDbToBlob();
    return { success: true };
  } catch (error: any) {
    console.error("Error updating category:", error);
    return { success: false, error: error.message };
  }
}

export async function createCategory(formData: FormData) {
  try {
    const id = "cat-" + Date.now();
    const name = formData.get("name") as string;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const description = formData.get("description") as string;
    const filters = formData.get("filters") as string;
    
    db.prepare(`
      INSERT INTO Category (id, name, slug, description, filters)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, name, slug, description, filters);
    
    revalidatePath("/admin/categorias");
    await uploadDbToBlob();
    return { success: true };
  } catch (error: any) {
    console.error("Error creating category:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteCategory(id: string) {
  try {
    // Check if there are products in this category
    const productsCount = db.prepare("SELECT COUNT(*) as count FROM Product WHERE categoryId = ?").get(id) as any;
    if (productsCount.count > 0) {
      return { success: false, error: "No se puede eliminar la categoría porque contiene productos." };
    }
    
    db.prepare("DELETE FROM Category WHERE id = ?").run(id);
    
    revalidatePath("/admin/categorias");
    await uploadDbToBlob();
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting category:", error);
    return { success: false, error: error.message };
  }
}
