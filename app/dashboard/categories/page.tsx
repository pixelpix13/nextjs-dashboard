import { lusitana } from '@/app/ui/fonts';
import { getAllCategories } from '@/app/lib/data';
import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { 
  idle_timeout: 20,
  max_lifetime: 60 * 30
});

async function getCategoryProductCount(categoryId: string) {
  const result = await sql`
    SELECT COUNT(*) FROM products WHERE category_id = ${categoryId}
  `;
  return Number(result[0].count);
}

export default async function CategoriesPage() {
  const categories = await getAllCategories();

  // Get product counts for each category
  const categoriesWithCounts = await Promise.all(
    categories.map(async (category) => ({
      ...category,
      productCount: await getCategoryProductCount(category.id),
    }))
  );

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Categories</h1>
        <Link
          href="/dashboard/categories/create"
          className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <span className="hidden md:block">Add Category</span>
          <PlusIcon className="h-5 md:ml-4" />
        </Link>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categoriesWithCounts.map((category) => (
          <div
            key={category.id}
            className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {category.name}
              </h3>
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                {category.productCount} products
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              {category.description || 'No description available'}
            </p>
            <div className="mt-4">
              <Link
                href={`/dashboard/products?category=${category.id}`}
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                View products →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
