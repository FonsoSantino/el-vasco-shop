import { getProduct } from "@/app/actions/products";
import { notFound } from "next/navigation";
import EditForm from "./EditForm";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  
  if (!product) {
    notFound();
  }

  return <EditForm product={product} />;
}
