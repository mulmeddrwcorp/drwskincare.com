import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
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
        {
          namaProduk: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          deskripsi: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          bpom: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }

    // Price range filtering (using hargaUmum as base price)
    if (minPrice || maxPrice) {
      whereClause.hargaUmum = {};
      if (minPrice) {
        whereClause.hargaUmum.gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        whereClause.hargaUmum.lte = parseFloat(maxPrice);
      }
    }

    // Validate sort field
    const allowedSortFields = ['namaProduk', 'hargaUmum', 'createdAt'];
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'namaProduk';
    const validSortOrder = ['asc', 'desc'].includes(sortOrder) ? sortOrder : 'asc';

    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy: { [validSortBy]: validSortOrder },
      include: {
        hargaCustom: {
          include: {
            reseller: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: products,
      count: products.length,
      filters: {
        search,
        sortBy: validSortBy,
        sortOrder: validSortOrder,
        minPrice,
        maxPrice
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
