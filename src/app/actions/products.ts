"use server";

import fs from "fs";
import path from "path";
import db from "@/lib/db";
import { revalidatePath } from "next/cache";
import { parsePrice } from "@/lib/utils";
import { uploadDbToBlob } from "@/lib/db-persistence";

type DbCategory = {
  id: string;
  slug: string;
  name: string;
  filters?: string;
};

type DbBrand = {
  id: string;
  name: string;
};

type DbProduct = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  discount?: number;
  sku?: string;
  stock?: number;
  categoryId: string;
  brandId?: string;
  status: string;
  isFeatured?: number;
  isSpecialOrder?: number;
  flavors?: string;
  imageId?: string;
  categoryName?: string;
  categorySlug?: string;
  brandName?: string;
};

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "") || `producto-${Date.now()}`;
}

function makeUniqueSlug(baseSlug: string) {
  let candidate = baseSlug;
  let index = 1;
  while (db.prepare("SELECT 1 FROM Product WHERE slug = ?").get(candidate)) {
    candidate = `${baseSlug}-${index}`;
    index += 1;
  }
  return candidate;
}

export async function createProduct(formData: FormData) {
  try {
    // Ensure categories are initialized before attempting to create product
    const { initCategories } = await import("./categories");
    await initCategories();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parsePrice(formData.get("price") as string);
    const discount = parsePrice(formData.get("discount") as string) || 0;
    const sku = (formData.get("sku") as string) || `SKU-${Date.now()}`;
    const stock = Number(formData.get("stock")) || 0;
    const categorySlug = formData.get("categoryId") as string;
    const category = db.prepare("SELECT id FROM Category WHERE slug = ?").get(categorySlug) as DbCategory | undefined;
    if (!category) throw new Error("Categoría no encontrada: " + categorySlug);
    const categoryId = category.id;

    const status = formData.get("status") as string || "ACTIVE";
    const brandName = formData.get("brandName") as string; 
    
    const slugBase = normalizeSlug(name);
    const slug = makeUniqueSlug(slugBase);
    const id = `prod-${Date.now()}`;

    // Auto Brand Discovery & Category Filters Sync
    let brandId = null;
    if (brandName && brandName.trim() !== "") {
      const cleanBrandName = brandName.trim();
      const checkBrand = db.prepare("SELECT id FROM Brand WHERE name = ?");
      const existingBrand = checkBrand.get(cleanBrandName) as DbBrand | undefined;
      
      if (existingBrand) {
        brandId = existingBrand.id;
      } else {
        brandId = `brand-${Date.now()}`;
        const brandSlug = cleanBrandName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        db.prepare("INSERT INTO Brand (id, name, slug) VALUES (?, ?, ?)")
          .run(brandId, cleanBrandName, brandSlug);
      }

      // Sync category filters
      if (category) {
        const catData = db.prepare("SELECT filters FROM Category WHERE id = ?").get(categoryId) as DbCategory | undefined;
        const filtersStr = catData?.filters || "";
        const currentFilters = filtersStr.split(',').map((f:string) => f.trim()).filter((f:string) => f !== "");
        
        // Match ignoring case to prevent duplicates like "Ignite" and "IGNITE"
        const alreadyHasBrand = currentFilters.some((f:string) => f.toLowerCase() === cleanBrandName.toLowerCase());
        
        if (!alreadyHasBrand) {
          currentFilters.push(cleanBrandName);
          const newFiltersStr = currentFilters.join(", ");
          db.prepare("UPDATE Category SET filters = ? WHERE id = ?").run(newFiltersStr, categoryId);
        }
      }
    }

    // Image Upload
    let imageId = null;
    const images = formData.getAll("images") as File[];
    if (images && images.length > 0 && images[0].size > 0) {
      const file = images[0];
      const buffer = Buffer.from(await file.arrayBuffer());
      const isProduction = process.env.NODE_ENV === 'production';
      const uploadDir = isProduction
        ? path.join('/tmp', 'uploads')
        : path.join(process.cwd(), 'public/uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const filename = `${id}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "")}`;
      fs.writeFileSync(path.join(uploadDir, filename), buffer);
      imageId = isProduction ? `/api/uploads/${filename}` : `/uploads/${filename}`;
    }

    const isFeatured = formData.get("isFeatured") === "true" ? 1 : 0;
    const isSpecialOrder = formData.get("isSpecialOrder") === "true" ? 1 : 0;

    let finalCategoryId = categoryId;
    if (isSpecialOrder) {
      const specialCategory = db.prepare("SELECT id FROM Category WHERE slug = ?").get("importados-express") as DbCategory | undefined;
      if (!specialCategory) throw new Error("Categoría Importados Express no encontrada");
      finalCategoryId = specialCategory.id;
    }

    const flavors = formData.get("flavors") as string || null;

    db.prepare(`
      INSERT INTO Product (id, name, slug, description, price, discount, sku, stock, categoryId, brandId, status, isFeatured, isSpecialOrder, flavors, imageId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, slug, description, price, discount, sku, stock, finalCategoryId, brandId, status, isFeatured, isSpecialOrder, flavors, imageId);

    revalidatePath("/admin/productos");
    revalidatePath("/perfumeria");
    revalidatePath("/vapes");
    revalidatePath("/electronica");
    revalidatePath("/importados-express");

    // Fire-and-forget — never block the response waiting for Blob upload
    uploadDbToBlob().catch(console.error);
    
    return { success: true, data: { id, name, slug } };
  } catch (error) {
    console.error("Error creating product:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function getProducts(options?: { categorySlug?: string; limit?: number; excludeSpecialOrders?: boolean }) {
  try {
    let query = `
      SELECT p.*, c.name as categoryName, c.slug as categorySlug, b.name as brandName
      FROM Product p
      LEFT JOIN Category c ON p.categoryId = c.id
      LEFT JOIN Brand b ON p.brandId = b.id
      WHERE p.status = 'ACTIVE'
    `;
    const params: unknown[] = [];
    
    if (options?.categorySlug) {
      query += ` AND c.slug = ?`;
      params.push(options.categorySlug);
    }

    if (options?.excludeSpecialOrders) {
      query += ` AND (p.isSpecialOrder = 0 OR p.isSpecialOrder IS NULL)`;
    }

    query += ` ORDER BY p.isFeatured DESC, p.createdAt DESC`;
    
    if (options?.limit) {
      query += ` LIMIT ?`;
      params.push(options.limit);
    }
    
    const products = db.prepare(query).all(...params) as DbProduct[];
    
    // Map to include objects and normalize boolean-like fields so UI doesn't break
    return products.map(p => ({
      ...p,
      isFeatured: p.isFeatured === 1,
      isSpecialOrder: p.isSpecialOrder === 1,
      category: p.categoryName ? { name: p.categoryName, slug: p.categorySlug } : undefined,
      brand: p.brandName ? { name: p.brandName } : undefined,
    }));
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function updateProduct(id: string, formData: FormData) {
  try {
    // Ensure categories are initialized
    const { initCategories } = await import("./categories");
    await initCategories();

    const updates: string[] = [];
    const values: unknown[] = [];
    
    if (formData.has("name")) { updates.push("name = ?"); values.push(formData.get("name")); }
    if (formData.has("description")) { updates.push("description = ?"); values.push(formData.get("description")); }
    if (formData.has("price")) { updates.push("price = ?"); values.push(parsePrice(formData.get("price") as string)); }
    if (formData.has("stock")) { updates.push("stock = ?"); values.push(Number(formData.get("stock"))); }
    if (formData.has("status")) { updates.push("status = ?"); values.push(formData.get("status")); }
    if (formData.has("isFeatured")) { updates.push("isFeatured = ?"); values.push(formData.get("isFeatured") === "true" ? 1 : 0); }
    if (formData.has("isSpecialOrder")) { updates.push("isSpecialOrder = ?"); values.push(formData.get("isSpecialOrder") === "true" ? 1 : 0); }
    if (formData.has("flavors")) { updates.push("flavors = ?"); values.push(formData.get("flavors")); }
    if (formData.has("categoryId")) { updates.push("categoryId = ?"); values.push(formData.get("categoryId")); }
    
    const isSpecialOrder = formData.get("isSpecialOrder") === "true";
    let finalCategoryIdValue = formData.has("categoryId") ? formData.get("categoryId") as string : undefined;

    if (isSpecialOrder) {
      const specialCategory = db.prepare("SELECT id FROM Category WHERE slug = ?").get("importados-express") as DbCategory | undefined;
      if (!specialCategory) throw new Error("Categoría Importados Express no encontrada");
      finalCategoryIdValue = specialCategory.id;
      if (!formData.has("categoryId")) {
        updates.push("categoryId = ?"); values.push(finalCategoryIdValue);
      }
    }

    // Auto Brand Discovery & Category Sync
    const brandName = formData.get("brandName") as string;
    let finalCategoryId = formData.has("categoryId") ? formData.get("categoryId") as string : undefined;
    
    // If we didn't get categoryId from form, we might need to fetch the current one to sync the brand
    if (!finalCategoryId && brandName) {
      const existingProduct = db.prepare("SELECT categoryId FROM Product WHERE id = ?").get(id) as DbProduct | undefined;
      if (existingProduct) finalCategoryId = existingProduct.categoryId;
    }

    if (brandName && brandName.trim() !== "") {
      const cleanBrandName = brandName.trim();
      const brand = db.prepare("SELECT id FROM Brand WHERE name = ?").get(cleanBrandName) as DbBrand | undefined;
      if (!brand) {
        const brandId = `brand-${Date.now()}`;
        const brandSlug = cleanBrandName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        db.prepare("INSERT INTO Brand (id, name, slug) VALUES (?, ?, ?)").run(brandId, cleanBrandName, brandSlug);
        updates.push("brandId = ?"); values.push(brandId);
      } else {
        updates.push("brandId = ?"); values.push(brand.id);
      }

      // Sync category filters
      if (finalCategoryId) {
        const catData = db.prepare("SELECT filters FROM Category WHERE id = ?").get(finalCategoryId) as DbCategory | undefined;
        const filtersStr = catData?.filters || "";
        const currentFilters = filtersStr.split(',').map((f:string) => f.trim()).filter((f:string) => f !== "");
        
        const alreadyHasBrand = currentFilters.some((f:string) => f.toLowerCase() === cleanBrandName.toLowerCase());
        
        if (!alreadyHasBrand) {
          currentFilters.push(cleanBrandName);
          const newFiltersStr = currentFilters.join(", ");
          db.prepare("UPDATE Category SET filters = ? WHERE id = ?").run(newFiltersStr, finalCategoryId);
        }
      }
    }

    // Image Upload
    const images = formData.getAll("images") as File[];
    if (images && images.length > 0 && images[0].size > 0) {
      const file = images[0];
      const buffer = Buffer.from(await file.arrayBuffer());
      const isProduction = process.env.NODE_ENV === 'production';
      const uploadDir = isProduction
        ? path.join('/tmp', 'uploads')
        : path.join(process.cwd(), 'public/uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const filename = `${id}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "")}`;
      fs.writeFileSync(path.join(uploadDir, filename), buffer);
      updates.push("imageId = ?"); values.push(isProduction ? `/api/uploads/${filename}` : `/uploads/${filename}`);

      // Delete old image if exists
      const oldProduct = db.prepare("SELECT imageId FROM Product WHERE id = ?").get(id) as DbProduct | undefined;
      if (oldProduct?.imageId && !oldProduct.imageId.startsWith('http')) {
        const oldFilename = oldProduct.imageId.split('/').pop()!;
        const oldFilePath = isProduction
          ? path.join('/tmp', 'uploads', oldFilename)
          : path.join(process.cwd(), 'public', oldProduct.imageId);
        if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
      }
    }

    if (updates.length > 0) {
      values.push(id);
      db.prepare(`UPDATE Product SET ${updates.join(", ")} WHERE id = ?`).run(...values);
    }
    
    revalidatePath("/admin/productos");
    revalidatePath("/perfumeria");
    revalidatePath("/vapes");
    revalidatePath("/electronica");
    revalidatePath("/importados-express");
    revalidatePath("/");

    // Fire-and-forget — never block the response waiting for Blob upload
    uploadDbToBlob().catch(console.error);
    return { success: true };
  } catch (error) {
    console.error("Error updating product:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function getProduct(id: string) {
  try {
    const product = db.prepare(`
      SELECT p.*, c.name as categoryName, c.slug as categorySlug, b.name as brandName
      FROM Product p
      LEFT JOIN Category c ON p.categoryId = c.id
      LEFT JOIN Brand b ON p.brandId = b.id
      WHERE p.id = ?
    `).get(id) as DbProduct | undefined;
    
    if (!product) return null;

    return {
      ...product,
      isFeatured: product.isFeatured === 1,
      isSpecialOrder: product.isSpecialOrder === 1,
      category: product.categoryName ? { name: product.categoryName, slug: product.categorySlug } : undefined,
      brand: product.brandName ? { name: product.brandName } : undefined,
    };
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

export async function getFeaturedProducts() {
  try {
    const products = db.prepare(`
      SELECT p.*, c.name as categoryName, c.slug as categorySlug, b.name as brandName
      FROM Product p
      LEFT JOIN Category c ON p.categoryId = c.id
      LEFT JOIN Brand b ON p.brandId = b.id
      WHERE p.isFeatured = 1 AND p.status = 'ACTIVE' AND p.isSpecialOrder = 0
      ORDER BY p.createdAt DESC, p.name ASC LIMIT 8
    `).all() as DbProduct[];
    
    return products.map(p => ({
      ...p,
      isFeatured: p.isFeatured === 1,
      isSpecialOrder: p.isSpecialOrder === 1,
      category: p.categoryName ? { name: p.categoryName, slug: p.categorySlug } : undefined,
      brand: p.brandName ? { name: p.brandName } : undefined,
    }));
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
}

export async function deleteProduct(id: string) {
  try {
    const product = db.prepare("SELECT imageId FROM Product WHERE id = ?").get(id) as { imageId?: string } | undefined;
    if (product && product.imageId) {
      const filePath = path.join(process.cwd(), "public", product.imageId);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    db.prepare("DELETE FROM Product WHERE id = ?").run(id);
    
    revalidatePath("/admin/productos");
    revalidatePath("/perfumeria");
    revalidatePath("/vapes");
    revalidatePath("/electronica");
    revalidatePath("/importados-express");
    revalidatePath("/");

    // Fire-and-forget — never block the response waiting for Blob upload
    uploadDbToBlob().catch(console.error);
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}
