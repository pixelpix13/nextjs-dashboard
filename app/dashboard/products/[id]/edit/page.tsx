import { lusitana } from '@/app/ui/fonts';
import { getAllCategories, getProductById } from '@/app/lib/data';
import ProductForm from '@/app/ui/dashboard/product-form';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { notFound } from 'next/navigation';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [categories, product] = await Promise.all([
    getAllCategories(),
    getProductById(id),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="w-full">
      <Link
        href="/dashboard/products"
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back to Products
      </Link>
      
      <div className="mb-6">
        <h1 className={`${lusitana.className} text-2xl font-bold`}>Edit Product</h1>
        <p className="mt-2 text-sm text-gray-600">Update product information</p>
      </div>

      <ProductForm categories={categories} product={product} />
    </div>
  );
}
