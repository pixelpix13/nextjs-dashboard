import { lusitana } from '@/app/ui/fonts';
import { getAllCategories } from '@/app/lib/data';
import ProductForm from '@/app/ui/dashboard/product-form';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default async function CreateProductPage() {
  const categories = await getAllCategories();

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
        <h1 className={`${lusitana.className} text-2xl font-bold`}>Add New Product</h1>
        <p className="mt-2 text-sm text-gray-600">Create a new product for your store</p>
      </div>

      <ProductForm categories={categories} />
    </div>
  );
}
