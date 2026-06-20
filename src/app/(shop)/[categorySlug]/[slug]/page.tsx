import { notFound, redirect } from "next/navigation";
import db from "@/lib/db";
import { ProductDetail } from "@/components/shop/ProductDetail";

export const dynamic = "force-dynamic";

type ProductDbRow = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  price: number;
  discount?: number;
  sku?: string;
  imageId?: string;
  categoryId?: string;
  categoryName?: string;
  categorySlug?: string;
  brandId?: string;
  brandName?: string;
  stock?: number;
  isFeatured?: boolean | number;
  isSpecialOrder?: boolean | number;
  flavors?: string;
  specifications?: string;
  createdAt?: string;
};

export default async function ProductDetailPage(props: {
  params: Promise<{ categorySlug?: string; slug?: string }>
}) {
  const params = await props.params;

  console.log('[PRODUCT PAGE] params:', params);

  console.log('[PRODUCT PAGE] requested', { categorySlug: params.categorySlug, slug: params.slug });

  let productData = db.prepare(`
    SELECT p.*, c.name as categoryName, c.slug as categorySlug, b.name as brandName
    FROM Product p
    LEFT JOIN Category c ON p.categoryId = c.id
    LEFT JOIN Brand b ON p.brandId = b.id
    WHERE c.slug = ? COLLATE NOCASE AND p.slug = ? COLLATE NOCASE AND p.status = 'ACTIVE'
  `).get(params.categorySlug, params.slug) as ProductDbRow | undefined;

  // Debug: check whether the product slug exists at all (any status)
  try {
    const slugRow = db.prepare(
      `SELECT slug, status, categoryId, id FROM Product WHERE slug = ? COLLATE NOCASE`
    ).get(params.slug) as { slug: string; status: string; categoryId: string; id: string } | undefined;

    console.log('[PRODUCT PAGE] slugRow(any status):', slugRow);
  } catch (e) {
    console.error('[PRODUCT PAGE] debug slugRow failed', e);
  }


  console.log('[PRODUCT PAGE] matched product:', productData?.slug, productData?.categorySlug, productData?.name);

  if (!productData) {
    console.log('[PRODUCT PAGE] no productData, trying fallback slug query for', params.slug);
    const fallbackProduct = db.prepare(`
      SELECT p.*, c.name as categoryName, c.slug as categorySlug, b.name as brandName
      FROM Product p
      LEFT JOIN Category c ON p.categoryId = c.id
      LEFT JOIN Brand b ON p.brandId = b.id
      WHERE p.slug = ? COLLATE NOCASE AND p.status = 'ACTIVE'
    `).get(params.slug) as ProductDbRow | undefined;

    // Debug: if fallback fails, log what category slugs exist for this product
    if (!fallbackProduct) {
      try {
        const candidateCats = db.prepare(`
          SELECT c.slug as categorySlug, c.name as categoryName
          FROM Product p
          JOIN Category c ON p.categoryId = c.id
          WHERE p.slug = ? COLLATE NOCASE
        `).all(params.slug) as Array<{ categorySlug: string; categoryName: string }>;

        console.log('[PRODUCT PAGE] fallback not found. candidateCats:', candidateCats);
      } catch (e) {
        console.error('[PRODUCT PAGE] debug candidateCats failed', e);
      }
    }


    console.log('[PRODUCT PAGE] fallback product:', fallbackProduct?.slug, fallbackProduct?.categorySlug, fallbackProduct?.name);

    if (fallbackProduct) {
      // Use the product found by slug even if category param mismatches.
      // This avoids returning 404 when the category slug casing or minor mismatch occurs.
      productData = fallbackProduct;
    } else {
      notFound();
    }
  }

  // Related products: same category, brand-first ordering
  const relatedProducts = db.prepare(`
    SELECT p.*, c.name as categoryName, c.slug as categorySlug, b.name as brandName,
      CASE WHEN p.brandId = ? THEN 1 ELSE 0 END as sameBrand
    FROM Product p
    LEFT JOIN Category c ON p.categoryId = c.id
    LEFT JOIN Brand b ON p.brandId = b.id
    WHERE p.id != ? AND p.status = 'ACTIVE' AND p.categoryId = ?
    ORDER BY sameBrand DESC, p.isFeatured DESC, p.createdAt DESC
    LIMIT 6
  `).all(productData.brandId || '', productData.id, productData.categoryId) as ProductDbRow[];

  const productProps = {
    ...productData,
    images: productData.imageId ? [productData.imageId] : [],
    isFeatured: Boolean(productData.isFeatured),
    isSpecialOrder: Boolean(productData.isSpecialOrder),
  };

  const relatedProductsProps = relatedProducts.map((p) => ({
    ...p,
    images: p.imageId ? [p.imageId] : [],
    isFeatured: Boolean(p.isFeatured),
    isSpecialOrder: Boolean(p.isSpecialOrder),
  }));

  return (
    <ProductDetail product={productProps} relatedProducts={relatedProductsProps} />
  );
}

