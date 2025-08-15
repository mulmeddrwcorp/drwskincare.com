import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination params with defaults
    const pageParam = searchParams.get('page') || '1';
    const limitParam = searchParams.get('limit') || '12';

    let page = parseInt(pageParam, 10);
    let limit = parseInt(limitParam, 10);
    if (Number.isNaN(page) || page < 1) page = 1;
    if (Number.isNaN(limit) || limit < 1) limit = 12;

    const skip = (page - 1) * limit;

    // Existing filters
    const search = searchParams.get('search');
  const sortBy = searchParams.get('sortBy') || 'namaProduk';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    // Build where clause for filtering
    const whereClause: any = {};

    // Search functionality - search in product name, description, and BPOM
    if (search) {
      whereClause.OR = [
        { namaProduk: { contains: search, mode: 'insensitive' } },
        { deskripsi: { contains: search, mode: 'insensitive' } },
        { bpom: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Price range filtering (using hargaUmum as base price)
    if (minPrice || maxPrice) {
      whereClause.hargaUmum = {};
      if (minPrice) whereClause.hargaUmum.gte = parseFloat(minPrice);
      if (maxPrice) whereClause.hargaUmum.lte = parseFloat(maxPrice);
    }

    // Validate sort field and map to DB column names if necessary
    const sortFieldMap: Record<string, string> = {
      namaProduk: 'namaProduk',
      nama_produk: 'namaProduk',
      hargaUmum: 'hargaUmum',
      createdAt: 'createdAt',
    };
    const validSortBy = sortFieldMap[sortBy] ?? 'namaProduk';
    const validSortOrder = ['asc', 'desc'].includes(sortOrder) ? sortOrder : 'asc';

    // Use transaction to fetch products (with category) and total count
    const [products, totalProducts] = await prisma.$transaction([
      // Cast prisma to any to safely include `category` even if client types are outdated
      (prisma as any).product.findMany({
        where: whereClause,
        orderBy: { [validSortBy]: validSortOrder },
        skip,
        take: limit,
        include: { category: true },
      }),
      prisma.product.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(totalProducts / limit);

    return NextResponse.json({
      data: products,
      pagination: {
        totalProducts,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
