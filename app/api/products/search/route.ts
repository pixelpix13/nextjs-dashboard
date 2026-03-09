import { NextResponse } from 'next/server';
import { getProductsWithFilters } from '@/app/lib/data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('category') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const itemsPerPage = 10;

    const result = await getProductsWithFilters({
      search,
      categoryId,
      page,
      itemsPerPage,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
