import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Ambil base URL dari environment
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';

    console.log(`[CRON] Starting daily sync at ${new Date().toISOString()}`);

    // Sinkronisasi data resellers
    const resellersResponse = await fetch(`${baseUrl}/api/sync-data?type=resellers`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CRON_SECRET || 'fallback-secret'}`
      }
    });

    // Sinkronisasi data products
    const productsResponse = await fetch(`${baseUrl}/api/sync-data?type=products`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CRON_SECRET || 'fallback-secret'}`
      }
    });

    const resellersResult = await resellersResponse.json();
    const productsResult = await productsResponse.json();

    console.log('[CRON] Resellers sync result:', resellersResult);
    console.log('[CRON] Products sync result:', productsResult);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      message: 'Daily sync completed successfully',
      results: {
        resellers: resellersResult,
        products: productsResult
      }
    });

  } catch (error) {
    console.error('[CRON] Error during daily sync:', error);
    
    return NextResponse.json({
      success: false,
      timestamp: new Date().toISOString(),
      message: 'Daily sync failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
