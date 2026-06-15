"use client";

import { useRouter } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import ProductForm from "@/components/inventory/ProductForm";

export default function NewProductPage() {
  const router = useRouter();

  const breadcrumbs = [
    { label: "App", href: "/dashboard" },
    { label: "Inventory", href: "/inventory" },
    { label: "New Product" }
  ];

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6 animate-fade-in">
      <PageHeader
        title="Add New Product"
        breadcrumbs={breadcrumbs}
      />

      <ProductForm 
        onSuccess={(newProduct) => {
          if (newProduct?._id) {
            router.push(`/inventory/${newProduct._id}`);
          } else {
            router.push("/inventory");
          }
        }} 
      />
    </div>
  );
}
